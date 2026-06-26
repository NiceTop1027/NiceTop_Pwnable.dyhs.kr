#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/wargame"
OUT="$ROOT/apps/web/public/samples/wargame-repository.zip"

export SRC OUT
python3 - <<'PY'
import os, zipfile

root = os.environ["SRC"]
out = os.environ["OUT"]

skip_dirs = {".git", "__pycache__"}
skip_files = {".DS_Store"}

with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]
        for name in filenames:
            if name in skip_files:
                continue
            full = os.path.join(dirpath, name)
            rel = os.path.relpath(full, root)
            zf.write(full, rel)

print("wrote", out)
PY

echo "Sample ZIP: $OUT"