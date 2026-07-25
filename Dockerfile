FROM node:22-slim AS base

ARG PAYLOAD_SECRET
ARG DATABASE_URL
ARG NEXT_PUBLIC_SERVER_URL

ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL

RUN npm install -g pnpm@10
WORKDIR /home/node/app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN pnpm build

FROM base AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
    libgbm1 libpango-1.0-0 libcairo2 libasound2 libatspi2.0-0 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
RUN pnpm add sharp 

# Install Chromium for Playwright
RUN pnpm exec playwright install chromium
RUN pnpm exec playwright install-deps chromium

COPY --from=builder /home/node/app/.next ./.next
COPY --from=builder /home/node/app/public ./public
COPY --from=builder /home/node/app/package.json ./

# Copy compiled migration files (they get built during pnpm build)
COPY --from=builder /home/node/app/src/migrations ./src/migrations

# ═══════════════════════════════════════════════════
# FIX 1 — Copy tsconfig.json so Payload can resolve @/ imports
# ═══════════════════════════════════════════════════
COPY tsconfig.json ./

EXPOSE 3000
CMD ["sh", "-c", "npx payload migrate && pnpm start"]

