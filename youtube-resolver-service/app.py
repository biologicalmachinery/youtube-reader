import asyncio
import hmac
import json
import os
import re
import subprocess
import time
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlparse

import httpx
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse, Response
from pydantic import BaseModel

APP_NAME = "facial-youtube-resolver"
RESOLVER_SECRET = os.environ.get("RESOLVER_SECRET", "").strip()
BGUTIL_SERVER_HOME = os.environ.get(
    "BGUTIL_SERVER_HOME", "/opt/bgutil-ytdlp-pot-provider/server"
).strip()
CACHE_TTL_SECONDS = max(30, int(os.environ.get("RESOLVE_CACHE_TTL_SECONDS", "180")))
YTDLP_TIMEOUT_SECONDS = max(10, int(os.environ.get("YTDLP_TIMEOUT_SECONDS", "45")))
UPSTREAM_CONNECT_TIMEOUT = max(5.0, float(os.environ.get("UPSTREAM_CONNECT_TIMEOUT", "15")))

# Prefer a single, browser-friendly progressive MP4. If YouTube exposes only
# adaptive video, fall back to an H.264 MP4 video-only stream; facial analysis
# does not require an audio track.
YTDLP_FORMAT = os.environ.get(
    "YTDLP_FORMAT",
    "best[protocol=https][ext=mp4][vcodec^=avc1][height<=720]/"
    "best[protocol=https][ext=mp4][height<=720]/"
    "bestvideo[protocol=https][ext=mp4][vcodec^=avc1][height<=720]/"
    "bestvideo[protocol=https][ext=mp4][height<=720]/"
    "bestvideo[protocol=https][height<=720]/best[protocol=https][height<=720]",
)

YOUTUBE_HOST_RE = re.compile(r"(^|\.)(youtube\.com|youtube-nocookie\.com)$", re.I)
YOUTU_BE_RE = re.compile(r"(^|\.)youtu\.be$", re.I)
VIDEO_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")

APP_VERSION = "1.1.0-route-fix"
app = FastAPI(title=APP_NAME, version=APP_VERSION)
_http = httpx.AsyncClient(
    follow_redirects=True,
    timeout=httpx.Timeout(connect=UPSTREAM_CONNECT_TIMEOUT, read=None, write=20.0, pool=20.0),
    limits=httpx.Limits(max_connections=40, max_keepalive_connections=12),
)


@dataclass
class ResolvedMedia:
    source_url: str
    video_id: str
    media_url: str
    format_id: str
    ext: str
    protocol: str
    mime_type: str
    title: str
    duration: float | None
    filesize: int | None
    width: int | None
    height: int | None
    http_headers: dict[str, str]
    expires_at: float


_cache: dict[str, ResolvedMedia] = {}
_cache_lock = asyncio.Lock()
_resolve_locks: dict[str, asyncio.Lock] = {}


class ResolveBody(BaseModel):
    url: str
    refresh: bool = False


def _authorized(secret: str | None, authorization: str | None) -> bool:
    if not RESOLVER_SECRET:
        # Refuse to become a public/open video proxy if the deployment forgot
        # to configure a secret.
        return False
    supplied = (secret or "").strip()
    if not supplied and authorization:
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() == "bearer":
            supplied = token.strip()
    return bool(supplied) and hmac.compare_digest(supplied, RESOLVER_SECRET)


def _require_auth(secret: str | None, authorization: str | None) -> None:
    if not RESOLVER_SECRET:
        raise HTTPException(503, "Resolver is not configured: RESOLVER_SECRET is missing.")
    if not _authorized(secret, authorization):
        raise HTTPException(401, "Unauthorized resolver request.")


