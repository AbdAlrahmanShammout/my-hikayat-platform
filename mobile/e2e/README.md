# Mobile E2E — Phase 1 (R1 smoke)

Local-only Maestro UI tests against a **real NestJS HTTP server** and a
**dedicated PostgreSQL database** (`lib_app_e2e`).

```text
Android Emulator + Expo Go / Metro
        ↓
     Maestro
        ↓
  NestJS (APP_PORT from backend/.env.e2e, default 3001)
        ↓
  PostgreSQL database lib_app_e2e
```

## Required tools

- Node + pnpm (repo root)
- PostgreSQL (local)
- Android Emulator + `adb`
- [Maestro CLI](https://maestro.mobile.dev/getting-started/installing-maestro)
- Expo Go on the emulator (Phase 1 default), **or** a native build with `MAESTRO_APP_ID=com.libapp.reader`

## One-time setup

```bash
# 1) Backend E2E env
cp backend/.env.e2e.example backend/.env.e2e
# Edit DATABASE_URL (dedicated DB), JWT secrets, E2E_READER_PASSWORD

# 2) Mobile E2E env (Android Emulator → host)
cp mobile/.env.e2e.example mobile/.env.e2e
# Default: EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3001

# 3) Create DB, migrate, seed reader
chmod +x backend/scripts/e2e/*.sh mobile/e2e/*.sh
./backend/scripts/e2e/prepare-db.sh
```

### API URL selection

| Client | `EXPO_PUBLIC_API_BASE_URL` |
| --- | --- |
| Android Emulator | `http://10.0.2.2:<APP_PORT>` (host loopback) |
| iOS Simulator (later) | `http://localhost:<APP_PORT>` |
| Physical device (later) | Host LAN IP (do not commit machine-specific values) |

Do **not** use production URLs. Do **not** point at the development database.

## Run the suite (three terminals)

```bash
# Terminal A — E2E API
./backend/scripts/e2e/start-api.sh

# Terminal B — Metro with E2E API URL
./mobile/e2e/start-metro.sh

# Terminal C — Maestro (emulator running, Expo Go installed)
./mobile/e2e/run-maestro.sh
# or a single flow:
./mobile/e2e/run-maestro.sh mobile/e2e/maestro/auth/login-smoke.yaml
```

Credentials are read from `backend/.env.e2e` (`E2E_READER_EMAIL` / `E2E_READER_PASSWORD`)
and passed into Maestro via `-e` (not hardcoded in YAML).

## Flows (Phase 1)

| Flow | File |
| --- | --- |
| Login smoke | `e2e/maestro/auth/login-smoke.yaml` |
| Tab navigation | `e2e/maestro/shell/tab-navigation.yaml` |
| Logout | `e2e/maestro/auth/logout.yaml` |
| Session restore | `e2e/maestro/auth/session-restore.yaml` |
| Invalid login | `e2e/maestro/auth/invalid-login.yaml` |
| Full R1 smoke suite | `e2e/maestro/r1-smoke.yaml` |

Home may show existing catalog UI from earlier work; these flows only assert that
Home is reachable, not catalog behavior.

## Test user

- Email default: `e2e-reader@example.test`
- Password: from `E2E_READER_PASSWORD` in `backend/.env.e2e`
- Seeded by `backend/prisma/seed-e2e-reader.ts` (refuses `APP_ENV=production`)

## Isolation (Phase 1)

- Dedicated DB `lib_app_e2e` (prepare script refuses default name `lib_app`)
- Maestro `clearState: true` on flows that need a signed-out start
- Session-restore flow relaunches **without** clearing state
- Limitation: no full truncate between every flow; re-run `prepare-db.sh` / re-seed if data drifts

## Replit

Replit may host/run the Nest API + Postgres for development. **Native Maestro +
Android Emulator E2E is expected to run on a local Cursor machine** (or future CI),
not inside Replit.

## Intentionally deferred

- iOS Simulator E2E
- CI / GitHub Actions / Maestro Cloud / device farms
- Detox
- Offline, Stripe, Reader engines
- R2 catalog assertions / search / collections
- Roadmap STEPs

## Troubleshooting

- `localhost` from the emulator does not reach the host API — use `10.0.2.2`.
- Nest loads `backend/.env` by file, but variables already exported from
  `.env.e2e` (via `start-api.sh`) take precedence.
- Expo Metro embeds `mobile/.env` into the JS bundle (`expo/virtual/env`) and
  that value wins over shell exports. `e2e/start-metro.sh` temporarily replaces
  `mobile/.env` with `mobile/.env.e2e` for the Metro process (backup restored on
  exit) so the E2E bundle gets `http://10.0.2.2:3001`. Normal `expo start` is
  unchanged (`mobile/.env` → `http://localhost:3000`).
- Expo Go app id is `host.exp.exponent`. Dev client: `MAESTRO_APP_ID=com.libapp.reader`.
