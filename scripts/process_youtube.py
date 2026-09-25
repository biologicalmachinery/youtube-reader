#!/usr/bin/env python3
"""Download one public YouTube video, normalize it, and cache it in Cloudflare R2.

Designed for GitHub Actions. It supports:
- current yt-dlp + EJS JavaScript challenge solving
- bgutil PO-token provider (started by the workflow)
- one proxy or a small proxy pool
- one optional server-side YouTube cookies.txt session
- multiple YouTube client strategies

The website user only supplies a YouTube URL. All anti-bot/session configuration is
server-side in GitHub repository secrets.
"""
import base64
import glob
import json
import os
import pathlib
import re
import subprocess
import sys
import time
from urllib.parse import urlsplit

import boto3
from botocore.config import Config

YOUTUBE_URL = os.environ["INPUT_YOUTUBE_URL"].strip()
VIDEO_ID = os.environ["INPUT_VIDEO_ID"].strip()
OBJECT_KEY = os.environ["INPUT_OBJECT_KEY"].strip()
MARKER_KEY = os.environ["INPUT_MARKER_KEY"].strip()
ERROR_KEY = os.environ["INPUT_ERROR_KEY"].strip()
JOB_MODE = os.environ.get("INPUT_JOB_MODE", "video").strip().lower() or "video"
METADATA_KEY = os.environ.get("INPUT_METADATA_KEY", "").strip()
try:
    SEGMENT_START_SECONDS = max(0.0, float(os.environ.get("INPUT_SEGMENT_START_SECONDS", "0") or 0))
    SEGMENT_DURATION_SECONDS = max(0.0, float(os.environ.get("INPUT_SEGMENT_DURATION_SECONDS", "0") or 0))
except ValueError as exc:
    raise SystemExit(f"Invalid segment timing: {exc}")
if JOB_MODE not in {"video", "metadata"}:
    raise SystemExit("INPUT_JOB_MODE must be video or metadata")
if SEGMENT_DURATION_SECONDS > 600.001:
    raise SystemExit("Selected video segment cannot exceed 600 seconds")
if JOB_MODE == "metadata" and not METADATA_KEY:
    raise SystemExit("INPUT_METADATA_KEY is required in metadata mode")

R2_ACCOUNT_ID = os.environ["R2_ACCOUNT_ID"].strip()
R2_ACCESS_KEY_ID = os.environ["R2_ACCESS_KEY_ID"].strip()
R2_SECRET_ACCESS_KEY = os.environ["R2_SECRET_ACCESS_KEY"].strip()
R2_BUCKET = os.environ["R2_BUCKET"].strip()
YOUTUBE_PROXY_URL = os.environ.get("YOUTUBE_PROXY_URL", "").strip()
YOUTUBE_PROXY_URLS = os.environ.get("YOUTUBE_PROXY_URLS", "").strip()
YOUTUBE_COOKIES_B64 = os.environ.get("YOUTUBE_COOKIES_B64", "").strip()

if not re.fullmatch(r"[A-Za-z0-9_-]{11}", VIDEO_ID):
    raise SystemExit("Invalid YouTube video ID")

s3 = boto3.client(
    "s3",
    endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    region_name="auto",
    config=Config(signature_version="s3v4", retries={"max_attempts": 5, "mode": "standard"}),
)


def put_json(key: str, payload: dict):
    s3.put_object(
        Bucket=R2_BUCKET,
        Key=key,
        Body=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        ContentType="application/json; charset=utf-8",
        CacheControl="no-store",
    )


def delete_key(key: str):
    try:
        s3.delete_object(Bucket=R2_BUCKET, Key=key)
    except Exception as exc:
        print(f"[r2] warning: could not delete {key}: {exc}", flush=True)


def split_proxy_values(raw: str):
    if not raw:
        return []
    return [x.strip() for x in re.split(r"[\r\n,;]+", raw) if x.strip()]


def validate_proxy(value: str):
    try:
        parsed = urlsplit(value)
    except Exception:
        return ""
    if parsed.scheme.lower() not in {"http", "https", "socks4", "socks4a", "socks5", "socks5h"}:
        return ""
    if not parsed.hostname:
        return ""
    try:
        port = parsed.port
    except ValueError:
        return ""
    if not port or not (1 <= port <= 65535):
        return ""
    return value


# YOUTUBE_PROXY_URLS is preferred for a pool; singular YOUTUBE_PROXY_URL remains
# backwards-compatible. Dedupe while preserving order.
_proxy_raw = split_proxy_values(YOUTUBE_PROXY_URLS) + split_proxy_values(YOUTUBE_PROXY_URL)
PROXIES = []
for candidate in _proxy_raw:
    valid = validate_proxy(candidate)
    if valid and valid not in PROXIES:
        PROXIES.append(valid)
    elif candidate and not valid:
        print("[proxy] ignored an invalid proxy URL (scheme/host/numeric port required)", flush=True)


