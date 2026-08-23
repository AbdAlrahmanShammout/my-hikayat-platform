# Mobile Architecture & Engineering Conventions

> **Scope:** This document describes the engineering system for a production React Native mobile
> application — layering, folder organization, naming, dependency flow, navigation, native-device
> integrations, data access, session handling, local persistence, UI composition, testing, build and
> release conventions. It deliberately excludes the business domain.
>
> **How to use it:** An AI agent or developer starting an empty mobile application should be able to
> read this file and build a completely different product that is structurally indistinguishable from
> this one. Do not invent a parallel mobile architecture.
>
> **What this file is not:** a product specification, screen inventory, sprint board, API contract,
> backend design document, or STEP/task list. Product behavior belongs in the product/SRS. Live HTTP
> paths and payload fields belong in OpenAPI. Delivery status belongs in the task document.
>
> **Reuse:** stack, layering, naming, native boundaries, and engineering rules transfer to other
> React Native applications. Placeholders such as `<feature>`, `<audience>`, and `Widget` represent
> business-specific concepts that must be replaced by the consuming product.
>
> **This repository:** backend architecture lives at repo-root `ARCHITECTURE.md` (not
> `docs/BACKEND_ARCHITECTURE.md`). Web dashboard architecture is `docs/FRONTEND-ARCHITECTURE.md`.
> Delivery status is `docs/admin-dashboard-tasks.md`. Mobile package runbook is `mobile/README.md`.

---

## 1. Authority and documentation hierarchy

### 1.1 Which document governs what

Keep architecture, product behavior, backend internals, API contracts, and delivery tracking separate.

| Document | Governs | Does not govern |
| --- | --- | --- |
| Product / SRS | What the app must do | How React Native code is structured |
| Backend architecture | Server layering, services, repositories, persistence | Mobile navigation, local state, native APIs |
| OpenAPI contract | HTTP routes, request/response wire shapes | Screen composition and local UX |
| Web frontend architecture | React dashboard implementation | Native mobile implementation |
| **This file** | React Native mobile engineering architecture | Business rules, backend internals, task status |
| Task / STEP list | What to build next and whether it is done | Architecture rules |

The backend remains the source of truth for business behavior, authorization, entitlement,
monetization, eligibility, persistence, and validation.

The mobile application consumes backend HTTP APIs according to the wire contract. It must not copy
backend modules, repositories, ORM models, transactions, or business-service logic into the client.

### 1.2 Mobile / backend boundary

The mobile app may own:

- presentation logic
- navigation and route composition
- local interaction state
- client-side form validation for UX
- device permissions and native capability orchestration
- secure storage of session credentials
- display formatting
- cache policy
- connectivity and app-lifecycle integration

The mobile app must not become authoritative for:

- authorization or ownership
- eligibility or entitlement
- monetization or payment state
- server workflow transitions
- audit behavior
- critical calculations
- canonical validation
- backend-generated rankings, aggregates, or business metrics

If a value or decision comes from the backend, display or act on the backend value. Do not silently
recalculate critical business values on-device.

---

## 2. Mobile scope

This architecture covers a **React Native application for iOS and Android** consuming a separate HTTP
API. The default runtime is **Expo + React Native + TypeScript**, using the current stable React Native
New Architecture.

Primary scope:

- authenticated and unauthenticated native screens
- iOS and Android
- file-based navigation and deep linking
- secure session storage
- API-backed server state
- local UI state
- device permissions and native integrations
- push-notification entry points
- foreground/background lifecycle handling
- app builds, previews, releases, and over-the-air JS updates where safe

Out of scope unless explicitly required by the product:

- a second backend-for-frontend
- embedding backend source code in the app
- custom native modules when an existing maintained Expo/React Native module solves the need
- offline-first conflict resolution
- background execution that is not a product requirement
- web/desktop layout parity

A feature may use a native capability only when that capability belongs to the product requirement.
Do not add camera, location, contacts, notifications, biometrics, background tasks, or analytics merely
because the platform supports them.

---

## 3. Core principles

1. **Feature-oriented organization.** Group application code by business capability.
2. **Thin routes.** Route files compose screens; they do not own workflows or API implementation.
3. **Layered separation.** UI, feature/application logic, API/data access, native infrastructure, and
   app bootstrap stay distinct.
4. **Contract-first integration.** The mobile app consumes generated or typed wire contracts, never
   backend implementation types.
5. **TypeScript-first.** Strict types at every boundary.
6. **Backend authority.** Business truth remains on the server.
7. **Server state is not UI state.** Do not mirror API resources into a global client store.
8. **Secure by default.** Credentials and secrets use secure platform storage; non-sensitive local
   preferences use ordinary local storage.
9. **Native concerns are isolated.** Device APIs are accessed through narrow adapters, not scattered
   across feature components.
10. **App lifecycle is explicit.** Foreground/background and network connectivity integrate with the
    data layer intentionally.
11. **Composition over inheritance.** Prefer focused functions, hooks, and components.
12. **Small, focused modules.** Avoid god components, god hooks, and global singleton state.
13. **Predictable dependency direction.** No cycles.
14. **No premature abstractions.** Add a shared abstraction only after genuine reuse appears.
15. **Platform differences are deliberate.** Use `.ios.tsx` / `.android.tsx` only where behavior truly
    differs; do not fork whole features by platform.
16. **Measure performance.** Do not optimize speculatively.
17. **Accessibility is part of correctness.** Native accessibility behavior is not optional polish.
18. **Production behavior is observable.** Crashes and meaningful runtime failures must be diagnosable.
19. **Release configuration is code.** Build profiles, app identifiers, schemes, permissions, and
    runtime versions are reviewed configuration, not manual tribal knowledge.
20. **Simple architecture that scales.** Prefer the smallest architecture that preserves boundaries.

---

## 4. Allowed dependency direction

```text
src/app/ routes + layouts
  → src/screens/ route-level composition
    → src/features/<feature>/ feature UI + hooks + application logic
      → shared ui/, api/, storage/, native/, lib/, config/, generated/
        → backend HTTP API / operating-system capability
```

Or conceptually:

```text
Route → Screen → Feature → Data/Native Adapter → External System
```

### 4.1 Rules

