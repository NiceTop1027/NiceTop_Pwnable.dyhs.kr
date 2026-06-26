#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export NODE_ENV=production

echo "==> Generating Prisma client"
npm run generate -w @pwnable/database

echo "==> Building API"
npm run build -w @pwnable/api

echo "==> Reloading nicetop-api"
pm2 reload nicetop-api --update-env || pm2 restart nicetop-api --update-env

echo "==> API deploy complete"