#!/usr/bin/env python3
"""Download one public YouTube video, normalize it, and cache it in Cloudflare R2.

Designed for GitHub Actions. It supports:
- current yt-dlp + EJS JavaScript challenge solving
- bgutil PO-token provider (started by the workflow)
- a Cloudflare-leased proxy slot from a small proxy pool
- actual exit-IP locking so duplicate proxy entries cannot hit YouTube concurrently
- one optional server-side YouTube cookies.txt session
- multiple YouTube client strategies

The website user only supplies a YouTube URL. All anti-bot/session configuration is
server-side in GitHub repository secrets.
"""
import base64
import glob
import hashlib
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
from botocore.exceptions import ClientError

YOUTUBE_URL = os.environ["INPUT_YOUTUBE_URL"].strip()
VIDEO_ID = os.environ["INPUT_VIDEO_ID"].strip()
OBJECT_KEY = os.environ["INPUT_OBJECT_KEY"].strip()
MARKER_KEY = os.environ["INPUT_MARKER_KEY"].strip()
ERROR_KEY = os.environ["INPUT_ERROR_KEY"].strip()
JOB_MODE = os.environ.get("INPUT_JOB_MODE", "video").strip().lower() or "video"
METADATA_KEY = os.environ.get("INPUT_METADATA_KEY", "").strip()
SHORT_VIDEO_OBJECT_KEY = os.environ.get("INPUT_SHORT_VIDEO_OBJECT_KEY", "").strip()
SHORT_VIDEO_MARKER_KEY = os.environ.get("INPUT_SHORT_VIDEO_MARKER_KEY", "").strip()
SHORT_VIDEO_ERROR_KEY = os.environ.get("INPUT_SHORT_VIDEO_ERROR_KEY", "").strip()
try:
    DISPATCH_REQUESTED_AT_MS = max(0, int(float(os.environ.get("INPUT_DISPATCH_REQUESTED_AT_MS", "0") or 0)))
except ValueError:
    DISPATCH_REQUESTED_AT_MS = 0
PROXY_SLOT_RAW = os.environ.get("INPUT_PROXY_SLOT", "").strip()
PROXY_LEASE_TOKEN = os.environ.get("INPUT_PROXY_LEASE_TOKEN", "").strip()
PROXY_LEASE_KEY = os.environ.get("INPUT_PROXY_LEASE_KEY", "").strip()
PROXY_SITE = os.environ.get("INPUT_PROXY_SITE", "youtube").strip().lower() or "youtube"
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


PROXY_LEASE_SECONDS = 45 * 60
PROXY_SUCCESS_COOLDOWN_SECONDS = 15
PROXY_FAILURE_COOLDOWN_SECONDS = 30
PROXY_UNAVAILABLE_COOLDOWN_SECONDS = 60
PROXY_RATE_LIMIT_COOLDOWN_SECONDS = 3 * 60
PROXY_BLOCKED_COOLDOWN_SECONDS = 10 * 60
EGRESS_LEASE_KEY = ""
DETECTED_EXIT_IP = ""
SCRIPT_STARTED_AT = time.monotonic()
AUTO_PREPARE_MAX_SECONDS = 5 * 60


def utc_now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def epoch_millis() -> int:
    return int(time.time() * 1000)


def elapsed_seconds(start: float) -> float:
    return round(max(0.0, time.monotonic() - start), 3)


def startup_delay_seconds() -> float:
    if not DISPATCH_REQUESTED_AT_MS:
        return 0.0
    return round(max(0.0, (epoch_millis() - DISPATCH_REQUESTED_AT_MS) / 1000.0), 3)


def format_duration(seconds: float) -> str:
    total = max(0, int(round(float(seconds or 0))))
    hours, rem = divmod(total, 3600)
    minutes, secs = divmod(rem, 60)
    return f"{hours}:{minutes:02d}:{secs:02d}" if hours else f"{minutes}:{secs:02d}"


