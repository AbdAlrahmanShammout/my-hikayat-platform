# Frontend Architecture & Engineering Conventions

> **Scope:** This document describes an **engineering system** for a React web dashboard —
> layering, folder organization, naming, dependency flow, UI system, data access, and
> implementation rules. It deliberately excludes the business domain.
>
> **How to use it:** An AI agent or developer starting an empty dashboard should be able to
> read this file and build a *completely different* product that is structurally
> indistinguishable from this one. Do not invent a parallel frontend architecture.
>
> **What this file is not:** a product spec, a sprint board, or a STEP/task list.
> Do not update this file to record that a screen shipped, a library was installed,
> or a STEP finished. Do not record product role names, capability flags, content
> types, or onboarding sequences here.
>
> **Reuse:** stack, layering, naming, and rules transfer to other dashboard projects.
> Placeholders: `<audience>` for an API consumer group, `<feature>` / `Widget` for a
> business resource. Live HTTP paths and field names belong in the product specification
> and the OpenAPI contract. Delivery status belongs in the project's task document.

---

## 1. Authority and documentation hierarchy

### 1.1 Which document governs what

Keep architecture separate from product requirements and from delivery tracking.

| Kind of document | Governs | Does not govern |
| --- | --- | --- |
| Product / SRS | What the product must do | How the UI is structured |
| Backend architecture | API layering (NestJS or other) | React, Tailwind, routing, UI state |
| This file | React dashboard architecture | API modules, ORM, transactions, task status |
| Task / STEP list | What to build next and whether it is done | Architecture rules |

Keep a product spec, a backend architecture document, this file, and a separate
task/STEP list. Do not merge those roles.

The backend architecture document remains the source of truth for the API. Do not
rewrite it to include frontend concerns. Do not mix API layering into this document
except where the HTTP **contract** must be understood.

The product spec remains the source of truth for business behavior. Frontend
implementation must not redefine backend business rules. Do not duplicate product
requirements here.

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

Do not copy backend implementation details (modules, repositories, domain services,
database models, transaction patterns) into frontend code or into this document except
to explain the contract.

---

## 2. Dashboard scope

This architecture covers an **authenticated React SPA dashboard** that talks to a
separate HTTP API: multiple audience shells (operator vs contributor) and shared
auth.

Out of this document’s primary scope:

- Native or content-runtime clients (for example a dual-engine reader). They may
  later share generated API types, not this dashboard’s feature modules.
- Marketing sites and server-rendered content sites.
- A second backend-for-frontend. The existing API is the server.

A public catalog may live in the same SPA **only** if it reuses app infrastructure
(auth, API client, design system) without pulling runtime-engine complexity into
dashboard features.

Which screens exist, and in what order, is a project task-list concern.

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

These libraries are the architectural default. Do not treat this table as an install
checklist or a delivery status.

| Concern | Decision |
| --- | --- |
| Package manager | pnpm workspace |
| Dashboard package | `frontend/` workspace package |
| UI library | React + TypeScript SPA |
| Bundler | Vite |
| Routing | React Router |
| Styling | Tailwind CSS only |
| Components | shadcn/ui |
| Icons | Lucide |
| Motion | Framer Motion (`framer-motion`) |
| Server state | TanStack Query (`@tanstack/react-query`) |
| Forms | React Hook Form + Zod + shadcn Form |
| API contract types | Generated from audience OpenAPI JSON |
| Unit/component tests | Vitest + React Testing Library |
| E2E | Playwright, critical journeys only |

**Why Vite, not Next.js:** the API is already a separate server with JWT Bearer auth
and CORS. The dashboard is an authenticated product SPA, not a marketing site. Next.js
would add a second server and duplicate routing/auth concerns without a current need.

**Why TanStack Query:** it is the required server-state solution. Do not introduce
Redux, Zustand, or a second fetching library for server cache unless a documented
exception exists.

**Why not share backend source types:** backend response DTOs are framework/OpenAPI
classes. The dashboard must consume the **wire contract**, preferably generated from
audience OpenAPI documents. Do not import API source into the frontend package.

The frontend may depend on Zod **independently** for form UX. Do not treat backend
schema files as the UI schema source.

---

## 6. Monorepo placement

```
<repo>/
  package.json              # workspace root; frontend and backend filter scripts
  pnpm-workspace.yaml       # `frontend` next to `backend`
  backend/                  # HTTP API — separate architecture document
  frontend/                 # React dashboard — this document
  docs/
    FRONTEND-ARCHITECTURE.md
```

- Keep frontend dependencies in `frontend/package.json`.
- Do not hoist React into the API package.
- Match the workspace root engines. Do not introduce a second Node/pnpm policy in the
  dashboard package.
