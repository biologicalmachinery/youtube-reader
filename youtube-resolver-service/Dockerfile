FROM node:22-bookworm-slim AS bgutil-build

ARG BGUTIL_VERSION=2.0.0
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /opt
RUN git clone --depth 1 --branch "${BGUTIL_VERSION}" https://github.com/Brainicism/bgutil-ytdlp-pot-provider.git
WORKDIR /opt/bgutil-ytdlp-pot-provider/server
RUN npm ci --no-audit --no-fund && npx tsc

FROM python:3.12-slim-bookworm
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=10000 \
    BGUTIL_SERVER_HOME=/opt/bgutil-ytdlp-pot-provider/server \
    YTDLP_TIMEOUT_SECONDS=300 \
    YOUTUBE_MAX_HEIGHT=720 \
    R2_PREFIX=facial-youtube-cache/v2

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=bgutil-build /usr/local/ /usr/local/
COPY --from=bgutil-build /opt/bgutil-ytdlp-pot-provider /opt/bgutil-ytdlp-pot-provider
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
RUN useradd --create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app /opt/bgutil-ytdlp-pot-provider
USER appuser
EXPOSE 10000
CMD ["sh", "-c", "node /opt/bgutil-ytdlp-pot-provider/server/build/main.js --host 127.0.0.1 --port 4416 > /tmp/bgutil.log 2>&1 & BGUTIL_PID=$!; sleep 1; if ! kill -0 $BGUTIL_PID 2>/dev/null; then echo 'bgutil provider failed to start'; cat /tmp/bgutil.log; exit 1; fi; exec uvicorn app:app --host 0.0.0.0 --port ${PORT:-10000} --workers 1"]
