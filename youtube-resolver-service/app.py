import asyncio
import hashlib
import hmac
import json
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

import boto3
from boto3.s3.transfer import TransferConfig
from botocore.config import Config
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

APP_NAME = "facial-youtube-resolver"
APP_VERSION = "2.0.0-r2-job-cache"
RESOLVER_SECRET = os.environ.get("RESOLVER_SECRET", "").strip()
BGUTIL_SERVER_HOME = os.environ.get("BGUTIL_SERVER_HOME", "/opt/bgutil-ytdlp-pot-provider/server").strip()
YOUTUBE_COOKIES_FILE = os.environ.get("YOUTUBE_COOKIES_FILE", "/etc/secrets/youtube-cookies.txt").strip()
YOUTUBE_OUTBOUND_PROXY_URL = os.environ.get("YOUTUBE_OUTBOUND_PROXY_URL", "").strip()
YOUTUBE_USER_AGENT = os.environ.get("YOUTUBE_USER_AGENT", "").strip()
YTDLP_TIMEOUT_SECONDS = max(60, int(os.environ.get("YTDLP_TIMEOUT_SECONDS", "300")))
MAX_HEIGHT = max(240, min(1080, int(os.environ.get("YOUTUBE_MAX_HEIGHT", "720"))))

R2_ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID", "").strip()
R2_ACCESS_KEY_ID = os.environ.get("R2_ACCESS_KEY_ID", "").strip()
R2_SECRET_ACCESS_KEY = os.environ.get("R2_SECRET_ACCESS_KEY", "").strip()
R2_BUCKET = os.environ.get("R2_BUCKET", "facial-video-cache").strip()
R2_ENDPOINT = os.environ.get("R2_ENDPOINT", "").strip() or (f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com" if R2_ACCOUNT_ID else "")
R2_PREFIX = os.environ.get("R2_PREFIX", "facial-youtube-cache/v2").strip().strip("/")

app = FastAPI(title=APP_NAME, version=APP_VERSION)
_jobs: dict[str, dict[str, Any]] = {}
_tasks: dict[str, asyncio.Task] = {}
_jobs_lock = asyncio.Lock()

class JobBody(BaseModel):
    url: str


def _authorized(secret: str | None, authorization: str | None) -> bool:
    if not RESOLVER_SECRET:
        return False
    supplied = (secret or "").strip()
    if not supplied and authorization:
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() == "bearer":
            supplied = token.strip()
    return bool(supplied) and hmac.compare_digest(supplied, RESOLVER_SECRET)


def _require_auth(secret: str | None, authorization: str | None) -> None:
    if not RESOLVER_SECRET:
        raise HTTPException(503, "RESOLVER_SECRET is not configured.")
    if not _authorized(secret, authorization):
        raise HTTPException(401, "Unauthorized resolver request.")


def _youtube_video_id(raw: str) -> str:
    try:
        parsed = urlparse((raw or "").strip())
    except Exception as exc:
        raise HTTPException(400, "Invalid YouTube URL.") from exc
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise HTTPException(400, "A normal http/https YouTube URL is required.")
    host = parsed.hostname.lower().rstrip(".")
    candidate = ""
    if host == "youtu.be" or host.endswith(".youtu.be"):
        candidate = parsed.path.strip("/").split("/")[0]
    elif host == "youtube.com" or host.endswith(".youtube.com") or host == "youtube-nocookie.com" or host.endswith(".youtube-nocookie.com"):
        candidate = (parse_qs(parsed.query).get("v") or [""])[0]
        if not candidate:
            parts = [p for p in parsed.path.split("/") if p]
            if len(parts) >= 2 and parts[0].lower() in {"shorts", "embed", "live", "v"}:
                candidate = parts[1]
    if len(candidate) != 11 or any(c not in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_" for c in candidate):
        raise HTTPException(400, "Only a single YouTube watch/shorts/youtu.be video URL is supported.")
    return candidate


def _cookies_available() -> bool:
    try:
        return bool(YOUTUBE_COOKIES_FILE) and os.path.isfile(YOUTUBE_COOKIES_FILE) and os.path.getsize(YOUTUBE_COOKIES_FILE) > 0
    except OSError:
        return False


def _r2_configured() -> bool:
    return bool(R2_ENDPOINT and R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY and R2_BUCKET)


def _r2_client():
    if not _r2_configured():
        raise RuntimeError("R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET.")
    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name="auto",
        config=Config(signature_version="s3v4", retries={"max_attempts": 4, "mode": "standard"}),
    )


def _object_key(video_id: str) -> str:
    return f"{R2_PREFIX}/{video_id}.mp4"


def _head_object(video_id: str) -> dict[str, Any] | None:
    client = _r2_client()
    try:
        return client.head_object(Bucket=R2_BUCKET, Key=_object_key(video_id))
    except client.exceptions.ClientError as exc:
        status = int(exc.response.get("ResponseMetadata", {}).get("HTTPStatusCode", 0) or 0)
        code = str(exc.response.get("Error", {}).get("Code", ""))
        if status == 404 or code in {"404", "NoSuchKey", "NotFound"}:
            return None
        raise


def _base_ytdlp_command(url: str, workdir: str, player_client: str) -> list[str]:
    # Video-only H.264 MP4 is ideal here: MediaPipe does not need audio, and
    # avoiding A/V merging makes the job faster and smaller.
    fmt = (
        f"bestvideo[ext=mp4][vcodec^=avc1][height<={MAX_HEIGHT}]/"
        f"best[ext=mp4][vcodec^=avc1][height<={MAX_HEIGHT}]/"
        f"bestvideo[ext=mp4][height<={MAX_HEIGHT}]/best[ext=mp4][height<={MAX_HEIGHT}]"
    )
    cmd = [
        "yt-dlp",
        "--no-playlist",
        "--no-progress",
        "--newline",
        "--socket-timeout", "30",
        "--retries", "3",
        "--fragment-retries", "3",
        "--concurrent-fragments", "4",
        "--js-runtimes", "node",
        "--extractor-args", f"youtube:player_client={player_client}",
        "--extractor-args", "youtubepot-bgutilhttp:base_url=http://127.0.0.1:4416",
        "-f", fmt,
        "--remux-video", "mp4",
        "--print", "after_move:filepath",
        "-o", str(Path(workdir) / "source.%(ext)s"),
    ]
    if _cookies_available():
        cmd.extend(["--cookies", YOUTUBE_COOKIES_FILE])
    if YOUTUBE_OUTBOUND_PROXY_URL:
        cmd.extend(["--proxy", YOUTUBE_OUTBOUND_PROXY_URL])
    if YOUTUBE_USER_AGENT:
        cmd.extend(["--user-agent", YOUTUBE_USER_AGENT])
    cmd.append(url)
    return cmd


def _download_video(url: str, workdir: str) -> Path:
    errors: list[str] = []
    # mweb works best with PO-token support; the others are fallbacks for
    # videos/client combinations where mweb is unavailable.
    strategies = [("mweb+bgutil", "mweb"), ("web_embedded", "web_embedded"), ("android_vr", "android_vr")]
    for name, client in strategies:
        cmd = _base_ytdlp_command(url, workdir, client)
        try:
            proc = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=YTDLP_TIMEOUT_SECONDS,
                check=False,
                env={**os.environ, "NO_COLOR": "1"},
            )
        except subprocess.TimeoutExpired:
            errors.append(f"{name}: timed out after {YTDLP_TIMEOUT_SECONDS}s")
            continue
        if proc.returncode == 0:
            lines = [x.strip() for x in proc.stdout.splitlines() if x.strip()]
            candidate = Path(lines[-1]) if lines else Path(workdir) / "source.mp4"
            if candidate.exists():
                return candidate
            files = sorted(Path(workdir).glob("source.*"), key=lambda p: p.stat().st_mtime, reverse=True)
            if files:
                return files[0]
        detail = " ".join((proc.stderr or proc.stdout or "yt-dlp failed").split())[-2200:]
        print(f"[youtube-job] {name}: {detail}", flush=True)
        errors.append(f"{name}: {detail}")
    raise RuntimeError(" | ".join(errors[-3:]))


