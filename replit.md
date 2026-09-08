# Replit development

## Mobile app

This repository is a pnpm monorepo. The Replit preview runs only the existing Expo mobile package in web mode:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm --filter mobile exec expo start --web --port 5000
```

The configured workflow is named `Mobile Expo Web`.

Required environment variables:

- `EXPO_PUBLIC_API_BASE_URL`: reachable NestJS API origin without a trailing slash.
- `EXPO_PUBLIC_OFFLINE_LEASE_PUBLIC_KEY`: public Ed25519 key matching the backend key pair. Offline lease verification needs this value.

## GitHub synchronization

The working branch is `develop`, tracking `origin/develop` on GitHub. Replit cannot see uncommitted files on a developer laptop. To bring local changes here:

1. Commit locally and push to `origin/develop`.
2. Pull/sync `develop` in Replit.
3. Resolve any conflicts before continuing.

Push Replit commits to the same branch when the laptop also needs changes made here.