def _youtube_video_id(raw: str) -> str:
    raw = (raw or "").strip()
    if not raw or len(raw) > 4096:
        raise HTTPException(400, "Missing or invalid YouTube URL.")
    try:
        parsed = urlparse(raw)
    except Exception as exc:
        raise HTTPException(400, "Invalid YouTube URL.") from exc
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise HTTPException(400, "A normal http/https YouTube URL is required.")
    host = parsed.hostname.lower().rstrip(".")
    candidate = ""
    if YOUTU_BE_RE.search(host):
        candidate = parsed.path.strip("/").split("/")[0]
    elif YOUTUBE_HOST_RE.search(host):
        from urllib.parse import parse_qs
        query = parse_qs(parsed.query)
        candidate = (query.get("v") or [""])[0]
        if not candidate:
            parts = [p for p in parsed.path.split("/") if p]
            if len(parts) >= 2 and parts[0].lower() in {"shorts", "embed", "live", "v"}:
                candidate = parts[1]
    if not VIDEO_ID_RE.fullmatch(candidate or ""):
        raise HTTPException(400, "Only a single YouTube watch/shorts/youtu.be video URL is supported.")
    return candidate


def _clean_header_dict(value: Any) -> dict[str, str]:
    if not isinstance(value, dict):
        return {}
    out: dict[str, str] = {}
    for key, val in value.items():
        if val is None:
            continue
        name = str(key).strip()
        if not name:
            continue
        lower = name.lower()
        # Host/content/range are controlled by the proxy request itself.
        if lower in {"host", "content-length", "content-range", "range", "accept-encoding", "connection"}:
            continue
        out[name] = str(val)
    return out


def _guess_mime(info: dict[str, Any]) -> str:
    ext = str(info.get("ext") or "").lower()
    vcodec = str(info.get("vcodec") or "").lower()
    acodec = str(info.get("acodec") or "").lower()
    if ext == "mp4":
        # The browser does its own codec inspection; keep the HTTP type simple.
        return "video/mp4"
    if ext == "webm":
        return "video/webm"
    if vcodec and vcodec != "none":
        return "video/mp4"
    if acodec and acodec != "none":
        return "audio/mp4"
    return "application/octet-stream"


def _yt_dlp_command(url: str) -> list[str]:
    return [
        "yt-dlp",
        "--dump-single-json",
        "--skip-download",
        "--no-playlist",
        "--no-warnings",
        "--no-progress",
        "--socket-timeout", "20",
        "--retries", "2",
        "--fragment-retries", "2",
        "--no-js-runtimes",
        "--js-runtimes", "node",
        "--extractor-args", "youtube:player_client=mweb",
        "--extractor-args", f"youtubepot-bgutilscript:server_home={BGUTIL_SERVER_HOME}",
        "-f", YTDLP_FORMAT,
        url,
    ]


