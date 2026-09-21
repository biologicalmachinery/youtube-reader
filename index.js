
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }));
    }

    try {
      if (url.pathname === '/success') {
        return htmlResponse(injectStartupPreloaderMarkup(renderStatusPage('Payment success', 'Thank you very much! You should receive confirmation letter from Stripe soon!')));
      }

      if (url.pathname === '/cancel') {
        return htmlResponse(injectStartupPreloaderMarkup(renderStatusPage('Payment canceled', '')));
      }

      if (url.pathname === '/checkout-cancelled') {
        const appUrl = normalizeBaseUrl(env.APP_URL || url.origin);
        const returnUrl = safeSameOriginUrl(url.searchParams.get("return"), appUrl) || `${appUrl}/bitems/`;
        return htmlResponse(renderCheckoutClosePage('Payment canceled', 'Closing checkout…', returnUrl));
      }

      if (url.pathname === '/checkout-demo') {
        return htmlResponse(injectStartupPreloaderMarkup(renderStatusPage('Demo checkout', 'Stripe is not configured yet, so this template showed a demo checkout result.')));
      }

      if (url.pathname === '/api/health' && request.method === 'GET') {
        return json({ ok: true, app: env.APP_NAME || 'Cloudflare Starter', time: new Date().toISOString() });
      }


      // SEO analyzer proxy. The browser talks only to this Worker. The Worker
      // adds a private shared secret and forwards the request through the named
      // Cloudflare Tunnel to the Python API running on the host laptop.
      if (url.pathname === '/api/seo-health' && request.method === 'GET') {
        return await proxySeoAnalyzerRequest(request, env, '/api/health');
      }

      if (url.pathname === '/api/analyze' && request.method === 'POST') {
        return await proxySeoAnalyzerRequest(request, env, '/api/analyze');
      }

      if (url.pathname === '/api/progress' && request.method === 'GET') {
        return await proxySeoAnalyzerRequest(request, env, '/api/progress');
      }

      if (url.pathname === '/api/cancel' && request.method === 'POST') {
        return await proxySeoAnalyzerRequest(request, env, '/api/cancel');
      }

      if (url.pathname === '/api/pause' && request.method === 'POST') {
        return await proxySeoAnalyzerRequest(request, env, '/api/pause');
      }

      if (url.pathname === '/api/resume' && request.method === 'POST') {
        return await proxySeoAnalyzerRequest(request, env, '/api/resume');
      }

      if (url.pathname === '/api/similarity' && request.method === 'POST') {
        return await proxySeoAnalyzerRequest(request, env, '/api/similarity');
      }

      if (url.pathname === '/api/semantics' && request.method === 'POST') {
        return await proxySeoAnalyzerRequest(request, env, '/api/semantics');
      }

      if (url.pathname === '/api/semantic-progress' && request.method === 'GET') {
        return await proxySeoAnalyzerRequest(request, env, '/api/semantic-progress');
      }

      if (url.pathname === '/api/semantic-pause' && request.method === 'POST') {
        return await proxySeoAnalyzerRequest(request, env, '/api/semantic-pause');
      }

      if (url.pathname === '/api/semantic-resume' && request.method === 'POST') {
        return await proxySeoAnalyzerRequest(request, env, '/api/semantic-resume');
      }

      if (url.pathname === '/api/semantic-layout' && request.method === 'POST') {
        return await proxySeoAnalyzerRequest(request, env, '/api/semantic-layout');
      }

      if (url.pathname === '/api/history-video' && request.method === 'POST') {
        return await proxySeoAnalyzerRequest(request, env, '/api/history-video');
      }

      if (url.pathname === '/api/history-video-status' && request.method === 'GET') {
        return await proxySeoAnalyzerRequest(request, env, '/api/history-video-status');
      }

      if (url.pathname === '/api/history-video-download' && request.method === 'GET') {
        return await proxySeoAnalyzerRequest(request, env, '/api/history-video-download');
      }

      if (url.pathname === '/api/qprofile' && request.method === 'POST') {
        return await proxySeoAnalyzerRequest(request, env, '/api/qprofile');
      }

      if (url.pathname === '/api/qprofile-status' && request.method === 'GET') {
        return await proxySeoAnalyzerRequest(request, env, '/api/qprofile-status');
      }

      if (url.pathname === '/api/qprofile-download' && request.method === 'GET') {
        return await proxySeoAnalyzerRequest(request, env, '/api/qprofile-download');
      }

      // BlindVid downloader proxy. The public page stays in Cloudflare Assets;
      // only these API calls are sent through the named tunnel to the localhost backend.
      if (url.pathname === '/api/blindvid-health' && request.method === 'GET') {
        return await proxyBlindVidRequest(request, env, '/api/health');
      }

      // Keep this route on the Worker so it still works when the local
      // BlindVid backend or tunnel is unavailable.
      if (url.pathname === '/api/blindvid-call' && request.method === 'POST') {
        return withCors(await handleBlindVidCall(request, env));
      }

      if (url.pathname === '/api/blindvid-download' && request.method === 'POST') {
        return await proxyBlindVidRequest(request, env, '/api/download');
      }

      if (url.pathname === '/api/blindvid-status' && request.method === 'GET') {
        return await proxyBlindVidRequest(request, env, '/api/status');
      }

      if (url.pathname === '/api/blindvid-audio' && request.method === 'POST') {
        return await proxyBlindVidRequest(request, env, '/api/audio');
      }

      if (url.pathname === '/api/blindvid-transcribe' && request.method === 'POST') {
        return await proxyBlindVidRequest(request, env, '/api/transcribe');
      }

      if (url.pathname === '/api/blindvid-analyze' && request.method === 'POST') {
        return await proxyBlindVidRequest(request, env, '/api/analyze');
      }

      if (url.pathname === '/api/blindvid-describe' && request.method === 'POST') {
        return await proxyBlindVidRequest(request, env, '/api/describe');
      }

      if (url.pathname === '/api/blindvid-tts' && request.method === 'POST') {
        return await proxyBlindVidRequest(request, env, '/api/tts');
      }

      if (url.pathname === '/api/blindvid-tts-audio' && request.method === 'GET') {
        return await proxyBlindVidRequest(request, env, '/api/tts-audio');
      }

      if (url.pathname === '/api/blindvid-mix' && request.method === 'POST') {
        return await proxyBlindVidRequest(request, env, '/api/mix');
      }

      if (url.pathname === '/api/blindvid-mix-audio' && request.method === 'GET') {
        return await proxyBlindVidRequest(request, env, '/api/mix-audio');
      }

      if (url.pathname === '/api/blindvid-cancel' && request.method === 'POST') {
        return await proxyBlindVidRequest(request, env, '/api/cancel');
      }

      if (url.pathname === '/api/blindvid-transcript' && request.method === 'GET') {
        return await proxyBlindVidRequest(request, env, '/api/transcript');
      }

      if (url.pathname === '/api/blindvid-file' && request.method === 'GET') {
        return await proxyBlindVidRequest(request, env, '/api/file');
      }

      if (url.pathname === '/api/v112-health' && request.method === 'GET') {
        return await proxyV112RigRequest(request, env, '/api/health');
      }

      if (url.pathname === '/api/v112-run' && request.method === 'POST') {
        return await proxyV112RigRequest(request, env, '/api/run');
      }

      if (url.pathname === '/api/v112-status' && request.method === 'GET') {
        return await proxyV112RigRequest(request, env, '/api/status');
      }

      if (url.pathname === '/api/v112-result' && request.method === 'GET') {
        return await proxyV112RigRequest(request, env, '/api/result');
      }

      if (url.pathname === '/api/v112-cancel' && request.method === 'POST') {
        return await proxyV112RigRequest(request, env, '/api/cancel');
      }

      if (url.pathname === '/api/native-image/generate' && request.method === 'POST') {
        return withCors(await handleNativeImageGenerate(request, env));
      }


      if (url.pathname === '/api/techgroups' && request.method === 'GET') {
        return withCors(await handleListTechGroups(request, env));
      }

      if (url.pathname === '/api/techgroups' && request.method === 'POST') {
        return withCors(await handleCreateTechGroup(request, env));
      }

      if (url.pathname === '/api/techgroups/migrate-public' && request.method === 'POST') {
        return withCors(await handleMigratePublicTechGroups(request, env));
      }

      const techGroupDeleteMatch = url.pathname.match(/^\/api\/techgroups\/([^/]+)$/);
      if (techGroupDeleteMatch && request.method === 'DELETE') {
        return withCors(await handleDeleteTechGroup(request, env, techGroupDeleteMatch[1]));
      }

      const techGroupJoinMatch = url.pathname.match(/^\/api\/techgroups\/([^/]+)\/join$/);
      if (techGroupJoinMatch && request.method === 'POST') {
        return withCors(await handleJoinTechGroup(request, env, techGroupJoinMatch[1]));
      }

      const techGroupMessagesMatch = url.pathname.match(/^\/api\/techgroups\/([^/]+)\/messages$/);
      if (techGroupMessagesMatch && request.method === 'GET') {
        return withCors(await handleListTechGroupMessages(request, env, techGroupMessagesMatch[1]));
      }
      if (techGroupMessagesMatch && request.method === 'POST') {
        return withCors(await handleCreateTechGroupMessage(request, env, techGroupMessagesMatch[1]));
      }

      if (url.pathname === '/api/cinema/availability' && request.method === 'GET') {
        return withCors(await handleCinemaAvailability(request, env));
      }

      if (url.pathname === '/api/techgroups/socket' || url.pathname === '/api/cinema/socket') {
        return handleTechGroupSocket(request, env);
      }

      if (url.pathname === '/api/browser-route/session' && request.method === 'POST') {
        return withCors(await handleBrowserRouteSession(request, env));
      }

      if (url.pathname === '/api/newsletter/subscribe' && request.method === 'POST') {
        return withCors(await subscribeToNewsletter(request, env));
      }

      if (url.pathname === '/api/newsletter/unsubscribe' && request.method === 'POST') {
        return withCors(await unsubscribeFromNewsletter(request, env));
      }

      if (url.pathname === '/api/dance-newsletter/subscribe' && request.method === 'POST') {
        return withCors(await subscribeToDanceNewsletter(request, env));
      }

      if (url.pathname === '/api/dance-newsletter/unsubscribe' && request.method === 'POST') {
        return withCors(await unsubscribeFromDanceNewsletter(request, env));
      }

      const danceBeltSubscribeMatch = url.pathname.match(/^\/api\/dance-belt\/(release|development)\/subscribe$/);
      if (danceBeltSubscribeMatch && request.method === 'POST') {
        return withCors(await subscribeToDanceBeltList(request, env, danceBeltSubscribeMatch[1]));
      }

      const danceBeltUnsubscribeMatch = url.pathname.match(/^\/api\/dance-belt\/(release|development)\/unsubscribe$/);
      if (danceBeltUnsubscribeMatch && request.method === 'POST') {
        return withCors(await unsubscribeFromDanceBeltList(request, env, danceBeltUnsubscribeMatch[1]));
      }

      if (url.pathname === '/api/track' && request.method === 'POST') {
        return withCors(await trackActivity(request, env));
      }

      if (url.pathname === '/api/create-checkout' && request.method === 'POST') {
        return withCors(await createCheckoutSession(request, env));
      }

      if (url.pathname === '/api/stripe-webhook' && request.method === 'POST') {
        return await handleStripeWebhook(request, env);
      }

      if (url.pathname === '/api/purchases' && (request.method === 'GET' || request.method === 'POST')) {
        return withCors(await getPurchases(request, env));
      }

      if (url.pathname === "/api/contact" && request.method === "POST") {
        return withCors(await sendContactRequest(request, env));
      }

      if (url.pathname === '/api/movie-match' && request.method === 'POST') {
        return withCors(await handleMovieMatch(request, env));
      }

      if (url.pathname === '/api/painting-match' && request.method === 'POST') {
        return withCors(await handlePaintingMatch(request, env));
      }

      if (url.pathname === '/api/literature-match' && request.method === 'POST') {
        return withCors(await handleLiteratureMatch(request, env));
      }

      if (url.pathname === '/api/catalog-csv-chunk' && request.method === 'GET') {
        return withCors(await handleCatalogCsvChunk(request, env));
      }

      if (url.pathname === '/api/movie-watch-link' && request.method === 'POST') {
        return withCors(await handleMovieWatchLink(request, env));
      }

      if (url.pathname === '/api/regional-preview' && request.method === 'GET') {
        return await handleRegionalPreview(request, env);
      }

      if (url.pathname === '/api/regional-preview-image' && request.method === 'GET') {
        return await handleRegionalPreviewImage(request, env);
      }

      if (url.pathname === '/api/painting-image' && request.method === 'GET') {
        return await handlePaintingImageProxy(request, env);
      }

      if (url.pathname === '/api/literature-cover' && request.method === 'GET') {
        return await handleLiteratureCoverProxy(request, env);
      }

      if (url.pathname === '/api/literature-pdf' && request.method === 'GET') {
        return await handleLiteraturePdfProxy(request, env);
      }


      if (url.pathname === '/api/manga-colorizer/submit' && request.method === 'POST') {
        const authorization = await authorizeMangaColorizerRequest(request, env);
        if (!authorization.ok) return withCors(authorization.response);
        return withCors(await handleMangaColorizerSubmit(request, env, authorization));
      }

      const mangaStatusMatch = url.pathname.match(/^\/api\/manga-colorizer\/jobs\/([a-f0-9]{32})$/i);
      if (mangaStatusMatch && request.method === 'GET') {
        const authorization = await authorizeMangaColorizerRequest(request, env);
        if (!authorization.ok) return withCors(authorization.response);
        return withCors(await handleMangaColorizerStatus(mangaStatusMatch[1], env, authorization));
      }

      const mangaPdfMatch = url.pathname.match(/^\/api\/manga-colorizer\/jobs\/([a-f0-9]{32})\/pdf$/i);
      if (mangaPdfMatch && request.method === 'GET') {
        const authorization = await authorizeMangaColorizerRequest(request, env);
        if (!authorization.ok) return withCors(authorization.response);
        return withCors(await handleMangaColorizerPdf(mangaPdfMatch[1], env, authorization));
      }

      if (url.pathname === '/api/translation-languages' && request.method === 'GET') {
        return withCors(await handleTranslationLanguages(request, env));
      }

      if (url.pathname === '/api/translate-text' && request.method === 'POST') {
        return withCors(await handleTranslateText(request, env));
      }

      if (url.pathname === '/api/detect-language' && request.method === 'POST') {
        return withCors(await handleDetectLanguage(request, env));
      }

      if (url.pathname === '/api/literature-tts' && request.method === 'POST') {
        return withCors(await handleLiteratureTts(request, env));
      }

      if (url.pathname === '/api/literature-image' && request.method === 'POST') {
        return withCors(await handleLiteratureImageGeneration(request, env));
      }


      if (url.pathname === '/api/pixel-match-video/access' && request.method === 'GET') {
        return withCors(await handlePixelMatchVideoAccess(request, env));
      }

      if (url.pathname === '/api/pixel-match-video/generate' && request.method === 'POST') {
        return withCors(await handlePixelMatchVideoGenerate(request, env));
      }

      if (url.pathname === '/api/pixel-match-video/cancel' && request.method === 'POST') {
        return withCors(await handlePixelMatchVideoCancel(request, env));
      }

      if (url.pathname === '/api/pixel-match-video/status' && request.method === 'GET') {
        return withCors(await handlePixelMatchVideoStatus(request, env));
      }


      // Browser facial analyzer URL resolver + media proxy. Provider page URLs
      // (currently YouTube) are resolved to a temporary playable stream first;
      // direct video/media URLs pass through unchanged.
      if (url.pathname === '/api/facial-video-resolve' && request.method === 'GET') {
        return await handleFacialVideoResolve(request, env);
      }

      if (url.pathname === '/api/facial-video-proxy' && (request.method === 'GET' || request.method === 'HEAD')) {
        return await handleFacialVideoProxy(request, env);
      }

      if (url.pathname.startsWith("/api/")) {
        return json({ ok: false, error: "API route not found" }, 404);
      }
      // Static pages and files are served from /public by the ASSETS binding.
      const assetResponse = await serveAssetWithStartupPreloader(request, env);
      if (assetResponse.ok && isCinemaRoomPageNavigation(request, url)) {
        const joinTask = recordCinemaRoomNavigationJoin(url, env).catch((error) => {
          console.warn('Could not record cinema room entry:', error?.message || error);
        });
        if (ctx?.waitUntil) ctx.waitUntil(joinTask);
        else await joinTask;
      }
      return assetResponse;
    } catch (error) {
      console.error(error);
      return json({ ok: false, error: error.message || 'Server error' }, 500);
    }
  },

  async scheduled(_event, env, ctx) {
    ctx.waitUntil(Promise.all([
      sendCommunityNewsletterUpdates(env),
      sendDanceNewsletterUpdates(env)
    ]));
  }
};


function clampNativeImageInteger(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(number)));
}

function snapNativeImageDimension(value, fallback = 1024) {
  const clamped = clampNativeImageInteger(value, 256, 2048, fallback);
  return Math.min(2048, Math.max(256, Math.round(clamped / 64) * 64));
}

async function handleNativeImageGenerate(request, env = {}) {
  const body = await safeJson(request);

  const prompt = String(body?.prompt || '').trim().slice(0, 5000);
  if (!prompt) {
    return json({ ok: false, error: 'An image prompt is required.' }, 400, {
      'Cache-Control': 'no-store',
    });
  }

  const mode = String(body?.mode || 'normal').trim().toLowerCase() === 'adult'
    ? 'adult'
    : 'normal';
  const width = snapNativeImageDimension(body?.width, 1024);
  const height = snapNativeImageDimension(body?.height, 1024);
  const seed = clampNativeImageInteger(body?.seed, 0, 2147483647, 777);
  const steps = clampNativeImageInteger(body?.steps, 1, 50, 24);
  const requestedGuidance = Number(body?.guidance_scale);
  const guidanceScale = Number.isFinite(requestedGuidance)
    ? Math.min(15, Math.max(0, requestedGuidance))
    : 5.0;

  const upstreamUrl = String(env.NATIVE_IMAGE_AWS_API_URL || '').trim();
  if (!upstreamUrl) {
    return json({
      ok: false,
      error: 'Native image generation is not configured. Set NATIVE_IMAGE_AWS_API_URL to the publicly reachable FLUX /generate endpoint.',
    }, 503, {
      'Cache-Control': 'no-store',
    });
  }

  const headers = new Headers({
    'Accept': 'image/png',
    'Content-Type': 'application/json',
  });

  const apiKey = String(env.NATIVE_IMAGE_AWS_API_KEY || '').trim();
  if (apiKey) headers.set('Authorization', `Bearer ${apiKey}`);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        mode,
        // Kept for compatibility with an earlier FLUX API variant.
        safety_mode: mode === 'adult' ? 'permissive' : 'strict',
        width,
        height,
        seed,
        steps,
        guidance_scale: guidanceScale,
      }),
    });

    if (!upstream.ok) {
      const contentType = upstream.headers.get('Content-Type') || '';
      let errorMessage = `FLUX generation endpoint failed (${upstream.status}).`;

      if (/application\/json/i.test(contentType)) {
        const payload = await upstream.json().catch(() => ({}));
        errorMessage = payload?.detail || payload?.error || payload?.message || errorMessage;
      } else {
        const text = await upstream.text().catch(() => '');
        if (text.trim()) errorMessage = text.trim().slice(0, 1000);
      }

      return json({
        ok: false,
        error: errorMessage,
        upstreamStatus: upstream.status,
      }, upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502, {
        'Cache-Control': 'no-store',
      });
    }

    const contentType = upstream.headers.get('Content-Type') || '';
    if (!/^image\//i.test(contentType)) {
      const text = await upstream.text().catch(() => '');
      return json({
        ok: false,
        error: text.trim() || 'FLUX returned a non-image response.',
      }, 502, {
        'Cache-Control': 'no-store',
      });
    }

    const responseHeaders = new Headers({
      'Content-Type': contentType || 'image/png',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });

    for (const name of [
      'X-Generation-Seconds',
      'X-Seed',
      'X-Model',
      'X-Service',
      'X-Operation',
    ]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }

    responseHeaders.set('X-Native-Image-Mode', mode);
    responseHeaders.set('X-Native-Image-Width', String(width));
    responseHeaders.set('X-Native-Image-Height', String(height));
    responseHeaders.set('X-Native-Image-Steps', String(steps));

    return new Response(upstream.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    return json({
      ok: false,
      error: error?.message || 'Could not reach the FLUX image-generation endpoint.',
    }, 502, {
      'Cache-Control': 'no-store',
    });
  }
}




const FACIAL_YOUTUBE_TIMEOUT_MS = 12000;
const FACIAL_YOUTUBE_CHUNK_BYTES = 8 * 1024 * 1024;

// Keep YouTube resolution deliberately lightweight in the Worker. We call
// YouTube's own InnerTube /player endpoint with mobile clients that return
// plain stream URLs, avoiding youtubei.js player-JS retrieval/deciphering.
const FACIAL_YOUTUBE_CLIENTS = [
  {
    name: 'ANDROID_VR',
    version: '1.65.10',
    id: '28',
    userAgent: 'com.google.android.apps.youtube.vr.oculus/1.65.10 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip',
    extra: { androidSdkVersion: 32 },
  },
  {
    name: 'ANDROID',
    version: '21.03.36',
    id: '3',
    userAgent: 'com.google.android.youtube/21.03.36 (Linux; U; Android 14) gzip',
    extra: { androidSdkVersion: 34 },
  },
  {
    name: 'IOS',
    version: '21.03.2',
    id: '5',
    userAgent: 'com.google.ios.youtube/21.03.2 (iPhone16,2; U; CPU iOS 18_3 like Mac OS X)',
    extra: { deviceMake: 'Apple', deviceModel: 'iPhone16,2', osName: 'iPhone', osVersion: '18.3.0.22D63' },
  },
];

function facialAbortSignal(timeoutMs = FACIAL_YOUTUBE_TIMEOUT_MS, upstreamSignal = null) {
  const timeoutSignal = typeof AbortSignal?.timeout === 'function'
    ? AbortSignal.timeout(timeoutMs)
    : null;
  if (!upstreamSignal) return timeoutSignal || undefined;
  if (!timeoutSignal) return upstreamSignal;
  if (typeof AbortSignal?.any === 'function') {
    return AbortSignal.any([upstreamSignal, timeoutSignal]);
  }
  return timeoutSignal;
}

function facialRandomPlaybackNonce(length = 16) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

function extractFacialYouTubeVideoId(raw = '') {
  let parsed;
  try { parsed = new URL(String(raw || '').trim()); }
  catch (_) { return ''; }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  let candidate = '';
  if (host === 'youtu.be') {
    candidate = parsed.pathname.split('/').filter(Boolean)[0] || '';
  } else if (
    host === 'youtube.com' ||
    host.endsWith('.youtube.com') ||
    host === 'youtube-nocookie.com' ||
    host.endsWith('.youtube-nocookie.com')
  ) {
    candidate = parsed.searchParams.get('v') || '';
    if (!candidate) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (['shorts', 'embed', 'live', 'v'].includes(String(parts[0] || '').toLowerCase())) {
        candidate = parts[1] || '';
      }
    }
  }
  candidate = String(candidate || '').trim();
  return /^[A-Za-z0-9_-]{11}$/.test(candidate) ? candidate : '';
}

function facialYouTubeFormatScore(format = {}) {
  const mime = String(format?.mimeType || '').toLowerCase();
  const hasVideo = mime.includes('video/');
  const mp4 = mime.includes('video/mp4');
  const avc = /avc1|h264/i.test(mime);
  const hasAudio = /audio\//i.test(mime) || /mp4a|opus|vorbis/i.test(mime) || Number(format?.audioChannels) > 0;
  const height = Number(format?.height) || 0;
  const bitrate = Number(format?.bitrate) || 0;
  const itag = Number(format?.itag) || 0;
  if (!hasVideo || !format?.url) return -1e9;
  let score = 0;
  if (itag === 18) score += 100000;
  if (mp4) score += 30000;
  if (avc) score += 20000;
  if (hasAudio) score += 15000;
  // Facial analysis does not benefit much from >720p; prefer modest files.
  if (height > 0 && height <= 720) score += 10000 - Math.abs(480 - height) * 4;
  else if (height > 720) score += 3000 - Math.min(2500, height - 720);
  score += Math.min(2000, bitrate / 10000);
  return score;
}

function chooseFacialYouTubeFormat(player = {}) {
  const streaming = player?.streamingData || {};
  const formats = [
    ...(Array.isArray(streaming.formats) ? streaming.formats : []),
    ...(Array.isArray(streaming.adaptiveFormats) ? streaming.adaptiveFormats : []),
  ].filter((f) => f && typeof f.url === 'string' && f.url.startsWith('http'));
  formats.sort((a, b) => facialYouTubeFormatScore(b) - facialYouTubeFormatScore(a));
  return formats[0] || null;
}

async function fetchFacialYouTubePlayer(videoId, client) {
  const endpoint = new URL('https://www.youtube.com/youtubei/v1/player');
  endpoint.searchParams.set('prettyPrint', 'false');
  const cpn = facialRandomPlaybackNonce(16);
  const body = {
    videoId,
    contentCheckOk: true,
    racyCheckOk: true,
    context: {
      client: {
        hl: 'en',
        gl: 'US',
        clientName: client.name,
        clientVersion: client.version,
        userAgent: client.userAgent,
        ...(client.extra || {}),
      },
    },
    playbackContext: {
      contentPlaybackContext: {
        html5Preference: 'HTML5_PREF_WANTS',
      },
    },
  };

  const response = await fetch(endpoint.href, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': client.userAgent,
      'X-YouTube-Client-Name': client.id,
      'X-YouTube-Client-Version': client.version,
      'Origin': 'https://www.youtube.com',
      'Referer': 'https://www.youtube.com/',
    },
    body: JSON.stringify(body),
    signal: facialAbortSignal(FACIAL_YOUTUBE_TIMEOUT_MS),
  });

  const text = await response.text();
  let payload = {};
  try { payload = JSON.parse(text); } catch (_) {}
  if (!response.ok) {
    throw new Error(`InnerTube ${client.name} returned HTTP ${response.status}.`);
  }
  return { payload, cpn };
}

async function resolveFacialYouTubeVideo(rawUrl, { variant = 0 } = {}) {
  const videoId = extractFacialYouTubeVideoId(rawUrl);
  if (!videoId) return null;

  let lastError = null;
  for (let i = 0; i < FACIAL_YOUTUBE_CLIENTS.length; i += 1) {
    const client = FACIAL_YOUTUBE_CLIENTS[(i + variant) % FACIAL_YOUTUBE_CLIENTS.length];
    try {
      const { payload, cpn } = await fetchFacialYouTubePlayer(videoId, client);
      const status = String(payload?.playabilityStatus?.status || '');
      if (status && status !== 'OK') {
        const reason = String(payload?.playabilityStatus?.reason || status);
        throw new Error(`${client.name}: ${reason}`);
      }
      const format = chooseFacialYouTubeFormat(payload);
      if (!format?.url) throw new Error(`${client.name}: no direct video URL was returned.`);

      const target = validateFacialVideoRemoteUrl(format.url);
      if (!target.searchParams.has('cpn')) target.searchParams.set('cpn', cpn);
      if (target.searchParams.get('alr') === 'yes') target.searchParams.set('alr', 'no');

      const contentLength = Number(format?.contentLength || 0) || Number(target.searchParams.get('clen') || 0) || 0;
      return {
        provider: 'youtube',
        resolver: 'innertube-lite',
        client: client.name,
        videoId,
        mediaUrl: target.href,
        itag: Number(format?.itag || 0) || null,
        mimeType: String(format?.mimeType || ''),
        contentLength: contentLength > 0 ? contentLength : null,
        width: Number(format?.width) || null,
        height: Number(format?.height) || null,
        quality: String(format?.qualityLabel || format?.quality || (format?.height ? `${format.height}p` : '')),
      };
    } catch (error) {
      lastError = error;
    }
  }

  const detail = String(lastError?.message || '').trim();
  throw new Error(detail
    ? `YouTube was recognized, but no direct browser-playable stream could be resolved: ${detail}`
    : 'YouTube was recognized, but no direct browser-playable stream could be resolved.');
}

function facialProxyUrlFor(requestUrl, sourceUrl) {
  const base = new URL(requestUrl);
  base.pathname = '/api/facial-video-proxy';
  base.search = '';
  base.searchParams.set('url', sourceUrl);
  return `${base.pathname}${base.search}`;
}

async function handleFacialVideoResolve(request, env = {}) {
  const incoming = new URL(request.url);
  const raw = String(incoming.searchParams.get('url') || '').trim();
  if (!raw) {
    return withCors(json({ ok: false, error: 'Missing video URL.' }, 400, { 'Cache-Control': 'no-store' }));
  }

  let source;
  try {
    source = validateFacialVideoRemoteUrl(raw);
  } catch (error) {
    return withCors(json({ ok: false, error: error?.message || 'Invalid video URL.' }, 400, { 'Cache-Control': 'no-store' }));
  }

  const videoId = extractFacialYouTubeVideoId(source.href);
  if (videoId) {
    // IMPORTANT: keep the original YouTube URL in the proxy URL. Do not resolve
    // it here and carry a signed googlevideo URL into another Worker request.
    // Signed media URLs can be tied to the egress path that resolved them.
    return withCors(json({
      ok: true,
      provider: 'youtube',
      videoId,
      proxyUrl: facialProxyUrlFor(request.url, source.href),
    }, 200, { 'Cache-Control': 'no-store' }));
  }

  return withCors(json({
    ok: true,
    provider: 'direct',
    proxyUrl: facialProxyUrlFor(request.url, source.href),
  }, 200, { 'Cache-Control': 'no-store' }));
}


function isBlockedFacialVideoHostname(hostname = '') {
  const host = String(hostname || '').trim().toLowerCase().replace(/\.$/, '');
  if (!host) return true;
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return true;

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const octets = ipv4.slice(1).map(Number);
    if (octets.some(n => n < 0 || n > 255)) return true;
    const [a, b] = octets;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
  }

  const bare = host.replace(/^\[/, '').replace(/\]$/, '');
  if (bare === '::1' || bare === '::' || /^fe[89ab][0-9a-f]:/i.test(bare) || /^f[cd][0-9a-f]{2}:/i.test(bare)) return true;
  return false;
}

function validateFacialVideoRemoteUrl(raw = '') {
  let parsed;
  try {
    parsed = new URL(String(raw || '').trim());
  } catch (_) {
    throw new Error('A valid remote video URL is required.');
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Only HTTP/HTTPS media URLs are supported.');
  }
  if (parsed.username || parsed.password) {
    throw new Error('Video URLs containing usernames or passwords are not allowed.');
  }
  if (isBlockedFacialVideoHostname(parsed.hostname)) {
    throw new Error('Local/private network video URLs are not allowed.');
  }
  return parsed;
}

async function fetchFacialVideoRemote(initialUrl, init = {}, maxRedirects = 6) {
  let current = validateFacialVideoRemoteUrl(initialUrl);
  for (let redirects = 0; redirects <= maxRedirects; redirects += 1) {
    const requestInit = { ...init, redirect: 'manual' };
    requestInit.signal = facialAbortSignal(20000, init?.signal || null);
    const upstream = await fetch(current.href, requestInit);
    if (![301, 302, 303, 307, 308].includes(upstream.status)) {
      return { upstream, finalUrl: current };
    }
    const location = upstream.headers.get('Location');
    if (!location) return { upstream, finalUrl: current };
    current = validateFacialVideoRemoteUrl(new URL(location, current).href);
  }
  throw new Error('Too many redirects while opening the remote video.');
}

function isRetryableFacialYouTubeStatus(status) {
  return [403, 408, 409, 410, 425, 429, 500, 502, 503, 504].includes(Number(status));
}

function parseFacialByteRange(value = '', totalLength = 0) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const first = raw.split(',', 1)[0].trim();
  const match = first.match(/^bytes=(\d*)-(\d*)$/i);
  if (!match) return null;
  const total = Number(totalLength) || 0;
  let start = match[1] ? Number(match[1]) : null;
  let end = match[2] ? Number(match[2]) : null;
  if (start == null && end != null && total > 0) {
    const suffix = Math.max(0, end);
    start = Math.max(0, total - suffix);
    end = Math.max(start, total - 1);
  }
  if (start == null) return null;
  start = Math.max(0, Math.trunc(start));
  if (total > 0 && start >= total) return { unsatisfied: true, start, end: start, total };
  if (end == null || !Number.isFinite(end)) end = start + FACIAL_YOUTUBE_CHUNK_BYTES - 1;
  end = Math.max(start, Math.trunc(end));
  end = Math.min(end, start + FACIAL_YOUTUBE_CHUNK_BYTES - 1);
  if (total > 0) end = Math.min(end, total - 1);
  return { start, end, total: total > 0 ? total : null };
}

function parseFacialContentRange(value = '') {
  const match = String(value || '').match(/bytes\s+(\d+)-(\d+)\/(\d+|\*)/i);
  if (!match) return null;
  return {
    start: Number(match[1]),
    end: Number(match[2]),
    total: match[3] === '*' ? null : Number(match[3]),
  };
}

function facialYouTubeMediaHeaders(request) {
  return new Headers({
    'Accept': request.headers.get('Accept') || 'video/mp4,video/*;q=0.9,*/*;q=0.5',
    'Referer': 'https://www.youtube.com/',
    'Origin': 'https://www.youtube.com',
    'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
  });
}

function rangedFacialYouTubeUrl(mediaUrl, start, end) {
  const target = new URL(mediaUrl);
  // googlevideo streaming supports byte windows via the range query parameter.
  // Keep each upstream chunk below 10 MiB to avoid throttling/stalling.
  target.searchParams.set('range', `${start}-${end}`);
  return target.href;
}

function getFacialYouTubeResolverConfig(env = {}) {
  const baseUrl = String(env.YOUTUBE_RESOLVER_URL || '').trim().replace(/\/+$/, '');
  const secret = String(env.YOUTUBE_RESOLVER_SECRET || '').trim();
  return { baseUrl, secret };
}

async function openExternalFacialYouTubeStream(originalUrl, request, env = {}, { probe = false } = {}) {
  const { baseUrl, secret } = getFacialYouTubeResolverConfig(env);
  if (!baseUrl) throw new Error('YOUTUBE_RESOLVER_URL is not configured.');
  if (!secret) throw new Error('YOUTUBE_RESOLVER_SECRET is not configured.');

  let resolverBase;
  try {
    resolverBase = new URL(baseUrl);
  } catch (_) {
    throw new Error('YOUTUBE_RESOLVER_URL is invalid.');
  }
  if (resolverBase.protocol !== 'https:' && resolverBase.hostname !== 'localhost' && resolverBase.hostname !== '127.0.0.1') {
    throw new Error('YOUTUBE_RESOLVER_URL must use HTTPS.');
  }

  const target = new URL('/stream', resolverBase);
  target.searchParams.set('url', originalUrl);
  if (probe) target.searchParams.set('probe', '1');

  const headers = new Headers();
  headers.set('X-Resolver-Secret', secret);
  headers.set('Accept', request.headers.get('Accept') || 'video/mp4,video/*;q=0.9,*/*;q=0.5');
  const range = probe ? 'bytes=0-0' : request.headers.get('Range');
  if (range) headers.set('Range', range);
  const ifRange = request.headers.get('If-Range');
  if (ifRange && !probe) headers.set('If-Range', ifRange);

  let upstream;
  try {
    upstream = await fetch(target.href, {
      method: request.method === 'HEAD' ? 'HEAD' : 'GET',
      headers,
      redirect: 'manual',
      signal: facialAbortSignal(120000, request.signal),
    });
  } catch (error) {
    throw new Error(`External YouTube resolver is unreachable: ${error?.message || error}`);
  }

  if (![200, 206, 416].includes(upstream.status)) {
    const contentType = upstream.headers.get('Content-Type') || '';
    let detail = '';
    try {
      if (/application\/json/i.test(contentType)) {
        const payload = await upstream.json();
        detail = String(payload?.error || payload?.detail || payload?.message || '').trim();
      } else {
        detail = (await upstream.text()).trim().slice(0, 1200);
      }
    } catch (_) {}
    throw new Error(`External YouTube resolver returned HTTP ${upstream.status}${detail ? `: ${detail}` : '.'}`);
  }

  const byteRange = parseFacialContentRange(upstream.headers.get('Content-Range'));
  const contentLength = Number(upstream.headers.get('Content-Length') || 0) || null;
  const resolved = {
    provider: 'youtube',
    resolver: 'external-yt-dlp-bgutil',
    client: 'yt-dlp-mweb',
    videoId: extractFacialYouTubeVideoId(originalUrl),
    mediaUrl: target.href,
    itag: upstream.headers.get('X-Resolver-Format-Id') || null,
    mimeType: upstream.headers.get('Content-Type') || 'video/mp4',
    contentLength: byteRange?.total || contentLength,
    quality: '',
  };
  return {
    upstream,
    finalUrl: target,
    resolved,
    attempts: 1,
    byteRange,
  };
}

async function openFacialYouTubeStream(originalUrl, request, { probe = false } = {}) {
  let lastStatus = 0;
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const resolved = await resolveFacialYouTubeVideo(originalUrl, {
        variant: attempt,
      });
      const totalHint = Number(resolved?.contentLength) || 0;
      let requestedRange = probe
        ? { start: 0, end: 0, total: totalHint || null }
        : parseFacialByteRange(request.headers.get('Range'), totalHint);

      if (requestedRange?.unsatisfied) {
        return {
          upstream: new Response(null, { status: 416 }),
          finalUrl: new URL(resolved.mediaUrl),
          resolved,
          attempts: attempt + 1,
          byteRange: requestedRange,
        };
      }
      if (!requestedRange) {
        const end = totalHint > 0
          ? Math.min(totalHint - 1, FACIAL_YOUTUBE_CHUNK_BYTES - 1)
          : FACIAL_YOUTUBE_CHUNK_BYTES - 1;
        requestedRange = { start: 0, end, total: totalHint || null };
      }

      const headers = facialYouTubeMediaHeaders(request);
      const rangedUrl = rangedFacialYouTubeUrl(resolved.mediaUrl, requestedRange.start, requestedRange.end);
      const result = await fetchFacialVideoRemote(rangedUrl, {
        method: 'GET',
        headers,
      });
      lastStatus = result.upstream.status;
      if (!isRetryableFacialYouTubeStatus(lastStatus)) {
        const upstreamRange = parseFacialContentRange(result.upstream.headers.get('Content-Range'));
        const upstreamLength = Number(result.upstream.headers.get('Content-Length')) || 0;
        const actualStart = upstreamRange?.start ?? requestedRange.start;
        const actualEnd = upstreamRange?.end ?? (upstreamLength > 0 ? actualStart + upstreamLength - 1 : requestedRange.end);
        const actualTotal = (upstreamRange?.total ?? requestedRange.total ?? totalHint) || null;
        return {
          ...result,
          resolved,
          attempts: attempt + 1,
          byteRange: { start: actualStart, end: actualEnd, total: actualTotal },
        };
      }
      try { await result.upstream.body?.cancel(); } catch (_) {}
      lastError = new Error(`GoogleVideo returned ${lastStatus}.`);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(lastError?.message || (lastStatus ? `GoogleVideo returned ${lastStatus}.` : 'YouTube media could not be opened.'));
}


async function handleFacialVideoProxy(request, env = {}) {
  const incoming = new URL(request.url);
  const raw = String(incoming.searchParams.get('url') || '').trim();
  const probe = incoming.searchParams.get('probe') === '1';
  if (!raw) {
    return withCors(json({ ok: false, error: 'Missing video URL.' }, 400, { 'Cache-Control': 'no-store' }));
  }

  let source;
  try {
    source = validateFacialVideoRemoteUrl(raw);
  } catch (error) {
    return withCors(json({ ok: false, error: error?.message || 'Invalid video URL.' }, 400, { 'Cache-Control': 'no-store' }));
  }

  const youtubeId = extractFacialYouTubeVideoId(source.href);

  try {
    let upstream, finalUrl, provider = 'direct', resolved = null, attempts = 1, youtubeByteRange = null;

    if (youtubeId) {
      provider = 'youtube';
      const externalConfig = getFacialYouTubeResolverConfig(env);
      const opened = externalConfig.baseUrl
        ? await openExternalFacialYouTubeStream(source.href, request, env, { probe })
        : await openFacialYouTubeStream(source.href, request, { probe });
      upstream = opened.upstream;
      finalUrl = opened.finalUrl;
      resolved = opened.resolved;
      attempts = opened.attempts;
      youtubeByteRange = opened.byteRange || null;
    } else {
      const headers = new Headers({
        'Accept': request.headers.get('Accept') || 'video/*,audio/*;q=0.9,*/*;q=0.5',
      });
      const range = probe ? 'bytes=0-0' : request.headers.get('Range');
      const ifRange = request.headers.get('If-Range');
      if (range) headers.set('Range', range);
      if (ifRange && !probe) headers.set('If-Range', ifRange);
      const opened = await fetchFacialVideoRemote(source.href, {
        method: probe ? 'GET' : (request.method === 'HEAD' ? 'HEAD' : 'GET'),
        headers,
      });
      upstream = opened.upstream;
      finalUrl = opened.finalUrl;
    }

    const contentType = upstream.headers.get('Content-Type') || '';

    if (probe) {
      const ok = upstream.ok || upstream.status === 206;
      const payload = {
        ok,
        provider,
        videoId: youtubeId || null,
        upstreamStatus: upstream.status,
        contentType,
        contentLength: upstream.headers.get('Content-Length') || null,
        acceptRanges: provider === 'youtube' ? 'bytes' : (upstream.headers.get('Accept-Ranges') || null),
        contentRange: youtubeByteRange ? `bytes ${youtubeByteRange.start}-${youtubeByteRange.end}/${youtubeByteRange.total ?? '*'}` : (upstream.headers.get('Content-Range') || null),
        quality: resolved?.quality || '',
        resolver: resolved?.resolver || '',
        youtubeClient: resolved?.client || '',
        itag: resolved?.itag || null,
        attempts,
        upstreamHost: finalUrl?.hostname || '',
        error: ok ? null : `Remote media returned HTTP ${upstream.status}.`,
      };
      try { await upstream.body?.cancel(); } catch (_) {}
      return withCors(json(payload, ok ? 200 : 502, { 'Cache-Control': 'no-store' }));
    }

    if (/^text\/html\b/i.test(contentType)) {
      try { await upstream.body?.cancel(); } catch (_) {}
      return withCors(json({
        ok: false,
        error: 'This URL returned HTML rather than playable video media.',
      }, 415, { 'Cache-Control': 'no-store' }));
    }

    const responseHeaders = new Headers();
    for (const name of [
      'Content-Type',
      'Content-Length',
      'Content-Range',
      'Accept-Ranges',
      'ETag',
      'Last-Modified',
      'Content-Encoding',
    ]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    if (provider === 'youtube' && youtubeByteRange) {
      const upstreamLength = Number(upstream.headers.get('Content-Length')) || Math.max(0, youtubeByteRange.end - youtubeByteRange.start + 1);
      const total = youtubeByteRange.total ?? resolved?.contentLength ?? null;
      responseHeaders.set('Accept-Ranges', 'bytes');
      responseHeaders.set('Content-Range', `bytes ${youtubeByteRange.start}-${youtubeByteRange.end}/${total ?? '*'}`);
      if (upstreamLength > 0) responseHeaders.set('Content-Length', String(upstreamLength));
      if (!responseHeaders.get('Content-Type') && resolved?.mimeType) responseHeaders.set('Content-Type', resolved.mimeType);
    }
    responseHeaders.set('Cache-Control', 'no-store');
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('Cross-Origin-Resource-Policy', 'cross-origin');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, ETag, Last-Modified, X-Facial-Video-Provider, X-Facial-Video-Attempts, X-Facial-Video-Resolver');
    responseHeaders.set('X-Facial-Video-Upstream', finalUrl.hostname);
    responseHeaders.set('X-Facial-Video-Provider', provider);
    responseHeaders.set('X-Facial-Video-Attempts', String(attempts));
    responseHeaders.set('X-Facial-Video-Resolver', resolved?.resolver || (provider === 'youtube' ? 'innertube-lite' : 'direct'));

    const responseStatus = provider === 'youtube' && youtubeByteRange
      ? (youtubeByteRange.unsatisfied ? 416 : 206)
      : upstream.status;
    return new Response(request.method === 'HEAD' ? null : upstream.body, {
      status: responseStatus,
      statusText: responseStatus === upstream.status ? upstream.statusText : undefined,
      headers: responseHeaders,
    });
  } catch (error) {
    console.warn('[facial-video-proxy] upstream unavailable:', error?.message || error);
    return withCors(json({
      ok: false,
      error: error?.name === 'TimeoutError'
        ? 'Timed out while resolving or opening the YouTube stream.'
        : (error?.message || 'Could not reach the remote video.'),
      provider: youtubeId ? 'youtube' : 'direct',
    }, 502, { 'Cache-Control': 'no-store' }));
  }
}


async function getPixelMatchVideoAccess(request, env = {}) {
  const idToken = getFirebaseBearerToken(request);
  if (!idToken) {
    return { ok: true, authenticated: false, user: null, claims: null };
  }

  const authentication = await verifyFirebaseAuthenticatedRequest(request, env);
  if (!authentication.ok) {
    return { ok: false, authenticated: false, response: authentication.response };
  }

  return {
    ok: true,
    authenticated: true,
    user: authentication.user,
    claims: authentication.claims,
  };
}

async function handlePixelMatchVideoAccess(request, env = {}) {
  const access = await getPixelMatchVideoAccess(request, env);
  if (!access.ok && access.response) return access.response;

  return json({
    ok: true,
    authenticated: Boolean(access.authenticated),
    limits: {
      guest_max_duration_seconds: 5,
      signed_in_max_duration_seconds: 3600,
      high_director_quality_requires_sign_in: true,
    },
  }, 200, {
    'Cache-Control': 'no-store',
  });
}

async function handlePixelMatchVideoGenerate(request, env = {}) {
  const body = await safeJson(request);
  const prompt = String(body?.prompt || '').trim();
  const settings = body?.settings && typeof body.settings === 'object' && !Array.isArray(body.settings)
    ? body.settings
    : {};

  if (!prompt) {
    return json({ ok: false, error: 'A video prompt is required.' }, 400, {
      'Cache-Control': 'no-store',
    });
  }

  const rawDuration = Number(settings?.duration);
  // Mirror the AWS/Lambda defaults when a caller omits or corrupts these fields,
  // so guests cannot bypass the signed-in limits by leaving them out.
  const requestedDuration = Number.isFinite(rawDuration) ? rawDuration : 15;
  const requestedQualityRaw = String(settings?.shot_director_quality || '').trim().toLowerCase();
  const requestedQuality = requestedQualityRaw === 'low' || requestedQualityRaw === 'high'
    ? requestedQualityRaw
    : 'high';
  const requiresSignedInAccess = requestedDuration > 5 || requestedQuality === 'high';

  let access = { ok: true, authenticated: false };
  if (getFirebaseBearerToken(request) || requiresSignedInAccess) {
    access = await getPixelMatchVideoAccess(request, env);
    if (!access.ok && access.response) return access.response;
  }

  if (requiresSignedInAccess && !access.authenticated) {
    return json({
      ok: false,
      error: requestedDuration > 5 && requestedQuality === 'high'
        ? 'Sign in to generate videos longer than 5 seconds or use HIGH director quality.'
        : requestedDuration > 5
          ? 'Sign in to generate videos longer than 5 seconds.'
          : 'Sign in to use HIGH director quality.',
    }, 401, {
      'Cache-Control': 'no-store',
    });
  }

  const awsApiUrl = String(env.PIXEL_MATCH_AWS_API_URL || '').trim();
  if (!awsApiUrl) {
    return json({
      ok: false,
      error: 'Pixel Match AWS execution is not configured yet. Set PIXEL_MATCH_AWS_API_URL to your AWS job API endpoint.'
    }, 503, {
      'Cache-Control': 'no-store',
    });
  }

  try {
    const upstream = await fetch(awsApiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        settings,
        source: 'pixel-match-video-generator',
        authenticated_user: access.authenticated
          ? {
              uid: String(access.user?.localId || access.claims?.sub || ''),
              email: String(access.user?.email || access.claims?.email || ''),
            }
          : null,
      }),
    });

    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return json({
        ok: false,
        error: payload?.error || payload?.message || `AWS generation endpoint failed (${upstream.status}).`,
      }, upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502, {
        'Cache-Control': 'no-store',
      });
    }

    return json({ ok: true, ...payload }, 200, {
      'Cache-Control': 'no-store',
    });
  } catch (error) {
    return json({
      ok: false,
      error: error?.message || 'Could not reach the AWS generation endpoint.',
    }, 502, {
      'Cache-Control': 'no-store',
    });
  }
}


function getPixelMatchAwsCancelUrl(env = {}) {
  const explicit = String(env.PIXEL_MATCH_AWS_CANCEL_URL || '').trim();
  if (explicit) return explicit;

  const generateUrl = String(env.PIXEL_MATCH_AWS_API_URL || '').trim();
  if (!generateUrl) return '';

  try {
    const parsed = new URL(generateUrl);
    parsed.pathname = parsed.pathname.replace(/\/generate\/?$/i, '/cancel');
    return parsed.toString();
  } catch (_) {
    return generateUrl.replace(/\/generate\/?$/i, '/cancel');
  }
}


function getPixelMatchAwsStatusUrl(env = {}) {
  const explicit = String(env.PIXEL_MATCH_AWS_STATUS_URL || '').trim();
  if (explicit) return explicit;

  const generateUrl = String(env.PIXEL_MATCH_AWS_API_URL || '').trim();
  if (!generateUrl) return '';

  try {
    const parsed = new URL(generateUrl);
    parsed.pathname = parsed.pathname.replace(/\/generate\/?$/i, '/status');
    parsed.search = '';
    return parsed.toString();
  } catch (_) {
    return generateUrl.replace(/\/generate\/?$/i, '/status');
  }
}


async function handlePixelMatchVideoStatus(request, env = {}) {
  const requestUrl = new URL(request.url);
  const jobId = String(requestUrl.searchParams.get('job_id') || '').trim();

  if (!/^[a-f0-9]{32}$/i.test(jobId)) {
    return json({ ok: false, error: 'A valid Pixel Match job ID is required.' }, 400, {
      'Cache-Control': 'no-store',
    });
  }

  const awsStatusUrl = getPixelMatchAwsStatusUrl(env);
  if (!awsStatusUrl) {
    return json({
      ok: false,
      error: 'Pixel Match AWS status is not configured yet.'
    }, 503, {
      'Cache-Control': 'no-store',
    });
  }

  try {
    const upstreamUrl = new URL(awsStatusUrl);
    upstreamUrl.searchParams.set('job_id', jobId);

    const upstream = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return json({
        ok: false,
        error: payload?.error || payload?.message || `AWS status endpoint failed (${upstream.status}).`,
      }, upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502, {
        'Cache-Control': 'no-store',
      });
    }

    return json({ ok: true, ...payload }, 200, {
      'Cache-Control': 'no-store',
    });
  } catch (error) {
    return json({
      ok: false,
      error: error?.message || 'Could not reach the AWS status endpoint.',
    }, 502, {
      'Cache-Control': 'no-store',
    });
  }
}


async function handlePixelMatchVideoCancel(request, env = {}) {
  const body = await safeJson(request);
  const jobId = String(body?.job_id || '').trim();
  const reason = String(body?.reason || 'user_stop').trim().slice(0, 64);

  if (!/^[a-f0-9]{32}$/i.test(jobId)) {
    return json({ ok: false, error: 'A valid Pixel Match job ID is required.' }, 400, {
      'Cache-Control': 'no-store',
    });
  }

  const awsCancelUrl = getPixelMatchAwsCancelUrl(env);
  if (!awsCancelUrl) {
    return json({
      ok: false,
      error: 'Pixel Match AWS cancellation is not configured yet.'
    }, 503, {
      'Cache-Control': 'no-store',
    });
  }

  try {
    const upstream = await fetch(awsCancelUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: jobId,
        reason,
        source: 'pixel-match-video-generator',
      }),
    });

    const payload = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return json({
        ok: false,
        error: payload?.error || payload?.message || `AWS cancellation endpoint failed (${upstream.status}).`,
      }, upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502, {
        'Cache-Control': 'no-store',
      });
    }

    return json({ ok: true, ...payload }, 200, {
      'Cache-Control': 'no-store',
    });
  } catch (error) {
    return json({
      ok: false,
      error: error?.message || 'Could not reach the AWS cancellation endpoint.',
    }, 502, {
      'Cache-Control': 'no-store',
    });
  }
}



function getSeoAnalyzerConfig(env = {}) {
  const baseUrl = String(env.SEO_ANALYZER_URL || '').trim().replace(/\/+$/, '');
  const secret = String(env.SEO_ANALYZER_SECRET || '').trim();
  return { baseUrl, secret };
}


function normalizeQprofilePercentageQuery(params) {
  if (!params) return;
  const mode = String(params.get('selection_mode') || '').trim().toLowerCase();
  const hasPercent = params.has('from_percent') || params.has('to_percent');
  if (mode !== 'percent' && !hasPercent) return;

  const clampPercent = (raw, fallback) => {
    const value = Number(raw);
    if (!Number.isFinite(value)) return fallback;
    return Math.max(0, Math.min(100, Math.round(value)));
  };

  let fromPercent = clampPercent(params.get('from_percent'), 0);
  let toPercent = clampPercent(params.get('to_percent'), 100);
  if (fromPercent > toPercent) [fromPercent, toPercent] = [toPercent, fromPercent];

  params.set('selection_mode', 'percent');
  params.set('from_percent', String(fromPercent));
  params.set('to_percent', String(toPercent));
  params.delete('from');
  params.delete('to');
}

async function proxySeoAnalyzerRequest(request, env = {}, upstreamPath = '') {
  const { baseUrl, secret } = getSeoAnalyzerConfig(env);
  if (!baseUrl) {
    return json({
      ok: false,
      error: 'SEO analyzer URL is not configured. Set SEO_ANALYZER_URL on this Worker.'
    }, 503, { 'Cache-Control': 'no-store' });
  }
  if (!secret) {
    return json({
      ok: false,
      error: 'SEO analyzer secret is not configured. Set SEO_ANALYZER_SECRET on this Worker.'
    }, 503, { 'Cache-Control': 'no-store' });
  }

  let upstreamBase;
  try {
    upstreamBase = new URL(baseUrl);
  } catch (_) {
    return json({ ok: false, error: 'SEO_ANALYZER_URL is invalid.' }, 500, { 'Cache-Control': 'no-store' });
  }

  if (upstreamBase.protocol !== 'https:') {
    return json({ ok: false, error: 'SEO_ANALYZER_URL must use HTTPS.' }, 500, { 'Cache-Control': 'no-store' });
  }

  const incomingUrl = new URL(request.url);
  if (upstreamBase.origin === incomingUrl.origin) {
    return json({
      ok: false,
      error: 'SEO_ANALYZER_URL points back to this Worker and would create a proxy loop.'
    }, 500, { 'Cache-Control': 'no-store' });
  }

  const target = new URL(upstreamPath, upstreamBase.origin);
  target.search = incomingUrl.search;

  // QProfile percentage mode is authoritative. Normalize the values at the
  // Worker boundary and remove legacy date filters so an upstream service
  // cannot silently fall back to day/date-based truncation.
  if (upstreamPath === '/api/qprofile' || upstreamPath === '/api/qprofile-status') {
    normalizeQprofilePercentageQuery(target.searchParams);
  }

  const headers = new Headers();
  headers.set('Accept', 'application/json');
  headers.set('X-SEO-Analyzer-Secret', secret);
  const contentType = request.headers.get('Content-Type');
  if (contentType) headers.set('Content-Type', contentType);

  const init = {
    method: request.method,
    headers,
    redirect: 'manual',
  };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    // Keep the history upload streaming through the Worker instead of turning it
    // into a large ArrayBuffer in Worker memory.
    init.body = request.body;
  }

  try {
    const upstream = await fetch(target.toString(), init);
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', upstream.headers.get('Content-Type') || 'application/json; charset=utf-8');
    responseHeaders.set('Cache-Control', 'no-store');
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    for (const name of ['Content-Disposition', 'Content-Length']) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return withCors(new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    }));
  } catch (error) {
    console.warn('[seo-analyzer] upstream unavailable:', error?.message || error);
    return json({
      ok: false,
      error: 'SEO analyzer is offline or unreachable from Cloudflare.'
    }, 503, { 'Cache-Control': 'no-store' });
  }
}


async function handleBlindVidCall(request, env = {}) {
  const authentication = await verifyFirebaseAuthenticatedRequest(request, env);
  if (!authentication.ok) return authentication.response;

  const email = String(
    authentication.user?.email ||
    authentication.claims?.email ||
    ''
  ).trim();

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return json({
      ok: false,
      error: 'Your signed-in account does not have a usable email address.'
    }, 400, { 'Cache-Control': 'no-store' });
  }

  if (!env.RESEND_API_KEY) {
    return json({
      ok: false,
      error: 'BlindVid waiting notifications are not configured.'
    }, 500, { 'Cache-Control': 'no-store' });
  }

  const toEmail = String(
    env.BLINDVID_ALERT_EMAIL ||
    env.SUPPORT_EMAIL ||
    'support@bi-mach.com'
  ).trim();

  const fromEmail = String(
    env.BLINDVID_CALL_FROM ||
    env.CONTACT_FROM ||
    'Biological Machinery <support@bi-mach.com>'
  ).trim();

  const now = new Date().toISOString();
  const text = [
    'A signed-in user is waiting for BlindVid.',
    '',
    `User email: ${email}`,
    `Time: ${now}`,
    'Page: /apps/blindvid.html',
    '',
    'The BlindVid health check was unavailable in the user interface,',
    'and the user pressed Call to let you know they are waiting.'
  ].join('\n');

  let resendResponse;

  try {
    resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: 'BlindVid: user waiting',
        text
      })
    });
  } catch (_) {
    return json({
      ok: false,
      error: 'Could not reach the email service.'
    }, 502, { 'Cache-Control': 'no-store' });
  }

  const payload = await resendResponse.json().catch(() => ({}));

  if (!resendResponse.ok) {
    return json({
      ok: false,
      error: payload?.message || payload?.error || 'Email provider failed.'
    }, 502, { 'Cache-Control': 'no-store' });
  }

  return json({
    ok: true,
    message: 'Thanks. We have been notified that you are waiting.',
    id: payload?.id || null
  }, 200, { 'Cache-Control': 'no-store' });
}


function getBlindVidConfig(env = {}) {
  const baseUrl = String(env.BLINDVID_URL || '').trim().replace(/\/+$/, '');
  const secret = String(env.BLINDVID_SECRET || '').trim();
  return { baseUrl, secret };
}

async function proxyBlindVidRequest(request, env = {}, upstreamPath = '') {
  const { baseUrl, secret } = getBlindVidConfig(env);
  if (!baseUrl) {
    return json({
      ok: false,
      error: 'BlindVid URL is not configured. Set BLINDVID_URL on this Worker.'
    }, 503, { 'Cache-Control': 'no-store' });
  }
  if (!secret) {
    return json({
      ok: false,
      error: 'BlindVid secret is not configured. Set BLINDVID_SECRET on this Worker.'
    }, 503, { 'Cache-Control': 'no-store' });
  }

  let upstreamBase;
  try {
    upstreamBase = new URL(baseUrl);
  } catch (_) {
    return json({ ok: false, error: 'BLINDVID_URL is invalid.' }, 500, { 'Cache-Control': 'no-store' });
  }

  if (upstreamBase.protocol !== 'https:') {
    return json({ ok: false, error: 'BLINDVID_URL must use HTTPS.' }, 500, { 'Cache-Control': 'no-store' });
  }

  const incomingUrl = new URL(request.url);
  if (upstreamBase.origin === incomingUrl.origin) {
    return json({
      ok: false,
      error: 'BLINDVID_URL points back to this Worker and would create a proxy loop.'
    }, 500, { 'Cache-Control': 'no-store' });
  }

  const target = new URL(upstreamPath, upstreamBase.origin);
  target.search = incomingUrl.search;

  const headers = new Headers();
  headers.set('Accept', request.headers.get('Accept') || '*/*');
  headers.set('X-BlindVid-Secret', secret);
  const contentType = request.headers.get('Content-Type');
  if (contentType) headers.set('Content-Type', contentType);

  const init = {
    method: request.method,
    headers,
    redirect: 'manual',
  };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  try {
    const upstream = await fetch(target.toString(), init);
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', upstream.headers.get('Content-Type') || 'application/octet-stream');
    responseHeaders.set('Cache-Control', 'no-store');
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    for (const name of ['Content-Disposition', 'Content-Length', 'Accept-Ranges', 'Content-Range']) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return withCors(new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    }));
  } catch (error) {
    console.warn('[blindvid] upstream unavailable:', error?.message || error);
    return json({
      ok: false,
      error: 'BlindVid backend is offline or unreachable from Cloudflare.'
    }, 503, { 'Cache-Control': 'no-store' });
  }
}


function getV112RigConfig(env = {}) {
  const baseUrl = String(env.V112_RIG_URL || '').trim().replace(/\/+$/, '');
  const secret = String(env.V112_RIG_SECRET || '').trim();
  return { baseUrl, secret };
}

async function proxyV112RigRequest(request, env = {}, upstreamPath = '') {
  const { baseUrl, secret } = getV112RigConfig(env);
  if (!baseUrl) {
    return json({
      ok: false,
      error: 'V112 rig URL is not configured. Set V112_RIG_URL on this Worker.'
    }, 503, { 'Cache-Control': 'no-store' });
  }
  if (!secret) {
    return json({
      ok: false,
      error: 'V112 rig secret is not configured. Set V112_RIG_SECRET on this Worker.'
    }, 503, { 'Cache-Control': 'no-store' });
  }

  let upstreamBase;
  try {
    upstreamBase = new URL(baseUrl);
  } catch (_) {
    return json({ ok: false, error: 'V112_RIG_URL is invalid.' }, 500, { 'Cache-Control': 'no-store' });
  }

  if (upstreamBase.protocol !== 'https:') {
    return json({ ok: false, error: 'V112_RIG_URL must use HTTPS.' }, 500, { 'Cache-Control': 'no-store' });
  }

  const incomingUrl = new URL(request.url);
  if (upstreamBase.origin === incomingUrl.origin) {
    return json({
      ok: false,
      error: 'V112_RIG_URL points back to this Worker and would create a proxy loop.'
    }, 500, { 'Cache-Control': 'no-store' });
  }

  const target = new URL(upstreamPath, upstreamBase.origin);
  target.search = incomingUrl.search;

  const headers = new Headers();
  headers.set('Accept', 'application/json');
  headers.set('X-V112-Rig-Secret', secret);
  const contentType = request.headers.get('Content-Type');
  if (contentType) headers.set('Content-Type', contentType);

  const init = {
    method: request.method,
    headers,
    redirect: 'manual',
  };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  try {
    const upstream = await fetch(target.toString(), init);
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', upstream.headers.get('Content-Type') || 'application/json; charset=utf-8');
    responseHeaders.set('Cache-Control', 'no-store');
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    const length = upstream.headers.get('Content-Length');
    if (length) responseHeaders.set('Content-Length', length);
    return withCors(new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    }));
  } catch (error) {
    console.warn('[v112-rig] upstream unavailable:', error?.message || error);
    return json({
      ok: false,
      error: 'V112 image-rigging backend is offline or unreachable from Cloudflare.'
    }, 503, { 'Cache-Control': 'no-store' });
  }
}


async function serveAssetWithStartupPreloader(request, env) {
  // Static HTML is served directly so large pages can stream from the ASSETS
  // binding without being decoded, copied, searched, and rebuilt in the Worker.
  // Put the startup-preloader markup in the HTML at build time when required.
  return env.ASSETS.fetch(request);
}

async function maybeInjectStartupPreloader(request, response) {
  const url = new URL(request.url);
  if (url.pathname === "/startup-preloader.html") return response;
  if (url.pathname === "/checkout-cancelled") return response;
  if (url.pathname.startsWith("/api/")) return response;

  const contentType = response.headers.get("Content-Type") || "";
  const looksLikeHtml = contentType.includes("text/html") || /\.html?$/i.test(url.pathname) || url.pathname === "/";
  if (!looksLikeHtml) return response;

  const html = await response.text();
  const injected = injectStartupPreloaderMarkup(html);
  const headers = new Headers(response.headers);
  headers.delete("Content-Length");
  headers.set("Content-Type", "text/html; charset=utf-8");

  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function injectStartupPreloaderMarkup(html) {
  if (html.includes("biologicalMachineryStartupPreloader")) return html;

  const style = `
<style id="biologicalMachineryStartupPreloaderStyle">
.site-startup-frame {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
  background: #000;
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transition: opacity .36s ease, visibility 0s linear .36s;
}
.site-startup-frame.is-hiding {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .site-startup-frame { transition: none !important; }
}
</style>`;

  const script = `
<script id="biologicalMachineryStartupPreloader">
(() => {
  const STARTUP_DURATION_MS = 2000;
  const STARTUP_FADE_MS = 420;

  const path = window.location.pathname || "/";
  if (/^\/api\//i.test(path)) return;
  if (/^\/checkout-cancelled\/?$/i.test(path)) return;
  if (window.__biologicalMachineryStartupShown) return;

  function isReloadNavigation() {
    try {
      const navigationEntry = performance.getEntriesByType?.("navigation")?.[0];
      if (navigationEntry?.type) return navigationEntry.type === "reload";

      if (performance.navigation) {
        return performance.navigation.type === performance.navigation.TYPE_RELOAD;
      }
    } catch (_) {}

    return false;
  }

  if (!isReloadNavigation()) return;

  function showStartupPreloader() {
    if (window.__biologicalMachineryStartupShown) return;
    if (document.getElementById("siteStartupFrame")) return;

    window.__biologicalMachineryStartupShown = true;

    const startupFrame = document.createElement("iframe");
    startupFrame.id = "siteStartupFrame";
    startupFrame.className = "site-startup-frame";
    startupFrame.title = "Loading Biological Machinery";
    startupFrame.setAttribute("aria-label", "Loading Biological Machinery");
    startupFrame.src = "/startup-preloader.html?reload=" + Date.now();

    document.body.prepend(startupFrame);

    window.setTimeout(() => {
      startupFrame.classList.add("is-hiding");
      window.setTimeout(() => startupFrame.remove(), STARTUP_FADE_MS);
    }, STARTUP_DURATION_MS);
  }

  if (document.body) {
    showStartupPreloader();
  } else {
    document.addEventListener("DOMContentLoaded", showStartupPreloader, { once: true });
  }
})();
</script>`;

  let output = html;
  if (/<\/head>/i.test(output)) {
    output = output.replace(/<\/head>/i, `${style}\n</head>`);
  } else {
    output = `${style}\n${output}`;
  }

  if (/<body([^>]*)>/i.test(output)) {
    output = output.replace(/<body([^>]*)>/i, `<body$1>${script}\n`);
  } else {
    output = `${script}\n${output}`;
  }

  return output;
}



function isAllowedLiteratureRemoteHost(hostname = '') {
  const host = String(hostname || '').toLowerCase();
  return host === 'archive.org' ||
    host.endsWith('.archive.org') ||
    host === 'openlibrary.org' ||
    host.endsWith('.openlibrary.org') ||
    host === 'googleusercontent.com' ||
    host.endsWith('.googleusercontent.com') ||
    host === 'books.google.com' ||
    host.endsWith('.books.google.com') ||
    host === 'covers.openlibrary.org' ||
    host === 'images-na.ssl-images-amazon.com' ||
    host === 'm.media-amazon.com' ||
    host.endsWith('.media-amazon.com') ||
    host === 'upload.wikimedia.org' ||
    host.endsWith('.wikimedia.org');
}

async function fetchAllowedLiteratureRemote(rawUrl, init = {}, maxRedirects = 6) {
  let current = new URL(rawUrl);

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    if (!['http:', 'https:'].includes(current.protocol) || !isAllowedLiteratureRemoteHost(current.hostname)) {
      throw new Error('Literature remote host is not allowed.');
    }

    const response = await fetch(current.href, {
      ...init,
      redirect: 'manual',
    });

    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return { response, finalUrl: current };
    }

    const location = response.headers.get('Location');
    if (!location) return { response, finalUrl: current };
    current = new URL(location, current);
  }

  throw new Error('Too many redirects while loading literature media.');
}

async function handleLiteratureCoverProxy(request, env = {}) {
  const url = new URL(request.url);
  const rawImageUrl = String(url.searchParams.get('url') || '').trim();

  if (!/^https?:\/\//i.test(rawImageUrl)) {
    return new Response('Missing or invalid cover URL.', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  let upstream;
  try {
    upstream = await fetchAllowedLiteratureRemote(rawImageUrl, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'User-Agent': cleanDescription(env?.LITERATURE_COVER_PROXY_USER_AGENT || 'BiologicalMachineryLiteratureCoverProxy/1.0'),
      },
      cf: { cacheEverything: true, cacheTtl: 86400 },
    });
  } catch (error) {
    return new Response(error?.message || 'Could not load cover.', {
      status: /not allowed/i.test(error?.message || '') ? 403 : 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const upstreamResponse = upstream.response;
  if (!upstreamResponse.ok) {
    return new Response(`Could not load cover: ${upstreamResponse.status}`, {
      status: upstreamResponse.status,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const contentType = upstreamResponse.headers.get('Content-Type') || 'application/octet-stream';
  if (!/^image\//i.test(contentType)) {
    return new Response('The remote URL did not return an image.', {
      status: 415,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const sourceName = upstream.finalUrl.pathname.split('/').filter(Boolean).pop() || 'book-cover';
  const safeFilename = sourceName.replace(/[^a-zA-Z0-9._-]+/g, '_');
  const headers = new Headers();
  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Disposition', `inline; filename="${safeFilename}"`);

  return new Response(upstreamResponse.body, { status: 200, headers });
}

function extractArchiveIdentifierFromUrl(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    if (parsed.hostname !== 'archive.org' && !parsed.hostname.endsWith('.archive.org')) return '';
    const match = parsed.pathname.match(/^\/(?:download|details|embed)\/([^/]+)/i);
    return match?.[1] ? decodeURIComponent(match[1]) : '';
  } catch (_) {
    return '';
  }
}

async function resolveArchivePdfUrls(identifier = '', env = {}) {
  const cleanIdentifier = String(identifier || '').trim();
  if (!cleanIdentifier) return [];

  const metadataResponse = await fetch(
    `https://archive.org/metadata/${encodeURIComponent(cleanIdentifier)}`,
    {
      headers: {
        Accept: 'application/json',
        'User-Agent': cleanDescription(env?.LITERATURE_PDF_PROXY_USER_AGENT || 'BiologicalMachineryLiteraturePdfProxy/1.0'),
      },
      cf: { cacheEverything: true, cacheTtl: 3600 },
    }
  );
  if (!metadataResponse.ok) return [];

  const metadata = await metadataResponse.json().catch(() => ({}));
  const itemRestricted = Boolean(
    metadata?.is_dark ||
    metadata?.metadata?.access_restricted_item === 'true' ||
    metadata?.metadata?.access_restricted_item === true
  );
  const files = Array.isArray(metadata?.files) ? metadata.files : [];

  return files
    .filter((file) => {
      const name = String(file?.name || '');
      const format = String(file?.format || '').toLowerCase();
      const privateFile = file?.private === true || String(file?.private || '').toLowerCase() === 'true';
      const restrictedFile = /encrypted|restricted|preview|borrow|lcp/i.test(`${name} ${format}`);
      return !privateFile && !restrictedFile && (/\.pdf$/i.test(name) || format.includes('pdf'));
    })
    .map((file) => {
      const name = String(file?.name || '');
      const format = String(file?.format || '').toLowerCase();
      let score = 0;
      if (format === 'text pdf') score += 100;
      if (format.includes('pdf')) score += 50;
      if (/text\.pdf$/i.test(name)) score += 35;
      if (/bw\.pdf$/i.test(name)) score += 20;
      if (/\.pdf$/i.test(name)) score += 10;
      if (itemRestricted) score -= 25;
      return {
        url: `https://archive.org/download/${encodeURIComponent(cleanIdentifier)}/${name.split('/').map(encodeURIComponent).join('/')}`,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.url);
}

async function handleLiteraturePdfProxy(request, env = {}) {
  const url = new URL(request.url);
  const requestedUrl = String(url.searchParams.get('url') || '').trim();
  const explicitIdentifier = String(url.searchParams.get('identifier') || '').trim();
  const inferredIdentifier = extractArchiveIdentifierFromUrl(requestedUrl);
  const identifier = explicitIdentifier || inferredIdentifier;

  const candidateUrls = [];
  if (/^https?:\/\//i.test(requestedUrl)) candidateUrls.push(requestedUrl);
  if (identifier) {
    const archiveCandidates = await resolveArchivePdfUrls(identifier, env);
    for (const candidate of archiveCandidates) {
      if (!candidateUrls.includes(candidate)) candidateUrls.push(candidate);
    }
  }

  if (!candidateUrls.length) {
    return new Response('No usable PDF was found for this book.', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const range = request.headers.get('Range');
  let lastStatus = 404;
  let lastMessage = 'No usable PDF was found for this book.';

  for (const rawPdfUrl of candidateUrls) {
    let upstreamUrl;
    try {
      upstreamUrl = new URL(rawPdfUrl);
    } catch (_) {
      continue;
    }

    const hostname = upstreamUrl.hostname.toLowerCase();
    const isAllowed = hostname === 'archive.org' || hostname.endsWith('.archive.org') || [
      'www.gutenberg.org', 'gutenberg.org', 'books.google.com',
      'openlibrary.org', 'standardebooks.org'
    ].includes(hostname);
    if (!isAllowed) {
      lastStatus = 403;
      lastMessage = 'PDF host is not allowed.';
      continue;
    }

    const upstreamHeaders = new Headers();
    upstreamHeaders.set('Accept', 'application/pdf,application/octet-stream,*/*;q=0.8');
    upstreamHeaders.set('User-Agent', cleanDescription(env?.LITERATURE_PDF_PROXY_USER_AGENT || 'BiologicalMachineryLiteraturePdfProxy/1.0'));
    upstreamHeaders.set('Referer', `${upstreamUrl.origin}/`);
    if (range) upstreamHeaders.set('Range', range);

    const upstreamResponse = await fetch(upstreamUrl.href, {
      headers: upstreamHeaders,
      redirect: 'follow',
      cf: range ? undefined : { cacheEverything: true, cacheTtl: 86400 },
    });

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      lastStatus = upstreamResponse.status;
      lastMessage = `Could not load PDF: ${upstreamResponse.status}`;
      continue;
    }

    const contentType = upstreamResponse.headers.get('Content-Type') || 'application/pdf';
    const finalUrl = upstreamResponse.url || upstreamUrl.href;
    const parsedFinalUrl = new URL(finalUrl);
    const pathnameLooksPdf = /\.pdf(?:$|[?#])/i.test(parsedFinalUrl.pathname + parsedFinalUrl.search);
    if (!/^application\/pdf\b/i.test(contentType) && !/^application\/octet-stream\b/i.test(contentType) && !pathnameLooksPdf) {
      lastStatus = 415;
      lastMessage = 'The remote URL did not return a PDF.';
      continue;
    }

    const filename = parsedFinalUrl.pathname.split('/').filter(Boolean).pop() || 'book.pdf';
    const safeFilename = (filename.endsWith('.pdf') ? filename : `${filename}.pdf`).replace(/[^a-zA-Z0-9._-]+/g, '_');
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Cache-Control', range ? 'no-store' : 'public, max-age=86400, s-maxage=86400');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Accept-Ranges', upstreamResponse.headers.get('Accept-Ranges') || 'bytes');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Content-Disposition', `inline; filename="${safeFilename}"`);
    headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
    for (const name of ['Content-Length', 'Content-Range', 'ETag', 'Last-Modified']) {
      const value = upstreamResponse.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status === 206 ? 206 : 200,
      headers,
    });
  }

  // A 401/403 from Archive.org means the raw file is borrow/login restricted.
  // The browser client will switch to Archive.org's official embedded reader.
  return new Response(lastMessage, {
    status: lastStatus,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Literature-Reader-Fallback': identifier ? 'archive-embed' : 'none',
    },
  });
}



const DEFAULT_MANGA_COLORIZER_API_URL = 'https://manga-colorizer-api-87140568878.europe-west4.run.app';
let mangaCloudRunIdTokenCache = null;

function safeFilename(name = '', fallbackExt = '') {
  const raw = String(name || '').split(/[\\/]/).pop() || 'manga';
  let cleaned = raw.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^[.-]+|[.-]+$/g, '');
  if (!cleaned) cleaned = 'manga';
  if (fallbackExt && !/\.[A-Za-z0-9]{1,10}$/.test(cleaned)) cleaned += fallbackExt;
  return cleaned.slice(0, 160);
}

function getMangaColorizerApiUrl(env = {}) {
  return normalizeBaseUrl(env.MANGA_COLORIZER_API_URL || DEFAULT_MANGA_COLORIZER_API_URL);
}

async function authorizeMangaColorizerRequest(request, env = {}) {
  // Every user with a valid Firebase sign-in session may use manga coloring.
  // The verified Firebase UID is still used to bind each job to its owner.
  const authentication = await verifyFirebaseAuthenticatedRequest(request, env);
  if (!authentication.ok) return authentication;

  const uid = String(authentication.user?.localId || authentication.claims?.sub || '').trim();
  if (!uid) {
    return {
      ok: false,
      response: json(
        { ok: false, error: 'Your sign-in session does not contain a valid user ID.' },
        401,
        { 'Cache-Control': 'no-store' }
      ),
    };
  }

  return { ...authentication, uid };
}

async function getMangaCloudRunIdToken(env = {}) {
  const serviceAccountEmail = String(env.MANGA_COLORIZER_SERVICE_ACCOUNT_EMAIL || '').trim();
  const privateKey = String(env.MANGA_COLORIZER_SERVICE_ACCOUNT_PRIVATE_KEY || '').trim();
  const audience = normalizeBaseUrl(
    env.MANGA_COLORIZER_CLOUD_RUN_AUDIENCE || getMangaColorizerApiUrl(env)
  );

  if (!serviceAccountEmail || !privateKey || !audience) {
    throw new Error(
      'Cloud Run authentication is not configured. Set MANGA_COLORIZER_SERVICE_ACCOUNT_EMAIL, MANGA_COLORIZER_SERVICE_ACCOUNT_PRIVATE_KEY, and MANGA_COLORIZER_CLOUD_RUN_AUDIENCE.'
    );
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (
    mangaCloudRunIdTokenCache?.idToken &&
    mangaCloudRunIdTokenCache.audience === audience &&
    mangaCloudRunIdTokenCache.expiresAt > nowSeconds + 90
  ) {
    return mangaCloudRunIdTokenCache.idToken;
  }

  const tokenEndpoint = 'https://oauth2.googleapis.com/token';
  const header = googleBase64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = googleBase64UrlEncode(JSON.stringify({
    iss: serviceAccountEmail,
    sub: serviceAccountEmail,
    aud: tokenEndpoint,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
    target_audience: audience,
  }));
  const unsignedJwt = `${header}.${claims}`;

  const signingKey = await crypto.subtle.importKey(
    'pkcs8',
    googlePemToArrayBuffer(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    signingKey,
    new TextEncoder().encode(unsignedJwt)
  );
  const assertion = `${unsignedJwt}.${googleBase64UrlEncode(new Uint8Array(signature))}`;

  const tokenResponse = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const tokenPayload = await tokenResponse.json().catch(() => ({}));
  const idToken = String(tokenPayload?.id_token || '').trim();
  if (!tokenResponse.ok || !idToken) {
    throw new Error(
      tokenPayload?.error_description ||
      tokenPayload?.error ||
      `Could not obtain a Cloud Run ID token (${tokenResponse.status}).`
    );
  }

  const tokenClaims = decodeBase64UrlJson(idToken.split('.')[1] || '');
  mangaCloudRunIdTokenCache = {
    idToken,
    audience,
    expiresAt: Number(tokenClaims?.exp || nowSeconds + 3300),
  };
  return idToken;
}

async function mangaColorizerJsonFetch(url, init = {}, env = {}) {
  const idToken = await getMangaCloudRunIdToken(env);
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${idToken}`,
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = Array.isArray(payload?.detail)
      ? payload.detail.map((entry) => entry?.msg || JSON.stringify(entry)).join('; ')
      : payload?.detail;
    throw new Error(detail || payload?.error || `Manga colorizer request failed (${response.status}).`);
  }
  return payload;
}

async function requireMangaJobOwner(jobId, env = {}, authorization = {}) {
  if (!env.MANGA_COLORIZER_JOBS || typeof env.MANGA_COLORIZER_JOBS.get !== 'function') {
    return {
      ok: false,
      response: json(
        { ok: false, error: 'Manga job ownership storage is not configured.' },
        500,
        { 'Cache-Control': 'no-store' }
      ),
    };
  }

  const ownerUid = String(await env.MANGA_COLORIZER_JOBS.get(jobId) || '').trim();
  if (!ownerUid || ownerUid !== String(authorization.uid || '')) {
    return {
      ok: false,
      response: json({ ok: false, error: 'Job not found.' }, 404, {
        'Cache-Control': 'no-store',
      }),
    };
  }
  return { ok: true };
}

async function handleMangaColorizerSubmit(request, env = {}, authorization = {}) {
  const contentType = String(request.headers.get('Content-Type') || '').toLowerCase();
  if (!contentType.includes('application/pdf')) {
    return json({ ok: false, error: 'Choose a PDF file.' }, 415);
  }
  if (!env.MANGA_COLORIZER_JOBS || typeof env.MANGA_COLORIZER_JOBS.put !== 'function') {
    return json({ ok: false, error: 'Manga job ownership storage is not configured.' }, 500);
  }

  const maxBytes = Math.max(1, Number(env.MANGA_COLORIZER_MAX_UPLOAD_BYTES || 100 * 1024 * 1024));
  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (declaredLength > maxBytes) {
    return json({ ok: false, error: 'The PDF exceeds the configured upload limit.' }, 413);
  }

  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength) return json({ ok: false, error: 'The selected PDF is empty.' }, 400);
  if (bytes.byteLength > maxBytes) {
    return json({ ok: false, error: 'The PDF exceeds the configured upload limit.' }, 413);
  }

  const rawFilename = String(request.headers.get('X-Manga-Filename') || 'manga.pdf');
  const filename = safeFilename(rawFilename, '.pdf');
  const apiUrl = getMangaColorizerApiUrl(env);

  try {
    const upload = await mangaColorizerJsonFetch(`${apiUrl}/v1/uploads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, content_type: 'application/pdf' }),
    }, env);

    const uploadResponse = await fetch(upload.upload_url, {
      method: upload.upload_method || 'PUT',
      headers: upload.upload_headers || { 'Content-Type': 'application/pdf' },
      body: bytes,
    });
    if (!uploadResponse.ok) {
      throw new Error(`PDF upload failed (${uploadResponse.status}).`);
    }

    const settings = {
      cpu_offload: false,
      panel_colorize: true,
      panel_max_regions: 1,
      panel_steps: 8,
      panel_max_side: 640,
      template_mode: 'off',
      learned_analyze: false,
      save_diagnostics: false,
      steps: 16,
      guidance_scale: 6.8,
      color_saturation: 1.18,
      output_jpeg_quality: 92,
      max_pages: 60,
    };

    const started = await mangaColorizerJsonFetch(`${apiUrl}/v1/jobs/${upload.job_id}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }, env);

    await env.MANGA_COLORIZER_JOBS.put(upload.job_id, String(authorization.uid), {
      expirationTtl: Math.max(3600, Number(env.MANGA_COLORIZER_JOB_TTL_SECONDS || 86400)),
    });

    return json({ ok: true, job_id: upload.job_id, state: started.state || 'QUEUED' });
  } catch (error) {
    return json({ ok: false, error: error?.message || 'Could not start manga colorization.' }, 502);
  }
}

async function handleMangaColorizerStatus(jobId, env = {}, authorization = {}) {
  const ownership = await requireMangaJobOwner(jobId, env, authorization);
  if (!ownership.ok) return ownership.response;

  try {
    const payload = await mangaColorizerJsonFetch(
      `${getMangaColorizerApiUrl(env)}/v1/jobs/${jobId}`,
      {},
      env
    );
    return json({ ok: true, ...payload }, 200, { 'Cache-Control': 'no-store' });
  } catch (error) {
    return json({ ok: false, error: error?.message || 'Could not read manga colorization status.' }, 502);
  }
}

async function handleMangaColorizerPdf(jobId, env = {}, authorization = {}) {
  const ownership = await requireMangaJobOwner(jobId, env, authorization);
  if (!ownership.ok) return ownership.response;

  try {
    const status = await mangaColorizerJsonFetch(
      `${getMangaColorizerApiUrl(env)}/v1/jobs/${jobId}`,
      {},
      env
    );
    if (status.state !== 'SUCCEEDED' || !status.download_url) {
      return json({ ok: false, error: 'The colorized PDF is not ready yet.', state: status.state }, 409);
    }
    const upstream = await fetch(status.download_url, { headers: { Accept: 'application/pdf' } });
    if (!upstream.ok) throw new Error(`Could not download the colorized PDF (${upstream.status}).`);
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Cache-Control', 'no-store');
    headers.set('Content-Disposition', `inline; filename="colorized-${jobId}.pdf"`);
    headers.set('X-Content-Type-Options', 'nosniff');
    return new Response(upstream.body, { status: 200, headers });
  } catch (error) {
    return json({ ok: false, error: error?.message || 'Could not download the colorized PDF.' }, 502);
  }
}

let googleTranslateAccessTokenCache = null;

function googleBase64UrlEncode(value) {
  const bytes = value instanceof Uint8Array
    ? value
    : new TextEncoder().encode(String(value));
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function googlePemToArrayBuffer(pem = '') {
  const normalized = String(pem || '')
    .replace(/\\n/g, '\n')
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  if (!normalized) throw new Error('GOOGLE_TRANSLATE_PRIVATE_KEY is empty.');

  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

async function getGoogleTranslateAccessToken(env = {}) {
  const projectId = String(env.GOOGLE_TRANSLATE_PROJECT_ID || '').trim();
  const clientEmail = String(env.GOOGLE_TRANSLATE_CLIENT_EMAIL || '').trim();
  const privateKey = String(env.GOOGLE_TRANSLATE_PRIVATE_KEY || '').trim();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Google Translation service-account secrets are incomplete. Configure GOOGLE_TRANSLATE_PROJECT_ID, GOOGLE_TRANSLATE_CLIENT_EMAIL, and GOOGLE_TRANSLATE_PRIVATE_KEY.'
    );
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (
    googleTranslateAccessTokenCache?.accessToken &&
    googleTranslateAccessTokenCache.expiresAt > nowSeconds + 90
  ) {
    return {
      accessToken: googleTranslateAccessTokenCache.accessToken,
      projectId,
    };
  }

  const tokenEndpoint = 'https://oauth2.googleapis.com/token';
  const header = googleBase64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = googleBase64UrlEncode(JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/cloud-translation',
    aud: tokenEndpoint,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  }));
  const unsignedJwt = `${header}.${claims}`;

  const signingKey = await crypto.subtle.importKey(
    'pkcs8',
    googlePemToArrayBuffer(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    signingKey,
    new TextEncoder().encode(unsignedJwt)
  );
  const assertion = `${unsignedJwt}.${googleBase64UrlEncode(new Uint8Array(signature))}`;

  const tokenResponse = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const tokenPayload = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenPayload?.access_token) {
    throw new Error(
      tokenPayload?.error_description ||
      tokenPayload?.error ||
      `Could not obtain a Google OAuth access token (${tokenResponse.status}).`
    );
  }

  const expiresIn = Math.max(300, Number(tokenPayload.expires_in) || 3600);
  googleTranslateAccessTokenCache = {
    accessToken: String(tokenPayload.access_token),
    expiresAt: nowSeconds + expiresIn,
  };

  return { accessToken: googleTranslateAccessTokenCache.accessToken, projectId };
}

async function handleTranslationLanguages(request, env = {}) {
  let credentials;
  try {
    credentials = await getGoogleTranslateAccessToken(env);
  } catch (error) {
    return json({ ok: false, error: error?.message || 'Google Translation authentication failed.' }, 500);
  }

  const endpoint = new URL(
    `https://translation.googleapis.com/v3/projects/${encodeURIComponent(credentials.projectId)}/locations/global/supportedLanguages`
  );
  endpoint.searchParams.set('displayLanguageCode', 'en');
  endpoint.searchParams.set(
    'model',
    `projects/${credentials.projectId}/locations/global/models/general/nmt`
  );

  const response = await fetch(endpoint.href, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${credentials.accessToken}`,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return json({
      ok: false,
      error: payload?.error?.message || `Google Translation languages request failed (${response.status}).`,
    }, response.status);
  }

  const languages = Array.isArray(payload?.languages)
    ? payload.languages.map((entry) => ({
        language: String(entry?.languageCode || '').trim(),
        languageCode: String(entry?.languageCode || '').trim(),
        name: String(entry?.displayName || entry?.languageCode || '').trim(),
        displayName: String(entry?.displayName || entry?.languageCode || '').trim(),
        supportSource: Boolean(entry?.supportSource),
        supportTarget: Boolean(entry?.supportTarget),
      })).filter((entry) => entry.language && entry.supportTarget)
    : [];

  return json({ ok: true, languages }, 200, {
    'Cache-Control': 'public, max-age=21600, s-maxage=21600',
  });
}


async function handleTranslateText(request, env = {}) {
  let credentials;
  try {
    credentials = await getGoogleTranslateAccessToken(env);
  } catch (error) {
    return json({ ok: false, error: error?.message || 'Google Translation authentication failed.' }, 500);
  }

  const body = await safeJson(request);
  const targetLanguageCode = String(body?.targetLanguageCode || body?.target || '').trim();
  const sourceLanguageCode = String(body?.sourceLanguageCode || body?.source || '').trim();
  const contents = (Array.isArray(body?.contents) ? body.contents : [body?.text])
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .slice(0, 500);

  if (!targetLanguageCode) {
    return json({ ok: false, error: 'A target language is required.' }, 400);
  }
  if (!contents.length) {
    return json({ ok: false, error: 'No text was provided for translation.' }, 400);
  }

  const endpoint = `https://translation.googleapis.com/v3/projects/${encodeURIComponent(credentials.projectId)}/locations/global:translateText`;
  const payload = {
    contents,
    targetLanguageCode,
    mimeType: 'text/plain',
    model: `projects/${credentials.projectId}/locations/global/models/general/nmt`,
  };
  if (sourceLanguageCode) payload.sourceLanguageCode = sourceLanguageCode;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const googlePayload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return json({
      ok: false,
      error: googlePayload?.error?.message || `Google Translation request failed (${response.status}).`,
    }, response.status);
  }

  const translations = Array.isArray(googlePayload?.translations)
    ? googlePayload.translations.map((entry) => ({
        translatedText: String(entry?.translatedText || ''),
        detectedLanguageCode: String(entry?.detectedLanguageCode || ''),
      }))
    : [];

  return json({ ok: true, translations, targetLanguageCode });
}


async function handleDetectLanguage(request, env = {}) {
  let credentials;
  try {
    credentials = await getGoogleTranslateAccessToken(env);
  } catch (error) {
    return json({ ok: false, error: error?.message || 'Google language detection authentication failed.' }, 500);
  }

  const body = await safeJson(request);
  const text = String(body?.text || '').trim().slice(0, 12000);
  if (!text) return json({ ok: false, error: 'Text is required for language detection.' }, 400);

  const endpoint = `https://translation.googleapis.com/v3/projects/${encodeURIComponent(credentials.projectId)}/locations/global:detectLanguage`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: text, mimeType: 'text/plain' }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return json({
      ok: false,
      error: payload?.error?.message || `Google language detection failed (${response.status}).`,
    }, response.status);
  }

  const detection = Array.isArray(payload?.languages) ? payload.languages[0] : null;
  if (!detection?.languageCode) {
    return json({ ok: false, error: 'Google returned no detected language.' }, 502);
  }

  return json({
    ok: true,
    languageCode: String(detection.languageCode),
    confidence: Number(detection.confidence || 0),
  });
}



let googleVertexAccessTokenCache = null;

async function getGoogleVertexAccessToken(env = {}) {
  const projectId = String(
    env.GOOGLE_VERTEX_PROJECT_ID ||
    env.GOOGLE_CLOUD_PROJECT_ID ||
    env.GOOGLE_TRANSLATE_PROJECT_ID ||
    'website-502612'
  ).trim();
  const clientEmail = String(
    env.GOOGLE_VERTEX_CLIENT_EMAIL ||
    env.GOOGLE_CLOUD_CLIENT_EMAIL ||
    env.GOOGLE_TRANSLATE_CLIENT_EMAIL ||
    ''
  ).trim();
  const privateKey = String(
    env.GOOGLE_VERTEX_PRIVATE_KEY ||
    env.GOOGLE_CLOUD_PRIVATE_KEY ||
    env.GOOGLE_TRANSLATE_PRIVATE_KEY ||
    ''
  ).trim();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Google Vertex AI credentials are incomplete. Configure GOOGLE_VERTEX_PROJECT_ID, GOOGLE_VERTEX_CLIENT_EMAIL, and GOOGLE_VERTEX_PRIVATE_KEY, or reuse the existing GOOGLE_TRANSLATE_* service-account secrets.'
    );
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (
    googleVertexAccessTokenCache?.accessToken &&
    googleVertexAccessTokenCache.expiresAt > nowSeconds + 90
  ) {
    return { accessToken: googleVertexAccessTokenCache.accessToken, projectId };
  }

  const tokenEndpoint = 'https://oauth2.googleapis.com/token';
  const header = googleBase64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = googleBase64UrlEncode(JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: tokenEndpoint,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  }));
  const unsignedJwt = `${header}.${claims}`;

  const signingKey = await crypto.subtle.importKey(
    'pkcs8',
    googlePemToArrayBuffer(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    signingKey,
    new TextEncoder().encode(unsignedJwt)
  );
  const assertion = `${unsignedJwt}.${googleBase64UrlEncode(new Uint8Array(signature))}`;

  const tokenResponse = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const tokenPayload = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenPayload?.access_token) {
    throw new Error(
      tokenPayload?.error_description ||
      tokenPayload?.error ||
      `Could not obtain a Google Vertex AI access token (${tokenResponse.status}).`
    );
  }

  const expiresIn = Math.max(300, Number(tokenPayload.expires_in) || 3600);
  googleVertexAccessTokenCache = {
    accessToken: String(tokenPayload.access_token),
    expiresAt: nowSeconds + expiresIn,
  };

  return { accessToken: googleVertexAccessTokenCache.accessToken, projectId };
}


const LITERATURE_GEMINI_TTS_VOICES = new Set([
  'Achernar', 'Autonoe', 'Callirrhoe', 'Charon', 'Despina', 'Enceladus',
  'Fenrir', 'Gacrux', 'Iapetus', 'Kore', 'Puck', 'Pulcherrima',
  'Rasalgethi', 'Sadachbia', 'Schedar', 'Umbriel', 'Vindemiatrix',
  'Zubenelgenubi',
]);

function extractGeneratedAudio(payload = {}) {
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : [];
  for (const candidate of candidates) {
    const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [];
    for (const part of parts) {
      const inlineData = part?.inlineData || part?.inline_data || {};
      const mimeType = String(inlineData?.mimeType || inlineData?.mime_type || '');
      const data = String(inlineData?.data || '');
      if (data && /^audio\//i.test(mimeType)) return { mimeType, data };
    }
  }
  return null;
}

async function handleLiteratureTts(request, env = {}) {
  const body = await safeJson(request);
  const text = String(body?.text || '').trim();
  const voice = String(body?.voice || 'Kore').trim();
  const languageCode = String(body?.languageCode || 'en-US').trim();
  const model = String(body?.model || 'gemini-3.1-flash-tts-preview').trim();
  const genre = cleanDescription(body?.genre || '').slice(0, 180);
  const subjects = cleanDescription(body?.subjects || '').slice(0, 900);

  if (!text) return json({ ok: false, error: 'Text is required.' }, 400);
  if (!LITERATURE_GEMINI_TTS_VOICES.has(voice)) {
    return json({ ok: false, error: 'The selected voice is not allowed.' }, 400);
  }
  if (model !== 'gemini-3.1-flash-tts-preview') {
    return json({ ok: false, error: 'Only Gemini 3.1 Flash TTS Preview is enabled for this reader.' }, 400);
  }

  const prompt = [
    `Read the book aloud as a book in genre ${genre || 'literature'} with these characteristics ${subjects || 'the characteristics evident in the text'} should be read.`,
    'Preserve the language of the source text exactly; the instruction is in English but the narration must remain in the source language.',
    'Read naturally and clearly with literary pacing and expression appropriate to the genre and subjects.',
    '',
    text.slice(0, 7000),
  ].join('\n');

  if (new TextEncoder().encode(prompt).byteLength > 8000) {
    return json({ ok: false, error: 'The visible text is too long for one voice preview.' }, 400);
  }

  let credentials;
  try {
    credentials = await getGoogleVertexAccessToken(env);
  } catch (error) {
    return json({ ok: false, error: error?.message || 'Google Vertex AI authentication failed.' }, 500);
  }

  const location = 'global';
  const endpoint =
    `https://aiplatform.googleapis.com/v1/projects/${encodeURIComponent(credentials.projectId)}` +
    `/locations/${location}/publishers/google/models/${encodeURIComponent(model)}:generateContent`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          languageCode,
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return json({
      ok: false,
      error: payload?.error?.message || `Gemini TTS request failed (${response.status}).`,
      googleStatus: response.status,
    }, response.status);
  }

  const audio = extractGeneratedAudio(payload);
  if (!audio?.data) return json({ ok: false, error: 'Google returned no audio.' }, 502);

  return json({
    ok: true,
    model,
    voice,
    languageCode,
    mimeType: audio.mimeType || 'audio/L16;codec=pcm;rate=24000',
    audioBase64: audio.data,
  }, 200, { 'Cache-Control': 'no-store' });
}

function extractGeneratedImage(payload = {}) {
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : [];
  const candidateParts = candidates.flatMap((candidate) =>
    Array.isArray(candidate?.content?.parts) ? candidate.content.parts : []
  );

  const predictionItems = Array.isArray(payload?.predictions)
    ? payload.predictions
    : payload?.predictions
      ? [payload.predictions]
      : [];

  const allItems = [
    ...candidateParts,
    ...predictionItems,
    ...(Array.isArray(payload?.images) ? payload.images : []),
    payload,
  ].filter(Boolean);

  for (const item of allItems) {
    const inlineData = item?.inlineData || item?.inline_data || {};
    const data = String(
      inlineData?.data ||
      item?.bytesBase64Encoded ||
      item?.bytes_base64_encoded ||
      item?.b64_json ||
      item?.base64 ||
      item?.image ||
      item?.data ||
      ''
    ).trim();

    if (!data) continue;

    const dataUrlMatch = data.match(/^data:([^;]+);base64,(.+)$/s);
    if (dataUrlMatch) {
      return { mimeType: dataUrlMatch[1], bytesBase64Encoded: dataUrlMatch[2] };
    }

    // Ignore ordinary URLs. This route returns a data URL to its browser client.
    if (/^https?:\/\//i.test(data)) continue;

    return {
      mimeType: String(
        inlineData?.mimeType ||
        inlineData?.mime_type ||
        item?.mimeType ||
        item?.mime_type ||
        'image/png'
      ),
      bytesBase64Encoded: data,
    };
  }

  return null;
}

function getGeminiImageBlockDetails(payload = {}, responseStatus = 0) {
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : [];
  const finishReason = String(candidates[0]?.finishReason || candidates[0]?.finish_reason || '');
  const blockReason = String(
    payload?.promptFeedback?.blockReason ||
    payload?.prompt_feedback?.block_reason ||
    ''
  );
  const errorMessage = String(payload?.error?.message || '');
  const errorStatus = String(payload?.error?.status || '');
  const combined = `${blockReason} ${finishReason} ${errorStatus} ${errorMessage}`.toUpperCase();

  return {
    finishReason,
    blockReason,
    errorMessage,
    isProhibited: /PROHIBITED/.test(combined),
    isSafetyBlock: Boolean(
      /SAFETY|UNSAFE|PROHIBITED|BLOCKLIST|RECITATION|IMAGE_SAFETY|CONTENT_FILTER/.test(combined) ||
      (responseStatus === 400 && /CONTENT|POLICY/.test(combined))
    ),
  };
}

async function verifyFirebaseAuthenticatedRequest(request, env = {}) {
  // Firebase's web API key and project ID are public client configuration values.
  // Keep env overrides for production, but fall back to the same project used by
  // app.js so local `wrangler dev` WebSocket upgrades can authenticate even when
  // .dev.vars does not contain FIREBASE_PROJECT_ID / FIREBASE_WEB_API_KEY.
  const projectId = String(env.FIREBASE_PROJECT_ID || 'biological-machinery').trim();
  const apiKey = String(env.FIREBASE_WEB_API_KEY || 'AIzaSyD6iPz3o0Z45NaqK7ombsWnGLwGy2If-Hc').trim();

  if (!projectId || !apiKey) {
    return {
      ok: false,
      response: json({ ok: false, error: 'Firebase authentication is not configured.' }, 500, {
        'Cache-Control': 'no-store'
      })
    };
  }

  const authorization = String(request.headers.get('Authorization') || '');
  const bearerMatch = authorization.match(/^Bearer\s+(.+)$/i);
  const idToken = String(bearerMatch?.[1] || '').trim();
  if (!idToken) {
    return {
      ok: false,
      response: json({ ok: false, error: 'Sign in is required.' }, 401, {
        'Cache-Control': 'no-store'
      })
    };
  }

  const tokenParts = idToken.split('.');
  const claims = tokenParts.length === 3 ? decodeBase64UrlJson(tokenParts[1]) : {};
  const expectedIssuer = `https://securetoken.google.com/${projectId}`;
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (
    tokenParts.length !== 3 ||
    claims?.aud !== projectId ||
    claims?.iss !== expectedIssuer ||
    !claims?.sub ||
    (Number(claims?.exp) || 0) <= nowSeconds
  ) {
    return {
      ok: false,
      response: json({ ok: false, error: 'Your sign-in session is invalid or expired.' }, 401, {
        'Cache-Control': 'no-store'
      })
    };
  }

  let firebaseResponse;
  try {
    firebaseResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      }
    );
  } catch (_) {
    return {
      ok: false,
      response: json({ ok: false, error: 'Firebase verification could not be reached.' }, 502, {
        'Cache-Control': 'no-store'
      })
    };
  }

  const payload = await firebaseResponse.json().catch(() => ({}));
  const user = Array.isArray(payload?.users) ? payload.users[0] : null;
  if (!firebaseResponse.ok || !user?.localId || String(user.localId) !== String(claims.sub)) {
    return {
      ok: false,
      response: json({
        ok: false,
        error: payload?.error?.message || 'Firebase rejected the sign-in session.'
      }, 401, { 'Cache-Control': 'no-store' })
    };
  }

  return { ok: true, user, claims };
}

async function handleLiteratureImageGeneration(request, env = {}) {
  const authentication = await verifyFirebaseAuthenticatedRequest(request, env);
  if (!authentication.ok) return authentication.response;

  const body = await safeJson(request);
  const paragraph = cleanDescription(body?.paragraph || body?.prompt || '').slice(0, 6000);

  if (!paragraph) {
    return json({ ok: false, error: 'A paragraph is required.' }, 400);
  }

  let credentials;
  try {
    credentials = await getGoogleVertexAccessToken(env);
  } catch (error) {
    return json({
      ok: false,
      error: error?.message || 'Google Agent Platform authentication failed.',
    }, 500);
  }

  const location = 'global';
  const model = 'gemini-3.1-flash-image';

  const endpoint =
    `https://aiplatform.googleapis.com/v1/projects/${encodeURIComponent(credentials.projectId)}` +
    `/locations/${location}/publishers/google/models/${encodeURIComponent(model)}:generateContent`;

  const prompt = [
    'Create one cinematic, realistic image inspired by the literary paragraph below.',
    'Depict the scene, characters, atmosphere, lighting, and emotional tone described by the prose.',
    'Do not add text, captions, lettering, logos, borders, frames, signatures, or watermarks.',
    '',
    paragraph,
  ].join('\n');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        candidateCount: 1,
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio: '1:1',
          imageSize: '1K',
        },
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  const geminiImage = extractGeneratedImage(payload);
  const block = getGeminiImageBlockDetails(payload, response.status);

  if (response.ok && geminiImage?.bytesBase64Encoded) {
    return json({
      ok: true,
      provider: 'google-gemini',
      model,
      location,
      mimeType: geminiImage.mimeType,
      imageDataUrl: `data:${geminiImage.mimeType};base64,${geminiImage.bytesBase64Encoded}`,
    }, 200, {
      'Cache-Control': 'no-store',
    });
  }


  // Google Gemini 3.1 Flash is the only image-generation model. Do not
  // retry blocked or failed requests with a different provider or model.
  if (block.isSafetyBlock) {
    return json({
      ok: false,
      error: block.isProhibited
        ? 'PROHIBITED (coming soon...)'
        : block.blockReason
          ? `Google blocked this image prompt: ${block.blockReason}`
          : block.finishReason
            ? `Google returned no image. Finish reason: ${block.finishReason}`
            : 'Google blocked this image prompt.',
      googleBlockReason: block.blockReason,
      googleFinishReason: block.finishReason,
      model,
      location,
    }, response.ok ? 502 : response.status);
  }

  if (!response.ok) {
    return json({
      ok: false,
      error:
        payload?.error?.message ||
        `Gemini image-generation request failed (${response.status}).`,
      googleStatus: response.status,
      model,
      location,
    }, response.status);
  }

  return json({
    ok: false,
    error:
      block.isProhibited
        ? 'PROHIBITED (coming soon...)'
        : block.blockReason
          ? `Google blocked this image prompt: ${block.blockReason}`
        : block.finishReason
          ? `Google returned no image. Finish reason: ${block.finishReason}`
          : 'Google returned no generated image.',
    model,
    location,
  }, 502);
}

async function handlePaintingImageProxy(request, env = {}) {
  const url = new URL(request.url);
  const rawImageUrl = String(url.searchParams.get('url') || '').trim();

  if (!/^https?:\/\//i.test(rawImageUrl)) {
    return new Response('Missing or invalid image URL.', {
      status: 400,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  let upstreamUrl;
  try {
    upstreamUrl = new URL(rawImageUrl);
  } catch (_) {
    return new Response('Invalid image URL.', {
      status: 400,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const hostname = upstreamUrl.hostname.toLowerCase();
  const allowedHosts = [
    'artic.edu',
    'media.artic.edu',
    'www.artic.edu',
    'api.artic.edu',
    'images.metmuseum.org',
    'collectionapi.metmuseum.org',
    'upload.wikimedia.org',
    'uploads.wikiart.org',
    'uploads0.wikiart.org',
    'uploads1.wikiart.org',
    'uploads2.wikiart.org',
    'uploads3.wikiart.org',
    'uploads4.wikiart.org',
    'uploads5.wikiart.org',
    'uploads6.wikiart.org',
    'uploads7.wikiart.org',
    'uploads8.wikiart.org',
    'iiif.wellcomecollection.org',
    'ids.si.edu',
    'www.nga.gov',
    'media.nga.gov',
  ];

  const isAllowed = allowedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  if (!isAllowed) {
    return new Response('Image host is not allowed.', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const upstreamResponse = await fetch(upstreamUrl.href, {
    headers: {
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'User-Agent': cleanDescription(env?.PAINTING_IMAGE_PROXY_USER_AGENT || 'BiologicalMachineryPaintingImageProxy/1.0'),
      Referer: `${upstreamUrl.origin}/`,
    },
    cf: {
      cacheEverything: true,
      cacheTtl: 86400,
    },
  });

  if (!upstreamResponse.ok) {
    return new Response(`Could not load image: ${upstreamResponse.status}`, {
      status: upstreamResponse.status,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const contentType = upstreamResponse.headers.get('Content-Type') || 'application/octet-stream';
  if (!/^image\//i.test(contentType)) {
    return new Response('The remote URL did not return an image.', {
      status: 415,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const filename = upstreamUrl.pathname.split('/').filter(Boolean).pop() || 'painting-image';
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]+/g, '_');

  const headers = new Headers();
  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Disposition', `inline; filename="${safeFilename}"`);

  return new Response(upstreamResponse.body, {
    status: 200,
    headers,
  });
}

async function trackActivity(request, env) {
  const body = await safeJson(request);
  const now = Date.now();
  const row = {
    id: crypto.randomUUID(),
    event: String(body.event || 'unknown_event'),
    page: String(body.page || '/'),
    user_id: body.userId ? String(body.userId) : null,
    metadata: JSON.stringify(body.metadata || {}),
    created_at: now
  };

  let stored = false;
  if (env.DB) {
    await env.DB.prepare(
      'INSERT INTO events (id, event, page, user_id, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(row.id, row.event, row.page, row.user_id, row.metadata, row.created_at).run();
    stored = true;
  }

  return json({ ok: true, stored, eventId: row.id });
}


async function getPurchases(request, env) {
  if (!env.DB) {
    return json({ ok: false, error: "Database is not configured." }, 500);
  }

  const url = new URL(request.url);
  let email = String(url.searchParams.get("email") || "").trim().toLowerCase();

  if (!email && request.method === "POST") {
    const body = await safeJson(request);
    email = String(body.email || "").trim().toLowerCase();
  }

  if (!email || !email.includes("@")) {
    return json({ ok: false, error: "A valid email address is required." }, 400);
  }

  const result = await env.DB.prepare(`
    SELECT
      id,
      stripe_session_id,
      customer_email,
      amount_total,
      currency,
      status,
      created_at
    FROM orders
    WHERE lower(customer_email) = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).bind(email).all();

  const purchases = (result.results || []).map((row) => ({
    id: row.id,
    stripeSessionId: row.stripe_session_id,
    customerEmail: row.customer_email,
    amountTotal: row.amount_total,
    currency: row.currency,
    status: row.status,
    createdAt: row.created_at
  }));

  return json({
    ok: true,
    purchases
  });
}

const SHOP_PRODUCTS = {
  vib: {
    name: "Vib",
    amount: 39900,
    currency: "eur",
    slug: "vib"
  },
  vibbracelet: {
    name: "Vib Bracelet",
    amount: 14900,
    currency: "eur",
    slug: "vibbracelet"
  },
  vibmini: {
    name: "Vib Mini",
    amount: 19900,
    currency: "eur",
    slug: "vibmini"
  },
  vibvest: {
    name: "Vib Vest",
    amount: 109900,
    currency: "eur",
    slug: "vibvest"
  },
  "movie-api-unlimited": {
    name: "Unlimited Movie Search",
    amount: 15000,
    currency: "usd",
    slug: "movie-api-unlimited",
    recurring: true,
    interval: "month"
  },
  "movie-api-watcher": {
    name: "The Watcher",
    amount: 9900,
    currency: "usd",
    slug: "movie-api-watcher",
    recurring: true,
    interval: "month"
  },
  "image-plus": {
    name: "Add 100",
    amount: 1500,
    currency: "usd",
    slug: "image-plus",
    recurring: false
  }
};

async function createCheckoutSession(request, env) {
  const origin = new URL(request.url).origin;
  const appUrl = normalizeBaseUrl(env.APP_URL || origin);
  const body = await safeJson(request);

  const productSlug = String(body.product || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  const isDonation = productSlug === "donation";
  const product = isDonation
    ? { name: "Donation to Biological Machinery", currency: "usd", slug: "donation" }
    : SHOP_PRODUCTS[productSlug];

  if (!product) {
    return json({ ok: false, error: "Unknown product." }, 400);
  }

  const productName = product.name;
  const amount = isDonation ? Math.round(Number(body.amount) * 100) : product.amount;
  const currency = product.currency;

  if (isDonation && (!Number.isInteger(amount) || amount < 50 || amount > 100000)) {
    return json({ ok: false, error: "Donation amount must be between $0.50 and $1,000.00." }, 400);
  }
  const returnUrl = safeSameOriginUrl(body.returnUrl, appUrl)
    || `${appUrl}/bitems/${product.slug}.html?checkout=cancelled`;
  const cancelCloseUrl = new URL('/checkout-cancelled', appUrl);
  cancelCloseUrl.searchParams.set('return', returnUrl);

  if (!env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY.includes("replace_me")) {
    return json({
      ok: false,
      error: "Stripe is not configured. Add STRIPE_SECRET_KEY as a Cloudflare Worker secret."
    }, 500);
  }

  const params = new URLSearchParams();
  params.append("mode", isDonation ? "payment" : (product.recurring ? "subscription" : "payment"));
  params.append("success_url", `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`);
  params.append("cancel_url", cancelCloseUrl.href);

  params.append("customer_creation", "always");

  // Create a paid invoice after successful one-time Checkout payment.
  if (isDonation || !product.recurring) {
    params.append("invoice_creation[enabled]", "true");
    params.append("invoice_creation[invoice_data][description]", isDonation ? "Donation to Biological Machinery" : `${productName} purchase`);
    params.append("invoice_creation[invoice_data][footer]", "Thank you for your purchase from Biological Machinery.");
  }

  params.append("line_items[0][quantity]", "1");
  params.append("line_items[0][price_data][currency]", currency);
  params.append("line_items[0][price_data][unit_amount]", String(amount));
  if (!isDonation && product.recurring) {
    params.append("line_items[0][price_data][recurring][interval]", product.interval || "month");
  }
  params.append("line_items[0][price_data][product_data][name]", productName);

  params.append("metadata[source]", isDonation ? "biological-machinery-donation" : "biological-machinery-shop");
  params.append("metadata[product]", product.slug);
  params.append("metadata[productName]", productName);

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  const data = await stripeResponse.json();

  if (!stripeResponse.ok) {
    return json({
      ok: false,
      error: data.error?.message || "Stripe request failed",
      stripe: data
    }, 502);
  }

  return json({ ok: true, url: data.url, id: data.id });
}

async function handleStripeWebhook(request, env) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (env.STRIPE_WEBHOOK_SECRET) {
    const verified = await verifyStripeSignature(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    if (!verified) return json({ ok: false, error: 'Invalid Stripe signature' }, 400);
  } else {
    console.warn('STRIPE_WEBHOOK_SECRET is not configured; webhook signature was not verified.');
  }

  const event = JSON.parse(rawBody);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (env.DB) {
      await env.DB.prepare(
        'INSERT OR IGNORE INTO orders (id, stripe_session_id, customer_email, amount_total, currency, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        crypto.randomUUID(),
        session.id,
        session.customer_details?.email || session.customer_email || null,
        session.amount_total || null,
        session.currency || null,
        session.payment_status || session.status || null,
        Date.now()
      ).run();
    }
  }

  return json({ received: true });
}

async function verifyStripeSignature(payload, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [key, value] = part.split('=');
      return [key, value];
    })
  );

  if (!parts.t || !parts.v1) return false;

  const signedPayload = `${parts.t}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const expected = [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');

  return timingSafeEqual(expected, parts.v1);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

function base64UrlEncodeBytes(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlEncodeJson(value) {
  return base64UrlEncodeBytes(
    new TextEncoder().encode(JSON.stringify(value))
  );
}

async function signBrowserRouteToken(payload, secret) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const encodedHeader = base64UrlEncodeJson(header);
  const encodedPayload = base64UrlEncodeJson(payload);
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(unsignedToken)
  );

  return `${unsignedToken}.${base64UrlEncodeBytes(new Uint8Array(signature))}`;
}

function decodeBase64UrlJson(value = '') {
  try {
    const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (_) {
    return {};
  }
}

async function handleBrowserRouteSession(request, env = {}) {
  const projectId = String(env.FIREBASE_PROJECT_ID || '').trim();
  const apiKey = String(env.FIREBASE_WEB_API_KEY || '').trim();
  const sessionSecret = String(env.BROWSER_ROUTE_SESSION_SECRET || '').trim();

  if (!projectId || !apiKey || !sessionSecret) {
    return json({
      ok: false,
      error: 'Firebase verification or browser-route signing is not configured.'
    }, 500, {
      'Cache-Control': 'no-store'
    });
  }

  const body = await safeJson(request);
  const authorization = String(request.headers.get('Authorization') || '');
  const bearerMatch = authorization.match(/^Bearer\s+(.+)$/i);
  const idToken = String(bearerMatch?.[1] || body?.idToken || '').trim();

  if (!idToken) {
    return json({
      ok: false,
      error: 'A Firebase ID token is required.'
    }, 401, {
      'Cache-Control': 'no-store'
    });
  }

  const tokenParts = idToken.split('.');
  if (tokenParts.length !== 3) {
    return json({
      ok: false,
      error: 'The Firebase ID token is malformed.'
    }, 401, {
      'Cache-Control': 'no-store'
    });
  }

  const claims = decodeBase64UrlJson(tokenParts[1]);
  const expectedIssuer = `https://securetoken.google.com/${projectId}`;
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (
    claims?.aud !== projectId ||
    claims?.iss !== expectedIssuer ||
    !claims?.sub ||
    (Number(claims?.exp) || 0) <= nowSeconds
  ) {
    return json({
      ok: false,
      error: 'The Firebase ID token is invalid or expired.'
    }, 401, {
      'Cache-Control': 'no-store'
    });
  }

  const endpoint =
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`;

  let firebaseResponse;
  try {
    firebaseResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idToken })
    });
  } catch (_) {
    return json({
      ok: false,
      error: 'Firebase verification could not be reached.'
    }, 502, {
      'Cache-Control': 'no-store'
    });
  }

  const firebasePayload = await firebaseResponse.json().catch(() => ({}));
  const firebaseUser = Array.isArray(firebasePayload?.users)
    ? firebasePayload.users[0]
    : null;

  if (!firebaseResponse.ok || !firebaseUser?.localId) {
    return json({
      ok: false,
      error:
        firebasePayload?.error?.message ||
        'Firebase rejected the ID token.'
    }, 401, {
      'Cache-Control': 'no-store'
    });
  }

  if (String(firebaseUser.localId) !== String(claims.sub)) {
    return json({
      ok: false,
      error: 'Firebase user verification did not match the token.'
    }, 401, {
      'Cache-Control': 'no-store'
    });
  }

  const providerIds = Array.isArray(firebaseUser.providerUserInfo)
    ? firebaseUser.providerUserInfo
        .map((provider) => String(provider?.providerId || '').trim())
        .filter(Boolean)
    : [];

  const now = Math.floor(Date.now() / 1000);
  const routeExpiresAt = now + 300;
  const routeSessionToken = await signBrowserRouteToken({
    iss: 'biological-machinery-worker',
    aud: 'biological-machinery-browser-route',
    sub: String(firebaseUser.localId),
    email: String(firebaseUser.email || claims.email || ''),
    iat: now,
    exp: routeExpiresAt,
    jti: crypto.randomUUID()
  }, sessionSecret);

  return json({
    ok: true,
    authenticated: true,
    user: {
      uid: String(firebaseUser.localId),
      email: String(firebaseUser.email || claims.email || ''),
      emailVerified: Boolean(firebaseUser.emailVerified),
      displayName: String(firebaseUser.displayName || claims.name || ''),
      providerIds
    },
    firebaseToken: {
      issuedAt: Number(claims.iat) || null,
      expiresAt: Number(claims.exp) || null
    },
    browserRoute: {
      token: routeSessionToken,
      expiresAt: routeExpiresAt,
      expiresInSeconds: 300
    }
  }, 200, {
    'Cache-Control': 'no-store'
  });
}


function getFirebaseBearerToken(request) {
  const authorization = String(request.headers.get('Authorization') || '');
  return String(authorization.match(/^Bearer\s+(.+)$/i)?.[1] || '').trim();
}

function getFirebaseDatabaseBaseUrl(env = {}) {
  const configured = String(env.FIREBASE_DATABASE_URL || '').trim();
  if (!configured) return '';
  return configured.replace(/\/+$/, '');
}

function firebaseDatabaseError(payload = {}, fallback = 'Firebase Realtime Database request failed.') {
  if (typeof payload === 'string' && payload.trim()) return payload.trim();
  return String(payload?.error || payload?.message || fallback);
}

async function firebaseRealtimeRequest(env, path, idToken, init = {}) {
  const databaseUrl = getFirebaseDatabaseBaseUrl(env);
  if (!databaseUrl) {
    throw new Error('FIREBASE_DATABASE_URL is not configured.');
  }

  const cleanPath = String(path || '')
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  const endpoint = new URL(`${databaseUrl}/${cleanPath}.json`);
  const databaseAuth = String(idToken || env.FIREBASE_DATABASE_AUTH_TOKEN || '').trim();
  if (databaseAuth) endpoint.searchParams.set('auth', databaseAuth);

  const response = await fetch(endpoint.href, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });

  const payload = await response.json().catch(async () => {
    const text = await response.text().catch(() => '');
    return text ? { error: text } : {};
  });

  if (!response.ok) {
    const error = new Error(firebaseDatabaseError(payload, `Firebase request failed (${response.status}).`));
    error.status = response.status;
    throw error;
  }

  return payload;
}

function cleanTechGroupText(value, maxLength) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}


function techGroupSceneNumber(value, min, max, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function sanitizeTechGroupScene(value) {
  if (!value || typeof value !== 'object') return null;
  const width = techGroupSceneNumber(value.width, 600, 2400, 1200);
  const height = techGroupSceneNumber(value.height, 240, 1000, 480);
  const roadsInput = Array.isArray(value.roads)
    ? value.roads
    : (Array.isArray(value.platforms) ? value.platforms : []);
  const roads = roadsInput.slice(0, 8).map((road) => ({
    startX: techGroupSceneNumber(road?.startX, -width * .2, width * 1.2, 0),
    endX: techGroupSceneNumber(road?.endX, -width * .2, width * 1.2, width),
    y1: techGroupSceneNumber(road?.y1, 0, height, 0),
    y2: techGroupSceneNumber(road?.y2, 0, height, 0),
  })).filter((road) => road.endX - road.startX >= width * .35);

  if (roads.length < 3) return null;

  const ladders = (Array.isArray(value.ladders) ? value.ladders : []).slice(0, 16).map((ladder) => ({
    x: techGroupSceneNumber(ladder?.x, 0, width, width / 2),
    yTop: techGroupSceneNumber(ladder?.yTop, 0, height, 0),
    yBottom: techGroupSceneNumber(ladder?.yBottom, 0, height, height),
    upperIndex: Math.max(0, Math.min(roads.length - 1, Math.floor(Number(ladder?.upperIndex) || 0))),
    lowerIndex: Math.max(0, Math.min(roads.length - 1, Math.floor(Number(ladder?.lowerIndex) || 0))),
  })).filter((ladder) =>
    ladder.lowerIndex === ladder.upperIndex + 1 &&
    ladder.yBottom > ladder.yTop + 20
  );

  return {
    version: 1,
    width,
    height,
    braceSegments: Math.max(8, Math.min(40, Math.floor(Number(value.braceSegments) || 24))),
    roads,
    platforms: roads,
    ladders,
  };
}

function generateTechGroupScene() {
  const width = 1200;
  const height = 480;
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const platformCount = Math.floor(randomBetween(3, 7));
  const top = 55;
  const spacing = (height - 105) / Math.max(1, platformCount - 1);
  const roads = [];
  const ladders = [];

  for (let index = 0; index < platformCount; index += 1) {
    const y = top + index * spacing;
    const slope = randomBetween(-26, 26);
    const startX = index % 2 === 0 ? randomBetween(-70, 40) : randomBetween(0, 90);
    const endX = index % 2 === 0 ? randomBetween(width - 80, width + 50) : randomBetween(width - 40, width + 70);
    roads.push({
      startX,
      endX,
      y1: y - slope / 2,
      y2: y + slope / 2,
    });
  }

  for (let index = 0; index < roads.length - 1; index += 1) {
    const upper = roads[index];
    const lower = roads[index + 1];
    const ladderCount = Math.random() > .55 ? 2 : 1;
    const anchors = ladderCount === 2
      ? [randomBetween(.2, .4), randomBetween(.6, .8)]
      : [randomBetween(.28, .72)];

    for (const anchor of anchors) {
      const sharedStart = Math.max(upper.startX, lower.startX, 70);
      const sharedEnd = Math.min(upper.endX, lower.endX, width - 70);
      const x = sharedStart + Math.max(0, sharedEnd - sharedStart) * anchor;
      const tUpper = (x - upper.startX) / Math.max(1, upper.endX - upper.startX);
      const tLower = (x - lower.startX) / Math.max(1, lower.endX - lower.startX);
      const yTop = upper.y1 + (upper.y2 - upper.y1) * tUpper + 27;
      const yBottom = lower.y1 + (lower.y2 - lower.y1) * tLower - 2;
      ladders.push({
        x,
        yTop,
        yBottom: Math.max(yBottom, yTop + 42),
        upperIndex: index,
        lowerIndex: index + 1,
      });
    }
  }

  return sanitizeTechGroupScene({
    version: 1,
    width,
    height,
    braceSegments: 24,
    roads,
    ladders,
  });
}

function techGroupCreatorUid(group = {}) {
  return String(group?.createdBy?.uid || group?.creatorUid || group?.createdBy || '').trim();
}

function techGroupPublicRecord(group = {}, fallback = {}) {
  const rawRow = group?.position?.row ?? group?.row ?? fallback?.row;
  const row = Number.isInteger(Number(rawRow)) && Number(rawRow) >= 0
    ? Math.floor(Number(rawRow))
    : null;
  const rawSide = String(group?.position?.side ?? group?.side ?? fallback?.side ?? '').toLowerCase();
  const side = rawSide === 'left' || rawSide === 'right' ? rawSide : null;
  const scene = sanitizeTechGroupScene(
    group?.scene || group?.world || group?.railScene || group?.layout || fallback?.scene
  );
  const creatorUid = techGroupCreatorUid(group) || String(fallback?.createdBy || '').trim();

  return {
    title: cleanTechGroupText(group?.title ?? fallback?.title, 120),
    description: cleanTechGroupText(group?.description ?? fallback?.description, 1000),
    reason: ['Discuss', 'Find collaborators', 'Vibe together'].includes(String(group?.reason ?? fallback?.reason ?? ''))
      ? String(group?.reason ?? fallback?.reason)
      : 'Discuss',
    createdBy: creatorUid,
    createdAt: Number(group?.createdAt ?? fallback?.createdAt ?? Date.now()),
    updatedAt: Number(group?.updatedAt ?? fallback?.updatedAt ?? Date.now()),
    row,
    side,
    position: row !== null && side ? { row, side } : null,
    scene,
  };
}

async function writePublicTechGroupMirror(env, groupId, group, idToken = '') {
  const publicRecord = techGroupPublicRecord(group);
  if (!groupId || !publicRecord.title) return false;

  // Prefer the verified user's Firebase token so Firebase rules see the room
  // creator. Fall back to the Worker credential only for migrations. PATCH keeps
  // active public user-presence children intact while repairing room metadata.
  const databaseCredential = String(idToken || env.FIREBASE_DATABASE_AUTH_TOKEN || '').trim();
  await firebaseRealtimeRequest(env, `public_techgroups/${groupId}`, databaseCredential, {
    method: 'PATCH',
    body: JSON.stringify(publicRecord),
  });
  return true;
}

async function handleListTechGroups(request, env = {}) {
  try {
    let records = null;
    try {
      records = await firebaseRealtimeRequest(env, 'public_techgroups', '', { method: 'GET' });
    } catch (publicError) {
      console.warn('Public TechGroup mirror read failed:', publicError?.message || publicError);
    }

    // Keep authenticated users working during migration and repair an empty public
    // mirror when the Worker has a database credential.
    if (!records || typeof records !== 'object' || !Object.keys(records).length) {
      const authorization = String(request.headers.get('Authorization') || '');
      const bearer = String(authorization.match(/^Bearer\s+(.+)$/i)?.[1] || '').trim();
      const credential = String(env.FIREBASE_DATABASE_AUTH_TOKEN || bearer || '').trim();
      if (credential) {
        try {
          const privateRecords = await firebaseRealtimeRequest(env, 'techgroups', credential, { method: 'GET' });
          if (privateRecords && typeof privateRecords === 'object') {
            records = {};
            for (const [id, value] of Object.entries(privateRecords)) {
              const publicRecord = techGroupPublicRecord(value);
              if (!publicRecord.title) continue;
              records[id] = publicRecord;
              if (env.FIREBASE_DATABASE_AUTH_TOKEN) {
                try { await writePublicTechGroupMirror(env, id, value, ''); }
                catch (mirrorError) { console.warn(`Could not repair public TechGroup ${id}:`, mirrorError?.message || mirrorError); }
              }
            }
          }
        } catch (privateError) {
          console.warn('Private TechGroup fallback read failed:', privateError?.message || privateError);
        }
      }
    }

    const groups = Object.entries(records && typeof records === 'object' ? records : {})
      .map(([id, value]) => ({ id: String(id), ...techGroupPublicRecord(value) }))
      .filter((group) => group.id && group.title)
      .sort((a, b) => {
        const aPositioned = a.row !== null && a.side;
        const bPositioned = b.row !== null && b.side;
        if (aPositioned !== bPositioned) return aPositioned ? -1 : 1;
        if (a.row !== b.row) return Number(b.row || 0) - Number(a.row || 0);
        if (a.side !== b.side) return a.side === 'left' ? -1 : 1;
        return Number(b.createdAt || 0) - Number(a.createdAt || 0);
      });

    return json({ ok: true, groups }, 200, { 'Cache-Control': 'no-store' });
  } catch (error) {
    return json({
      ok: false,
      error: error?.message || 'Could not load TechGroup entries.',
    }, Number(error?.status) || 502, { 'Cache-Control': 'no-store' });
  }
}

async function handleCreateTechGroup(request, env = {}) {
  const authentication = await verifyFirebaseAuthenticatedRequest(request, env);
  if (!authentication.ok) return authentication.response;

  const idToken = getFirebaseBearerToken(request);
  const uid = String(authentication.user?.localId || authentication.claims?.sub || '').trim();
  const body = await safeJson(request);
  const title = cleanTechGroupText(body?.title, 50);
  const description = cleanTechGroupText(body?.description, 300);
  const requestedReason = cleanTechGroupText(body?.reason, 40);
  const reason = ['Discuss', 'Find collaborators', 'Vibe together'].includes(requestedReason)
    ? requestedReason
    : 'Discuss';
  const requestedRow = Number(body?.row);
  const row = Number.isInteger(requestedRow) && requestedRow >= 0 && requestedRow <= 1000000
    ? requestedRow
    : null;
  const side = String(body?.side || '').toLowerCase();
  const scene = sanitizeTechGroupScene(body?.scene) || generateTechGroupScene();

  if (!title || !description) {
    return json({ ok: false, error: 'Both title and description are required.' }, 400, { 'Cache-Control': 'no-store' });
  }
  if (String(body?.title || '').trim().length > 50) {
    return json({ ok: false, error: 'Titles can contain up to 50 characters.' }, 400, { 'Cache-Control': 'no-store' });
  }
  if (String(body?.description || '').trim().length > 300) {
    return json({ ok: false, error: 'Descriptions can contain up to 300 characters.' }, 400, { 'Cache-Control': 'no-store' });
  }
  if (row === null || (side !== 'left' && side !== 'right')) {
    return json({ ok: false, error: 'A valid rectangle row and side are required.' }, 400, { 'Cache-Control': 'no-store' });
  }

  const now = Date.now();
  const privateRecord = {
    title,
    description,
    reason,
    createdBy: uid,
    createdAt: now,
    updatedAt: now,
    row,
    side,
    position: { row, side },
    scene,
    members: { [uid]: true },
  };

  let id = '';
  try {
    const created = await firebaseRealtimeRequest(env, 'techgroups', idToken, {
      method: 'POST',
      body: JSON.stringify(privateRecord),
    });
    id = String(created?.name || '').trim();
    if (!id) {
      return json({ ok: false, error: 'Firebase created the entry but returned no group ID.' }, 502, { 'Cache-Control': 'no-store' });
    }
  } catch (error) {
    return json({
      ok: false,
      error: error?.message || 'Could not create the TechGroup entry.',
    }, Number(error?.status) || 502, { 'Cache-Control': 'no-store' });
  }

  let publicMirrorSaved = false;
  let publicMirrorError = '';
  try {
    publicMirrorSaved = await writePublicTechGroupMirror(env, id, privateRecord, idToken);
  } catch (error) {
    // The authoritative room already exists. Do not report creation as failed just
    // because the repairable public preview write was denied.
    publicMirrorError = String(error?.message || 'Public mirror write failed.');
    console.error(`TechGroup ${id} public mirror write failed:`, error);
  }

  return json({
    ok: true,
    id,
    title,
    description,
    reason,
    row,
    side,
    scene,
    publicMirrorSaved,
    publicMirrorError: publicMirrorSaved ? '' : publicMirrorError,
  }, 201, { 'Cache-Control': 'no-store' });
}

async function handleMigratePublicTechGroups(request, env = {}) {
  const authentication = await verifyFirebaseAuthenticatedRequest(request, env);
  if (!authentication.ok) return authentication.response;
  if (!String(env.FIREBASE_DATABASE_AUTH_TOKEN || '').trim()) {
    return json({
      ok: false,
      error: 'Set FIREBASE_DATABASE_AUTH_TOKEN before running the public-room migration.',
    }, 500, { 'Cache-Control': 'no-store' });
  }

  try {
    const records = await firebaseRealtimeRequest(env, 'techgroups', env.FIREBASE_DATABASE_AUTH_TOKEN, { method: 'GET' });
    let migrated = 0;
    const failures = [];
    for (const [id, value] of Object.entries(records && typeof records === 'object' ? records : {})) {
      try {
        await writePublicTechGroupMirror(env, id, value, '');
        migrated += 1;
      } catch (error) {
        failures.push({ id, error: String(error?.message || error) });
      }
    }
    return json({ ok: failures.length === 0, migrated, failures }, failures.length ? 207 : 200, { 'Cache-Control': 'no-store' });
  } catch (error) {
    return json({ ok: false, error: error?.message || 'Could not migrate public TechGroups.' }, Number(error?.status) || 502, { 'Cache-Control': 'no-store' });
  }
}


async function handleDeleteTechGroup(request, env = {}, encodedGroupId = '') {
  const authentication = await verifyFirebaseAuthenticatedRequest(request, env);
  if (!authentication.ok) return authentication.response;

  const groupId = parseTechGroupId(encodedGroupId);
  if (!groupId) {
    return json({ ok: false, error: 'Invalid TechGroup ID.' }, 400, {
      'Cache-Control': 'no-store',
    });
  }

  const idToken = getFirebaseBearerToken(request);
  const uid = String(authentication.user?.localId || authentication.claims?.sub || '').trim();

  try {
    const group = await firebaseRealtimeRequest(env, `techgroups/${groupId}`, idToken, {
      method: 'GET',
    });

    if (!group || typeof group !== 'object') {
      return json({ ok: false, error: 'TechGroup entry not found.' }, 404, {
        'Cache-Control': 'no-store',
      });
    }

    const creatorUid = String(
      group?.createdBy?.uid ||
      group?.creatorUid ||
      group?.createdBy ||
      ''
    ).trim();

    if (!creatorUid || creatorUid !== uid) {
      return json({ ok: false, error: 'Only the room owner can delete this TechGroup.' }, 403, {
        'Cache-Control': 'no-store',
      });
    }

    const deleteCredential = String(idToken || env.FIREBASE_DATABASE_AUTH_TOKEN || '').trim();

    await firebaseRealtimeRequest(env, `public_techgroups/${groupId}`, deleteCredential, {
      method: 'DELETE',
    });

    await firebaseRealtimeRequest(env, `techgroups/${groupId}`, deleteCredential, {
      method: 'DELETE',
    });

    try {
      if (env.TECHGROUP_ROOMS?.idFromName) {
        const objectId = env.TECHGROUP_ROOMS.idFromName(groupId);
        const room = env.TECHGROUP_ROOMS.get(objectId);
        await room.fetch(new Request(
          `https://techgroup-room.internal/delete?groupId=${encodeURIComponent(groupId)}`,
          {
            method: 'POST',
            headers: { 'X-TechGroup-Delete': '1' },
          }
        ));
      }
    } catch (error) {
      console.warn(`Could not notify TechGroup room ${groupId} about deletion:`, error?.message || error);
    }

    return json({ ok: true, id: groupId, deleted: true }, 200, {
      'Cache-Control': 'no-store',
    });
  } catch (error) {
    return json({
      ok: false,
      error: error?.message || 'Could not delete the TechGroup.',
    }, Number(error?.status) || 502, { 'Cache-Control': 'no-store' });
  }
}

async function handleJoinTechGroup(request, env = {}, encodedGroupId = '') {
  const authentication = await verifyFirebaseAuthenticatedRequest(request, env);
  if (!authentication.ok) return authentication.response;

  let groupId = '';
  try {
    groupId = decodeURIComponent(String(encodedGroupId || '')).trim();
  } catch (_) {
    return json({ ok: false, error: 'Invalid TechGroup ID.' }, 400, {
      'Cache-Control': 'no-store',
    });
  }

  if (!/^[A-Za-z0-9_-]{1,128}$/.test(groupId)) {
    return json({ ok: false, error: 'Invalid TechGroup ID.' }, 400, {
      'Cache-Control': 'no-store',
    });
  }

  const idToken = getFirebaseBearerToken(request);
  const uid = String(authentication.user?.localId || authentication.claims?.sub || '').trim();

  try {
    const group = await firebaseRealtimeRequest(env, `techgroups/${groupId}`, idToken, {
      method: 'GET',
    });
    if (!group || typeof group !== 'object') {
      return json({ ok: false, error: 'TechGroup entry not found.' }, 404, {
        'Cache-Control': 'no-store',
      });
    }

    if (group.banned_users && typeof group.banned_users === 'object' && group.banned_users[uid]) {
      return json({ ok: false, error: 'You are banned from this TechGroup.', banned: true }, 403, {
        'Cache-Control': 'no-store',
      });
    }

    await firebaseRealtimeRequest(env, `techgroups/${groupId}/members/${uid}`, idToken, {
      method: 'PUT',
      body: JSON.stringify(true),
    });

    return json({ ok: true, id: groupId, uid }, 200, {
      'Cache-Control': 'no-store',
    });
  } catch (error) {
    return json({
      ok: false,
      error: error?.message || 'Could not join the TechGroup entry.',
    }, Number(error?.status) || 502, { 'Cache-Control': 'no-store' });
  }
}


function parseTechGroupId(encodedGroupId = '') {
  try {
    const groupId = decodeURIComponent(String(encodedGroupId || '')).trim();
    return /^[A-Za-z0-9_-]{1,128}$/.test(groupId) ? groupId : '';
  } catch (_) {
    return '';
  }
}

function sanitizeTechGroupColor(value, fallback = '#9beef6') {
  const color = String(value || '').trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(color) ? color : fallback;
}

async function handleListTechGroupMessages(request, env = {}, encodedGroupId = '') {
  const authentication = await verifyFirebaseAuthenticatedRequest(request, env);
  if (!authentication.ok) return authentication.response;

  const groupId = parseTechGroupId(encodedGroupId);
  if (!groupId) return json({ ok: false, error: 'Invalid TechGroup ID.' }, 400, { 'Cache-Control': 'no-store' });

  const idToken = getFirebaseBearerToken(request);
  const uid = String(authentication.user?.localId || authentication.claims?.sub || '').trim();

  try {
    const group = await firebaseRealtimeRequest(env, `techgroups/${groupId}`, idToken, { method: 'GET' });
    if (!group || typeof group !== 'object') {
      return json({ ok: false, error: 'TechGroup entry not found.' }, 404, { 'Cache-Control': 'no-store' });
    }

    const creatorUid = String(group?.createdBy?.uid || group?.creatorUid || group?.createdBy || '').trim();
    const isCreator = creatorUid && creatorUid === uid;
    const isMember = Boolean(group?.members && typeof group.members === 'object' && group.members[uid]);
    const isBanned = Boolean(group?.banned_users && typeof group.banned_users === 'object' && group.banned_users[uid]);

    if (isBanned && !isCreator) {
      return json({ ok: false, error: 'You are banned from this TechGroup.', banned: true }, 403, {
        'Cache-Control': 'no-store',
      });
    }
    if (!isCreator && !isMember) {
      return json({ ok: false, error: 'Join this TechGroup before loading its conversation.' }, 403, {
        'Cache-Control': 'no-store',
      });
    }

    const requestUrl = new URL(request.url);
    const after = Math.max(0, Number(requestUrl.searchParams.get('after') || 0));
    const records = await firebaseRealtimeRequest(env, `techgroups/${groupId}/messages`, idToken, { method: 'GET' });
    const messages = Object.entries(records && typeof records === 'object' ? records : {})
      .map(([id, value]) => {
        const item = value && typeof value === 'object' ? value : {};
        return {
          id: String(id),
          uid: String(item.uid || ''),
          displayName: cleanTechGroupText(item.displayName || item.author || 'User', 120) || 'User',
          color: sanitizeTechGroupColor(item.color),
          text: cleanTechGroupText(item.text, 500),
          createdAt: Number(item.createdAt || 0),
        };
      })
      .filter((item) => item.id && item.text && (!after || item.createdAt > after))
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(-100);
    return json({ ok: true, messages }, 200, { 'Cache-Control': 'no-store' });
  } catch (error) {
    return json({ ok: false, error: error?.message || 'Could not load messages.' }, Number(error?.status) || 502, { 'Cache-Control': 'no-store' });
  }
}

async function handleCreateTechGroupMessage(request, env = {}, encodedGroupId = '') {
  const authentication = await verifyFirebaseAuthenticatedRequest(request, env);
  if (!authentication.ok) return authentication.response;
  const groupId = parseTechGroupId(encodedGroupId);
  if (!groupId) return json({ ok: false, error: 'Invalid TechGroup ID.' }, 400, { 'Cache-Control': 'no-store' });
  const body = await safeJson(request);
  const rawText = String(body?.text || '').trim();
  if (rawText.length > 500) return json({ ok: false, error: 'Messages can contain up to 500 characters.' }, 400, { 'Cache-Control': 'no-store' });
  const text = cleanTechGroupText(rawText, 500);
  const color = sanitizeTechGroupColor(body?.color);
  if (!text) return json({ ok: false, error: 'Message text is required.' }, 400, { 'Cache-Control': 'no-store' });
  const idToken = getFirebaseBearerToken(request);
  const uid = String(authentication.user?.localId || authentication.claims?.sub || '').trim();
  const displayName = cleanTechGroupText(
    authentication.user?.displayName || authentication.claims?.name || authentication.user?.email || 'User',
    120
  ) || 'User';
  try {
    const group = await firebaseRealtimeRequest(env, `techgroups/${groupId}`, idToken, { method: 'GET' });
    if (!group || typeof group !== 'object') return json({ ok: false, error: 'TechGroup entry not found.' }, 404, { 'Cache-Control': 'no-store' });

    const cooldownMs = 4000;
    const createdAt = Date.now();
    const lastMessageAt = Number(await firebaseRealtimeRequest(
      env,
      `techgroups/${groupId}/messageCooldowns/${uid}`,
      idToken,
      { method: 'GET' }
    ) || 0);
    const retryAfterMs = Math.max(0, cooldownMs - (createdAt - lastMessageAt));
    if (retryAfterMs > 0) {
      return json({
        ok: false,
        error: 'You can send one message every 4 seconds.',
        retryAfterMs,
      }, 429, {
        'Cache-Control': 'no-store',
        'Retry-After': String(Math.max(1, Math.ceil(retryAfterMs / 1000))),
      });
    }

    const created = await firebaseRealtimeRequest(env, `techgroups/${groupId}/messages`, idToken, {
      method: 'POST',
      body: JSON.stringify({ uid, displayName, color, text, createdAt }),
    });
    const id = String(created?.name || '').trim();
    if (!id) return json({ ok: false, error: 'Firebase saved the message but returned no message ID.' }, 502, { 'Cache-Control': 'no-store' });
    await firebaseRealtimeRequest(env, `techgroups/${groupId}/messageCooldowns/${uid}`, idToken, {
      method: 'PUT',
      body: JSON.stringify(createdAt),
    });
    return json({ ok: true, message: { id, uid, displayName, color, text, createdAt }, cooldownMs }, 201, { 'Cache-Control': 'no-store' });
  } catch (error) {
    return json({ ok: false, error: error?.message || 'Could not save the message.' }, Number(error?.status) || 502, { 'Cache-Control': 'no-store' });
  }
}

const CINEMA_SEAT_ROWS = 3;
const CINEMA_SEATS_PER_ROW = 8;
const CINEMA_TOTAL_SEATS = CINEMA_SEAT_ROWS * CINEMA_SEATS_PER_ROW;
const CINEMA_ALL_TIME_JOINS_STORAGE_KEY = 'cinemaAllTimeJoins';

function isCinemaRoomPageNavigation(request, url = new URL(request.url)) {
  if (request.method !== 'GET') return false;
  if (!/^\/apps\/room(?:\.html)?\/?$/i.test(url.pathname)) return false;
  const destination = String(request.headers.get('Sec-Fetch-Dest') || '').toLowerCase();
  if (destination && destination !== 'document') return false;
  const accept = String(request.headers.get('Accept') || '').toLowerCase();
  return !accept || accept.includes('text/html') || destination === 'document';
}

async function recordCinemaRoomNavigationJoin(url, env = {}) {
  if (!env.TECHGROUP_ROOMS || typeof env.TECHGROUP_ROOMS.idFromName !== 'function') return;
  const roomId = normalizeCinemaRoomId(url.searchParams.get('room') || 'room-1');
  if (!roomId) return;
  const groupId = `cinema-${roomId}`;
  const objectId = env.TECHGROUP_ROOMS.idFromName(groupId);
  const room = env.TECHGROUP_ROOMS.get(objectId);
  const response = await room.fetch(new Request(
    `https://cinema-room.internal/internal/cinema-join?groupId=${encodeURIComponent(groupId)}`,
    {
      method: 'POST',
      headers: { 'X-Cinema-Join': '1' },
    }
  ));
  if (!response.ok) throw new Error(`Cinema join counter failed (${response.status}).`);
}

function normalizeCinemaRoomId(value = '') {
  const text = String(value || '').trim();
  const match = text.match(/^(?:cinema-)?room-(\d+)$/i);
  if (!match) return '';
  const number = Math.max(1, Number.parseInt(match[1], 10) || 1);
  return `room-${number}`;
}

async function handleCinemaAvailability(request, env = {}) {
  if (!env.TECHGROUP_ROOMS || typeof env.TECHGROUP_ROOMS.idFromName !== 'function') {
    return json({ ok: false, error: 'Cinema room availability is not configured.' }, 503, {
      'Cache-Control': 'no-store',
    });
  }

  const url = new URL(request.url);
  const rawRooms = String(url.searchParams.get('rooms') || url.searchParams.get('room') || '');
  const roomIds = [...new Set(
    rawRooms
      .split(',')
      .map(normalizeCinemaRoomId)
      .filter(Boolean)
  )].slice(0, 100);

  if (!roomIds.length) {
    return json({ ok: true, totalSeats: CINEMA_TOTAL_SEATS, rooms: {} }, 200, {
      'Cache-Control': 'no-store',
    });
  }

  const entries = await Promise.all(roomIds.map(async (roomId) => {
    const socketGroupId = `cinema-${roomId}`;
    try {
      const objectId = env.TECHGROUP_ROOMS.idFromName(socketGroupId);
      const room = env.TECHGROUP_ROOMS.get(objectId);
      const response = await room.fetch(new Request(
        `https://cinema-room.internal/internal/cinema-availability?groupId=${encodeURIComponent(socketGroupId)}`,
        {
          method: 'GET',
          headers: { 'X-Cinema-Availability': '1' },
        }
      ));
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || `Cinema availability failed (${response.status}).`);
      return [roomId, {
        totalSeats: CINEMA_TOTAL_SEATS,
        occupiedSeats: Math.max(0, Math.min(CINEMA_TOTAL_SEATS, Number(payload?.occupiedSeats) || 0)),
        availableSeats: Math.max(0, Math.min(CINEMA_TOTAL_SEATS, Number(payload?.availableSeats) || 0)),
        allTimeJoins: Math.max(0, Math.trunc(Number(payload?.allTimeJoins) || 0)),
      }];
    } catch (error) {
      console.warn(`Could not read cinema availability for ${roomId}:`, error?.message || error);
      return [roomId, { totalSeats: CINEMA_TOTAL_SEATS, occupiedSeats: 0, availableSeats: 0, allTimeJoins: 0 }];
    }
  }));

  return json({
    ok: true,
    totalSeats: CINEMA_TOTAL_SEATS,
    rooms: Object.fromEntries(entries),
    serverTime: Date.now(),
  }, 200, {
    'Cache-Control': 'no-store',
  });
}

const TECHGROUP_SOCKET_ANIMATIONS = new Set([
  'idle',
  'walking',
  'jumping',
  'climbing',
  'seated',
]);

async function handleTechGroupSocket(request, env = {}) {
  if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
    return json({ ok: false, error: 'WebSocket upgrade required.' }, 426, {
      'Cache-Control': 'no-store',
    });
  }

  if (!env.TECHGROUP_ROOMS || typeof env.TECHGROUP_ROOMS.idFromName !== 'function') {
    return json({ ok: false, error: 'TechGroup WebSocket rooms are not configured.' }, 500, {
      'Cache-Control': 'no-store',
    });
  }

  const url = new URL(request.url);
  const groupId = String(url.searchParams.get('groupId') || '').trim();

  if (!/^[A-Za-z0-9_-]{1,128}$/.test(groupId)) {
    return json({ ok: false, error: 'Invalid TechGroup ID.' }, 400, {
      'Cache-Control': 'no-store',
    });
  }

  const objectId = env.TECHGROUP_ROOMS.idFromName(groupId);
  const room = env.TECHGROUP_ROOMS.get(objectId);
  return room.fetch(request);
}

async function verifyFirebaseTokenValue(idToken, env = {}) {
  const token = String(idToken || '').trim();
  if (!token) return { ok: false, error: 'A Firebase ID token is required.' };

  const verificationRequest = new Request('https://techgroup-auth.internal/', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const authentication = await verifyFirebaseAuthenticatedRequest(verificationRequest, env);

  if (!authentication.ok) {
    let error = 'Firebase authentication failed.';
    try {
      const payload = await authentication.response.clone().json();
      error = String(payload?.error || error);
    } catch (_) {}
    return { ok: false, error };
  }

  const uid = String(authentication.user?.localId || authentication.claims?.sub || '').trim();
  if (!uid) return { ok: false, error: 'The Firebase session has no user ID.' };

  return {
    ok: true,
    uid,
    user: authentication.user,
    claims: authentication.claims,
  };
}

function clampTechGroupMovement(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number));
}

function sanitizeTechGroupAnimation(value) {
  const animation = String(value || '').toLowerCase();
  return TECHGROUP_SOCKET_ANIMATIONS.has(animation) ? animation : 'idle';
}

function sanitizeTechGroupDirection(value) {
  return Number(value) < 0 ? -1 : 1;
}

function techGroupSocketAttachment(socket) {
  try {
    return socket.deserializeAttachment?.() || {};
  } catch (_) {
    return {};
  }
}

function sanitizeTechGroupPhotoUrl(value) {
  const text = String(value || '').trim();
  if (!text || text.length > 2048) return '';
  try {
    const parsed = new URL(text);
    return parsed.protocol === 'https:' ? parsed.toString() : '';
  } catch (_) {
    return '';
  }
}

function techGroupPublicPlayerState(attachment = {}) {
  return {
    uid: String(attachment.uid || ''),
    displayName: String(attachment.displayName || ''),
    color: sanitizeTechGroupColor(attachment.color),
    photoURL: sanitizeTechGroupPhotoUrl(attachment.photoURL),
    x: clampTechGroupMovement(attachment.x),
    y: clampTechGroupMovement(attachment.y),
    direction: sanitizeTechGroupDirection(attachment.direction),
    animation: sanitizeTechGroupAnimation(attachment.animation),
    sequence: Math.max(0, Math.floor(Number(attachment.lastSequence) || 0)),
    sentAt: Math.max(0, Math.floor(Number(attachment.sentAt) || 0)),
    view: ['front','back','left','right','seated'].includes(String(attachment.view || '')) ? String(attachment.view) : 'front',
    moving: attachment.moving === true,
    sitting: attachment.sitting === true,
    row: Number.isInteger(Number(attachment.row)) ? Number(attachment.row) : null,
    seat: Number.isInteger(Number(attachment.seat)) ? Number(attachment.seat) : null,
  };
}



function techGroupPresenceRecord(attachment = {}) {
  const player = techGroupPublicPlayerState(attachment);
  return {
    uid: player.uid,
    displayName: player.displayName,
    color: player.color,
    photoURL: player.photoURL || '',
    x: player.x,
    y: player.y,
    direction: player.direction,
    animation: player.animation,
    sequence: player.sequence,
    sentAt: player.sentAt || Date.now(),
  };
}

async function writeTechGroupPublicPresence(env, attachment = {}) {
  const groupId = String(attachment.groupId || '');
  const uid = String(attachment.uid || '');
  const idToken = String(attachment.idToken || '');
  if (!groupId || !uid || !idToken) return;
  await firebaseRealtimeRequest(env, `public_techgroups/${groupId}/users/${uid}`, idToken, {
    method: 'PUT',
    body: JSON.stringify(techGroupPresenceRecord(attachment)),
  });
}

async function removeTechGroupPublicPresence(env, attachment = {}) {
  const groupId = String(attachment.groupId || '');
  const uid = String(attachment.uid || '');
  const idToken = String(attachment.idToken || '');
  if (!groupId || !uid || !idToken) return;
  await firebaseRealtimeRequest(env, `public_techgroups/${groupId}/users/${uid}`, idToken, {
    method: 'DELETE',
  });
}

export class TechGroupRoom {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (
      request.method === 'POST'
      && url.pathname === '/internal/cinema-join'
      && request.headers.get('X-Cinema-Join') === '1'
    ) {
      const groupId = String(url.searchParams.get('groupId') || '').trim();
      if (!/^cinema-room-\d+$/i.test(groupId)) {
        return new Response(JSON.stringify({ ok: false, error: 'Invalid cinema room.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
        });
      }

      let allTimeJoins = 0;
      await this.ctx.storage.transaction(async (txn) => {
        const current = Math.max(0, Math.trunc(Number(await txn.get(CINEMA_ALL_TIME_JOINS_STORAGE_KEY)) || 0));
        allTimeJoins = Math.min(Number.MAX_SAFE_INTEGER, current + 1);
        await txn.put(CINEMA_ALL_TIME_JOINS_STORAGE_KEY, allTimeJoins);
      });

      return new Response(JSON.stringify({ ok: true, allTimeJoins, serverTime: Date.now() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }

    if (
      request.method === 'GET'
      && url.pathname === '/internal/cinema-availability'
      && request.headers.get('X-Cinema-Availability') === '1'
    ) {
      const groupId = String(url.searchParams.get('groupId') || '').trim();
      const occupied = new Set();

      for (const socket of this.ctx.getWebSockets()) {
        const state = techGroupSocketAttachment(socket);
        if (state.spectator || state.replaced || state.roomType !== 'cinema') continue;
        if (groupId && String(state.groupId || '') !== groupId) continue;
        if (!String(state.uid || '')) continue;
        if (state.sitting !== true && String(state.animation || '') !== 'seated') continue;

        const row = Number(state.row);
        const seat = Number(state.seat);
        if (!Number.isInteger(row) || row < 0 || row >= CINEMA_SEAT_ROWS) continue;
        if (!Number.isInteger(seat) || seat < 0 || seat >= CINEMA_SEATS_PER_ROW) continue;
        occupied.add(`${row}:${seat}`);
      }

      const occupiedSeats = Math.min(CINEMA_TOTAL_SEATS, occupied.size);
      const allTimeJoins = Math.max(0, Math.trunc(Number(await this.ctx.storage.get(CINEMA_ALL_TIME_JOINS_STORAGE_KEY)) || 0));
      return new Response(JSON.stringify({
        ok: true,
        totalSeats: CINEMA_TOTAL_SEATS,
        occupiedSeats,
        availableSeats: Math.max(0, CINEMA_TOTAL_SEATS - occupiedSeats),
        allTimeJoins,
        serverTime: Date.now(),
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }

    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('WebSocket upgrade required.', {
        status: 426,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const groupId = String(url.searchParams.get('groupId') || '').trim();
    const cinemaMode = url.pathname === '/api/cinema/socket' || /^cinema-room-\d+$/i.test(groupId);
    const previewMode = !cinemaMode && url.searchParams.get('mode') === 'preview';
    const idToken = String(url.searchParams.get('token') || '').trim();
    const color = sanitizeTechGroupColor(url.searchParams.get('color'));

    if (!/^[A-Za-z0-9_-]{1,128}$/.test(groupId)) {
      return new Response('Invalid TechGroup ID.', {
        status: 400,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    let authentication = null;
    if (!previewMode) {
      authentication = await verifyFirebaseTokenValue(idToken, this.env);
      if (!authentication.ok) {
        return new Response(authentication.error || 'Unauthorized.', {
          status: 401,
          headers: { 'Cache-Control': 'no-store' },
        });
      }
    }

    let isCreator = false;
    let storedCreatorUid = '';
    let bannedUsers = {};
    // Cinema rooms reuse the Durable Object transport, but they are not TechGroup
    // database records. Authenticate the user, then skip TechGroup ownership/ban lookup.
    if (!cinemaMode && !previewMode && authentication?.uid) {
      try {
        const groupRecord = await firebaseRealtimeRequest(this.env, `techgroups/${groupId}`, idToken, { method: 'GET' });
        storedCreatorUid = String(
          groupRecord?.createdBy?.uid ||
          groupRecord?.creatorUid ||
          groupRecord?.createdBy ||
          ''
        );
        isCreator = storedCreatorUid === String(authentication.uid);
        bannedUsers = groupRecord?.banned_users && typeof groupRecord.banned_users === 'object'
          ? groupRecord.banned_users
          : {};
        if (!isCreator && bannedUsers[String(authentication.uid)]) {
          return new Response('You are banned from this TechGroup.', {
            status: 403,
            headers: { 'Cache-Control': 'no-store' },
          });
        }
      } catch (error) {
        if (Number(error?.status) === 403) throw error;
        isCreator = false;
        bannedUsers = {};
      }
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    const displayName = previewMode ? '' : String(
      authentication.user?.displayName ||
      authentication.claims?.name ||
      authentication.user?.email ||
      ''
    ).slice(0, 120);

    const attachment = {
      spectator: previewMode,
      isCreator,
      creatorUid: storedCreatorUid || '',
      idToken: previewMode ? '' : idToken,
      uid: previewMode ? '' : authentication.uid,
      displayName,
      color,
      photoURL: previewMode ? '' : sanitizeTechGroupPhotoUrl(
        authentication.user?.photoUrl ||
        authentication.user?.photoURL ||
        authentication.claims?.picture ||
        ''
      ),
      groupId,
      roomType: cinemaMode ? 'cinema' : 'techgroup',
      x: 0.5,
      y: 0.5,
      direction: 1,
      animation: 'idle',
      view: 'front',
      moving: false,
      sitting: false,
      row: null,
      seat: null,
      lastSequence: 0,
      sentAt: Date.now(),
    };

    server.serializeAttachment(attachment);
    this.ctx.acceptWebSocket(server);

    if (!previewMode && !cinemaMode) {
      try { await writeTechGroupPublicPresence(this.env, attachment); }
      catch (error) { console.warn('Could not publish TechGroup presence:', error?.message || error); }
    }

    // One active room session per authenticated account. A newer browser/device
    // connection takes ownership and the previous socket is explicitly retired.
    if (!previewMode && attachment.uid) {
      for (const existingSocket of this.ctx.getWebSockets()) {
        if (existingSocket === server) continue;
        const existingState = techGroupSocketAttachment(existingSocket);
        if (existingState.spectator || String(existingState.uid || '') !== attachment.uid) continue;

        existingSocket.serializeAttachment({
          ...existingState,
          replaced: true,
          suppressLeave: true,
        });
        try {
          existingSocket.send(JSON.stringify({
            type: 'session-replaced',
            groupId,
            uid: attachment.uid,
            serverTime: Date.now(),
          }));
        } catch (_) {}
        try { existingSocket.close(4001, 'Signed in from another browser or device'); } catch (_) {}
      }
    }

    const playerByUid = new Map();
    for (const existingSocket of this.ctx.getWebSockets()) {
      if (existingSocket === server) continue;
      const state = techGroupSocketAttachment(existingSocket);
      if (state.spectator || state.replaced || !state.uid || state.uid === attachment.uid) continue;
      playerByUid.set(String(state.uid), techGroupPublicPlayerState(state));
    }
    const existingPlayers = [...playerByUid.values()];

    server.send(JSON.stringify({
      type: 'room-state',
      groupId,
      players: existingPlayers,
      youAreCreator: Boolean(attachment.isCreator),
      creatorUid: String(attachment.creatorUid || ''),
      bannedUsers: attachment.isCreator
        ? Object.entries(bannedUsers).map(([uid, value]) => ({
            uid: String(uid),
            displayName: String(value?.displayName || value?.username || 'User').slice(0, 120),
            photoURL: sanitizeTechGroupPhotoUrl(value?.photoURL),
            color: sanitizeTechGroupColor(value?.color),
            bannedAt: Math.max(0, Math.floor(Number(value?.bannedAt) || 0)),
            bannedBy: String(value?.bannedBy || ''),
          }))
        : [],
      serverTime: Date.now(),
    }));

    if (!previewMode) {
      this.broadcast({
        type: 'player-joined',
        groupId,
        player: techGroupPublicPlayerState(attachment),
        serverTime: Date.now(),
      }, server);
    }

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(socket, message) {
    if (typeof message !== 'string' && !(message instanceof ArrayBuffer)) return;

    let payload;
    try {
      const text = typeof message === 'string'
        ? message
        : new TextDecoder().decode(message);
      payload = JSON.parse(text);
    } catch (_) {
      return;
    }

    if (payload?.type === 'ping') {
      socket.send(JSON.stringify({ type: 'pong', serverTime: Date.now() }));
      return;
    }

    const currentAttachment = techGroupSocketAttachment(socket);
    if (currentAttachment.spectator || currentAttachment.replaced) return;

    if (payload?.type === 'ban-player') {
      const attachment = techGroupSocketAttachment(socket);
      if (!attachment.isCreator) return;
      const targetUid = String(payload?.uid || '').trim();
      if (
        !targetUid ||
        targetUid === String(attachment.uid || '') ||
        targetUid === String(attachment.creatorUid || '') ||
        !/^[A-Za-z0-9_-]{1,160}$/.test(targetUid)
      ) return;

      let targetState = null;
      for (const targetSocket of this.ctx.getWebSockets()) {
        const candidate = techGroupSocketAttachment(targetSocket);
        if (!candidate.spectator && !candidate.replaced && String(candidate.uid || '') === targetUid) {
          targetState = candidate;
          break;
        }
      }
      const record = {
        uid: targetUid,
        displayName: String(targetState?.displayName || payload?.displayName || 'User').slice(0, 120),
        photoURL: sanitizeTechGroupPhotoUrl(targetState?.photoURL || payload?.photoURL),
        color: sanitizeTechGroupColor(targetState?.color || payload?.color),
        bannedAt: Date.now(),
        bannedBy: String(attachment.uid || ''),
      };
      try {
        await firebaseRealtimeRequest(this.env, `techgroups/${attachment.groupId}/banned_users/${targetUid}`, attachment.idToken, {
          method: 'PUT',
          body: JSON.stringify(record),
        });
      } catch (_) { return; }

      for (const targetSocket of this.ctx.getWebSockets()) {
        const target = techGroupSocketAttachment(targetSocket);
        if (target.spectator || target.replaced || String(target.uid || '') !== targetUid) continue;
        targetSocket.serializeAttachment({ ...target, suppressLeave: true, kicked: true, banned: true });
        try { await removeTechGroupPublicPresence(this.env, target); } catch (_) {}
        try { targetSocket.send(JSON.stringify({ type: 'banned', groupId: String(attachment.groupId || ''), by: String(attachment.uid || ''), serverTime: Date.now() })); } catch (_) {}
        try { targetSocket.close(4004, 'Banned by room creator'); } catch (_) {}
        this.broadcast({ type: 'player-left', groupId: String(attachment.groupId || ''), uid: targetUid, serverTime: Date.now() }, targetSocket);
      }
      this.sendToCreators({ type: 'ban-list-updated', action: 'banned', user: record, groupId: String(attachment.groupId || ''), serverTime: Date.now() });
      return;
    }

    if (payload?.type === 'unban-player') {
      const attachment = techGroupSocketAttachment(socket);
      if (!attachment.isCreator) return;
      const targetUid = String(payload?.uid || '').trim();
      if (!targetUid || !/^[A-Za-z0-9_-]{1,160}$/.test(targetUid)) return;
      try {
        await firebaseRealtimeRequest(this.env, `techgroups/${attachment.groupId}/banned_users/${targetUid}`, attachment.idToken, {
          method: 'DELETE',
        });
      } catch (_) { return; }
      this.sendToCreators({ type: 'ban-list-updated', action: 'unbanned', uid: targetUid, groupId: String(attachment.groupId || ''), serverTime: Date.now() });
      return;
    }

    if (payload?.type === 'kick-player') {
      const attachment = techGroupSocketAttachment(socket);
      if (!attachment.isCreator) return;
      const targetUid = String(payload?.uid || '').trim();
      if (!targetUid || targetUid === String(attachment.uid || '')) return;
      for (const targetSocket of this.ctx.getWebSockets()) {
        const target = techGroupSocketAttachment(targetSocket);
        if (target.spectator || target.replaced || String(target.uid || '') !== targetUid) continue;
        targetSocket.serializeAttachment({ ...target, suppressLeave: true, kicked: true });
        try { await removeTechGroupPublicPresence(this.env, target); } catch (_) {}
        try { targetSocket.send(JSON.stringify({ type: 'kicked', groupId: String(attachment.groupId || ''), by: String(attachment.uid || ''), serverTime: Date.now() })); } catch (_) {}
        try { targetSocket.close(4003, 'Kicked by room creator'); } catch (_) {}
        this.broadcast({ type: 'player-left', groupId: String(attachment.groupId || ''), uid: targetUid, serverTime: Date.now() }, targetSocket);
        break;
      }
      return;
    }

    if (payload?.type === 'chat-message') {
      const attachment = techGroupSocketAttachment(socket);
      const raw = payload?.message && typeof payload.message === 'object' ? payload.message : {};
      const message = {
        id: String(raw.id || '').slice(0, 160),
        uid: String(attachment.uid || ''),
        displayName: String(raw.displayName || attachment.displayName || 'User').slice(0, 120),
        color: sanitizeTechGroupColor(raw.color || attachment.color),
        text: String(raw.text || '').trim().slice(0, 1200),
        createdAt: Math.max(0, Math.floor(Number(raw.createdAt) || Date.now())),
      };
      if (!message.id || !message.text) return;
      this.broadcast({
        type: 'message-created',
        groupId: String(attachment.groupId || ''),
        message,
        serverTime: Date.now(),
      }, socket);
      return;
    }

    if (payload?.type !== 'movement') return;

    const attachment = techGroupSocketAttachment(socket);
    const sequence = Math.max(0, Math.floor(Number(payload.sequence) || 0));
    if (sequence <= Math.max(0, Math.floor(Number(attachment.lastSequence) || 0))) return;

    const nextAttachment = {
      ...attachment,
      x: clampTechGroupMovement(payload.x),
      y: clampTechGroupMovement(payload.y),
      direction: sanitizeTechGroupDirection(payload.direction),
      animation: sanitizeTechGroupAnimation(payload.animation),
      view: ['front','back','left','right','seated'].includes(String(payload.view || '')) ? String(payload.view) : 'front',
      moving: payload.moving === true || String(payload.animation || '') === 'walking',
      sitting: payload.sitting === true || String(payload.animation || '') === 'seated',
      row: Number.isInteger(Number(payload.row)) ? Math.max(0, Math.min(3, Number(payload.row))) : null,
      seat: Number.isInteger(Number(payload.seat)) ? Math.max(0, Math.min(7, Number(payload.seat))) : null,
      lastSequence: sequence,
      sentAt: Date.now(),
    };
    socket.serializeAttachment(nextAttachment);

    if (nextAttachment.roomType !== 'cinema') {
      try { await writeTechGroupPublicPresence(this.env, nextAttachment); }
      catch (error) { console.warn('Could not update TechGroup presence:', error?.message || error); }
    }

    this.broadcast({
      type: 'player-update',
      groupId: String(nextAttachment.groupId || ''),
      player: techGroupPublicPlayerState(nextAttachment),
      serverTime: Date.now(),
    }, socket);
  }

  async webSocketClose(socket) {
    await this.removeAndBroadcastPlayerLeft(socket);
  }

  async webSocketError(socket) {
    await this.removeAndBroadcastPlayerLeft(socket);
  }

  async removeAndBroadcastPlayerLeft(socket) {
    const attachment = techGroupSocketAttachment(socket);
    if (attachment.suppressLeave || attachment.replaced) return;
    if (attachment.roomType !== 'cinema') {
      try { await removeTechGroupPublicPresence(this.env, attachment); } catch (_) {}
    }
    const uid = String(attachment.uid || '');
    if (!uid) return;

    this.broadcast({
      type: 'player-left',
      groupId: String(attachment.groupId || ''),
      uid,
      serverTime: Date.now(),
    }, socket);
  }

  sendToCreators(payload) {
    const encoded = JSON.stringify(payload);
    for (const socket of this.ctx.getWebSockets()) {
      const attachment = techGroupSocketAttachment(socket);
      if (attachment.spectator || attachment.replaced || !attachment.isCreator) continue;
      try { socket.send(encoded); } catch (_) {}
    }
  }

  broadcast(payload, excludedSocket = null) {
    const encoded = JSON.stringify(payload);
    for (const socket of this.ctx.getWebSockets()) {
      if (socket === excludedSocket) continue;
      try {
        socket.send(encoded);
      } catch (_) {}
    }
  }
}

async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function safeSameOriginUrl(value, appUrl) {
  if (!value) return "";

  try {
    const base = new URL(appUrl);
    const url = new URL(String(value), base);
    return url.origin === base.origin ? url.href : "";
  } catch {
    return "";
  }
}

function normalizeBaseUrl(value) {
  return String(value).replace(/\/$/, '');
}

function json(data, status = 200, extraHeaders = {}) {
  return withCors(new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders,
    }
  }));
}

function withCors(response) {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Stripe-Signature, Range, If-Range');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function htmlResponse(body, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function apiDebugEnabled(env = {}) {
  return String(env?.ENABLE_API_DEBUG || '').toLowerCase() === 'true';
}


function renderCheckoutClosePage(title, message, returnUrl) {
  const returnUrlJson = JSON.stringify(returnUrl).replaceAll('<', '\\u003C');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} - Biological Machinery</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; color: #f7fbff; background: #000; }
    main { width: min(390px, calc(100% - 36px)); padding: 26px; border: 1px solid rgba(255,255,255,.16); border-radius: 26px; background: #151719; box-shadow: 0 20px 60px rgba(0,0,0,.42); }
    h1 { margin: 0; font-size: 1.35rem; line-height: 1.1; }
    p { margin: 12px 0 0; color: rgba(247,251,255,.72); line-height: 1.5; }
    .actions { display: none; gap: 12px; flex-wrap: wrap; margin-top: 18px; }
    body.show-fallback .actions { display: flex; }
    button, a { min-height: 42px; padding: 0 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; font: inherit; font-weight: 900; text-decoration: none; cursor: pointer; }
    button { border: 0; color: #07111f; background: #f7fbff; }
    a { color: #9beef6; background: transparent; text-decoration: underline; text-underline-offset: 4px; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <p>This checkout popup should close automatically.</p>
    <div class="actions">
      <button type="button" onclick="window.close()">Close window</button>
      <a href="${escapeHtml(returnUrl)}">Return to product</a>
    </div>
  </main>
  <script>
    (() => {
      const returnUrl = ${returnUrlJson};
      let notifiedOpener = false;

      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: "biologicalMachinery.checkout.cancelled",
            returnUrl
          }, window.location.origin);
          notifiedOpener = true;
        }
      } catch (_) {}

      if (notifiedOpener) {
        window.setTimeout(() => window.close(), 80);
        window.setTimeout(() => document.body.classList.add("show-fallback"), 650);
        return;
      }

      window.location.replace(returnUrl);
    })();
  </script>
</body>
</html>`;
}

function renderStatusPage(title, message) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} - Biological Machinery</title>
  <link rel="stylesheet" href="/styles.css" />
  <style>
    .payment-status-shell {
      min-height: calc(100vh - 180px);
      display: grid;
      align-items: center;
      padding-top: clamp(56px, 8vw, 110px);
      padding-bottom: clamp(56px, 8vw, 110px);
    }

    .payment-status-panel {
      width: min(960px, 100%);
      margin: 0 auto;
    }

    .payment-status-panel .eyebrow {
      color: #9beef6;
    }

    .payment-status-panel .actions {
      margin-bottom: 0;
    }
  </style>
</head>
<body>
  <div class="page">
    <div data-site-topbar=""></div>
    <main class="shell payment-status-shell">
      <section class="hero payment-status-panel">
        <p class="eyebrow">Payment Status</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="lede">${escapeHtml(message)}</p>
        <div class="actions"><a class="button-link" href="/bitems/">Back to BItems</a></div>
      </section>
    </main>
    <div data-site-footer=""></div>
  </div>
  <script src="/app.js" type="module"></script>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
async function sendContactRequest(request, env) {
  const body = await safeJson(request);

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();
  const page = String(body.page || "").trim();

  if (!name) return json({ ok: false, error: "Name is required." }, 400);
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return json({ ok: false, error: "A valid email is required." }, 400);
  }
  if (!subject) return json({ ok: false, error: "Subject is required." }, 400);
  if (!message) return json({ ok: false, error: "Message is required." }, 400);

  if (!env.RESEND_API_KEY) {
    return json({ ok: false, error: "RESEND_API_KEY is not configured." }, 500);
  }

  const supportEmail = env.SUPPORT_EMAIL || "support@bi-mach.com";
  const fromEmail = env.CONTACT_FROM || "Biological Machinery <support@bi-mach.com>";

  const text = [
    `New support request`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    `Page: ${page}`,
    ``,
    `Message:`,
    message
  ].join("\n");

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [supportEmail],
      reply_to: email,
      subject: `Support request: ${subject}`,
      text
    })
  });

  const data = await resendResponse.json().catch(() => ({}));

  if (!resendResponse.ok) {
    return json({
      ok: false,
      error: data.message || data.error || "Email provider failed.",
      provider: data
    }, 502);
  }

  return json({
    ok: true,
    message: "Support request sent.",
    id: data.id || null
  });
}
// Wikipedia -> OMDb movie matcher pipeline.
// Pipeline:
// 1) Search Wikipedia for likely film pages based on the selected word.
// 2) For each Wikipedia candidate, try to verify/find the movie on OMDb.
// 3) Only return a final match when OMDb is found.
// 4) Return OMDb title, full plot, poster, and up to 10 images from OMDb + Wikipedia/Wikimedia Commons.
//
// Required secret:
//   wrangler secret put OMDB_API_KEY
// Optional:
//   wrangler secret put WIKIPEDIA_USER_AGENT

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'from',
  'has', 'have', 'in', 'into', 'is', 'it', 'its', 'of', 'on', 'or', 'that',
  'the', 'their', 'to', 'with', 'without', 'who', 'whose', 'you', 'your',
]);

const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const OMDB_API = 'https://www.omdbapi.com/';

function cleanDescription(value) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(value) {
  return String(value ?? '').toLowerCase().match(/[a-z0-9']+/g)?.filter((token) => !STOPWORDS.has(token)) ?? [];
}

function sequenceSimilarity(a, b) {
  a = String(a ?? '');
  b = String(b ?? '');
  if (!a || !b) return 0;
  if (a === b) return 1;

  // Longest-common-substring similarity with O(min(a,b)) memory instead of
  // allocating a full O(a*b) matrix for every token comparison.
  if (a.length < b.length) [a, b] = [b, a];

  const previous = new Uint16Array(b.length + 1);
  const current = new Uint16Array(b.length + 1);
  let longest = 0;

  for (let i = 1; i <= a.length; i += 1) {
    current.fill(0);
    for (let j = 1; j <= b.length; j += 1) {
      if (a.charCodeAt(i - 1) === b.charCodeAt(j - 1)) {
        const value = previous[j - 1] + 1;
        current[j] = value;
        if (value > longest) longest = value;
      }
    }
    previous.set(current);
  }

  return (2 * longest) / (a.length + b.length);
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

async function mapWithConcurrency(items, limit, task) {
  const values = Array.from(items || []);
  if (!values.length) return [];

  const results = new Array(values.length);
  let cursor = 0;
  const workerCount = Math.max(1, Math.min(Number(limit) || 1, values.length));

  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= values.length) return;
      results[index] = await task(values[index], index);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

function clamp01(value) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(value, 1);
}

function wikiHeaders(env = {}) {
  const userAgent = cleanDescription(env?.WIKIPEDIA_USER_AGENT || 'biological-machinery-movie-match/1.0 (Wikipedia + OMDb movie matcher)');
  return {
    Accept: 'application/json',
    'User-Agent': userAgent,
    'Api-User-Agent': userAgent,
  };
}

async function fetchJson(url, params = {}, headers = {}) {
  const fullUrl = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      fullUrl.searchParams.set(key, value);
    }
  }

  const request = new Request(fullUrl.toString(), { headers });
  const cache = typeof caches !== 'undefined' ? caches.default : null;

  try {
    if (cache) {
      const cached = await cache.match(request);
      if (cached) return await cached.json();
    }

    const response = await fetch(request);
    const data = await response.clone().json().catch(() => ({}));

    if (!response.ok) {
      return { __http_status: response.status, error: data?.error || data };
    }

    if (cache) {
      const cacheHeaders = new Headers(response.headers);
      cacheHeaders.set('Cache-Control', 'public, max-age=21600, s-maxage=21600');
      const cacheResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: cacheHeaders,
      });
      await cache.put(request, cacheResponse).catch(() => {});
    }

    return data;
  } catch (error) {
    return { __error: error.message || 'Fetch failed' };
  }
}

function extractYearFromText(value) {
  const match = String(value || '').match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
  return match ? match[1] : '';
}

function cleanWikipediaMovieTitle(title) {
  return cleanDescription(title)
    .replace(/\s*\((18|19|20)\d{2}\s+film\)$/i, '')
    .replace(/\s*\((18|19|20)\d{2}\s+movie\)$/i, '')
    .replace(/\s*\(film\)$/i, '')
    .replace(/\s*\(movie\)$/i, '')
    .trim();
}

function categoryText(page) {
  return (page?.categories || [])
    .map((category) => cleanDescription(category.title || '').replace(/^Category:/i, ''))
    .join(' ');
}

function looksLikeMoviePage(page) {
  const title = cleanDescription(page?.title || '');
  const extract = cleanDescription(page?.extract || '');
  const categories = categoryText(page);
  const haystack = `${title} ${extract} ${categories}`.toLowerCase();

  if (/\b(disambiguation|soundtrack album|episode|television series|tv series|novel|book|song|album|video game)\b/.test(haystack)) {
    if (!/\bfilm\b|\bmovie\b|\bfeature film\b|\bdirected by\b|\bstarring\b/.test(haystack)) return false;
  }

  return /\bfilm\b|\bmovie\b|\bfeature film\b|\bdirected by\b|\bstarring\b|\bcast\b|\bscreenplay\b|\bcinema\b/.test(haystack);
}

function getWikipediaImageUrl(page) {
  return cleanDescription(page?.original?.source || page?.thumbnail?.source || '');
}

function getWikipediaPageUrl(page) {
  if (page?.fullurl) return cleanDescription(page.fullurl);
  const title = cleanDescription(page?.title || '');
  return title ? `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(' ', '_'))}` : '';
}

async function fetchWikipediaMoviePages(searchQuery, limit, env) {
  const payload = await fetchJson(WIKIPEDIA_API, {
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'search',
    gsrsearch: searchQuery,
    gsrnamespace: '0',
    gsrlimit: String(Math.max(1, Math.min(limit, 20))),
    prop: 'extracts|pageimages|info|categories',
    explaintext: '1',
    exchars: '3200',
    exlimit: 'max',
    piprop: 'thumbnail|original|name',
    pithumbsize: '1400',
    inprop: 'url',
    cllimit: '40',
  }, wikiHeaders(env));

  if (payload?.error?.info) {
    console.warn(`Wikipedia search failed: ${payload.error.info}`);
    return [];
  }
  if (payload?.__http_status) {
    console.warn(`Wikipedia search failed with HTTP ${payload.__http_status}.`);
    return [];
  }
  if (payload?.__error) {
    console.warn(`Wikipedia search failed: ${payload.__error}`);
    return [];
  }

  const pages = Array.isArray(payload?.query?.pages) ? payload.query.pages : [];
  pages.sort((a, b) => (a.index ?? 999999) - (b.index ?? 999999));
  return pages;
}

function scoreCandidate(query, candidate) {
  const qNorm = normalize(query);
  const qTokens = tokenize(qNorm).length ? tokenize(qNorm) : [qNorm];
  const qSet = new Set(qTokens);
  const descriptionText = `${candidate.description || ''} ${candidate.categories || ''}`;
  const descTokens = tokenize(descriptionText);
  const titleTokens = tokenize(candidate.title);
  const descSet = new Set(descTokens);
  const titleSet = new Set(titleTokens);

  const descriptionOverlap = [...qSet].filter((token) => descSet.has(token)).length / Math.max(qSet.size, 1);
  const titleOverlap = [...qSet].filter((token) => titleSet.has(token)).length / Math.max(qSet.size, 1);
  const fuzzyDescription = average(qTokens.map((qToken) => {
    if (!descTokens.length) return 0;
    return Math.max(...descTokens.slice(0, 700).map((token) => sequenceSimilarity(qToken, token)));
  }));
  const descriptionPhrase = sequenceSimilarity(qNorm, normalize(descriptionText.slice(0, 1600)));
  const titleSimilarity = sequenceSimilarity(qNorm, normalize(candidate.title));
  let score = 0.66 * descriptionOverlap + 0.22 * fuzzyDescription + 0.07 * descriptionPhrase + 0.03 * Math.min(titleOverlap, 1) + 0.02 * titleSimilarity;
  if (descriptionOverlap === 0 && fuzzyDescription < 0.78) score *= 0.72;
  return { score: clamp01(score) };
}


function queryContentTokens(query) {
  return dedupeBy(
    tokenize(query)
      .map((token) => token.replace(/'s$/i, ''))
      .filter((token) => token.length > 2 && !['film', 'movie', 'cinema', 'plot', 'feature', 'story', 'scene'].includes(token)),
    (token) => token,
  );
}

function movieSearchText(candidate) {
  return normalize(`${candidate?.title || ''} ${candidate?.wikipedia_title || ''} ${candidate?.description || ''} ${candidate?.categories || ''} ${candidate?.genres || ''}`);
}

function genreContentTokens(value) {
  return dedupeBy(
    tokenize(value)
      .map((token) => token.replace(/'s$/i, ''))
      .filter((token) => token.length > 2 && ![
        'film', 'movie', 'cinema', 'plot', 'feature', 'story', 'scene',
        'genre', 'horror', 'random', 'any',
      ].includes(token)),
    (token) => token,
  );
}

function candidateMatchesDescriptionWords(words, candidate) {
  const tokens = genreContentTokens(words.join(' '));
  if (!tokens.length) return true;

  const textTokens = tokenize(movieSearchText(candidate));
  const textTokenSet = new Set(textTokens);
  const matches = tokens.filter((token) => {
    if (textTokenSet.has(token)) return true;
    return textTokens.some((candidateToken) => sequenceSimilarity(token, candidateToken) >= 0.88);
  }).length;

  if (tokens.length <= 2) return matches >= tokens.length;
  return matches >= Math.min(tokens.length, 2);
}

function genreTokensForSearch(genre = 'horror') {
  const label = normalize(genre) === 'sci-fi' ? 'scifi' : normalize(genre);
  if (label === 'comedy') return ['comedy', 'comedies', 'comic', 'romantic comedy', 'black comedy', 'satire', 'satirical'];
  if (label === 'drama') return ['drama', 'dramatic', 'melodrama', 'period drama', 'family drama', 'legal drama', 'crime drama'];
  if (label === 'action') return ['action', 'action thriller', 'martial arts', 'adventure', 'spy action', 'combat', 'gunfight', 'explosive'];
  if (label === 'fantasy') return ['fantasy', 'fantasy adventure', 'magic', 'dragon', 'sorcery', 'mythic', 'quest'];
  if (label === 'experimental') return ['experimental', 'avant-garde', 'surreal', 'art film', 'nonlinear', 'dreamlike', 'abstract'];
  if (label === 'scifi') return ['science fiction', 'sci-fi', 'scifi', 'space', 'alien', 'ufo', 'futuristic', 'cyberpunk'];
  if (label === 'romance') return ['romance', 'romantic', 'love story', 'romantic drama', 'relationship', 'passion', 'heartfelt'];
  if (label === 'animation') return ['animation', 'animated', 'cartoon', 'family animation', 'animated adventure', 'pixar-style', 'anime'];
  return ['horror', 'supernatural horror', 'slasher', 'psychological horror', 'folk horror', 'body horror'];
}

function isGenreCandidate(candidate, genre = 'horror') {
  const haystack = movieSearchText(candidate);
  return genreTokensForSearch(genre).some((token) => haystack.includes(normalize(token)));
}

function isHorrorCandidate(candidate) {
  return isGenreCandidate(candidate, 'horror');
}

function isGenreOmdb(omdb, wikiCandidate = {}, genre = 'horror') {
  const haystack = normalize([
    omdb?.Genre,
    omdb?.Plot,
    wikiCandidate?.description,
    wikiCandidate?.categories,
  ].join(' '));
  return genreTokensForSearch(genre).some((token) => haystack.includes(normalize(token)));
}

function isHorrorOmdb(omdb, wikiCandidate = {}) {
  return isGenreOmdb(omdb, wikiCandidate, 'horror');
}

function shuffleItems(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildHorrorSearches(words = [], genre = 'horror') {
  const label = normalize(genre) || 'horror';
  const tokens = genreContentTokens(words.join(' '));
  const joined = tokens.join(' ');

  if (joined) {
    if (label === 'comedy') {
      return dedupeBy([
        `${joined} comedy film`,
        `${joined} comedy movie plot`,
        `${joined} romantic comedy film`,
      ], (value) => normalize(value));
    }
    if (label === 'drama') {
      return dedupeBy([
        `${joined} drama film`,
        `${joined} dramatic film plot`,
        `${joined} drama movie`,
      ], (value) => normalize(value));
    }
    if (label === 'action') {
      return dedupeBy([
        `${joined} action film`,
        `${joined} action movie plot`,
        `${joined} action thriller film`,
      ], (value) => normalize(value));
    }
    if (label === 'fantasy') {
      return dedupeBy([
        `${joined} fantasy film`,
        `${joined} fantasy movie plot`,
        `${joined} fantasy adventure film`,
      ], (value) => normalize(value));
    }
    if (label === 'experimental') {
      return dedupeBy([
        `${joined} experimental film`,
        `${joined} avant-garde film`,
        `${joined} surreal art film`,
      ], (value) => normalize(value));
    }
    if (label === 'scifi' || label === 'sci-fi') {
      return dedupeBy([
        `${joined} science fiction film`,
        `${joined} sci-fi movie plot`,
        `${joined} futuristic science fiction film`,
      ], (value) => normalize(value));
    }
    if (label === 'romance') {
      return dedupeBy([
        `${joined} romance film`,
        `${joined} romantic movie plot`,
        `${joined} romantic drama film`,
      ], (value) => normalize(value));
    }
    if (label === 'animation') {
      return dedupeBy([
        `${joined} animated film`,
        `${joined} animation movie plot`,
        `${joined} family animation film`,
      ], (value) => normalize(value));
    }
    return dedupeBy([
      `${joined} horror film`,
      `${joined} horror movie plot`,
      `${joined} supernatural horror film`,
    ], (value) => normalize(value));
  }

  // Keep this intentionally tiny. Wikipedia returns HTTP 429 when the Worker
  // fans out across many broad search queries for every theater click.
  if (label === 'comedy') {
    return shuffleItems([
      'comedy film',
      'romantic comedy film',
      'black comedy film',
      'satirical comedy film',
      '2025 comedy film',
      '2024 comedy film',
    ]).slice(0, 2);
  }

  if (label === 'drama') {
    return shuffleItems([
      'drama film',
      'dramatic film',
      'period drama film',
      'crime drama film',
      '2025 drama film',
      '2024 drama film',
    ]).slice(0, 2);
  }

  if (label === 'action') {
    return shuffleItems([
      'action film',
      'action thriller film',
      'adventure action film',
      'martial arts action film',
      '2025 action film',
      '2024 action film',
    ]).slice(0, 2);
  }

  if (label === 'fantasy') {
    return shuffleItems([
      'fantasy film',
      'fantasy adventure film',
      'dragon fantasy film',
      'magic fantasy film',
      '2025 fantasy film',
      '2024 fantasy film',
    ]).slice(0, 2);
  }

  if (label === 'experimental') {
    return shuffleItems([
      'experimental film',
      'avant-garde film',
      'surreal art film',
      'abstract experimental film',
      '2025 experimental film',
      '2024 experimental film',
    ]).slice(0, 2);
  }

  if (label === 'scifi' || label === 'sci-fi') {
    return shuffleItems([
      'science fiction film',
      'sci-fi film',
      'alien science fiction film',
      'space science fiction film',
      '2025 science fiction film',
      '2024 sci-fi film',
    ]).slice(0, 2);
  }

  if (label === 'romance') {
    return shuffleItems([
      'romance film',
      'romantic drama film',
      'love story film',
      'romantic comedy drama film',
      '2025 romance film',
      '2024 romance film',
    ]).slice(0, 2);
  }

  if (label === 'animation') {
    return shuffleItems([
      'animated film',
      'animation film',
      'family animated film',
      'animated adventure film',
      '2025 animated film',
      '2024 animation film',
    ]).slice(0, 2);
  }

  return shuffleItems([
    'horror film',
    'supernatural horror film',
    'psychological horror film',
    'slasher film',
    'folk horror film',
    'body horror film',
    'found footage horror film',
    '2025 horror film',
    '2024 horror film',
  ]).slice(0, 2);
}

function firstUsefulSentence(value) {
  const cleaned = cleanDescription(value);
  const sentence = cleaned.match(/^[^.!?]+[.!?]/)?.[0] || cleaned;
  return sentence.trim();
}

function ensureHorrorDescription(result, genre = 'horror') {
  const genreLabel = normalize(genre) || 'horror';
  const firstSentence = firstUsefulSentence(result?.description || '');
  if (new RegExp(`\\b${genreLabel}\\b`, 'i').test(firstSentence) && /\bfilm\b/i.test(firstSentence)) return firstSentence;

  const title = cleanDescription(result?.title || result?.movie || 'This');
  const year = cleanDescription(result?.year || '');
  const country = cleanDescription(result?.omdb?.country || '');
  const countryPrefix = country ? `${country.split(',')[0].trim()} ` : '';
  return `${title}${year ? ` is a ${year} ${countryPrefix}${genreLabel} film.` : ` is a ${genreLabel} film.`}`;
}

function buildGenreResult(result, genre) {
  if (!result) return result;
  const genreLabel = normalize(genre) || '';
  if (!genreLabel) return result;

  const sourceDescription = cleanDescription(result?.plot || result?.description || '');
  const genreDescription = sourceDescription || ensureHorrorDescription(result, genreLabel);

  return {
    ...result,
    description: genreDescription,
    plot: genreDescription,
    lead_description: ensureHorrorDescription(result, genreLabel),
    genre_search: true,
    genre: genreLabel,
    reason: `Selected as an unseen ${genreLabel}-genre film${result.reason ? `; ${result.reason}` : '.'}`,
  };
}


const CSV_MOVIE_FILES = {
  horror: 'horror_films.csv',
  comedy: 'comedy_films.csv',
  drama: 'drama_films.csv',
  action: 'action_films.csv',
  fantasy: 'fantasy_films.csv',
  experimental: 'experimental_films.csv',
  scifi: 'scifi_films.csv',
  'sci-fi': 'scifi_films.csv',
  romance: 'romance_films.csv',
};

const csvMovieCache = new Map();
let contrastPairCache = null;

async function loadContrastPairMap(env = {}) {
  if (contrastPairCache) return contrastPairCache;
  const map = new Map();
  const csvText = await readAssetText(env, 'contrast_pairs.csv');
  if (csvText) {
    parseCsvText(csvText).forEach((row) => {
      const a = normalizeRelevanceWord(row.word_1 || row.word1 || row.first || row.a || '');
      const b = normalizeRelevanceWord(row.word_2 || row.word2 || row.second || row.b || '');
      if (!a || !b) return;
      if (!map.has(a)) map.set(a, new Set());
      if (!map.has(b)) map.set(b, new Set());
      map.get(a).add(b);
      map.get(b).add(a);
    });
  }
  contrastPairCache = map;
  return map;
}

function buildRelevanceIdf(movies = []) {
  const documentCount = Math.max(movies.length, 1);
  const frequencies = new Map();
  movies.forEach((movie) => {
    const keys = new Set(rankedMovieRelevanceEntries(movie).map((entry) => entry.key));
    keys.forEach((key) => frequencies.set(key, (frequencies.get(key) || 0) + 1));
  });
  const idf = new Map();
  frequencies.forEach((count, key) => {
    const raw = Math.log((documentCount + 1) / (count + 1)) + 1;
    idf.set(key, raw);
  });
  const values = [...idf.values()];
  const max = values.length ? Math.max(...values) : 1;
  idf.forEach((value, key) => idf.set(key, 0.2 + 0.8 * (value / max)));
  return idf;
}

function normalizeMovieGenreKey(value = '') {
  const label = normalize(value).replace(/\s+/g, '');
  if (label === 'sciencefiction' || label === 'sci-fi' || label === 'scifi') return 'scifi';
  return label;
}

function parseCsvText(text = '') {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') {
      cell += ch;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const headers = (rows.shift() || []).map((header) => normalize(header).replace(/\s+/g, '_'));
  return rows
    .filter((values) => values.some((value) => cleanDescription(value)))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}



const PUBLIC_CATALOG_CSV_PATHS = new Set([
  '/apps/literary-books/literary_books_metadata.csv',
  '/apps/adventure-books/adventure_books_metadata.csv',
  '/apps/speculative-books/speculative_books_metadata.csv',
  '/apps/horror-books/horror_books_metadata.csv',
  '/apps/crime-books/crime_books_metadata.csv',
  '/apps/romance-books/romance_books_metadata.csv',
  '/apps/paintings/paintings_metadata.csv',
  '/apps/character-related-files/horror_films.csv',
  '/apps/character-related-files/comedy_films.csv',
  '/apps/character-related-files/drama_films.csv',
  '/apps/character-related-files/action_films.csv',
  '/apps/character-related-files/romance_films.csv',
  '/apps/character-related-files/scifi_films.csv',
  '/apps/character-related-files/thriller_films.csv',
  '/apps/character-related-files/fantasy_films.csv',
  '/apps/character-related-files/documentary_films.csv',
]);

async function handleCatalogCsvChunk(request, env = {}) {
  if (!env?.ASSETS) return json({ ok: false, error: 'Assets binding is unavailable.' }, 500);
  const url = new URL(request.url);
  const pathname = String(url.searchParams.get('path') || '').trim();
  const start = Math.max(0, Number.parseInt(url.searchParams.get('start') || '0', 10) || 0);
  const requestedLength = Number.parseInt(url.searchParams.get('length') || String(1024 * 1024), 10) || (1024 * 1024);
  const length = Math.min(1024 * 1024, Math.max(64 * 1024, requestedLength));
  if (!PUBLIC_CATALOG_CSV_PATHS.has(pathname)) {
    return json({ ok: false, error: 'Catalog path is not allowed.' }, 400);
  }

  const end = start + length - 1;
  const assetRequest = new Request(`https://asset.local${pathname}`, {
    headers: { Range: `bytes=${start}-${end}` },
  });
  const upstream = await env.ASSETS.fetch(assetRequest);
  if (!upstream.ok && upstream.status !== 206) {
    return json({ ok: false, error: `Could not load catalog (${upstream.status}).` }, upstream.status);
  }

  const original = new Uint8Array(await upstream.arrayBuffer());
  const contentRange = upstream.headers.get('Content-Range') || '';
  const match = contentRange.match(/bytes\s+(\d+)-(\d+)\/(\d+|\*)/i);
  const rangeHonored = upstream.status === 206 || Boolean(match);
  const total = match && match[3] !== '*' ? Number(match[3]) : (rangeHonored ? null : original.byteLength);
  // If the asset layer ignored Range, expose only the requested window to the
  // browser. This guarantees that initial page load never receives the full CSV.
  const bytes = rangeHonored ? original : original.slice(start, Math.min(original.byteLength, start + length));
  const actualStart = match ? Number(match[1]) : start;
  const actualEnd = bytes.byteLength ? actualStart + bytes.byteLength - 1 : actualStart;
  const hasMore = total != null ? actualEnd + 1 < total : bytes.byteLength >= length;
  const headers = new Headers({
    'Content-Type': 'text/csv; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Catalog-Start': String(actualStart),
    'X-Catalog-Next': String(actualEnd + 1),
    'X-Catalog-Has-More': hasMore ? '1' : '0',
    'Accept-Ranges': 'bytes',
  });
  if (total != null) headers.set('X-Catalog-Total', String(total));
  return new Response(bytes, { status: 200, headers });
}

const CSV_INITIAL_CHUNK_BYTES = 1024 * 1024;
const CSV_LOAD_AHEAD_ROWS = 80;
const csvAssetChunkCache = new Map();

function csvCandidatePaths(pathname = '') {
  const cleanPath = String(pathname || '').replace(/^\//, '');
  return [
    pathname.startsWith('/') ? pathname : `/${pathname}`,
    `/apps/paintings/${cleanPath}`,
    `/public/apps/paintings/${cleanPath}`,
    `/apps/adventure-books/${cleanPath}`,
    `/apps/crime-books/${cleanPath}`,
    `/apps/horror-books/${cleanPath}`,
    `/apps/romance-books/${cleanPath}`,
    `/apps/speculative-books/${cleanPath}`,
    `/apps/literary-books/${cleanPath}`,
    `/public/apps/adventure-books/${cleanPath}`,
    `/public/apps/crime-books/${cleanPath}`,
    `/public/apps/horror-books/${cleanPath}`,
    `/public/apps/romance-books/${cleanPath}`,
    `/public/apps/speculative-books/${cleanPath}`,
    `/public/apps/literary-books/${cleanPath}`,
    `/character-related-files/${cleanPath}`,
    `/apps/character-related-files/${cleanPath}`,
    `/apps/character/${cleanPath}`,
    `/apps/character/character-related-files/${cleanPath}`,
    `/public/${cleanPath}`,
  ];
}

function splitCompleteCsvText(text = '', isFinal = false) {
  if (isFinal || !text) return { complete: text, remainder: '' };
  let inQuotes = false;
  let lastBoundary = -1;
  for (let index = 0; index < text.length; index += 1) {
    const ch = text[index];
    if (ch === '"') {
      if (inQuotes && text[index + 1] === '"') {
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === '\n' && !inQuotes) {
      lastBoundary = index + 1;
    }
  }
  if (lastBoundary < 0) return { complete: '', remainder: text };
  return { complete: text.slice(0, lastBoundary), remainder: text.slice(lastBoundary) };
}

async function fetchAssetCsvRange(env = {}, pathname = '', start = 0, byteLength = CSV_INITIAL_CHUNK_BYTES) {
  if (!env?.ASSETS || !pathname) return null;
  const end = Math.max(start, start + Math.max(1, byteLength) - 1);

  for (const path of csvCandidatePaths(pathname)) {
    try {
      const request = new Request(`https://asset.local${path}`, {
        headers: { Range: `bytes=${start}-${end}` },
      });
      const response = await env.ASSETS.fetch(request);
      if (!response.ok && response.status !== 206) continue;

      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const contentRange = response.headers.get('Content-Range') || '';
      const rangeMatch = contentRange.match(/bytes\s+(\d+)-(\d+)\/(\d+|\*)/i);
      const totalBytes = rangeMatch && rangeMatch[3] !== '*' ? Number(rangeMatch[3]) : null;
      const actualStart = rangeMatch ? Number(rangeMatch[1]) : start;
      const actualEnd = rangeMatch ? Number(rangeMatch[2]) : (actualStart + bytes.byteLength - 1);
      const rangeHonored = response.status === 206 || Boolean(rangeMatch);

      // Some asset bindings ignore Range and return the complete file. That is
      // still correct, but mark the state final so no duplicate requests occur.
      return {
        path,
        bytes,
        start: actualStart,
        nextOffset: actualEnd + 1,
        totalBytes: totalBytes ?? (rangeHonored ? null : bytes.byteLength),
        done: rangeHonored
          ? (totalBytes != null ? actualEnd + 1 >= totalBytes : bytes.byteLength < byteLength)
          : true,
        rangeHonored,
      };
    } catch (_) {}
  }
  return null;
}

async function ensureCsvAssetRows(env = {}, pathname = '', minimumRows = 1) {
  const requestedRows = Math.max(1, Number(minimumRows) || 1);
  let state = csvAssetChunkCache.get(pathname);
  if (!state) {
    state = {
      path: '',
      nextOffset: 0,
      totalBytes: null,
      done: false,
      completeText: '',
      remainder: '',
      rows: [],
      loading: null,
      decoder: new TextDecoder('utf-8'),
    };
    csvAssetChunkCache.set(pathname, state);
  }

  while (!state.done && state.rows.length < requestedRows) {
    if (!state.loading) {
      state.loading = (async () => {
        const chunk = await fetchAssetCsvRange(env, state.path || pathname, state.nextOffset);
        if (!chunk) {
          state.done = true;
          return;
        }
        state.path = chunk.path;
        state.nextOffset = chunk.nextOffset;
        state.totalBytes = chunk.totalBytes;
        const decoded = state.decoder.decode(chunk.bytes, { stream: !chunk.done });
        const joined = state.remainder + decoded;
        const split = splitCompleteCsvText(joined, chunk.done);
        state.completeText += split.complete;
        state.remainder = split.remainder;
        state.done = chunk.done;
        if (state.done && state.remainder) {
          state.completeText += state.remainder;
          state.remainder = '';
        }
        state.rows = state.completeText ? parseCsvText(state.completeText) : [];
      })().finally(() => { state.loading = null; });
    }
    await state.loading;
  }

  return {
    rows: state.rows,
    hasMore: !state.done,
    loadedBytes: state.nextOffset,
    totalBytes: state.totalBytes,
  };
}

async function readAssetText(env = {}, pathname = '') {
  if (!env?.ASSETS || !pathname) return '';
  const candidates = csvCandidatePaths(pathname);

  for (const path of candidates) {
    try {
      const response = await env.ASSETS.fetch(new Request(`https://asset.local${path}`));
      if (response.ok) return await response.text();
    } catch (_) {}
  }

  return '';
}

function parseCsvPictures(value = '') {
  const raw = cleanDescription(value);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(cleanDescription).filter(Boolean);
  } catch (_) {}
  return raw.split('|').map(cleanDescription).filter(Boolean);
}

function parseCsvWordRelevance(value = '') {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  const raw = String(value || '').trim();
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed)
        .map(([word, score]) => [cleanDescription(word), Number(score)])
        .filter(([word, score]) => word && Number.isFinite(score) && score >= 0.8 && score <= 1)
    );
  } catch (_) {
    return {};
  }
}

function csvRowToMovie(row = {}, genre = 'horror', imageLimit = 6) {
  const movie = cleanDescription(row.name || row.title || row.movie || '');
  if (!movie) return null;
  const description = cleanDescription(row.description || row.plot || '') || `${movie} is a ${genre} film.`;
  const images = parseCsvPictures(row.pictures || row.images || row.image_urls || '').slice(0, Math.max(1, imageLimit || 6));
  const poster = cleanDescription(row.poster || row.poster_url || row.posterUrl || images[0] || '');
  const year = cleanDescription(row.year || extractYearFromText(description) || '').slice(0, 4);
  const wordRelevance = parseCsvWordRelevance(
    row.word_relevance || row.wordrelevance || row.world_relevance || ''
  );

  return buildGenreResult({
    ok: true,
    movie,
    title: movie,
    description,
    plot: description,
    year,
    poster_url: poster,
    poster,
    images: dedupeBy([poster, ...images].filter(Boolean), (value) => value).slice(0, Math.max(1, imageLimit || 6)),
    genre,
    selected_genre: genre,
    genres: [genre],
    word_relevance: wordRelevance,
    wordRelevance,
    source: 'csv',
    reason: `Selected directly from ${genre} CSV pool.`,
  }, genre);
}

async function loadGenreCsvMovies(env = {}, genre = 'horror', imageLimit = 6, minimumRows = 1) {
  const genreKey = normalizeMovieGenreKey(genre);
  const fileName = CSV_MOVIE_FILES[genreKey];
  if (!fileName) return [];

  const cacheKey = `${genreKey}:${fileName}`;
  const chunk = await ensureCsvAssetRows(env, fileName, minimumRows);
  const cached = csvMovieCache.get(cacheKey);
  if (cached && cached.__loadedRowCount === chunk.rows.length) return cached;
  if (!chunk.rows.length) {
    const emptyMovies = [];
    Object.defineProperty(emptyMovies, '__loadedRowCount', { value: 0, enumerable: false });
    Object.defineProperty(emptyMovies, '__hasMoreCsv', { value: chunk.hasMore, enumerable: false });
    csvMovieCache.set(cacheKey, emptyMovies);
    return emptyMovies;
  }

  const movies = chunk.rows
    .map((row) => csvRowToMovie(row, genreKey, imageLimit))
    .filter(Boolean)
    .map((movie) => {
      const entries = rankedMovieRelevanceEntries(movie);
      return {
        ...movie,
        __relevanceEntries: entries,
        __relevanceMap: new Map(entries.map((entry, index) => [
          entry.key,
          { rank: index, score: entry.score },
        ])),
      };
    });

  Object.defineProperty(movies, '__loadedRowCount', { value: chunk.rows.length, enumerable: false });
  Object.defineProperty(movies, '__hasMoreCsv', { value: chunk.hasMore, enumerable: false });

  Object.defineProperty(movies, '__idf', {
    value: buildRelevanceIdf(movies),
    enumerable: false,
  });

  csvMovieCache.set(cacheKey, movies);
  return movies;
}

function seededIndex(seedText, length) {
  if (!length) return 0;
  const text = cleanDescription(seedText || `${Date.now()}-${Math.random()}`);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0) % length;
}

function normalizeRelevanceWord(value = '') {
  return normalize(value).replace(/\s+/g, ' ').trim();
}

function rankedMovieRelevanceEntries(movie = {}) {
  const raw = movie.word_relevance || movie.wordRelevance || {};
  const map = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return Object.entries(map)
    .map(([word, score]) => ({ word: cleanDescription(word), key: normalizeRelevanceWord(word), score: Number(score) }))
    .filter((item) => item.key && Number.isFinite(item.score))
    .sort((a, b) => (b.score - a.score) || a.word.localeCompare(b.word));
}

function normalizeRelevanceProfile(raw = {}) {
  let value = raw;
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch (_) { value = {}; }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const profile = {};
  Object.entries(value).forEach(([word, score]) => {
    const key = normalizeRelevanceWord(word);
    const numeric = Number(score);
    if (key && Number.isFinite(numeric)) profile[key] = clamp01(numeric);
  });
  return profile;
}

function resolveInternalContrastConflicts(entries = [], contrastPairs = new Map()) {
  const bestByWord = new Map();
  entries.forEach((entry) => {
    if (!entry?.key || !Number.isFinite(Number(entry.score))) return;
    const existing = bestByWord.get(entry.key);
    if (!existing || Number(entry.score) > Number(existing.score)) {
      bestByWord.set(entry.key, { ...entry, score: Number(entry.score) });
    }
  });

  const suppressed = new Set();
  for (const [word, entry] of bestByWord.entries()) {
    if (suppressed.has(word)) continue;
    const opposites = contrastPairs.get(word);
    if (!opposites) continue;
    for (const opposite of opposites) {
      const oppositeEntry = bestByWord.get(opposite);
      if (!oppositeEntry || suppressed.has(opposite)) continue;
      if (entry.score > oppositeEntry.score) {
        suppressed.add(opposite);
      } else if (oppositeEntry.score > entry.score) {
        suppressed.add(word);
        break;
      } else {
        // Stable tie-break so the same exact profile always resolves identically.
        suppressed.add(word.localeCompare(opposite) <= 0 ? opposite : word);
        if (suppressed.has(word)) break;
      }
    }
  }

  return [...bestByWord.values()]
    .filter((entry) => !suppressed.has(entry.key))
    .sort((a, b) => (b.score - a.score) || a.key.localeCompare(b.key));
}

function relevanceProfileSimilarity(currentProfile = {}, candidateEntries = [], idf = new Map(), contrastPairs = new Map()) {
  const current = normalizeRelevanceProfile(currentProfile);
  const currentEntries = resolveInternalContrastConflicts(
    Object.entries(current).map(([key, score]) => ({ key, score })),
    contrastPairs
  );
  candidateEntries = resolveInternalContrastConflicts(candidateEntries, contrastPairs);
  if (!currentEntries.length || !candidateEntries.length) {
    return {
      similarity: 0,
      overlap: 0,
      symmetricOverlap: 0,
      orderAgreement: 0,
      lengthSimilarity: 0,
      lengthPenalty: 1,
      currentLength: currentEntries.length,
      candidateLength: candidateEntries.length,
      contradictionPenalty: 0,
    };
  }

  const candidateByWord = new Map(candidateEntries.map((entry, index) => [entry.key, { ...entry, rank: index }]));
  const currentByWord = new Map(currentEntries.map((entry, index) => [entry.key, { ...entry, rank: index }]));
  const allWords = new Set([...currentByWord.keys(), ...candidateByWord.keys()]);

  let intersection = 0;
  let union = 0;
  let overlap = 0;
  let orderWeighted = 0;
  let orderWeightTotal = 0;

  allWords.forEach((word) => {
    const a = currentByWord.get(word)?.score || 0;
    const b = candidateByWord.get(word)?.score || 0;
    const rarityWeight = idf.get(word) || 0.2;
    intersection += Math.min(a, b) * rarityWeight;
    union += Math.max(a, b) * rarityWeight;
    if (a > 0 && b > 0) overlap += 1;
  });

  currentEntries.forEach((entry, currentRank) => {
    const candidate = candidateByWord.get(entry.key);
    if (!candidate) return;
    const weight = entry.score * (idf.get(entry.key) || 0.2) * (1 / (currentRank + 1));
    const maxRank = Math.max(currentEntries.length, candidateEntries.length, 1) - 1;
    const rankDistance = Math.abs(currentRank - candidate.rank);
    const agreement = maxRank <= 0 ? 1 : 1 - Math.min(rankDistance / maxRank, 1);
    orderWeighted += agreement * weight;
    orderWeightTotal += weight;
  });

  let contradictionWeight = 0;
  let contradictionWeightTotal = 0;
  currentEntries.forEach((entry, currentRank) => {
    const weight = entry.score * (idf.get(entry.key) || 0.2) * (1 / (currentRank + 1));
    contradictionWeightTotal += weight;
    const opposites = contrastPairs.get(entry.key);
    if (!opposites) return;
    for (const opposite of opposites) {
      const match = candidateByWord.get(opposite);
      if (match) {
        contradictionWeight += weight * match.score;
        break;
      }
    }
  });
  const contradictionPenalty = contradictionWeightTotal > 0
    ? Math.min(contradictionWeight / contradictionWeightTotal, 1)
    : 0;

  const weightedJaccard = union > 0 ? intersection / union : 0;
  const orderAgreement = orderWeightTotal > 0 ? orderWeighted / orderWeightTotal : 0;
  const currentCoverage = overlap / Math.max(currentEntries.length, 1);
  const candidateCoverage = overlap / Math.max(candidateEntries.length, 1);
  const symmetricOverlap = (currentCoverage + candidateCoverage) > 0
    ? (2 * currentCoverage * candidateCoverage) / (currentCoverage + candidateCoverage)
    : 0;
  const shorterLength = Math.min(currentEntries.length, candidateEntries.length);
  const longerLength = Math.max(currentEntries.length, candidateEntries.length, 1);
  const lengthSimilarity = shorterLength / longerLength;
  const lengthPenalty = 1 - lengthSimilarity;

  // Symmetric overlap prevents a 20-word profile from scoring as a perfect
  // match against a 100-word profile merely because all 20 words are present.
  // The explicit length term further pushes similarly sized profiles together.
  const rawSimilarity = weightedJaccard * 0.50
    + symmetricOverlap * 0.25
    + orderAgreement * 0.15
    + lengthSimilarity * 0.10;
  const similarity = Math.max(0, rawSimilarity * (0.72 + 0.28 * lengthSimilarity) - contradictionPenalty * 0.18);

  return {
    similarity,
    overlap: currentCoverage,
    symmetricOverlap,
    orderAgreement,
    lengthSimilarity,
    lengthPenalty,
    currentLength: currentEntries.length,
    candidateLength: candidateEntries.length,
    contradictionPenalty,
  };
}

function scoreMovieByPriorityWords(movie = {}, addedWords = [], currentProfile = {}, idf = new Map(), contrastPairs = new Map()) {
  const entries = movie.__relevanceEntries || rankedMovieRelevanceEntries(movie);
  const rankByWord = movie.__relevanceMap || new Map(entries.map((entry, index) => [entry.key, { rank: index, score: entry.score }]));
  const words = dedupeBy(
    addedWords.map(normalizeRelevanceWord).filter(Boolean),
    (word) => word,
  );
  const profile = relevanceProfileSimilarity(currentProfile, entries, idf, contrastPairs);

  const attachedWordMatches = words.map((word) => {
    const match = rankByWord.get(word) || null;
    const opposites = contrastPairs.get(word) || new Set();
    const oppositeMatches = [...opposites]
      .map((oppositeWord) => ({ word: oppositeWord, match: rankByWord.get(oppositeWord) }))
      .filter((item) => item.match);
    const rankQuality = match
      ? (entries.length <= 1 ? 1 : 1 - (match.rank / (entries.length - 1)))
      : 0;
    return {
      word,
      found: Boolean(match),
      rank: match ? match.rank : Number.POSITIVE_INFINITY,
      score: match ? match.score : 0,
      rankQuality,
      oppositeFound: oppositeMatches.length > 0,
      oppositeWords: oppositeMatches.map((item) => item.word),
    };
  });

  const matchedAttachedWords = attachedWordMatches.filter((item) => item.found);
  const matchedWordCount = matchedAttachedWords.length;
  const allWordsFound = words.length > 0 && matchedWordCount === words.length;
  const anyOppositeFound = attachedWordMatches.some((item) => item.oppositeFound);
  const averageRankQuality = matchedWordCount
    ? matchedAttachedWords.reduce((sum, item) => sum + item.rankQuality, 0) / matchedWordCount
    : 0;
  const averageWordScore = matchedWordCount
    ? matchedAttachedWords.reduce((sum, item) => sum + item.score, 0) / matchedWordCount
    : 0;
  const worstMatchedRank = matchedWordCount
    ? Math.max(...matchedAttachedWords.map((item) => item.rank))
    : Number.POSITIVE_INFINITY;
  const totalMatchedRank = matchedWordCount
    ? matchedAttachedWords.reduce((sum, item) => sum + item.rank, 0)
    : Number.POSITIVE_INFINITY;

  return {
    movie,
    entries,
    attachedWordMatches,
    matchedAttachedWords: matchedAttachedWords.map((item) => item.word),
    matchedWordCount,
    allWordsFound,
    anyAttachedOppositeFound: anyOppositeFound,
    attachedOppositeWords: dedupeBy(
      attachedWordMatches.flatMap((item) => item.oppositeWords),
      (word) => word,
    ),
    averageRankQuality,
    averageWordScore,
    worstMatchedRank,
    totalMatchedRank,
    profileSimilarity: profile.similarity,
    profileOverlap: profile.overlap,
    profileOrderAgreement: profile.orderAgreement,
    profileSymmetricOverlap: profile.symmetricOverlap,
    profileLengthSimilarity: profile.lengthSimilarity,
    profileLengthPenalty: profile.lengthPenalty,
    contradictionPenalty: profile.contradictionPenalty,
    currentProfileLength: profile.currentLength,
    candidateProfileLength: profile.candidateLength,
    topRelevanceWord: entries[0]?.word || '',
    topRelevanceScore: entries[0]?.score || 0,
  };
}

async function findCsvGenreMovie(words = [], env = {}, imageLimit = 6, excludedMovies = [], genre = 'horror', seed = '', currentProfile = {}, addedWords = [], continueWithSettings = false, dislikedMovies = [], minimumRowsOverride = 0) {
  const genreKey = normalizeMovieGenreKey(genre) || 'horror';
  const minimumRows = Math.max(
    CSV_LOAD_AHEAD_ROWS,
    normalizeExcludedMovies(excludedMovies).length + CSV_LOAD_AHEAD_ROWS,
    Number(minimumRowsOverride) || 0,
  );
  const movies = await loadGenreCsvMovies(env, genreKey, imageLimit, minimumRows);
  if (!movies.length) {
    if (movies.__hasMoreCsv) {
      return findCsvGenreMovie(
        words, env, imageLimit, excludedMovies, genreKey, seed,
        currentProfile, addedWords, continueWithSettings, dislikedMovies,
        minimumRows + CSV_LOAD_AHEAD_ROWS,
      );
    }
    return null;
  }

  const exclusions = normalizeExcludedMovies(excludedMovies);
  const disliked = normalizeExcludedMovies(dislikedMovies);
  const isDislikedMovie = (movie) => movieIsExcluded(
    movie.movie || movie.title,
    movie.year,
    movie.imdb_id || movie.imdbID,
    disliked,
  );
  const unseen = movies.filter((movie) => !movieIsExcluded(movie.movie || movie.title, movie.year, movie.imdb_id || movie.imdbID, exclusions));

  // Continue is an explicit request to keep searching with the attached
  // popcorn settings. It must search the complete active genre CSV, not the
  // history/exclusion-filtered pool, otherwise valid keyword matches can
  // incorrectly disappear. The normal strict pass still respects exclusions.
  const pool = continueWithSettings ? movies : (unseen.length ? unseen : movies);
  const priorityWords = dedupeBy(
    (Array.isArray(addedWords) && addedWords.length ? addedWords : words).map(cleanDescription).filter(Boolean),
    (word) => normalizeRelevanceWord(word),
  );
  const idf = pool === movies && movies.__idf ? movies.__idf : buildRelevanceIdf(pool);
  const contrastPairs = await loadContrastPairMap(env);

  if (!priorityWords.length) {
    const preferredPool = pool.filter((movie) => !isDislikedMovie(movie));
    const randomPool = preferredPool.length ? preferredPool : pool;
    const index = seededIndex(`${seed}|${genreKey}|${exclusions.length}|${randomPool.length}`, randomPool.length);
    return randomPool[index] ? { ...randomPool[index], csv_direct: true } : null;
  }

  // Continue is a popcorn-only search: the previous movie profile must not
  // influence scoring or tie-breaking after the user chooses to continue.
  const scoringProfile = continueWithSettings ? {} : currentProfile;
  const scored = pool.map((movie) => ({
    ...scoreMovieByPriorityWords(movie, priorityWords, scoringProfile, idf, contrastPairs),
    isDisliked: isDislikedMovie(movie),
  }));

  // Every attached popcorn word has exactly the same importance. Prefer
  // candidates matching all attached words; if none do, keep the candidates
  // matching the greatest equal-weight count. The strict pass rejects a
  // candidate when any attached word has an explicit opposite in the profile.
  const eligible = scored.filter((item) => continueWithSettings || !item.anyAttachedOppositeFound);
  const bestMatchCount = eligible.reduce((best, item) => Math.max(best, item.matchedWordCount), 0);
  const candidates = eligible.filter((item) => item.matchedWordCount > 0 && item.matchedWordCount === bestMatchCount);
  if (!candidates.length) {
    // The loaded slice had no match. Only now request the next CSV slice and
    // repeat the same search; stop once a match is found or the file is final.
    if (movies.__hasMoreCsv) {
      return findCsvGenreMovie(
        words,
        env,
        imageLimit,
        excludedMovies,
        genreKey,
        seed,
        currentProfile,
        addedWords,
        continueWithSettings,
        dislikedMovies,
        movies.length + CSV_LOAD_AHEAD_ROWS,
      );
    }
    return null;
  }

  const rankedPool = candidates.sort((a, b) => {
    // A disliked movie remains eligible, but it is always the least-favourable
    // option whenever any non-disliked candidate satisfies the same search.
    if (a.isDisliked !== b.isDisliked) return a.isDisliked ? 1 : -1;

    // All attached words are equal: compare their combined rank quality and
    // scores without giving the newest or earliest word any extra weight.
    if (b.matchedWordCount !== a.matchedWordCount) return b.matchedWordCount - a.matchedWordCount;
    if (b.averageRankQuality !== a.averageRankQuality) return b.averageRankQuality - a.averageRankQuality;
    if (b.averageWordScore !== a.averageWordScore) return b.averageWordScore - a.averageWordScore;
    if (a.worstMatchedRank !== b.worstMatchedRank) return a.worstMatchedRank - b.worstMatchedRank;
    if (a.totalMatchedRank !== b.totalMatchedRank) return a.totalMatchedRank - b.totalMatchedRank;

    if (!continueWithSettings) {
      // The current movie profile remains a later tie-break only. It can never
      // make one attached popcorn word more important than another.
      if (b.profileSimilarity !== a.profileSimilarity) return b.profileSimilarity - a.profileSimilarity;
      if (b.profileOrderAgreement !== a.profileOrderAgreement) return b.profileOrderAgreement - a.profileOrderAgreement;
      if (b.profileSymmetricOverlap !== a.profileSymmetricOverlap) return b.profileSymmetricOverlap - a.profileSymmetricOverlap;
    }

    if (a.candidateProfileLength !== b.candidateProfileLength) {
      return a.candidateProfileLength - b.candidateProfileLength;
    }
    if (!continueWithSettings && b.profileLengthSimilarity !== a.profileLengthSimilarity) {
      return b.profileLengthSimilarity - a.profileLengthSimilarity;
    }
    if (!continueWithSettings && a.contradictionPenalty !== b.contradictionPenalty) {
      return a.contradictionPenalty - b.contradictionPenalty;
    }
    if (b.topRelevanceScore !== a.topRelevanceScore) return b.topRelevanceScore - a.topRelevanceScore;
    return String(a.movie.movie || a.movie.title || '').localeCompare(String(b.movie.movie || b.movie.title || ''));
  });

  const best = rankedPool[0];
  if (!best) return null;
  return {
    ...best.movie,
    csv_direct: true,
    matched_priority_words: priorityWords,
    attached_word_match_count: best.matchedWordCount,
    attached_word_count: priorityWords.length,
    all_attached_words_found: Boolean(best.allWordsFound),
    matched_attached_words: best.matchedAttachedWords || [],
    attached_word_opposite_found: Boolean(best.anyAttachedOppositeFound),
    attached_word_opposite_words: best.attachedOppositeWords || [],
    attached_word_average_rank_quality: Number(best.averageRankQuality.toFixed(6)),
    attached_word_average_score: Number(best.averageWordScore.toFixed(6)),
    continued_with_settings: Boolean(continueWithSettings),
    relevance_profile_similarity: Number(best.profileSimilarity.toFixed(6)),
    relevance_order_agreement: Number(best.profileOrderAgreement.toFixed(6)),
    relevance_symmetric_overlap: Number(best.profileSymmetricOverlap.toFixed(6)),
    relevance_length_similarity: Number(best.profileLengthSimilarity.toFixed(6)),
    relevance_length_penalty: Number(best.profileLengthPenalty.toFixed(6)),
    relevance_contradiction_penalty: Number(best.contradictionPenalty.toFixed(6)),
    current_relevance_length: best.currentProfileLength,
    candidate_relevance_length: best.candidateProfileLength,
    top_relevance_word: best.topRelevanceWord,
  };
}

function candidateMatchesQueryContext(query, candidate) {
  const tokens = queryContentTokens(query);
  if (!tokens.length) return true;

  const textTokens = tokenize(movieSearchText(candidate));
  const textTokenSet = new Set(textTokens);
  const matches = tokens.filter((token) => {
    if (textTokenSet.has(token)) return true;
    return textTokens.some((candidateToken) => sequenceSimilarity(token, candidateToken) >= 0.88);
  }).length;

  // A combined query such as "Velvet Spark" should still be able to find a
  // film when only one of the descriptive words is present, but it must not
  // return a page with no relationship to the active words at all.
  if (tokens.length <= 2) return matches >= 1;
  return matches >= 2;
}

function buildWikipediaFilmSearches(query, mode) {
  const cleanQuery = cleanDescription(query).slice(0, 120);
  const tokens = queryContentTokens(cleanQuery);
  const joinedTokens = tokens.join(' ');
  const quotedTokens = tokens.map((token) => `"${token}"`).join(' ');
  const searches = [];

  if (tokens.length > 1) {
    searches.push(
      `${quotedTokens} film`,
      `${quotedTokens} movie`,
      `${joinedTokens} film plot`,
      `${joinedTokens} feature film`,
    );
  }

  searches.push(
    `${cleanQuery} film`,
    `${cleanQuery} movie`,
    `${cleanQuery} film plot`,
    `${cleanQuery} feature film`,
    `${cleanQuery} cinema`,
  );

  if (mode === 'watch') {
    searches.push(`${cleanQuery} film synopsis`, `${cleanQuery} movie plot`);
  }

  // Keep every query film-biased. This prevents generic Wikipedia pages, people,
  // songs, albums, and products from becoming candidates when the user combines
  // a main word with words dragged from the popcorn bucket.
  return dedupeBy(searches.filter((value) => cleanDescription(value).length > 5), (value) => normalize(value));
}

function normalizeExcludedMovies(values = []) {
  const list = Array.isArray(values) ? values : [values];
  return list.map((item) => {
    if (typeof item === 'string') return { title: normalize(item), year: '', imdbID: '' };
    return {
      title: normalize(item?.movie || item?.title || ''),
      year: cleanDescription(item?.year || '').slice(0, 4),
      imdbID: cleanDescription(item?.imdb_id || item?.imdbID || '').toLowerCase(),
    };
  }).filter((item) => item.title || item.imdbID);
}

function movieIsExcluded(title, year, imdbID, excludedMovies = []) {
  const cleanTitle = normalize(title);
  const cleanYear = cleanDescription(year || '').slice(0, 4);
  const cleanImdb = cleanDescription(imdbID || '').toLowerCase();
  return excludedMovies.some((item) => {
    if (item.imdbID && cleanImdb && item.imdbID === cleanImdb) return true;
    if (!item.title || !cleanTitle) return false;
    const sameTitle = item.title === cleanTitle || sequenceSimilarity(item.title, cleanTitle) >= 0.94;
    const sameYear = !item.year || !cleanYear || item.year === cleanYear;
    return sameTitle && sameYear;
  });
}

function dedupeBy(items, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

async function collectWikipediaCandidates(query, mode, env) {
  const searches = buildWikipediaFilmSearches(query, mode);

  const candidates = [];
  const seenPages = new Set();
  const pageGroups = await mapWithConcurrency(
    searches,
    3,
    (searchQuery) => fetchWikipediaMoviePages(searchQuery, mode === 'fast' ? 8 : 14, env),
  );
  for (const pages of pageGroups) {
    for (const page of pages) {
      if (!page?.pageid || seenPages.has(page.pageid)) continue;
      seenPages.add(page.pageid);
      const title = cleanDescription(page.title || '');
      const description = cleanDescription(page.extract || '');
      if (!title || !description || !looksLikeMoviePage(page)) continue;
      const categories = categoryText(page);
      candidates.push({
        title: cleanWikipediaMovieTitle(title) || title,
        wikipedia_title: title,
        year: extractYearFromText(`${title} ${description} ${categories}`),
        description,
        categories,
        wiki_url: getWikipediaPageUrl(page),
        wiki_image_url: getWikipediaImageUrl(page),
        score: scoreCandidate(query, { title, description, categories }).score,
      });
    }
  }

  return dedupeBy(candidates, (candidate) => `${normalize(candidate.title)}|${candidate.year || ''}`)
    .filter((candidate) => candidateMatchesQueryContext(query, candidate))
    .sort((a, b) => b.score - a.score)
    .slice(0, mode === 'fast' ? 10 : 18);
}

async function collectHorrorWikipediaCandidates(words, mode, env, genre = 'horror') {
  const searches = buildHorrorSearches(words, genre);
  const candidates = [];
  const seenPages = new Set();
  const pageGroups = await mapWithConcurrency(
    searches,
    3,
    (searchQuery) => fetchWikipediaMoviePages(searchQuery, mode === 'fast' ? 8 : 12, env),
  );

  for (const pages of pageGroups) {
    for (const page of pages) {
      if (!page?.pageid || seenPages.has(page.pageid)) continue;
      seenPages.add(page.pageid);

      const title = cleanDescription(page.title || '');
      const description = cleanDescription(page.extract || '');
      if (!title || !description || !looksLikeMoviePage(page)) continue;

      const categories = categoryText(page);
      const candidate = {
        title: cleanWikipediaMovieTitle(title) || title,
        wikipedia_title: title,
        year: extractYearFromText(`${title} ${description} ${categories}`),
        description,
        categories,
        wiki_url: getWikipediaPageUrl(page),
        wiki_image_url: getWikipediaImageUrl(page),
        score: scoreCandidate(words.length ? words.join(' ') : genre, { title, description, categories }).score,
      };

      if (!isGenreCandidate(candidate, genre)) continue;
      if (!candidateMatchesDescriptionWords(words, candidate)) continue;
      candidates.push(candidate);
    }
  }

  return dedupeBy(candidates, (candidate) => `${normalize(candidate.title)}|${candidate.year || ''}`)
    .sort((a, b) => b.score - a.score);
}

function omdbPoster(detail) {
  const poster = cleanDescription(detail?.Poster || '');
  return poster && poster !== 'N/A' ? poster : '';
}

function omdbPlot(detail) {
  const plot = cleanDescription(detail?.Plot || '');
  return plot && plot !== 'N/A' ? plot : '';
}

function omdbTitle(detail) {
  return cleanDescription(detail?.Title || '');
}

function omdbYear(detail) {
  return cleanDescription(detail?.Year || '').slice(0, 4);
}

async function fetchOmdbByTitle(title, year, env) {
  const apiKey = env?.OMDB_API_KEY;
  if (!apiKey) return null;
  const detail = await fetchJson(OMDB_API, {
    apikey: apiKey,
    t: title,
    y: year || undefined,
    type: 'movie',
    plot: 'full',
  });
  if (detail?.Response === 'False' || !omdbTitle(detail) || !omdbPlot(detail)) return null;
  return detail;
}

async function fetchOmdbByImdbId(imdbID, env) {
  const apiKey = env?.OMDB_API_KEY;
  if (!apiKey || !imdbID) return null;
  const detail = await fetchJson(OMDB_API, {
    apikey: apiKey,
    i: imdbID,
    type: 'movie',
    plot: 'full',
  });
  if (detail?.Response === 'False' || !omdbTitle(detail) || !omdbPlot(detail)) return null;
  return detail;
}

async function searchOmdbDetails(title, year, env) {
  const apiKey = env?.OMDB_API_KEY;
  if (!apiKey) return [];
  const direct = await fetchOmdbByTitle(title, year, env);
  if (direct) return [direct];

  const searchPayload = await fetchJson(OMDB_API, {
    apikey: apiKey,
    s: title,
    y: year || undefined,
    type: 'movie',
    page: 1,
  });
  const hits = Array.isArray(searchPayload.Search) ? searchPayload.Search.slice(0, 8) : [];
  const details = [];
  for (const hit of hits) {
    const detail = await fetchOmdbByImdbId(hit.imdbID, env);
    if (detail) details.push(detail);
  }
  return details;
}

function scoreOmdbAgainstWikipedia(omdb, wikiCandidate) {
  const titleA = normalize(omdbTitle(omdb));
  const titleB = normalize(wikiCandidate.title);
  const yearA = omdbYear(omdb);
  const yearB = String(wikiCandidate.year || '').slice(0, 4);
  const titleScore = sequenceSimilarity(titleA, titleB);
  const yearScore = yearA && yearB && yearA === yearB ? 0.25 : 0;
  const plotScore = sequenceSimilarity(normalize(omdbPlot(omdb).slice(0, 1000)), normalize(wikiCandidate.description.slice(0, 1000))) * 0.15;
  return titleScore + yearScore + plotScore;
}

async function findOmdbForWikipediaCandidate(candidate, env) {
  const possibleTitles = dedupeBy([
    candidate.title,
    candidate.wikipedia_title,
    candidate.title.replace(/:.*$/, '').trim(),
  ].filter(Boolean), (v) => normalize(v));

  const detailGroups = await mapWithConcurrency(
    possibleTitles,
    3,
    (title) => searchOmdbDetails(title, candidate.year, env),
  );
  const details = detailGroups.flat();

  const uniqueDetails = dedupeBy(details, (detail) => cleanDescription(detail.imdbID || `${omdbTitle(detail)}|${omdbYear(detail)}`));
  return uniqueDetails
    .map((detail) => ({ detail, score: scoreOmdbAgainstWikipedia(detail, candidate) }))
    .filter((item) => item.score >= 0.62 || normalize(omdbTitle(item.detail)) === normalize(candidate.title))
    .sort((a, b) => b.score - a.score)[0]?.detail || null;
}


function commonsMetadataValue(page, key) {
  const value = page?.imageinfo?.[0]?.extmetadata?.[key]?.value || '';
  return cleanDescription(value);
}

function allowedImageUrl(url) {
  const clean = cleanDescription(url);
  if (!clean) return '';
  // Keep the strip cinematic/photo based. SVG icons/logos frequently made the
  // gallery feel unrelated, so skip them here.
  if (/\.svg(?:$|\?)/i.test(clean)) return '';
  return clean;
}

function imageInfoFromPage(page, source = 'Wikimedia Commons') {
  const info = page?.imageinfo?.[0];
  if (!info || !String(info.mime || '').startsWith('image/')) return null;
  const url = allowedImageUrl(info.thumburl || info.url || '');
  if (!url) return null;
  const title = cleanDescription(page.title || '').replace(/^File:/i, '');
  return {
    url,
    source_url: cleanDescription(info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(String(page.title || '').replaceAll(' ', '_'))}`),
    source,
    license: commonsMetadataValue(page, 'LicenseShortName'),
    credit: commonsMetadataValue(page, 'Artist') || commonsMetadataValue(page, 'Credit') || '',
    title,
    description: commonsMetadataValue(page, 'ImageDescription') || commonsMetadataValue(page, 'ObjectName') || '',
  };
}

function imageMatchTokens(value) {
  return tokenize(value)
    .map((token) => token.replace(/'s$/i, ''))
    .filter((token) => token.length > 2 && !['film', 'movie', 'poster', 'image', 'file', 'jpg', 'jpeg', 'png', 'webp'].includes(token));
}

function imageLooksRelatedToFilm(image, context) {
  if (!image?.url) return false;
  if (image.source === 'OMDb poster' || image.source === 'Wikipedia page image') return true;

  const titleOptions = dedupeBy([
    context.finalTitle,
    context.wikiTitle,
    context.cleanTitle,
  ].filter(Boolean), (value) => normalize(value));

  const haystack = normalize([
    image.title,
    image.description,
    image.source_url,
    image.credit,
  ].join(' '));

  if (!haystack) return false;
  const year = cleanDescription(context.year || '');
  const hasYear = Boolean(year && haystack.includes(year));
  const filmContext = /\b(film|movie|poster|cinema|screen shot|screenshot|scene|still|theatrical|trailer|title card|lobby card)\b/i.test(haystack);

  for (const title of titleOptions) {
    const titleNorm = normalize(title);
    if (titleNorm && haystack.includes(titleNorm)) return true;

    const tokens = imageMatchTokens(title);
    if (!tokens.length) continue;
    const hits = tokens.filter((token) => haystack.includes(token)).length;
    const needed = Math.min(tokens.length, tokens.length <= 2 ? 2 : 3);

    if (hits >= needed) return true;
    if (hits >= Math.min(2, tokens.length) && (hasYear || filmContext)) return true;
  }

  return false;
}

async function fetchWikipediaArticleImages(pageTitle, limit, env) {
  const title = cleanDescription(pageTitle);
  if (!title) return [];

  const imageListPayload = await fetchJson(WIKIPEDIA_API, {
    action: 'query',
    format: 'json',
    formatversion: '2',
    titles: title,
    prop: 'images',
    imlimit: '50',
  }, wikiHeaders(env));

  if (imageListPayload?.__http_status || imageListPayload?.__error) return [];
  const pages = Array.isArray(imageListPayload?.query?.pages) ? imageListPayload.query.pages : [];
  const fileTitles = dedupeBy(
    pages.flatMap((page) => Array.isArray(page.images) ? page.images : [])
      .map((image) => cleanDescription(image.title || ''))
      .filter((fileTitle) => /\.(jpe?g|png|webp)$/i.test(fileTitle)),
    (fileTitle) => normalize(fileTitle),
  ).slice(0, 40);

  if (!fileTitles.length) return [];

  const batches = [];
  for (let i = 0; i < fileTitles.length; i += 20) batches.push(fileTitles.slice(i, i + 20));

  const images = [];
  for (const batch of batches) {
    const payload = await fetchJson(WIKIPEDIA_API, {
      action: 'query',
      format: 'json',
      formatversion: '2',
      titles: batch.join('|'),
      prop: 'imageinfo',
      iiprop: 'url|mime|extmetadata',
      iiurlwidth: '1400',
    }, wikiHeaders(env));
    if (payload?.__http_status || payload?.__error) continue;
    const pages = Array.isArray(payload?.query?.pages) ? payload.query.pages : [];
    images.push(...pages.map((page) => imageInfoFromPage(page, 'Wikipedia article image')).filter(Boolean));
    if (images.length >= limit) break;
  }

  return images.slice(0, limit);
}

async function fetchCommonsImages(query, limit, env) {
  const payload = await fetchJson(COMMONS_API, {
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: String(Math.max(1, Math.min(limit, 20))),
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
    iiurlwidth: '1400',
  }, wikiHeaders(env));
  if (payload?.__http_status || payload?.__error) return [];

  const pages = Array.isArray(payload?.query?.pages) ? payload.query.pages : [];
  return pages
    .sort((a, b) => (a.index ?? 999999) - (b.index ?? 999999))
    .map((page) => imageInfoFromPage(page, 'Wikimedia Commons'))
    .filter(Boolean);
}
function normalizeImageItem(item) {
  const url = typeof item === 'string' ? item : item?.url;
  const cleanUrl = allowedImageUrl(url);
  if (!cleanUrl) return null;
  return typeof item === 'string' ? { url: cleanUrl } : { ...item, url: cleanUrl };
}

function cleanImageLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 10;
  return Math.min(Math.max(parsed, 1), 10);
}


async function collectImages(omdb, wikiCandidate, query, env, imageLimit = 10) {
  imageLimit = cleanImageLimit(imageLimit);
  const images = [];
  const finalTitle = omdbTitle(omdb) || wikiCandidate.title || wikiCandidate.wikipedia_title || query;
  const finalYear = omdbYear(omdb) || wikiCandidate.year || '';
  const wikiTitle = wikiCandidate.wikipedia_title || wikiCandidate.title || finalTitle;
  const context = {
    finalTitle,
    wikiTitle,
    cleanTitle: cleanWikipediaMovieTitle(wikiTitle) || finalTitle,
    year: finalYear,
  };
  const poster = omdbPoster(omdb);

  if (poster) images.push({ url: poster, source: 'OMDb poster', title: `${finalTitle} poster` });
  if (wikiCandidate.wiki_image_url) {
    images.push({
      url: wikiCandidate.wiki_image_url,
      source: 'Wikipedia page image',
      source_url: wikiCandidate.wiki_url,
      title: wikiTitle,
    });
  }

  // Prefer images attached to the actual chosen Wikipedia film page. These are
  // far safer than generic word/image searches, because they are curated on the
  // film article itself.
  images.push(...await fetchWikipediaArticleImages(wikiTitle, imageLimit, env));

  // Only use Commons as a small fallback and only with exact movie-title based
  // searches. Do not search the raw selected word, because that can bring in
  // visually nice but unrelated photos.
  const commonsSearches = dedupeBy([
    finalYear ? `"${finalTitle}" ${finalYear} film poster` : `"${finalTitle}" film poster`,
    `"${finalTitle}" film still`,
    `"${wikiTitle}" film`,
  ].filter((value) => cleanDescription(value).length > 5), (value) => normalize(value));

  for (const search of commonsSearches) {
    if (images.length >= imageLimit) break;
    images.push(...await fetchCommonsImages(search, imageLimit, env));
  }

  const normalizedImages = dedupeBy(images.map(normalizeImageItem).filter(Boolean), (item) => item.url);
  const guaranteedImages = normalizedImages.filter((image) =>
    image.source === 'OMDb poster' || image.source === 'Wikipedia page image'
  );
  const filteredImages = normalizedImages.filter((image) =>
    guaranteedImages.includes(image) || imageLooksRelatedToFilm(image, context)
  );

  return dedupeBy([...guaranteedImages, ...filteredImages], (item) => item.url)
    .slice(0, imageLimit);
}
async function buildWikipediaOnlyResult(wikiCandidate, query, env, imageLimit = 10) {
  let images = await collectImages(null, wikiCandidate, query, env, imageLimit);

  if (!images.length && wikiCandidate.wiki_image_url) {
    images = [{
      url: wikiCandidate.wiki_image_url,
      source: 'Wikipedia page image',
      source_url: wikiCandidate.wiki_url || '',
      title: wikiCandidate.wikipedia_title || wikiCandidate.title || '',
    }];
  }

  const poster = wikiCandidate.wiki_image_url || images[0]?.url || '';
  return {
    movie: wikiCandidate.title,
    title: wikiCandidate.title,
    year: wikiCandidate.year || '',
    description: wikiCandidate.description,
    plot: wikiCandidate.description,
    source: 'Wikipedia',
    score: Number((wikiCandidate.score || 0).toFixed(4)),
    reason: `Wikipedia found a likely film for “${query}”. OMDb was unavailable or did not return a matching verified movie, so this result falls back to Wikipedia film-page data only.`,
    imdb_id: '',
    rating: '',
    genres: '',
    runtime: '',
    director: '',
    actors: '',
    poster_url: poster,
    poster_urls: images.map((image) => image.url),
    images,
    pictures: images,
    requested_image_count: imageLimit,
    returned_image_count: images.length,
    wiki_url: wikiCandidate.wiki_url || '',
    image_source_url: images[0]?.source_url || wikiCandidate.wiki_url || '',
    image_license: images[0]?.license || '',
    image_credit: images[0]?.credit || '',
    omdb: null,
  };
}

async function findBestMovie(query, mode = 'fast', env = {}, imageLimit = 10, excludedMovies = []) {
  query = cleanDescription(query).slice(0, 120);
  mode = mode === 'watch' ? 'watch' : 'fast';
  imageLimit = cleanImageLimit(imageLimit);
  const excluded = normalizeExcludedMovies(excludedMovies);

  const wikiCandidates = (await collectWikipediaCandidates(query, mode, env))
    .filter((candidate) => !movieIsExcluded(candidate.title, candidate.year, '', excluded));
  if (!wikiCandidates.length) return null;

  // Wrangler loads OMDB_API_KEY from .dev.vars during local development and from
  // Worker secrets in production. If it is missing, unreachable, or OMDb finds
  // no verified match, the route now returns the best Wikipedia-only result
  // instead of failing with 404/500.
  if (env?.OMDB_API_KEY) {
    for (const wikiCandidate of wikiCandidates) {
      let omdb = null;
      try {
        omdb = await findOmdbForWikipediaCandidate(wikiCandidate, env);
      } catch (error) {
        console.warn('OMDb lookup failed; falling back to Wikipedia only:', error?.message || error);
        omdb = null;
      }
      if (!omdb) continue;
      if (movieIsExcluded(omdbTitle(omdb), omdbYear(omdb), omdb.imdbID, excluded)) continue;

      const images = await collectImages(omdb, wikiCandidate, query, env, imageLimit);
      const poster = omdbPoster(omdb) || images[0]?.url || '';
      const plot = omdbPlot(omdb) || wikiCandidate.description;
      const title = omdbTitle(omdb) || wikiCandidate.title;
      const year = omdbYear(omdb) || wikiCandidate.year || '';

      return {
        movie: title,
        title,
        year,
        description: plot,
        plot,
        wiki_description: wikiCandidate.description,
        source: 'Wikipedia + OMDb',
        score: Number((wikiCandidate.score || 0).toFixed(4)),
        reason: `Wikipedia found a likely film for “${query}”; OMDb verified the movie and supplied the final title, full plot, poster, and metadata. Only film-page related images were collected from OMDb, Wikipedia, and tightly filtered Wikimedia Commons results.`,
        imdb_id: cleanDescription(omdb.imdbID || ''),
        rating: cleanDescription(omdb.imdbRating || ''),
        genres: cleanDescription(omdb.Genre || ''),
        runtime: cleanDescription(omdb.Runtime || ''),
        director: cleanDescription(omdb.Director || ''),
        actors: cleanDescription(omdb.Actors || ''),
        poster_url: poster,
        poster_urls: images.map((image) => image.url),
        images,
        pictures: images,
        requested_image_count: imageLimit,
        returned_image_count: images.length,
        wiki_url: wikiCandidate.wiki_url || '',
        image_source_url: images[0]?.source_url || wikiCandidate.wiki_url || '',
        image_license: images[0]?.license || '',
        image_credit: images[0]?.credit || '',
        omdb: {
          imdb_id: cleanDescription(omdb.imdbID || ''),
          rated: cleanDescription(omdb.Rated || ''),
          released: cleanDescription(omdb.Released || ''),
          awards: cleanDescription(omdb.Awards || ''),
          country: cleanDescription(omdb.Country || ''),
          language: cleanDescription(omdb.Language || ''),
        },
      };
    }
  }

  return buildWikipediaOnlyResult(wikiCandidates[0], query, env, imageLimit);
}


async function findRandomHorrorMovie(words = [], mode = 'fast', env = {}, imageLimit = 10, excludedMovies = [], genre = 'horror') {
  mode = mode === 'watch' ? 'watch' : 'fast';
  imageLimit = cleanImageLimit(imageLimit);
  const cleanWords = Array.isArray(words) ? words.map(cleanDescription).filter(Boolean) : [];
  const excluded = normalizeExcludedMovies(excludedMovies);
  const genreLabel = normalize(genre) || 'horror';

  const wikiCandidates = shuffleItems(
    (await collectHorrorWikipediaCandidates(cleanWords, mode, env, genreLabel))
      .filter((candidate) => !movieIsExcluded(candidate.title, candidate.year, '', excluded))
  );

  if (!wikiCandidates.length) return null;

  if (env?.OMDB_API_KEY) {
    for (const wikiCandidate of wikiCandidates) {
      let omdb = null;
      try {
        omdb = await findOmdbForWikipediaCandidate(wikiCandidate, env);
      } catch (error) {
        console.warn(`OMDb ${genreLabel} lookup failed; falling back to Wikipedia only:`, error?.message || error);
        omdb = null;
      }

      if (!omdb) continue;
      if (!isGenreOmdb(omdb, wikiCandidate, genreLabel)) continue;
      if (movieIsExcluded(omdbTitle(omdb), omdbYear(omdb), omdb.imdbID, excluded)) continue;

      const images = await collectImages(omdb, wikiCandidate, cleanWords.length ? cleanWords.join(' ') : genreLabel, env, imageLimit);
      const poster = omdbPoster(omdb) || images[0]?.url || '';
      const plot = omdbPlot(omdb) || wikiCandidate.description;
      const title = omdbTitle(omdb) || wikiCandidate.title;
      const year = omdbYear(omdb) || wikiCandidate.year || '';

      return buildGenreResult({
        movie: title,
        title,
        year,
        description: plot,
        plot,
        wiki_description: wikiCandidate.description,
        source: 'Wikipedia + OMDb',
        score: Number((wikiCandidate.score || 0).toFixed(4)),
        reason: `Wikipedia found a ${genreLabel} film${cleanWords.length ? ` matching “${cleanWords.join(' ')}”` : ''}; OMDb verified the movie and supplied metadata.`,
        imdb_id: cleanDescription(omdb.imdbID || ''),
        rating: cleanDescription(omdb.imdbRating || ''),
        genres: cleanDescription(omdb.Genre || ''),
        runtime: cleanDescription(omdb.Runtime || ''),
        director: cleanDescription(omdb.Director || ''),
        actors: cleanDescription(omdb.Actors || ''),
        poster_url: poster,
        poster_urls: images.map((image) => image.url),
        images,
        pictures: images,
        requested_image_count: imageLimit,
        returned_image_count: images.length,
        wiki_url: wikiCandidate.wiki_url || '',
        image_source_url: images[0]?.source_url || wikiCandidate.wiki_url || '',
        image_license: images[0]?.license || '',
        image_credit: images[0]?.credit || '',
        omdb: {
          imdb_id: cleanDescription(omdb.imdbID || ''),
          rated: cleanDescription(omdb.Rated || ''),
          released: cleanDescription(omdb.Released || ''),
          awards: cleanDescription(omdb.Awards || ''),
          country: cleanDescription(omdb.Country || ''),
          language: cleanDescription(omdb.Language || ''),
        },
      }, genreLabel);
    }
  }

  return buildGenreResult(await buildWikipediaOnlyResult(wikiCandidates[0], cleanWords.length ? cleanWords.join(' ') : genreLabel, env, imageLimit), genreLabel);
}


const LITERATURE_METADATA_FILES = {
  adventure: '/apps/adventure-books/adventure_books_metadata.csv',
  crime: '/apps/crime-books/crime_books_metadata.csv',
  horror: '/apps/horror-books/horror_books_metadata.csv',
  romance: '/apps/romance-books/romance_books_metadata.csv',
  speculative: '/apps/speculative-books/speculative_books_metadata.csv',
  literary: '/apps/literary-books/literary_books_metadata.csv',
};

const literatureCsvCache = new Map();

function normalizeLiteratureGenreKey(value = '') {
  const clean = normalize(value).replace(/[^a-z0-9]+/g, ' ').trim();
  if (clean.includes('adventure')) return 'adventure';
  if (clean.includes('crime') || clean.includes('detective') || clean.includes('mystery')) return 'crime';
  if (clean.includes('horror')) return 'horror';
  if (clean.includes('romance') || clean.includes('romantic')) return 'romance';
  if (clean.includes('speculative') || clean.includes('fantasy') || clean.includes('science fiction') || clean.includes('sci fi')) return 'speculative';
  if (clean.includes('literary') || clean.includes('classic')) return 'literary';
  return clean.replace(/\s+/g, '-');
}

function parseNsfwFlag(value) {
  if (value === true || value === 1) return true;
  const normalized = String(value ?? '').trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

function literatureRowToResult(row = {}, fallbackGenre = '') {
  const title = cleanDescription(row.title || row.book_name || row.name || '');
  const pdfUrl = cleanDescription(row.pdf_url || row.pdf || row.local_pdf_path || '');
  const sourceUrl = cleanDescription(row.internet_archive_url || row.source_url || pdfUrl);
  const archiveIdentifier = cleanDescription(
    row.archive_identifier_or_source_id || row.identifier || row.id || ''
  ) || (() => {
    const match = sourceUrl.match(/archive\.org\/(?:download|details|embed)\/([^/?#]+)/i);
    if (!match?.[1]) return '';
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  })();
  if (!title || (!pdfUrl && !archiveIdentifier)) return null;

  const coverUrl = cleanDescription(
    row.cover_url ||
    row.coverurl ||
    row.local_cover_path ||
    row.cover ||
    row.image_url ||
    row.thumbnail_url ||
    ''
  );
  const wordRelevance = normalizeRelevanceProfile(
    row.word_relevance ||
    row.wordrelevance ||
    row.world_relevance ||
    row.wordRelevance ||
    {}
  );

  return {
    ok: true,
    id: archiveIdentifier || cleanDescription(row.identifier || row.id || `${title}|${row.author || ''}`),
    identifier: archiveIdentifier,
    title,
    name: title,
    book: title,
    author: cleanDescription(row.author || row.creator || ''),
    writer: cleanDescription(row.author || row.creator || ''),
    year: cleanDescription(row.year || row.publication_year || row.date || ''),
    language: cleanDescription(row.language || ''),
    downloads: cleanDescription(row.downloads || ''),
    pages: cleanDescription(row.pages || row.number_of_pages_in_pdf || ''),
    genre: normalizeLiteratureGenreKey(row.genre || fallbackGenre),
    raw_genre: cleanDescription(row.genre || fallbackGenre),
    subjects: cleanDescription(row.subjects || ''),
    description: cleanDescription(row.short_description || row.description || ''),
    short_description: cleanDescription(row.short_description || row.description || ''),
    source: sourceUrl,
    source_url: sourceUrl,
    internet_archive_url: cleanDescription(row.internet_archive_url || ''),
    pdf: pdfUrl,
    pdf_url: pdfUrl,
    local_pdf_path: cleanDescription(row.local_pdf_path || ''),
    cover: coverUrl,
    cover_url: coverUrl,
    coverUrl,
    image_url: coverUrl,
    imageUrl: coverUrl,
    local_cover_path: cleanDescription(row.local_cover_path || ''),
    word_relevance: wordRelevance,
    wordRelevance,
    is_NSFW: parseNsfwFlag(row.is_nsfw ?? row.is_NSFW),
    is_nsfw: parseNsfwFlag(row.is_nsfw ?? row.is_NSFW),
    source_type: 'literature_csv_backend',
  };
}

async function loadLiteratureCsvBooks(env = {}, genre = '', minimumRows = 1) {
  const genreKey = normalizeLiteratureGenreKey(genre);
  const fileName = LITERATURE_METADATA_FILES[genreKey];
  if (!fileName) return [];

  const chunk = await ensureCsvAssetRows(env, fileName, minimumRows);
  const cached = literatureCsvCache.get(fileName);
  if (cached && cached.__loadedRowCount === chunk.rows.length) return cached;

  const books = chunk.rows.length
    ? chunk.rows
        .map((row) => literatureRowToResult(row, genreKey))
        .filter(Boolean)
        .map((book) => {
          const entries = rankedLiteratureRelevanceEntries(book);
          return {
            ...book,
            __relevanceEntries: entries,
            __relevanceMap: new Map(entries.map((entry, index) => [
              entry.key,
              { rank: index, score: entry.score },
            ])),
          };
        })
    : [];

  Object.defineProperty(books, '__loadedRowCount', { value: chunk.rows.length, enumerable: false });
  Object.defineProperty(books, '__hasMoreCsv', { value: chunk.hasMore, enumerable: false });

  Object.defineProperty(books, '__idf', {
    value: buildLiteratureRelevanceIdf(books),
    enumerable: false,
  });

  literatureCsvCache.set(fileName, books);
  return books;
}

function literatureBookIsExcluded(book = {}, excluded = []) {
  const id = cleanDescription(book.id || book.identifier || '').toLowerCase();
  const title = normalize(book.title || book.name || book.book || '');
  return excluded.some((item) => {
    const itemId = cleanDescription(
      item?.id || item?.identifier || item?.book_id || item?.bookId || ''
    ).toLowerCase();
    const itemTitle = normalize(
      typeof item === 'string'
        ? item
        : (item?.title || item?.name || item?.book || '')
    );
    if (itemId && id && itemId === id) return true;
    return Boolean(
      itemTitle &&
      title &&
      (itemTitle === title || sequenceSimilarity(itemTitle, title) >= 0.96)
    );
  });
}

function rankedLiteratureRelevanceEntries(book = {}) {
  const raw = book.word_relevance || book.wordRelevance || {};
  const map = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return Object.entries(map)
    .map(([word, score]) => ({
      word: cleanDescription(word),
      key: normalizeRelevanceWord(word),
      score: Number(score),
    }))
    .filter((item) => item.key && Number.isFinite(item.score))
    .sort((a, b) => (b.score - a.score) || a.word.localeCompare(b.word));
}

function buildLiteratureRelevanceIdf(books = []) {
  const documentCount = Math.max(books.length, 1);
  const frequencies = new Map();

  books.forEach((book) => {
    const keys = new Set(
      rankedLiteratureRelevanceEntries(book).map((entry) => entry.key)
    );
    keys.forEach((key) => frequencies.set(key, (frequencies.get(key) || 0) + 1));
  });

  const idf = new Map();
  frequencies.forEach((count, key) => {
    const raw = Math.log((documentCount + 1) / (count + 1)) + 1;
    idf.set(key, raw);
  });

  const values = [...idf.values()];
  const max = values.length ? Math.max(...values) : 1;
  idf.forEach((value, key) => idf.set(key, 0.2 + 0.8 * (value / max)));
  return idf;
}

function scoreLiteratureByPriorityWords(
  book = {},
  addedWords = [],
  currentProfile = {},
  idf = new Map(),
  contrastPairs = new Map(),
) {
  const entries = book.__relevanceEntries || rankedLiteratureRelevanceEntries(book);
  const rankByWord = book.__relevanceMap || new Map(
    entries.map((entry, index) => [
      entry.key,
      { rank: index, score: entry.score },
    ])
  );

  const words = dedupeBy(
    addedWords.map(normalizeRelevanceWord).filter(Boolean),
    (word) => word,
  );

  const profile = relevanceProfileSimilarity(
    currentProfile,
    entries,
    idf,
    contrastPairs,
  );

  const attachedWordMatches = words.map((word) => {
    const match = rankByWord.get(word) || null;
    const opposites = contrastPairs.get(word) || new Set();
    const oppositeMatches = [...opposites]
      .map((oppositeWord) => ({
        word: oppositeWord,
        match: rankByWord.get(oppositeWord),
      }))
      .filter((item) => item.match);

    const rankQuality = match
      ? (entries.length <= 1 ? 1 : 1 - (match.rank / (entries.length - 1)))
      : 0;

    return {
      word,
      found: Boolean(match),
      rank: match ? match.rank : Number.POSITIVE_INFINITY,
      score: match ? match.score : 0,
      rankQuality,
      oppositeFound: oppositeMatches.length > 0,
      oppositeWords: oppositeMatches.map((item) => item.word),
    };
  });

  const matched = attachedWordMatches.filter((item) => item.found);
  const matchedWordCount = matched.length;
  const allWordsFound = words.length > 0 && matchedWordCount === words.length;
  const averageRankQuality = matchedWordCount
    ? matched.reduce((sum, item) => sum + item.rankQuality, 0) / matchedWordCount
    : 0;
  const averageWordScore = matchedWordCount
    ? matched.reduce((sum, item) => sum + item.score, 0) / matchedWordCount
    : 0;
  const worstMatchedRank = matchedWordCount
    ? Math.max(...matched.map((item) => item.rank))
    : Number.POSITIVE_INFINITY;
  const totalMatchedRank = matchedWordCount
    ? matched.reduce((sum, item) => sum + item.rank, 0)
    : Number.POSITIVE_INFINITY;

  return {
    book,
    entries,
    attachedWordMatches,
    matchedAttachedWords: matched.map((item) => item.word),
    matchedWordCount,
    allWordsFound,
    anyAttachedOppositeFound: attachedWordMatches.some((item) => item.oppositeFound),
    attachedOppositeWords: dedupeBy(
      attachedWordMatches.flatMap((item) => item.oppositeWords),
      (word) => word,
    ),
    averageRankQuality,
    averageWordScore,
    worstMatchedRank,
    totalMatchedRank,
    profileSimilarity: profile.similarity,
    profileOrderAgreement: profile.orderAgreement,
    profileSymmetricOverlap: profile.symmetricOverlap,
    profileLengthSimilarity: profile.lengthSimilarity,
    profileLengthPenalty: profile.lengthPenalty,
    contradictionPenalty: profile.contradictionPenalty,
    currentProfileLength: profile.currentLength,
    candidateProfileLength: profile.candidateLength,
    topRelevanceWord: entries[0]?.word || '',
    topRelevanceScore: entries[0]?.score || 0,
  };
}

async function handleLiteratureMatch(request, env = {}) {
  let payload = {};
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON body.' }, 400);
  }

  const genre = normalizeLiteratureGenreKey(
    payload.genre ||
    payload.literature_genre ||
    payload.literatureGenre ||
    ''
  );

  const words = dedupeBy(
    [
      ...(Array.isArray(payload.words) ? payload.words : []),
      ...(Array.isArray(payload.added_words) ? payload.added_words : []),
      ...(Array.isArray(payload.addedWords) ? payload.addedWords : []),
      ...(Array.isArray(payload.priority_words) ? payload.priority_words : []),
      ...(Array.isArray(payload.priorityWords) ? payload.priorityWords : []),
    ].map(cleanDescription).filter(Boolean),
    (value) => normalizeRelevanceWord(value),
  );

  const excluded = [
    ...(Array.isArray(payload.exclude_books) ? payload.exclude_books : []),
    ...(Array.isArray(payload.excludeBooks) ? payload.excludeBooks : []),
    ...(Array.isArray(payload.previous_books) ? payload.previous_books : []),
    ...(Array.isArray(payload.previousBooks) ? payload.previousBooks : []),
  ];

  const currentBook = payload.current_book || payload.currentBook || null;
  if (currentBook) excluded.push(currentBook);

  const currentBookRelevance = normalizeRelevanceProfile(
    payload.current_book_relevance ||
    payload.currentBookRelevance ||
    payload.relevance_profile ||
    payload.relevanceProfile ||
    {}
  );

  const continueWithSettings = Boolean(
    payload.continue_with_settings ||
    payload.continueWithSettings ||
    payload.relax_opposites ||
    payload.relaxOpposites
  );

  try {
    let minimumRows = excluded.length + CSV_LOAD_AHEAD_ROWS;
    while (true) {
      const books = await loadLiteratureCsvBooks(env, genre, minimumRows);
    if (!books.length) {
      if (books.__hasMoreCsv) {
        minimumRows += CSV_LOAD_AHEAD_ROWS;
        continue;
      }
      return json({
        ok: false,
        code: 'NO_BOOKS',
        error: `No literature metadata was found for genre "${genre}".`,
      }, 404);
    }

    const unseen = books.filter((book) => !literatureBookIsExcluded(book, excluded));
    const pool = continueWithSettings
      ? books
      : (unseen.length ? unseen : books);

    if (!words.length) {
      const seed = cleanDescription(
        payload.random_seed ||
        payload.randomSeed ||
        `${Date.now()}-${Math.random()}`
      );
      const selected = pool[seededIndex(seed, pool.length)] || pool[0];
      return json({
        ok: true,
        book: selected,
        ...selected,
        words,
        genre,
        continued_with_settings: continueWithSettings,
        ...(apiDebugEnabled(env) ? {
          search_debug: {
            matched_word_count: 0,
            attached_word_count: 0,
            all_attached_words_found: false,
          },
        } : {}),
      });
    }

    const idf = pool === books && books.__idf ? books.__idf : buildLiteratureRelevanceIdf(pool);
    const contrastPairs = await loadContrastPairMap(env);
    const scoringProfile = continueWithSettings ? {} : currentBookRelevance;

    const scored = pool.map((book) =>
      scoreLiteratureByPriorityWords(
        book,
        words,
        scoringProfile,
        idf,
        contrastPairs,
      )
    );

    const eligible = scored.filter(
      (item) => continueWithSettings || !item.anyAttachedOppositeFound
    );
    const bestMatchCount = eligible.reduce(
      (best, item) => Math.max(best, item.matchedWordCount),
      0,
    );
    const candidates = eligible.filter(
      (item) =>
        item.matchedWordCount > 0 &&
        item.matchedWordCount === bestMatchCount
    );

    if (!candidates.length) {
      if (books.__hasMoreCsv) {
        minimumRows = books.length + CSV_LOAD_AHEAD_ROWS;
        continue;
      }
      return json({
        ok: false,
        code: 'NO_BOOK_WITH_SETTINGS',
        words,
        genre,
        continued_with_settings: continueWithSettings,
        error: 'Could not find a book with these marble settings.',
      }, 404);
    }

    candidates.sort((a, b) => {
      if (b.matchedWordCount !== a.matchedWordCount) {
        return b.matchedWordCount - a.matchedWordCount;
      }
      if (b.averageRankQuality !== a.averageRankQuality) {
        return b.averageRankQuality - a.averageRankQuality;
      }
      if (b.averageWordScore !== a.averageWordScore) {
        return b.averageWordScore - a.averageWordScore;
      }
      if (a.worstMatchedRank !== b.worstMatchedRank) {
        return a.worstMatchedRank - b.worstMatchedRank;
      }
      if (a.totalMatchedRank !== b.totalMatchedRank) {
        return a.totalMatchedRank - b.totalMatchedRank;
      }

      if (!continueWithSettings) {
        if (b.profileSimilarity !== a.profileSimilarity) {
          return b.profileSimilarity - a.profileSimilarity;
        }
        if (b.profileOrderAgreement !== a.profileOrderAgreement) {
          return b.profileOrderAgreement - a.profileOrderAgreement;
        }
        if (b.profileSymmetricOverlap !== a.profileSymmetricOverlap) {
          return b.profileSymmetricOverlap - a.profileSymmetricOverlap;
        }
      }

      if (a.candidateProfileLength !== b.candidateProfileLength) {
        return a.candidateProfileLength - b.candidateProfileLength;
      }
      if (
        !continueWithSettings &&
        b.profileLengthSimilarity !== a.profileLengthSimilarity
      ) {
        return b.profileLengthSimilarity - a.profileLengthSimilarity;
      }
      if (
        !continueWithSettings &&
        a.contradictionPenalty !== b.contradictionPenalty
      ) {
        return a.contradictionPenalty - b.contradictionPenalty;
      }
      if (b.topRelevanceScore !== a.topRelevanceScore) {
        return b.topRelevanceScore - a.topRelevanceScore;
      }

      return String(a.book.title || '').localeCompare(String(b.book.title || ''));
    });

    const best = candidates[0];
    const selected = {
      ...best.book,
      matched_priority_words: words,
      attached_word_match_count: best.matchedWordCount,
      attached_word_count: words.length,
      all_attached_words_found: Boolean(best.allWordsFound),
      matched_attached_words: best.matchedAttachedWords || [],
      attached_word_opposite_found: Boolean(best.anyAttachedOppositeFound),
      attached_word_opposite_words: best.attachedOppositeWords || [],
      attached_word_average_rank_quality: Number(best.averageRankQuality.toFixed(6)),
      attached_word_average_score: Number(best.averageWordScore.toFixed(6)),
      continued_with_settings: Boolean(continueWithSettings),
      relevance_profile_similarity: Number(best.profileSimilarity.toFixed(6)),
      relevance_order_agreement: Number(best.profileOrderAgreement.toFixed(6)),
      relevance_symmetric_overlap: Number(best.profileSymmetricOverlap.toFixed(6)),
      relevance_length_similarity: Number(best.profileLengthSimilarity.toFixed(6)),
      relevance_length_penalty: Number(best.profileLengthPenalty.toFixed(6)),
      relevance_contradiction_penalty: Number(best.contradictionPenalty.toFixed(6)),
      current_relevance_length: best.currentProfileLength,
      candidate_relevance_length: best.candidateProfileLength,
      top_relevance_word: best.topRelevanceWord,
    };

    return json({
      ok: true,
      book: selected,
      ...selected,
      words,
      genre,
      continued_with_settings: continueWithSettings,
      ...(apiDebugEnabled(env) ? {
        search_debug: {
          matched_word_count: best.matchedWordCount,
        attached_word_count: words.length,
        all_attached_words_found: best.allWordsFound,
        matched_attached_words: best.matchedAttachedWords,
        attached_word_opposite_found: best.anyAttachedOppositeFound,
        attached_word_opposite_words: best.attachedOppositeWords,
        average_rank_quality: Number(best.averageRankQuality.toFixed(6)),
        average_word_score: Number(best.averageWordScore.toFixed(6)),
        relevance_profile_similarity: Number(best.profileSimilarity.toFixed(6)),        },
      } : {}),
    });
    }
  } catch (error) {
    return json({
      ok: false,
      error: error.message || 'Literature matcher failed.',
    }, 500);
  }
}


const PAINTING_METADATA_FILE_CANDIDATES = [
  'apps/paintings/paintings_metadata.csv',
  'paintings_metadata.csv',
  'abstract-art_paintings_metadata.csv',
  'classicism_paintings_metadata.csv',
  'romanticism_paintings_metadata.csv',
  'baroque_paintings_metadata.csv',
  'impressionism_paintings_metadata.csv',
  'post-impressionism_paintings_metadata.csv',
  'surrealism_paintings_metadata.csv',
  'cubism_paintings_metadata.csv',
  'expressionism_paintings_metadata.csv',
  'realism_paintings_metadata.csv',
];

const paintingCsvCache = new Map();

function normalizePaintingGenreKey(value = '') {
  return normalize(value)
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/^-+|-+$/g, '');
}

function parsePaintingPictures(row = {}) {
  return dedupeBy([
    cleanDescription(row.image_url || ''),
    cleanDescription(row.local_image_path || ''),
    cleanDescription(row.image || ''),
    cleanDescription(row.thumbnail_url || ''),
  ].filter(Boolean), (value) => value);
}

function paintingRowToResult(row = {}, fallbackGenre = '') {
  const title = cleanDescription(row.title || row.name || row.artwork_title || '');
  if (!title) return null;

  const pictures = parsePaintingPictures(row);
  const imageUrl = pictures[0] || '';
  if (!imageUrl) return null;

  const wordRelevance = normalizeRelevanceProfile(
    row.word_relevance || row.wordrelevance || row.wordRelevance || {}
  );

  return {
    ok: true,
    id: cleanDescription(row.id || row.object_id || row.identifier || `${title}-${row.artist_display || ''}`),
    title,
    name: title,
    artist: cleanDescription(row.artist_display || row.artist || row.creator || ''),
    artist_display: cleanDescription(row.artist_display || row.artist || row.creator || ''),
    date: cleanDescription(row.date_display || row.date || row.year || ''),
    date_display: cleanDescription(row.date_display || row.date || row.year || ''),
    genre: normalizePaintingGenreKey(row.genre || fallbackGenre),
    raw_genre: cleanDescription(row.genre || fallbackGenre),
    style: cleanDescription(row.style_title || row.style || ''),
    style_title: cleanDescription(row.style_title || row.style || ''),
    classification: cleanDescription(row.classification_title || row.classification || ''),
    classification_title: cleanDescription(row.classification_title || row.classification || ''),
    medium: cleanDescription(row.medium_display || row.medium || ''),
    medium_display: cleanDescription(row.medium_display || row.medium || ''),
    place_of_origin: cleanDescription(row.place_of_origin || ''),
    description: cleanDescription(row.description || ''),
    artwork_url: cleanDescription(row.artwork_url || row.source_url || row.url || ''),
    artworkUrl: cleanDescription(row.artwork_url || row.source_url || row.url || ''),
    image_url: imageUrl,
    imageUrl,
    local_image_path: cleanDescription(row.local_image_path || ''),
    image_id: cleanDescription(row.image_id || ''),
    pictures,
    word_relevance: wordRelevance,
    wordRelevance,
    source: 'painting_csv_backend',
  };
}

async function loadPaintingCsvRows(env = {}, genres = [], minimumRows = 1) {
  const genreKeys = dedupeBy(
    (Array.isArray(genres) ? genres : [genres])
      .map(normalizePaintingGenreKey)
      .filter(Boolean),
    (value) => value,
  );

  const exactFiles = [];
  genreKeys.forEach((genre) => {
    exactFiles.push(
      `/apps/paintings/${genre}/${genre}_paintings_metadata.csv`,
      `/apps/paintings/${genre}_paintings_metadata.csv`,
    );
  });

  async function loadRows(fileNames) {
    const groups = await mapWithConcurrency(
      dedupeBy(fileNames, (value) => value),
      3,
      async (fileName) => {
        const chunk = await ensureCsvAssetRows(env, fileName, minimumRows);
        let rows = paintingCsvCache.get(fileName);
        if (!rows || rows.length !== chunk.rows.length) {
          rows = chunk.rows;
          Object.defineProperty(rows, '__hasMoreCsv', { value: chunk.hasMore, enumerable: false, configurable: true });
          paintingCsvCache.set(fileName, rows);
        }
        return rows;
      },
    );
    const flattened = groups.flat();
    Object.defineProperty(flattened, '__hasMoreCsv', {
      value: groups.some((rows) => Boolean(rows?.__hasMoreCsv)),
      enumerable: false,
    });
    return flattened;
  }

  // Most requests now touch only the selected genre's exact metadata file.
  let allRows = await loadRows(exactFiles);

  // Preserve compatibility with older layouts only when exact files are absent.
  if (!allRows.length) {
    allRows = await loadRows(PAINTING_METADATA_FILE_CANDIDATES);
  }

  const hasMoreCsv = allRows.some((row) => row?.__hasMoreCsv) || allRows.__hasMoreCsv || false;
  const seen = new Set();
  const uniqueRows = allRows.filter((row) => {
    const key = cleanDescription(
      row.id ||
      row.object_id ||
      row.identifier ||
      `${row.title || ''}|${row.artist_display || ''}`
    ).toLowerCase();

    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  Object.defineProperty(uniqueRows, '__hasMoreCsv', { value: Boolean(hasMoreCsv), enumerable: false });
  return uniqueRows;
}

function paintingMatchesGenre(painting = {}, genres = []) {
  const genreKeys = dedupeBy(
    (Array.isArray(genres) ? genres : [genres])
      .map(normalizePaintingGenreKey)
      .filter(Boolean),
    (value) => value,
  );
  if (!genreKeys.length) return true;

  const haystack = normalizePaintingGenreKey([
    painting.genre,
    painting.raw_genre,
    painting.style,
    painting.classification,
    painting.title,
    painting.description,
  ].join(' '));

  return genreKeys.some((genre) =>
    haystack.includes(genre) ||
    (genre === 'abstract-art' && haystack.includes('abstract')) ||
    (genre === 'post-impressionism' && haystack.includes('post-impression'))
  );
}

function paintingIsExcluded(painting = {}, excluded = []) {
  const id = cleanDescription(painting.id || '').toLowerCase();
  const title = normalize(painting.title || painting.name || '');
  return excluded.some((item) => {
    const itemId = cleanDescription(item?.id || item?.painting_id || item?.paintingId || '').toLowerCase();
    const itemTitle = normalize(typeof item === 'string' ? item : (item?.title || item?.name || ''));
    if (itemId && id && itemId === id) return true;
    return Boolean(itemTitle && title && (itemTitle === title || sequenceSimilarity(itemTitle, title) >= 0.96));
  });
}

function rankedPaintingRelevanceEntries(painting = {}) {
  const raw = painting.word_relevance || painting.wordRelevance || {};
  const map = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return Object.entries(map)
    .map(([word, score]) => ({
      word: cleanDescription(word),
      key: normalizeRelevanceWord(word),
      score: Number(score),
    }))
    .filter((item) => item.key && Number.isFinite(item.score))
    .sort((a, b) => (b.score - a.score) || a.word.localeCompare(b.word));
}

function buildPaintingRelevanceIdf(paintings = []) {
  const documentCount = Math.max(paintings.length, 1);
  const frequencies = new Map();

  paintings.forEach((painting) => {
    const keys = new Set(
      rankedPaintingRelevanceEntries(painting).map((entry) => entry.key)
    );
    keys.forEach((key) => frequencies.set(key, (frequencies.get(key) || 0) + 1));
  });

  const idf = new Map();
  frequencies.forEach((count, key) => {
    const raw = Math.log((documentCount + 1) / (count + 1)) + 1;
    idf.set(key, raw);
  });

  const values = [...idf.values()];
  const max = values.length ? Math.max(...values) : 1;
  idf.forEach((value, key) => idf.set(key, 0.2 + 0.8 * (value / max)));
  return idf;
}

function scorePaintingByPriorityWords(
  painting = {},
  addedWords = [],
  currentProfile = {},
  idf = new Map(),
  contrastPairs = new Map(),
) {
  const entries = painting.__relevanceEntries || rankedPaintingRelevanceEntries(painting);
  const rankByWord = painting.__relevanceMap || new Map(
    entries.map((entry, index) => [
      entry.key,
      { rank: index, score: entry.score },
    ])
  );

  const words = dedupeBy(
    addedWords.map(normalizeRelevanceWord).filter(Boolean),
    (word) => word,
  );

  const profile = relevanceProfileSimilarity(
    currentProfile,
    entries,
    idf,
    contrastPairs,
  );

  const attachedWordMatches = words.map((word) => {
    const match = rankByWord.get(word) || null;
    const opposites = contrastPairs.get(word) || new Set();
    const oppositeMatches = [...opposites]
      .map((oppositeWord) => ({
        word: oppositeWord,
        match: rankByWord.get(oppositeWord),
      }))
      .filter((item) => item.match);

    const rankQuality = match
      ? (entries.length <= 1 ? 1 : 1 - (match.rank / (entries.length - 1)))
      : 0;

    return {
      word,
      found: Boolean(match),
      rank: match ? match.rank : Number.POSITIVE_INFINITY,
      score: match ? match.score : 0,
      rankQuality,
      oppositeFound: oppositeMatches.length > 0,
      oppositeWords: oppositeMatches.map((item) => item.word),
    };
  });

  const matchedAttachedWords = attachedWordMatches.filter((item) => item.found);
  const matchedWordCount = matchedAttachedWords.length;
  const allWordsFound = words.length > 0 && matchedWordCount === words.length;
  const anyOppositeFound = attachedWordMatches.some((item) => item.oppositeFound);

  const averageRankQuality = matchedWordCount
    ? matchedAttachedWords.reduce((sum, item) => sum + item.rankQuality, 0) / matchedWordCount
    : 0;

  const averageWordScore = matchedWordCount
    ? matchedAttachedWords.reduce((sum, item) => sum + item.score, 0) / matchedWordCount
    : 0;

  const worstMatchedRank = matchedWordCount
    ? Math.max(...matchedAttachedWords.map((item) => item.rank))
    : Number.POSITIVE_INFINITY;

  const totalMatchedRank = matchedWordCount
    ? matchedAttachedWords.reduce((sum, item) => sum + item.rank, 0)
    : Number.POSITIVE_INFINITY;

  return {
    painting,
    entries,
    attachedWordMatches,
    matchedAttachedWords: matchedAttachedWords.map((item) => item.word),
    matchedWordCount,
    allWordsFound,
    anyAttachedOppositeFound: anyOppositeFound,
    attachedOppositeWords: dedupeBy(
      attachedWordMatches.flatMap((item) => item.oppositeWords),
      (word) => word,
    ),
    averageRankQuality,
    averageWordScore,
    worstMatchedRank,
    totalMatchedRank,
    profileSimilarity: profile.similarity,
    profileOverlap: profile.overlap,
    profileOrderAgreement: profile.orderAgreement,
    profileSymmetricOverlap: profile.symmetricOverlap,
    profileLengthSimilarity: profile.lengthSimilarity,
    profileLengthPenalty: profile.lengthPenalty,
    contradictionPenalty: profile.contradictionPenalty,
    currentProfileLength: profile.currentLength,
    candidateProfileLength: profile.candidateLength,
    topRelevanceWord: entries[0]?.word || '',
    topRelevanceScore: entries[0]?.score || 0,
  };
}

async function handlePaintingMatch(request, env = {}) {
  let payload = {};
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON body.' }, 400);
  }

  const words = dedupeBy(
    [
      ...(Array.isArray(payload.words) ? payload.words : []),
      ...(Array.isArray(payload.added_words) ? payload.added_words : []),
      ...(Array.isArray(payload.addedWords) ? payload.addedWords : []),
      ...(Array.isArray(payload.priority_words) ? payload.priority_words : []),
      ...(Array.isArray(payload.priorityWords) ? payload.priorityWords : []),
    ].map(cleanDescription).filter(Boolean),
    (value) => normalizeRelevanceWord(value),
  );

  const genres = dedupeBy(
    [
      ...(Array.isArray(payload.genres) ? payload.genres : []),
      payload.genre,
      payload.painting_genre,
      payload.paintingGenre,
    ].map(cleanDescription).filter(Boolean),
    (value) => normalizePaintingGenreKey(value),
  );

  const excluded = [
    ...(Array.isArray(payload.exclude_paintings) ? payload.exclude_paintings : []),
    ...(Array.isArray(payload.excludePaintings) ? payload.excludePaintings : []),
    ...(Array.isArray(payload.previous_paintings) ? payload.previous_paintings : []),
    ...(Array.isArray(payload.previousPaintings) ? payload.previousPaintings : []),
  ];

  const currentPainting = payload.current_painting || payload.currentPainting || null;
  if (currentPainting) excluded.push(currentPainting);

  const currentPaintingRelevance = normalizeRelevanceProfile(
    payload.current_painting_relevance ||
    payload.currentPaintingRelevance ||
    payload.relevance_profile ||
    payload.relevanceProfile ||
    {}
  );

  const continueWithSettings = Boolean(
    payload.continue_with_settings ||
    payload.continueWithSettings ||
    payload.relax_opposites ||
    payload.relaxOpposites
  );

  try {
    let minimumRows = excluded.length + CSV_LOAD_AHEAD_ROWS;
    while (true) {
      const rows = await loadPaintingCsvRows(env, genres, minimumRows);
    const paintings = rows
      .map((row) => paintingRowToResult(row, genres[0] || ''))
      .filter(Boolean)
      .filter((painting) => paintingMatchesGenre(painting, genres))
      .map((painting) => {
        const entries = rankedPaintingRelevanceEntries(painting);
        return {
          ...painting,
          __relevanceEntries: entries,
          __relevanceMap: new Map(entries.map((entry, index) => [
            entry.key,
            { rank: index, score: entry.score },
          ])),
        };
      });

    Object.defineProperty(paintings, '__idf', {
      value: buildPaintingRelevanceIdf(paintings),
      enumerable: false,
    });

    if (!paintings.length) {
      if (rows.__hasMoreCsv) {
        minimumRows = rows.length + CSV_LOAD_AHEAD_ROWS;
        continue;
      }
      return json({
        ok: false,
        code: 'NO_PAINTINGS',
        error: 'No painting metadata was found for this category.',
      }, 404);
    }

    const unseen = paintings.filter(
      (painting) => !paintingIsExcluded(painting, excluded)
    );

    // Exactly like movie search:
    // - normal search respects history/exclusions;
    // - Continue searches the complete painting CSV.
    const pool = continueWithSettings
      ? paintings
      : (unseen.length ? unseen : paintings);

    if (!words.length) {
      const seed = cleanDescription(
        payload.random_seed ||
        payload.randomSeed ||
        `${Date.now()}-${Math.random()}`
      );
      const selected = pool[seededIndex(seed, pool.length)] || pool[0];

      return json({
        ok: true,
        painting: selected,
        ...selected,
        backend_search: true,
        words,
        genres,
        continued_with_settings: continueWithSettings,
        ...(apiDebugEnabled(env) ? {
          search_debug: {
            matched_word_count: 0,
            attached_word_count: 0,
            all_attached_words_found: false,
          },
        } : {}),
      });
    }

    const idf = pool === paintings && paintings.__idf ? paintings.__idf : buildPaintingRelevanceIdf(pool);
    const contrastPairs = await loadContrastPairMap(env);

    // Exactly like movie Continue:
    // Continue ignores the current painting profile and uses marbles only.
    const scoringProfile = continueWithSettings
      ? {}
      : currentPaintingRelevance;

    const scored = pool.map((painting) =>
      scorePaintingByPriorityWords(
        painting,
        words,
        scoringProfile,
        idf,
        contrastPairs,
      )
    );

    // Exactly like movie strict search:
    // reject paintings containing an opposite of an attached marble.
    const eligible = scored.filter(
      (item) => continueWithSettings || !item.anyAttachedOppositeFound
    );

    // Every attached marble has equal importance. Match the greatest number.
    const bestMatchCount = eligible.reduce(
      (best, item) => Math.max(best, item.matchedWordCount),
      0,
    );

    const candidates = eligible.filter(
      (item) =>
        item.matchedWordCount > 0 &&
        item.matchedWordCount === bestMatchCount
    );

    if (!candidates.length) {
      const hasMorePaintings = Boolean(rows.__hasMoreCsv);
      if (hasMorePaintings) {
        minimumRows = rows.length + CSV_LOAD_AHEAD_ROWS;
        continue;
      }
      return json({
        ok: false,
        code: 'NO_PAINTING_WITH_SETTINGS',
        words,
        continued_with_settings: continueWithSettings,
        error: 'Could not find a painting with these marble settings.',
      }, 404);
    }

    const rankedPool = candidates.sort((a, b) => {
      if (b.matchedWordCount !== a.matchedWordCount) {
        return b.matchedWordCount - a.matchedWordCount;
      }
      if (b.averageRankQuality !== a.averageRankQuality) {
        return b.averageRankQuality - a.averageRankQuality;
      }
      if (b.averageWordScore !== a.averageWordScore) {
        return b.averageWordScore - a.averageWordScore;
      }
      if (a.worstMatchedRank !== b.worstMatchedRank) {
        return a.worstMatchedRank - b.worstMatchedRank;
      }
      if (a.totalMatchedRank !== b.totalMatchedRank) {
        return a.totalMatchedRank - b.totalMatchedRank;
      }

      if (!continueWithSettings) {
        if (b.profileSimilarity !== a.profileSimilarity) {
          return b.profileSimilarity - a.profileSimilarity;
        }
        if (b.profileOrderAgreement !== a.profileOrderAgreement) {
          return b.profileOrderAgreement - a.profileOrderAgreement;
        }
        if (b.profileSymmetricOverlap !== a.profileSymmetricOverlap) {
          return b.profileSymmetricOverlap - a.profileSymmetricOverlap;
        }
      }

      if (a.candidateProfileLength !== b.candidateProfileLength) {
        return a.candidateProfileLength - b.candidateProfileLength;
      }
      if (
        !continueWithSettings &&
        b.profileLengthSimilarity !== a.profileLengthSimilarity
      ) {
        return b.profileLengthSimilarity - a.profileLengthSimilarity;
      }
      if (
        !continueWithSettings &&
        a.contradictionPenalty !== b.contradictionPenalty
      ) {
        return a.contradictionPenalty - b.contradictionPenalty;
      }
      if (b.topRelevanceScore !== a.topRelevanceScore) {
        return b.topRelevanceScore - a.topRelevanceScore;
      }

      return String(a.painting.title || '').localeCompare(
        String(b.painting.title || '')
      );
    });

    const best = rankedPool[0];
    if (!best) {
      return json({
        ok: false,
        code: 'NO_PAINTING_WITH_SETTINGS',
        words,
        continued_with_settings: continueWithSettings,
        error: 'Could not find a painting with these marble settings.',
      }, 404);
    }

    const selected = {
      ...best.painting,
      matched_priority_words: words,
      attached_word_match_count: best.matchedWordCount,
      attached_word_count: words.length,
      all_attached_words_found: Boolean(best.allWordsFound),
      matched_attached_words: best.matchedAttachedWords || [],
      attached_word_opposite_found: Boolean(best.anyAttachedOppositeFound),
      attached_word_opposite_words: best.attachedOppositeWords || [],
      attached_word_average_rank_quality: Number(
        best.averageRankQuality.toFixed(6)
      ),
      attached_word_average_score: Number(best.averageWordScore.toFixed(6)),
      continued_with_settings: Boolean(continueWithSettings),
      relevance_profile_similarity: Number(best.profileSimilarity.toFixed(6)),
      relevance_order_agreement: Number(best.profileOrderAgreement.toFixed(6)),
      relevance_symmetric_overlap: Number(
        best.profileSymmetricOverlap.toFixed(6)
      ),
      relevance_length_similarity: Number(
        best.profileLengthSimilarity.toFixed(6)
      ),
      relevance_length_penalty: Number(best.profileLengthPenalty.toFixed(6)),
      relevance_contradiction_penalty: Number(
        best.contradictionPenalty.toFixed(6)
      ),
      current_relevance_length: best.currentProfileLength,
      candidate_relevance_length: best.candidateProfileLength,
      top_relevance_word: best.topRelevanceWord,
    };

    return json({
      ok: true,
      painting: selected,
      ...selected,
      backend_search: true,
      words,
      genres,
      continued_with_settings: continueWithSettings,
      ...(apiDebugEnabled(env) ? {
        search_debug: {
          matched_word_count: best.matchedWordCount,
        attached_word_count: words.length,
        all_attached_words_found: best.allWordsFound,
        matched_attached_words: best.matchedAttachedWords,
        attached_word_opposite_found: best.anyAttachedOppositeFound,
        attached_word_opposite_words: best.attachedOppositeWords,
        average_rank_quality: Number(best.averageRankQuality.toFixed(6)),
        average_word_score: Number(best.averageWordScore.toFixed(6)),
        relevance_profile_similarity: Number(
          best.profileSimilarity.toFixed(6)
        ),        },
      } : {}),
    });
    }
  } catch (error) {
    return json({
      ok: false,
      error: error.message || 'Painting matcher failed.',
    }, 500);
  }
}

async function handleMovieMatch(request, env = {}) {
  let payload = {};
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON body.' }, 400);
  }

  const baseWord = cleanDescription(payload.base_word || payload.baseWord || '');
  const addedWords = Array.isArray(payload.added_words || payload.addedWords)
    ? (payload.added_words || payload.addedWords).map(cleanDescription).filter(Boolean)
    : [];
  const priorityWordsPayload = payload.priority_words || payload.priorityWords || payload.search_terms || payload.searchTerms;
  const searchTerms = Array.isArray(priorityWordsPayload)
    ? priorityWordsPayload.map(cleanDescription).filter(Boolean)
    : [];
  const genre = normalize(payload.genre || payload.movie_genre || payload.movieGenre || '');
  const selectedGenre = genre || (['horror', 'comedy', 'drama', 'action', 'fantasy', 'experimental', 'sci-fi', 'scifi', 'romance', 'animation'].includes(normalize(baseWord)) ? normalize(baseWord) : '');
  const isGenreSearch = Boolean(selectedGenre);
  const continueWithSettings = Boolean(
    payload.continue_with_settings || payload.continueWithSettings || payload.relax_opposites || payload.relaxOpposites
  );

  const query = cleanDescription(
    searchTerms.length
      ? searchTerms.join(' ')
      : isGenreSearch
        ? addedWords.join(' ')
        : [baseWord, ...addedWords].filter(Boolean).join(' ') || payload.query || payload.word || ''
  );
  const mode = payload.mode === 'watch' ? 'watch' : 'fast';
  const imageLimit = cleanImageLimit(payload.image_count ?? payload.imageCount ?? payload.max_images ?? payload.maxImages ?? payload.image_limit ?? payload.imageLimit);
  const excludedMovies = [
    ...(Array.isArray(payload.exclude_movies) ? payload.exclude_movies : []),
    ...(Array.isArray(payload.previous_movies) ? payload.previous_movies : []),
    ...(Array.isArray(payload.excludeMovies) ? payload.excludeMovies : []),
    ...(Array.isArray(payload.previousMovies) ? payload.previousMovies : []),
  ];
  const dislikedMovies = [
    ...(Array.isArray(payload.disliked_movies) ? payload.disliked_movies : []),
    ...(Array.isArray(payload.dislikedMovies) ? payload.dislikedMovies : []),
  ];

  try {
    // Theater/genre searches are CSV-only. Do not call Wikipedia/OMDb here.
    // The Wikipedia matcher remains only for non-theater free-text searches.
    const result = isGenreSearch
      ? await findCsvGenreMovie(
          searchTerms.length ? searchTerms : addedWords,
          env,
          imageLimit,
          excludedMovies,
          selectedGenre,
          payload.random_seed || payload.randomSeed || '',
          payload.current_movie_relevance || payload.currentMovieRelevance || payload.relevance_profile || payload.relevanceProfile || {},
          addedWords,
          continueWithSettings,
          dislikedMovies
        )
      : query
        ? await findBestMovie(query, mode, env, imageLimit, excludedMovies)
        : null;

    if (!result) {
      const genreLabel = selectedGenre
        ? selectedGenre.replace(/(^|[-\s])([a-z])/g, (_, lead, letter) => `${lead}${letter.toUpperCase()}`)
        : '';
      return json({
        ok: false,
        code: isGenreSearch ? 'NO_MOVIE_WITH_SETTINGS' : 'NO_MOVIE_MATCH',
        genre: genreLabel,
        continued_with_settings: continueWithSettings,
        error: isGenreSearch
          ? `Couldn't find a movie with these settings in genre "${genreLabel}".`
          : 'Wikipedia did not find a close movie page for that text.'
      }, 404);
    }

    const resultWithNetflixId = attachNetflixTitleId(result, env);

    return json({
      ok: true,
      ...resultWithNetflixId,
      ...(apiDebugEnabled(env) ? {
        image_debug: {
          has_poster_url: Boolean(resultWithNetflixId.poster_url),
          image_count: Array.isArray(resultWithNetflixId.images) ? resultWithNetflixId.images.length : 0,
          source: resultWithNetflixId.source || '',
          has_netflix_id: Boolean(resultWithNetflixId.netflix_id || resultWithNetflixId.netflixId),
        },
      } : {}),
    });
  } catch (error) {
    return json({ ok: false, error: error.message || 'Wikipedia movie matcher failed.' }, 500);
  }
}



function isTmdbUrl(value = '') {
  try {
    const parsed = new URL(String(value || ''));
    const host = parsed.hostname.toLowerCase();
    return host === 'themoviedb.org' ||
      host.endsWith('.themoviedb.org') ||
      host === 'tmdb.org' ||
      host.endsWith('.tmdb.org');
  } catch (_) {
    return false;
  }
}

function sanitizeWatchProviderUserLink(item = {}, movie = '') {
  const provider = normalizeWatchProviderKey(
    item.provider || item.label || item.provider_name || ''
  );

  const providerSearchUrl = providerSearchUrlForLabel(
    item.label || item.provider_name || provider,
    movie
  );

  const currentUrl = cleanDescription(item.url || '');
  const currentSearchUrl = cleanDescription(item.search_url || '');

  let safeUrl = currentUrl;
  if (!safeUrl || isTmdbUrl(safeUrl)) safeUrl = providerSearchUrl;

  let safeSearchUrl = currentSearchUrl;
  if (!safeSearchUrl || isTmdbUrl(safeSearchUrl)) {
    safeSearchUrl = providerSearchUrl || safeUrl;
  }

  // A provider with no provider-owned destination must not be clickable.
  if (!safeUrl || isTmdbUrl(safeUrl)) return null;

  const sanitized = {
    ...item,
    url: safeUrl,
    search_url: safeSearchUrl && !isTmdbUrl(safeSearchUrl)
      ? safeSearchUrl
      : safeUrl,
  };

  // TMDb URLs are useful only as internal lookup evidence. Never expose them
  // in the API response where a client could accidentally use them for clicks.
  delete sanitized.tmdb_watch_url;
  delete sanitized.tmdb_watch_urls;
  delete sanitized.tmdb_url;
  delete sanitized.tmdb_link;

  return sanitized;
}

function sanitizeWatchProviderUserLinks(items = [], movie = '') {
  return (Array.isArray(items) ? items : [])
    .map((item) => sanitizeWatchProviderUserLink(item, movie))
    .filter(Boolean);
}


const WATCH_PROVIDER_SCRAPE_HOSTS = new Set([
  'amazon.com', 'www.amazon.com',
  'netflix.com', 'www.netflix.com',
  'hulu.com', 'www.hulu.com',
  'disneyplus.com', 'www.disneyplus.com',
  'max.com', 'www.max.com',
  'tv.apple.com',
  'youtube.com', 'www.youtube.com',
  'play.google.com',
  'fandangoathome.com', 'www.fandangoathome.com',
  'therokuchannel.roku.com',
  'tubitv.com', 'www.tubitv.com',
  'peacocktv.com', 'www.peacocktv.com',
  'paramountplus.com', 'www.paramountplus.com',
  'starz.com', 'www.starz.com',
  'plex.tv', 'watch.plex.tv',
  'pluto.tv', 'www.pluto.tv',
  'crackle.com', 'www.crackle.com',
  'megogo.net', 'www.megogo.net',
  'bbc.co.uk', 'www.bbc.co.uk',
  'itv.com', 'www.itv.com',
  'channel4.com', 'www.channel4.com',
  'nowtv.com', 'www.nowtv.com',
  'skystore.com', 'www.skystore.com',
  'rakuten.tv', 'www.rakuten.tv',
  'mubi.com', 'www.mubi.com',
  'crunchyroll.com', 'www.crunchyroll.com',
  'player.bfi.org.uk',
  'player.stv.tv',
  'kanopy.com', 'www.kanopy.com',
  'homecinema.curzon.com',
  'filmzie.com', 'www.filmzie.com',
  'fawesome.tv', 'www.fawesome.tv',
]);

function decodeScrapedHtmlText(value = '') {
  return String(value || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;|&#38;/gi, '&')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&apos;|&#39;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lt;|&#60;/gi, '<')
    .replace(/&gt;|&#62;/gi, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, number) =>
      String.fromCodePoint(Number.parseInt(number, 10))
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeStrongScrapeTitle(value = '') {
  return decodeScrapedHtmlText(value)
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasStrongExactScrapedTitle(html = '', requestedTitle = '') {
  const requested = normalizeStrongScrapeTitle(requestedTitle);
  if (!requested) return false;

  const candidates = [];

  const jsonNamePattern = /"(?:name|title|headline)"\s*:\s*"((?:\\.|[^"\\])*)"/gi;
  for (const match of String(html).matchAll(jsonNamePattern)) {
    try {
      candidates.push(JSON.parse(`"${match[1]}"`));
    } catch (_) {
      candidates.push(match[1]);
    }
  }

  const attrPattern = /\b(?:title|aria-label|data-title|data-name)\s*=\s*(["'])(.*?)\1/gi;
  for (const match of String(html).matchAll(attrPattern)) {
    candidates.push(match[2]);
  }

  const headingPattern = /<(?:h1|h2|h3|strong|b)\b[^>]*>([\s\S]{1,300}?)<\/(?:h1|h2|h3|strong|b)>/gi;
  for (const match of String(html).matchAll(headingPattern)) {
    candidates.push(match[1]);
  }

  return candidates.some((candidate) =>
    normalizeStrongScrapeTitle(candidate) === requested
  );
}

function extractStrongExactProviderHref(html = '', requestedTitle = '', baseUrl = '') {
  const requested = normalizeStrongScrapeTitle(requestedTitle);
  if (!requested) return '';

  const anchorPattern = /<a\b([^>]*?)href\s*=\s*(["'])(.*?)\2([^>]*)>([\s\S]{0,1200}?)<\/a>/gi;
  for (const match of String(html).matchAll(anchorPattern)) {
    const attributes = `${match[1] || ''} ${match[4] || ''}`;
    const visibleText = normalizeStrongScrapeTitle(match[5] || '');
    const titleAttribute = attributes.match(
      /\b(?:title|aria-label|data-title|data-name)\s*=\s*(["'])(.*?)\1/i
    )?.[2] || '';

    if (
      visibleText !== requested &&
      normalizeStrongScrapeTitle(titleAttribute) !== requested
    ) {
      continue;
    }

    try {
      const resolved = new URL(decodeScrapedHtmlText(match[3]), baseUrl);
      if (!['http:', 'https:'].includes(resolved.protocol)) continue;
      if (!WATCH_PROVIDER_SCRAPE_HOSTS.has(resolved.hostname.toLowerCase())) continue;
      return resolved.href;
    } catch (_) {}
  }

  return '';
}



function resolveScrapedAssetUrl(value = '', baseUrl = '') {
  const decoded = decodeScrapedHtmlText(value).replace(/\u002F/gi, '/').replace(/\\\//g, '/').trim();
  if (!decoded || /^(?:data:|blob:|javascript:)/i.test(decoded)) return '';
  try {
    const resolved = new URL(decoded, baseUrl);
    return ['http:', 'https:'].includes(resolved.protocol) ? resolved.href : '';
  } catch (_) {
    return '';
  }
}

function extractProviderResultCandidates(html = '', baseUrl = '') {
  const output = [];
  const seen = new Set();
  const source = String(html || '');
  const anchorPattern = /<a\b([^>]*?)href\s*=\s*(["'])(.*?)\2([^>]*)>([\s\S]{0,5000}?)<\/a>/gi;
  for (const match of source.matchAll(anchorPattern)) {
    const attrs = `${match[1] || ''} ${match[4] || ''}`;
    const body = match[5] || '';
    const href = resolveScrapedAssetUrl(match[3], baseUrl);
    if (!href) continue;
    let host = '';
    try { host = new URL(href).hostname.toLowerCase(); } catch (_) {}
    if (!WATCH_PROVIDER_SCRAPE_HOSTS.has(host)) continue;

    const attrTitle = attrs.match(/\b(?:title|aria-label|data-title|data-name)\s*=\s*(["'])(.*?)\1/i)?.[2] || '';
    const jsonTitle = body.match(/"(?:name|title|headline)"\s*:\s*"((?:\\.|[^"\\])*)"/i)?.[1] || '';
    const heading = body.match(/<(?:h1|h2|h3|h4|strong|b|span|p)\b[^>]*>([\s\S]{1,300}?)<\/(?:h1|h2|h3|h4|strong|b|span|p)>/i)?.[1] || '';
    const title = normalizeStrongScrapeTitle(attrTitle || jsonTitle || heading || body).slice(0, 220);

    const imageMatch = body.match(/<img\b[^>]*(?:src|data-src|data-lazy-src|data-original)\s*=\s*(["'])(.*?)\1/i)
      || attrs.match(/\b(?:data-image|data-poster|data-thumbnail)\s*=\s*(["'])(.*?)\1/i);
    const srcsetMatch = body.match(/<img\b[^>]*srcset\s*=\s*(["'])(.*?)\1/i)?.[2] || '';
    const firstSrcset = srcsetMatch.split(',')[0]?.trim().split(/\s+/)[0] || '';
    const imageUrl = resolveScrapedAssetUrl(imageMatch?.[2] || firstSrcset, baseUrl);
    const year = (normalizeStrongScrapeTitle(body).match(/\b(19\d{2}|20\d{2})\b/) || [])[1] || '';
    const key = `${href}|${imageUrl}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push({ href, title, year, imageUrl });
    if (output.length >= 80) break;
  }
  return output;
}

function normalizeLooseMovieTitle(value = '') {
  return normalizeStrongScrapeTitle(value)
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleTokenSimilarity(a = '', b = '') {
  const aa = normalizeLooseMovieTitle(a);
  const bb = normalizeLooseMovieTitle(b);
  if (!aa || !bb) return 0;
  if (aa === bb) return 1;
  const A = new Set(aa.split(' ').filter(Boolean));
  const B = new Set(bb.split(' ').filter(Boolean));
  const intersection = [...A].filter((token) => B.has(token)).length;
  const union = new Set([...A, ...B]).size || 1;
  const containment = intersection / Math.max(1, Math.min(A.size, B.size));
  return Math.max(intersection / union, containment * 0.94);
}

async function inflateZlib(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

async function decodeSmallPngRgb(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 24 || bytes[0] !== 137 || bytes[1] !== 80 || bytes[2] !== 78 || bytes[3] !== 71) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 8, width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idat = [];
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset); offset += 4;
    const type = String.fromCharCode(...bytes.slice(offset, offset + 4)); offset += 4;
    const data = bytes.slice(offset, offset + length); offset += length + 4;
    if (type === 'IHDR') {
      const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
      width = dv.getUint32(0); height = dv.getUint32(4); bitDepth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
  }
  if (!width || !height || bitDepth !== 8 || interlace !== 0 || ![2, 6].includes(colorType)) return null;
  const compressed = new Uint8Array(idat.reduce((n, x) => n + x.length, 0));
  let cursor = 0; for (const part of idat) { compressed.set(part, cursor); cursor += part.length; }
  const raw = await inflateZlib(compressed);
  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const recon = new Uint8Array(height * stride);
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[src++];
    const rowStart = y * stride;
    for (let x = 0; x < stride; x++) {
      const val = raw[src++];
      const left = x >= channels ? recon[rowStart + x - channels] : 0;
      const up = y > 0 ? recon[rowStart - stride + x] : 0;
      const upLeft = y > 0 && x >= channels ? recon[rowStart - stride + x - channels] : 0;
      recon[rowStart + x] = (val + (filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? up : filter === 3 ? Math.floor((left + up) / 2) : filter === 4 ? paethPredictor(left, up, upLeft) : 0)) & 255;
    }
  }
  const rgb = new Uint8Array(width * height * 3);
  for (let i = 0, j = 0; i < recon.length; i += channels) { rgb[j++] = recon[i]; rgb[j++] = recon[i+1]; rgb[j++] = recon[i+2]; }
  return { width, height, rgb };
}

async function fetchSmallRgbSignature(imageUrl = '', env = {}) {
  if (!imageUrl) return null;
  let parsed; try { parsed = new URL(imageUrl); } catch (_) { return null; }
  if (!['http:', 'https:'].includes(parsed.protocol)) return null;
  const timeoutMs = Math.max(1200, Math.min(Number(env?.WATCH_IMAGE_TIMEOUT_MS) || 3500, 8000));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort('image timeout'), timeoutMs);
  try {
    const response = await fetch(parsed.href, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { Accept: 'image/*,*/*;q=0.5', 'User-Agent': cleanDescription(env?.WATCH_SCRAPE_USER_AGENT || 'Mozilla/5.0') },
      cf: { image: { width: 16, height: 24, fit: 'cover', format: 'png', quality: 35 } },
    });
    if (!response.ok) return null;
    return await decodeSmallPngRgb(await response.arrayBuffer());
  } catch (_) { return null; } finally { clearTimeout(timeout); }
}

function rgbDistanceSimilarity(ar, ag, ab, br, bg, bb) {
  const dr = ar - br;
  const dg = ag - bg;
  const db = ab - bb;
  return Math.max(0, 1 - Math.sqrt(dr * dr + dg * dg + db * db) / 441.67295593);
}

function shiftedSpatialRgbSimilarity(a, b, maxShift = 2) {
  if (!a?.rgb || !b?.rgb || a.width !== b.width || a.height !== b.height) return 0;
  const { width, height } = a;
  let best = 0;

  // Small shifts tolerate slightly different crops without losing layout order.
  for (let shiftY = -maxShift; shiftY <= maxShift; shiftY += 1) {
    for (let shiftX = -maxShift; shiftX <= maxShift; shiftX += 1) {
      let total = 0;
      let count = 0;
      for (let y = 0; y < height; y += 1) {
        const by = y + shiftY;
        if (by < 0 || by >= height) continue;
        for (let x = 0; x < width; x += 1) {
          const bx = x + shiftX;
          if (bx < 0 || bx >= width) continue;
          const ai = (y * width + x) * 3;
          const bi = (by * width + bx) * 3;
          total += rgbDistanceSimilarity(
            a.rgb[ai], a.rgb[ai + 1], a.rgb[ai + 2],
            b.rgb[bi], b.rgb[bi + 1], b.rgb[bi + 2]
          );
          count += 1;
        }
      }
      if (count) best = Math.max(best, total / count);
    }
  }
  return best;
}

function buildRgbHistogram(signature, binsPerChannel = 4) {
  if (!signature?.rgb) return null;
  const bins = new Float64Array(binsPerChannel ** 3);
  let count = 0;
  for (let i = 0; i < signature.rgb.length; i += 3) {
    const r = Math.min(binsPerChannel - 1, Math.floor(signature.rgb[i] * binsPerChannel / 256));
    const g = Math.min(binsPerChannel - 1, Math.floor(signature.rgb[i + 1] * binsPerChannel / 256));
    const b = Math.min(binsPerChannel - 1, Math.floor(signature.rgb[i + 2] * binsPerChannel / 256));
    bins[(r * binsPerChannel + g) * binsPerChannel + b] += 1;
    count += 1;
  }
  if (!count) return null;
  for (let i = 0; i < bins.length; i += 1) bins[i] /= count;
  return bins;
}

function histogramIntersectionSimilarity(a, b) {
  const aa = buildRgbHistogram(a);
  const bb = buildRgbHistogram(b);
  if (!aa || !bb || aa.length !== bb.length) return 0;
  let intersection = 0;
  for (let i = 0; i < aa.length; i += 1) intersection += Math.min(aa[i], bb[i]);
  return Math.max(0, Math.min(1, intersection));
}

function buildSpatialGrid(signature, columns = 6, rows = 9) {
  if (!signature?.rgb || !signature.width || !signature.height) return null;
  const output = new Float64Array(columns * rows * 3);
  const counts = new Uint32Array(columns * rows);
  for (let y = 0; y < signature.height; y += 1) {
    const gy = Math.min(rows - 1, Math.floor(y * rows / signature.height));
    for (let x = 0; x < signature.width; x += 1) {
      const gx = Math.min(columns - 1, Math.floor(x * columns / signature.width));
      const cell = gy * columns + gx;
      const source = (y * signature.width + x) * 3;
      const target = cell * 3;
      output[target] += signature.rgb[source];
      output[target + 1] += signature.rgb[source + 1];
      output[target + 2] += signature.rgb[source + 2];
      counts[cell] += 1;
    }
  }
  for (let cell = 0; cell < counts.length; cell += 1) {
    const count = Math.max(1, counts[cell]);
    const target = cell * 3;
    output[target] /= count;
    output[target + 1] /= count;
    output[target + 2] /= count;
  }
  return output;
}

function spatialGridSimilarity(a, b) {
  const aa = buildSpatialGrid(a);
  const bb = buildSpatialGrid(b);
  if (!aa || !bb || aa.length !== bb.length) return 0;
  let total = 0;
  for (let i = 0; i < aa.length; i += 3) {
    total += rgbDistanceSimilarity(aa[i], aa[i + 1], aa[i + 2], bb[i], bb[i + 1], bb[i + 2]);
  }
  return total / (aa.length / 3);
}

function luminanceEdgeSimilarity(a, b) {
  if (!a?.rgb || !b?.rgb || a.width !== b.width || a.height !== b.height) return 0;
  const luminance = (rgb, index) => rgb[index] * 0.2126 + rgb[index + 1] * 0.7152 + rgb[index + 2] * 0.0722;
  let total = 0;
  let count = 0;
  for (let y = 0; y < a.height - 1; y += 1) {
    for (let x = 0; x < a.width - 1; x += 1) {
      const i = (y * a.width + x) * 3;
      const right = i + 3;
      const below = i + a.width * 3;
      const edgeA = Math.abs(luminance(a.rgb, i) - luminance(a.rgb, right)) +
        Math.abs(luminance(a.rgb, i) - luminance(a.rgb, below));
      const edgeB = Math.abs(luminance(b.rgb, i) - luminance(b.rgb, right)) +
        Math.abs(luminance(b.rgb, i) - luminance(b.rgb, below));
      total += Math.max(0, 1 - Math.abs(edgeA - edgeB) / 510);
      count += 1;
    }
  }
  return count ? total / count : 0;
}

function improvedCoverSimilarity(a, b) {
  if (!a?.rgb || !b?.rgb) return {
    score: 0, spatial: 0, grid: 0, histogram: 0, edges: 0,
  };
  const spatial = shiftedSpatialRgbSimilarity(a, b, 2);
  const grid = spatialGridSimilarity(a, b);
  const histogram = histogramIntersectionSimilarity(a, b);
  const edges = luminanceEdgeSimilarity(a, b);
  const score = spatial * 0.52 + grid * 0.25 + histogram * 0.16 + edges * 0.07;
  return { score, spatial, grid, histogram, edges };
}

async function chooseDirectProviderCandidate({ candidates = [], movie = '', year = '', referenceImageUrl = '', env = {} }) {
  if (!candidates.length) return null;
  const reference = await fetchSmallRgbSignature(referenceImageUrl, env);
  const shortlist = candidates
    .map((candidate) => ({ ...candidate, titleSimilarity: titleTokenSimilarity(candidate.title, movie) }))
    .filter((candidate) => candidate.titleSimilarity >= 0.35 || reference)
    .sort((a, b) => b.titleSimilarity - a.titleSimilarity)
    .slice(0, Math.max(4, Math.min(Number(env?.WATCH_IMAGE_CANDIDATE_LIMIT) || 12, 24)));

  const imageThreshold = Math.max(0.60, Math.min(Number(env?.WATCH_IMAGE_SIMILARITY_THRESHOLD) || 0.84, 0.98));
  const combinedThreshold = Math.max(0.60, Math.min(Number(env?.WATCH_DIRECT_MATCH_SCORE_THRESHOLD) || 0.80, 0.98));
  const accepted = [];

  for (const candidate of shortlist) {
    const image = reference && candidate.imageUrl ? await fetchSmallRgbSignature(candidate.imageUrl, env) : null;
    const imageMatch = reference && image ? improvedCoverSimilarity(reference, image) : {
      score: 0, spatial: 0, grid: 0, histogram: 0, edges: 0,
    };
    const yearKnown = Boolean(year && candidate.year);
    const yearScore = yearKnown ? (String(year) === String(candidate.year) ? 1 : 0) : 0.5;
    const score = candidate.titleSimilarity * 0.46 + imageMatch.score * 0.44 + yearScore * 0.10;
    const exactTitle = candidate.titleSimilarity >= 0.97;
    const yearConflict = yearKnown && yearScore === 0;
    const imageAccepted = imageMatch.score >= imageThreshold && candidate.titleSimilarity >= 0.45;
    const acceptedCandidate = !yearConflict && score >= combinedThreshold && (imageAccepted || exactTitle);

    if (acceptedCandidate) {
      accepted.push({
        ...candidate,
        imageSimilarity: imageMatch.score,
        spatialSimilarity: imageMatch.spatial,
        gridSimilarity: imageMatch.grid,
        histogramSimilarity: imageMatch.histogram,
        edgeSimilarity: imageMatch.edges,
        yearScore,
        score,
      });
    }
  }

  accepted.sort((a, b) => b.score - a.score);
  const best = accepted[0] || null;
  const runnerUp = accepted[1] || null;
  if (!best) return null;

  // Reject ambiguous visual matches rather than opening a plausible but wrong film.
  const minimumMargin = Math.max(0.01, Math.min(Number(env?.WATCH_DIRECT_MATCH_MIN_MARGIN) || 0.035, 0.15));
  const exactTitleAndYear = best.titleSimilarity >= 0.97 && (!year || !best.year || String(year) === String(best.year));
  if (runnerUp && best.score - runnerUp.score < minimumMargin && !exactTitleAndYear) return null;

  return { ...best, scoreMargin: runnerUp ? best.score - runnerUp.score : 1 };
}


function buildBrowserRoutedScrapePlan({ movie, year = '', existingProviders = [], country = 'US' }) {
  const existing = new Set(
    (Array.isArray(existingProviders) ? existingProviders : [])
      .map((item) => normalizeWatchProviderKey(item?.provider || item?.label || ''))
      .filter(Boolean)
  );

  return buildSearchFallbackWatchProviderResults(movie, year)
    .map((item) => {
      const provider = normalizeWatchProviderKey(item.provider || item.label || '');
      if (!provider || existing.has(provider)) return null;
      try {
        const parsed = new URL(item.url);
        if (!WATCH_PROVIDER_SCRAPE_HOSTS.has(parsed.hostname.toLowerCase())) return null;
      } catch (_) {
        return null;
      }
      return {
        provider,
        label: item.label || provider,
        search_url: item.url,
        country: String(country || 'US').toUpperCase(),
      };
    })
    .filter(Boolean);
}

function normalizeBrowserRoutedScrapeItems(payload = {}) {
  const raw =
    payload.routed_provider_results ||
    payload.routedProviderResults ||
    payload.browser_routed_results ||
    payload.browserRoutedResults ||
    payload.provider_route_results ||
    [];
  return Array.isArray(raw) ? raw.slice(0, 80) : [];
}

async function resolveBrowserRoutedWatchProviders({
  items = [],
  movie,
  year = '',
  referenceImageUrl = '',
  existingProviders = [],
  country = 'US',
  env = {},
}) {
  const existing = new Set(
    (Array.isArray(existingProviders) ? existingProviders : [])
      .map((item) => normalizeWatchProviderKey(item?.provider || item?.label || ''))
      .filter(Boolean)
  );
  const results = [];

  for (const item of Array.isArray(items) ? items : []) {
    const provider = normalizeWatchProviderKey(
      item?.provider || item?.key || item?.label || item?.service || ''
    );
    if (!provider || existing.has(provider)) continue;

    const html = String(item?.html || item?.search_html || item?.searchHtml || '').slice(0, 1_500_000);
    const baseValue = String(
      item?.final_url || item?.finalUrl || item?.search_url || item?.searchUrl || item?.url || ''
    ).trim();
    let baseUrl;
    try {
      baseUrl = new URL(baseValue);
    } catch (_) {
      continue;
    }
    if (!WATCH_PROVIDER_SCRAPE_HOSTS.has(baseUrl.hostname.toLowerCase())) continue;

    let selected = null;
    let exactHref = '';
    if (html) {
      const candidates = extractProviderResultCandidates(html, baseUrl.href);
      selected = await chooseDirectProviderCandidate({
        candidates,
        movie,
        year,
        referenceImageUrl,
        env,
      });
      exactHref = extractStrongExactProviderHref(html, movie, baseUrl.href);
    }

    const suppliedDirect = String(
      item?.direct_url || item?.directUrl || item?.matched_url || item?.matchedUrl || ''
    ).trim();
    let directUrl = selected?.href || exactHref || suppliedDirect;
    if (!directUrl) continue;

    try {
      const parsedDirect = new URL(directUrl, baseUrl.href);
      if (!WATCH_PROVIDER_SCRAPE_HOSTS.has(parsedDirect.hostname.toLowerCase())) continue;
      directUrl = parsedDirect.href;
    } catch (_) {
      continue;
    }

    results.push({
      provider,
      label: cleanDescription(item?.label || item?.provider_label || provider),
      icon: cleanDescription(item?.icon || ''),
      direct: true,
      verified: true,
      available: true,
      confirmed: true,
      availability_confirmed: true,
      search_only: false,
      fallback: false,
      url: directUrl,
      search_url: baseUrl.href,
      source: 'browser_extension_routed_provider_scrape',
      availability_api: selected
        ? 'browser_routed_html_multisignal_cover_direct_match'
        : 'browser_routed_html_strong_exact_title',
      match_method: selected
        ? 'title_year_spatial_grid_histogram_edge_direct_card'
        : 'strong_exact_name_equals_name',
      match_confidence: selected?.score >= 0.88 ? 'very_strong' : 'strong',
      matched_title: selected?.title || movie,
      matched_year: selected?.year || '',
      matched_image_url: selected?.imageUrl || '',
      image_similarity: selected ? Number(selected.imageSimilarity.toFixed(4)) : null,
      spatial_similarity: selected ? Number(selected.spatialSimilarity.toFixed(4)) : null,
      grid_similarity: selected ? Number(selected.gridSimilarity.toFixed(4)) : null,
      histogram_similarity: selected ? Number(selected.histogramSimilarity.toFixed(4)) : null,
      edge_similarity: selected ? Number(selected.edgeSimilarity.toFixed(4)) : null,
      direct_match_margin: selected ? Number(selected.scoreMargin.toFixed(4)) : null,
      direct_match_score: selected ? Number(selected.score.toFixed(4)) : 1,
      countries: [String(country || 'US').toUpperCase()],
      country_count: 1,
      offers_by_country: {},
      availability_scope: 'browser_routed_provider_catalog',
      availability_region: String(country || 'US').toUpperCase(),
      offer_type: 'catalog',
      offer_label: 'Available',
      routed_scrape: true,
    });
    existing.add(provider);
  }

  return results;
}

async function fetchProviderSearchHtml(searchUrl = '', env = {}) {
  let url;
  try {
    url = new URL(searchUrl);
  } catch (_) {
    return null;
  }

  if (
    !['http:', 'https:'].includes(url.protocol) ||
    !WATCH_PROVIDER_SCRAPE_HOSTS.has(url.hostname.toLowerCase())
  ) {
    return null;
  }

  const timeoutMs = Math.max(
    1200,
    Math.min(Number(env?.WATCH_SCRAPE_TIMEOUT_MS) || 4500, 10000)
  );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort('provider scrape timeout'), timeoutMs);

  try {
    const response = await fetch(url.href, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
        'Accept-Language': 'en-US,en;q=0.8',
        'User-Agent': cleanDescription(
          env?.WATCH_SCRAPE_USER_AGENT ||
          'Mozilla/5.0 (compatible; BiologicalMachineryWatchVerifier/1.0)'
        ),
      },
      cf: { cacheEverything: true, cacheTtl: 900 },
    });

    if (!response.ok) return null;

    const contentType = response.headers.get('Content-Type') || '';
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) return null;

    const html = (await response.text()).slice(0, 1_500_000);
    return {
      html,
      finalUrl: response.url || url.href,
    };
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function scrapeMissingWatchProviders({
  movie,
  year = '',
  referenceImageUrl = '',
  existingProviders = [],
  env = {},
}) {
  if (String(env?.WATCH_PROVIDER_SCRAPE_ENABLED || 'true').toLowerCase() === 'false') {
    return [];
  }

  const existing = new Set(
    (Array.isArray(existingProviders) ? existingProviders : [])
      .map((item) => normalizeWatchProviderKey(item?.provider || item?.label || ''))
      .filter(Boolean)
  );

  const candidates = buildSearchFallbackWatchProviderResults(movie, year)
    .filter((item) => {
      const key = normalizeWatchProviderKey(item.provider || item.label || '');
      if (!key || existing.has(key)) return false;
      try {
        return WATCH_PROVIDER_SCRAPE_HOSTS.has(new URL(item.url).hostname.toLowerCase());
      } catch (_) {
        return false;
      }
    });

  const concurrency = Math.max(
    1,
    Math.min(Number(env?.WATCH_SCRAPE_CONCURRENCY) || 6, 12)
  );
  const results = [];
  let cursor = 0;

  const worker = async () => {
    while (cursor < candidates.length) {
      const candidate = candidates[cursor++];
      const fetched = await fetchProviderSearchHtml(candidate.url, env);
      if (!fetched?.html) continue;

      const resultCandidates = extractProviderResultCandidates(fetched.html, fetched.finalUrl);
      const selected = await chooseDirectProviderCandidate({
        candidates: resultCandidates,
        movie,
        year,
        referenceImageUrl,
        env,
      });
      const exactHref = extractStrongExactProviderHref(fetched.html, movie, fetched.finalUrl);
      const directUrl = selected?.href || exactHref || '';
      if (!directUrl) continue;

      results.push({
        ...candidate,
        provider: normalizeWatchProviderKey(candidate.provider || candidate.label),
        direct: true,
        verified: true,
        available: true,
        confirmed: true,
        availability_confirmed: true,
        search_only: false,
        fallback: false,
        url: directUrl,
        search_url: candidate.url,
        source: 'provider_page_scrape',
        availability_api: selected ? 'provider_html_multisignal_cover_direct_match' : 'provider_html_strong_exact_title',
        match_method: selected ? 'title_year_spatial_grid_histogram_edge_direct_card' : 'strong_exact_name_equals_name',
        match_confidence: selected?.score >= 0.88 ? 'very_strong' : 'strong',
        matched_title: selected?.title || movie,
        matched_year: selected?.year || '',
        matched_image_url: selected?.imageUrl || '',
        image_similarity: selected ? Number(selected.imageSimilarity.toFixed(4)) : null,
        spatial_similarity: selected ? Number(selected.spatialSimilarity.toFixed(4)) : null,
        grid_similarity: selected ? Number(selected.gridSimilarity.toFixed(4)) : null,
        histogram_similarity: selected ? Number(selected.histogramSimilarity.toFixed(4)) : null,
        edge_similarity: selected ? Number(selected.edgeSimilarity.toFixed(4)) : null,
        direct_match_margin: selected ? Number(selected.scoreMargin.toFixed(4)) : null,
        direct_match_score: selected ? Number(selected.score.toFixed(4)) : 1,
        countries: [],
        country_count: 0,
        offers_by_country: {},
        availability_scope: 'provider_catalog',
        offer_type: 'catalog',
        offer_label: 'Available',
      });
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, candidates.length) }, () => worker())
  );

  return sortWatchProviders(dedupeWatchProviderResults(results));
}


const REGIONAL_PREVIEW_COUNTRIES = new Set([
  'AU', 'US', 'CA', 'GB', 'DE', 'ES', 'FR', 'IT', 'JP', 'BR', 'MX', 'IN'
]);

const REGIONAL_PREVIEW_PROVIDER_HOSTS = {
  amazon: [
    'primevideo.com', 'amazon.com', 'amazon.ca', 'amazon.co.uk', 'amazon.de',
    'amazon.fr', 'amazon.it', 'amazon.es', 'amazon.nl', 'amazon.com.be',
    'amazon.se', 'amazon.pl', 'amazon.co.jp', 'amazon.in', 'amazon.com.au',
    'amazon.com.br', 'amazon.com.mx', 'amazon.com.tr', 'amazon.sa',
    'amazon.ae', 'amazon.sg'
  ],
  netflix: ['netflix.com'],
  hulu: ['hulu.com'],
  disney: ['disneyplus.com'],
  max: ['max.com'],
  apple: ['tv.apple.com'],
  youtube: ['youtube.com', 'youtu.be'],
  'google-play': ['play.google.com'],
  fandango: ['fandangoathome.com'],
  'roku-channel': ['therokuchannel.roku.com'],
  tubi: ['tubitv.com'],
  peacock: ['peacocktv.com'],
  paramount: ['paramountplus.com'],
  starz: ['starz.com'],
  showtime: ['sho.com'],
  plex: ['plex.tv'],
  pluto: ['pluto.tv'],
  crackle: ['crackle.com'],
  megogo: ['megogo.net'],
  'bbc-iplayer': ['bbc.co.uk'],
  itvx: ['itv.com'],
  'channel-4': ['channel4.com'],
  now: ['nowtv.com'],
  'sky-store': ['skystore.com'],
  'rakuten-tv': ['rakuten.tv'],
  mubi: ['mubi.com'],
  crunchyroll: ['crunchyroll.com'],
  'bfi-player': ['bfi.org.uk'],
  'stv-player': ['stv.tv'],
  kanopy: ['kanopy.com'],
  curzon: ['curzon.com'],
  filmzie: ['filmzie.com'],
  fawesome: ['fawesome.tv'],
};

function regionalPreviewEscapeHtml(value = '') {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function regionalPreviewHostAllowed(provider = '', hostname = '') {
  const host = String(hostname || '').toLowerCase().replace(/\.$/, '');
  const allowed = REGIONAL_PREVIEW_PROVIDER_HOSTS[String(provider || '').toLowerCase()] || [];
  return allowed.some((entry) => host === entry || host.endsWith(`.${entry}`));
}

function extractRegionalPreviewMetadata(html = '', fallbackTitle = '') {
  const source = String(html || '').slice(0, 1500000);
  const readMeta = (name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, 'i'),
    ];
    for (const pattern of patterns) {
      const match = source.match(pattern);
      if (match?.[1]) return match[1].trim();
    }
    return '';
  };
  const titleMatch = source.match(/<title[^>]*>([\s\S]{0,500}?)<\/title>/i);
  return {
    title: readMeta('og:title') || titleMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || fallbackTitle,
    description: readMeta('og:description') || readMeta('description'),
    image: readMeta('og:image'),
    siteName: readMeta('og:site_name'),
  };
}

function regionalPreviewRelayUrl(env = {}, country = '') {
  const key = `REGIONAL_PREVIEW_RELAY_${String(country || '').toUpperCase()}`;
  const direct = String(env?.[key] || '').trim();
  if (direct) return direct;
  try {
    const map = JSON.parse(String(env?.REGIONAL_PREVIEW_RELAYS || '{}'));
    return String(map?.[String(country || '').toUpperCase()] || '').trim();
  } catch (_) {
    return '';
  }
}

async function fetchRegionalPreviewSource(targetUrl, provider, country, env = {}) {
  const relayUrl = regionalPreviewRelayUrl(env, country);
  if (relayUrl) {
    const relayResponse = await fetch(relayUrl, {
      method: 'POST',
      headers: {
        Accept: 'text/html,application/json;q=0.9',
        'Content-Type': 'application/json',
        ...(env?.REGIONAL_PREVIEW_RELAY_TOKEN
          ? { Authorization: `Bearer ${String(env.REGIONAL_PREVIEW_RELAY_TOKEN)}` }
          : {}),
      },
      body: JSON.stringify({
        url: targetUrl.href,
        provider,
        country,
        mode: 'public-metadata-only',
      }),
      redirect: 'manual',
    });

    const contentType = relayResponse.headers.get('Content-Type') || '';
    if (!relayResponse.ok) {
      throw new Error(`Regional relay returned ${relayResponse.status}.`);
    }

    if (contentType.includes('application/json')) {
      const payload = await relayResponse.json().catch(() => ({}));
      return {
        html: String(payload?.html || ''),
        finalUrl: String(payload?.final_url || payload?.finalUrl || targetUrl.href),
        routed: true,
        relay: true,
      };
    }

    return {
      html: await relayResponse.text(),
      finalUrl: relayResponse.headers.get('X-Final-URL') || targetUrl.href,
      routed: true,
      relay: true,
    };
  }

  const response = await fetch(targetUrl.href, {
    method: 'GET',
    redirect: 'follow',
    headers: {
      Accept: 'text/html,application/xhtml+xml;q=0.9',
      'User-Agent': 'BiologicalMachineryRegionalPreview/1.0',
    },
    cf: { cacheEverything: true, cacheTtl: 300 },
  });

  if (!response.ok) {
    throw new Error(`Provider returned ${response.status}.`);
  }

  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
    throw new Error('Provider did not return a public HTML page.');
  }

  return {
    html: await response.text(),
    finalUrl: response.url || targetUrl.href,
    routed: false,
    relay: false,
  };
}

function regionalPreviewRequestParts(request) {
  const requestUrl = new URL(request.url);
  const provider = cleanDescription(requestUrl.searchParams.get('provider') || '').toLowerCase();
  const country = cleanDescription(requestUrl.searchParams.get('country') || '').toUpperCase();
  const rawTarget = String(requestUrl.searchParams.get('url') || '').trim();
  const movieTitle = cleanDescription(requestUrl.searchParams.get('title') || '').slice(0, 180);
  const movieYear = cleanDescription(requestUrl.searchParams.get('year') || '').slice(0, 12);

  if (!REGIONAL_PREVIEW_COUNTRIES.has(country)) {
    throw new Error('Unsupported regional preview country.');
  }

  let targetUrl;
  try {
    targetUrl = new URL(rawTarget);
  } catch (_) {
    throw new Error('Invalid provider URL.');
  }

  if (targetUrl.protocol !== 'https:' || targetUrl.username || targetUrl.password) {
    throw new Error('Only credential-free HTTPS provider URLs are allowed.');
  }

  targetUrl.hash = '';
  if (!regionalPreviewHostAllowed(provider, targetUrl.hostname)) {
    throw new Error('Provider host is not allowlisted.');
  }

  return { provider, country, targetUrl, movieTitle, movieYear };
}

function buildRegionalPreviewImageUrl(request, parts) {
  const endpoint = new URL('/api/regional-preview-image', request.url);
  endpoint.searchParams.set('provider', parts.provider);
  endpoint.searchParams.set('country', parts.country);
  endpoint.searchParams.set('url', parts.targetUrl.href);
  endpoint.searchParams.set('title', parts.movieTitle || '');
  endpoint.searchParams.set('year', parts.movieYear || '');
  endpoint.searchParams.set('v', String(Date.now()));
  return endpoint.pathname + endpoint.search;
}

function renderRegionalPreviewSnapshotPage({ request, provider, country, targetUrl, movieTitle, movieYear } = {}) {
  const title = movieTitle || `${provider || 'Provider'} regional snapshot`;
  const snapshotUrl = buildRegionalPreviewImageUrl(request, { provider, country, targetUrl, movieTitle, movieYear });
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>${regionalPreviewEscapeHtml(title)}</title>
<style>
  :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; color: #eef4ff; background: #07101d; }
  header { position: sticky; top: 0; z-index: 3; display: flex; align-items: center; gap: 10px; padding: 12px 14px;
    background: rgba(7,16,29,.96); border-bottom: 1px solid rgba(255,255,255,.11); backdrop-filter: blur(12px); }
  .status { padding: 8px 11px; border-radius: 999px; color: #caffdf; background: rgba(13,128,74,.34);
    border: 1px solid rgba(105,255,169,.38); font-weight: 900; font-size: 12px; white-space: nowrap; }
  .note { color: rgba(238,244,255,.69); font-size: 12px; line-height: 1.35; }
  button { min-height: 34px; padding: 0 12px; border: 1px solid rgba(255,255,255,.18); border-radius: 10px;
    color: white; background: rgba(255,255,255,.09); font-weight: 850; cursor: pointer; }
  #refresh { margin-left: auto; }
  main { min-height: calc(100vh - 61px); display: grid; place-items: start center; padding: 14px; overflow: auto; }
  .shot { width: min(1365px, 100%); position: relative; border: 1px solid rgba(255,255,255,.13); border-radius: 16px;
    overflow: hidden; background: #0b1220; box-shadow: 0 24px 80px rgba(0,0,0,.42); }
  img { width: 100%; height: auto; display: block; background: #0b1220; cursor: pointer; user-select: none; }
  .loading { position: absolute; inset: 0; display: grid; place-items: center; color: rgba(255,255,255,.76); font-weight: 800;
    background: linear-gradient(135deg,#091426,#111b2d); z-index: 2; }
  .error { padding: 28px; color: #ffc2c8; white-space: pre-wrap; }
  .hint { position: absolute; left: 12px; bottom: 12px; z-index: 1; padding: 8px 10px; border-radius: 10px;
    color: rgba(255,255,255,.82); background: rgba(0,0,0,.66); font-size: 12px; pointer-events: none; }
  @media (max-width: 700px) { header { align-items: flex-start; flex-wrap: wrap; } #refresh { margin-left: 0; } .note { width: 100%; } main { padding: 8px; } }
</style>
</head>
<body>
<header>
  <div class="status">US Preview · Interactive snapshot active for ${regionalPreviewEscapeHtml(country)}</div>
  <div class="note">Click public page elements to inspect details. Login, payments, downloads, audio, video, playback and DRM remain blocked.</div>
  <button id="back" type="button">Back</button>
  <button id="refresh" type="button">Refresh</button>
</header>
<main>
  <div class="shot">
    <div class="loading" id="loading">Rendering the public provider page in the US…</div>
    <img id="snapshot" alt="${regionalPreviewEscapeHtml(title)} rendered public page snapshot">
    <div class="hint">Click a movie card or public navigation item</div>
  </div>
</main>
<script>
(() => {
  const image = document.getElementById('snapshot');
  const loading = document.getElementById('loading');
  const refresh = document.getElementById('refresh');
  const back = document.getElementById('back');
  const base = ${JSON.stringify(snapshotUrl)};
  const session = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
  const history = [];
  let busy = false;

  const buildUrl = (action = 'view', x = '', y = '') => {
    const url = new URL(base, location.origin);
    url.searchParams.set('session', session);
    url.searchParams.set('action', action);
    if (x !== '') url.searchParams.set('click_x', String(x));
    if (y !== '') url.searchParams.set('click_y', String(y));
    url.searchParams.set('v', String(Date.now()));
    return url.pathname + url.search;
  };

  const load = (url, message) => {
    if (busy) return;
    busy = true;
    loading.className = 'loading';
    loading.style.display = 'grid';
    loading.textContent = message;
    image.src = url;
  };

  image.addEventListener('load', () => {
    busy = false;
    loading.style.display = 'none';
  });
  image.addEventListener('error', () => {
    busy = false;
    loading.className = 'error';
    loading.style.display = 'block';
    loading.textContent = 'The interactive snapshot could not be rendered. The provider may have rejected the action or timed out.';
  });
  image.addEventListener('click', (event) => {
    if (busy || !image.naturalWidth || !image.naturalHeight) return;
    const rect = image.getBoundingClientRect();
    const x = Math.max(0, Math.min(image.naturalWidth - 1, Math.round((event.clientX - rect.left) * image.naturalWidth / rect.width)));
    const y = Math.max(0, Math.min(image.naturalHeight - 1, Math.round((event.clientY - rect.top) * image.naturalHeight / rect.height)));
    history.push({ x, y });
    load(buildUrl('click', x, y), 'Opening that public page element…');
  });
  refresh.addEventListener('click', () => load(buildUrl('refresh'), 'Refreshing the interactive snapshot…'));
  back.addEventListener('click', () => {
    if (!history.length) return;
    history.pop();
    load(buildUrl('back'), 'Going back…');
  });
  load(buildUrl('view'), 'Rendering the public provider page in the US…');
})();
</script>
</body>
</html>`;
}

async function handleRegionalPreviewImage(request, env = {}) {
  let parts;
  try {
    parts = regionalPreviewRequestParts(request);
  } catch (error) {
    return new Response(error?.message || 'Invalid regional preview request.', {
      status: /allowlisted/i.test(error?.message || '') ? 403 : 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const requestUrl = new URL(request.url);
  const session = cleanDescription(requestUrl.searchParams.get('session') || '').slice(0, 120);
  const action = cleanDescription(requestUrl.searchParams.get('action') || 'view').toLowerCase();
  const clickX = Number(requestUrl.searchParams.get('click_x'));
  const clickY = Number(requestUrl.searchParams.get('click_y'));

  if (!/^[a-zA-Z0-9._:-]{8,120}$/.test(session)) {
    return new Response('Invalid snapshot session.', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
  }
  if (!['view', 'click', 'refresh', 'back'].includes(action)) {
    return new Response('Invalid snapshot action.', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
  }

  const relayUrl = regionalPreviewRelayUrl(env, parts.country);
  if (!relayUrl) {
    return new Response('No regional snapshot relay is configured for this country.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const relayResponse = await fetch(relayUrl, {
    method: 'POST',
    headers: {
      Accept: 'image/jpeg,application/json;q=0.8',
      'Content-Type': 'application/json',
      ...(env?.REGIONAL_PREVIEW_RELAY_TOKEN
        ? { Authorization: `Bearer ${String(env.REGIONAL_PREVIEW_RELAY_TOKEN)}` }
        : {}),
    },
    body: JSON.stringify({
      url: parts.targetUrl.href,
      provider: parts.provider,
      country: parts.country,
      mode: 'public-page-snapshot',
      viewport: { width: 1365, height: 900 },
      session,
      action,
      ...(action === 'click' && Number.isFinite(clickX) && Number.isFinite(clickY)
        ? { click: { x: clickX, y: clickY } }
        : {}),
    }),
    redirect: 'manual',
  });

  const contentType = relayResponse.headers.get('Content-Type') || '';
  if (!relayResponse.ok || !contentType.startsWith('image/')) {
    let message = `Snapshot relay returned ${relayResponse.status}.`;
    if (contentType.includes('application/json')) {
      const payload = await relayResponse.json().catch(() => ({}));
      message = payload?.error || message;
    }
    return new Response(message, {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const headers = new Headers();
  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', 'private, no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Disposition', 'inline; filename="regional-preview.jpg"');
  return new Response(relayResponse.body, { status: 200, headers });
}

async function handleRegionalPreview(request, env = {}) {
  let parts;
  try {
    parts = regionalPreviewRequestParts(request);
  } catch (error) {
    return new Response(error?.message || 'Invalid regional preview request.', { status: /allowlisted/i.test(error?.message || '') ? 403 : 400 });
  }

  const body = renderRegionalPreviewSnapshotPage({ request, ...parts, targetUrl: parts.targetUrl });
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), autoplay=()'
    },
  });
}


async function handleMovieWatchLink(request, env = {}) {
  let payload = {};
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON body.' }, 400);
  }

  const movie = cleanDescription(payload.movie || payload.title || '').slice(0, 160);
  const year = cleanDescription(payload.year || '').slice(0, 12);
  const imdbId = cleanDescription(payload.imdb_id || payload.imdbId || '').slice(0, 20);
  const referenceImageUrl = cleanDescription(
    payload.poster_url || payload.posterUrl || payload.cover_url || payload.coverUrl ||
    payload.image_url || payload.imageUrl || payload.poster || payload.cover || ''
  ).slice(0, 2000);
  const lookupPhase = cleanDescription(
    payload.lookup_phase || payload.lookupPhase || 'full'
  ).toLowerCase();
  const existingProviderItems = Array.isArray(payload.existing_providers)
    ? payload.existing_providers
    : [];
  const routedScrape = payload.routed_scrape === true || payload.routedScrape === true;
  const routeCountry = cleanDescription(
    payload.route_country || payload.routeCountry || 'US'
  ).toUpperCase().slice(0, 2) || 'US';
  const browserRoutedItems = normalizeBrowserRoutedScrapeItems(payload);

  if (!movie && !imdbId) {
    return json({ ok: false, error: 'Missing movie title or IMDb ID.' }, 400);
  }

  // Availability is intentionally global. Browser geolocation, Cloudflare's
  // request country, payload country fields, and configured default regions
  // are not used by this endpoint.
  const scrapeOnly = lookupPhase === 'scrape' || lookupPhase === 'scrape_only';
  const tmdbOnly = lookupPhase === 'tmdb' || lookupPhase === 'tmdb_only';

  const resolvedTmdbId = scrapeOnly
    ? ''
    : await findTmdbMovieId({ movie, year, imdbId, env });

  const [globalMatchesRaw, movieMetadata] = scrapeOnly
    ? [[], null]
    : await Promise.all([
        findTmdbWatchProvidersGlobal({
          movie,
          year,
          imdbId,
          tmdbId: resolvedTmdbId,
          env,
        }),
        findTmdbMovieMetadata({
          movie,
          year,
          imdbId,
          tmdbId: resolvedTmdbId,
          env,
        }),
      ]);

  const scrapeExistingProviders = scrapeOnly
    ? existingProviderItems
    : globalMatchesRaw;

  const browserRoutedMatches = tmdbOnly || !browserRoutedItems.length
    ? []
    : await resolveBrowserRoutedWatchProviders({
        items: browserRoutedItems,
        movie,
        year,
        referenceImageUrl,
        existingProviders: scrapeExistingProviders,
        country: routeCountry,
        env,
      });

  // A routed scrape must happen in the browser extension, where the active
  // authenticated US proxy actually applies. Never pretend a Worker fetch is routed.
  const scrapedMatches = tmdbOnly || routedScrape
    ? []
    : await scrapeMissingWatchProviders({
        movie,
        year,
        referenceImageUrl,
        existingProviders: [...scrapeExistingProviders, ...browserRoutedMatches],
        env,
      });

  const phaseMatches = scrapeOnly
    ? [...browserRoutedMatches, ...scrapedMatches]
    : [...globalMatchesRaw, ...browserRoutedMatches, ...scrapedMatches];

  const primeCheckedMatches = await replaceUnavailablePrimeVideoLinks(
    sortWatchProviders(dedupeWatchProviderResults(phaseMatches)),
    movie,
    year,
    env
  );

  const globalMatches = sanitizeWatchProviderUserLinks(
    primeCheckedMatches,
    movie
  );

  const providerCountries = Object.fromEntries(
    globalMatches.map((item) => [
      item.provider,
      Array.isArray(item.countries) ? item.countries : [],
    ])
  );

  const allCountries = [...new Set(
    globalMatches.flatMap((item) =>
      Array.isArray(item.countries) ? item.countries : []
    )
  )].sort();

  if (globalMatches.length) {
    return json({
      ok: true,
      provider: globalMatches[0]?.provider || '',
      provider_label: globalMatches[0]?.label || '',
      direct: false,
      verified: true,
      search_only: false,
      url: globalMatches[0]?.url || '',
      urls: globalMatches,
      fallback_urls: globalMatches.slice(1),
      searched_urls: globalMatches,
      availability_source: scrapedMatches.length
        ? 'tmdb_global_plus_provider_strong_exact_scrape'
        : 'tmdb_global_watch_providers',
      scraped_provider_count: scrapedMatches.length + browserRoutedMatches.length,
      browser_routed_provider_count: browserRoutedMatches.length,
      route_country: routedScrape ? routeCountry : '',
      route_scrape_plan: routedScrape
        ? buildBrowserRoutedScrapePlan({
            movie, year, existingProviders: [...existingProviderItems, ...globalMatches], country: routeCountry,
          })
        : [],
      availability_scope: routedScrape ? 'global_plus_browser_route' : 'global',
      availability_region: 'GLOBAL',
      availability_countries: allCountries,
      provider_countries: providerCountries,
      country_count: allCountries.length,
      lookup_mode: scrapeOnly
        ? 'provider_scrape_only'
        : tmdbOnly
          ? 'tmdb_all_countries_only'
          : 'tmdb_all_countries_plus_scrape',
      lookup_phase: scrapeOnly ? 'scrape' : tmdbOnly ? 'tmdb' : 'full',
      geolocation_used: false,
      movie_metadata: movieMetadata,
      matched_movie: movieMetadata,
    }, 200, {
      'Cache-Control': 'public, max-age=1800, s-maxage=1800',
    });
  }

  if (scrapeOnly) {
    return json({
      ok: true,
      urls: [],
      fallback_urls: [],
      searched_urls: [],
      availability_source: routedScrape
        ? 'browser_extension_routed_provider_scrape'
        : 'provider_strong_exact_scrape',
      scraped_provider_count: browserRoutedMatches.length,
      browser_routed_provider_count: browserRoutedMatches.length,
      route_country: routedScrape ? routeCountry : '',
      route_scrape_plan: routedScrape
        ? buildBrowserRoutedScrapePlan({
            movie, year, existingProviders: existingProviderItems, country: routeCountry,
          })
        : [],
      availability_scope: routedScrape ? 'browser_routed_provider_catalog' : 'global',
      availability_region: 'GLOBAL',
      availability_countries: [],
      provider_countries: {},
      country_count: 0,
      lookup_mode: 'provider_scrape_only',
      lookup_phase: 'scrape',
      geolocation_used: false,
      movie_metadata: movieMetadata,
      matched_movie: movieMetadata,
    }, 200, {
      'Cache-Control': 'public, max-age=900, s-maxage=900',
    });
  }

  const searchFallbackUrls = sanitizeWatchProviderUserLinks(
    buildSearchFallbackWatchProviderResults(movie, year)
      .map((item) => ({
        ...item,
        verified: false,
        available: false,
        search_only: true,
        countries: [],
        country_count: 0,
        availability_scope: 'global',
      })),
    movie
  );

  return json({
    ok: true,
    provider: searchFallbackUrls[0]?.provider || '',
    provider_label: searchFallbackUrls[0]?.label || '',
    direct: false,
    verified: false,
    search_only: true,
    url: searchFallbackUrls[0]?.url || '',
    urls: searchFallbackUrls,
    fallback_urls: searchFallbackUrls.slice(1),
    searched_urls: searchFallbackUrls,
    availability_source: 'search_fallback_after_tmdb_global_miss',
    availability_scope: 'global',
    availability_region: 'GLOBAL',
    availability_countries: [],
    provider_countries: {},
    country_count: 0,
    lookup_mode: 'tmdb_all_countries_no_match',
    geolocation_used: false,
    movie_metadata: movieMetadata,
    matched_movie: movieMetadata,
  }, 200, {
    'Cache-Control': 'public, max-age=900, s-maxage=900',
  });
}

function parseCookieHeader(header = '') {
  return Object.fromEntries(String(header || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const index = part.indexOf('=');
      if (index < 0) return [part, ''];
      return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
    }));
}

function getWatchAvailabilityLookupMode(request, env = {}, payload = {}) {
  const every = Math.max(1, Math.min(Number(env?.WATCH_API_EVERY_N_REQUESTS) || 3, 20));
  const dailyLimit = Math.max(0, Math.min(Number(env?.WATCH_PREMIUM_DAILY_LIMIT) || 10, 100));
  const browserCount = Math.max(0, Number.parseInt(
    payload?.browser_watch_lookup_count
    || payload?.watch_lookup_count
    || payload?.watchLookupCount
    || '',
    10,
  ) || 0);

  const browserPremiumCount = Math.max(0, Number.parseInt(
    payload?.browser_watch_premium_day_count
    || payload?.watch_premium_day_count
    || '',
    10,
  ) || 0);
  const today = new Date().toISOString().slice(0, 10);
  const browserPremiumDay = cleanDescription(payload?.browser_watch_premium_day || payload?.watch_premium_day || '');
  const browserPremiumAllowed = payload?.watch_premium_lookup_allowed === true
    || payload?.watch_premium_lookup_allowed === 'true'
    || payload?.watchPremiumLookupAllowed === true;

  const buildMode = ({ count, source, cookie = '' }) => {
    const isScheduledPremiumSearch = count > 0 && count % every === 0;
    const validPremiumDay = !browserPremiumDay || browserPremiumDay === today;
    const premiumDailyCount = browserPremiumDay && !validPremiumDay ? dailyLimit : browserPremiumCount;
    const premiumQuotaRemaining = Math.max(0, dailyLimit - premiumDailyCount);
    const premiumQuotaReached = dailyLimit > 0 && premiumDailyCount >= dailyLimit;
    const useCatalogApis = isScheduledPremiumSearch
      && dailyLimit > 0
      && validPremiumDay
      && browserPremiumAllowed
      && browserPremiumCount > 0
      && browserPremiumCount <= dailyLimit;

    return {
      count,
      every,
      useCatalogApis,
      cookie,
      source,
      requestsUntilPrecise: isScheduledPremiumSearch ? every : every - (count % every),
      isScheduledPremiumSearch,
      dailyLimit,
      premiumDailyCount,
      premiumQuotaRemaining: useCatalogApis ? Math.max(0, dailyLimit - browserPremiumCount) : premiumQuotaRemaining,
      premiumQuotaReached,
      premiumQuotaSource: browserCount > 0 ? 'browser_cache' : source,
    };
  };

  // Prefer the browser-side localStorage counter. That keeps the every-third
  // expensive lookup stable even when cookies are blocked, partitioned, or not
  // included on a request. The browser also enforces the daily premium quota.
  if (browserCount > 0) {
    return buildMode({ count: browserCount, source: 'browser_cache' });
  }

  const cookieName = cleanDescription(env?.WATCH_LOOKUP_COOKIE_NAME || 'bm_watch_lookup_count') || 'bm_watch_lookup_count';
  const cookies = parseCookieHeader(request?.headers?.get?.('Cookie') || '');
  const previous = Math.max(0, Number.parseInt(cookies[cookieName] || '0', 10) || 0);
  const count = previous + 1;
  const cookie = `${cookieName}=${encodeURIComponent(String(count))}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`;
  return buildMode({ count, source: 'cookie_fallback', cookie });
}


function buildAmazonVideoSearchUrl(movie = '', year = '') {
  const query = cleanDescription(movie || '');
  const url = new URL('https://www.amazon.com/s');
  url.searchParams.set('k', query);
  url.searchParams.set('i', 'instant-video');
  return url.toString();
}

function isPrimeVideoHost(rawUrl = '') {
  try {
    const host = new URL(String(rawUrl || '')).hostname.toLowerCase();
    return host === 'primevideo.com' || host === 'www.primevideo.com' || host.endsWith('.primevideo.com');
  } catch (_) {
    return false;
  }
}

async function primeVideoLinkClearlyUnavailable(rawUrl = '', env = {}) {
  if (!isPrimeVideoHost(rawUrl)) return false;

  const controller = new AbortController();
  const timeoutMs = Math.max(1500, Math.min(Number(env?.PRIME_VIDEO_CHECK_TIMEOUT_MS) || 4500, 10000));
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(rawUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.8',
        'User-Agent': cleanDescription(env?.PRIME_VIDEO_CHECK_USER_AGENT || 'Mozilla/5.0 (compatible; BiologicalMachineryWatchCheck/1.0)'),
      },
      cf: { cacheEverything: true, cacheTtl: 900 },
    });

    if ([404, 410, 451].includes(response.status)) return true;
    if (!response.ok) return false;

    const finalUrl = response.url || rawUrl;
    try {
      const final = new URL(finalUrl);
      const path = final.pathname.toLowerCase();
      const query = final.search.toLowerCase();
      if (
        path === '/' ||
        /\/(?:search|storefront|region|help)(?:\/|$)/.test(path) ||
        /[?&](?:phrase|query|q|search)=/.test(query)
      ) {
        return true;
      }
    } catch (_) {}

    const html = (await response.text()).slice(0, 350000).toLowerCase();
    const unavailableSignals = [
      'this video is currently unavailable',
      'this title is currently unavailable',
      'currently unavailable in your location',
      'not available in your location',
      'not available in your region',
      'video unavailable',
      'title unavailable',
      'content is unavailable',
      'we couldn\'t find that page',
      'page not found',
    ];

    return unavailableSignals.some((signal) => html.includes(signal));
  } catch (_) {
    // Network errors, bot challenges, and timeouts are inconclusive. Preserve the
    // original catalog result rather than incorrectly marking it unavailable.
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function replaceUnavailablePrimeVideoLinks(items = [], movie = '', year = '', env = {}) {
  const results = Array.isArray(items) ? items.map((item) => ({ ...item })) : [];
  const amazonSearchUrl = buildAmazonVideoSearchUrl(movie, year);

  await Promise.all(results.map(async (item) => {
    const providerKey = normalizeWatchProviderKey(item?.provider || item?.label || '');
    if (providerKey !== 'amazon' || !isPrimeVideoHost(item?.url || '')) return;

    const explicitlyUnavailable =
      item?.available === false ||
      item?.is_available === false ||
      item?.availability_confirmed === false ||
      /^(?:unavailable|not[_ -]?available|none)$/i.test(String(item?.availability || item?.status || ''));

    const unavailable = explicitlyUnavailable || await primeVideoLinkClearlyUnavailable(item.url, env);
    if (!unavailable) return;

    item.url = amazonSearchUrl;
    item.provider = 'amazon';
    item.label = 'Amazon Video';
    item.direct = false;
    item.verified = false;
    item.available = false;
    item.search_only = true;
    item.source = 'amazon_video_search_after_prime_unavailable';
    item.match_method = 'prime_video_unavailable_amazon_search';
    item.offer_type = 'search';
    item.offer_label = 'Search Amazon';
    item.replaced_primevideo_url = true;
  }));

  return results;
}

function buildSearchFallbackWatchProviderResults(movie, year = '') {
  return buildProviderSearchUrls(movie, year)
    .filter((item) => item.provider !== 'justwatch')
    .map((item) => ({
      ...item,
      verified: false,
      direct: false,
      search_only: true,
      source: 'search_fallback',
      match_method: 'pre_filled_provider_search',
      offer_type: 'search',
      offer_label: 'Search',
    }));
}

const WATCH_PROVIDERS = [
  {
    provider: 'netflix',
    label: 'Netflix',
    payloadKeys: ['netflix_id', 'netflixId', 'netflix_title_id', 'netflixTitleId'],
    envKeys: ['NETFLIX_TITLE_MAP'],
    cleanId: cleanNetflixTitleId,
    directUrl: (id) => `https://www.netflix.com/title/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.netflix.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    provider: 'amazon',
    label: 'Amazon Prime Video',
    payloadKeys: ['amazon_id', 'amazonId', 'amazon_asin', 'amazonAsin', 'prime_id', 'primeId'],
    envKeys: ['AMAZON_TITLE_MAP', 'PRIME_VIDEO_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.amazon.com/gp/video/detail/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.amazon.com/s?k=${encodeURIComponent(query)}&i=instant-video`,
  },
  {
    provider: 'hulu',
    label: 'Hulu',
    payloadKeys: ['hulu_id', 'huluId', 'hulu_title_id', 'huluTitleId'],
    envKeys: ['HULU_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.hulu.com/watch/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.hulu.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    provider: 'disney',
    label: 'Disney+',
    payloadKeys: ['disney_id', 'disneyId', 'disneyplus_id', 'disneyplusId'],
    envKeys: ['DISNEY_TITLE_MAP', 'DISNEY_PLUS_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.disneyplus.com/browse/entity-${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.disneyplus.com/search/${encodeURIComponent(query)}`,
  },
  {
    provider: 'max',
    label: 'Max',
    payloadKeys: ['max_id', 'maxId', 'hbo_id', 'hboId'],
    envKeys: ['MAX_TITLE_MAP', 'HBO_MAX_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.max.com/movies/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.max.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    provider: 'apple',
    label: 'Apple TV',
    payloadKeys: ['apple_id', 'appleId', 'apple_tv_id', 'appleTvId'],
    envKeys: ['APPLE_TV_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://tv.apple.com/movie/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://tv.apple.com/search?term=${encodeURIComponent(query)}`,
  },
  {
    provider: 'youtube',
    label: 'YouTube Movies',
    payloadKeys: ['youtube_id', 'youtubeId', 'youtube_movie_id', 'youtubeMovieId'],
    envKeys: ['YOUTUBE_MOVIE_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} movie`)}`,
  },
  {
    provider: 'google-play',
    label: 'Google Play Movies',
    payloadKeys: ['google_play_id', 'googlePlayId', 'google_id', 'googleId'],
    envKeys: ['GOOGLE_PLAY_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://play.google.com/store/movies/details?id=${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=movies`,
  },
  {
    provider: 'fandango',
    label: 'Fandango at Home',
    payloadKeys: ['fandango_id', 'fandangoId', 'vudu_id', 'vuduId'],
    envKeys: ['FANDANGO_TITLE_MAP', 'VUDU_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.fandangoathome.com/content/browse/details/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.fandangoathome.com/search?searchString=${encodeURIComponent(query)}`,
  },
  {
    provider: 'roku-channel',
    label: 'The Roku Channel',
    payloadKeys: ['roku_id', 'rokuId', 'roku_channel_id', 'rokuChannelId'],
    envKeys: ['ROKU_TITLE_MAP', 'ROKU_CHANNEL_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://therokuchannel.roku.com/details/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://therokuchannel.roku.com/search/${encodeURIComponent(query)}`,
  },
  {
    provider: 'tubi',
    label: 'Tubi',
    payloadKeys: ['tubi_id', 'tubiId'],
    envKeys: ['TUBI_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://tubitv.com/movies/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://tubitv.com/search/${encodeURIComponent(query)}`,
  },
  {
    provider: 'peacock',
    label: 'Peacock',
    payloadKeys: ['peacock_id', 'peacockId'],
    envKeys: ['PEACOCK_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.peacocktv.com/watch/asset/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.peacocktv.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    provider: 'paramount',
    label: 'Paramount+',
    payloadKeys: ['paramount_id', 'paramountId', 'paramount_plus_id', 'paramountPlusId'],
    envKeys: ['PARAMOUNT_TITLE_MAP', 'PARAMOUNT_PLUS_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.paramountplus.com/movies/video/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.paramountplus.com/search/?q=${encodeURIComponent(query)}`,
  },
  {
    provider: 'amc-plus',
    label: 'AMC+',
    payloadKeys: ['amc_id', 'amcId', 'amc_plus_id', 'amcPlusId'],
    envKeys: ['AMC_TITLE_MAP', 'AMC_PLUS_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.amcplus.com/movies/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.amcplus.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    provider: 'starz',
    label: 'Starz',
    payloadKeys: ['starz_id', 'starzId'],
    envKeys: ['STARZ_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.starz.com/us/en/movies/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.starz.com/us/en/search?q=${encodeURIComponent(query)}`,
  },

  {
    provider: 'megogo',
    label: 'MEGOGO',
    payloadKeys: ['megogo_id', 'megogoId'],
    envKeys: ['MEGOGO_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://megogo.net/view/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://megogo.net/en/search-extended?q=${encodeURIComponent(query)}`,
  },
  {
    provider: 'bbc-iplayer',
    label: 'BBC iPlayer',
    payloadKeys: ['bbc_iplayer_id', 'bbcIplayerId', 'iplayer_id', 'iplayerId'],
    envKeys: ['BBC_IPLAYER_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.bbc.co.uk/iplayer/episode/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.bbc.co.uk/iplayer/search?q=${encodeURIComponent(query)}`,
  },
  {
    provider: 'itvx',
    label: 'ITVX',
    payloadKeys: ['itvx_id', 'itvxId'],
    envKeys: ['ITVX_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.itv.com/watch/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.itv.com/watch/search?q=${encodeURIComponent(query)}`,
  },
  {
    provider: 'channel-4',
    label: 'Channel 4',
    payloadKeys: ['channel4_id', 'channel4Id', 'all4_id', 'all4Id'],
    envKeys: ['CHANNEL4_TITLE_MAP', 'ALL4_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.channel4.com/programmes/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.channel4.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    provider: 'now',
    label: 'NOW',
    payloadKeys: ['now_id', 'nowId', 'nowtv_id', 'nowtvId'],
    envKeys: ['NOW_TITLE_MAP', 'NOWTV_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.nowtv.com/watch/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.nowtv.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    provider: 'sky-store',
    label: 'Sky Store',
    payloadKeys: ['sky_store_id', 'skyStoreId'],
    envKeys: ['SKY_STORE_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.skystore.com/product/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.skystore.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    provider: 'rakuten-tv',
    label: 'Rakuten TV',
    payloadKeys: ['rakuten_id', 'rakutenId', 'rakuten_tv_id', 'rakutenTvId'],
    envKeys: ['RAKUTEN_TV_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.rakuten.tv/uk/movies/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.rakuten.tv/uk/search?q=${encodeURIComponent(query)}`,
  },
  {
    provider: 'mubi',
    label: 'MUBI',
    payloadKeys: ['mubi_id', 'mubiId'],
    envKeys: ['MUBI_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://mubi.com/en/films/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://mubi.com/en/gb/search/films?query=${encodeURIComponent(query)}`,
  },
  {
    provider: 'crunchyroll',
    label: 'Crunchyroll',
    payloadKeys: ['crunchyroll_id', 'crunchyrollId'],
    envKeys: ['CRUNCHYROLL_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.crunchyroll.com/watch/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.crunchyroll.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    provider: 'bfi-player',
    label: 'BFI Player',
    payloadKeys: ['bfi_player_id', 'bfiPlayerId'],
    envKeys: ['BFI_PLAYER_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://player.bfi.org.uk/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://player.bfi.org.uk/search?query=${encodeURIComponent(query)}`,
  },
  {
    provider: 'stv-player',
    label: 'STV Player',
    payloadKeys: ['stv_player_id', 'stvPlayerId'],
    envKeys: ['STV_PLAYER_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://player.stv.tv/summary/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://player.stv.tv/search?q=${encodeURIComponent(query)}`,
  },
  {
    provider: 'kanopy',
    label: 'Kanopy',
    payloadKeys: ['kanopy_id', 'kanopyId'],
    envKeys: ['KANOPY_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://www.kanopy.com/en/product/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://www.kanopy.com/en/search?query=${encodeURIComponent(query)}`,
  },
  {
    provider: 'curzon',
    label: 'Curzon Home Cinema',
    payloadKeys: ['curzon_id', 'curzonId'],
    envKeys: ['CURZON_TITLE_MAP', 'CURZON_HOME_CINEMA_TITLE_MAP'],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => /^https?:\/\//i.test(id) ? id : `https://homecinema.curzon.com/film/${encodeURIComponent(id)}`,
    searchUrl: (query) => `https://homecinema.curzon.com/search?query=${encodeURIComponent(query)}`,
  },
  {
    provider: 'justwatch',
    label: 'JustWatch',
    payloadKeys: [],
    envKeys: [],
    cleanId: cleanGenericProviderId,
    directUrl: (id) => id,
    searchUrl: (query) => `https://www.justwatch.com/us/search?q=${encodeURIComponent(query)}`,
  },
];

function hasAnyProviderId(payload = {}) {
  return WATCH_PROVIDERS.some((provider) => provider.payloadKeys.some((key) => cleanGenericProviderId(payload[key])));
}

function cleanNetflixTitleId(value = '') {
  const match = String(value || '').match(/(?:netflix\.com\/title\/)?([0-9]{4,})/i);
  return match ? match[1] : '';
}

function cleanGenericProviderId(value = '') {
  const clean = cleanDescription(value || '');
  if (!clean) return '';
  if (/^https?:\/\//i.test(clean)) return clean;
  return clean.replace(/^['"]|['"]$/g, '').trim();
}

function normalizeProviderMapValue(value, providerConfig) {
  if (!value) return '';
  if (typeof value === 'string' || typeof value === 'number') return providerConfig.cleanId(value);
  const directProviderValue = value[providerConfig.provider] || value[`${providerConfig.provider}_id`] || value[`${providerConfig.provider}Id`];
  return providerConfig.cleanId(
    directProviderValue
    || value.id
    || value.title_id
    || value.titleId
    || value.url
    || value.href
    || ''
  );
}

function lookupProviderTitleId(movie, year, imdbId, rawMap, providerConfig) {
  if (!rawMap) return '';
  let map = {};
  try {
    map = typeof rawMap === 'string' ? JSON.parse(rawMap) : rawMap;
  } catch {
    return '';
  }
  const title = cleanDescription(movie);
  const cleanYear = cleanDescription(year || '').slice(0, 4);
  const cleanImdb = cleanDescription(imdbId || '').toLowerCase();
  const keys = [
    imdbId,
    cleanImdb,
    `${title}|${year}`,
    `${title}|${cleanYear}`,
    `${title.toLowerCase()}|${year}`,
    `${title.toLowerCase()}|${cleanYear}`,
    title,
    title.toLowerCase(),
  ].filter(Boolean);

  for (const key of keys) {
    const value = normalizeProviderMapValue(map[key], providerConfig);
    if (value) return value;
  }
  return '';
}

function findDirectWatchProvider({ movie, year, imdbId, payload = {}, env = {} }) {
  for (const providerConfig of WATCH_PROVIDERS) {
    if (providerConfig.provider === 'justwatch') continue;

    const payloadId = providerConfig.payloadKeys
      .map((key) => providerConfig.cleanId(payload[key] || ''))
      .find(Boolean);

    const mappedId = payloadId || providerConfig.envKeys
      .map((key) => lookupProviderTitleId(movie, year, imdbId, env?.[key], providerConfig))
      .find(Boolean);

    if (mappedId) {
      return {
        provider: providerConfig.provider,
        label: providerConfig.label,
        id: mappedId,
        direct: true,
        url: providerConfig.directUrl(mappedId),
      };
    }
  }

  const genericMapMatch = lookupAnyProviderFromGenericMap(movie, year, imdbId, env?.WATCH_TITLE_MAP || env?.STREAMING_TITLE_MAP || env?.PROVIDER_TITLE_MAP);
  if (genericMapMatch) return genericMapMatch;

  return null;
}

function lookupAnyProviderFromGenericMap(movie, year, imdbId, rawMap) {
  if (!rawMap) return null;
  let map = {};
  try {
    map = typeof rawMap === 'string' ? JSON.parse(rawMap) : rawMap;
  } catch {
    return null;
  }

  const title = cleanDescription(movie);
  const cleanYear = cleanDescription(year || '').slice(0, 4);
  const cleanImdb = cleanDescription(imdbId || '').toLowerCase();
  const keys = [imdbId, cleanImdb, `${title}|${year}`, `${title}|${cleanYear}`, `${title.toLowerCase()}|${cleanYear}`, title, title.toLowerCase()].filter(Boolean);

  for (const key of keys) {
    const entry = map[key];
    if (!entry || typeof entry !== 'object') continue;
    for (const providerConfig of WATCH_PROVIDERS) {
      if (providerConfig.provider === 'justwatch') continue;
      const id = normalizeProviderMapValue(entry, providerConfig);
      if (id) {
        return {
          provider: providerConfig.provider,
          label: providerConfig.label,
          id,
          direct: true,
          url: providerConfig.directUrl(id),
        };
      }
    }
  }

  return null;
}

function providerSearchQuery(provider, movie, year = '') {
  // External watch provider search pages should receive the plain movie title
  // only. Keep the year available for internal catalog/API matching, but do not
  // append it to outbound provider search URLs because many provider searches
  // become too narrow or fail when the release year is included.
  return cleanDescription(movie);
}

function buildProviderSearchUrls(movie, year = '') {
  return WATCH_PROVIDERS.map((providerConfig) => {
    const query = providerSearchQuery(providerConfig.provider, movie, year);
    return {
      provider: providerConfig.provider,
      label: providerConfig.label,
      direct: false,
      url: providerConfig.searchUrl(query),
    };
  });
}


function stripDiacritics(value = '') {
  return String(value || '').normalize('NFKD').replace(/[̀-ͯ]/g, '');
}

function normalizeWatchSearchText(value = '') {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleLooksPresentInProviderHtml(html = '', movie = '', year = '') {
  const title = normalizeWatchSearchText(movie);
  if (!title || title.length < 2) return false;

  const haystack = normalizeWatchSearchText(String(html || '').slice(0, 850000));
  if (!haystack) return false;

  const titleTokens = title.split(' ').filter((token) => token.length > 1);
  if (!titleTokens.length) return false;

  const exactTitleFound = haystack.includes(title);
  const tokenHits = titleTokens.filter((token) => haystack.includes(token)).length;
  const enoughTokenHits = titleTokens.length <= 2
    ? tokenHits === titleTokens.length
    : tokenHits >= Math.ceil(titleTokens.length * 0.72);

  const cleanYear = cleanDescription(year || '').slice(0, 4);
  const yearLooksRight = !cleanYear || haystack.includes(cleanYear);

  return (exactTitleFound || enoughTokenHits) && yearLooksRight;
}

async function probeProviderSearchResult(searchItem, movie, year, env = {}) {
  if (!searchItem?.url) return null;

  const timeoutMs = Math.max(800, Math.min(Number(env?.WATCH_PROVIDER_PROBE_TIMEOUT_MS) || 3500, 8000));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('provider-search-timeout'), timeoutMs);

  try {
    const response = await fetch(searchItem.url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': cleanDescription(env?.WATCH_PROVIDER_USER_AGENT || 'Mozilla/5.0 (compatible; BiologicalMachineryMoviePicker/1.0)'),
      },
    });

    const finalUrl = response.url || searchItem.url;
    const responseText = await response.text().catch(() => '');
    if (!response.ok && !responseText) return null;

    const foundByUrl = titleLooksPresentInProviderHtml(decodeURIComponent(finalUrl), movie, year);
    const foundByHtml = titleLooksPresentInProviderHtml(responseText, movie, year);
    if (!foundByUrl && !foundByHtml) return null;

    return {
      ...searchItem,
      url: finalUrl || searchItem.url,
      verified: true,
      match_method: foundByUrl ? 'url' : 'page',
    };
  } catch (error) {
    console.warn(`[watch-link] ${searchItem.provider || 'provider'} search probe failed:`, error?.message || error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function findAvailableWatchProviderSearchResults(movie, year, searchUrls = [], env = {}) {
  const found = [];
  for (const searchItem of searchUrls) {
    // JustWatch is kept as a broad manual fallback in README examples, but this
    // route should only return the requested direct providers as confirmed results.
    if (searchItem.provider === 'justwatch') continue;
    const match = await probeProviderSearchResult(searchItem, movie, year, env);
    if (match) found.push(match);
  }
  return found;
}


const WATCH_PROVIDER_PRIORITY = [
  'netflix',
  'amazon',
  'hulu',
  'disney',
  'max',
  'apple',
  'youtube',
  'google-play',
  'fandango',
  'roku-channel',
  'tubi',
  'peacock',
  'paramount',
  'amc-plus',
  'starz',
  'philo',
  'megogo',
  'bbc-iplayer',
  'itvx',
  'channel-4',
  'now',
  'sky-store',
  'rakuten-tv',
  'mubi',
  'crunchyroll',
  'bfi-player',
  'stv-player',
  'kanopy',
  'curzon',
  'filmzie',
  'fawesome',
];

function normalizeWatchProviderKey(value = '') {
  const normalized = normalize(value);
  if (!normalized) return '';
  if (/netflix/.test(normalized)) return 'netflix';
  if (/amazon|prime/.test(normalized)) return 'amazon';
  if (/hulu/.test(normalized)) return 'hulu';
  if (/disney/.test(normalized)) return 'disney';
  if (/\bmax\b|hbo/.test(normalized)) return 'max';
  if (/apple/.test(normalized)) return 'apple';
  if (/youtube/.test(normalized)) return 'youtube';
  if (/google|play movies|google play/.test(normalized)) return 'google-play';
  if (/fandango|vudu/.test(normalized)) return 'fandango';
  if (/roku/.test(normalized)) return 'roku-channel';
  if (/tubi/.test(normalized)) return 'tubi';
  if (/peacock/.test(normalized)) return 'peacock';
  if (/paramount/.test(normalized)) return 'paramount';
  if (/amc/.test(normalized)) return 'amc-plus';
  if (/starz/.test(normalized)) return 'starz';
  if (/philo/.test(normalized)) return 'philo';
  if (/megogo/.test(normalized)) return 'megogo';
  if (/bbc.*iplayer|iplayer.*bbc|\biplayer\b/.test(normalized)) return 'bbc-iplayer';
  if (/itvx|itv x|itv hub/.test(normalized)) return 'itvx';
  if (/channel 4|all 4|all4/.test(normalized)) return 'channel-4';
  if (/\bnow\b|now tv|nowtv/.test(normalized)) return 'now';
  if (/sky store/.test(normalized)) return 'sky-store';
  if (/rakuten/.test(normalized)) return 'rakuten-tv';
  if (/mubi/.test(normalized)) return 'mubi';
  if (/crunchyroll/.test(normalized)) return 'crunchyroll';
  if (/bfi player|british film institute player/.test(normalized)) return 'bfi-player';
  if (/stv player|\bstv\b/.test(normalized)) return 'stv-player';
  if (/kanopy/.test(normalized)) return 'kanopy';
  if (/curzon/.test(normalized)) return 'curzon';
  if (/filmzie/.test(normalized)) return 'filmzie';
  if (/fawesome/.test(normalized)) return 'fawesome';
  return normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'provider';
}

function watchProviderRank(item = {}) {
  const key = normalizeWatchProviderKey(item.provider || item.label || '');
  const index = WATCH_PROVIDER_PRIORITY.indexOf(key);
  return index >= 0 ? index : WATCH_PROVIDER_PRIORITY.length + 1;
}

function sortWatchProviders(items = []) {
  return [...items].sort((a, b) => {
    const rankDiff = watchProviderRank(a) - watchProviderRank(b);
    if (rankDiff) return rankDiff;
    return String(a.label || '').localeCompare(String(b.label || ''));
  });
}

function dedupeWatchProviderResults(items = []) {
  const seen = new Set();
  const output = [];
  for (const item of items) {
    const key = `${normalizeWatchProviderKey(item.provider || item.label)}|${normalize(item.label)}|${item.offer_type || ''}`;
    if (!item?.label || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

async function findWatchProviderAvailabilityFromCatalogApis({ movie, year, imdbId, region = '', env = {} }) {
  const results = [];

  // Paid/deeplink sources are only called on scheduled precise lookups. Prefer
  // Watchmode for the configured viewer region; if it has no result in that
  // country, fall back to Streaming Availability API (Movie of the Night).
  results.push(...await findWatchmodeSources({ movie, year, imdbId, region, env }));

  if (!results.length) {
    results.push(...await findStreamingAvailabilitySources({ movie, year, imdbId, region, env }));
  }

  // TMDb stays as a final non-deeplink availability fallback. It confirms the
  // provider by region, but usually only gives the TMDb/JustWatch title watch page.
  if (!results.length) {
    results.push(...await findTmdbWatchProviders({ movie, year, imdbId, region, env }));
  }

  return sortWatchProviders(dedupeWatchProviderResults(results));
}

function getTmdbAuthHeaders(env = {}) {
  const bearer = cleanDescription(env?.TMDB_BEARER_TOKEN || env?.TMDB_READ_ACCESS_TOKEN || '');
  const headers = { Accept: 'application/json' };
  if (bearer) headers.Authorization = bearer.startsWith('Bearer ') ? bearer : `Bearer ${bearer}`;
  return headers;
}

function appendTmdbApiKey(url, env = {}) {
  const apiKey = cleanDescription(env?.TMDB_API_KEY || env?.THEMOVIEDB_API_KEY || '');
  if (apiKey && !url.searchParams.has('api_key')) url.searchParams.set('api_key', apiKey);
  return url;
}

async function fetchTmdbJson(path, params = {}, env = {}) {
  const apiKey = cleanDescription(env?.TMDB_API_KEY || env?.THEMOVIEDB_API_KEY || '');
  const bearer = cleanDescription(env?.TMDB_BEARER_TOKEN || env?.TMDB_READ_ACCESS_TOKEN || '');
  const hasAuth = apiKey || bearer;

  if (!hasAuth) {
    console.warn('[watch-link] TMDb request skipped: no TMDB_API_KEY, THEMOVIEDB_API_KEY, TMDB_BEARER_TOKEN, or TMDB_READ_ACCESS_TOKEN is configured.');
    return null;
  }

  const url = appendTmdbApiKey(new URL(`https://api.themoviedb.org/3${path}`), env);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  }

  // Never print the API key or bearer token in logs.
  const safeUrl = new URL(url.toString());
  if (safeUrl.searchParams.has('api_key')) safeUrl.searchParams.set('api_key', '[REDACTED]');

  console.log('[watch-link] TMDb request:', {
    method: 'GET',
    url: safeUrl.toString(),
    auth: bearer ? 'bearer-token' : 'api-key',
  });

  try {
    const response = await fetch(url.toString(), { headers: getTmdbAuthHeaders(env) });
    const rawBody = await response.text();
    let data = {};

    try {
      data = rawBody ? JSON.parse(rawBody) : {};
    } catch (_) {
      data = { raw_body: rawBody };
    }

    console.log('[watch-link] TMDb response:', {
      path,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get('content-type') || '',
      body: data,
    });

    if (!response.ok) {
      console.warn('[watch-link] TMDb request failed:', response.status, data?.status_message || data?.message || rawBody || '');
      return null;
    }

    return data;
  } catch (error) {
    console.warn('[watch-link] TMDb request threw an error:', {
      path,
      message: error?.message || String(error),
      stack: error?.stack || '',
    });
    return null;
  }
}


function normalizeTitleForLiteralComparison(value = '') {
  return cleanDescription(value)
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleSymbolSignature(value = '') {
  return [...normalizeTitleForLiteralComparison(value)]
    .filter((character) => !/[\p{L}\p{N}\s]/u.test(character))
    .join('');
}

function titleLiteralMatchScore(requestedTitle = '', candidateTitle = '') {
  const requested = normalizeTitleForLiteralComparison(requestedTitle);
  const candidate = normalizeTitleForLiteralComparison(candidateTitle);

  if (!requested || !candidate) return 0;

  let score = 0;

  // Strongest signal: exact spelling, capitalization, punctuation and symbols.
  if (candidate === requested) score += 1000;

  // Preserve punctuation/symbol distinctions while ignoring capitalization.
  if (candidate.toLocaleLowerCase() === requested.toLocaleLowerCase()) {
    score += 500;
  }

  const requestedSymbols = titleSymbolSignature(requested);
  const candidateSymbols = titleSymbolSignature(candidate);

  if (requestedSymbols === candidateSymbols) {
    score += 180;
  } else if (requestedSymbols && !candidateSymbols) {
    score -= 220;
  } else if (!requestedSymbols && candidateSymbols) {
    score -= 90;
  }

  // Prefer the closest complete character sequence, including punctuation.
  score += sequenceSimilarity(
    requested.toLocaleLowerCase(),
    candidate.toLocaleLowerCase()
  ) * 100;

  // Avoid preferring a stripped or expanded title merely because normalization
  // made both values identical.
  score -= Math.abs(requested.length - candidate.length) * 4;

  return score;
}

function scoreAmbiguousTmdbTitleCandidate(candidate, requestedTitle, cleanYear = '') {
  const displayedScore = titleLiteralMatchScore(
    requestedTitle,
    candidate.displayedTitle
  );
  const originalScore = titleLiteralMatchScore(
    requestedTitle,
    candidate.originalTitle
  );

  let score = Math.max(displayedScore, originalScore);

  if (cleanYear && candidate.yearMatches) score += 300;

  const popularity = Number(candidate.item?.popularity);
  if (Number.isFinite(popularity)) {
    score += Math.min(40, Math.log10(Math.max(1, popularity) + 1) * 10);
  }

  return score;
}

async function findTmdbMovieId({ movie, year, imdbId, env = {} }) {
  const cleanImdb = cleanDescription(imdbId || '').toLowerCase();

  // IMDb ID is the most reliable identifier.
  if (/^tt\d+$/i.test(cleanImdb)) {
    const external = await fetchTmdbJson(
      `/find/${encodeURIComponent(cleanImdb)}`,
      { external_source: 'imdb_id' },
      env
    );

    const match = Array.isArray(external?.movie_results)
      ? external.movie_results[0]
      : null;

    if (match?.id) {
      console.log('[watch-link] TMDb movie selected by IMDb ID:', {
        imdb_id: cleanImdb,
        tmdb_id: match.id,
        title: match.title || match.original_title || '',
      });

      return match.id;
    }
  }

  const title = cleanDescription(movie || '');
  if (!title) return '';

  const cleanYear = cleanDescription(year || '').slice(0, 4);
  const titleNorm = normalize(title);

  // Very short/ambiguous normalized titles must not use fuzzy matching.
  if (!titleNorm) return '';

  const search = await fetchTmdbJson('/search/movie', {
    query: title,
    year: cleanYear || undefined,
    include_adult: 'false',
  }, env);

  const results = Array.isArray(search?.results) ? search.results : [];
  if (!results.length) return '';

  const candidates = results.map((item) => {
    const displayedTitle = cleanDescription(
      item.title || item.original_title || ''
    );

    const originalTitle = cleanDescription(item.original_title || '');
    const displayedNorm = normalize(displayedTitle);
    const originalNorm = normalize(originalTitle);
    const releaseYear = cleanDescription(item.release_date || '').slice(0, 4);

    const exactTitle =
      titleNorm === displayedNorm ||
      titleNorm === originalNorm;

    const yearMatches =
      Boolean(cleanYear) &&
      releaseYear === cleanYear;

    const similarity = Math.max(
      sequenceSimilarity(titleNorm, displayedNorm),
      sequenceSimilarity(titleNorm, originalNorm)
    );

    return {
      item,
      displayedTitle,
      originalTitle,
      releaseYear,
      exactTitle,
      yearMatches,
      similarity,
    };
  });

  // Exact title and exact year.
  if (cleanYear) {
    const exactTitleAndYear = candidates.find(
      (candidate) => candidate.exactTitle && candidate.yearMatches
    );

    if (exactTitleAndYear?.item?.id) {
      console.log('[watch-link] TMDb movie selected by exact title/year:', {
        requested_title: title,
        requested_year: cleanYear,
        tmdb_id: exactTitleAndYear.item.id,
        matched_title: exactTitleAndYear.displayedTitle,
        matched_year: exactTitleAndYear.releaseYear,
      });

      return exactTitleAndYear.item.id;
    }
  }

  // Exact title is acceptable when no year was supplied.
  const exactTitleMatches = candidates.filter(
    (candidate) => candidate.exactTitle
  );

  if (exactTitleMatches.length === 1) {
    const selected = exactTitleMatches[0];

    console.log('[watch-link] TMDb movie selected by exact title:', {
      requested_title: title,
      tmdb_id: selected.item.id,
      matched_title: selected.displayedTitle,
      matched_year: selected.releaseYear,
    });

    return selected.item.id;
  }

  // When normalization produces several "exact" records, select the title
  // that most closely preserves the user's original capitalization,
  // punctuation, symbols and complete character sequence.
  if (exactTitleMatches.length > 1) {
    const rankedExactMatches = exactTitleMatches
      .map((candidate) => ({
        candidate,
        literalScore: scoreAmbiguousTmdbTitleCandidate(
          candidate,
          title,
          cleanYear
        ),
      }))
      .sort((a, b) =>
        b.literalScore - a.literalScore ||
        Number(b.candidate.yearMatches) - Number(a.candidate.yearMatches) ||
        Number(b.candidate.item?.popularity || 0) -
          Number(a.candidate.item?.popularity || 0) ||
        Number(a.candidate.item?.id || 0) -
          Number(b.candidate.item?.id || 0)
      );

    const selected = rankedExactMatches[0];

    console.log('[watch-link] TMDb movie selected from ambiguous exact matches:', {
      requested_title: title,
      requested_year: cleanYear || null,
      tmdb_id: selected.candidate.item.id,
      matched_title: selected.candidate.displayedTitle,
      matched_original_title: selected.candidate.originalTitle,
      matched_year: selected.candidate.releaseYear,
      literal_score: selected.literalScore,
      matches: rankedExactMatches.slice(0, 10).map((entry) => ({
        tmdb_id: entry.candidate.item.id,
        title: entry.candidate.displayedTitle,
        original_title: entry.candidate.originalTitle,
        year: entry.candidate.releaseYear,
        literal_score: entry.literalScore,
      })),
    });

    return selected.candidate.item.id;
  }

  // Very short titles may still use an exact normalized match. Only refuse
  // fuzzy matching when no exact candidate survived.
  if (titleNorm.length < 5) {
    console.warn('[watch-link] Refusing fuzzy short-title TMDb match:', {
      requested_title: title,
      normalized_title: titleNorm,
      result_count: results.length,
    });

    return '';
  }

  // Fuzzy matching is only a guarded last resort.
  const fuzzyCandidates = candidates
    .filter((candidate) => {
      if (cleanYear && !candidate.yearMatches) return false;
      return candidate.similarity >= 0.92;
    })
    .sort((a, b) => b.similarity - a.similarity);

  const best = fuzzyCandidates[0];
  const second = fuzzyCandidates[1];

  // Require a clear winning candidate.
  if (
    !best ||
    (second && best.similarity - second.similarity < 0.08)
  ) {
    console.warn('[watch-link] No safe TMDb movie match:', {
      requested_title: title,
      requested_year: cleanYear || null,
      candidates: candidates.slice(0, 10).map((candidate) => ({
        tmdb_id: candidate.item.id,
        title: candidate.displayedTitle,
        year: candidate.releaseYear,
        similarity: candidate.similarity,
      })),
    });

    return '';
  }

  console.log('[watch-link] TMDb movie selected by guarded fuzzy match:', {
    requested_title: title,
    requested_year: cleanYear || null,
    tmdb_id: best.item.id,
    matched_title: best.displayedTitle,
    matched_year: best.releaseYear,
    similarity: best.similarity,
  });

  return best.item.id;
}

function tmdbOfferTypeRank(type = '') {
  return {
    flatrate: 0,
    free: 1,
    ads: 2,
    rent: 3,
    buy: 4,
  }[type] ?? 9;
}


function providerSearchUrlForLabel(label = '', query = '') {
  const cleanQuery = cleanDescription(query);
  if (!cleanQuery) return '';

  const key = normalizeWatchProviderKey(label);
  const configuredProvider = WATCH_PROVIDERS.find((providerConfig) => providerConfig.provider === key);
  if (configuredProvider?.searchUrl) return configuredProvider.searchUrl(cleanQuery);

  const encoded = encodeURIComponent(cleanQuery);
  if (key === 'google-play') return `https://play.google.com/store/search?q=${encoded}&c=movies`;
  if (key === 'fandango') return `https://www.fandangoathome.com/search?searchString=${encoded}`;
  if (key === 'roku-channel') return `https://therokuchannel.roku.com/search/${encoded}`;
  if (key === 'tubi') return `https://tubitv.com/search/${encoded}`;
  if (key === 'peacock') return `https://www.peacocktv.com/search?q=${encoded}`;
  if (key === 'paramount') return `https://www.paramountplus.com/search/?q=${encoded}`;
  if (key === 'amc-plus') return `https://www.amcplus.com/search?q=${encoded}`;
  if (key === 'starz') return `https://www.starz.com/us/en/search?q=${encoded}`;
  if (key === 'philo') return `https://www.philo.com/search/${encoded}`;
  if (key === 'darkroom') return `https://www.darkroom.film/search?q=${encoded}`;
  if (key === 'megogo') return `https://megogo.net/en/search-extended?q=${encoded}`;
  if (key === 'bbc-iplayer') return `https://www.bbc.co.uk/iplayer/search?q=${encoded}`;
  if (key === 'itvx') return `https://www.itv.com/watch/search?q=${encoded}`;
  if (key === 'channel-4') return `https://www.channel4.com/search?q=${encoded}`;
  if (key === 'now') return `https://www.nowtv.com/search?q=${encoded}`;
  if (key === 'sky-store') return `https://www.skystore.com/search?q=${encoded}`;
  if (key === 'rakuten-tv') return `https://www.rakuten.tv/uk/search?q=${encoded}`;
  if (key === 'mubi') return `https://mubi.com/en/gb/search/films?query=${encoded}`;
  if (key === 'crunchyroll') return `https://www.crunchyroll.com/search?q=${encoded}`;
  if (key === 'bfi-player') return `https://player.bfi.org.uk/search?query=${encoded}`;
  if (key === 'stv-player') return `https://player.stv.tv/search?q=${encoded}`;
  if (key === 'kanopy') return `https://www.kanopy.com/en/search?query=${encoded}`;
  if (key === 'curzon') return `https://homecinema.curzon.com/search?query=${encoded}`;
  if (key === 'filmzie') return `https://filmzie.com/search?query=${encoded}`;
  if (key === 'fawesome') return `https://fawesome.tv/search?q=${encoded}`;
  return '';
}

function tmdbProviderLogoUrl(provider = {}) {
  const logoPath = cleanDescription(provider.logo_path || '');
  return logoPath ? `https://image.tmdb.org/t/p/w92${logoPath}` : '';
}

async function findTmdbMovieMetadata({ tmdbId = '', movie = '', year = '', imdbId = '', env = {} }) {
  const resolvedTmdbId = tmdbId || await findTmdbMovieId({ movie, year, imdbId, env });
  if (!resolvedTmdbId) return null;

  const details = await fetchTmdbJson(
    `/movie/${encodeURIComponent(resolvedTmdbId)}`,
    {},
    env
  );
  if (!details?.id) return null;

  const releaseDate = cleanDescription(details.release_date || '');
  const releaseYear = releaseDate.slice(0, 4) || cleanDescription(year || '').slice(0, 4);
  const productionCountries = (Array.isArray(details.production_countries) ? details.production_countries : [])
    .map((entry) => cleanDescription(entry?.name || entry?.iso_3166_1 || ''))
    .filter(Boolean);
  const originCountries = (Array.isArray(details.origin_country) ? details.origin_country : [])
    .map((entry) => cleanDescription(entry || ''))
    .filter(Boolean);
  const countries = productionCountries.length ? productionCountries : originCountries;

  return {
    year: releaseYear,
    country: countries.join(', '),
  };
}

async function findTmdbWatchProvidersGlobal({ movie, year, imdbId, tmdbId: suppliedTmdbId = '', env = {} }) {
  const tmdbId = suppliedTmdbId || await findTmdbMovieId({ movie, year, imdbId, env });
  if (!tmdbId) return [];

  const payload = await fetchTmdbJson(
    `/movie/${encodeURIComponent(tmdbId)}/watch/providers`,
    {},
    env
  );

  const countries = payload?.results && typeof payload.results === 'object'
    ? payload.results
    : {};

  const offerTypes = ['flatrate', 'free', 'ads', 'rent', 'buy'];
  const aggregated = new Map();

  for (const [countryCodeRaw, country] of Object.entries(countries)) {
    const countryCode = normalizeWatchRegion(countryCodeRaw);
    if (!country || typeof country !== 'object') continue;

    const tmdbWatchUrl = cleanDescription(
      country.link || `https://www.themoviedb.org/movie/${tmdbId}/watch`
    );

    for (const offerType of offerTypes) {
      const providers = Array.isArray(country[offerType])
        ? country[offerType]
        : [];

      for (const provider of providers) {
        const label = cleanDescription(provider?.provider_name || '');
        const providerKey = normalizeWatchProviderKey(label);
        if (!label || !providerKey) continue;

        const providerClickUrl = providerSearchUrlForLabel(label, movie);
        if (!providerClickUrl || isTmdbUrl(providerClickUrl)) continue;

        const mapKey = providerKey;
        const existing = aggregated.get(mapKey) || {
          provider: providerKey,
          label,
          direct: false,
          verified: true,
          available: true,
          search_only: false,
          url: providerClickUrl,
          search_url: providerClickUrl,
          logo_url: tmdbProviderLogoUrl(provider),
          source: 'tmdb_global_watch_providers',
          availability_api: 'tmdb_justwatch_free',
          availability_confirmed: true,
          availability_scope: 'global',
          countries: [],
          offers_by_country: {},
          offer_types: [],
          tmdb_id: String(tmdbId),
          provider_id: provider?.provider_id || '',
          display_priority: provider?.display_priority ?? 9999,
          rank: tmdbOfferTypeRank(offerType),
        };

        if (!existing.countries.includes(countryCode)) {
          existing.countries.push(countryCode);
        }

        if (!existing.offer_types.includes(offerType)) {
          existing.offer_types.push(offerType);
        }

        const countryOffers = existing.offers_by_country[countryCode] || [];
        if (!countryOffers.includes(offerType)) countryOffers.push(offerType);
        existing.offers_by_country[countryCode] = countryOffers;
        existing.rank = Math.min(existing.rank, tmdbOfferTypeRank(offerType));
        existing.display_priority = Math.min(
          existing.display_priority,
          provider?.display_priority ?? 9999
        );

        aggregated.set(mapKey, existing);
      }
    }
  }

  return [...aggregated.values()]
    .map((item) => ({
      ...item,
      countries: item.countries.sort(),
      country_count: item.countries.length,
      offer_types: item.offer_types.sort(
        (a, b) => tmdbOfferTypeRank(a) - tmdbOfferTypeRank(b)
      ),
      offer_label: item.offer_types
        .map((type) => formatWatchOfferType(type))
        .join(', '),
      match_method: 'tmdb_global_watch_providers',
    }))
    .sort((a, b) =>
      (a.rank - b.rank) ||
      (b.country_count - a.country_count) ||
      watchProviderRank(a) - watchProviderRank(b) ||
      (a.display_priority - b.display_priority)
    );
}

async function findTmdbWatchProviders({ movie, year, imdbId, region = '', env = {} }) {
  const tmdbId = await findTmdbMovieId({ movie, year, imdbId, env });
  if (!tmdbId) return [];

  const payload = await fetchTmdbJson(`/movie/${encodeURIComponent(tmdbId)}/watch/providers`, {}, env);
  const selectedRegion = normalizeWatchRegion(region || env?.WATCH_REGION || env?.TMDB_WATCH_REGION || env?.STREAMING_REGION || 'US');
  const country = payload?.results?.[selectedRegion] || null;
  console.log('[watch-link] TMDb selected region providers:', {
    region: selectedRegion,
    available: Boolean(country),
    country: country || null,
  });
  if (!country) return [];

  const providerLink = cleanDescription(country.link || `https://www.themoviedb.org/movie/${tmdbId}/watch`);
  const offerTypes = ['flatrate', 'free', 'ads', 'rent', 'buy'];
  const items = [];

  for (const offerType of offerTypes) {
    const providers = Array.isArray(country[offerType]) ? country[offerType] : [];
    for (const provider of providers) {
      const label = cleanDescription(provider.provider_name || '');
      if (!label) continue;
      // TMDb/JustWatch confirms availability but does not expose per-service
      // deep links. Never send provider-icon clicks to TMDb; use the confirmed
      // service's own pre-filled search page, while keeping the TMDb page only
      // as debug metadata.
      const serviceSearchUrl = providerSearchUrlForLabel(label, movie);
      if (!serviceSearchUrl || isTmdbUrl(serviceSearchUrl)) continue;

      items.push({
        provider: normalizeWatchProviderKey(label),
        label,
        direct: false,
        verified: true,
        url: serviceSearchUrl,
        search_url: serviceSearchUrl,
        logo_url: tmdbProviderLogoUrl(provider),
        source: 'tmdb_watch_providers',
        availability_api: 'tmdb_justwatch_free',
        availability_confirmed: true,
        region: selectedRegion,
        match_method: 'tmdb_watch_providers',
        offer_type: offerType,
        offer_label: formatWatchOfferType(offerType),
        tmdb_id: String(tmdbId),
        provider_id: provider.provider_id || '',
        display_priority: provider.display_priority ?? 9999,
        rank: tmdbOfferTypeRank(offerType),
      });
    }
  }

  return dedupeWatchProviderResults(items)
    .sort((a, b) => (a.rank - b.rank) || watchProviderRank(a) - watchProviderRank(b) || (a.display_priority - b.display_priority));
}

function resolveWatchRegion(_request, _payload = {}, _env = {}) {
  return 'GLOBAL';
}

function normalizeWatchRegion(value = 'US') {
  const clean = cleanDescription(value || 'US').toUpperCase().replace(/[^A-Z]/g, '');
  return clean.length === 2 ? clean : 'US';
}

function formatWatchOfferType(type = '') {
  return {
    flatrate: 'Subscription',
    free: 'Free',
    ads: 'Free with ads',
    rent: 'Rent',
    buy: 'Buy',
  }[type] || cleanDescription(type || 'Watch');
}

async function fetchWatchmodeJson(path, params = {}, env = {}) {
  const apiKey = cleanDescription(env?.WATCHMODE_API_KEY || '');
  if (!apiKey) return null;

  const url = new URL(`https://api.watchmode.com/v1${path}`);
  url.searchParams.set('apiKey', apiKey);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  }

  try {
    const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.warn('[watch-link] Watchmode request failed:', response.status, data?.error || data?.message || '');
      return null;
    }
    return data;
  } catch (error) {
    console.warn('[watch-link] Watchmode request failed:', error?.message || error);
    return null;
  }
}

async function findWatchmodeTitleId({ movie, year, imdbId, env = {} }) {
  const cleanImdb = cleanDescription(imdbId || '').toLowerCase();
  if (/^tt\d+$/i.test(cleanImdb)) {
    const byImdb = await fetchWatchmodeJson(`/search/`, { search_field: 'imdb_id', search_value: cleanImdb }, env);
    const imdbMatch = Array.isArray(byImdb?.title_results) ? byImdb.title_results[0] : null;
    if (imdbMatch?.id) return imdbMatch.id;
  }

  const title = cleanDescription(movie || '');
  if (!title) return '';
  const search = await fetchWatchmodeJson('/autocomplete-search/', { search_value: title, search_type: 1 }, env);
  const results = Array.isArray(search?.results) ? search.results : [];
  const cleanYear = cleanDescription(year || '').slice(0, 4);
  const titleNorm = normalize(title);

  const scored = results.map((item) => {
    const itemTitle = normalize(item.name || '');
    const itemYear = cleanDescription(item.year || '').slice(0, 4);
    let score = sequenceSimilarity(titleNorm, itemTitle);
    if (titleNorm === itemTitle) score += 0.45;
    if (cleanYear && itemYear === cleanYear) score += 0.25;
    return { item, score };
  }).sort((a, b) => b.score - a.score);

  return scored[0]?.score >= 0.55 ? scored[0].item.id : '';
}

async function findWatchmodeSources({ movie, year, imdbId, region = '', env = {} }) {
  const titleId = await findWatchmodeTitleId({ movie, year, imdbId, env });
  if (!titleId) return [];

  const selectedRegion = normalizeWatchRegion(region || env?.WATCH_REGION || env?.WATCHMODE_REGION || env?.STREAMING_REGION || 'US');
  const sources = await fetchWatchmodeJson(`/title/${encodeURIComponent(titleId)}/sources/`, { regions: selectedRegion }, env);
  const items = Array.isArray(sources) ? sources : [];

  return items.map((source) => {
    const label = cleanDescription(source.name || source.source_name || source.provider_name || '');
    const offerType = cleanDescription(source.type || source.format || '');
    return {
      provider: normalizeWatchProviderKey(label),
      label,
      direct: false,
      verified: true,
      url: cleanDescription(source.web_url || source.url || source.ios_url || source.android_url || ''),
      source: 'watchmode_sources',
      availability_api: 'watchmode',
      availability_confirmed: true,
      match_method: 'watchmode_sources',
      offer_type: offerType,
      offer_label: offerType ? formatWatchOfferType(offerType) : '',
      watchmode_id: String(titleId),
    };
  }).filter((item) => item.label && item.url);
}


function getStreamingAvailabilityApiKeys(env = {}) {
  return {
    direct: cleanDescription(env?.STREAMING_AVAILABILITY_API_KEY || env?.MOVIE_OF_THE_NIGHT_API_KEY || env?.STREAMING_AVAILABILITY_BEARER_TOKEN || ''),
    rapid: cleanDescription(env?.STREAMING_AVAILABILITY_RAPIDAPI_KEY || env?.RAPIDAPI_KEY || ''),
  };
}

function streamingAvailabilityRegion(env = {}, region = '') {
  return normalizeWatchRegion(region || env?.WATCH_REGION || env?.STREAMING_AVAILABILITY_REGION || env?.STREAMING_REGION || 'US').toLowerCase();
}

function streamingAvailabilityHeaders(env = {}, useRapid = false) {
  const keys = getStreamingAvailabilityApiKeys(env);
  const headers = { Accept: 'application/json' };
  if (useRapid) {
    if (keys.rapid) headers['X-RapidAPI-Key'] = keys.rapid;
    headers['X-RapidAPI-Host'] = cleanDescription(env?.STREAMING_AVAILABILITY_RAPIDAPI_HOST || 'streaming-availability.p.rapidapi.com');
  } else if (keys.direct) {
    headers.Authorization = keys.direct.startsWith('Bearer ') ? keys.direct : `Bearer ${keys.direct}`;
  }
  return headers;
}

async function fetchStreamingAvailabilityJson(path, params = {}, env = {}) {
  const keys = getStreamingAvailabilityApiKeys(env);
  if (!keys.direct && !keys.rapid) return null;

  const attempts = [];
  if (keys.direct) attempts.push({ base: cleanDescription(env?.STREAMING_AVAILABILITY_BASE_URL || 'https://api.streamingavailability.com/v4'), rapid: false });
  if (keys.rapid) attempts.push({ base: cleanDescription(env?.STREAMING_AVAILABILITY_RAPIDAPI_BASE_URL || 'https://streaming-availability.p.rapidapi.com'), rapid: true });

  for (const attempt of attempts) {
    const url = new URL(`${attempt.base.replace(/\/$/, '')}${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
    }

    try {
      const response = await fetch(url.toString(), { headers: streamingAvailabilityHeaders(env, attempt.rapid) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.warn('[watch-link] Streaming Availability request failed:', response.status, data?.message || data?.error || '');
        continue;
      }
      return data;
    } catch (error) {
      console.warn('[watch-link] Streaming Availability request failed:', error?.message || error);
    }
  }

  return null;
}

function streamingAvailabilityShowList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.shows)) return payload.shows;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.result)) return payload.result;
  if (payload.show) return [payload.show];
  if (payload.id || payload.imdbId || payload.tmdbId || payload.title) return [payload];
  return [];
}

async function findStreamingAvailabilityShow({ movie, year, imdbId, region: requestedRegion = '', env = {} }) {
  const region = streamingAvailabilityRegion(env, requestedRegion);
  const cleanImdb = cleanDescription(imdbId || '').toLowerCase();

  if (/^tt\d+$/i.test(cleanImdb)) {
    const byImdb = await fetchStreamingAvailabilityJson(`/shows/${encodeURIComponent(cleanImdb)}`, { country: region }, env);
    const matches = streamingAvailabilityShowList(byImdb);
    if (matches[0]) return matches[0];
  }

  const title = cleanDescription(movie || '');
  if (!title) return null;
  const cleanYear = cleanDescription(year || '').slice(0, 4);

  const searchAttempts = [
    ['/shows/search/title', { title, country: region, show_type: 'movie', output_language: 'en' }],
    ['/shows/search/title', { title, country: region, showType: 'movie', output_language: 'en' }],
    ['/shows/search/filters', { title, country: region, show_type: 'movie', output_language: 'en' }],
  ];

  for (const [path, params] of searchAttempts) {
    const payload = await fetchStreamingAvailabilityJson(path, params, env);
    const shows = streamingAvailabilityShowList(payload);
    if (!shows.length) continue;
    const titleNorm = normalize(title);
    const scored = shows.map((show) => {
      const showTitle = normalize(show.title || show.name || show.originalTitle || '');
      const showYear = cleanDescription(show.year || show.firstAirYear || show.releaseYear || show.releaseDate || '').slice(0, 4);
      let score = sequenceSimilarity(titleNorm, showTitle);
      if (titleNorm === showTitle) score += 0.45;
      if (cleanYear && showYear === cleanYear) score += 0.25;
      return { show, score };
    }).sort((a, b) => b.score - a.score);
    if (scored[0]?.score >= 0.55) return scored[0].show;
  }

  return null;
}

function streamingAvailabilityLogoUrl(service = {}) {
  const imageSet = service.imageSet || service.images || {};
  return cleanDescription(
    service.logo ||
    service.logoUrl ||
    service.image ||
    imageSet?.lightThemeImage ||
    imageSet?.darkThemeImage ||
    imageSet?.whiteImage ||
    imageSet?.logo ||
    ''
  );
}

function streamingAvailabilityOfferType(option = {}) {
  const type = normalize(option.type || option.streamingType || option.offerType || option.monetizationType || '');
  if (type.includes('subscription') || type.includes('flatrate') || type.includes('stream')) return 'flatrate';
  if (type.includes('rent')) return 'rent';
  if (type.includes('buy') || type.includes('purchase')) return 'buy';
  if (type.includes('ads') || type.includes('ad')) return 'ads';
  if (type.includes('free')) return 'free';
  return type || 'stream';
}

function streamingAvailabilityCountryOptions(show = {}, region = 'us') {
  const options = show.streamingOptions || show.streaming_options || show.availability || {};
  if (Array.isArray(options)) return options;
  return options[region] || options[region.toUpperCase()] || options.us || options.US || [];
}

async function findStreamingAvailabilitySources({ movie, year, imdbId, region: requestedRegion = '', env = {} }) {
  const region = streamingAvailabilityRegion(env, requestedRegion);
  const show = await findStreamingAvailabilityShow({ movie, year, imdbId, region: requestedRegion, env });
  if (!show) return [];

  const options = streamingAvailabilityCountryOptions(show, region);
  if (!Array.isArray(options) || !options.length) return [];

  return options.map((option) => {
    const service = option.service || option.provider || option.streamingService || {};
    const label = cleanDescription(service.name || service.title || option.serviceName || option.providerName || service.id || option.service || '');
    const url = cleanDescription(option.link || option.deepLink || option.watchLink || option.webUrl || option.url || option.videoLink || '');
    const offerType = streamingAvailabilityOfferType(option);
    return {
      provider: normalizeWatchProviderKey(service.id || label),
      label,
      direct: Boolean(url),
      verified: true,
      url,
      logo_url: streamingAvailabilityLogoUrl(service),
      source: 'streaming_availability_api',
      match_method: 'streaming_availability_api',
      offer_type: offerType,
      offer_label: formatWatchOfferType(offerType),
      streaming_availability_id: cleanDescription(show.id || show.imdbId || show.tmdbId || ''),
    };
  }).filter((item) => item.label && item.url);
}

// Backwards-compatible alias for old Netflix-only code paths.
function lookupNetflixTitleId(movie, year, imdbId, rawMap) {
  const netflixProvider = WATCH_PROVIDERS.find((provider) => provider.provider === 'netflix');
  return lookupProviderTitleId(movie, year, imdbId, rawMap, netflixProvider);
}


function attachNetflixTitleId(result, env = {}) {
  if (!result) return result;
  const netflixId = lookupNetflixTitleId(
    result.movie || result.title || '',
    result.year || '',
    result.imdb_id || result.imdbId || result.omdb?.imdb_id || '',
    env?.NETFLIX_TITLE_MAP,
  );
  if (!netflixId) return result;
  return {
    ...result,
    netflix_id: netflixId,
    netflixId,
    netflix_url: `https://www.netflix.com/title/${encodeURIComponent(netflixId)}`,
  };
}

// Newsletter subscriptions and scheduled Community-post notifications.
const NEWSLETTER_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


function newsletterBase64UrlEncode(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function newsletterBase64UrlDecode(value) {
  const normalized = String(value || '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function newsletterUnsubscribeToken(env, email) {
  const secret = String(env.NEWSLETTER_UNSUBSCRIBE_SECRET || '').trim();
  if (!secret) {
    throw new Error('NEWSLETTER_UNSUBSCRIBE_SECRET is not configured.');
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(String(email || '').trim().toLowerCase())
  );

  return newsletterBase64UrlEncode(new Uint8Array(signature));
}

async function newsletterTokensMatch(env, email, suppliedToken) {
  try {
    const expectedToken = await newsletterUnsubscribeToken(env, email);
    const expected = newsletterBase64UrlDecode(expectedToken);
    const supplied = newsletterBase64UrlDecode(suppliedToken);

    if (expected.length !== supplied.length) return false;
    return crypto.subtle.timingSafeEqual
      ? crypto.subtle.timingSafeEqual(expected, supplied)
      : expected.every((value, index) => value === supplied[index]);
  } catch {
    return false;
  }
}

async function buildNewsletterUnsubscribeUrl(env, email) {
  const siteUrl = normalizeBaseUrl(
    env.SITE_URL || env.APP_URL || 'https://biologicalmachinery.com'
  );
  const url = new URL('/unsubscribe.html', `${siteUrl}/`);
  url.searchParams.set('email', String(email || '').trim().toLowerCase());
  url.searchParams.set('token', await newsletterUnsubscribeToken(env, email));
  return url.toString();
}

async function unsubscribeFromNewsletter(request, env) {
  if (!env.DB) {
    return json({ ok: false, error: 'Newsletter database is not configured.' }, 500);
  }

  const body = await safeJson(request);
  const email = String(body?.email || '').trim().toLowerCase();
  const token = String(body?.token || '').trim();

  if (!NEWSLETTER_EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: 'The unsubscribe link is invalid.' }, 400);
  }

  if (!token || !(await newsletterTokensMatch(env, email, token))) {
    return json({ ok: false, error: 'The unsubscribe link is invalid or expired.' }, 403);
  }

  await env.DB.prepare(`
    UPDATE newsletter_subscribers
    SET active = 0, updated_at = unixepoch()
    WHERE lower(email) = ?
  `).bind(email).run();

  return json({
    ok: true,
    message: 'You have been unsubscribed from Community updates.'
  });
}

async function subscribeToNewsletter(request, env) {
  if (!env.DB) {
    return json({ ok: false, error: 'Newsletter database is not configured.' }, 500);
  }

  const body = await safeJson(request);
  const email = String(body?.email || '').trim().toLowerCase();

  if (!NEWSLETTER_EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  }

  const existingSubscriber = await env.DB.prepare(`
    SELECT active
    FROM newsletter_subscribers
    WHERE lower(email) = ?
    LIMIT 1
  `).bind(email).first();

  if (existingSubscriber && Number(existingSubscriber.active) === 1) {
    return json({
      ok: true,
      alreadySubscribed: true,
      message: 'This email is already subscribed.',
      unsubscribeUrl: await buildNewsletterUnsubscribeUrl(env, email)
    });
  }

  await env.DB.prepare(`
    INSERT INTO newsletter_subscribers (email, active, created_at, updated_at)
    VALUES (?, 1, unixepoch(), unixepoch())
    ON CONFLICT(email) DO UPDATE SET
      active = 1,
      updated_at = unixepoch()
  `).bind(email).run();

  try {
    await sendNewsletterConfirmationEmail(env, email);
  } catch (error) {
    console.error('Newsletter confirmation email failed', error);
    return json({
      ok: false,
      error: 'Your subscription was saved, but the confirmation email could not be sent.'
    }, 502);
  }

  return json({
    ok: true,
    alreadySubscribed: false,
    confirmationSent: true
  });
}

async function sendNewsletterConfirmationEmail(env, to) {
  if (!env.RESEND_API_KEY || !env.NEWSLETTER_FROM) {
    throw new Error('Newsletter email settings are incomplete.');
  }

  const siteUrl = normalizeBaseUrl(env.SITE_URL || env.APP_URL || 'https://biologicalmachinery.com');
  const communityUrl = new URL('/updates.html', `${siteUrl}/`).toString();
  const unsubscribeUrl = await buildNewsletterUnsubscribeUrl(env, to);
  const logoUrl = new URL('/WebIcon.svg', `${siteUrl}/`).toString();

  const html = `
    <!doctype html>
    <html lang="en">
      <body style="margin:0;padding:0;background:#020607;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
          Welcome to the Biological Machinery newsletter.
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#020607;">
          <tr>
            <td align="center" style="padding:28px 14px;">
              <table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0"
                style="width:100%;max-width:620px;border:1px solid #183139;border-radius:26px;background:#091014;overflow:hidden;">
                <tr>
                  <td style="height:8px;background:#9beef6;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:34px 28px 32px;font-family:Arial,Helvetica,sans-serif;color:#f7fbff;">
                    <img src="${escapeHtml(logoUrl)}" width="60" height="60" alt="Biological Machinery"
                      style="display:block;width:60px;height:60px;object-fit:contain;border:0;margin:0 0 20px;">

                    <p style="margin:0 0 8px;color:#9beef6;font-size:12px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;">
                      Biological Machinery
                    </p>
                    <h1 style="margin:0;color:#ffffff;font-size:34px;line-height:1.08;">
                      Welcome to the newsletter
                    </h1>

                    <p style="margin:18px 0 0;color:#d9e7ea;font-size:16px;line-height:1.7;">
                      You will be among the first to hear about unique updates,
                      community posts, special events, questionnaires, and selected
                      messages that may not appear directly on the website.
                    </p>
                    <p style="margin:14px 0 0;color:#b8c7ca;font-size:15px;line-height:1.7;">
                      I am glad to have you onboard.
                    </p>

                    <div style="margin:28px 0 0;padding:20px;border:1px solid #20373e;border-radius:18px;background:#071217;">
                      <p style="margin:0;color:#ffffff;font-size:16px;font-weight:800;">Explore the Community</p>
                      <p style="margin:8px 0 0;color:#aebdc1;font-size:14px;line-height:1.6;">
                        Read new posts, follow projects, and see what Biological Machinery is building.
                      </p>
                    </div>

                    <div style="margin-top:28px;text-align:center;">
                      <a href="${escapeHtml(communityUrl)}"
                        style="display:inline-block;padding:14px 24px;border-radius:999px;background:#9beef6;color:#061114;font-size:15px;font-weight:900;text-decoration:none;">
                        Open Community
                      </a>
                    </div>

                    <hr style="margin:30px 0 18px;border:0;border-top:1px solid #22343a;">
                    <p style="margin:0;color:#829397;font-size:12px;line-height:1.6;text-align:center;">
                      You received this email because this address subscribed to Biological Machinery updates.
                    </p>
                    <p style="margin:8px 0 0;text-align:center;">
                      <a href="${escapeHtml(unsubscribeUrl)}" style="color:#9beef6;font-size:12px;text-decoration:underline;">
                        Unsubscribe
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'BiologicalMachineryNewsletter/1.0'
    },
    body: JSON.stringify({
      from: env.NEWSLETTER_FROM,
      to: [to],
      subject: "Welcome to Biological Machinery's Newsletter!",
      html
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Email provider returned ${response.status}: ${detail}`);
  }
}

async function sendCommunityNewsletterUpdates(env) {
  if (!env.DB) throw new Error('Newsletter database is not configured.');
  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_API_KEY) {
    throw new Error('Firebase newsletter settings are incomplete.');
  }
  if (!env.RESEND_API_KEY || !env.NEWSLETTER_FROM) {
    throw new Error('Newsletter email settings are incomplete.');
  }

  const posts = await fetchNewsletterCommunityPosts(env);
  if (!posts.length) return;

  posts.sort(compareNewsletterPostsNewestFirst);
  const latest = posts[0];
  const state = await env.DB.prepare(
    "SELECT value FROM newsletter_state WHERE key = 'last_post_id'"
  ).first();

  // On the first scheduled run, remember the current post without emailing old content.
  if (!state?.value) {
    await setNewsletterState(env, latest.id);
    return;
  }

  if (String(state.value) === String(latest.id)) return;

  const subscribers = await env.DB.prepare(
    'SELECT email FROM newsletter_subscribers WHERE active = 1 ORDER BY id'
  ).all();

  for (const subscriber of subscribers.results || []) {
    await sendNewsletterEmail(env, String(subscriber.email || ''), latest);
  }

  await setNewsletterState(env, latest.id);
}

async function fetchNewsletterCommunityPosts(env) {
  const endpoint = new URL(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/databases/(default)/documents/blogs`
  );
  endpoint.searchParams.set('key', env.FIREBASE_API_KEY);
  endpoint.searchParams.set('pageSize', '100');

  const response = await fetch(endpoint.href, {
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Firestore returned ${response.status}: ${detail}`);
  }

  const payload = await response.json();
  return (payload.documents || []).map((document) => {
    const fields = document.fields || {};
    const id = String(document.name || '').split('/').pop() || '';
    const title = newsletterFirestoreFieldValue(fields.title)
      || newsletterFirestoreFieldValue(fields.heading)
      || newsletterFirestoreFieldValue(fields.name)
      || 'New Community post';
    const body = newsletterFirestoreFieldValue(fields.body)
      || newsletterFirestoreFieldValue(fields.text)
      || newsletterFirestoreFieldValue(fields.content)
      || newsletterFirestoreFieldValue(fields.description)
      || '';
    const publishedAtRaw = newsletterFirestoreFieldValue(fields.createdAt)
      || newsletterFirestoreFieldValue(fields.date)
      || newsletterFirestoreFieldValue(fields.publishedAt)
      || newsletterFirestoreFieldValue(fields.updatedAt)
      || 0;

    const parsedDate = new Date(publishedAtRaw).getTime();
    const publishedAt = Number.isFinite(parsedDate) && parsedDate > 0
      ? parsedDate
      : Number(publishedAtRaw) || 0;

    const explicitOrderRaw = newsletterFirestoreFieldValue(fields.order)
      || newsletterFirestoreFieldValue(fields.index)
      || newsletterFirestoreFieldValue(fields.position)
      || newsletterFirestoreFieldValue(fields.rank);
    const explicitOrder = Number(explicitOrderRaw);

    return {
      id,
      title: String(title),
      body: String(body),
      publishedAt,
      explicitOrder: Number.isFinite(explicitOrder) ? explicitOrder : null
    };
  }).filter((post) => post.id);
}

function compareNewsletterPostsNewestFirst(a, b) {
  if (a.explicitOrder !== null && b.explicitOrder !== null && a.explicitOrder !== b.explicitOrder) {
    return b.explicitOrder - a.explicitOrder;
  }

  const aNumericId = /^\d+$/.test(String(a.id)) ? Number(a.id) : null;
  const bNumericId = /^\d+$/.test(String(b.id)) ? Number(b.id) : null;
  if (aNumericId !== null && bNumericId !== null && aNumericId !== bNumericId) {
    return bNumericId - aNumericId;
  }

  if (a.publishedAt !== b.publishedAt) return b.publishedAt - a.publishedAt;
  if (a.explicitOrder !== null && b.explicitOrder === null) return -1;
  if (b.explicitOrder !== null && a.explicitOrder === null) return 1;
  if (aNumericId !== null && bNumericId === null) return -1;
  if (bNumericId !== null && aNumericId === null) return 1;

  return String(b.id).localeCompare(String(a.id), undefined, { numeric: true, sensitivity: 'base' });
}

function newsletterFirestoreFieldValue(field) {
  if (!field) return '';
  if ('stringValue' in field) return field.stringValue;
  if ('timestampValue' in field) return field.timestampValue;
  if ('integerValue' in field) return Number(field.integerValue);
  if ('doubleValue' in field) return Number(field.doubleValue);
  if ('booleanValue' in field) return Boolean(field.booleanValue);
  return '';
}

async function sendNewsletterEmail(env, to, post) {
  if (!NEWSLETTER_EMAIL_RE.test(to)) return;

  const siteUrl = normalizeBaseUrl(env.SITE_URL || env.APP_URL || 'https://biologicalmachinery.com');
  const postUrl = new URL('/updates.html', `${siteUrl}/`).toString();
  const unsubscribeUrl = await buildNewsletterUnsubscribeUrl(env, to);
  const logoUrl = new URL('/WebIcon.svg', `${siteUrl}/`).toString();
  const preview = String(post.body || '').slice(0, 600);

  const html = `
    <!doctype html>
    <html lang="en">
      <body style="margin:0;padding:0;background:#020607;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
          ${escapeHtml(preview || post.title)}
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#020607;">
          <tr>
            <td align="center" style="padding:28px 14px;">
              <table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0"
                style="width:100%;max-width:620px;border:1px solid #183139;border-radius:26px;background:#091014;overflow:hidden;">
                <tr>
                  <td style="height:8px;background:#9beef6;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:32px 28px;font-family:Arial,Helvetica,sans-serif;color:#f7fbff;">
                    <img src="${escapeHtml(logoUrl)}" width="52" height="52" alt="Biological Machinery"
                      style="display:block;width:52px;height:52px;object-fit:contain;border:0;margin:0 0 18px;">
                    <p style="margin:0 0 8px;color:#9beef6;font-size:12px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;">
                      New Community Update
                    </p>
                    <h1 style="margin:0;color:#ffffff;font-size:30px;line-height:1.15;">
                      ${escapeHtml(post.title)}
                    </h1>

                    ${preview ? `
                      <div style="margin:22px 0 0;padding:20px;border:1px solid #20373e;border-radius:18px;background:#071217;">
                        <p style="margin:0;color:#d9e7ea;font-size:15px;line-height:1.75;">
                          ${escapeHtml(preview)}
                        </p>
                      </div>` : ''}

                    <div style="margin-top:28px;text-align:center;">
                      <a href="${escapeHtml(postUrl)}"
                        style="display:inline-block;padding:14px 24px;border-radius:999px;background:#9beef6;color:#061114;font-size:15px;font-weight:900;text-decoration:none;">
                        Read the update
                      </a>
                    </div>

                    <hr style="margin:30px 0 18px;border:0;border-top:1px solid #22343a;">
                    <p style="margin:0;color:#829397;font-size:12px;line-height:1.6;text-align:center;">
                      You received this email because this address subscribed to Biological Machinery updates.
                    </p>
                    <p style="margin:8px 0 0;text-align:center;">
                      <a href="${escapeHtml(unsubscribeUrl)}" style="color:#9beef6;font-size:12px;text-decoration:underline;">
                        Unsubscribe
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'BiologicalMachineryNewsletter/1.0'
    },
    body: JSON.stringify({
      from: env.NEWSLETTER_FROM,
      to: [to],
      subject: `Biological Machinery Newsletter: ${post.title}`,
      html
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Email provider returned ${response.status}: ${detail}`);
  }
}

// Dance-only newsletter. This subscription list is intentionally separate from
// the general Community newsletter so users can opt into dancing updates only.

const DANCE_BELT_LISTS = {
  release: {
    table: 'dance_belt_release_subscribers',
    label: 'Dance Belt release notifications',
    unsubscribePage: '/unsubscribe-dance-belt-release.html',
    subject: 'You are signed up for Dance Belt release notifications',
    welcome: 'You will receive an email when Dance Belt release information becomes available.'
  },
  development: {
    table: 'dance_belt_development_subscribers',
    label: 'Dance Belt development participation',
    unsubscribePage: '/unsubscribe-dance-belt-development.html',
    subject: 'You are signed up to participate in Dance Belt development',
    welcome: 'You will receive emails about opportunities to participate in Dance Belt development.'
  }
};

function getDanceBeltListConfig(list) {
  return DANCE_BELT_LISTS[String(list || '').toLowerCase()] || null;
}

async function danceBeltUnsubscribeToken(env, list, email) {
  const config = getDanceBeltListConfig(list);
  if (!config) throw new Error('Unknown Dance Belt list.');

  const secret = String(
    env.DANCE_BELT_UNSUBSCRIBE_SECRET ||
    env.NEWSLETTER_UNSUBSCRIBE_SECRET ||
    ''
  ).trim();

  if (!secret) throw new Error('DANCE_BELT_UNSUBSCRIBE_SECRET is not configured.');

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(
      `dance-belt:${list}:${String(email || '').trim().toLowerCase()}`
    )
  );

  return newsletterBase64UrlEncode(new Uint8Array(signature));
}

async function danceBeltTokensMatch(env, list, email, suppliedToken) {
  try {
    const expected = newsletterBase64UrlDecode(
      await danceBeltUnsubscribeToken(env, list, email)
    );
    const supplied = newsletterBase64UrlDecode(suppliedToken);
    if (expected.length !== supplied.length) return false;

    return crypto.subtle.timingSafeEqual
      ? crypto.subtle.timingSafeEqual(expected, supplied)
      : expected.every((value, index) => value === supplied[index]);
  } catch {
    return false;
  }
}

async function buildDanceBeltUnsubscribeUrl(env, list, email) {
  const config = getDanceBeltListConfig(list);
  if (!config) throw new Error('Unknown Dance Belt list.');

  const siteUrl = normalizeBaseUrl(
    env.SITE_URL || env.APP_URL || 'https://biologicalmachinery.com'
  );
  const url = new URL(config.unsubscribePage, `${siteUrl}/`);
  url.searchParams.set('email', String(email || '').trim().toLowerCase());
  url.searchParams.set('token', await danceBeltUnsubscribeToken(env, list, email));
  return url.toString();
}

async function subscribeToDanceBeltList(request, env, list) {
  const config = getDanceBeltListConfig(list);
  if (!config) return json({ ok: false, error: 'Unknown Dance Belt list.' }, 404);
  if (!env.DB) return json({ ok: false, error: 'Newsletter database is not configured.' }, 500);

  const body = await safeJson(request);
  const email = String(body?.email || '').trim().toLowerCase();

  if (!NEWSLETTER_EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  }

  const existing = await env.DB.prepare(
    `SELECT active FROM ${config.table} WHERE lower(email) = ? LIMIT 1`
  ).bind(email).first();

  if (existing && Number(existing.active) === 1) {
    return json({
      ok: true,
      alreadySubscribed: true,
      message: `This email is already signed up for ${config.label}.`,
      unsubscribeUrl: await buildDanceBeltUnsubscribeUrl(env, list, email)
    });
  }

  await env.DB.prepare(`
    INSERT INTO ${config.table} (email, active, created_at, updated_at)
    VALUES (?, 1, unixepoch(), unixepoch())
    ON CONFLICT(email) DO UPDATE SET active = 1, updated_at = unixepoch()
  `).bind(email).run();

  try {
    await sendDanceBeltWelcomeEmail(env, list, email);
  } catch (error) {
    console.error('Dance Belt confirmation email failed', error);
    return json({
      ok: false,
      error: 'Your signup was saved, but the confirmation email could not be sent.'
    }, 502);
  }

  return json({ ok: true, alreadySubscribed: false, confirmationSent: true });
}

async function unsubscribeFromDanceBeltList(request, env, list) {
  const config = getDanceBeltListConfig(list);
  if (!config) return json({ ok: false, error: 'Unknown Dance Belt list.' }, 404);
  if (!env.DB) return json({ ok: false, error: 'Newsletter database is not configured.' }, 500);

  const body = await safeJson(request);
  const email = String(body?.email || '').trim().toLowerCase();
  const token = String(body?.token || '').trim();

  if (!NEWSLETTER_EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: 'The unsubscribe link is invalid.' }, 400);
  }

  if (!token || !(await danceBeltTokensMatch(env, list, email, token))) {
    return json({ ok: false, error: 'The unsubscribe link is invalid or expired.' }, 403);
  }

  await env.DB.prepare(`
    UPDATE ${config.table}
    SET active = 0, updated_at = unixepoch()
    WHERE lower(email) = ?
  `).bind(email).run();

  return json({ ok: true, message: `You have been unsubscribed from ${config.label}.` });
}

async function sendDanceBeltWelcomeEmail(env, list, to) {
  const config = getDanceBeltListConfig(list);
  if (!config) throw new Error('Unknown Dance Belt list.');

  const from = env.DANCE_BELT_FROM || env.NEWSLETTER_FROM;
  if (!env.RESEND_API_KEY || !from) {
    throw new Error('Dance Belt email settings are incomplete.');
  }

  const siteUrl = normalizeBaseUrl(
    env.SITE_URL || env.APP_URL || 'https://biologicalmachinery.com'
  );
  const unsubscribeUrl = await buildDanceBeltUnsubscribeUrl(env, list, to);
  const isDevelopmentParticipation = list === 'development';

  const imageUrl = (path) =>
    `${siteUrl}/${String(path || '').replace(/^\/+/, '')}`;

  const logoImage = imageUrl('WebIcon.svg');
  const danceImage = imageUrl('dancingPhotos/dancing_one.png');
  const vibBraceletImage = imageUrl('productPhotos/vibbracelet.png');
  const vibMiniImage = imageUrl('productPhotos/vibmini.png');
  const vibImage = imageUrl('productPhotos/vib.png');
  const vibVestImage = imageUrl('productPhotos/vibvest.png');

  const developmentRewardSection = isDevelopmentParticipation
    ? `
      <div style="margin:28px 0 0;padding:24px;border:1px solid #b9f5fb;border-radius:20px;background:#071217;">
        <p style="margin:0 0 8px;color:#9beef6;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;">
          Participation reward
        </p>
        <h2 style="margin:0 0 12px;color:#ffffff;font-size:23px;line-height:1.2;">
          Help develop Dance Belt and receive exclusive discounts
        </h2>
        <p style="margin:0;color:#d9e7ea;font-size:15px;line-height:1.65;">
          Successful development requires real human movement data. Participation
          while wearing <strong style="color:#ffffff;">Dance Belt</strong> will be
          rewarded with a coupon for:
        </p>

        <div style="margin:18px 0 0;padding:18px;border-radius:16px;background:#9beef6;color:#061114;text-align:center;">
          <div style="font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">
            Your Dance Belt
          </div>
          <div style="margin-top:4px;font-size:32px;font-weight:900;line-height:1;">
            50% OFF
          </div>
        </div>

        <p style="margin:18px 0 10px;color:#d9e7ea;font-size:14px;font-weight:700;text-align:center;">
          Plus choose one additional product discount
        </p>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td width="50%" valign="top" style="padding:5px;">
              <div style="min-height:194px;padding:12px;border:1px solid #26383e;border-radius:14px;background:#0d1b20;text-align:center;">
                <img src="${escapeHtml(vibBraceletImage)}" width="118" alt="Vib Bracelet"
                  style="display:block;width:118px;max-width:100%;height:100px;object-fit:contain;margin:0 auto 8px;border:0;">
                <div style="color:#ffffff;font-size:14px;font-weight:800;">Vib Bracelet</div>
                <div style="margin-top:4px;color:#9beef6;font-size:20px;font-weight:900;">50% OFF</div>
              </div>
            </td>
            <td width="50%" valign="top" style="padding:5px;">
              <div style="min-height:194px;padding:12px;border:1px solid #26383e;border-radius:14px;background:#0d1b20;text-align:center;">
                <img src="${escapeHtml(vibMiniImage)}" width="118" alt="Vib Mini"
                  style="display:block;width:118px;max-width:100%;height:100px;object-fit:contain;margin:0 auto 8px;border:0;">
                <div style="color:#ffffff;font-size:14px;font-weight:800;">Vib Mini</div>
                <div style="margin-top:4px;color:#9beef6;font-size:20px;font-weight:900;">50% OFF</div>
              </div>
            </td>
          </tr>
          <tr>
            <td width="50%" valign="top" style="padding:5px;">
              <div style="min-height:194px;padding:12px;border:1px solid #26383e;border-radius:14px;background:#0d1b20;text-align:center;">
                <img src="${escapeHtml(vibImage)}" width="118" alt="Vib"
                  style="display:block;width:118px;max-width:100%;height:100px;object-fit:contain;margin:0 auto 8px;border:0;">
                <div style="color:#ffffff;font-size:14px;font-weight:800;">Vib</div>
                <div style="margin-top:4px;color:#9beef6;font-size:20px;font-weight:900;">50% OFF</div>
              </div>
            </td>
            <td width="50%" valign="top" style="padding:5px;">
              <div style="min-height:194px;padding:12px;border:1px solid #26383e;border-radius:14px;background:#0d1b20;text-align:center;">
                <img src="${escapeHtml(vibVestImage)}" width="118" alt="Vib Vest"
                  style="display:block;width:118px;max-width:100%;height:100px;object-fit:contain;margin:0 auto 8px;border:0;">
                <div style="color:#ffffff;font-size:14px;font-weight:800;">Vib Vest</div>
                <div style="margin-top:4px;color:#9beef6;font-size:20px;font-weight:900;">30% OFF</div>
              </div>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 0;color:#aebdc1;font-size:12px;line-height:1.55;text-align:center;">
          Reward eligibility and coupon delivery are connected to completed,
          approved participation while wearing Dance Belt.
        </p>
      </div>`
    : '';

  const html = `
    <!doctype html>
    <html lang="en">
      <body style="margin:0;padding:0;background:#020607;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
          ${escapeHtml(config.welcome)}
        </div>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="width:100%;background:#020607;">
          <tr>
            <td align="center" style="padding:28px 14px;">
              <table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0"
                style="width:100%;max-width:620px;border:1px solid #183139;border-radius:26px;background:#091014;overflow:hidden;">
                <tr>
                  <td>
                    <img src="${escapeHtml(danceImage)}" width="620" alt="Dance Belt development"
                      style="display:block;width:100%;max-width:620px;height:230px;object-fit:cover;object-position:center;border:0;">
                  </td>
                </tr>

                <tr>
                  <td style="padding:30px 28px 32px;font-family:Arial,Helvetica,sans-serif;color:#f7fbff;">
                    <div style="margin:0 0 18px;">
                      <img src="${escapeHtml(logoImage)}" width="58" height="58" alt="Biological Machinery"
                        style="display:block;width:58px;height:58px;object-fit:contain;border:0;">
                    </div>

                    <p style="margin:0 0 8px;color:#9beef6;font-size:12px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;">
                      Biological Machinery
                    </p>

                    <h1 style="margin:0;color:#ffffff;font-size:34px;line-height:1.08;">
                      Dance Belt
                    </h1>

                    <p style="margin:14px 0 0;color:#d9e7ea;font-size:17px;line-height:1.6;">
                      ${escapeHtml(config.welcome)}
                    </p>

                    <p style="margin:16px 0 0;color:#b8c7ca;font-size:15px;line-height:1.7;">
                      Dance Belt uses vibrational stimulation technology to support
                      improved overall body control by stimulating the hips and
                      related regions.
                    </p>

                    ${developmentRewardSection}

                    <div style="margin-top:28px;text-align:center;">
                      <a href="${escapeHtml(siteUrl)}"
                        style="display:inline-block;padding:14px 24px;border-radius:999px;background:#9beef6;color:#061114;font-size:15px;font-weight:900;text-decoration:none;">
                        Visit Biological Machinery
                      </a>
                    </div>

                    <hr style="margin:30px 0 18px;border:0;border-top:1px solid #22343a;">

                    <p style="margin:0;color:#829397;font-size:12px;line-height:1.6;text-align:center;">
                      You received this email because this address signed up for
                      ${escapeHtml(config.label)}.
                    </p>

                    <p style="margin:8px 0 0;text-align:center;">
                      <a href="${escapeHtml(unsubscribeUrl)}"
                        style="color:#9beef6;font-size:12px;text-decoration:underline;">
                        Unsubscribe
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'BiologicalMachineryDanceBelt/1.0'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: config.subject,
      html
    })
  });

  if (!response.ok) {
    throw new Error(`Email provider returned ${response.status}: ${await response.text()}`);
  }
}

async function danceNewsletterUnsubscribeToken(env, email) {
  const secret = String(env.DANCE_NEWSLETTER_UNSUBSCRIBE_SECRET || env.NEWSLETTER_UNSUBSCRIBE_SECRET || '').trim();
  if (!secret) throw new Error('DANCE_NEWSLETTER_UNSUBSCRIBE_SECRET is not configured.');

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`dance:${String(email || '').trim().toLowerCase()}`)
  );
  return newsletterBase64UrlEncode(new Uint8Array(signature));
}

async function danceNewsletterTokensMatch(env, email, suppliedToken) {
  try {
    const expected = newsletterBase64UrlDecode(await danceNewsletterUnsubscribeToken(env, email));
    const supplied = newsletterBase64UrlDecode(suppliedToken);
    if (expected.length !== supplied.length) return false;
    return crypto.subtle.timingSafeEqual
      ? crypto.subtle.timingSafeEqual(expected, supplied)
      : expected.every((value, index) => value === supplied[index]);
  } catch {
    return false;
  }
}

async function buildDanceNewsletterUnsubscribeUrl(env, email) {
  const siteUrl = normalizeBaseUrl(env.SITE_URL || env.APP_URL || 'https://biologicalmachinery.com');
  const url = new URL('/unsubscribe-dance.html', `${siteUrl}/`);
  url.searchParams.set('email', String(email || '').trim().toLowerCase());
  url.searchParams.set('token', await danceNewsletterUnsubscribeToken(env, email));
  return url.toString();
}

async function subscribeToDanceNewsletter(request, env) {
  if (!env.DB) return json({ ok: false, error: 'Newsletter database is not configured.' }, 500);

  const body = await safeJson(request);
  const email = String(body?.email || '').trim().toLowerCase();
  if (!NEWSLETTER_EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  }

  const existing = await env.DB.prepare(`
    SELECT active FROM dance_newsletter_subscribers WHERE lower(email) = ? LIMIT 1
  `).bind(email).first();

  if (existing && Number(existing.active) === 1) {
    return json({
      ok: true,
      alreadySubscribed: true,
      message: 'This email is already subscribed to dancing updates.',
      unsubscribeUrl: await buildDanceNewsletterUnsubscribeUrl(env, email)
    });
  }

  await env.DB.prepare(`
    INSERT INTO dance_newsletter_subscribers (email, active, created_at, updated_at)
    VALUES (?, 1, unixepoch(), unixepoch())
    ON CONFLICT(email) DO UPDATE SET active = 1, updated_at = unixepoch()
  `).bind(email).run();

  try {
    await sendDanceNewsletterWelcomeEmail(env, email);
  } catch (error) {
    console.error('Dance newsletter welcome email failed', error);
    return json({
      ok: false,
      error: 'Your dance subscription was saved, but the welcome email could not be sent.'
    }, 502);
  }

  return json({ ok: true, alreadySubscribed: false, confirmationSent: true });
}

async function unsubscribeFromDanceNewsletter(request, env) {
  if (!env.DB) return json({ ok: false, error: 'Newsletter database is not configured.' }, 500);

  const body = await safeJson(request);
  const email = String(body?.email || '').trim().toLowerCase();
  const token = String(body?.token || '').trim();

  if (!NEWSLETTER_EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: 'The unsubscribe link is invalid.' }, 400);
  }
  if (!token || !(await danceNewsletterTokensMatch(env, email, token))) {
    return json({ ok: false, error: 'The unsubscribe link is invalid or expired.' }, 403);
  }

  await env.DB.prepare(`
    UPDATE dance_newsletter_subscribers
    SET active = 0, updated_at = unixepoch()
    WHERE lower(email) = ?
  `).bind(email).run();

  return json({ ok: true, message: 'You have been unsubscribed from dancing updates.' });
}

async function sendDanceNewsletterWelcomeEmail(env, to) {
  if (!env.RESEND_API_KEY || !(env.DANCE_NEWSLETTER_FROM || env.NEWSLETTER_FROM)) {
    throw new Error('Dance newsletter email settings are incomplete.');
  }

  const siteUrl = normalizeBaseUrl(env.SITE_URL || env.APP_URL || 'https://biologicalmachinery.com');
  const danceUrl = new URL('/dancegroup.html', `${siteUrl}/`).toString();
  const unsubscribeUrl = await buildDanceNewsletterUnsubscribeUrl(env, to);
  const logoUrl = new URL('/WebIcon.svg', `${siteUrl}/`).toString();
  const danceImage = new URL('/dancingPhotos/dancing_one.png', `${siteUrl}/`).toString();

  const html = `
    <!doctype html>
    <html lang="en">
      <body style="margin:0;padding:0;background:#020607;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
          Welcome to Biological Machinery Dancing Updates.
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#020607;">
          <tr>
            <td align="center" style="padding:28px 14px;">
              <table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0"
                style="width:100%;max-width:620px;border:1px solid #183139;border-radius:26px;background:#091014;overflow:hidden;">
                <tr>
                  <td>
                    <img src="${escapeHtml(danceImage)}" width="620" alt="Dancing at Biological Machinery"
                      style="display:block;width:100%;max-width:620px;height:230px;object-fit:cover;object-position:center;border:0;">
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px 28px 32px;font-family:Arial,Helvetica,sans-serif;color:#f7fbff;">
                    <img src="${escapeHtml(logoUrl)}" width="56" height="56" alt="Biological Machinery"
                      style="display:block;width:56px;height:56px;object-fit:contain;border:0;margin:0 0 18px;">
                    <p style="margin:0 0 8px;color:#9beef6;font-size:12px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;">
                      Biological Machinery
                    </p>
                    <h1 style="margin:0;color:#ffffff;font-size:34px;line-height:1.08;">
                      Welcome to Dancing Updates
                    </h1>
                    <p style="margin:18px 0 0;color:#d9e7ea;font-size:16px;line-height:1.7;">
                      Thank you for joining. You will receive updates about dancing
                      events, new dance stories, and other dance-related announcements.
                    </p>
                    <p style="margin:14px 0 0;color:#aebdc1;font-size:14px;line-height:1.7;">
                      This list is separate from the general Biological Machinery newsletter.
                    </p>

                    <div style="margin-top:28px;text-align:center;">
                      <a href="${escapeHtml(danceUrl)}"
                        style="display:inline-block;padding:14px 24px;border-radius:999px;background:#9beef6;color:#061114;font-size:15px;font-weight:900;text-decoration:none;">
                        Visit DanceGroup
                      </a>
                    </div>

                    <hr style="margin:30px 0 18px;border:0;border-top:1px solid #22343a;">
                    <p style="margin:0;color:#829397;font-size:12px;line-height:1.6;text-align:center;">
                      You received this email because this address subscribed to dancing updates.
                    </p>
                    <p style="margin:8px 0 0;text-align:center;">
                      <a href="${escapeHtml(unsubscribeUrl)}" style="color:#9beef6;font-size:12px;text-decoration:underline;">
                        Unsubscribe from dancing updates
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'BiologicalMachineryDanceNewsletter/1.0'
    },
    body: JSON.stringify({
      from: env.DANCE_NEWSLETTER_FROM || env.NEWSLETTER_FROM,
      to: [to],
      subject: 'Welcome to Biological Machinery Dancing Updates!',
      html
    })
  });

  if (!response.ok) {
    throw new Error(`Email provider returned ${response.status}: ${await response.text()}`);
  }
}

async function sendDanceNewsletterUpdates(env) {
  if (!env.DB || !env.FIREBASE_PROJECT_ID || !env.FIREBASE_API_KEY) return;
  if (!env.RESEND_API_KEY || !(env.DANCE_NEWSLETTER_FROM || env.NEWSLETTER_FROM)) return;

  const endpoint = new URL(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/databases/(default)/documents/danceEvents`);
  endpoint.searchParams.set('key', env.FIREBASE_API_KEY);
  endpoint.searchParams.set('pageSize', '100');
  const response = await fetch(endpoint.href, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Dance events Firestore returned ${response.status}: ${await response.text()}`);

  const payload = await response.json();
  const events = (payload.documents || []).map((document) => {
    const fields = document.fields || {};
    const id = String(document.name || '').split('/').pop() || '';
    const title = newsletterFirestoreFieldValue(fields.title) || newsletterFirestoreFieldValue(fields.name) || 'New dancing event';
    const body = newsletterFirestoreFieldValue(fields.body) || newsletterFirestoreFieldValue(fields.description) || newsletterFirestoreFieldValue(fields.text) || '';
    const rawDate = newsletterFirestoreFieldValue(fields.createdAt) || newsletterFirestoreFieldValue(fields.date) || newsletterFirestoreFieldValue(fields.publishedAt) || 0;
    const parsed = new Date(rawDate).getTime();
    return { id, title, body, publishedAt: Number.isFinite(parsed) ? parsed : Number(rawDate) || 0 };
  }).sort((a, b) => b.publishedAt - a.publishedAt || String(b.id).localeCompare(String(a.id), undefined, { numeric: true }));
  if (!events.length) return;

  const latest = events[0];
  const state = await env.DB.prepare("SELECT value FROM dance_newsletter_state WHERE key = 'last_event_id'").first();
  if (!state?.value) {
    await setDanceNewsletterState(env, latest.id);
    return;
  }
  if (String(state.value) === String(latest.id)) return;

  const subscribers = await env.DB.prepare('SELECT email FROM dance_newsletter_subscribers WHERE active = 1 ORDER BY id').all();
  for (const subscriber of subscribers.results || []) {
    await sendDanceNewsletterEventEmail(env, String(subscriber.email || ''), latest);
  }
  await setDanceNewsletterState(env, latest.id);
}

async function sendDanceNewsletterEventEmail(env, to, event) {
  if (!NEWSLETTER_EMAIL_RE.test(to)) return;

  const siteUrl = normalizeBaseUrl(env.SITE_URL || env.APP_URL || 'https://biologicalmachinery.com');
  const danceUrl = new URL('/dancegroup.html', `${siteUrl}/`).toString();
  const unsubscribeUrl = await buildDanceNewsletterUnsubscribeUrl(env, to);
  const logoUrl = new URL('/WebIcon.svg', `${siteUrl}/`).toString();
  const danceImage = new URL('/dancingPhotos/dancing_two.png', `${siteUrl}/`).toString();
  const preview = String(event.body || '').slice(0, 600);

  const html = `
    <!doctype html>
    <html lang="en">
      <body style="margin:0;padding:0;background:#020607;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
          ${escapeHtml(preview || event.title)}
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#020607;">
          <tr>
            <td align="center" style="padding:28px 14px;">
              <table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0"
                style="width:100%;max-width:620px;border:1px solid #183139;border-radius:26px;background:#091014;overflow:hidden;">
                <tr>
                  <td>
                    <img src="${escapeHtml(danceImage)}" width="620" alt="Dancing update"
                      style="display:block;width:100%;max-width:620px;height:220px;object-fit:cover;object-position:center;border:0;">
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px 28px 32px;font-family:Arial,Helvetica,sans-serif;color:#f7fbff;">
                    <img src="${escapeHtml(logoUrl)}" width="52" height="52" alt="Biological Machinery"
                      style="display:block;width:52px;height:52px;object-fit:contain;border:0;margin:0 0 18px;">
                    <p style="margin:0 0 8px;color:#9beef6;font-size:12px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;">
                      Dancing Update
                    </p>
                    <h1 style="margin:0;color:#ffffff;font-size:30px;line-height:1.15;">
                      ${escapeHtml(event.title)}
                    </h1>

                    ${preview ? `
                      <div style="margin:22px 0 0;padding:20px;border:1px solid #20373e;border-radius:18px;background:#071217;">
                        <p style="margin:0;color:#d9e7ea;font-size:15px;line-height:1.75;">
                          ${escapeHtml(preview)}
                        </p>
                      </div>` : ''}

                    <div style="margin-top:28px;text-align:center;">
                      <a href="${escapeHtml(danceUrl)}"
                        style="display:inline-block;padding:14px 24px;border-radius:999px;background:#9beef6;color:#061114;font-size:15px;font-weight:900;text-decoration:none;">
                        See dancing updates
                      </a>
                    </div>

                    <hr style="margin:30px 0 18px;border:0;border-top:1px solid #22343a;">
                    <p style="margin:0;color:#829397;font-size:12px;line-height:1.6;text-align:center;">
                      You received this email because this address subscribed to dancing updates.
                    </p>
                    <p style="margin:8px 0 0;text-align:center;">
                      <a href="${escapeHtml(unsubscribeUrl)}" style="color:#9beef6;font-size:12px;text-decoration:underline;">
                        Unsubscribe from dancing updates
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'BiologicalMachineryDanceNewsletter/1.0'
    },
    body: JSON.stringify({
      from: env.DANCE_NEWSLETTER_FROM || env.NEWSLETTER_FROM,
      to: [to],
      subject: `Dancing update: ${event.title}`,
      html
    })
  });

  if (!response.ok) {
    throw new Error(`Email provider returned ${response.status}: ${await response.text()}`);
  }
}

async function setDanceNewsletterState(env, eventId) {
  await env.DB.prepare(`
    INSERT INTO dance_newsletter_state (key, value, updated_at)
    VALUES ('last_event_id', ?, unixepoch())
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()
  `).bind(String(eventId)).run();
}

async function setNewsletterState(env, postId) {
  await env.DB.prepare(`
    INSERT INTO newsletter_state (key, value, updated_at)
    VALUES ('last_post_id', ?, unixepoch())
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = unixepoch()
  `).bind(String(postId)).run();
}

