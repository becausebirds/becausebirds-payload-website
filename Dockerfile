FROM node:22-alpine AS base

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
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /home/node/app/.next ./.next
COPY --from=builder /home/node/app/public ./public
COPY --from=builder /home/node/app/package.json ./

EXPOSE 3000
CMD ["pnpm", "start"]