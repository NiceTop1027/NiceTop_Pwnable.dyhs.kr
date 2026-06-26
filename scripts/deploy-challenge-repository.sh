#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="${1:-}"
CHALLENGE_ID="${2:-}"
API_BASE="${API_BASE:-http://localhost:4010/api}"
ADMIN_USER="${ADMIN_USER:-NiceTop}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-nicetophappy}"

if [[ -z "$SLUG" || -z "$CHALLENGE_ID" ]]; then
  echo "Usage: $0 <repository-slug> <challenge-id>" >&2
  exit 1
fi

REPO_DIR="$ROOT/challenges/$SLUG"
ZIP_PATH="$(mktemp /tmp/challenge-${SLUG}.XXXXXX.zip)"
COOKIE_JAR="$(mktemp)"

cleanup() {
  rm -f "$ZIP_PATH" "$COOKIE_JAR"
}
trap cleanup EXIT

if [[ ! -d "$REPO_DIR" ]]; then
  echo "Repository not found: $REPO_DIR" >&2
  exit 1
fi

echo "==> Packaging $SLUG"
python3 - "$REPO_DIR" "$ZIP_PATH" <<'PY'
import sys
import shutil
shutil.make_archive(sys.argv[2].removesuffix(".zip"), "zip", root_dir=sys.argv[1])
PY

echo "==> Logging in as $ADMIN_USER"
LOGIN_RESPONSE="$(curl -sS -c "$COOKIE_JAR" -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASSWORD\"}")"

if ! echo "$LOGIN_RESPONSE" | grep -q '"user"'; then
  echo "Login failed: $LOGIN_RESPONSE" >&2
  exit 1
fi

echo "==> Uploading repository ZIP"
UPLOAD_RESPONSE="$(curl -sS -b "$COOKIE_JAR" -X POST \
  "$API_BASE/admin/challenges/$CHALLENGE_ID/docker/upload" \
  -F "archive=@$ZIP_PATH")"

if echo "$UPLOAD_RESPONSE" | grep -q '"buildStatus":"failed"'; then
  echo "Upload/build failed: $UPLOAD_RESPONSE" >&2
  exit 1
fi

IMAGE_NAME="$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('imageName',''))")"
BUILD_STATUS="$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('buildStatus',''))")"

if [[ "$BUILD_STATUS" != "ready" || -z "$IMAGE_NAME" ]]; then
  echo "Build not ready: $UPLOAD_RESPONSE" >&2
  exit 1
fi

echo "==> Enabling instance ($IMAGE_NAME)"
curl -sS -b "$COOKIE_JAR" -X PATCH "$API_BASE/admin/challenges/$CHALLENGE_ID" \
  -H "Content-Type: application/json" \
  -d "{\"dockerImage\":\"$IMAGE_NAME\"}" > /dev/null

echo "==> Verifying challenge"
curl -sS "$API_BASE/challenges/$SLUG" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('title:', data.get('title'))
print('dockerImage:', data.get('dockerImage'))
print('publicFiles:', [f['path'] for f in data.get('publicFiles', [])])
"

echo "==> Deploy complete for $SLUG"