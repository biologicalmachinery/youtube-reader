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
import hashlib
import json
import os
import pathlib
import re
import subprocess
import sys
import time
import uuid
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
YOUTUBE_PROXY_LOCK_PREFIX = os.environ.get("YOUTUBE_PROXY_LOCK_PREFIX", "facial-youtube-proxy-locks/v1").strip().strip("/")
try:
    YOUTUBE_PROXY_WAIT_SECONDS = max(0, int(os.environ.get("YOUTUBE_PROXY_WAIT_SECONDS", "1200") or 1200))
    YOUTUBE_PROXY_POLL_SECONDS = max(1.0, float(os.environ.get("YOUTUBE_PROXY_POLL_SECONDS", "3") or 3))
    YOUTUBE_PROXY_LEASE_SECONDS = max(120, int(os.environ.get("YOUTUBE_PROXY_LEASE_SECONDS", "2700") or 2700))
except ValueError as exc:
    raise SystemExit(f"Invalid proxy queue timing setting: {exc}")

YOUTUBE_PROXY_SUCCESS_COOLDOWN_SECONDS = 15
YOUTUBE_PROXY_FAILURE_COOLDOWN_SECONDS = 30
YOUTUBE_PROXY_429_COOLDOWN_SECONDS = 180
YOUTUBE_PROXY_BLOCK_COOLDOWN_SECONDS = 600

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


# YOUTUBE_PROXY_URLS is the preferred pool. The old singular secret is used only
# when the pool is empty, so it cannot accidentally become a sixth proxy.
_proxy_raw = split_proxy_values(YOUTUBE_PROXY_URLS)
if not _proxy_raw:
    _proxy_raw = split_proxy_values(YOUTUBE_PROXY_URL)
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


def _proxy_lock_key(slot: int) -> str:
    return f"{YOUTUBE_PROXY_LOCK_PREFIX}/slot-{slot}.json"


def _precondition_failed(exc: Exception) -> bool:
    if not isinstance(exc, ClientError):
        return False
    response = getattr(exc, "response", {}) or {}
    status = int(response.get("ResponseMetadata", {}).get("HTTPStatusCode", 0) or 0)
    code = str(response.get("Error", {}).get("Code", ""))
    return status == 412 or code in {"PreconditionFailed", "412"}


def _not_found(exc: Exception) -> bool:
    if not isinstance(exc, ClientError):
        return False
    response = getattr(exc, "response", {}) or {}
    status = int(response.get("ResponseMetadata", {}).get("HTTPStatusCode", 0) or 0)
    code = str(response.get("Error", {}).get("Code", ""))
    return status == 404 or code in {"NoSuchKey", "NotFound", "404"}


def _proxy_lock_payload(slot: int, lease_id: str, state: str, expires_at: float, **extra):
    payload = {
        "slot": slot,
        "leaseId": lease_id,
        "videoId": VIDEO_ID,
        "jobMode": JOB_MODE,
        "state": state,
        "updatedAt": time.time(),
        "expiresAt": float(expires_at),
    }
    payload.update(extra)
    return payload


def _put_proxy_lock(slot: int, payload: dict, *, if_none_match: bool = False, if_match: str = ""):
    kwargs = {
        "Bucket": R2_BUCKET,
        "Key": _proxy_lock_key(slot),
        "Body": json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        "ContentType": "application/json; charset=utf-8",
        "CacheControl": "no-store",
    }
    if if_none_match:
        kwargs["IfNoneMatch"] = "*"
    if if_match:
        kwargs["IfMatch"] = if_match
    response = s3.put_object(**kwargs)
    return str(response.get("ETag") or "")


def _read_proxy_lock(slot: int):
    try:
        response = s3.get_object(Bucket=R2_BUCKET, Key=_proxy_lock_key(slot))
    except Exception as exc:
        if _not_found(exc):
            return None
        raise
    try:
        payload = json.loads(response["Body"].read().decode("utf-8", "replace"))
    except Exception:
        payload = {}
    last_modified = response.get("LastModified")
    last_modified_ts = float(last_modified.timestamp()) if last_modified and hasattr(last_modified, "timestamp") else 0.0
    return {
        "payload": payload if isinstance(payload, dict) else {},
        "etag": str(response.get("ETag") or ""),
        "lastModified": last_modified_ts,
    }


def _write_job_marker(status: str, message: str, *, proxy_slot: int = 0, waited_seconds: int = 0):
    # Refresh requestedAt while waiting so the Worker does not treat a legitimately
    # queued GitHub job as stale and dispatch a duplicate workflow.
    payload = {
        "requestedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "videoId": VIDEO_ID,
        "sourceUrl": YOUTUBE_URL,
        "status": status,
        "mode": JOB_MODE,
        "message": message,
        "proxyPoolSize": len(PROXIES),
        "proxySlot": proxy_slot or None,
        "waitedSeconds": int(waited_seconds),
        "segment": {
            "start": SEGMENT_START_SECONDS,
            "duration": SEGMENT_DURATION_SECONDS,
        },
    }
    try:
        put_json(MARKER_KEY, payload)
    except Exception as exc:
        print(f"[proxy-queue] warning: could not refresh job marker: {exc}", flush=True)