- `src/app/` is owned by Expo Router and contains route files and route layouts only.
- `src/app/` may import screens, app providers, guards, and shared routing helpers.
- `src/screens/` composes feature components into route-level screens.
- `src/screens/` must not contain raw HTTP calls, secure-storage calls, or large workflows.
- `src/features/<feature>/` may import shared `ui`, `api`, `storage`, `native`, `lib`, `config`, and
  generated contract types.
- A feature must not import another feature's internal files.
- Cross-feature orchestration belongs in the feature that owns the user outcome, or in a small
  application-level coordinator when no single feature owns it.
- `src/ui/` must not import features or feature APIs.
- `src/api/` must not import screens or features.
- `src/native/` must not import screens or business features.
- `src/storage/` must not import screens or features.
- `src/lib/` contains business-agnostic utilities only.
- `src/generated/` is generated code and must not import handwritten application code.
- No circular dependencies.

If two features need the same presentational component, move only that component to `ui/`. If they
need the same business behavior, first question the domain ownership before extracting a generic
shared service.

---

## 5. Required mobile stack

These are architectural defaults for a new application. They are not an installation checklist.

| Concern | Decision |
| --- | --- |
| Package manager | pnpm workspace |
| Mobile package | `mobile/` workspace package |
| Runtime | Expo + React Native |
| Language | TypeScript, strict mode |
| React Native architecture | New Architecture enabled |
| JavaScript engine | Hermes |
| Navigation | Expo Router |
| Server state | TanStack Query |
| Forms | React Hook Form + Zod |
| Secure credential storage | `expo-secure-store` |
| Non-sensitive key/value storage | AsyncStorage, only when persistence is required |
| Connectivity | `@react-native-community/netinfo` integrated with TanStack Query |
| Motion | `react-native-reanimated` for meaningful native motion |
| Icons | `lucide-react-native` unless the product design system specifies another single pack |
| Images | `expo-image` for remote/cached application images |
| Safe areas | `react-native-safe-area-context` |
| Gestures | `react-native-gesture-handler` when interaction requires it |
| API contract types | Generated from backend OpenAPI documents |
| Unit/integration tests | Jest + React Native Testing Library |
| E2E | Maestro or Detox for critical journeys; choose one per project |
| Builds/releases | EAS Build / Submit by default |
| OTA JS updates | EAS Update with explicit runtime-version policy |
| Error monitoring | One centralized provider (for example Sentry) when production monitoring is required |

### 5.1 Why Expo by default

Expo is the default because it provides a coherent React Native toolchain, config plugins, build and
update infrastructure, and first-party modules for common native capabilities while retaining the
ability to generate native projects when required.

Do not eject/prebuild permanently merely because native folders can be generated. Add custom native
code only when a real requirement cannot be met through maintained Expo/React Native modules.

### 5.2 Why Expo Router

Expo Router is the routing standard for this architecture because it provides typed file-based routes,
native navigation integration, and deep-linkable routes while keeping route files declarative.

Route files are not feature modules. Treat them as composition entry points.

### 5.3 Why no global state library by default

TanStack Query owns server state. React local state, reducers, and narrowly scoped contexts own UI
state. Do not introduce Redux, Zustand, MobX, or another global store until a documented application
state problem cannot be represented cleanly without it.

---

## 6. Monorepo placement

```text
<repo>/
  package.json
  pnpm-workspace.yaml
  backend/
  frontend/
  mobile/
  ARCHITECTURE.md                # NestJS backend (this repo)
  docs/
    FRONTEND-ARCHITECTURE.md
    MOBILE-ARCHITECTURE.md
```

Rules:

- Keep mobile dependencies in `mobile/package.json`.
- Match the workspace Node and pnpm policy.
- Do not hoist React Native-specific dependencies into backend packages.
- Use the repository Prettier convention unless a documented mobile exception exists.
- Use `strict: true` TypeScript.
- Use `@/*` alias for `mobile/src/*`.
- Do not import source directly from `frontend/` or `backend/`.
- Shared generated artifacts may live in a dedicated workspace package only when they are truly
  platform-neutral and generated from the same contract.

---

## 7. Project structure

Use this feature-oriented tree under `mobile/src/`.

```text
mobile/
  src/
    app/                         # Expo Router route files + layouts only
      _layout.tsx
      index.tsx
      (public)/
      (auth)/
      (app)/
      +not-found.tsx

    screens/                     # route-level composition, thin
      sign-in-screen.tsx
      home-screen.tsx
      widget-detail-screen.tsx

    features/
      auth/
        components/
        hooks/
        api/
        schemas/
        lib/
      widgets/
        components/
        hooks/
        api/
        schemas/
        lib/

    ui/                          # reusable design-system UI with no feature ownership
      primitives/
      feedback/
      layout/
      forms/

    api/                         # HTTP infrastructure, errors, query client, query conventions
      client.ts
      api-error.ts
      query-client.ts
      query-keys.ts

    session/                     # application session infrastructure
      session-provider.tsx
      session-store.ts
      session.types.ts

    storage/                     # storage adapters only
      secure-storage.ts
      local-storage.ts

    native/                      # operating-system/device adapters
      connectivity/
      notifications/
      permissions/
      linking/
      haptics/
      biometrics/

    config/                      # validated public runtime/build configuration
      env.ts
      app-config.ts

    theme/                       # tokens, spacing, typography, semantic colors
      colors.ts
      spacing.ts
      typography.ts
      theme.ts

    lib/                         # generic helpers without business ownership
      dates.ts
      format.ts
      invariant.ts

    types/                       # genuinely cross-feature handwritten app types only

    generated/                   # OpenAPI-generated types/client; never edit by hand

    test/
      setup.ts
      factories/
      mocks/

  assets/
  app.config.ts
  eas.json
  package.json
  tsconfig.json
```

Do not create every optional folder on day one. Add subfolders only when the responsibility exists.

### 7.1 `src/app/`

`src/app/` is the Expo Router surface. It owns:

- route definitions through filenames
- route groups
- route-level layouts
- stack/tab/modal composition
- top-level redirects
- wiring application providers in the root layout

It does not own:

- API functions
- feature hooks
- complex forms
- business workflows
- direct storage access
- native permissions logic

