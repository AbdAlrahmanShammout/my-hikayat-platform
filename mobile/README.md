# Mobile Reader (Expo + React Native + TypeScript)

Production-oriented reader client for children from about **age 6**, while remaining
suitable for older children, teenagers, and adults.

**Architecture authority:** [`docs/MOBILE-ARCHITECTURE.md`](../docs/MOBILE-ARCHITECTURE.md).
This README is the package runbook only (commands, env, Replit).

Develop in **Cursor**. Validate in **Replit** without changing the architecture.
Replit is a test host only.

## Stack

- Expo (managed workflow) + Expo Router
- React Native (New Architecture) + TypeScript (strict)
- TanStack Query (server state)
- React Hook Form + Zod (forms)
- `expo-secure-store` (access token; `localStorage` on web)
- Jest (`jest-expo`)
- ESLint (`eslint-config-expo`)

## Layout

```text
mobile/
  src/
    app/                 # Expo Router routes + layouts only
    screens/             # thin route-level composition
    features/            # product capabilities (auth, catalog, …)
    api/                 # HTTP client, ApiError, query client
    session/             # session provider + token store
    storage/             # SecureStore adapter
    config/              # validated public env
    theme/               # colors, spacing, typography
    generated/           # OpenAPI wire types (do not edit by hand)
  assets/
  app.json
  .env.example
```

## Environment

Copy `.env.example` to `.env` (gitignored via the repo root rules):

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | NestJS API origin, no trailing slash |

Do not commit secrets, device paths, or machine-only URLs.

On Replit, set the same variable in Secrets / environment. Point it at a reachable
API host (not a developer-laptop-only address unless Replit can reach it).

## Commands (from repo root)

```bash
pnpm install
pnpm --filter mobile start
pnpm --filter mobile typecheck
pnpm --filter mobile lint
pnpm --filter mobile test
pnpm --filter mobile build
```

From `mobile/` (npm works if the workspace install is unavailable):

```bash
npm start
npm run typecheck
npm run lint
npm test
npm run build
```

## Replit checklist

1. Clone / import the monorepo (or this `mobile/` package with workspace install).
2. Run `pnpm install` at the repo root.
3. Set `EXPO_PUBLIC_API_BASE_URL`.
4. Run `pnpm --filter mobile typecheck`, `lint`, and `test`.
5. Run `pnpm --filter mobile start` (or `web` when a native simulator is unavailable).

## Native dependencies

| Package | Why |
| --- | --- |
| `expo-router` | File-based navigation and deep links |
| `expo-secure-store` | Persist Bearer access token off the JS heap on native |
| `expo-web-browser` | Stripe Checkout auth session (`openAuthSessionAsync`) |
| `react-native-screens` | Native screen primitives (Expo Router peer) |
| `react-native-safe-area-context` | Safe areas for tab shell |
| `react-native-gesture-handler` | Gesture root for navigation |
| `react-native-reanimated` | Native motion (Expo Router peer) |

Prefer Expo modules for later reader features. Document any new native dependency
and its setup here before adding it. Architecture rules live in
`docs/MOBILE-ARCHITECTURE.md`.

## Auth (STEP 32 / R1)

Uses existing backend contracts only:

- `POST /auth/register` → reader session
- `POST /auth/login` → session
- `GET /auth/me` → restore session

Token storage: SecureStore on iOS/Android, `localStorage` on web. A 401 clears the token.

## Out of scope until later STEPs

Catalog, dual engines, Smart Resume, offline DRM, subscriptions UI, audiobooks.
