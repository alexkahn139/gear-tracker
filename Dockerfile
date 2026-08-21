# syntax=docker/dockerfile:1

# ---------- 1. Build the frontend → web/dist ----------
FROM node:22-slim AS web-build
WORKDIR /app
# Workspace metadata required to resolve `npm ci -w` against the shared lockfile.
COPY package.json package-lock.json ./
COPY src/package.json ./src/package.json
COPY web/package.json ./web/package.json
RUN npm ci -w @gear-tracker/web
COPY web/ ./web/
RUN npm run build -w @gear-tracker/web

# ---------- 2. Install backend runtime dependencies (native modules) ----------
FROM node:22-slim AS backend-deps
WORKDIR /app
# Build toolchain as a fallback in case a prebuilt binary is unavailable for this
# Node ABI; prebuilt download path is preferred and much faster when it hits.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY src/package.json ./src/package.json
COPY web/package.json ./web/package.json
RUN npm ci -w @gear-tracker/backend --omit=dev

# ---------- 3. Runtime ----------
FROM node:22-slim
ENV NODE_ENV=production
# Backend lives at /app/src so its PROJECT_ROOT resolves to /app and it finds
# the built SPA at /app/web/dist (see src/app.ts).
WORKDIR /app/src
COPY --from=backend-deps /app/node_modules /app/node_modules
COPY --from=backend-deps /app/package.json /app/package.json
COPY --from=backend-deps /app/package-lock.json /app/package-lock.json
COPY src/ ./
COPY --from=web-build /app/web/dist /app/web/dist
ENV DATA_DIR=/data \
    PORT=3000
VOLUME /data
EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
