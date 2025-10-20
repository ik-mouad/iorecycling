#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "🔧 Rebuilding backend (no cache)..."
docker compose build backend --no-cache

echo "🚀 Restarting backend..."
docker compose up -d backend

echo "⏳ Waiting 5s and showing recent logs..."
sleep 5
docker compose logs --since=30s backend || true

echo "✅ Done. Verify health via reverse-proxy: /api/actuator/health"