def redact(text: str) -> str:
    value = str(text or "")
    for proxy in PROXIES:
        value = value.replace(proxy, "<YOUTUBE_PROXY_URL>")
        try:
            parsed = urlsplit(proxy)
            if parsed.username:
                value = value.replace(parsed.username, "<proxy-user>")
            if parsed.password:
                value = value.replace(parsed.password, "<proxy-password>")
        except Exception:
            pass
    return value[-14000:]


cookie_file = ""
if YOUTUBE_COOKIES_B64:
    cookie_file = "/tmp/youtube-cookies.txt"
    try:
        decoded = base64.b64decode(YOUTUBE_COOKIES_B64, validate=True)
        text_head = decoded[:100].decode("utf-8", "ignore")
        if "Netscape HTTP Cookie File" not in text_head and "HTTP Cookie File" not in text_head:
            raise ValueError("cookie file is not Netscape/Mozilla format")
        pathlib.Path(cookie_file).write_bytes(decoded.replace(b"\r\n", b"\n"))
        os.chmod(cookie_file, 0o600)
        print("[youtube] optional dedicated cookie session configured", flush=True)
    except Exception as exc:
        print(f"[youtube] warning: YOUTUBE_COOKIES_B64 is invalid: {exc}", flush=True)
        cookie_file = ""


# 720p is sufficient for facial analysis and keeps proxy/R2 traffic manageable.
FORMAT = (
    "bv*[height<=720][ext=mp4][vcodec^=avc1]+ba[ext=m4a]/"
    "bv*[height<=720][ext=mp4][vcodec^=avc1]/"
    "b[height<=720][ext=mp4]/"
    "bv*[height<=720]+ba/bv*[height<=720]/b[height<=720]"
)

# mweb + bgutil follows yt-dlp's current recommendation. web_safari can expose
# HLS alternatives, web_embedded works for embeddable videos, and android_vr is
# a final independent client fallback. "default" lets current yt-dlp choose.
STRATEGIES = [
    ("mweb+bgutil", "mweb"),
    ("web_safari", "web_safari"),
    ("web_embedded", "web_embedded"),
    ("android_vr", "android_vr"),
    ("default-clients", ""),
]


def clean_source_files():
    for item in glob.glob("/tmp/youtube-source*"):
        try:
            os.unlink(item)
        except OSError:
            pass


def find_source_file():
    files = [p for p in glob.glob("/tmp/youtube-source*") if os.path.isfile(p) and not p.endswith((".part", ".ytdl"))]
    files.sort(key=lambda p: os.path.getsize(p), reverse=True)
    return files[0] if files else ""


def proxy_label(proxy: str):
    if not proxy:
        return "direct"
    try:
        parsed = urlsplit(proxy)
        return f"{parsed.scheme}://{parsed.hostname}:{parsed.port}"
    except Exception:
        return "proxy"


def run_ytdlp(strategy: str, client: str, proxy: str):
    clean_source_files()
    cmd = [
        sys.executable, "-m", "yt_dlp",
        "--no-playlist",
        "--force-overwrites",
        "--force-ipv4",
        "--retries", "3",
        "--fragment-retries", "3",
        "--extractor-retries", "3",
        "--socket-timeout", "25",
        "--sleep-requests", "1",
        "--merge-output-format", "mp4",
        # Current YouTube extraction needs both a JS runtime and EJS scripts.
        "--js-runtimes", "node",
        "--remote-components", "ejs:github",
        "-f", FORMAT,
        "-o", "/tmp/youtube-source.%(ext)s",
    ]
    if client:
        cmd += ["--extractor-args", f"youtube:player_client={client}"]
    if proxy:
        cmd += ["--proxy", proxy]
    if cookie_file:
        cmd += ["--cookies", cookie_file]
    if SEGMENT_DURATION_SECONDS > 0:
        segment_end = SEGMENT_START_SECONDS + SEGMENT_DURATION_SECONDS
        cmd += [
            "--download-sections", f"*{SEGMENT_START_SECONDS:.3f}-{segment_end:.3f}",
            "--force-keyframes-at-cuts",
        ]
    cmd.append(YOUTUBE_URL)

    print(f"[youtube] trying {strategy} via {proxy_label(proxy)}", flush=True)
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    output = redact(proc.stdout)
    if output:
        print(output, flush=True)
    source = find_source_file()
    if proc.returncode == 0 and source:
        return source, output
    return "", output or f"yt-dlp exited with code {proc.returncode}"