def _faststart(source: Path, workdir: str) -> Path:
    if source.suffix.lower() != ".mp4":
        return source
    target = Path(workdir) / "browser-ready.mp4"
    proc = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(source), "-map", "0:v:0", "-c", "copy", "-movflags", "+faststart", str(target)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        timeout=120,
        check=False,
    )
    if proc.returncode == 0 and target.exists() and target.stat().st_size > 0:
        return target
    print(f"[youtube-job] ffmpeg faststart skipped: {(proc.stderr or '').strip()[-800:]}", flush=True)
    return source


def _upload_to_r2(path: Path, video_id: str) -> dict[str, Any]:
    client = _r2_client()
    size = path.stat().st_size
    transfer = TransferConfig(multipart_threshold=8 * 1024 * 1024, multipart_chunksize=8 * 1024 * 1024, max_concurrency=4)
    client.upload_file(
        str(path), R2_BUCKET, _object_key(video_id),
        ExtraArgs={
            "ContentType": "video/mp4",
            "CacheControl": "private, max-age=3600",
            "Metadata": {"youtube-id": video_id, "created-at": str(int(time.time())), "resolver-version": APP_VERSION},
        },
        Config=transfer,
    )
    return {"size": size, "key": _object_key(video_id)}


def _process_job_sync(url: str, video_id: str) -> dict[str, Any]:
    # Another instance/job may have completed while this request was queued.
    existing = _head_object(video_id)
    if existing:
        return {"size": int(existing.get("ContentLength") or 0), "key": _object_key(video_id), "cacheHit": True}
    with tempfile.TemporaryDirectory(prefix=f"yt-{video_id}-") as workdir:
        source = _download_video(url, workdir)
        source = _faststart(source, workdir)
        result = _upload_to_r2(source, video_id)
        result["cacheHit"] = False
        return result


