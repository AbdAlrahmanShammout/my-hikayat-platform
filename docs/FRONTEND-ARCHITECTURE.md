# Frontend Architecture & Engineering Conventions

> **Scope:** This document is the engineering source of truth for the React web dashboard.
> It defines layering, folder organization, naming, dependency flow, UI system, data access,
> and implementation rules for frontend work.
>
> **How to use it:** An engineer or agent implementing dashboard screens should be able to
> follow this file without inventing a parallel frontend architecture.

---

## 1. Authority and documentation hierarchy

### 1.1 Which document governs what

| Document | Governs | Does not govern |
| --- | --- | --- |
| `docs/SRS.md` | Product and business requirements | How the UI is structured |
| `ARCHITECTURE.md` | NestJS backend architecture | React, Tailwind, routing, UI state |
| `docs/FRONTEND-ARCHITECTURE.md` | React dashboard architecture | NestJS modules, Prisma, repositories, transactions |
| `docs/FUTURE.md` | Deferred / future product work | Current dashboard implementation rules |
| `docs/srs-coverage-matrix.md` | Implementation coverage tracking | Architecture rules |
| `docs/admin-dashboard-tasks.md` | Admin dashboard UI STEP plan | Backend architecture |

`ARCHITECTURE.md` remains the source of truth for backend architecture. Do not rewrite it
to include frontend concerns. Do not mix NestJS layering into this document except where
the frontend/backend **contract** must be understood.

`docs/SRS.md` remains the source of truth for product behavior. Frontend implementation
must not redefine backend business rules. Do not duplicate SRS requirements here.

### 1.2 Frontend / backend boundary

- The dashboard **consumes backend HTTP APIs according to their contracts**.
- The backend is authoritative for business rules, permissions, entitlement, monetization,
  validation, and persistence.
- The frontend may provide client-side validation and UX feedback. A successful client
  check is never proof that the backend will accept the request.
- The frontend must not duplicate backend monetization, entitlement, authorization, or
  validation logic as a source of truth.
- If a value comes from the backend, display the backend value. Do not recalculate
  critical business values in the UI.

Do not copy backend implementation details (NestJS modules, Prisma repositories, domain
services, database models, transaction patterns) into frontend code or into this document
except to explain the contract.

### 1.3 Current repository state

This section records what exists **today**. Later sections that name React libraries are
**required architectural direction**, not a description of installed packages.

**What already exists**

- pnpm workspace (`pnpm@11.10.0`, Node `>=24`) with packages: `backend`, `frontend`
- NestJS API with audience-scoped OpenAPI documents (reader, author, admin)
- JWT Bearer authentication (`Authorization` header). Login/register return
  `accessToken`, `tokenType: "Bearer"`, `expiresIn` (default `15m`). There is **no**
  refresh-token endpoint.
- Canonical error JSON: `{ message, code, statusCode, validationErrorObjects?, stack? }`
- Offset pagination: `limit` / `offset` (default page size 20). List payloads use a
  resource-named array plus `total` (for example `books` + `total`).
- CORS origins from `APP_CORS_ORIGINS` (default
  `http://localhost:3000,http://localhost:5173`). Allowed methods: GET, POST, PUT,
  PATCH, DELETE. Allowed headers: `Content-Type`, `Authorization`. `credentials: true`.
- TypeScript `strict: true`, kebab-case files, `@/*` path alias, Prettier in `backend/`
- Roles: `reader`, `author`, `admin`. Users also have `isPublisher`.
- A Vite React TypeScript package at `frontend/` (port 5173). Design-system libraries
  and the data layer are not installed yet; that is admin dashboard STEP 0.

**What does not exist yet**

- Tailwind, shadcn/ui, Lucide, Framer Motion, TanStack Query, React Router, React Hook
  Form, a generated OpenAPI client, and dashboard feature screens.

This document is the rulebook for dashboard implementation. Required libraries in §5
are not all installed yet; install them in admin dashboard STEP 0.

