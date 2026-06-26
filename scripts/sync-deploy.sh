#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BRANCH="${DEPLOY_BRANCH:-main}"
REMOTE="${DEPLOY_REMOTE:-origin}"

echo "==> Fetching ${REMOTE}/${BRANCH}"
git fetch "$REMOTE" "$BRANCH"

LOCAL="$(git rev-parse HEAD)"
REMOTE_HEAD="$(git rev-parse "${REMOTE}/${BRANCH}")"

if [[ "$LOCAL" == "$REMOTE_HEAD" ]]; then
  echo "==> Already up to date (${LOCAL:0:8})"
  exit 0
fi

echo "==> Updating ${LOCAL:0:8} -> ${REMOTE_HEAD:0:8}"
git pull --ff-only "$REMOTE" "$BRANCH"

if git diff-tree --no-commit-id --name-only -r HEAD@{1} HEAD | grep -qE '^(package-lock\.json|package\.json|apps/|packages/)'; then
  echo "==> Installing dependencies"
  npm ci
else
  echo "==> Skipping npm ci (no dependency changes)"
fi

"$ROOT/scripts/deploy-nicetop-api.sh"
"$ROOT/scripts/deploy-nicetop-web.sh"

echo "==> Sync deploy complete"