#!/usr/bin/env bash
# render-build.sh — Frontend build script for Render.com static site deployment
# 
# Render sets environment variables BEFORE the build command runs.
# We inject the backend URL into environment.prod.ts before Angular compiles.
#
# Environment variables:
#   BACKEND_URL: Optional on local, recommended on Render (e.g. https://deskshare-api.onrender.com)
#
# Usage (set as "Build Command" in Render dashboard):
#   chmod +x render-build.sh && ./render-build.sh

set -euo pipefail

echo "=== DeskShare Frontend Build ==="
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"

# Normalize BACKEND_URL (strip any trailing slash)
BACKEND_URL="${BACKEND_URL:-}"
BACKEND_URL="${BACKEND_URL%/}"

if [ -n "$BACKEND_URL" ]; then
  echo "Configuring API Base URL: ${BACKEND_URL}/api/v1"
  # Replace placeholder with full backend URL
  sed -i.bak "s|REPLACE_API_URL|${BACKEND_URL}|g" src/environments/environment.prod.ts
else
  echo "Notice: BACKEND_URL is not set. Defaulting to relative '/api/v1' (suitable for Nginx reverse proxy)."
  # Strip placeholder so it becomes /api/v1
  sed -i.bak "s|REPLACE_API_URL||g" src/environments/environment.prod.ts
fi

rm -f src/environments/environment.prod.ts.bak

# Install dependencies and build
npm ci
echo "✓ npm ci complete"

npm run build
echo "✓ Angular production build complete"

echo "=== Build finished successfully ==="
