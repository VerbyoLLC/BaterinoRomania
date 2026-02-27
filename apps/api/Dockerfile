# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/generated ./generated
COPY prisma ./prisma/
COPY index.js ./
COPY lib ./lib/
COPY templates ./templates/

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node index.js"]
