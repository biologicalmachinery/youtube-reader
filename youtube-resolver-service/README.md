# Facial Analysis YouTube Resolver

This is the small external service used only for **public YouTube URL resolution and byte-range streaming**. Facial detection, tracking, FACS/emotion statistics, and local-file processing stay in the browser.

The resolver keeps the critical YouTube steps together in one cloud service:

`Cloudflare Worker -> resolver -> yt-dlp + bgutil PO token -> GoogleVideo -> resolver -> Worker -> browser`

The signed GoogleVideo URL is never returned to the browser or Cloudflare Worker. That matters because YouTube may bind playback/token state to the resolver's request context.

## Security

`/stream` and `/resolve` require `X-Resolver-Secret` (or `Authorization: Bearer ...`). The service refuses to operate if `RESOLVER_SECRET` is missing. It accepts only a single YouTube watch/shorts/youtu.be URL and does not act as a general-purpose proxy.

It intentionally does **not** handle DRM, private/member-only media, or authenticated account content.

## Recommended deployment: Google Cloud Run

From PowerShell, `cd` into this folder.

### 1. Choose your Google Cloud project

```powershell
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

### 2. Generate a shared secret

```powershell
$RESOLVER_SECRET = python -c "import secrets; print(secrets.token_urlsafe(48))"
$RESOLVER_SECRET
```

Keep that value; the same value goes into Cloud Run and Cloudflare.

### 3. Deploy the Dockerfile directly from source

```powershell
gcloud run deploy facial-youtube-resolver `
  --source . `
  --region europe-west1 `
  --allow-unauthenticated `
  --memory 1Gi `
  --cpu 1 `
  --concurrency 4 `
  --timeout 300 `
  --set-env-vars "RESOLVER_SECRET=$RESOLVER_SECRET,TOKEN_TTL=6,RESOLVE_CACHE_TTL_SECONDS=180"
```

Cloud Run must be network-public because Cloudflare needs to call it, but the resolver endpoints themselves remain protected by the shared secret.

### 4. Get the deployed URL

```powershell
$RESOLVER_URL = gcloud run services describe facial-youtube-resolver `
  --region europe-west1 `
  --format="value(status.url)"
$RESOLVER_URL
```

### 5. Test the resolver before touching Cloudflare

```powershell
.\test-resolver.ps1 `
  -ResolverUrl $RESOLVER_URL `
  -Secret $RESOLVER_SECRET `
  -YouTubeUrl "https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
```

A working stream probe normally returns HTTP `206` and a `Content-Type` such as `video/mp4`.

## 6. Connect it to the Cloudflare Worker

In your existing Cloudflare project directory:

```powershell
npx wrangler secret put YOUTUBE_RESOLVER_URL
```

Paste the Cloud Run URL, then:

```powershell
npx wrangler secret put YOUTUBE_RESOLVER_SECRET
```

Paste the same `$RESOLVER_SECRET` value.

Deploy the patched `index.js`:

```powershell
npm run deploy
```

No change is required in `facial-analysis.html` or `facial-analysis-engine.js`; they continue calling `/api/facial-video-proxy`.

## 7. End-to-end probe through Cloudflare

Open:

```text
https://YOUR_DOMAIN/api/facial-video-proxy?probe=1&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DYOUR_VIDEO_ID
```

The JSON should report a successful upstream `206` and resolver `external-yt-dlp-bgutil`.

## Local Docker test (optional)

```powershell
docker build -t facial-youtube-resolver .
docker run --rm -p 8080:8080 -e "RESOLVER_SECRET=test-secret" facial-youtube-resolver
```

Then in another terminal:

```powershell
.\test-resolver.ps1 -ResolverUrl "http://localhost:8080" -Secret "test-secret" -YouTubeUrl "https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
```

## Notes

- yt-dlp's current YouTube guidance recommends a PO-token provider for `mweb` GVS playback; this image installs `bgutil-ytdlp-pot-provider` and uses its one-shot script mode.
- Script mode is simpler for a single Cloud Run container. For very high concurrency, the provider's persistent HTTP-server mode is faster, but that requires a sidecar/multi-service deployment.
- The resolver prefers <=720p H.264 MP4 because face analysis benefits more from reliable seeking and decode support than from 4K bandwidth.
- Cloud providers' IP ranges can still occasionally trigger YouTube anti-bot checks. The PO-token provider materially improves this, but no unauthenticated YouTube extractor can guarantee every public video indefinitely.
