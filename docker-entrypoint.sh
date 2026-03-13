#!/bin/sh
set -e

echo "→ Running Prisma migrations..."
npx prisma migrate deploy

echo "→ Running Prisma seed (idempotent)..."
npx prisma db seed || echo "Seed skipped (already seeded or no changes)"

echo "→ Starting Next.js..."
exec node server.js
