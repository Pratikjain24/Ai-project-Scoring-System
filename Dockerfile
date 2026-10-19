# =========================================================================
# PROJECTX-RAY AI — PRODUCTION MULTI-STAGE DOCKERFILE
# Node 22 Native SQLite, React 19 Frontend, FFmpeg Forensics, OCR & S3 Storage
# =========================================================================

# -------------------------------------------------------------------------
# STAGE 1: Dependency & Frontend Asset Builder
# -------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install native compilation build dependencies
RUN apk add --no-cache python3 make g++

# Copy package manifests first to optimize layer caching
COPY package.json package-lock.json ./

# Clean installation of all dependencies (including devDependencies for build)
RUN npm ci

# Copy project source trees and build configs
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts postcss.config.js tailwind.config.js ./
COPY index.html ./
COPY public/ ./public/
COPY src/ ./src/
COPY backend/ ./backend/
COPY scripts/ ./scripts/
COPY drizzle.config.ts ./

# Compile production React SPA bundle via Vite + TypeScript compiler
RUN npm run build

# -------------------------------------------------------------------------
# STAGE 2: Hardened Production Runtime
# -------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Install runtime system packages:
# - curl: Container healthcheck probing
# - ffmpeg: Audio extraction and acoustic presentation forensics (16kHz PCM WAV)
# - tesseract-ocr & eng: Document OCR scanning
# - dumb-init: PID 1 signal forwarding, orphan reaping, graceful SIGTERM handling
RUN apk add --no-cache \
    curl \
    ffmpeg \
    tesseract-ocr \
    tesseract-ocr-data-eng \
    dumb-init

# Set production environment defaults
ENV NODE_ENV=production \
    PORT=3001 \
    DATABASE_PATH=/app/data/projectxray.db \
    STORAGE_LOCAL_DIR=/app/uploads

# Create non-root group and user for CIS container compliance
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

# Copy package manifests
COPY package.json package-lock.json ./

# Install runtime dependencies including tsx for native execution
RUN npm ci --omit=dev && \
    npm install -g tsx

# Copy compiled frontend assets from builder stage
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist

# Copy backend application source and database migration schema
COPY --from=builder --chown=appuser:nodejs /app/backend ./backend
COPY --from=builder --chown=appuser:nodejs /app/scripts ./scripts
COPY --from=builder --chown=appuser:nodejs /app/drizzle.config.ts ./

# Copy OCR model data if present
COPY --chown=appuser:nodejs eng.traineddata* ./

# Create persistent storage directories with appropriate permissions
RUN mkdir -p /app/data /app/uploads && \
    chown -R appuser:nodejs /app/data /app/uploads

# Switch to unprivileged user
USER appuser

# Expose primary backend and frontend unified port
EXPOSE 3001

# Healthcheck probe verifying API availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Graceful process manager entrypoint
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start application server
CMD ["node", "--run", "start"]
