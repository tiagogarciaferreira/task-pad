# ============================================================
# STAGE 1: Angular Frontend Builder
# ============================================================
FROM node:22.14-alpine AS angular-builder

WORKDIR /app

COPY package*.json ./
COPY ../angular.json ./
COPY tsconfig*.json ./

RUN npm ci --include=dev

COPY ../src ./src/
COPY ../public ./public/

RUN npm run build -- --configuration=production && \
    find dist/task-pad/browser -name "*.map" -delete && \
    rm -rf dist/task-pad/browser/*.LICENSE.txt 2>/dev/null || true && \
    rm -rf src/environments

# ============================================================
# STAGE 2: Backend Builder
# ============================================================
FROM node:22.14-alpine AS backend-builder

WORKDIR /app

COPY package*.json        ./
COPY ../server.js         ./
COPY ../src/config        ./src/config
COPY ../src/schemas       ./src/schemas
COPY ../src/middlewares   ./src/middlewares
COPY ../src/utils         ./src/utils
COPY ../src/probes        ./src/probes
COPY ../src/metrics       ./src/metrics
COPY ../src/app/core      ./src/app/core
COPY ../drizzle           ./drizzle
COPY ../drizzle.config.js ./
COPY ../tasks.json        ./

RUN npm ci

RUN npx esbuild server.js \
    --bundle \
    --platform=node \
    --target=node22 \
    --outfile=dist/server.js \
    --minify \
    --external:*.node

# ============================================================
# STAGE 3: Runtime Image
# ============================================================
FROM gcr.io/distroless/nodejs22-debian13:nonroot AS runtime

ENV NODE_ENV=production NODE_OPTIONS="--max-old-space-size=256"

WORKDIR /app

COPY --from=backend-builder --chown=nonroot:nonroot /app/dist/server.js        ./server.js
COPY --from=backend-builder --chown=nonroot:nonroot /app/drizzle               ./drizzle
COPY --from=backend-builder --chown=nonroot:nonroot /app/drizzle.config.js     ./drizzle.config.js
COPY --from=backend-builder --chown=nonroot:nonroot /app/tasks.json            ./tasks.json
COPY --from=angular-builder --chown=nonroot:nonroot /app/dist/task-pad/browser ./public
COPY --chown=nonroot:nonroot ../src/assets   ./src/assets

EXPOSE 4000
USER 65532
CMD ["server.js"]
