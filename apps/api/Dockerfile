FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app

COPY package.json ./
COPY ../../package-lock.json ./
RUN npm ci --only=production

# Build
FROM base AS builder
WORKDIR /app

COPY package.json tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/

# Install all dependencies (including dev for build)
RUN npm ci
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 3001
CMD ["node", "dist/index.js"]
