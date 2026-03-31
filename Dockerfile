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
COPY src/database ./src/database
COPY src/schemas  ./src/schemas
COPY drizzle ./drizzle
COPY drizzle.config.js ./

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
COPY --from=backend-builder --chown=nodejs:nodejs /app/src/database ./src/database
COPY --from=backend-builder --chown=nodejs:nodejs /app/drizzle ./drizzle
COPY --from=backend-builder --chown=nodejs:nodejs /app/drizzle.config.js ./drizzle.config.js
COPY --from=backend-builder --chown=nodejs:nodejs /app/src/schemas ./src/schemas

# Copiar frontend compilado
COPY --from=angular-builder --chown=nodejs:nodejs /app/dist/task-pad/browser ./public
COPY --chown=nodejs:nodejs src/probes ./src/probes

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

EXPOSE 4000

USER nodejs

CMD ["node", "server.js"]