A route file should usually be a few lines that imports a screen and exports it.

### 7.2 `src/screens/`

Screens are route-level composition components. They arrange feature components and shared UI into one
user-visible screen.

Screens may:

- read route parameters through a small typed adapter
- compose feature hooks and components
- define screen layout
- trigger feature-level actions

Screens must not:

- call `fetch` directly
- read SecureStore directly
- call native SDKs directly
- reproduce backend rules
- own generic API error parsing

### 7.3 `src/features/`

A feature is a product capability, not a screen and not a backend module name.

Canonical feature shape:

```text
features/widgets/
  components/
  hooks/
  api/
  schemas/
  lib/
  widgets.types.ts              # only feature-local handwritten UI types when needed
  *.spec.tsx
```

Responsibilities:

- `components/`: feature-owned presentational and interactive UI
- `hooks/`: feature application logic and TanStack Query composition
- `api/`: typed feature API functions using the shared HTTP client
- `schemas/`: client-side Zod schemas for form UX only
- `lib/`: feature-local pure helpers

Do not mirror backend folder structure mechanically. Map mobile features to product capabilities and
API contracts.

### 7.4 `src/ui/`

Shared, domain-agnostic UI primitives and patterns.

Examples:

- `Button`
- `TextField`
- `Screen`
- `AppText`
- `Card`
- `Divider`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `BottomSheet` wrapper only if reused and justified

Shared UI must not import feature hooks, feature APIs, or domain-specific types.

### 7.5 `src/api/`

Owns transport concerns:

- base URL
- request construction
- auth header injection
- timeouts
- JSON serialization
- typed error normalization
- query-client defaults
- API instrumentation hooks

It does not own endpoint-specific business methods. Those live in `features/<feature>/api/`.

### 7.6 `src/session/`

Session is app infrastructure, not ordinary feature state.

It owns:

- session bootstrap status
- access-token availability
- current authenticated principal
- sign-in/sign-out session transitions
- secure token persistence
- current-user hydration
- optional refresh coordination only when the API contract provides refresh

It must not become a global store for unrelated server resources.

### 7.7 `src/storage/`

Storage wrappers isolate platform libraries and key naming.

- `secure-storage.ts`: tokens and small secrets only
- `local-storage.ts`: non-sensitive preferences only

Features should not call `expo-secure-store` or AsyncStorage directly.

### 7.8 `src/native/`

Native capabilities live behind narrow adapters. Examples:

- connectivity
- notifications
- permissions
- deep-link normalization
- haptics
- biometrics
- camera/location/files when required

A feature may depend on a narrow adapter. It must not spread direct operating-system calls across UI
components.

### 7.9 `src/theme/`

Theme is code, not scattered constants.

Keep:

- semantic colors
- typography scale
- 4pt spacing scale
- radii
- elevation/shadow policy
- icon sizing conventions

Do not place feature-specific colors or layout constants in the global theme.

### 7.10 `src/generated/`

Generated OpenAPI types/clients only. Never edit by hand.

Do not import backend DTO source classes. The wire contract is the client boundary.

---

## 8. Naming conventions

- Files/directories: `kebab-case`
- React components: `PascalCase`
- Hooks: `camelCase`, always prefixed with `use`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE` only for true constants
- Route segments: short, stable, lowercase
- Dynamic route segments: `[widgetId].tsx`
- Platform files: `name.ios.tsx`, `name.android.tsx` only when necessary
- Tests: colocate as `*.spec.ts` / `*.spec.tsx`
- One primary export per handwritten file where practical
- No feature-level barrel `index.ts` files

Prefer exact imports over broad barrels. Barrels hide dependency direction and make cycles easier to
create.

---

## 9. Routing and navigation

### 9.1 Route structure

Navigation is implemented with Expo Router under `src/app/`.

Use route groups for navigation concerns without polluting public URLs:

```text
src/app/
  _layout.tsx
  (public)/
    sign-in.tsx
    forgot-password.tsx
  (app)/
    _layout.tsx
    (tabs)/
      _layout.tsx
      home.tsx
      profile.tsx
    widgets/
      [widgetId].tsx
```

### 9.2 Thin-route rule

A route file should generally delegate to a screen:

```tsx
import { WidgetDetailScreen } from '@/screens/widget-detail-screen';

export default WidgetDetailScreen;
```

If a route file grows feature logic, move that logic into a screen or feature.

### 9.3 Navigation state

Do not duplicate navigation state in a global store. The router is authoritative for the navigation
stack.

Do not keep a second `currentScreen` variable.

### 9.4 Typed parameters

Treat route parameters as untrusted input.

- parse and validate dynamic IDs before using them
- do not assume a deep-link parameter is valid because the route matched
- never use a route parameter as authorization proof

### 9.5 Deep links and universal/app links

All externally reachable links must resolve through the routing layer.

Rules:

- configure one canonical URL scheme per environment where required
- configure iOS Universal Links / Android App Links for production domains when product needs them
- normalize third-party incoming links before navigation
- validate external parameters
- opening a deep link may navigate, but must never bypass backend authorization
- destructive actions must not execute solely because a deep link was opened

### 9.6 Route guards

Client route guards are UX only.

They may:

- redirect signed-out users
- hide navigation destinations unavailable to the current audience
- skip public auth screens for already-authenticated users

They do not provide security. Backend guards and domain rules remain authoritative.

---

## 10. Application bootstrap

The root layout is a composition root, not a business workflow.

Canonical bootstrap order:

```text
Native app starts
  → load validated public configuration
  → initialize monitoring/logging adapter
  → initialize QueryClient
  → hydrate session token from SecureStore
  → establish connectivity + AppState listeners
  → if token exists, load current user
  → resolve authenticated/unauthenticated route tree
  → hide splash screen only when routing decision is stable
