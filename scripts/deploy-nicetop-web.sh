#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BUILD_ID="b$(date +%s)"
echo "$BUILD_ID" > apps/web/.build-id

export BUILD_ID
export INTERNAL_API_URL="${INTERNAL_API_URL:-http://localhost:4010}"
export API_URL="${API_URL:-https://nicetop.dyhs.kr}"
export WEB_URL="${WEB_URL:-https://nicetop.dyhs.kr}"
export API_PORT="${API_PORT:-4010}"
export NODE_ENV=production

echo "==> Cleaning stale Next.js output (keep cache)"
rm -rf apps/web/.next/dev apps/web/.next/server apps/web/.next/static

echo "==> Building web (BUILD_ID=$BUILD_ID)"
npm run build -w @pwnable/web

if [[ ! -f apps/web/.next/BUILD_ID ]]; then
  echo "ERROR: production build missing (.next/BUILD_ID not found)" >&2
  exit 1
fi

echo "==> Reloading nicetop-web"
pm2 reload nicetop-web --update-env || pm2 restart nicetop-web --update-env

echo "==> Verifying static assets on origin"
sleep 2
paths=$(curl -fsS "http://127.0.0.1:3100/" | grep -oE "/_b/${BUILD_ID}/_next/static/[^\"'\\\\]+" | sort -u)
if [[ -z "$paths" ]]; then
  echo "ERROR: no static asset URLs found in homepage HTML" >&2
  exit 1
fi

failed=0
while IFS= read -r asset; do
  [[ -z "$asset" ]] && continue
  headers=$(curl -fsSI "http://127.0.0.1:3100${asset}") || { failed=1; break; }
  if ! echo "$headers" | grep -qiE "content-type: (application/javascript|text/css|font/)"; then
    echo "ERROR: unexpected content type for ${asset}" >&2
    echo "$headers" >&2
    failed=1
    break
  fi
done <<< "$paths"

if [[ "$failed" -ne 0 ]]; then
  echo "ERROR: static asset verification failed" >&2
  exit 1
fi

echo "==> Deploy complete (asset prefix /_b/${BUILD_ID})"