---

## 2. Dashboard scope

This architecture covers the **React web dashboard**:

- **Author dashboard** — books, upload/processing status, analytics, earnings, heatmaps
  (SRS §2.2, §12).
- **Admin dashboard** — review, users, subscriptions, collections, categories,
  revenue periods, audit (SRS §2.3).
- Shared **auth** (register / login / session) and shell (layout, navigation).

Out of this document’s primary scope:

- The dual-engine **reader runtime** (reflowable vs fixed-layout viewport, offline
  decrypt, React Native). That is a separate client. It may later share API types, not
  this dashboard’s feature modules.
- Part 2 (TTS) and Part 3 (formatting), except where an admin/author screen must call
  an already-shipped Part 1 API.

A reader web catalog may later live in the same SPA **only** if it reuses app
infrastructure (auth, API client, design system) without pulling reader-engine
complexity into dashboard features.

---

## 3. Core principles

1. **Feature-oriented organization.** Group code by business capability, not by
   technical type alone.
2. **Layered separation.** UI, feature/application logic, API/data access, and app
   infrastructure stay distinct.
3. **TypeScript-first.** Strict types at every boundary.
4. **Reusable UI, local business logic.** Shared components have no feature ownership.
5. **Explicit data ownership.** Server state is not copied into a global client store
   by default.
6. **Server state ≠ UI state.**
7. **Composition over inheritance.**
8. **Small, focused components and hooks.**
9. **Predictable dependency direction.** No cycles.
10. **No unnecessary abstraction.** No premature generic frameworks.
11. **No duplicated business logic.** Presentation logic may live in the UI; business
    truth stays on the backend.
12. **Prefer simple architecture that scales with the dashboard.**

---

## 4. Allowed dependency direction

```
app/          application bootstrap, providers, routing, guards
  → pages/    route composition only
    → features/<feature>/   feature UI, hooks, feature API modules
      → shared components, lib, config, generated API types
        → backend HTTP API
```

**Rules**

- `app` may import pages, features, and shared layers.
- `pages` may import features and shared UI. Pages must not contain API clients or
  large workflows.
- `features/<name>` may import shared `components`, `lib`, `api` infrastructure, and
  generated contract types. A feature must **not** import another feature’s internal
  files.
- Shared `components/` must **not** import features, feature hooks, or feature APIs.
- `lib/` must have **no** business ownership and must not import features.
- `api/` (client infrastructure) must not import features or pages.
- Avoid circular dependencies. If two features need the same code, move only the
  genuinely shared piece to `components/`, `lib/`, or `api/`.

```
UI → feature/application logic → API/data layer → backend API
```

---

## 5. Required frontend stack

Legend: **Exists** = already in the repository. **Required** = install when the
dashboard package is created. Do not add libraries in documentation-only tasks.

| Concern | Decision | Status |
| --- | --- | --- |
| Package manager | pnpm workspace | **Exists** (backend only today) |
| Dashboard package | `frontend/` workspace package | **Required** |
| UI library | React + TypeScript SPA | **Required** |
| Bundler | Vite | **Required** |
| Routing | React Router | **Required** |
| Styling | Tailwind CSS only | **Required** |
| Components | shadcn/ui | **Required** |
| Icons | Lucide | **Required** |
| Motion | Framer Motion (`framer-motion`) | **Required** |
| Server state | TanStack Query (`@tanstack/react-query`) | **Required** |
| Forms | React Hook Form + Zod + shadcn Form | **Required** |
| API contract types | Generated from audience OpenAPI JSON | **Required** |
| Unit/component tests | Vitest + React Testing Library | **Required** |
| E2E | Playwright, critical journeys only | **Required** |

**Why Vite, not Next.js:** the backend is already a separate NestJS API with JWT Bearer
auth and CORS. The dashboard is an authenticated internal/product SPA, not a
marketing site. Next.js would add a second server and duplicate routing/auth concerns
without a current product need.

