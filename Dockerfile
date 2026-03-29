# ============================================
# STAGE 1: Build Angular Frontend
# ============================================
FROM node:22-alpine AS angular-builder

WORKDIR /app

# Copiar arquivos de dependência (melhor cache)
COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./

# Instalar dependências (incluindo dev para build)
RUN npm ci --include=dev

# Copiar código fonte do Angular
COPY src/ ./src/
COPY public/ ./public/

# Build de produção com otimizações máximas
RUN npm run build -- --configuration=production

# Minificar assets adicionais (opcional)
RUN find dist/task-pad/browser -name "*.js" -exec gzip -9 {} \; && \
    find dist/task-pad/browser -name "*.css" -exec gzip -9 {} \;

# ============================================
# STAGE 2: Backend + Prisma
# ============================================
FROM node:22-alpine AS backend-builder

WORKDIR /app

# Copiar apenas o necessário para dependências
COPY package*.json ./
COPY prisma ./prisma/
#COPY prisma.config.ts ./


RUN npm ci
RUN ./node_modules/.bin/prisma generate

# Instalar apenas dependências de produção
#RUN npm ci --omit=dev --omit=optional
#RUN npm ci

# Gerar Prisma Client
#RUN npx prisma generate

# Minificar server.js
COPY server.js ./
RUN npx terser server.js -c -m -o dist/server.js && \
    gzip -9 dist/server.js

# ============================================
# STAGE 3: Runtime Final (Mínimo)
# ============================================
FROM node:22-alpine AS runtime

# Configurações do sistema
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=512" \
    TZ=UTC

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    apk del tzdata

WORKDIR /app

# Copiar backend otimizado
COPY --from=backend-builder --chown=nodejs:nodejs /app/dist/server.js.gz ./server.js.gz
COPY --from=backend-builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=backend-builder --chown=nodejs:nodejs /app/prisma ./prisma
#COPY --from=backend-builder --chown=nodejs:nodejs /app/prisma.config.ts .

# Descompactar server.js
RUN gunzip server.js.gz

# Copiar frontend compilado
COPY --from=angular-builder --chown=nodejs:nodejs /app/dist/task-pad/browser ./public
COPY --from=angular-builder --chown=nodejs:nodejs /app/src/probes ./src/probes
COPY --from=angular-builder --chown=nodejs:nodejs /app/src/config ./src/config
COPY --from=angular-builder --chown=nodejs:nodejs /app/src/schemas ./src/schemas

# Script de entrada que roda migrations antes de iniciar
#RUN echo '#!/bin/sh \n npx prisma migrate deploy \n node server.js' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh
#ENTRYPOINT ["/app/entrypoint.sh"]

# Criar arquivo de health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Expor porta
EXPOSE 4000

# Usuário não-root
USER nodejs

# Iniciar aplicação
CMD ["node", "server.js"]
