# Backend Dockerfile for NestJS Application
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package*.json ./
# Install all dependencies (including devDependencies) needed for building the app.  
# This is separate from the deps stage, which only installs production dependencies for the final image.  
RUN npm ci --prefer-offline --no-audit

# Build the application
FROM deps AS builder
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=src/prisma/schema.prisma

# Build the NestJS application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy package files and install only production dependencies
COPY --chown=nestjs:nodejs package*.json ./
RUN npm ci --omit=dev --prefer-offline --no-audit

# Copy built application and generated files
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/src/prisma ./src/prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Copy entrypoint script
COPY --chown=nestjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Install wget for healthcheck
RUN apk add --no-cache wget

USER nestjs

EXPOSE 8080

# Use entrypoint script to handle migrations and startup
ENTRYPOINT ["./entrypoint.sh"]