- Adopt a shared Prettier shape (`singleQuote`, `semi`, `trailingComma: all`,
  `printWidth: 100`, `tabWidth: 2`) unless a documented frontend exception exists.
- Use `strict: true` TypeScript. Do not weaken compiler options for convenience.
- Use a `@/*` path alias to `frontend/src/*`.

Root scripts typically: `pnpm backend`, `pnpm frontend`.

**Dev origin / CORS:** pin the Vite origin and keep it on the API CORS allowlist.
If a local `.env` overrides CORS, it must still include the dashboard origin.

---

## 7. Project structure

Use a feature-oriented tree under `frontend/src/`. This is the required layout.

```
frontend/
  src/
    app/                     # bootstrap, providers, router, guards
    pages/                   # route-level composition only
    features/
      auth/
      widgets/               # example resource; replace with the product's features
      categories/
      users/
      analytics/
      earnings/
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
features/widgets/
  components/
  hooks/
  api/                 # feature API functions using the shared client
  schemas/             # Zod schemas for forms (UX only)
  lib/                 # feature-local formatters
  widgets.routes.ts    # route objects consumed by app/, if needed
  *.spec.tsx
```

Keep related code together. Do not create a feature folder without a real capability
boundary.

Map features to API audiences and product capabilities, not to backend module folders.
Example feature-to-API map (replace with the consuming project's contract):

| Feature | Primary APIs (contract, not implementation) |
| --- | --- |
| `auth` | login, register, current-user; additional capability endpoints if the contract has them |
| `widgets` | `/<audience>/widgets` (split UI by audience, share types) |
| `categories` | operator taxonomy routes |
| `users` | operator user-management routes |
| `analytics` | contributor analytics and layout-aware views |
| `earnings` | contributor payout display |
| `audit` | operator audit-log routes |

If two audiences share a resource, keep shared presentational pieces in
`features/<name>/components` and audience-specific hooks next to the screens. Do not
create duplicated feature folders that only differ by chrome.

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
- Components: `PascalCase` (`widget-table.tsx` exporting `WidgetTable`)
- Hooks: `camelCase` starting with `use` (`use-audience-widgets.ts` exporting `useAudienceWidgets`)
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

**Home is a summary contract.** When an audience has a dashboard Home,
that screen displays backend-provided KPI fields from **one** summary
response. Do not assemble Home by firing many unrelated list or
period-scoped analytics requests. Do not hide a KPI because the value
is zero; `0` is a valid empty state. Detailed tables, heatmaps, and
breakdowns stay on their own routes. Which KPIs exist, and how each is
defined, belongs in the product specification.

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

Data from backend APIs: the resources this dashboard manages, plus the current user.

Use **TanStack Query** consistently. Do not copy server data into a global client store
unless a documented reason exists (for example an ephemeral upload progress overlay that
is not the resource itself).

Query keys must be structured and feature-scoped, for example:

```ts
['<audience>', 'widgets', { limit, offset }]
['<audience>', 'widgets', widgetId, 'detail']
```

Invalidate the smallest affected set after mutations. Avoid “invalidate everything.”

### 11.2 Client / UI state

Modal open/closed, selected tab, unsaved filter draft, sidebar collapsed, form fields
before submit, local visual preferences.

Keep these local (`useState`, URL search params, or a tiny context for the shell).
Do not create global state for state that only one component needs.

URL search params are preferred for filters/pagination that users may share or refresh.

The authenticated session (access token + current user) is application infrastructure
in `app/`, not a feature store of widgets or earnings.

---

## 12. Data fetching

Components must not contain raw API implementation details.

Preferred chain:

```
Component → feature hook (useAudienceWidgets) → api/data layer → backend
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
- mapping the API error envelope into a typed frontend error (status, code, message,
  and field errors when the contract provides them)
- credentials / CORS-safe defaults

Do not scatter `fetch` through pages or presentational components.

**Generated types:** prefer generating TypeScript types (and optionally a typed client)
from the API’s OpenAPI documents, one per audience when the API is split that way.
Use the document that matches the screen’s audience.

Do not silently rename wire fields or change business semantics. Display backend
values as returned.

Follow the live contract for money, durations, and pagination. Typical patterns:

- money as **integer minor units** (cents); formatting is presentational only
- durations in **milliseconds** plus backend-provided aggregates — display those
  aggregates; do not re-implement weighting, pooling, or entitlement math in the UI
- server-side `limit`/`offset` + `total`; do not client-sort or client-filter
  datasets the API already pages unless the product explicitly wants a tiny
  in-memory list

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
- Progress only for long uploads

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

Keep URL shapes stable and audience-prefixed when the product has multiple dashboards
(example: `/login`, `/<audience>/…`). Change them only with a product reason.

Frontend guards are **UX only** (redirect unauthenticated users; hide an audience nav
from callers who cannot use that audience). Authorization is enforced by the backend.
Hiding a button is not security.

---

## 21. Authentication and authorization

The backend is the security authority.

The dashboard may:

- store the access token for the API client
- call the current-user endpoint to hydrate the principal
- hide actions the current role cannot perform
- redirect unauthorized users
- conditionally render audience areas (operator vs contributor, etc.)

The dashboard must not:

- assume UI hiding is security
- reimplement complex authorization
- mint or parse JWT claims as a substitute for the current-user endpoint when the
  user object is needed
- invent a refresh-token flow that the API does not provide

**Session expiry:** follow the API. If there is no refresh endpoint, treat 401 as
signed-out, send the user to login, and stop stale mutations. Token lifetime is a
backend config concern, not a frontend workaround.

Use role and capability flags exactly as the wire contract defines them. Do not
collapse distinct flags into one UI concept.

**Identity vs domain capability in the UI.** The same split as the backend architecture
applies on the dashboard:

- **Identity role** is HTTP/workspace membership. UX route guards follow the same
  audience the API `@Roles` (or equivalent) declares. Display it. Redirect callers
  who cannot use that audience.
- **Domain capability** is whether a business action is allowed (own a resource,
  exercise a product capability). Display the flag the API returns. Disable the
  action when it is false. Still surface the API error if the caller submits anyway.
  Do not treat a capability flag as a second role or as permission to enter an
  audience route.

Do not expand a client-side “user” object with invented flags. Do not infer a
capability from role, or a role from a capability, unless the product specification
defines that coupling — and even then, display both fields the API returns.

**Multi-step identity upgrades.** Public register may create a lesser identity. A
later authenticated call may grant a capability and/or change the audience role and
return a **new** session. The dashboard must:

1. Call the contract in the order the API requires. Do not invent a combined register
   endpoint.
2. Treat every session payload as the same session type. A local name such as
   “first session” describes account state at that moment, not a second type.
3. Store the **new** token and principal only after the upgrade succeeds, then
   navigate to that audience’s home.
4. If register succeeds and the upgrade fails, persist the first session so the user
   can retry the upgrade without registering again.

Signed-in callers who already have an audience home skip the public register/sign-in
forms. Product role names, capability names, paths, and legal pairs belong in the
product specification, not in this file.

---

## 22. Business logic ownership

The frontend may implement presentation logic, input UX validation, UI state, client
formatting, and display-only calculations (currency from cents, dates, percentages
**already returned** by the API).

The frontend must **not** become the source of truth for:

- monetization / payout calculation
- weighting, entitlement, or eligibility formulas
- ownership
- authorization
- payment status
- audit behavior
- catalog visibility rules

Analytics visualizations must use backend-provided metrics and definitions. Do not
invent analytics formulas in the UI.

If a list is already ranked by the API, do not re-sort it unless the contract adds
an explicit sort.

---

## 23. Tables and analytics

Dashboard tables need clear column hierarchy, usable density, loading/empty/error
states, and a responsive strategy.

Use API-supported filtering/pagination. Do not implement client-side sort/filter for
server-paginated lists unless explicitly intended for a tiny, fully loaded set.

Prefer KPI cards, tables, and backend-provided trend points before adding a chart
library. If a chart library is introduced, justify it (bundle size, accessibility,
maintenance) and still plot **backend** series only.

For layout-aware visualizations (heatmaps, canvases), render the payload the API
returns. Do not synthesize cells or series the contract does not provide.

When the API returns a rendering/layout discriminator, the view follows **that**
field. Do not pick a visualization shape from a separate content-category or
product-type field. A typical layout for a content type is a product expectation,
not a UI rendering rule. Field names and legal values belong in the product
specification.

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
| E2E | Critical journeys (login, primary resource list, operator review) against a running API when valuable |

Keep API tests in the API package and dashboard tests in the frontend package.
Do not run frontend tests through the API test runner.

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

## 34. Implementation workflow

1. Read the product spec for the capability and this file for frontend engineering.
2. Identify the API contract (OpenAPI audience document + live routes). Do not guess
   payloads from database models.
3. Place the work in the correct feature, route, and query keys.
4. Implement UI with shadcn + Tailwind; hooks for server state; client state local.
5. Cover loading, empty, error, accessibility, and responsive behavior.
6. Add tests at the appropriate level.
7. Review against §32 before calling the work done.

Do not modify this file, the backend architecture document, or the product spec to
“fit” a UI preference or to record delivery progress. Delivery status belongs in
the project task list. If the HTTP contract is wrong, that is a backend change with
its own review against the backend architecture document.
