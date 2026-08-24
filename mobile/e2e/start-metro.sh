#!/usr/bin/env bash
# Start Expo Metro with E2E API base URL (Android Emulator → host via 10.0.2.2).
#
# Expo Metro embeds mobile/.env into expo/virtual/env and that object overwrites
# shell EXPO_PUBLIC_* (so sourcing .env.e2e alone is not enough). For E2E we
# temporarily replace mobile/.env with mobile/.env.e2e for the Metro process,
# then restore the development .env on exit.
#
# Development (plain `expo start`) is unchanged: mobile/.env → localhost:3000.
set -euo pipefail

MOBILE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${MOBILE_DIR}/.env.e2e"
DEV_ENV_FILE="${MOBILE_DIR}/.env"
# gitignored via .env.* — survives crash until next start-metro restore
DEV_ENV_BACKUP="${MOBILE_DIR}/.env.e2e.dev-backup"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Copy mobile/.env.e2e.example to mobile/.env.e2e." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

if [[ -z "${EXPO_PUBLIC_API_BASE_URL:-}" ]]; then
  echo "EXPO_PUBLIC_API_BASE_URL is required in mobile/.env.e2e" >&2
  exit 1
fi

restore_dev_env() {
  if [[ -f "${DEV_ENV_BACKUP}" ]]; then
    mv "${DEV_ENV_BACKUP}" "${DEV_ENV_FILE}"
    echo "Restored ${DEV_ENV_FILE} from E2E backup."
  fi
}

# Recover from a previous interrupted E2E Metro run.
if [[ -f "${DEV_ENV_BACKUP}" ]]; then
  echo "Found leftover ${DEV_ENV_BACKUP}; restoring development .env before E2E swap."
  restore_dev_env
fi

if [[ ! -f "${DEV_ENV_FILE}" ]]; then
  echo "Missing ${DEV_ENV_FILE}. Copy mobile/.env.example to mobile/.env for development." >&2
  exit 1
fi

cp "${DEV_ENV_FILE}" "${DEV_ENV_BACKUP}"
cp "${ENV_FILE}" "${DEV_ENV_FILE}"
trap restore_dev_env EXIT INT TERM HUP

echo "Starting Expo E2E Metro with EXPO_PUBLIC_API_BASE_URL=${EXPO_PUBLIC_API_BASE_URL}"
echo "(temporary ${DEV_ENV_FILE} ← ${ENV_FILE}; restored on exit)"
cd "${MOBILE_DIR}"
pnpm exec expo start --android
