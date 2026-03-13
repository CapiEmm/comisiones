#!/bin/sh
set -e

export PATH="$PWD/node_modules/.bin:$PATH"

echo "→ Running Prisma migrations..."
prisma migrate deploy

echo "→ Running Prisma seed (idempotent)..."
prisma db seed || echo "Seed skipped (already seeded or no changes)"

echo "→ Starting Next.js..."
exec node server.js