**Why TanStack Query:** there is no frontend data layer today. TanStack Query is the
required server-state solution. Do not introduce Redux, Zustand, or a second fetching
library for server cache unless a documented exception exists.

**Why not share backend source types:** backend response DTOs are Nest/OpenAPI classes.
The dashboard must consume the **wire contract**, preferably generated from
`/docs/admin-json`, `/docs/author-json`, and `/docs/reader-json`. Do not import
`backend/src` into the frontend package.

Zod exists in the backend for some internal schemas. The frontend may depend on Zod
**independently** for form UX. Do not treat backend Zod files as the UI schema source.

---

## 6. Monorepo placement

When the dashboard is created:

```
lib_app/
  package.json              # pnpm workspace root; add a frontend filter script
  pnpm-workspace.yaml       # add `frontend` next to `backend`
  backend/                  # NestJS API — governed by ARCHITECTURE.md
  frontend/                 # React dashboard — governed by this document
  docs/
    SRS.md
    FRONTEND-ARCHITECTURE.md
    FUTURE.md
    srs-coverage-matrix.md
  ARCHITECTURE.md
```

- Keep frontend dependencies in `frontend/package.json`.
- Do not hoist React into the backend package.
- Match root engines: Node `>=24`, pnpm `>=11`.
- Adopt the backend Prettier shape (`singleQuote`, `semi`, `trailingComma: all`,
  `printWidth: 100`, `tabWidth: 2`) unless a documented frontend exception exists.
- Use `strict: true` TypeScript. Do not weaken compiler options for convenience.
- Use a `@/*` path alias to `frontend/src/*`, matching the backend alias convention.

`pnpm-workspace.yaml` lists `backend` and `frontend`. Root scripts: `pnpm backend`,
`pnpm frontend`.

**Dev origin / CORS:** Vite is pinned to `http://localhost:5173`. The API CORS default
includes that origin and `http://localhost:3000`. If a local `.env` overrides
`APP_CORS_ORIGINS`, it must still include the dashboard origin.

---

## 7. Project structure

Use a feature-oriented tree under `frontend/src/`. This is the required layout once
the package exists. There is no existing frontend tree to preserve.

```
frontend/
  src/
    app/                     # bootstrap, providers, router, guards
    pages/                   # route-level composition only
    features/
      auth/
      books/
      categories/
      collections/
      users/
      subscriptions/
      analytics/             # author analytics, heatmaps
      earnings/              # author earnings / trends
      revenue/               # admin revenue periods
      audit/
    components/              # reusable UI not owned by one feature
      ui/                    # shadcn/ui primitives
      layout/                # shell, sidebar, page header
    api/                     # HTTP client, auth header, error parsing, query keys
    lib/                     # generic utilities (dates, cn, motion helpers)
    types/                   # only genuinely shared frontend types
    config/                  # env, theme tokens documentation, query defaults
    assets/
    generated/               # OpenAPI-derived types/clients (do not edit by hand)
    test/                    # test setup, MSW handlers if used
  index.html
  vite.config.ts
  tsconfig.json
  components.json            # shadcn config, when initialized
```

### 7.1 `app/`

Application bootstrap, providers (QueryClient, auth session, tooltip/toast), router
definition, and route guards. No feature business workflows.

### 7.2 `pages/`

One file per route (or a small folder per route). Pages compose layouts and feature
components. Pages must not:

- call `fetch` / Axios directly
- contain large forms or tables inline
- own server-state query keys

### 7.3 `features/`

Business-oriented frontend functionality. Each feature may contain:

```
features/books/
  components/
  hooks/
  api/                 # feature API functions using the shared client
  schemas/             # Zod schemas for forms (UX only)
  lib/                 # feature-local formatters
  books.routes.ts      # route objects consumed by app/, if needed
  *.spec.tsx
```

Keep related code together. Do not create a feature folder without a real capability
boundary.