async def _run_job(job_id: str, url: str, video_id: str) -> None:
    async with _jobs_lock:
        _jobs[job_id].update(status="processing", message="Downloading YouTube video…", startedAt=time.time(), progress=10)
    try:
        result = await asyncio.to_thread(_process_job_sync, url, video_id)
        async with _jobs_lock:
            _jobs[job_id].update(
                status="ready", message="Video is ready.", progress=100,
                size=result.get("size"), objectKey=result.get("key"), cacheHit=result.get("cacheHit", False),
                completedAt=time.time(), error=None,
            )
    except Exception as exc:
        message = str(exc)
        print(f"[youtube-job] {video_id} failed: {message}", flush=True)
        async with _jobs_lock:
            _jobs[job_id].update(status="failed", message="YouTube processing failed.", progress=0, error=message[-3000:], completedAt=time.time())
    finally:
        async with _jobs_lock:
            _tasks.pop(job_id, None)


async def _ensure_job(url: str) -> dict[str, Any]:
    video_id = _youtube_video_id(url)
    job_id = f"yt-{video_id}"
    try:
        existing = await asyncio.to_thread(_head_object, video_id)
    except Exception as exc:
        raise HTTPException(503, f"R2 check failed: {exc}") from exc
    if existing:
        return {
            "ok": True, "jobId": job_id, "videoId": video_id, "status": "ready", "progress": 100,
            "message": "Video is already cached.", "size": int(existing.get("ContentLength") or 0),
            "objectKey": _object_key(video_id), "cacheHit": True,
        }

    async with _jobs_lock:
        current = _jobs.get(job_id)
        if current and current.get("status") in {"queued", "processing", "failed"}:
            return dict(current)
        state = {
            "ok": True, "jobId": job_id, "videoId": video_id, "status": "queued", "progress": 0,
            "message": "YouTube video queued for processing.", "createdAt": time.time(), "error": None,
        }
        _jobs[job_id] = state
        task = asyncio.create_task(_run_job(job_id, url, video_id))
        _tasks[job_id] = task
        return dict(state)


def _route_manifest() -> list[str]:
    return ["GET /", "GET /health", "POST /jobs", "GET /jobs/{job_id}"]


@app.get("/")
async def root() -> dict[str, Any]:
    return {"ok": True, "service": APP_NAME, "version": APP_VERSION, "routes": _route_manifest()}


@app.get("/health")
async def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": APP_NAME,
        "version": APP_VERSION,
        "secretConfigured": bool(RESOLVER_SECRET),
        "r2Configured": _r2_configured(),
        "r2Bucket": R2_BUCKET if _r2_configured() else None,
        "cookiesConfigured": _cookies_available(),
        "outboundProxyConfigured": bool(YOUTUBE_OUTBOUND_PROXY_URL),
        "bgutilMode": "http-loopback",
        "maxHeight": MAX_HEIGHT,
        "routes": _route_manifest(),
    }


@app.post("/jobs")
async def create_job(
    body: JobBody,
    x_resolver_secret: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
):
    _require_auth(x_resolver_secret, authorization)
    return await _ensure_job(body.url)


@app.get("/jobs/{job_id}")
async def job_status(
    job_id: str,
    x_resolver_secret: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
):
    _require_auth(x_resolver_secret, authorization)
    if not job_id.startswith("yt-"):
        raise HTTPException(400, "Invalid job ID.")
    video_id = job_id[3:]
    if len(video_id) != 11:
        raise HTTPException(400, "Invalid job ID.")
    existing = await asyncio.to_thread(_head_object, video_id)
    if existing:
        return {
            "ok": True, "jobId": job_id, "videoId": video_id, "status": "ready", "progress": 100,
            "message": "Video is ready.", "size": int(existing.get("ContentLength") or 0), "objectKey": _object_key(video_id),
        }
    async with _jobs_lock:
        state = _jobs.get(job_id)
        if state:
            return dict(state)
    return {"ok": True, "jobId": job_id, "videoId": video_id, "status": "missing", "progress": 0, "message": "Job not found. Submit the URL again."}
