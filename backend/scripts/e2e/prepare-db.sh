#!/usr/bin/env bash
# Create dedicated E2E database (if missing), migrate, and seed the E2E reader.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.e2e"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Copy backend/.env.e2e.example to backend/.env.e2e and fill values." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required in backend/.env.e2e" >&2
  exit 1
fi

DB_NAME="$(node -e "const u=new URL(process.env.DATABASE_URL); console.log(u.pathname.replace(/^\//,'').split('?')[0])")"
if [[ -z "${DB_NAME}" || "${DB_NAME}" == "lib_app" ]]; then
  echo "Refusing to use DATABASE_URL that points at the default development DB name 'lib_app' (or empty)." >&2
  echo "Use a dedicated database such as lib_app_e2e." >&2
  exit 1
fi

echo "Ensuring PostgreSQL database '${DB_NAME}' exists..."
psql -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 \
  || psql -d postgres -c "CREATE DATABASE \"${DB_NAME}\";"

cd "${ROOT_DIR}"
echo "Running Prisma migrate deploy against E2E database..."
pnpm exec prisma migrate deploy

echo "Seeding E2E reader..."
pnpm exec ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-e2e-reader.ts

echo "E2E database ready: ${DB_NAME}"
