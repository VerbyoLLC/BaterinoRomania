# Build stage
FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

# Production stage — Debian + Chromium for Puppeteer PDF generation (offers, warranty).
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    fonts-liberation \
    fonts-noto-color-emoji \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/generated ./generated
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY index.js ./
COPY lib ./lib/
COPY templates ./templates/

EXPOSE 3000

# Migrations run via Railway pre-deploy command
CMD ["node", "index.js"]