def _slot_order():
    if not PROXIES:
        return []
    seed_text = f"{VIDEO_ID}|{OBJECT_KEY}|{JOB_MODE}|{SEGMENT_START_SECONDS:.3f}|{SEGMENT_DURATION_SECONDS:.3f}"
    digest = hashlib.sha256(seed_text.encode("utf-8")).digest()
    start = int.from_bytes(digest[:4], "big") % len(PROXIES)
    slots = list(range(1, len(PROXIES) + 1))
    return slots[start:] + slots[:start]


def acquire_proxy_lease():
    if not PROXIES:
        print("[proxy-queue] no proxy pool configured; using direct GitHub egress", flush=True)
        return None

    lease_id = uuid.uuid4().hex
    started = time.time()
    last_status_log = 0.0
    last_marker_refresh = 0.0
    slots = _slot_order()

    while True:
        now = time.time()
        states = []
        for slot in slots:
            proxy = PROXIES[slot - 1]
            payload = _proxy_lock_payload(
                slot,
                lease_id,
                "busy",
                now + YOUTUBE_PROXY_LEASE_SECONDS,
                acquiredAt=now,
            )
            try:
                etag = _put_proxy_lock(slot, payload, if_none_match=True)
                waited = int(now - started)
                print(f"[proxy-queue] acquired slot {slot}/{len(PROXIES)} after {waited}s", flush=True)
                _write_job_marker("processing", "YouTube proxy route assigned.", proxy_slot=slot, waited_seconds=waited)
                return {"slot": slot, "proxy": proxy, "leaseId": lease_id, "etag": etag, "key": _proxy_lock_key(slot)}
            except Exception as exc:
                if not _precondition_failed(exc):
                    raise

            current = _read_proxy_lock(slot)
            if current is None:
                continue
            current_payload = current.get("payload") or {}
            expires_at = float(current_payload.get("expiresAt") or 0.0)
            if expires_at <= 0:
                expires_at = float(current.get("lastModified") or 0.0) + YOUTUBE_PROXY_LEASE_SECONDS

            if expires_at <= now and current.get("etag"):
                try:
                    etag = _put_proxy_lock(slot, payload, if_match=current["etag"])
                    waited = int(now - started)
                    print(f"[proxy-queue] reclaimed expired slot {slot}/{len(PROXIES)} after {waited}s", flush=True)
                    _write_job_marker("processing", "YouTube proxy route assigned.", proxy_slot=slot, waited_seconds=waited)
                    return {"slot": slot, "proxy": proxy, "leaseId": lease_id, "etag": etag, "key": _proxy_lock_key(slot)}
                except Exception as exc:
                    if not _precondition_failed(exc):
                        raise
                    # Another job reclaimed it first.
                    continue

            state = str(current_payload.get("state") or "busy")
            states.append((slot, state, max(0, int(expires_at - now))))

        waited = now - started
        if waited >= YOUTUBE_PROXY_WAIT_SECONDS:
            raise RuntimeError(
                f"proxy-pool-timeout: all {len(PROXIES)} proxy IPs stayed busy/cooling for {int(waited)} seconds"
            )

        if now - last_status_log >= 15:
            summary = ", ".join(f"#{slot}:{state}:{seconds}s" for slot, state, seconds in states)
            print(f"[proxy-queue] all {len(PROXIES)} slots unavailable; waiting ({summary})", flush=True)
            last_status_log = now
        if now - last_marker_refresh >= 15:
            _write_job_marker(
                "waiting-proxy",
                f"Waiting for one of {len(PROXIES)} YouTube proxy routes.",
                waited_seconds=int(waited),
            )
            last_marker_refresh = now
        time.sleep(YOUTUBE_PROXY_POLL_SECONDS)


def proxy_cooldown_seconds(proxy_result: str, error_code: str = "", detail: str = "") -> int:
    text = f"{error_code} {detail}".lower()
    if "429" in text or "too many requests" in text:
        return YOUTUBE_PROXY_429_COOLDOWN_SECONDS
    if "youtube-bot-challenge" in text or "youtube-403" in text or "http error 403" in text or ("confirm you" in text and "not a bot" in text):
        return YOUTUBE_PROXY_BLOCK_COOLDOWN_SECONDS
    if proxy_result == "success":
        return YOUTUBE_PROXY_SUCCESS_COOLDOWN_SECONDS
    return YOUTUBE_PROXY_FAILURE_COOLDOWN_SECONDS


