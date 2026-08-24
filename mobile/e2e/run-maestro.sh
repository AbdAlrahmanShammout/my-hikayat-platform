#!/usr/bin/env bash
# Run Maestro R1 smoke flows with credentials from backend/.env.e2e.
set -euo pipefail

MOBILE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "${MOBILE_DIR}/.." && pwd)"
BACKEND_ENV="${REPO_ROOT}/backend/.env.e2e"
MOBILE_ENV="${MOBILE_DIR}/.env.e2e"
FLOW="${1:-${MOBILE_DIR}/e2e/maestro/r1-smoke.yaml}"

if ! command -v maestro >/dev/null 2>&1; then
  echo "Maestro CLI is not installed. Install: https://maestro.mobile.dev/getting-started/installing-maestro" >&2
  exit 1
fi

if [[ ! -f "${BACKEND_ENV}" ]]; then
  echo "Missing ${BACKEND_ENV}" >&2
  exit 1
fi

if [[ ! -f "${MOBILE_ENV}" ]]; then
  echo "Missing ${MOBILE_ENV}" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${BACKEND_ENV}"
# shellcheck disable=SC1090
source "${MOBILE_ENV}"
set +a

: "${E2E_READER_EMAIL:?E2E_READER_EMAIL must be set in backend/.env.e2e}"
: "${E2E_READER_PASSWORD:?E2E_READER_PASSWORD must be set in backend/.env.e2e}"

# Expo Go on Android Emulator talks to Metro on the host.
export EXPO_DEV_CLIENT_URL="${EXPO_DEV_CLIENT_URL:-exp://10.0.2.2:8081}"
export MAESTRO_APP_ID="${MAESTRO_APP_ID:-host.exp.exponent}"

echo "Running Maestro flow: ${FLOW}"
echo "API (from mobile env): ${EXPO_PUBLIC_API_BASE_URL}"
echo "Expo open link: ${EXPO_DEV_CLIENT_URL}"

cd "${MOBILE_DIR}"
maestro test \
  -e E2E_READER_EMAIL="${E2E_READER_EMAIL}" \
  -e E2E_READER_PASSWORD="${E2E_READER_PASSWORD}" \
  -e EXPO_DEV_CLIENT_URL="${EXPO_DEV_CLIENT_URL}" \
  -e MAESTRO_APP_ID="${MAESTRO_APP_ID}" \
  "${FLOW}"
