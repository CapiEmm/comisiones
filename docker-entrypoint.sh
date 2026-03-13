#!/bin/sh
set -e

echo "→ Running Prisma migrations..."
./node_modules/.bin/prisma migrate deploy

echo "→ Running Prisma seed (idempotent)..."
./node_modules/.bin/prisma db seed || echo "Seed skipped (already seeded or no changes)"

echo "→ Starting Next.js..."
exec node server.js