def _resolve_sync(url: str, video_id: str) -> ResolvedMedia:
    cmd = _yt_dlp_command(url)
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
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError(f"yt-dlp timed out after {YTDLP_TIMEOUT_SECONDS}s") from exc

    if proc.returncode != 0:
        detail = (proc.stderr or proc.stdout or "yt-dlp failed").strip()
        detail = " ".join(detail.split())[-1800:]
        raise RuntimeError(detail)

    try:
        info = json.loads(proc.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError("yt-dlp returned invalid JSON.") from exc

    if info.get("_type") == "playlist":
        raise RuntimeError("Playlists are not supported by this resolver.")
    if info.get("is_live"):
        raise RuntimeError("Live streams are not supported by the facial-analysis resolver yet.")

    media_url = str(info.get("url") or "").strip()
    if not media_url.startswith(("https://", "http://")):
        raise RuntimeError("yt-dlp did not return a direct HTTP media stream.")

    # A short cache reduces repeated extraction while keeping signed URLs fresh.
    return ResolvedMedia(
        source_url=url,
        video_id=video_id,
        media_url=media_url,
        format_id=str(info.get("format_id") or ""),
        ext=str(info.get("ext") or ""),
        protocol=str(info.get("protocol") or ""),
        mime_type=_guess_mime(info),
        title=str(info.get("title") or "")[:500],
        duration=float(info["duration"]) if info.get("duration") is not None else None,
        filesize=(int(info.get("filesize") or info.get("filesize_approx"))
                  if (info.get("filesize") or info.get("filesize_approx")) else None),
        width=int(info["width"]) if info.get("width") else None,
        height=int(info["height"]) if info.get("height") else None,
        http_headers=_clean_header_dict(info.get("http_headers")),
        expires_at=time.monotonic() + CACHE_TTL_SECONDS,
    )


async def _resolve(url: str, *, refresh: bool = False) -> tuple[ResolvedMedia, bool]:
    video_id = _youtube_video_id(url)
    now = time.monotonic()
    if not refresh:
        async with _cache_lock:
            cached = _cache.get(video_id)
            if cached and cached.expires_at > now:
                return cached, True

    async with _cache_lock:
        lock = _resolve_locks.setdefault(video_id, asyncio.Lock())

    async with lock:
        now = time.monotonic()
        if not refresh:
            async with _cache_lock:
                cached = _cache.get(video_id)
                if cached and cached.expires_at > now:
                    return cached, True
        resolved = await asyncio.to_thread(_resolve_sync, url, video_id)
        async with _cache_lock:
            _cache[video_id] = resolved
        return resolved, False


async def _invalidate(video_id: str) -> None:
    async with _cache_lock:
        _cache.pop(video_id, None)


def _response_headers(upstream: httpx.Response, resolved: ResolvedMedia, cache_hit: bool) -> dict[str, str]:
    out: dict[str, str] = {}
    for name in [
        "content-type", "content-length", "content-range", "accept-ranges",
        "etag", "last-modified", "content-disposition",
    ]:
        value = upstream.headers.get(name)
        if value:
            out[name.title()] = value
    if "Content-Type" not in out:
        out["Content-Type"] = resolved.mime_type
    out["Cache-Control"] = "no-store"
    out["Accept-Ranges"] = out.get("Accept-Ranges", "bytes")
    out["X-Resolver-Provider"] = "yt-dlp-bgutil"
    out["X-Resolver-Version"] = APP_VERSION
    out["X-Resolver-Video-Id"] = resolved.video_id
    out["X-Resolver-Format-Id"] = resolved.format_id or "unknown"
    out["X-Resolver-Cache"] = "HIT" if cache_hit else "MISS"
    return out


async def _open_upstream(resolved: ResolvedMedia, request: Request, *, probe: bool = False) -> httpx.Response:
    headers = dict(resolved.http_headers)
    headers.setdefault("Accept", request.headers.get("accept") or "video/*,*/*;q=0.8")
    headers["Accept-Encoding"] = "identity"
    range_value = "bytes=0-0" if probe else request.headers.get("range")
    if range_value:
        headers["Range"] = range_value
    if_range = request.headers.get("if-range")
    if if_range and not probe:
        headers["If-Range"] = if_range

    method = "GET"  # HEAD is not consistently useful on googlevideo; stream no body below if caller used HEAD.
    req = _http.build_request(method, resolved.media_url, headers=headers)
    return await _http.send(req, stream=True)


def _route_manifest() -> list[str]:
    return ["GET /", "GET /health", "POST /resolve", "GET /resolve", "GET|HEAD /stream"]


@app.get("/")
async def root() -> dict[str, Any]:
    # A tiny public diagnostic endpoint. It deliberately exposes no secrets.
    return {
        "ok": True,
        "service": APP_NAME,
        "version": APP_VERSION,
        "routes": _route_manifest(),
    }


@app.get("/health")
async def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": APP_NAME,
        "version": APP_VERSION,
        "secretConfigured": bool(RESOLVER_SECRET),
        "bgutilServerHome": BGUTIL_SERVER_HOME,
        "cacheTtlSeconds": CACHE_TTL_SECONDS,
        "routes": _route_manifest(),
    }