def read_json_with_etag(key: str):
    if not key:
        return None, ""
    try:
        obj = s3.get_object(Bucket=R2_BUCKET, Key=key)
    except ClientError as exc:
        code = str(exc.response.get("Error", {}).get("Code", ""))
        status = int(exc.response.get("ResponseMetadata", {}).get("HTTPStatusCode", 0) or 0)
        if status == 404 or code in {"404", "NoSuchKey", "NotFound"}:
            return None, ""
        raise
    body = obj["Body"].read()
    try:
        payload = json.loads(body.decode("utf-8"))
    except Exception:
        payload = {}
    return payload if isinstance(payload, dict) else {}, str(obj.get("ETag") or "")


def update_job_marker(key: str, *, status: str = "processing", message: str = "", phase: str = "", timings: dict | None = None, extra: dict | None = None):
    if not key:
        return
    try:
        current, _ = read_json_with_etag(key)
        payload = dict(current or {})
        payload.update({
            "requestedAt": payload.get("requestedAt") or utc_now_iso(),
            "videoId": VIDEO_ID,
            "sourceUrl": YOUTUBE_URL,
            "status": status,
            "updatedAt": utc_now_iso(),
        })
        if message:
            payload["message"] = message
        if phase:
            payload["phase"] = phase
        if timings is not None:
            payload["timings"] = timings
        if extra:
            payload.update(extra)
        put_json(key, payload)
    except Exception as exc:
        print(f"[r2] warning: could not update job marker {key}: {exc}", flush=True)


def conditional_put_json(key: str, payload: dict, *, etag: str = "", create_only: bool = False):
    kwargs = {
        "Bucket": R2_BUCKET,
        "Key": key,
        "Body": json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        "ContentType": "application/json; charset=utf-8",
        "CacheControl": "no-store",
    }
    if create_only:
        kwargs["IfNoneMatch"] = "*"
    elif etag:
        kwargs["IfMatch"] = etag
    try:
        s3.put_object(**kwargs)
        return True
    except ClientError as exc:
        code = str(exc.response.get("Error", {}).get("Code", ""))
        status = int(exc.response.get("ResponseMetadata", {}).get("HTTPStatusCode", 0) or 0)
        if status == 412 or code in {"PreconditionFailed", "ConditionalRequestConflict"}:
            return False
        raise


def coordinator_base_prefix() -> str:
    if PROXY_LEASE_KEY and "/slots/" in PROXY_LEASE_KEY:
        return PROXY_LEASE_KEY.split("/slots/", 1)[0]
    return f"facial-proxy-coordinator/v1/sites/{PROXY_SITE}"


def report_proxy_pool_inventory():
    """Tell the Worker how many valid pool entries GitHub can currently see."""
    try:
        put_json(f"{coordinator_base_prefix()}/pool.json", {
            "site": PROXY_SITE,
            "configuredCount": len(PROXIES),
            "updatedAt": utc_now_iso(),
        })
    except Exception as exc:
        print(f"[proxy] warning: could not report pool inventory: {exc}", flush=True)


def detect_proxy_exit_ip(proxy: str) -> str:
    if not proxy:
        return ""
    cmd = [
        "curl", "-fsS", "--ipv4",
        "--connect-timeout", "7", "--max-time", "12",
        "--proxy", proxy,
        "https://www.cloudflare.com/cdn-cgi/trace",
    ]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if proc.returncode != 0:
        detail = redact((proc.stderr or proc.stdout or "proxy health probe failed").strip())
        raise RuntimeError(f"proxy-unavailable: {detail}")
    for line in (proc.stdout or "").splitlines():
        if line.startswith("ip="):
            ip = line[3:].strip()
            if ip and len(ip) <= 64 and re.fullmatch(r"[0-9A-Fa-f:.]+", ip):
                return ip
    raise RuntimeError("proxy-unavailable: proxy health probe did not return an exit IP")


def _lease_expired(payload: dict, now: int) -> bool:
    try:
        return int(payload.get("expiresAt") or 0) <= now
    except Exception:
        return True


def _cooldown_active(payload: dict, now: int) -> bool:
    try:
        return int(payload.get("cooldownUntil") or 0) > now
    except Exception:
        return False


