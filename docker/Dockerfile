# ============================================================
# STAGE 1: Angular Frontend Builder
# ============================================================
FROM node:22.14-alpine AS angular-builder

WORKDIR /app

COPY package*.json ./
COPY ../angular.json ./
COPY tsconfig*.json ./

RUN npm analyze --include=dev

COPY ../src ./src/
COPY ../public ./public/

RUN npm run build -- --configuration=production && \
    find dist/task-pad/browser -name "*.map" -delete && \
    rm -rf dist/task-pad/browser/*.LICENSE.txt 2>/dev/null || true && \
    rm -rf src/environments

# ============================================================ 257
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
COPY ../drizzle           ./drizzle
COPY ../drizzle.config.js ./

RUN npm analyze && \
    npx terser server.js -c -m -o dist/server.js && \
    npm prune --omit=dev --omit=optional && \
    find node_modules -type f -name "*.md" -delete && \
    find node_modules -type f -name "*.map" -delete && \
    find node_modules -type f -name "*.ts" -delete && \
    find node_modules -type f -name "*.test" -delete && \
    npm cache clean --force 2>/dev/null || true

# ============================================================
# STAGE 3: Runtime Image
# ============================================================
FROM gcr.io/distroless/nodejs22-debian13:nonroot AS runtime

ENV NODE_ENV=production NODE_OPTIONS="--max-old-space-size=256"

WORKDIR /app

COPY --from=backend-builder --chown=nonroot:nonroot /app/node_modules          ./node_modules
COPY --from=backend-builder --chown=nonroot:nonroot /app/dist/server.js        ./server.js
COPY --from=backend-builder --chown=nonroot:nonroot /app/src/config            ./src/config
COPY --from=backend-builder --chown=nonroot:nonroot /app/src/schemas           ./src/schemas
COPY --from=backend-builder --chown=nonroot:nonroot /app/src/middlewares       ./src/middlewares
COPY --from=backend-builder --chown=nonroot:nonroot /app/drizzle               ./drizzle
COPY --from=backend-builder --chown=nonroot:nonroot /app/drizzle.config.js     ./drizzle.config.js
COPY --from=backend-builder --chown=nonroot:nonroot /app/src/utils             ./src/utils
COPY --from=angular-builder --chown=nonroot:nonroot /app/dist/task-pad/browser ./public

COPY --chown=nonroot:nonroot ../src/probes   ./src/probes
COPY --chown=nonroot:nonroot ../src/metrics  ./src/metrics
COPY --chown=nonroot:nonroot ../src/app/core ./src/app/core
COPY --chown=nonroot:nonroot ../src/assets   ./src/assets

EXPOSE 4000
USER nonroot
CMD ["server.js"]
