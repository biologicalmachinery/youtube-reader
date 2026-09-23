#!/usr/bin/env python3
import base64
import glob
import json
import os
import pathlib
import re
import subprocess
import sys
import time

import boto3
from botocore.config import Config

YOUTUBE_URL = os.environ["INPUT_YOUTUBE_URL"].strip()
VIDEO_ID = os.environ["INPUT_VIDEO_ID"].strip()
OBJECT_KEY = os.environ["INPUT_OBJECT_KEY"].strip()
MARKER_KEY = os.environ["INPUT_MARKER_KEY"].strip()
ERROR_KEY = os.environ["INPUT_ERROR_KEY"].strip()

R2_ACCOUNT_ID = os.environ["R2_ACCOUNT_ID"].strip()
R2_ACCESS_KEY_ID = os.environ["R2_ACCESS_KEY_ID"].strip()
R2_SECRET_ACCESS_KEY = os.environ["R2_SECRET_ACCESS_KEY"].strip()
R2_BUCKET = os.environ["R2_BUCKET"].strip()
YOUTUBE_PROXY_URL = os.environ.get("YOUTUBE_PROXY_URL", "").strip()
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


def redact(text: str) -> str:
    value = str(text or "")
    if YOUTUBE_PROXY_URL:
        value = value.replace(YOUTUBE_PROXY_URL, "<YOUTUBE_PROXY_URL>")
        try:
            # Also hide credentials if a tool prints only the authority.
            m = re.match(r"^[a-z]+://([^@]+)@(.+)$", YOUTUBE_PROXY_URL, re.I)
            if m:
                value = value.replace(m.group(1), "<proxy-credentials>")
        except Exception:
            pass
    return value[-12000:]


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


cookie_file = ""
if YOUTUBE_COOKIES_B64:
    cookie_file = "/tmp/youtube-cookies.txt"
    try:
        decoded = base64.b64decode(YOUTUBE_COOKIES_B64, validate=True)
        pathlib.Path(cookie_file).write_bytes(decoded)
        os.chmod(cookie_file, 0o600)
        print("[youtube] optional cookie session configured", flush=True)
    except Exception as exc:
        print(f"[youtube] warning: YOUTUBE_COOKIES_B64 could not be decoded: {exc}", flush=True)
        cookie_file = ""


FORMAT = (
    "bv*[height<=720][ext=mp4][vcodec^=avc1]+ba[ext=m4a]/"
    "bv*[height<=720][ext=mp4][vcodec^=avc1]/"
    "b[height<=720][ext=mp4]/"
    "bv*[height<=720]+ba/bv*[height<=720]/b[height<=720]"
)
STRATEGIES = [
    ("mweb+bgutil", "mweb"),
    ("web_embedded", "web_embedded"),
    ("android_vr", "android_vr"),
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


def run_ytdlp(strategy: str, client: str):
    clean_source_files()
    cmd = [
        sys.executable, "-m", "yt_dlp",
        "--no-playlist",
        "--force-overwrites",
        "--retries", "3",
        "--fragment-retries", "3",
        "--socket-timeout", "20",
        "--merge-output-format", "mp4",
        "--js-runtimes", "node",
        "--extractor-args", f"youtube:player_client={client}",
        "-f", FORMAT,
        "-o", "/tmp/youtube-source.%(ext)s",
    ]
    if YOUTUBE_PROXY_URL:
        cmd += ["--proxy", YOUTUBE_PROXY_URL]
    if cookie_file:
        cmd += ["--cookies", cookie_file]
    cmd.append(YOUTUBE_URL)

    print(f"[youtube] trying {strategy}", flush=True)
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    output = redact(proc.stdout)
    if output:
        print(output, flush=True)
    source = find_source_file()
    if proc.returncode == 0 and source:
        return source, output
    return "", output or f"yt-dlp exited with code {proc.returncode}"


attempt_errors = []
source_file = ""
winning_strategy = ""

try:
    for strategy, client in STRATEGIES:
        source_file, details = run_ytdlp(strategy, client)
        if source_file:
            winning_strategy = strategy
            break
        attempt_errors.append(f"{strategy}: {details}")

    if not source_file:
        raise RuntimeError(" | ".join(attempt_errors)[-16000:] or "yt-dlp could not download the video")

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
                    "source": "github-actions",
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
    }), flush=True)

except Exception as exc:
    error_text = redact(str(exc))
    print(f"[youtube-job] failed: {error_text}", file=sys.stderr, flush=True)
    try:
        put_json(ERROR_KEY, {
            "ok": False,
            "videoId": VIDEO_ID,
            "sourceUrl": YOUTUBE_URL,
            "failedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "error": error_text,
            "attempts": len(attempt_errors),
        })
    except Exception as upload_exc:
        print(f"[r2] could not upload failure marker: {upload_exc}", file=sys.stderr, flush=True)
    raise