def run_ytdlp_metadata(strategy: str, client: str, proxy: str):
    cmd = [
        sys.executable, "-m", "yt_dlp",
        "--no-playlist",
        "--force-ipv4",
        "--retries", "3",
        "--extractor-retries", "3",
        "--socket-timeout", "25",
        "--sleep-requests", "1",
        "--js-runtimes", "node",
        "--remote-components", "ejs:github",
        "--skip-download",
        "--dump-single-json",
        "--no-warnings",
    ]
    if client:
        cmd += ["--extractor-args", f"youtube:player_client={client}"]
    if proxy:
        cmd += ["--proxy", proxy]
    if cookie_file:
        cmd += ["--cookies", cookie_file]
    cmd.append(YOUTUBE_URL)

    print(f"[youtube-metadata] trying {strategy} via {proxy_label(proxy)}", flush=True)
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    output = redact(proc.stdout)
    if proc.returncode == 0:
        # yt-dlp may print non-JSON informational lines around the JSON. Parse the
        # last complete object-like line rather than logging the metadata payload.
        for line in reversed((proc.stdout or "").splitlines()):
            line = line.strip()
            if not (line.startswith("{") and line.endswith("}")):
                continue
            try:
                payload = json.loads(line)
                duration = float(payload.get("duration") or 0)
                if duration > 0:
                    return {
                        "durationSeconds": duration,
                        "title": str(payload.get("title") or "")[:500],
                        "liveStatus": str(payload.get("live_status") or "")[:80],
                    }, ""
            except Exception:
                continue
    if output:
        print(output, flush=True)
    return None, output or f"yt-dlp metadata exited with code {proc.returncode}"


def classify_failure(errors):
    joined = " | ".join(errors)
    low = joined.lower()
    if "sign in to confirm you’re not a bot" in low or "sign in to confirm you're not a bot" in low:
        return (
            "youtube-bot-challenge",
            "YouTube rejected the configured download route as automated traffic. "
            "Use a working YOUTUBE_PROXY_URL/YOUTUBE_PROXY_URLS; if that route is still challenged, "
            "configure one dedicated server-side YOUTUBE_COOKIES_B64 session."
        )
    if "nonnumeric port" in low:
        return "invalid-proxy", "The configured proxy URL has an invalid port. Use a numeric port supplied by the proxy provider."
    if "signature solving failed" in low or "challenge solver" in low:
        return "youtube-ejs", "YouTube JavaScript challenge solving failed. The workflow should install yt-dlp[default] and enable EJS."
    if "http error 403" in low:
        return "youtube-403", "YouTube returned HTTP 403 through every configured route. Try another proxy endpoint or the optional dedicated cookie session."
    return "youtube-download-failed", redact(joined) or "yt-dlp could not download the video"


attempt_errors = []
source_file = ""
winning_strategy = ""
winning_proxy = ""

# If proxies are configured, try each of them. Direct GitHub egress is retained as
# a last fallback because YouTube's enforcement can vary by runner/IP and video.
ROUTES = list(PROXIES)
if "" not in ROUTES:
    ROUTES.append("")

if JOB_MODE == "metadata":
    metadata_errors = []
    try:
        print(f"[youtube-metadata] routes={len(ROUTES)} proxies={len(PROXIES)} cookies={'yes' if cookie_file else 'no'}", flush=True)
        metadata = None
        winning_strategy = ""
        winning_proxy = ""
        for proxy in ROUTES:
            for strategy, client in STRATEGIES:
                metadata, details = run_ytdlp_metadata(strategy, client, proxy)
                if metadata:
                    winning_strategy = strategy
                    winning_proxy = proxy_label(proxy)
                    break
                metadata_errors.append(f"{strategy}@{proxy_label(proxy)}: {details}")
            if metadata:
                break
        if not metadata:
            code, summary = classify_failure(metadata_errors)
            raise RuntimeError(f"{code}: {summary}")
        put_json(METADATA_KEY, {
            "ok": True,
            "videoId": VIDEO_ID,
            "sourceUrl": YOUTUBE_URL,
            "durationSeconds": metadata["durationSeconds"],
            "title": metadata.get("title", ""),
            "liveStatus": metadata.get("liveStatus", ""),
            "fetchedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "strategy": winning_strategy,
            "route": winning_proxy,
        })
        delete_key(ERROR_KEY)
        delete_key(MARKER_KEY)
        print(json.dumps({
            "ok": True,
            "mode": "metadata",
            "videoId": VIDEO_ID,
            "durationSeconds": metadata["durationSeconds"],
            "metadataKey": METADATA_KEY,
        }), flush=True)
        raise SystemExit(0)
    except SystemExit:
        raise
    except Exception as exc:
        delete_key(MARKER_KEY)
        error_text = redact(str(exc))
        error_code = error_text.split(":", 1)[0] if ":" in error_text else "youtube-metadata-failed"
        print(f"[youtube-metadata] failed: {error_text}", file=sys.stderr, flush=True)
        try:
            put_json(ERROR_KEY, {
                "ok": False,
                "videoId": VIDEO_ID,
                "sourceUrl": YOUTUBE_URL,
                "failedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "errorCode": error_code,
                "error": error_text,
                "attempts": len(metadata_errors),
                "proxyCount": len(PROXIES),
                "cookiesConfigured": bool(cookie_file),
            })
        except Exception as upload_exc:
            print(f"[r2] could not upload metadata failure marker: {upload_exc}", file=sys.stderr, flush=True)
        raise

