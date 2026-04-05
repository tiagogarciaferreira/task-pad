# ============================================================
# STAGE 1: Angular Frontend Builder
# ============================================================
FROM node:22.14-alpine AS angular-builder

WORKDIR /app

# Copy dependency files first (layer cache optimization)
COPY package*.json ./
COPY ../angular.json ./
COPY tsconfig*.json ./

# Install all dependencies (dev included for build tooling)
RUN npm ci --include=dev

# Copy Angular source
COPY ../src ./src/
COPY ../public ./public/

# Build production bundle and strip source maps
RUN npm run build -- --configuration=production && \
    find dist/task-pad/browser -name "*.map" -delete && \
    rm -rf src/environments


# ============================================================
# STAGE 2: Backend Builder
# ============================================================
FROM node:22.14-alpine AS backend-builder

WORKDIR /app

# Copy only what's needed for dependency resolution
COPY package*.json ./
COPY ../src/config      ./src/config
COPY ../src/schemas     ./src/schemas
COPY ../src/middlewares ./src/middlewares
COPY ../drizzle         ./drizzle
COPY ../drizzle.config.js ./

# Copy and minify server entrypoint before pruning devDeps
# (terser is a devDependency — must run before prune)
COPY ../server.js ./

# Install all deps → minify → prune to production-only → clean cache
RUN npm ci && \
    npx terser server.js -c -m -o dist/server.js && \
    npm prune --omit=dev --omit=optional && \
    npm cache clean --force 2>/dev/null || true


# ============================================================
# STAGE 3: Runtime Image
# ============================================================
FROM node:22.14-alpine AS runtime

# Align TZ env with the actual localtime configured below
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=256" \
    TZ=America/Sao_Paulo

# Security: non-root user | Timezone: São Paulo
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    echo "America/Sao_Paulo" > /etc/timezone && \
    apk del tzdata && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# --- Backend artifacts ---
COPY --from=backend-builder --chown=nodejs:nodejs /app/dist/server.js   ./server.js
COPY --from=backend-builder --chown=nodejs:nodejs /app/node_modules      ./node_modules
COPY --from=backend-builder --chown=nodejs:nodejs /app/src/config        ./src/config
COPY --from=backend-builder --chown=nodejs:nodejs /app/src/schemas       ./src/schemas
COPY --from=backend-builder --chown=nodejs:nodejs /app/src/middlewares   ./src/middlewares
COPY --from=backend-builder --chown=nodejs:nodejs /app/drizzle           ./drizzle
COPY --from=backend-builder --chown=nodejs:nodejs /app/drizzle.config.js ./drizzle.config.js

# --- Frontend compiled output ---
COPY --from=angular-builder --chown=nodejs:nodejs /app/dist/task-pad/browser ./public

# --- Runtime source references (used by backend at runtime) ---
COPY --chown=nodejs:nodejs ../src/probes   ./src/probes
COPY --chown=nodejs:nodejs ../src/metrics  ./src/metrics
COPY --chown=nodejs:nodejs ../src/app/core ./src/app/core
COPY --chown=nodejs:nodejs ../src/assets   ./src/assets

EXPOSE 4000

# Liveness check — adjust /health to your actual health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:4000/health || exit 1

USER nodejs

CMD ["node", "server.js"]