```

Do not render the authenticated route tree before session bootstrap is resolved, otherwise the app can
flash the wrong screen.

Top-level providers should remain few and intentional. Avoid a provider for every feature.

---

## 11. Server state vs client state vs persisted state

### 11.1 Server state

Server state includes API resources and the current user.

Use TanStack Query.

Examples:

```ts
['<audience>', 'widgets', 'list', { limit, cursor }]
['<audience>', 'widgets', 'detail', widgetId]
```

Rules:

- query keys are structured and feature-scoped
- invalidate the smallest affected query set
- do not "invalidate everything" after every mutation
- do not copy query data into a global store
- do not keep a second normalized client database without a documented need
- do not fetch data a screen does not need

### 11.2 UI state

Examples:

- selected tab inside a screen
- sheet/modal open state
- unsaved form values
- local filter draft
- accordion expansion
- transient animation state

Keep UI state as close as possible to the component that owns it.

Use `useState`, `useReducer`, or a small scoped context when several related descendants require the
same UI state.

### 11.3 Persisted local state

Persist only information that must survive process restarts.

Examples of acceptable non-sensitive persistence:

- completed local tutorial flag
- display preference
- dismissed announcement identifier
- draft identifier when product explicitly supports local drafts

Do not persist state merely to avoid refetching.

### 11.4 Offline state

The default architecture is **online-first with graceful temporary disconnection**, not offline-first.

Do not add offline write queues, conflict resolution, or local databases unless the product explicitly
requires offline behavior.

If query-cache persistence is enabled:

- persist only approved, non-sensitive query data
- define cache versioning
- define maximum age
- clear incompatible caches on schema/version change
- never treat persisted cache as authoritative server truth

---

## 12. TanStack Query lifecycle integration

React Native does not have browser focus/online events. Integrate native lifecycle explicitly.

### 12.1 App focus

Connect `AppState` to TanStack Query `focusManager` so stale queries may refetch when the app returns
to the foreground according to query policy.

Do this once at app infrastructure level, not inside each feature.

### 12.2 Connectivity

Connect NetInfo to TanStack Query `onlineManager` once.

Do not show "offline" merely because one request failed. Use actual connectivity state plus request
errors appropriately.

### 12.3 Screen focus

Do not refetch every query every time a screen receives focus.

Use screen-focus refetch only when product freshness requires it and ordinary stale-time/app-focus
behavior is insufficient.

---

## 13. Data fetching and feature hooks

Preferred chain:

```text
Screen/Component
  → feature hook
    → feature API function
      → shared HTTP client
        → backend HTTP API
```

Feature hooks own:

- TanStack Query calls
- loading/error/success state composition
- mutation behavior
- query invalidation
- optional optimistic UI when correctness permits it

Components must not contain raw transport implementation details.

Do not hand-roll a cache.

---

## 14. API layer

Treat the backend API as a contract.

### 14.1 Shared client responsibilities

Centralize:

- base URL from validated app configuration
- `Authorization: Bearer <accessToken>`
- request timeout policy
- JSON serialization/deserialization
- API error-envelope normalization
- request IDs/correlation IDs when the backend exposes them
- network error classification
- cancellation through `AbortSignal` where supported

Do not scatter `fetch` or Axios setup through features.

### 14.2 Feature API functions

Endpoint-specific functions belong to the owning feature:

```text
features/widgets/api/
  get-widget.ts
  list-widgets.ts
  create-widget.ts