def claim_egress_identity(exit_ip: str):
    """Atomically reserve the actual public exit IP, not only the configured slot."""
    global EGRESS_LEASE_KEY
    if not (PROXY_LEASE_TOKEN and exit_ip):
        return True, ""
    digest = hashlib.sha256(exit_ip.encode("utf-8")).hexdigest()[:40]
    key = f"{coordinator_base_prefix()}/egress/{digest}.json"
    now = epoch_millis()
    for _ in range(4):
        current, etag = read_json_with_etag(key)
        if current:
            same = str(current.get("leaseToken") or "") == PROXY_LEASE_TOKEN
            if same and str(current.get("status") or "") == "leased":
                EGRESS_LEASE_KEY = key
                return True, "already-owned"
            if str(current.get("status") or "") == "leased" and not _lease_expired(current, now):
                return False, "duplicate-exit-in-use"
            if _cooldown_active(current, now):
                return False, "exit-ip-cooling-down"
        payload = {
            "site": PROXY_SITE,
            "status": "leased",
            "exitIp": exit_ip,
            "leaseToken": PROXY_LEASE_TOKEN,
            "slot": int(PROXY_SLOT_RAW) if PROXY_SLOT_RAW.isdigit() else None,
            "jobKey": MARKER_KEY,
            "leasedAt": now,
            "expiresAt": now + PROXY_LEASE_SECONDS * 1000,
            "cooldownUntil": 0,
            "lastResult": str((current or {}).get("lastResult") or ""),
            "consecutiveFailures": max(0, int((current or {}).get("consecutiveFailures") or 0)),
            "updatedAt": utc_now_iso(),
        }
        won = conditional_put_json(key, payload, etag=etag, create_only=not bool(current))
        if won:
            EGRESS_LEASE_KEY = key
            return True, "claimed"
        time.sleep(0.15)
    return False, "egress-lease-race"


def update_slot_exit_ip(exit_ip: str):
    if not (PROXY_LEASE_KEY and PROXY_LEASE_TOKEN):
        return
    for _ in range(3):
        current, etag = read_json_with_etag(PROXY_LEASE_KEY)
        if not current or str(current.get("leaseToken") or "") != PROXY_LEASE_TOKEN:
            return
        current.update({
            "exitIp": exit_ip,
            "lastSeenAt": epoch_millis(),
            "updatedAt": utc_now_iso(),
        })
        if conditional_put_json(PROXY_LEASE_KEY, current, etag=etag):
            return
        time.sleep(0.1)


def release_one_lease(key: str, *, result: str, cooldown_seconds: int, exit_ip: str = ""):
    if not (key and PROXY_LEASE_TOKEN):
        return
    now = epoch_millis()
    for _ in range(4):
        current, etag = read_json_with_etag(key)
        if not current or str(current.get("leaseToken") or "") != PROXY_LEASE_TOKEN:
            return
        try:
            previous_failures = int(current.get("consecutiveFailures") or 0)
        except Exception:
            previous_failures = 0
        success = result == "success"
        failure_count = 0 if success else min(20, previous_failures + 1)
        effective_cooldown = max(0, int(cooldown_seconds))
        if not success and result in {"proxy-unavailable", "duplicate-exit-in-use", "exit-ip-cooling-down", "egress-lease-race"}:
            effective_cooldown = min(15 * 60, effective_cooldown * (2 ** min(4, max(0, failure_count - 1))))
        current.update({
            "status": "released",
            "releasedAt": now,
            "expiresAt": now,
            "cooldownUntil": now + effective_cooldown * 1000,
            "lastResult": result,
            "consecutiveFailures": failure_count,
            "lastExitIp": exit_ip or current.get("exitIp") or current.get("lastExitIp") or "",
            "updatedAt": utc_now_iso(),
        })
        if conditional_put_json(key, current, etag=etag):
            return
        time.sleep(0.1)


def release_proxy_leases(*, result: str, cooldown_seconds: int, exit_ip: str = ""):
    release_one_lease(PROXY_LEASE_KEY, result=result, cooldown_seconds=cooldown_seconds, exit_ip=exit_ip)
    release_one_lease(EGRESS_LEASE_KEY, result=result, cooldown_seconds=cooldown_seconds, exit_ip=exit_ip)


