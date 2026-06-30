FROM node:20-alpine AS base
RUN corepack enable

# ─── Install all dependencies (including devDeps for build) ───────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

# ─── Build frontend (Vite) + backend (esbuild) ────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# VITE_ vars are baked into the frontend bundle at build time
ARG VITE_APP_ID=""
ARG VITE_OAUTH_PORTAL_URL=""
ARG VITE_FRONTEND_FORGE_API_KEY=""
ARG VITE_FRONTEND_FORGE_API_URL=""

ENV VITE_APP_ID=$VITE_APP_ID \
    VITE_OAUTH_PORTAL_URL=$VITE_OAUTH_PORTAL_URL \
    VITE_FRONTEND_FORGE_API_KEY=$VITE_FRONTEND_FORGE_API_KEY \
    VITE_FRONTEND_FORGE_API_URL=$VITE_FRONTEND_FORGE_API_URL

RUN pnpm run build

# ─── Production image ─────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache netcat-openbsd

# Reuse full node_modules (drizzle-kit needed for migrations at startup)
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
COPY --from=deps /app/node_modules ./node_modules

# Built app
COPY --from=builder /app/dist ./dist

# Drizzle schema & config (needed for drizzle-kit push at startup)
COPY drizzle ./drizzle
COPY drizzle.config.ts ./
COPY tsconfig.json ./
COPY shared ./shared

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
