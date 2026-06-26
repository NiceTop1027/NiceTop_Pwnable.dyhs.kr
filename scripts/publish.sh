#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BRANCH="${PUBLISH_BRANCH:-main}"
REMOTE="${PUBLISH_REMOTE:-origin}"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: uncommitted changes — commit first" >&2
  git status --short
  exit 1
fi

echo "==> Pushing to ${REMOTE}/${BRANCH}"
git push "$REMOTE" "$BRANCH"

echo "==> Deploying latest"
"$ROOT/scripts/deploy-nicetop-api.sh"
"$ROOT/scripts/deploy-nicetop-web.sh"

echo "==> Publish complete"