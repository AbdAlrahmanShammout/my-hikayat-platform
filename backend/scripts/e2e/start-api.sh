#!/usr/bin/env bash
# Start NestJS listening on the E2E port/database from backend/.env.e2e.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.e2e"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Copy backend/.env.e2e.example to backend/.env.e2e." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

cd "${ROOT_DIR}"
echo "Starting E2E API on port ${APP_PORT:-3001} (APP_ENV=${APP_ENV:-test})..."
pnpm exec nest start