@app.get("/resolve")
async def resolve_endpoint_get(
    url: str,
    refresh: int = 0,
    x_resolver_secret: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
):
    # GET support is intentional: it makes deployment diagnostics easy while
    # the Cloudflare Worker continues to use the POST endpoint below.
    _require_auth(x_resolver_secret, authorization)
    try:
        resolved, cache_hit = await _resolve(url, refresh=bool(refresh))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(502, f"YouTube resolution failed: {exc}") from exc
    return {
        "ok": True,
        "provider": "youtube",
        "resolver": "yt-dlp-bgutil",
        "version": APP_VERSION,
        "videoId": resolved.video_id,
        "title": resolved.title,
        "duration": resolved.duration,
        "formatId": resolved.format_id,
        "ext": resolved.ext,
        "protocol": resolved.protocol,
        "mimeType": resolved.mime_type,
        "filesize": resolved.filesize,
        "width": resolved.width,
        "height": resolved.height,
        "cache": "HIT" if cache_hit else "MISS",
        "streamPath": "/stream",
    }


@app.post("/resolve")
async def resolve_endpoint(
    body: ResolveBody,
    x_resolver_secret: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
):
    _require_auth(x_resolver_secret, authorization)
    try:
        resolved, cache_hit = await _resolve(body.url, refresh=body.refresh)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(502, f"YouTube resolution failed: {exc}") from exc
    return {
        "ok": True,
        "provider": "youtube",
        "resolver": "yt-dlp-bgutil",
        "version": APP_VERSION,
        "videoId": resolved.video_id,
        "title": resolved.title,
        "duration": resolved.duration,
        "formatId": resolved.format_id,
        "ext": resolved.ext,
        "protocol": resolved.protocol,
        "mimeType": resolved.mime_type,
        "filesize": resolved.filesize,
        "width": resolved.width,
        "height": resolved.height,
        "cache": "HIT" if cache_hit else "MISS",
        # Do not return the signed googlevideo URL. Streaming should stay inside
        # this resolver so token/session/IP context remains consistent.
        "streamPath": "/stream",
    }


@app.api_route("/stream", methods=["GET", "HEAD"])
async def stream_endpoint(
    request: Request,
    url: str,
    probe: int = 0,
    x_resolver_secret: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
):
    _require_auth(x_resolver_secret, authorization)
    is_probe = bool(probe)

    try:
        resolved, cache_hit = await _resolve(url)
    except HTTPException:
        raise
    except Exception as exc:
        return JSONResponse({"ok": False, "error": f"YouTube resolution failed: {exc}"}, status_code=502)

    upstream: httpx.Response | None = None
    try:
        upstream = await _open_upstream(resolved, request, probe=is_probe)
        # A signed URL can expire or get invalidated. Refresh it once inside the
        # SAME resolver request, then retry the GoogleVideo connection.
        if upstream.status_code in {403, 410, 429, 500, 502, 503, 504}:
            await upstream.aclose()
            await _invalidate(resolved.video_id)
            resolved, cache_hit = await _resolve(url, refresh=True)
            upstream = await _open_upstream(resolved, request, probe=is_probe)

        if upstream.status_code >= 400 and upstream.status_code != 416:
            status = upstream.status_code
            body = (await upstream.aread())[:1200]
            await upstream.aclose()
            detail = body.decode("utf-8", "replace").strip()
            return JSONResponse({
                "ok": False,
                "error": f"GoogleVideo returned HTTP {status}.",
                "detail": detail,
                "videoId": resolved.video_id,
            }, status_code=502 if status >= 500 else status)

        headers = _response_headers(upstream, resolved, cache_hit)
        status_code = upstream.status_code
        if request.method == "HEAD":
            await upstream.aclose()
            return Response(status_code=status_code, headers=headers)

        async def body_iter():
            try:
                async for chunk in upstream.aiter_raw():
                    if chunk:
                        yield chunk
            finally:
                await upstream.aclose()

        return StreamingResponse(body_iter(), status_code=status_code, headers=headers)
    except httpx.TimeoutException as exc:
        if upstream is not None:
            await upstream.aclose()
        return JSONResponse({"ok": False, "error": "Timed out while opening the YouTube media stream."}, status_code=504)
    except Exception as exc:
        if upstream is not None:
            await upstream.aclose()
        return JSONResponse({"ok": False, "error": f"Resolver stream failed: {exc}"}, status_code=502)


@app.on_event("shutdown")
async def shutdown_event() -> None:
    await _http.aclose()