def release_proxy_lease(lease, *, proxy_result: str, error_code: str = "", detail: str = ""):
    if not lease:
        return
    cooldown = proxy_cooldown_seconds(proxy_result, error_code, detail)
    now = time.time()
    payload = _proxy_lock_payload(
        int(lease["slot"]),
        str(lease["leaseId"]),
        "cooldown",
        now + cooldown,
        releasedAt=now,
        cooldownSeconds=cooldown,
        proxyResult=proxy_result,
        errorCode=error_code,
        detail=redact(detail)[:2000],
    )
    try:
        etag = _put_proxy_lock(int(lease["slot"]), payload, if_match=str(lease.get("etag") or ""))
        lease["etag"] = etag
        print(f"[proxy-queue] slot {lease['slot']} cooling for {cooldown}s ({proxy_result}, {error_code or '-'})", flush=True)
    except Exception as exc:
        if _precondition_failed(exc):
            print(f"[proxy-queue] slot {lease['slot']} lease changed before release; leaving newer owner untouched", flush=True)
        else:
            print(f"[proxy-queue] warning: could not release slot {lease['slot']}: {exc}", flush=True)


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
assigned_proxy_errors = []
source_file = ""
winning_strategy = ""
winning_proxy = ""
PROXY_LEASE = None
ASSIGNED_PROXY = ""

try:
    PROXY_LEASE = acquire_proxy_lease()
    ASSIGNED_PROXY = str(PROXY_LEASE.get("proxy") or "") if PROXY_LEASE else ""
except Exception as exc:
    delete_key(MARKER_KEY)
    error_text = redact(str(exc))
    error_code = error_text.split(":", 1)[0] if ":" in error_text else "proxy-pool-failed"
    try:
        put_json(ERROR_KEY, {
            "ok": False,
            "videoId": VIDEO_ID,
            "sourceUrl": YOUTUBE_URL,
            "failedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "errorCode": error_code,
            "error": error_text,
            "proxyCount": len(PROXIES),
        })
    except Exception as upload_exc:
        print(f"[r2] could not upload proxy queue failure marker: {upload_exc}", file=sys.stderr, flush=True)
    raise

# A queued job owns exactly one static IP. It must not jump to another pooled IP
# because that other slot may be leased by another GitHub run. Direct GitHub
# egress remains a last fallback for the same job.
ROUTES = [ASSIGNED_PROXY] if ASSIGNED_PROXY else []
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
                if ASSIGNED_PROXY and proxy == ASSIGNED_PROXY:
                    assigned_proxy_errors.append(f"{strategy}: {details}")
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
            "proxySlot": PROXY_LEASE.get("slot") if PROXY_LEASE else None,
        }), flush=True)
        proxy_ok = bool(ASSIGNED_PROXY) and winning_proxy == proxy_label(ASSIGNED_PROXY)
        assigned_code = ""
        if ASSIGNED_PROXY and not proxy_ok and assigned_proxy_errors:
            assigned_code, _ = classify_failure(assigned_proxy_errors)
        release_proxy_lease(
            PROXY_LEASE,
            proxy_result="success" if proxy_ok else ("failed-fallback-direct" if ASSIGNED_PROXY else "direct"),
            error_code=assigned_code,
            detail=" | ".join(assigned_proxy_errors),
        )
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
        assigned_code = error_code
        if assigned_proxy_errors:
            assigned_code, _ = classify_failure(assigned_proxy_errors)
        release_proxy_lease(
            PROXY_LEASE,
            proxy_result="failed" if ASSIGNED_PROXY else "direct",
            error_code=assigned_code,
            detail=" | ".join(assigned_proxy_errors) or error_text,
        )
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
            if ASSIGNED_PROXY and proxy == ASSIGNED_PROXY:
                assigned_proxy_errors.append(f"{strategy}: {details}")
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
        "proxySlot": PROXY_LEASE.get("slot") if PROXY_LEASE else None,
        "segmentStartSeconds": SEGMENT_START_SECONDS,
        "segmentDurationSeconds": SEGMENT_DURATION_SECONDS,
    }), flush=True)
    proxy_ok = bool(ASSIGNED_PROXY) and winning_proxy == proxy_label(ASSIGNED_PROXY)
    assigned_code = ""
    if ASSIGNED_PROXY and not proxy_ok and assigned_proxy_errors:
        assigned_code, _ = classify_failure(assigned_proxy_errors)
    release_proxy_lease(
        PROXY_LEASE,
        proxy_result="success" if proxy_ok else ("failed-fallback-direct" if ASSIGNED_PROXY else "direct"),
        error_code=assigned_code,
        detail=" | ".join(assigned_proxy_errors),
    )

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
    assigned_code = error_code
    if assigned_proxy_errors:
        assigned_code, _ = classify_failure(assigned_proxy_errors)
    release_proxy_lease(
        PROXY_LEASE,
        proxy_result="failed" if ASSIGNED_PROXY else "direct",
        error_code=assigned_code,
        detail=" | ".join(assigned_proxy_errors) or error_text,
    )
    raise