try:
    print(f"[youtube] routes={len(ROUTES)} proxies={len(PROXIES)} cookies={'yes' if cookie_file else 'no'}", flush=True)
    for proxy in ROUTES:
        for strategy, client in STRATEGIES:
            source_file, details = run_ytdlp(strategy, client, proxy)
            if source_file:
                winning_strategy = strategy
                winning_proxy = proxy_label(proxy)
                break
            attempt_errors.append(f"{strategy}@{proxy_label(proxy)}: {details}")
        if source_file:
            break

    if not source_file:
        code, summary = classify_failure(attempt_errors)
        raise RuntimeError(f"{code}: {summary}")

    output_file = "/tmp/facial-video.mp4"
    if os.path.exists(output_file):
        os.unlink(output_file)

    # Normalize to a browser-friendly H.264/AAC fast-start MP4. Audio is optional.
    ffmpeg_cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "warning",
        "-i", source_file,
        "-map", "0:v:0", "-map", "0:a?",
        "-vf", "scale='min(1280,iw)':-2",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart",
        output_file,
    ]
    print("[ffmpeg] normalizing MP4 for browser seeking", flush=True)
    ffmpeg = subprocess.run(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if ffmpeg.returncode != 0 or not os.path.exists(output_file):
        raise RuntimeError(f"ffmpeg failed: {redact(ffmpeg.stdout)}")

    size = os.path.getsize(output_file)
    if size <= 0:
        raise RuntimeError("The generated MP4 is empty")

    print(f"[r2] uploading {size} bytes to {R2_BUCKET}/{OBJECT_KEY}", flush=True)
    with open(output_file, "rb") as handle:
        s3.upload_fileobj(
            handle,
            R2_BUCKET,
            OBJECT_KEY,
            ExtraArgs={
                "ContentType": "video/mp4",
                "CacheControl": "private, max-age=3600",
                "Metadata": {
                    "videoid": VIDEO_ID,
                    "strategy": winning_strategy,
                    "route": winning_proxy,
                    "source": "github-actions",
                    "segmentstart": f"{SEGMENT_START_SECONDS:.3f}",
                    "segmentduration": f"{SEGMENT_DURATION_SECONDS:.3f}",
                },
            },
        )

    delete_key(ERROR_KEY)
    delete_key(MARKER_KEY)
    print(json.dumps({
        "ok": True,
        "videoId": VIDEO_ID,
        "objectKey": OBJECT_KEY,
        "bytes": size,
        "strategy": winning_strategy,
        "route": winning_proxy,
        "segmentStartSeconds": SEGMENT_START_SECONDS,
        "segmentDurationSeconds": SEGMENT_DURATION_SECONDS,
    }), flush=True)

except Exception as exc:
    # Never leave the queued marker behind on a failed run; otherwise the Worker
    # would continue reporting "processing" after the Action has already failed.
    delete_key(MARKER_KEY)
    error_text = redact(str(exc))
    error_code = error_text.split(":", 1)[0] if ":" in error_text else "youtube-download-failed"
    print(f"[youtube-job] failed: {error_text}", file=sys.stderr, flush=True)
    try:
        put_json(ERROR_KEY, {
            "ok": False,
            "videoId": VIDEO_ID,
            "sourceUrl": YOUTUBE_URL,
            "failedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "errorCode": error_code,
            "error": error_text,
            "attempts": len(attempt_errors),
            "proxyCount": len(PROXIES),
            "cookiesConfigured": bool(cookie_file),
        })
    except Exception as upload_exc:
        print(f"[r2] could not upload failure marker: {upload_exc}", file=sys.stderr, flush=True)
    raise