def current_marker_payload() -> dict:
    try:
        payload, _ = read_json_with_etag(MARKER_KEY)
        return payload or {}
    except Exception:
        return {}


def requeue_for_proxy(*, code: str, message: str, cooldown_seconds: int, exit_ip: str = "", marker_key: str = "", error_key: str = ""):
    """Release this route and put the job back into the Worker's waiting state."""
    target_marker = marker_key or MARKER_KEY
    target_error = error_key or ERROR_KEY
    try:
        previous, _ = read_json_with_etag(target_marker)
        previous = previous or {}
    except Exception:
        previous = {}
    release_proxy_leases(result=code, cooldown_seconds=cooldown_seconds, exit_ip=exit_ip)
    delete_key(target_error)
    try:
        attempts = int(previous.get("proxyRouteAttempts") or 0) + 1
    except Exception:
        attempts = 1
    put_json(target_marker, {
        **previous,
        "requestedAt": previous.get("requestedAt") or utc_now_iso(),
        "videoId": VIDEO_ID,
        "sourceUrl": YOUTUBE_URL,
        "status": "waiting-for-proxy",
        "proxyRouteAttempts": attempts,
        "lastProxyFailure": code,
        "lastProxyFailureMessage": redact(message)[-1200:],
        "lastProxyExitIp": exit_ip or "",
        "retryAfter": max(3, min(60, int(cooldown_seconds // 6) if cooldown_seconds else 3)),
        "updatedAt": utc_now_iso(),
    })
    print(f"[proxy] route released and re-queued: {code}", flush=True)
    raise SystemExit(0)


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


# YOUTUBE_PROXY_URLS is the coordinated pool. Keep the singular secret only as a
# backwards-compatible fallback when no pool is configured so slot numbers stay stable.
_proxy_raw = split_proxy_values(YOUTUBE_PROXY_URLS) if YOUTUBE_PROXY_URLS else split_proxy_values(YOUTUBE_PROXY_URL)
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


report_proxy_pool_inventory()

COORDINATED_PROXY = bool(PROXY_SLOT_RAW or PROXY_LEASE_TOKEN or PROXY_LEASE_KEY)
ASSIGNED_PROXY = ""
ASSIGNED_PROXY_SLOT = None
if COORDINATED_PROXY:
    if not (PROXY_SLOT_RAW and PROXY_LEASE_TOKEN and PROXY_LEASE_KEY):
        raise SystemExit("Incomplete Cloudflare proxy lease inputs")
    try:
        ASSIGNED_PROXY_SLOT = int(PROXY_SLOT_RAW)
    except ValueError:
        raise SystemExit("INPUT_PROXY_SLOT must be a zero-based integer")
    if ASSIGNED_PROXY_SLOT < 0 or ASSIGNED_PROXY_SLOT >= len(PROXIES):
        requeue_for_proxy(
            code="proxy-slot-unavailable",
            message=f"Worker assigned proxy slot {ASSIGNED_PROXY_SLOT}, but GitHub currently has {len(PROXIES)} valid proxy entries.",
            cooldown_seconds=PROXY_UNAVAILABLE_COOLDOWN_SECONDS,
        )
    ASSIGNED_PROXY = PROXIES[ASSIGNED_PROXY_SLOT]

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


def run_ytdlp(strategy: str, client: str, proxy: str, *, segment_start: float = 0.0, segment_duration: float = 0.0):
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
        "--sleep-requests", "0.25",
        "--concurrent-fragments", "4",
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
    if segment_duration > 0:
        segment_end = segment_start + segment_duration
        cmd += [
            "--download-sections", f"*{segment_start:.3f}-{segment_end:.3f}",
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
        "--sleep-requests", "0.25",
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
    if "http error 429" in low or "too many requests" in low:
        return "youtube-429", "YouTube rate-limited the assigned proxy route."
    if "http error 403" in low:
        return "youtube-403", "YouTube returned HTTP 403 through the assigned proxy route."
    if any(token in low for token in ["proxyerror", "proxy error", "connection refused", "connection reset", "timed out", "timeout", "couldn't connect", "could not connect"]):
        return "proxy-unavailable", "The assigned proxy route could not reach YouTube reliably."
    return "youtube-download-failed", redact(joined) or "yt-dlp could not download the video"


def route_cooldown_for(code: str) -> int:
    if code in {"youtube-bot-challenge", "youtube-403"}:
        return PROXY_BLOCKED_COOLDOWN_SECONDS
    if code == "youtube-429":
        return PROXY_RATE_LIMIT_COOLDOWN_SECONDS
    if code in {"proxy-unavailable", "invalid-proxy"}:
        return PROXY_UNAVAILABLE_COOLDOWN_SECONDS
    return PROXY_FAILURE_COOLDOWN_SECONDS


def is_retryable_route_failure(code: str) -> bool:
    return code in {
        "youtube-bot-challenge", "youtube-403", "youtube-429",
        "proxy-unavailable", "invalid-proxy",
    }


def probe_media_codecs(path: str):
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "stream=codec_type,codec_name",
        "-of", "json", path,
    ]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if proc.returncode != 0:
        return "", ""
    try:
        payload = json.loads(proc.stdout or "{}")
    except Exception:
        return "", ""
    video_codec = ""
    audio_codec = ""
    for stream in payload.get("streams") or []:
        kind = str(stream.get("codec_type") or "")
        codec = str(stream.get("codec_name") or "")
        if kind == "video" and not video_codec:
            video_codec = codec
        elif kind == "audio" and not audio_codec:
            audio_codec = codec
    return video_codec, audio_codec


def make_browser_ready_mp4(source_file: str, output_file: str):
    """Prefer a no-reencode fast-start remux; only encode when codecs require it."""
    if os.path.exists(output_file):
        os.unlink(output_file)
    video_codec, audio_codec = probe_media_codecs(source_file)
    can_copy = video_codec == "h264" and audio_codec in {"", "aac", "mp3"}
    if can_copy:
        copy_cmd = [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "warning",
            "-i", source_file,
            "-map", "0:v:0", "-map", "0:a?",
            "-c", "copy", "-movflags", "+faststart",
            output_file,
        ]
        started = time.monotonic()
        proc = subprocess.run(copy_cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        if proc.returncode == 0 and os.path.exists(output_file) and os.path.getsize(output_file) > 0:
            return "stream-copy", elapsed_seconds(started)
        print(f"[ffmpeg] fast remux failed; falling back to encode: {redact(proc.stdout)[-1200:]}", flush=True)
        try:
            if os.path.exists(output_file):
                os.unlink(output_file)
        except OSError:
            pass

    encode_cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "warning",
        "-i", source_file,
        "-map", "0:v:0", "-map", "0:a?",
        "-vf", "scale='min(1280,iw)':-2",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart",
        output_file,
    ]
    started = time.monotonic()
    proc = subprocess.run(encode_cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if proc.returncode != 0 or not os.path.exists(output_file) or os.path.getsize(output_file) <= 0:
        raise RuntimeError(f"ffmpeg failed: {redact(proc.stdout)}")
    return "transcode", elapsed_seconds(started)


def process_video_job(*, object_key: str, marker_key: str, error_key: str, segment_start: float = 0.0, segment_duration: float = 0.0, source_duration: float = 0.0, timings: dict | None = None):
    local_timings = dict(timings or {})
    local_timings.setdefault("startupDelaySeconds", startup_delay_seconds())
    local_errors = []
    source_file = ""
    winning_strategy = ""
    winning_proxy = ""
    try:
        update_job_marker(
            marker_key,
            status="processing",
            phase="download",
            message="Downloading the YouTube video…" if not segment_duration else "Downloading the selected YouTube segment…",
            timings=local_timings,
            extra={"sourceDurationSeconds": source_duration, "segmentStartSeconds": segment_start, "segmentDurationSeconds": segment_duration},
        )
        download_started = time.monotonic()
        print(f"[youtube] routes={len(ROUTES)} proxies={len(PROXIES)} cookies={'yes' if cookie_file else 'no'}", flush=True)
        for proxy in ROUTES:
            for strategy, client in STRATEGIES:
                source_file, details = run_ytdlp(
                    strategy,
                    client,
                    proxy,
                    segment_start=segment_start,
                    segment_duration=segment_duration,
                )
                if source_file:
                    winning_strategy = strategy
                    winning_proxy = proxy_label(proxy)
                    break
                local_errors.append(f"{strategy}@{proxy_label(proxy)}: {details}")
            if source_file:
                break
        local_timings["downloadSeconds"] = elapsed_seconds(download_started)

        if not source_file:
            code, summary = classify_failure(local_errors)
            if COORDINATED_PROXY and is_retryable_route_failure(code):
                update_job_marker(marker_key, status="processing", phase="proxy-retry", message="The current proxy route failed. Waiting for another route…", timings=local_timings)
                requeue_for_proxy(
                    code=code,
                    message=summary,
                    cooldown_seconds=route_cooldown_for(code),
                    exit_ip=DETECTED_EXIT_IP,
                    marker_key=marker_key,
                    error_key=error_key,
                )
            raise RuntimeError(f"{code}: {summary}")

        output_file = "/tmp/facial-video.mp4"
        update_job_marker(marker_key, status="processing", phase="media-prep", message="Preparing the video for browser analysis…", timings=local_timings)
        media_started = time.monotonic()
        prep_mode, prep_seconds = make_browser_ready_mp4(source_file, output_file)
        local_timings["mediaPrepSeconds"] = prep_seconds
        local_timings["mediaPrepMode"] = prep_mode
        local_timings["mediaStageSeconds"] = elapsed_seconds(media_started)

        size = os.path.getsize(output_file)
        if size <= 0:
            raise RuntimeError("The generated MP4 is empty")

        update_job_marker(marker_key, status="processing", phase="r2-upload", message="Uploading the prepared video to the analysis cache…", timings=local_timings)
        upload_started = time.monotonic()
        print(f"[r2] uploading {size} bytes to {R2_BUCKET}/{object_key}", flush=True)
        with open(output_file, "rb") as handle:
            s3.upload_fileobj(
                handle,
                R2_BUCKET,
                object_key,
                ExtraArgs={
                    "ContentType": "video/mp4",
                    "CacheControl": "private, max-age=3600",
                    "Metadata": {
                        "videoid": VIDEO_ID,
                        "strategy": winning_strategy,
                        "route": winning_proxy,
                        "source": "github-actions-fast-v2",
                        "segmentstart": f"{segment_start:.3f}",
                        "segmentduration": f"{segment_duration:.3f}",
                        "prep-mode": prep_mode,
                    },
                },
            )
        local_timings["r2UploadSeconds"] = elapsed_seconds(upload_started)
        local_timings["scriptSeconds"] = elapsed_seconds(SCRIPT_STARTED_AT)
        if DISPATCH_REQUESTED_AT_MS:
            local_timings["dispatchToReadySeconds"] = round(max(0.0, (epoch_millis() - DISPATCH_REQUESTED_AT_MS) / 1000.0), 3)

        release_proxy_leases(
            result="success",
            cooldown_seconds=PROXY_SUCCESS_COOLDOWN_SECONDS,
            exit_ip=DETECTED_EXIT_IP,
        )
        delete_key(error_key)
        delete_key(marker_key)
        result = {
            "ok": True,
            "videoId": VIDEO_ID,
            "objectKey": object_key,
            "bytes": size,
            "strategy": winning_strategy,
            "route": winning_proxy,
            "segmentStartSeconds": segment_start,
            "segmentDurationSeconds": segment_duration,
            "sourceDurationSeconds": source_duration,
            "timings": local_timings,
        }
        print(json.dumps(result), flush=True)
        return result
    except SystemExit:
        raise
    except Exception as exc:
        release_proxy_leases(
            result="job-failed",
            cooldown_seconds=PROXY_FAILURE_COOLDOWN_SECONDS,
            exit_ip=DETECTED_EXIT_IP,
        )
        delete_key(marker_key)
        error_text = redact(str(exc))
        error_code = error_text.split(":", 1)[0] if ":" in error_text else "youtube-download-failed"
        local_timings["scriptSeconds"] = elapsed_seconds(SCRIPT_STARTED_AT)
        print(f"[youtube-job] failed: {error_text}", file=sys.stderr, flush=True)
        try:
            put_json(error_key, {
                "ok": False,
                "videoId": VIDEO_ID,
                "sourceUrl": YOUTUBE_URL,
                "failedAt": utc_now_iso(),
                "errorCode": error_code,
                "error": error_text,
                "attempts": len(local_errors),
                "proxyCount": len(PROXIES),
                "cookiesConfigured": bool(cookie_file),
                "timings": local_timings,
            })
        except Exception as upload_exc:
            print(f"[r2] could not upload failure marker: {upload_exc}", file=sys.stderr, flush=True)
        raise


attempt_errors = []
source_file = ""
winning_strategy = ""
winning_proxy = ""

if COORDINATED_PROXY:
    update_job_marker(MARKER_KEY, status="processing", phase="proxy-check", message="Checking the assigned proxy route…", timings={"startupDelaySeconds": startup_delay_seconds()})
    try:
        DETECTED_EXIT_IP = detect_proxy_exit_ip(ASSIGNED_PROXY)
    except Exception as exc:
        requeue_for_proxy(
            code="proxy-unavailable",
            message=str(exc),
            cooldown_seconds=PROXY_UNAVAILABLE_COOLDOWN_SECONDS,
        )
    egress_ok, egress_reason = claim_egress_identity(DETECTED_EXIT_IP)
    if not egress_ok:
        requeue_for_proxy(
            code=egress_reason or "duplicate-exit-in-use",
            message=f"Exit IP {DETECTED_EXIT_IP} is already leased or cooling down for {PROXY_SITE}.",
            cooldown_seconds=PROXY_UNAVAILABLE_COOLDOWN_SECONDS,
            exit_ip=DETECTED_EXIT_IP,
        )
    update_slot_exit_ip(DETECTED_EXIT_IP)
    ROUTES = [ASSIGNED_PROXY]
    print(f"[proxy] coordinated slot={ASSIGNED_PROXY_SLOT} exit={DETECTED_EXIT_IP}", flush=True)
else:
    ROUTES = list(PROXIES)
    if "" not in ROUTES:
        ROUTES.append("")

if JOB_MODE == "metadata":
    metadata_errors = []
    metadata_started = time.monotonic()
    metadata_timings = {"startupDelaySeconds": startup_delay_seconds()}
    try:
        update_job_marker(MARKER_KEY, status="processing", phase="metadata", message="Reading YouTube duration…", timings=metadata_timings)
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
        metadata_timings["metadataSeconds"] = elapsed_seconds(metadata_started)
        if not metadata:
            code, summary = classify_failure(metadata_errors)
            if COORDINATED_PROXY and is_retryable_route_failure(code):
                requeue_for_proxy(
                    code=code,
                    message=summary,
                    cooldown_seconds=route_cooldown_for(code),
                    exit_ip=DETECTED_EXIT_IP,
                )
            raise RuntimeError(f"{code}: {summary}")

        duration = float(metadata["durationSeconds"])
        can_auto_prepare = (
            duration > 0
            and duration <= AUTO_PREPARE_MAX_SECONDS + 0.001
            and bool(SHORT_VIDEO_OBJECT_KEY and SHORT_VIDEO_MARKER_KEY and SHORT_VIDEO_ERROR_KEY)
        )

        if can_auto_prepare:
            parent_marker = current_marker_payload()
            put_json(SHORT_VIDEO_MARKER_KEY, {
                "requestedAt": utc_now_iso(),
                "videoId": VIDEO_ID,
                "sourceUrl": YOUTUBE_URL,
                "status": "processing",
                "mode": "video",
                "phase": "promoted-from-metadata",
                "message": f"Video is {format_duration(duration)}. Preparing it in the same worker…",
                "segment": {"start": 0, "duration": 0, "sourceDuration": duration},
                "proxySlot": parent_marker.get("proxySlot"),
                "proxyLeaseToken": parent_marker.get("proxyLeaseToken") or PROXY_LEASE_TOKEN,
                "proxyLeaseKey": parent_marker.get("proxyLeaseKey") or PROXY_LEASE_KEY,
                "proxyLeaseExpiresAt": parent_marker.get("proxyLeaseExpiresAt"),
                "timings": metadata_timings,
                "updatedAt": utc_now_iso(),
            })

        put_json(METADATA_KEY, {
            "ok": True,
            "videoId": VIDEO_ID,
            "sourceUrl": YOUTUBE_URL,
            "durationSeconds": duration,
            "title": metadata.get("title", ""),
            "liveStatus": metadata.get("liveStatus", ""),
            "fetchedAt": utc_now_iso(),
            "strategy": winning_strategy,
            "route": winning_proxy,
            "shortVideoPreparing": can_auto_prepare,
            "timings": metadata_timings,
        })
        delete_key(ERROR_KEY)
        delete_key(MARKER_KEY)

        if can_auto_prepare:
            try:
                result = process_video_job(
                    object_key=SHORT_VIDEO_OBJECT_KEY,
                    marker_key=SHORT_VIDEO_MARKER_KEY,
                    error_key=SHORT_VIDEO_ERROR_KEY,
                    segment_start=0.0,
                    segment_duration=0.0,
                    source_duration=duration,
                    timings=metadata_timings,
                )
            except SystemExit:
                raise
            except Exception:
                # process_video_job already wrote the video-specific failure. Do not
                # overwrite successful metadata with a misleading metadata error.
                raise SystemExit(1)
            print(json.dumps({
                "ok": True,
                "mode": "metadata+video",
                "videoId": VIDEO_ID,
                "durationSeconds": duration,
                "metadataKey": METADATA_KEY,
                "objectKey": SHORT_VIDEO_OBJECT_KEY,
                "timings": result.get("timings", {}),
            }), flush=True)
            raise SystemExit(0)

        release_proxy_leases(
            result="success",
            cooldown_seconds=PROXY_SUCCESS_COOLDOWN_SECONDS,
            exit_ip=DETECTED_EXIT_IP,
        )
        print(json.dumps({
            "ok": True,
            "mode": "metadata",
            "videoId": VIDEO_ID,
            "durationSeconds": duration,
            "metadataKey": METADATA_KEY,
            "timings": metadata_timings,
        }), flush=True)
        raise SystemExit(0)
    except SystemExit:
        raise
    except Exception as exc:
        release_proxy_leases(
            result="metadata-failed",
            cooldown_seconds=PROXY_FAILURE_COOLDOWN_SECONDS,
            exit_ip=DETECTED_EXIT_IP,
        )
        delete_key(MARKER_KEY)
        error_text = redact(str(exc))
        error_code = error_text.split(":", 1)[0] if ":" in error_text else "youtube-metadata-failed"
        metadata_timings["metadataSeconds"] = metadata_timings.get("metadataSeconds", elapsed_seconds(metadata_started))
        metadata_timings["scriptSeconds"] = elapsed_seconds(SCRIPT_STARTED_AT)
        print(f"[youtube-metadata] failed: {error_text}", file=sys.stderr, flush=True)
        try:
            put_json(ERROR_KEY, {
                "ok": False,
                "videoId": VIDEO_ID,
                "sourceUrl": YOUTUBE_URL,
                "failedAt": utc_now_iso(),
                "errorCode": error_code,
                "error": error_text,
                "attempts": len(metadata_errors),
                "proxyCount": len(PROXIES),
                "cookiesConfigured": bool(cookie_file),
                "timings": metadata_timings,
            })
        except Exception as upload_exc:
            print(f"[r2] could not upload metadata failure marker: {upload_exc}", file=sys.stderr, flush=True)
        raise

process_video_job(
    object_key=OBJECT_KEY,
    marker_key=MARKER_KEY,
    error_key=ERROR_KEY,
    segment_start=SEGMENT_START_SECONDS,
    segment_duration=SEGMENT_DURATION_SECONDS,
    source_duration=0.0,
    timings={"startupDelaySeconds": startup_delay_seconds()},
)