```

Each function:

- takes a named input object when multiple meaningful inputs exist
- returns the typed wire result or a narrow mapped view model when UI adaptation is necessary
- does not implement business rules

### 14.3 Generated contract types

Prefer OpenAPI generation for request/response types and optionally the transport client.

Rules:

- use the audience OpenAPI document that matches the mobile surface
- do not manually duplicate API DTOs
- do not import backend source types
- do not rename wire fields silently
- do not convert server semantics while mapping

### 14.4 Pagination

Follow the live API contract exactly: cursor, offset/limit, or another scheme.

Do not invent client pagination semantics. For infinite lists, use TanStack Query infinite-query APIs
when they map naturally to the backend contract.

### 14.5 Money, dates, durations, metrics

- preserve backend units
- format only for display
- parse timestamps explicitly
- do not infer timezone when the contract provides one
- do not recompute backend aggregates or entitlement math

---

## 15. Authentication and session architecture

The backend is the security authority.

### 15.1 Session storage

Store access/refresh credentials only in the secure-storage adapter.

Do not store tokens in:

- AsyncStorage
- Zustand/Redux persistence
- plain files
- logs
- analytics properties
- route parameters

### 15.2 Session bootstrap

At startup:

1. Read the session credential from SecureStore.
2. If absent, resolve signed-out state.
3. If present, attach it to the API client and request the current principal.
4. If current-user succeeds, resolve signed-in state.
5. If the backend returns an authentication failure, clear local session credentials and cache.
6. Resolve navigation only after bootstrap is stable.

Do not trust locally decoded JWT claims as a replacement for the current-user contract when the app
needs the current principal.

### 15.3 Refresh tokens

Implement refresh only if the API contract provides it.

If refresh exists:

- keep refresh credentials in secure storage
- use one refresh coordinator so concurrent 401s do not trigger parallel refresh storms
- retry an eligible failed request at most once after successful refresh
- prevent recursive refresh loops
- on refresh failure, clear session and authenticated cache

If refresh does not exist, a 401 means signed out.

### 15.4 Sign-out

Sign-out must clear:

- secure credentials
- authenticated principal
- private TanStack Query cache
- feature-specific sensitive transient state

Then replace the authenticated navigation stack rather than pushing a login screen on top of it.

### 15.5 Role vs capability

Preserve the backend distinction between identity role and domain capability.

The app may hide or disable UI based on fields returned by the API. It must not infer authorization
from hidden buttons or local role assumptions.

---

## 16. Secure storage and local persistence

### 16.1 SecureStore

Use SecureStore for small sensitive values such as session credentials.

Do not use SecureStore as a database or as the only source of truth for irreplaceable data.

Keep key names centralized:

```ts
export const SECURE_STORAGE_KEYS = {
  accessToken: 'session.access-token',
  refreshToken: 'session.refresh-token',
} as const;
```

### 16.2 AsyncStorage

AsyncStorage is allowed only for non-sensitive key/value persistence.

Do not store:

- access tokens
- refresh tokens
- passwords
- private keys
- sensitive user profile payloads

### 16.3 Storage versioning

Any persisted structured object must include a version or have a migration strategy.

Do not assume a local serialized shape will remain compatible forever.

---

## 17. Forms and validation

Use React Hook Form for non-trivial forms and Zod for client-side UX schemas.

Client validation improves interaction. Backend validation remains authoritative.

Forms must support:

- disabled/loading submit state
- field validation
- backend field errors when the API envelope supplies them
- keyboard-safe layout
- focus movement to the first invalid field where useful
- accessible labels and error announcements
- submit from keyboard when appropriate
- preservation of intentional user input after recoverable server failure

Do not duplicate complex server validation rules merely to make the client reject earlier.

---

## 18. Error handling

Every asynchronous feature needs intentional states for:

- loading
- empty
- success
- recoverable error
- unrecoverable/terminal error where relevant

### 18.1 Typed API error

Normalize API failures into one app-level shape, for example:

```ts
type ApiError = {
  status?: number;
  code?: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
  kind: 'http' | 'network' | 'timeout' | 'unknown';
};
```

The exact fields must follow the backend contract.

### 18.2 UX mapping

| Failure | Mobile behavior |
| --- | --- |
| Validation | Map to fields where possible |
| 401 | Clear/recover session according to auth contract |
| 403 | Explain action is unavailable; do not pretend hiding was security |
| 404 | Not-found state |
| 409 / business conflict | Actionable message when backend message is intended for users |
| 429 | Retry guidance; respect server retry policy |
| 5xx | Generic failure + retry where safe |
| Network unavailable | Connectivity-aware offline/retry state |
| Timeout | Retryable network state |

Never display stack traces, raw native errors, access tokens, or provider SDK internals to users.

### 18.3 Error boundaries

Use React error boundaries at meaningful application boundaries to prevent one unexpected render error
from leaving the whole application unusable.

Error boundaries do not replace API error handling.

---

## 19. Loading, refresh, and empty states

### 19.1 Initial loading

Use skeletons or layout-preserving placeholders for content-heavy screens. Avoid full-screen spinners
when only one section is loading.

### 19.2 Pull to refresh

Pull-to-refresh is a user-driven refetch affordance, not a second data architecture. Connect it to the
owning query's `refetch` behavior.

### 19.3 Mutation loading

Disable duplicate submission while the mutation is in flight unless the operation explicitly supports
parallel actions.

### 19.4 Empty state

An empty list is not an error. Explain what is empty and the next useful action when one exists.

---

## 20. UI system

### 20.1 Styling policy

Use React Native styles through reusable theme tokens and shared UI components.

The default architecture does **not** require a third-party styling framework. If NativeWind,
Tamagui, Unistyles, or another styling system is introduced, that is an architectural dependency and
must be documented.

Rules:

- use semantic theme tokens rather than scattered literal colors
- use the 4pt spacing system
- avoid magic pixel values
- keep typography consistent
- do not create per-feature design systems
- platform-specific visual differences should follow platform behavior, not arbitrary divergence

### 20.2 Theme tokens

Use semantic names:

```text
color.background
color.surface
color.textPrimary
color.textSecondary
color.border
color.primary
color.success
color.warning
color.danger
```

Do not spread hex values throughout feature components.

### 20.3 Dark mode

Support dark mode only when the product requires it, but structure tokens so adding it does not require
rewriting feature components.

### 20.4 Components

Prefer primitive composition over giant generic components.

A shared component must have demonstrated reuse or clear design-system ownership.

Do not create a universal `DynamicComponent` driven by huge configuration objects.

---

## 21. Layout and device adaptation

Mobile layout must account for:

- safe areas
- small and large phones
- dynamic text sizes
- orientation only if the product supports it
- keyboard appearance
- notches/dynamic islands/system bars
- tablets if tablet support is in product scope

Rules:

- never hardcode dimensions from one device screenshot
- avoid absolute positioning for structural layout
- use flexbox as the default layout system
- constrain content widths on large screens/tablets where appropriate
- define intentional keyboard behavior for forms
- test smallest supported device size and large accessibility text

---

## 22. Lists and collections

Use `FlatList`/`SectionList` for normal virtualized lists.

Introduce FlashList or another specialized list only when measured performance or list scale warrants
it.

Rules:

- stable keys from backend IDs
- no array index as key for mutable lists
- avoid heavy inline render functions when they cause measured churn
- implement loading/empty/error/refresh states
- paginate from the API rather than loading unbounded collections
- do not nest large virtualized lists unnecessarily

---

## 23. Images and media

Use `expo-image` for application images when caching, transitions, and native image performance matter.

Rules:

- provide explicit layout dimensions/aspect ratio to avoid layout jumps
- use thumbnails for list views when available
- do not download original full-resolution media for tiny previews
- handle failed image state
- avoid embedding large base64 assets in JS bundles
- place static application assets under `assets/`

For upload flows:

- compress/resize only when product requirements allow it
- show progress for meaningfully long operations
- cancellation must not leave UI in an impossible state
- backend remains authoritative for upload acceptance and processing status

---

## 24. Motion, gestures, and haptics

### 24.1 Motion

Use Reanimated for purposeful native motion:

- screen/content transitions when navigation does not already handle them
- interactive gestures
- state transitions
- feedback that improves comprehension

Do not animate everything.

Respect reduced-motion accessibility settings where applicable.

### 24.2 Gestures

Use gesture-handler primitives when native gestures are required. Do not replace standard buttons and
scroll behavior with custom gesture recognizers without a UX reason.

### 24.3 Haptics

Haptics are optional feedback, never the only indication of state.

Centralize haptic semantics in a small adapter if used across features.

---

## 25. Accessibility

Accessibility is a first-class requirement.

Required:

- accessible names/labels for controls
- correct roles
- logical reading order
- touch targets large enough for reliable interaction
- sufficient color contrast
- no information communicated by color alone
- support for dynamic text where practical
- screen-reader-friendly validation and status messages
- reduced motion where relevant
- focus management for modal/screen transitions when needed

Prefer native semantic controls over custom pressable containers.

Do not add accessibility labels that merely repeat obvious visible text unless the native control
requires it.

---

## 26. Permissions

Device permissions are part of product UX and privacy, not implementation trivia.

Rules:

1. Request a permission only immediately before the feature needs it.
2. Explain why before the system prompt when the reason is not obvious.
3. Handle `granted`, `denied`, and `blocked/restricted` states explicitly.
4. Do not repeatedly nag after denial.
5. Provide a route to system settings when the user must change a permanently denied permission.
6. Keep permission declarations/configuration synchronized with actual app behavior.
7. Do not request broad permissions when a narrower API exists.

Permission state is local device state. Business eligibility still comes from the backend.

---

## 27. Push notifications

Push notifications are a transport into the app, not a source of business truth.

Architecture:

```text
OS notification event
  → native notification adapter
    → normalized notification intent
      → router navigation / feature refetch
        → backend API validates current state