Suggested first features map to existing API audiences, not to NestJS modules:

| Feature | Primary APIs (contract, not implementation) |
| --- | --- |
| `auth` | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` |
| `books` | `/author/books`, `/admin/books` (split UI by audience, share types) |
| `categories` | `/admin/categories` |
| `collections` | `/admin/collections` |
| `users` | `/admin/users` |
| `subscriptions` | `/admin/subscriptions` |
| `analytics` | `/author/analytics`, heatmaps |
| `earnings` | `/author/earnings`, trend |
| `revenue` | `/admin/revenue-periods` |
| `audit` | `/admin/audit-logs` |

If author and admin book screens diverge, keep shared presentational pieces in
`features/books/components` and audience-specific hooks next to the screens. Do not
create `features/admin-books` and `features/author-books` that duplicate table chrome.

### 7.4 `components/`

Truly reusable UI: buttons are in `components/ui` via shadcn; product-level pieces
such as `PageHeader`, `EmptyState`, `ErrorState`, `KpiCard` live here once reused.

### 7.5 `api/`

Central client: base URL, Bearer token, JSON parsing, error normalization, TanStack
Query defaults, query-key factory conventions.

### 7.6 `lib/`

Generic helpers with no product meaning (`cn()`, date formatting wrappers, reduced-motion
helpers). Not a dumping ground.

### 7.7 `types/`

Only types shared across features that are **not** generated API types. Generated
wire types live in `generated/`. Do not create a global types dumping ground.

### 7.8 Naming

Align with repository conventions where they do not fight React norms:

- Files and directories: `kebab-case`
- Components: `PascalCase` (`book-table.tsx` exporting `BookTable`)
- Hooks: `camelCase` starting with `use` (`use-author-books.ts` exporting `useAuthorBooks`)
- One primary export per file, except shadcn-generated UI files which follow the
  generator layout
- **No feature-level barrel `index.ts` files.** Import the exact file, matching the
  backend rule. shadcn’s `components/ui/*` files are generated artifacts, not an excuse
  to add barrels elsewhere.

---

## 8. UI system

### 8.1 Styling

- **Always use Tailwind CSS.** Do not introduce CSS Modules, styled-components, Sass,
  or a second utility framework.
- Do not use arbitrary inline `style={}` unless a value is truly runtime-dynamic
  (for example a heatmap intensity that cannot be a token).
- Prefer design tokens (`bg-primary`, `text-muted-foreground`, `border-border`) over
  arbitrary hex/rgb in class names.
- Follow a **4pt spacing system**: `p-4`, `gap-4`, `mt-8`, `px-6`. Avoid random values
  (`p-[13px]`, `mt-[7px]`).
- One shared `cn()` helper (typically `clsx` + `tailwind-merge` as pulled in by shadcn).

### 8.2 Color

- One clearly defined **primary** color for the product.
- Restrained, professional palette. Semantic colors only for state: success, warning,
  destructive, info.
- Do not invent a different accent per feature.
- Configure tokens in the Tailwind / CSS variable theme (shadcn convention). Do not
  hard-code competing palettes in feature CSS.

### 8.3 Visual language

Use: generous whitespace, clear hierarchy, soft shadows, restrained borders, consistent
radius, consistent typography, predictable spacing.

Avoid: excessive gradients, excessive shadows, noisy cards, unnecessary decoration,
inconsistent component styles.

The dashboard should feel like one product.

### 8.4 Component system — shadcn/ui

shadcn/ui is the primary component system. Do not recreate primitives that already
exist there.

Use as appropriate: Button, Dialog, DropdownMenu, Sheet, Tabs, Select, Input, Form,
Table, Tooltip, Toast/Sonner, Skeleton, Alert, Card, Badge, Separator, Pagination,
Command, Popover.

Customize through the theme and `components/ui` primitives. Do not fork visual variants
in random feature folders.

Shared components must be accessible and composable. Do not wrap shadcn in a generic
abstraction until there is demonstrated reuse.

### 8.5 Icons — Lucide

Use Lucide only. Do not add a second icon pack. Do not use arbitrary Unicode as UI
icons.

Icons must have appropriate size, accessible names when they are the only label, and
must not replace necessary text. Keep visual weight consistent (`lucide-react` defaults
unless the design system specifies otherwise).

### 8.6 Animation — Framer Motion

Use Framer Motion for **meaningful** motion: page transitions, enter/exit, drawers,
dialogs, list changes, purposeful micro-interactions.

Do not animate everything. Respect `prefers-reduced-motion` (provide reduced variants
or disable motion). Avoid animation that slows workflows, distracts from data, causes
layout thrash, or harms accessibility.

shadcn dialogs/sheets already have motion. Do not double-animate them without a reason.

---

## 9. Dashboard layout

Establish a single application shell: sidebar or top nav by breakpoint, page header,
main content.

Every dashboard page must clearly establish:

1. Page title
2. Context / primary actions
3. Primary information
4. Secondary information
5. Loading state
6. Empty state
7. Error state

Use **Bento Grid** layouts where they help: analytics, KPI rows, segmented summaries.
Do not force Bento onto tables, long forms, or linear workflows. Use the layout that
best communicates the information.

Prefer `PageHeader` + content sections over ad-hoc headings.

---

## 10. Responsive design

Every UI must be responsive. Use Tailwind breakpoints. Design mobile-first where
practical. Do not merely shrink a desktop layout.

Tables, forms, cards, filters, navigation, dialogs, and dashboards need an intentional
mobile behavior.

For dense desktop tables, define a mobile representation (stacked cards, sheet detail,
or a simplified column set). Uncontrolled horizontal overflow is not acceptable.

Navigation should collapse to a sheet/drawer on small screens.

---

## 11. Server state vs client state

### 11.1 Server state

Data from backend APIs: books, users, categories, collections, analytics, subscriptions,
revenue, audit logs, the current user.

Use **TanStack Query** consistently. Do not copy server data into a global client store
unless a documented reason exists (for example an ephemeral upload progress overlay that
is not the resource itself).

Query keys must be structured and feature-scoped, for example:

```ts
['author', 'books', { limit, offset }]
['admin', 'revenue-periods', periodId, 'earnings']
```

Invalidate the smallest affected set after mutations. Avoid “invalidate everything.”

### 11.2 Client / UI state

Modal open/closed, selected tab, unsaved filter draft, sidebar collapsed, form fields
before submit, local visual preferences.

Keep these local (`useState`, URL search params, or a tiny context for the shell).
Do not create global state for state that only one component needs.

URL search params are preferred for filters/pagination that users may share or refresh.

The authenticated session (access token + current user) is application infrastructure
in `app/`, not a feature store of books or earnings.

---

## 12. Data fetching

Components must not contain raw API implementation details.

Preferred chain:

```
Component → feature hook (useAuthorBooks) → api/data layer → backend
```

Feature hooks own loading, error, success, caching, invalidation, refetch, and
mutations via TanStack Query. Do not hand-roll caches.

After mutations, invalidate or update the queries that actually changed.

Do not fetch data the page does not need.

---

## 13. API layer

Treat backend APIs as a contract.

Centralize:

- base URL from frontend env (`VITE_API_BASE_URL` or equivalent)
- `Authorization: Bearer <accessToken>`
- JSON serialization
- mapping of `{ message, code, statusCode, validationErrorObjects }` into a typed
  frontend error
- credentials / CORS-safe defaults

Do not scatter `fetch` through pages or presentational components.

**Generated types:** prefer generating TypeScript types (and optionally a typed client)
from the audience OpenAPI documents:

- Reader: `/docs/reader-json`
- Author: `/docs/author-json`
- Admin: `/docs/admin-json`

Auth is included in each audience document. Use the document that matches the screen’s
audience. Do not silently transform backend field names or business semantics
(`weightedEngagement`, `authorCents`, `totalReadingMinutes`, `isPublisher`, and similar
must keep their meaning).

Money arrives in **integer cents**. Display formatting (divide by 100, currency) is
presentational. Do not invent a second money model.

Durations often arrive in **milliseconds** plus backend-provided minute/weighted fields.
Display the backend-provided aggregates (`totalReadingMinutes`, `totalWeightedEngagement`,
`authorCents`). Do not re-implement category-weight averages or pool splits in the UI.

Pagination is **server-side** `limit`/`offset` + `total`. Do not client-sort or
client-filter datasets that the API already pages unless the product explicitly wants
a tiny in-memory list.

---

## 14. Forms and validation

Use React Hook Form for non-trivial forms, Zod for client schemas, and shadcn Form
components where they fit.

Client-side validation is UX. Backend validation remains authoritative.

Forms must support:

- submitting / loading state
- field validation errors
- server errors (`code` + `validationErrorObjects` mapped onto fields when possible)
- disabled submit during mutation
- success feedback where useful (toast)

Never interpret client validation success as backend acceptance.

---

## 15. Error handling

Every async feature needs intentional loading, empty, error, and (where useful) success
states.

Never leave a blank screen, an unexplained spinner, a silent failure, or a console-only
error as the only signal.

Map backend failures to UX using status and `code`, not stack traces:

| Backend signal | Typical HTTP | UI |
| --- | --- | --- |
| Validation | 422 + `validationErrorObjects` | Field errors on the form |
| Unauthenticated | 401 | Sign-in redirect; clear session |
| Access denied | 403 | Not-authorized page or disabled action + explanation |
| Not found | 404 | Not-found state |
| Conflict / invalid state | 409 / 400 | Alert with `message` if `userFriendly` semantics apply; otherwise a generic failure |
| Dependency failure | 503 | Retryable service error |
| Internal | 500 | Generic failure; never show `stack` |

The wire body does not include `userFriendly`. Treat 5xx and unexpected codes as
generic. Show `message` for typical 4xx business errors. Never show `stack` to normal
users (it may appear in development API responses).

---

## 16. Loading states

Every async screen defines a loading experience.

- Skeletons for content-heavy pages and tables
- Button loading / disabled for mutations
- Progress only for long uploads (book source, media)

Do not replace the entire shell with a spinner when one section is loading. Preserve
layout to reduce shift. The shell (nav, page title) should remain visible.

---

## 17. Empty states

Empty data is not an error.

Every list, table, and dashboard that can have zero results needs an empty state that
explains what is empty, why that might be (when useful), and what to do next.

Do not render a header-only table with no explanation.

---

## 18. Cards and micro-interactions

Interactive cards: hover, focus, subtle lift/shadow/border, short transitions.
Non-interactive cards must not look clickable.

Controls must have default, hover, focus, active, disabled, and loading states (and
error where relevant). Transitions should be short. Do not add decorative states that
communicate nothing.

---

## 19. Accessibility

Accessibility is a first-class requirement. Follow WCAG-oriented practice.

Required:

- keyboard navigation
- visible focus
- semantic HTML
- accessible names
- correct button vs link semantics
- ARIA only when native HTML is insufficient
- sufficient contrast
- screen-reader-friendly status and error messages (use live regions for toasts/alerts)

Never use a clickable `div` when a `button` or `a` is appropriate.
Do not rely on color alone for status.

Honor `prefers-reduced-motion`.

---

## 20. Routing

Route configuration belongs in `app/`. Route elements stay thin and compose features.

Suggested URL shapes (adjust only with a product reason):

- `/login`, `/register`
- `/author/books`, `/author/analytics`, `/author/earnings`
- `/admin/books`, `/admin/users`, `/admin/collections`, `/admin/categories`,
  `/admin/subscriptions`, `/admin/revenue`, `/admin/audit`

Frontend guards are **UX only** (redirect unauthenticated users; hide admin nav from
authors). Authorization is enforced by the backend. Hiding a button is not security.

---

## 21. Authentication and authorization

The backend is the security authority.

The dashboard may:

- store the access token for the API client
- call `GET /auth/me` to hydrate the principal (`role`, `isPublisher`)
- hide actions the current role cannot perform
- redirect unauthorized users
- conditionally render author vs admin areas

The dashboard must not:

- assume UI hiding is security
- reimplement complex authorization
- mint or parse JWT claims as a substitute for `/auth/me` when the user object is needed
- invent a refresh-token flow that the API does not provide

**Session expiry:** access tokens default to 15 minutes and there is no refresh
endpoint. The dashboard must treat 401 as signed-out, send the user to login, and
avoid leaving stale mutations running. A longer-lived token is a backend config
concern (`JWT_ACCESS_EXPIRES_IN`), not a frontend workaround.

Role values on the wire are `reader` | `author` | `admin`. Publisher capability is
`isPublisher`. Do not collapse those two flags incorrectly.

---

## 22. Business logic ownership

The frontend may implement presentation logic, input UX validation, UI state, client
formatting, and display-only calculations (currency from cents, dates, percentages
**already returned** by the API).

The frontend must **not** become the source of truth for:

- monetization / publisher revenue calculation
- category weighting (including multi-category averages)
- subscription entitlement
- ownership
- authorization
- payment status
- audit behavior
- catalog visibility rules

Analytics visualizations must use backend-provided metrics and definitions. Do not
invent analytics formulas in the UI.

Author “top performing books” are already ranked by the API (`weightedEngagement`
desc, `bookId` asc). Do not re-sort unless the API adds a sort contract.

---

## 23. Tables and analytics

Dashboard tables need clear column hierarchy, usable density, loading/empty/error
states, and a responsive strategy.

Use API-supported filtering/pagination. Do not implement client-side sort/filter for
server-paginated lists unless explicitly intended for a tiny, fully loaded set.

No chart library is installed. Prefer KPI cards, tables, and backend-provided trend
points first. If a chart library is introduced later, justify it (bundle size,
accessibility, maintenance) and still plot **backend** series only.

Heatmaps: render the layout-aware payload (`layoutType`, `spreads`, `chapters`).
Do not synthesize the other layout’s cells.

---

## 24. Performance

- Avoid unnecessary re-renders with meaningful component boundaries, not speculative
  `memo` everywhere.
- Lazy-load heavy routes when useful.
- Virtualize only genuinely large lists.
- Avoid unnecessary global state.
- Optimize images/assets.
- Do not fetch unused data.

Measure before introducing complicated performance techniques.

---

## 25. TypeScript

Use TypeScript strictly.

Avoid `any`, unsafe assertions, duplicated API types, loosely typed handlers, and
untyped global state.

Prefer inferred types, generated OpenAPI types, discriminated unions, and explicit
frontend view-models only when the wire type is awkward for UI **and** the mapping
does not change meaning.

Do not weaken `tsconfig` to make implementation easier.

---

## 26. Testing

Test behavior, not implementation structure.

| Kind | Use for |
| --- | --- |
| Unit | Pure formatters, query-key helpers, error mappers |
| Component | Important interactions and states (empty, error, disabled submit) |
| Integration | Feature workflows across hook + UI with mocked API |
| E2E | Critical journeys (login, author book list, admin review) against a running API when valuable |

Backend tests stay in `backend/` (Jest). Frontend tests stay in `frontend/` (Vitest).
Do not run frontend tests through the Nest Jest config.

Do not write tests that only assert file structure or snapshot entire pages without
behavior.

---

## 27. Code quality

Prefer small components, clear names, single responsibility, predictable data flow,
explicit dependencies, and minimal abstraction.

Avoid giant components/hooks, utility dumping grounds, god-level providers, base-class
UI hierarchies, deeply nested conditional trees, and duplicated UI logic.

Refactor repetition when it is a real pattern (PageHeader, EmptyState), not after two
similar lines.

---

## 28. Design consistency

Before creating a new UI pattern, check shadcn and existing `components/`.

Do not create another button, modal, card, table, spacing scale, or icon system
without a design-system reason.

---

## 29. Introducing new libraries

Do not add a library because it is popular.

Before adding a dependency:

1. Check whether the repo already has a solution.
2. Check whether the required stack above already covers it.
3. Consider bundle size and maintenance.
4. Consider accessibility.
5. Consider long-term architecture.
6. Document the reason here or in the PR when the dependency affects architecture.

Prefer a small, coherent set: React, Vite, Tailwind, shadcn, Lucide, Framer Motion,
TanStack Query, React Hook Form, Zod, React Router.

---

## 30. New frontend feature checklist

Every new frontend feature must answer:

1. Which business capability does it belong to?
2. Which route owns it?
3. Which API/data does it consume?
4. Which server-state queries does it use?
5. Which local UI state does it need?
6. What are its loading, error, and empty states?
7. What permissions/roles affect it? (UX only; backend still enforces.)
8. Is it responsive?
9. Is it accessible?
10. Does it reuse the design system?

Do not create a feature folder without a real feature boundary.

---

## 31. Dashboard UX quality bar

Production screens should feel professional, calm, predictable, fast, accessible,
responsive, visually consistent, and easy to scan.

Prioritize information hierarchy over decoration. Polished, not noisy.

---

## 32. Non-negotiable frontend rules

Mandatory unless a documented exception exists:

1. Tailwind CSS for styling.
2. shadcn/ui for standard UI components.
3. Lucide for icons.
4. Framer Motion for purposeful animation.
5. 4pt spacing system.
6. One primary color.
7. Responsive layouts.
8. Accessible interactive elements.
9. Explicit loading, error, and empty states.
10. Server state separated from UI/client state (TanStack Query for server data).
11. Backend remains authoritative for business rules.
12. No duplicated critical business calculations.
13. No raw API calls scattered through UI components.
14. No unnecessary global state.
15. No circular feature dependencies.
16. TypeScript-first, strict.
17. Reuse design-system components before creating new ones.
18. Do not introduce libraries without justification.
19. Keep route/page components thin.
20. Prefer feature-oriented architecture.

---

## 33. Architectural exceptions

These rules are strong defaults, not permission to create bad architecture.

If an implementation must violate a rule:

- document why in the PR or in this file if the exception is durable
- explain why the standard approach is insufficient
- keep the exception local
- do not weaken the global rule for convenience

Do not silently violate architecture rules.

---

## 34. Implementation workflow (when dashboard work starts)

1. Read the relevant SRS capability (product) and this file (frontend engineering).
2. Identify the API contract (OpenAPI audience document + live routes). Do not guess
   payloads from Prisma models.
3. Place the work in the correct feature, route, and query keys.
4. Implement UI with shadcn + Tailwind; hooks for server state; client state local.
5. Cover loading, empty, error, accessibility, and responsive behavior.
6. Add tests at the appropriate level.
7. Review against §32 before calling the work done.

Do not modify `ARCHITECTURE.md`, `docs/SRS.md`, schema, or APIs to “fit” a UI
preference. If the contract is wrong, that is a backend change with its own review
against `ARCHITECTURE.md`.

---

## 35. Remaining dashboard bootstrap

Already done:

- `frontend/` is a pnpm workspace package
- CORS default includes `http://localhost:5173`
- `AGENTS.md` and `.cursor/rules/` route frontend work to this document

Still required before production screens (admin dashboard STEP 0):

- Install the required libraries listed in §5
- Generate OpenAPI types from the three audience documents
- Replace the Vite stub with the feature-oriented tree in §7
