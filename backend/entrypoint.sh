#!/bin/sh
set -e

echo "Starting backend application..."
echo "Environment configuration:"
echo "  NODE_ENV: ${NODE_ENV:-production}"
echo "  PORT: ${PORT:-8080}"
echo "  DATABASE_URL: ${DATABASE_URL:+[CONFIGURED]}"
echo "  FRONTEND_URL: ${FRONTEND_URL:-[NOT SET]}"

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy --schema=src/prisma/schema.prisma

# Start the application
echo "Starting NestJS application..."
exec node dist/main