```

Rules:

- register and update device push tokens through a feature/API contract owned by the backend
- treat push tokens as revocable device identifiers
- never put secrets or sensitive full payloads in notification content
- opening a notification may navigate to a resource, but the resource must still be fetched and
  authorized by the backend
- handle foreground, background, and cold-start entry consistently
- deduplicate navigation when the same notification event is delivered more than once
- do not perform destructive business mutations solely from notification payload data

---

## 28. Deep links and external intents

External input is untrusted.

Normalize incoming links in `native/linking/` when third parties do not produce canonical application
URLs.

Rules:

- parse route parameters strictly
- reject unsupported schemes
- allowlist external redirect destinations where product security requires it
- do not expose tokens in URLs
- do not encode sensitive state into deep links
- keep authentication return/callback links isolated from normal content links

---

## 29. Native module boundary

Third-party/native SDK knowledge belongs in adapters, not features.

Example:

```text
native/biometrics/
  biometrics.ts                 # app-owned interface
  expo-biometrics.adapter.ts    # library-specific implementation
```

A feature should ask `biometrics.authenticate()` rather than import the underlying Expo/native library
in five different components.

Do not create an adapter around every trivial React Native function. Isolate dependencies that:

- touch platform permissions
- have vendor-specific types
- create side effects
- require mocking in tests
- are likely to be replaced
- expose secrets/device identifiers

---

## 30. Configuration and environments

Use explicit environments such as:

- development
- preview/staging
- production

Public client configuration may include:

- API base URL
- environment name
- public monitoring DSN
- public analytics identifier
- feature bootstrap values that are safe to ship in the binary

### 30.1 Client-side values are public

Anything compiled into the mobile application must be considered discoverable by users. Do not place
server secrets in `EXPO_PUBLIC_*` variables or app config.

True secrets needed only during CI/build belong in the build service's secret environment and must not
be copied into the runtime bundle.

### 30.2 Typed config

Read public environment values in one module and validate them before application startup.

Do not read `process.env` throughout features.

### 30.3 Environment identity

Development, preview, and production should have deliberate bundle/application IDs and backend URLs.
Do not let a production binary accidentally point at a local/staging API.

---

## 31. Security rules

Minimum mobile security posture:

- HTTPS only for production API traffic
- credentials in SecureStore
- no secrets in client-side environment variables
- no sensitive data in logs
- no tokens in deep links
- no authorization decisions based solely on UI state
- backend revalidates every protected action
- validate untrusted deep-link and push payloads
- keep third-party SDK permissions minimal
- keep dependencies current and remove abandoned native libraries
- avoid WebView for privileged application flows unless required and threat-reviewed

Do not introduce certificate pinning by default. It increases operational complexity and can break
clients during certificate rotation. Add it only when the product threat model explicitly requires it
and has a rotation/recovery design.

---

## 32. Privacy and sensitive data

Collect and persist the minimum device/user data needed for product behavior.

Rules:

- do not log request bodies containing sensitive data
- redact tokens and identifiers in error reporting
- do not send arbitrary screen/form state to analytics
- centralize analytics event definitions when analytics exists
- document every permission purpose
- avoid background location or contacts access unless product-critical
- clear local sensitive session state on sign-out

Privacy behavior belongs in product/legal requirements; this architecture defines only implementation
boundaries.

---

## 33. Performance

Optimize based on evidence.

### 33.1 Rendering

- use meaningful component boundaries
- avoid speculative `memo`, `useMemo`, and `useCallback` everywhere
- keep frequently changing state close to where it is rendered
- avoid giant context providers whose value changes on every render
- do not duplicate query results into state

### 33.2 Lists

- virtualize large collections
- paginate backend data
- keep list rows reasonably cheap
- avoid rendering hidden expensive subtrees

### 33.3 Images

- serve appropriately sized media
- use caching
- avoid large uncompressed local assets

### 33.4 Startup

- keep root providers minimal
- avoid blocking startup on non-essential analytics/SDK work
- resolve session before routing, but defer non-critical initialization
- keep synchronous JS work during launch small

### 33.5 Native/JS boundary

Use New-Architecture-compatible libraries. Avoid abandoned packages that depend on legacy native
patterns when maintained alternatives exist.

---

## 34. React Native platform rules

### 34.1 New Architecture

New projects use the React Native New Architecture by default.

Do not disable it to accommodate an outdated dependency without a documented architectural exception
and migration plan.

### 34.2 Hermes

Use Hermes unless a documented platform blocker requires otherwise.

### 34.3 Platform-specific code

Prefer shared code with small conditional differences.

Use platform-specific files when:

- a native API genuinely differs
- interaction conventions differ materially
- the implementation is clearer than repeated `Platform.OS` branches

Do not maintain parallel iOS and Android feature trees.

---

## 35. Testing architecture

Test behavior, not implementation structure.

| Test type | Use for |
| --- | --- |
| Unit | formatters, validators, query keys, error mappers, adapters with mocked native dependencies |
| Component | UI behavior, accessibility, loading/error/empty states, forms |
| Integration | feature hooks + UI + mocked network/storage/native boundary |
| E2E | critical journeys on real/simulated app builds |

### 35.1 React Native Testing Library

Prefer user-observable queries and interactions. Do not test internal component state.

### 35.2 Network mocking

Use a consistent network-mocking strategy in tests. Mock at the HTTP boundary rather than mocking every
feature hook.

### 35.3 Native adapters

Mock app-owned adapter interfaces rather than vendor SDK internals whenever possible.

### 35.4 E2E scope

E2E only critical journeys, for example:

- sign in/sign out
- primary navigation
- core create/update action
- deep-link entry
- permission-dependent critical path
- push-notification navigation when product-critical

Do not duplicate every component test as an E2E test.

---

## 36. Observability and logging

Production failures must be diagnosable without leaking sensitive data.

Use one centralized monitoring adapter.

Capture where useful:

- uncaught JS exceptions
- native crashes through the selected provider
- handled unexpected failures
- release/build version
- route name
- environment
- backend request/correlation ID when safe

Do not capture:

- passwords
- access/refresh tokens
- raw authorization headers
- sensitive form payloads
- unrestricted API request/response bodies

Use `console.*` only for temporary local development. Production diagnostic events should go through an
app-owned logger/monitoring abstraction.

---

## 37. Analytics

Analytics is optional product infrastructure, not a default requirement.

If introduced:

- one analytics adapter
- one typed event catalog
- stable event names
- minimal properties
- no sensitive payloads
- navigation analytics centralized at the router boundary when possible
- feature code emits semantic events, not vendor calls

Do not import the analytics vendor SDK directly across features.

---

## 38. Builds, releases, and OTA updates

### 38.1 Build profiles

Define at least:

- development build
- preview/internal distribution
- production/store build

Keep profile differences explicit in `eas.json` and app config.

### 38.2 Versioning

Maintain distinct concepts:

- user-visible app version
- native build number/version code
- OTA runtime version

Do not assume a JavaScript update is compatible with every native binary.

### 38.3 OTA update safety

OTA updates may change JS/assets that are compatible with the installed native runtime.

Rules:

- use an explicit runtime-version policy
- do not ship JS requiring native code absent from the installed binary
- test updates against the exact production runtime
- keep rollback/recovery procedure documented
- treat schema/persistence changes carefully across old binaries

### 38.4 Native changes

Any change to:

- native dependency
- config plugin affecting native code
- permissions manifest
- bundle capability
- native module

requires a new native build, not merely an OTA update.

---

## 39. Dependency rules

Do not add a library because it is popular.

Before adding a dependency:

1. Check React Native/Expo built-ins.
2. Check whether the project already solves the concern.
3. Check New Architecture compatibility.
4. Check current maintenance and release activity.
5. Check platform support for both iOS and Android.
6. Check bundle/native-size impact.
7. Check privacy and permission implications.
8. Check whether it complicates EAS/native builds.
9. Check accessibility implications for UI libraries.
10. Document architectural dependencies in the PR.

Prefer one library per concern.

Do not add overlapping navigation, networking, state, storage, icon, or animation stacks.

---

## 40. Import and dependency conventions

Preferred import direction:

```text
app/ → screens/ → features/ → shared infrastructure
```

Forbidden:

- `api/` importing `features/`
- `native/` importing `features/`
- `storage/` importing `features/`
- `ui/` importing feature hooks or APIs
- one feature importing another feature's private components/hooks/API files
- generated code importing handwritten feature code
- circular runtime imports
- deep relative paths when the `@/` alias provides a clear import

Type-only relationships should use `import type` where appropriate.

---

## 41. Code quality

Prefer:

- small components
- clear names
- single responsibility
- predictable data flow
- explicit dependencies
- narrow hooks
- pure helpers
- typed boundaries
- minimal abstraction

Avoid:

- 500-line screens
- god providers
- giant `useApp()` hooks
- catch-all `utils.ts`
- feature-agnostic "service" classes containing unrelated behavior
- nested ternary forests
- prop-drilling solved by global state when composition would work
- duplicated API types
- direct native SDK calls across many features
- silent error swallowing

Refactor repeated patterns when they are real patterns, not merely because two files look similar.

---

## 42. New feature checklist

Every new mobile feature must answer:

1. Which product capability owns it?
2. Which route/screen exposes it?
3. Which backend API contract does it consume?
4. Which server-state query keys does it own?
5. Which UI state is local?
6. Does anything need persistence across app restarts?
7. Is any persisted data sensitive?
8. Which loading, empty, success, and error states exist?
9. Which role/capability fields affect UI? Backend still enforces them.
10. Does it require a native permission?
11. Does it require deep-link or notification entry?
12. What happens when the device is offline?
13. What happens when the app backgrounds and returns?
14. Is the screen keyboard-safe?
15. Is it accessible with a screen reader and larger text?
16. Does it reuse the shared theme/UI system?
17. Does it require a new dependency? Why?
18. What test level proves the critical behavior?
19. Does it change native configuration, therefore requiring a new binary?
20. Does it leak any sensitive value to logs, URLs, analytics, or non-secure storage?

Do not create a feature folder without a real capability boundary.

---

## 43. Mobile UX quality bar

Production screens should feel:

- native
- calm
- responsive
- predictable
- fast
- accessible
- visually consistent
- resilient to slow/failed networks
- safe around device interruptions

Prioritize hierarchy, interaction clarity, and platform conventions over decorative complexity.

The user should never be left with:

- a blank screen
- an unexplained spinner
- a disabled action with no reason
- a keyboard covering the active field
- a dead deep link
- a permission dead end
- a stale authenticated screen after sign-out
- a destructive action triggered from untrusted external input

---

## 44. Anti-patterns

Do not:

- put business rules in screens
- use AsyncStorage for auth tokens
- decode JWT claims and treat them as the complete user model
- create a global store that mirrors the backend
- call raw `fetch` in components
- let every feature configure its own HTTP client
- let every feature call notification/location/camera SDKs directly
- add a second router
- maintain duplicate iOS and Android feature implementations
- make route files giant components
- persist all TanStack Query data blindly
- queue offline mutations without idempotency/conflict semantics
- retry unsafe mutations automatically without understanding server behavior
- use deep links or push payloads as authorization
- ship server secrets in app environment variables
- log bearer tokens or sensitive payloads
- disable the New Architecture just to keep an abandoned library
- introduce a custom native module before checking maintained Expo/RN options
- create abstractions that make simple platform APIs harder to understand
- use giant context values for unrelated application state
- use snapshots as the main test strategy

---

## 45. Non-negotiable mobile rules

Mandatory unless a documented architectural exception exists:

1. React Native + TypeScript strict mode.
2. New Architecture enabled.
3. Expo as the default application toolchain.
4. Expo Router for navigation.
5. Route files stay thin.
6. Feature-oriented code organization.
7. Predictable one-way dependencies; no cycles.
8. TanStack Query for server state.
9. Server state is not duplicated in global client state.
10. Backend is authoritative for business rules and authorization.
11. API types come from the wire/OpenAPI contract, not backend source code.
12. Raw HTTP implementation is centralized.
13. Session credentials use SecureStore.
14. AsyncStorage is never used for secrets.
15. Native capabilities are isolated behind narrow adapters when non-trivial.
16. AppState and connectivity are integrated once with the query layer.
17. No invented refresh-token flow.
18. Explicit loading, empty, and error states.
19. Forms use backend validation as authority.
20. Deep links and notification payloads are untrusted input.
21. UI hiding is never treated as security.
22. Public client environment variables are treated as public.
23. No unnecessary global state.
24. No unnecessary dependencies.
25. One coherent UI/theme system.
26. Accessibility is required.
27. Critical flows are tested behaviorally.
28. Production failures are observable without logging sensitive data.
29. OTA updates obey native runtime compatibility.
30. Architecture exceptions are documented, local, and reviewed.

---

## 46. Architectural exceptions

These rules are strong defaults. If a real product or platform constraint requires an exception:

- document the exact rule being violated
- explain why the standard approach is insufficient
- keep the exception as local as possible
- define the removal/migration condition when temporary
- do not weaken the global rule for convenience

Examples that require an explicit exception:

- introducing Redux/Zustand
- disabling React Native New Architecture
- adding a second networking stack
- using a custom native module
- persisting large amounts of server state locally
- using certificate pinning
- adding an offline mutation queue
- bypassing Expo Router

Do not silently diverge from architecture.

---

## 47. Implementation workflow

For every feature:

1. Read the product/SRS for desired behavior.
2. Read the relevant backend OpenAPI contract; never infer HTTP shapes from database models.
3. Identify the feature owner and route/screen boundary.
4. Identify server state, local UI state, and persisted state separately.
5. Define feature API functions through the shared client.
6. Implement TanStack Query hooks and minimal application orchestration.
7. Compose the screen from feature and shared UI components.
8. Add native capability adapters only if the feature needs them.
9. Implement loading, empty, error, offline, and permission behavior where applicable.
10. Verify session/authorization behavior without duplicating backend rules.
11. Verify accessibility and keyboard/device layout behavior.
12. Add tests at the appropriate level.
13. Review dependency/native-config impact.
14. Review release implications: JS-only update or new native binary.
15. Review against the non-negotiable rules before calling the feature complete.

---

## 48. Generic feature example

Given a hypothetical `Widget` resource:

```text
src/app/(app)/widgets/[widgetId].tsx
  → src/screens/widget-detail-screen.tsx
    → src/features/widgets/hooks/use-widget.ts
      → src/features/widgets/api/get-widget.ts
        → src/api/client.ts
          → GET backend wire contract
