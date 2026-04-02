FROM node:22-alpine AS angular-builder

WORKDIR /app

# Copiar arquivos de dependência (cache otimizado)
COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./

# Instalar dependências (incluindo dev para build)
RUN npm ci --include=dev

# Copiar código fonte do Angular
COPY src/ ./src/
COPY public/ ./public/

# Build de produção com otimizações
RUN npm run build -- --configuration=production
RUN find dist/task-pad/browser -name "*.map" -delete


FROM node:22-alpine AS backend-builder

WORKDIR /app

# Copiar apenas o necessário
COPY package*.json ./
COPY src/config ./src/config
COPY src/schemas  ./src/schemas
COPY drizzle ./drizzle
COPY drizzle.config.js ./

# NOVO: Copiar arquivos do Firebase e middlewares
COPY src/middlewares ./src/middlewares
COPY firebase-key.json ./

# Instalar apenas dependências de produção
RUN npm ci --omit=dev --omit=optional && \
    npm cache clean --force

COPY server.js ./
RUN npx terser server.js -c -m -o dist/server.js


FROM node:22-alpine AS runtime

# Configurações de ambiente
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=256" \
    TZ=UTC

# Criar usuário não-root (segurança)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    apk del tzdata && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copiar backend otimizado
COPY --from=backend-builder --chown=nodejs:nodejs /app/dist/server.js ./server.js
COPY --from=backend-builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=backend-builder --chown=nodejs:nodejs /app/src/config ./src/config
COPY --from=backend-builder --chown=nodejs:nodejs /app/drizzle ./drizzle
COPY --from=backend-builder --chown=nodejs:nodejs /app/drizzle.config.js ./drizzle.config.js
COPY --from=backend-builder --chown=nodejs:nodejs /app/src/schemas ./src/schemas

# NOVO: Copiar middlewares e Firebase key
COPY --from=backend-builder --chown=nodejs:nodejs /app/src/middlewares ./src/middlewares
COPY --from=backend-builder --chown=nodejs:nodejs /app/firebase-key.json ./firebase-key.json

# Copiar frontend compilado
COPY --from=angular-builder --chown=nodejs:nodejs /app/dist/task-pad/browser ./public
COPY --chown=nodejs:nodejs src/probes ./src/probes

# NOVO: Copiar pasta core (AuthService, interceptors, guards)
COPY --chown=nodejs:nodejs src/app/core ./src/app/core

# NOVO: Copiar environment files (contém configurações do Firebase)
COPY --chown=nodejs:nodejs src/environments ./src/environments

# NOVO: Copiar assets (ícones, imagens)
COPY --chown=nodejs:nodejs src/assets ./src/assets

EXPOSE 4200

USER nodejs

CMD ["node", "server.js"]
