# Mobile Reader (Expo + React Native + TypeScript)

Production-oriented reader client for children from about **age 6**, while remaining
suitable for older children, teenagers, and adults.

Develop in **Cursor**. Validate in **Replit** without changing the architecture.
Replit is a test host only.

## Stack

- Expo (managed workflow)
- React Native
- TypeScript (strict)
- Jest (`jest-expo`)
- ESLint (`eslint-config-expo`)

## Layout

```text
mobile/
  src/
    root/                # App entry (named root, not app — avoids Expo Router)
    config/              # env and public runtime config
    features/bootstrap/  # R0 smoke screen only
    shared/              # shared UI/utils (empty in R0)
  assets/
  app.json
  index.ts
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

## Native dependencies (R0)

None beyond the Expo managed runtime. Prefer Expo modules for later reader features.
Document any new native dependency and its setup in this README before adding it.

## Out of scope for R0

Auth, catalog, dual engines, Smart Resume, offline DRM, subscriptions, audiobooks.
