# Builder stage: install all deps, generate Prisma client, build app
FROM node:20-alpine AS builder
WORKDIR /app

# Install build tools (si besoin pour certaines dépendances natives)
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN npm run prisma:generate
RUN npm run build

# Runtime stage: only prod deps + built files + generated Prisma client
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT 8080

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built app and Prisma client from builder
COPY --from=builder /app/dist ./dist
# Copy generated Prisma client artifacts
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 8080
CMD ["node", "dist/main.js"]