```

Mutation example:

```text
WidgetActionButton
  → useUpdateWidget()
    → update-widget.ts
      → shared API client
        → backend validates + mutates
      ← typed wire response
    → update/invalidate smallest related queries
  → UI renders backend result
```

Native capability example:

```text
Feature component
  → feature hook
    → native/permissions/camera-permission.ts
      → Expo/native permission API
```

The feature owns the use case; the adapter owns the platform mechanism.

---

## 49. Final architecture checklist

Before considering a mobile project structurally healthy, confirm:

- [ ] Product, backend, OpenAPI, mobile architecture, and task documents remain separate.
- [ ] Mobile package has strict TypeScript.
- [ ] New Architecture is enabled.
- [ ] Expo Router route files are thin.
- [ ] Business capabilities live in `features/`.
- [ ] Screens compose rather than own transport logic.
- [ ] Shared UI has no feature dependency.
- [ ] HTTP setup is centralized.
- [ ] Generated API contracts are not duplicated manually.
- [ ] TanStack Query owns server state.
- [ ] UI state remains local unless genuine shared ownership exists.
- [ ] SecureStore holds session credentials.
- [ ] AsyncStorage contains no secrets.
- [ ] Session bootstrap prevents auth-screen flicker.
- [ ] 401/refresh behavior matches the backend contract exactly.
- [ ] AppState and connectivity are wired once to TanStack Query.
- [ ] Deep links are validated and cannot bypass authorization.
- [ ] Push notifications cause navigation/refetch, not trusted business actions.
- [ ] Permissions are requested contextually and denial is handled.
- [ ] Native SDKs are isolated when non-trivial.
- [ ] Loading, empty, error, and offline states are intentional.
- [ ] Forms are keyboard-safe and accessible.
- [ ] Theme tokens are centralized.
- [ ] Large lists are virtualized and paginated.
- [ ] Images are sized/cached intentionally.
- [ ] No sensitive values appear in logs, analytics, URLs, or plain storage.
- [ ] Dependencies are maintained and New-Architecture-compatible.
- [ ] Critical flows have integration/E2E coverage.
- [ ] Build profiles separate development, preview, and production.
- [ ] OTA runtime compatibility is explicit.
- [ ] Architectural exceptions are documented rather than silently introduced.

---

## 50. AI implementation rules

An AI coding agent working in this repository must:

1. Read this file before creating or restructuring mobile code.
2. Read the product/SRS before deciding product behavior.
3. Read OpenAPI before inventing any endpoint, field, enum, error code, or payload.
4. Never inspect the database model to guess a mobile API response.
5. Place code by ownership, not by convenience.
6. Keep Expo Router route files thin.
7. Use existing feature/API/native/storage/theme infrastructure before adding parallel systems.
8. Never store credentials outside SecureStore.
9. Never add global state to solve a local-state problem.
10. Never duplicate backend authorization or business calculations.
11. Never add native permissions or SDKs that the requested feature does not need.
12. Never change architecture rules to record implementation progress.
13. If the requested implementation conflicts with this architecture, surface the conflict and make the
    smallest explicit exception rather than silently diverging.
14. Do not claim a feature is complete until loading/error/empty, session behavior, accessibility, and
    tests appropriate to the feature have been considered.

The target is not maximal abstraction. The target is a mobile codebase whose ownership and data flow
remain obvious as the product grows.
