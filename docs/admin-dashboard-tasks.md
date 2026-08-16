# Admin dashboard — implementation STEPs

Product requirements: `docs/SRS.md` §2.3, §2.4, §7.3–7.4, §12.3.
Frontend engineering: `docs/FRONTEND-ARCHITECTURE.md`.
Backend contracts: existing `/admin/*` and `/auth/*` HTTP APIs. Do not add backend
endpoints unless a STEP explicitly records a contract gap.

This is the admin web dashboard only. Author dashboard and the reader app are out of
scope until this list is done.

Status values: **Pending**, **In progress**, **Complete**.

Bootstrap already done (not a UI STEP): `frontend/` workspace, Vite stub on
`:5173`, CORS default includes the Vite origin, agent routing to
`docs/FRONTEND-ARCHITECTURE.md`. **pnpm install of dashboard libraries is
deferred.**

| STEP | Capability | Status |
| --- | --- | --- |
| 0 | Frontend foundation (design system + data layer) | Pending — install skipped |
| 1 | Auth session + admin shell | Pending |
| 2 | Admin home (composed KPIs) | Pending |
| 3 | Books review and catalog management | Pending |
| 4 | Users | Pending |
| 5 | Subscriptions | Pending |
| 6 | Collections | Pending |
| 7 | Category weights | Pending |
| 8 | Revenue periods | Pending |
| 9 | Revenue calculate, analytics, heatmap | Pending |
| 10 | Audit log | Pending |

Each STEP must include loading, empty, error, and success states; responsive layout;
accessible controls; TanStack Query for server data; and display of **backend** values
without re-implementing business rules.

---

## STEP 0 — Frontend foundation

**Goal:** Make `frontend/` a real dashboard app, not a stub.

Wire (do not run `pnpm install` until asked):

- Tailwind CSS (only styling system)
- shadcn/ui primitives needed for later STEPs (Button, Dialog, Sheet, Tabs, Select,
  Input, Form, Table, Tooltip, Sonner, Skeleton, Alert, Card, Badge)
- Lucide, Framer Motion, TanStack Query, React Router, React Hook Form, Zod
- Shared API client (`Authorization: Bearer`, error mapping of
  `{ message, code, statusCode, validationErrorObjects }`)
- Query-key conventions
- Generated types from `/docs/admin-json` (and auth from that document)
- `PageHeader`, empty/error/skeleton patterns in `components/`

The Vite package already exists. Libraries are **not** installed on disk yet.

**APIs:** none yet.

**Done when:** after install, `pnpm frontend dev` serves the shell on `:5173`, types
are generated, and a later STEP can add a feature without inventing a second stack.

---

## STEP 1 — Auth session + admin shell

**Goal:** An admin can sign in and see a protected layout. Non-admins cannot use
admin routes (UX only; backend still enforces `Roles(ADMIN)`).

**APIs**

- `POST /auth/login`
- `GET /auth/me`

**Notes**

- Store `accessToken`; send `Authorization: Bearer`.
- Default token lifetime is 15 minutes. There is no refresh endpoint. Treat **401**
  as signed out.
- Hide admin nav unless `role === "admin"`. Redirect others. Do not treat hidden
  buttons as security.
- Shell: sidebar/drawer, page header, sign out.

**Routes:** `/login`, `/admin` (layout).

---

## STEP 2 — Admin home

**Goal:** A calm overview. There is **no** dedicated admin dashboard API. Compose
counts from existing list payloads’ `total` fields (limit=1 is enough for a count).

**APIs (read-only totals)**

- `GET /admin/books?limit=1`
- `GET /admin/users?limit=1`
- `GET /admin/subscriptions?limit=1`
- `GET /admin/revenue-periods?limit=1`
- Optional: `POST /admin/revenue-periods/current` only if the product wants a
  one-click “ensure this UTC month” from home (otherwise keep it on STEP 8).

Use a Bento/KPI layout. Do not invent analytics formulas.

**Route:** `/admin`

---

## STEP 3 — Books review and catalog management

**SRS:** §2.3 admin book management.

**APIs**

- `GET /admin/books` — all statuses by default; optional `publishingStatus`
  (`pending` \| `in_review` \| `approved` \| `rejected`)
- `GET /admin/books/:id`
- `PATCH /admin/books/:id` — title, description, bookType, categoryIds only
- `POST /admin/books/:id/approve`
- `POST /admin/books/:id/reject` — **no request body** (no reason field in the
  current contract)
- `POST /admin/books/:id/unpublish` — status stays `approved`; `publishedAt` cleared
- `POST /admin/books/:id/republish` — `publishedAt` set to **now**
- `DELETE /admin/books/:id` — soft-delete

**UI**

- Filterable table + detail page
- Show `publishingStatus`, `processingStatus`, `layoutType`, `bookType`, owner,
  categories, `publishedAt`
- Approve/reject only when `in_review`
- Unpublish only when catalog-visible; republish only when approved and unpublished
- Disable or explain actions the backend will reject; still handle 400/409 from the API

**Routes:** `/admin/books`, `/admin/books/:id`

---

## STEP 4 — Users

**SRS:** §2.3 manage users.

**APIs**

- `GET /admin/users` — filters: `role`, `isPublisher`, `email`, `limit`, `offset`
- `GET /admin/users/:id`
- `PATCH /admin/users/:id` — `role`, `isPublisher`
- `DELETE /admin/users/:id`

**Contract UX (do not bypass)**

- `USER_SELF_MANAGEMENT` — an admin cannot change their own account here
- `USER_LAST_ADMIN` — the last remaining admin cannot be demoted or deleted

**Routes:** `/admin/users`, `/admin/users/:id`

---

## STEP 5 — Subscriptions

**SRS:** §2.3 manage subscriptions.

**APIs**

- `GET /admin/subscriptions` — filters: `userId`, `status` (`active` \| `canceled`)
- `GET /admin/subscriptions/:id`
- `POST /admin/subscriptions/:id/cancel` — cancel **without** a refund; access
  continues until `currentPeriodEnd`

Display plan, status, and `currentPeriodEnd` from the API. Do not recompute
entitlement in the UI. There is no admin refund endpoint in Part 1.

**Routes:** `/admin/subscriptions`, `/admin/subscriptions/:id`

---

## STEP 6 — Collections

**SRS:** §2.3 curated collections.

**APIs**

- `POST /admin/collections`
- `GET /admin/collections`, `GET /admin/collections/:id`
- `PATCH /admin/collections/:id` — title only
- `DELETE /admin/collections/:id`
- `POST /admin/collections/:id/books`
- `DELETE /admin/collections/:id/books/:bookId`
- `POST /admin/collections/:id/reorder`

**Notes**

- Unpublished books can remain in **admin** membership; they are excluded from
  reader-facing collection results. Do not hide them in the admin editor.
- No-op add/remove/reorder does not write audit rows. UI should not pretend they did.

**Routes:** `/admin/collections`, `/admin/collections/:id`

---

## STEP 7 — Category weights

**SRS:** §2.3 category revenue weights.

**APIs**

- `GET /admin/categories`, `GET /admin/categories/:id`
- `PATCH /admin/categories/:id` — `categoryWeight` **> 0** only

Do **not** add create, rename, or delete. Those HTTP APIs do not exist.

The UI must not imply that changing a weight rewrites historical payouts until a
revenue period is recalculated (STEP 9).

**Routes:** `/admin/categories`

---

## STEP 8 — Revenue periods

**SRS:** §7.3–7.4.

**APIs**

- `GET /admin/revenue-periods`, `GET /admin/revenue-periods/:id`
- `POST /admin/revenue-periods`
- `POST /admin/revenue-periods/current` — open current UTC month if missing
- `PATCH /admin/revenue-periods/:id` — `poolAmountCents`, `platformCutPercent`
  (cut cannot change when status is `closed`)
- `POST /admin/revenue-periods/:id/close`

Pool is admin-set integer cents. Display money from cents. Do not derive the pool
from Stripe in the UI.

**Routes:** `/admin/revenue`, `/admin/revenue/:id`

---

## STEP 9 — Calculate, analytics, heatmap

**SRS:** §7.4, §12.3 (heatmap is also admin).

**APIs**

- `POST /admin/revenue-periods/:id/engagements` — refresh weighted engagement
  (not a calculate-audit event)
- `POST /admin/revenue-periods/:id/calculate` — requires `poolAmountCents`; refreshes
  engagement; writes shares; appends `REVENUE_CALCULATED`
- `GET /admin/revenue-periods/:id/earnings`
- `GET /admin/revenue-periods/:id/analytics`
- `GET /admin/revenue-periods/:id/books/:bookId/heatmap`

**UI rules**

- Show backend `authorCents`, `platformCutCents`, `weightedEngagement`,
  `totalReadingMinutes`. Do not recompute category-weight averages or pool splits.
- Heatmap is layout-aware: `spreads` for fixed-layout, `chapters` for reflowable.
- Confirm calculate; recalculate is allowed and creates another audit row.
- Visual scene time may be shown; it is **not** paid.

**Routes:** `/admin/revenue/:id` (earnings/analytics tabs), `/admin/revenue/:id/books/:bookId/heatmap`

---

## STEP 10 — Audit log

**SRS:** §2.4.

**APIs**

- `GET /admin/audit-logs` — filters: `actorUserId`, `action`, `subjectType`, `subjectId`
- `GET /admin/audit-logs/:id`

Read-only. Show actor, action, subject, reason, metadata. Do not invent missing
events (metadata PATCH and category-weight PATCH are not required audit events).

**Routes:** `/admin/audit`, `/admin/audit/:id`

---

## Out of scope for this list

- Author dashboard (books upload, author analytics/earnings)
- Reader catalog / dual-engine reader / React Native
- Part 2 TTS, Part 3 formatting
- Admin create/rename/delete categories
- Admin refund
- Reject-reason field (not on the current reject API)
- Recalculating publisher earnings in the browser

## Implementation order

Implement STEPs in order. STEP 0 and STEP 1 are prerequisites for every screen.
STEP 8 must exist before STEP 9. Other feature STEPs (3–7, 10) can proceed after
STEP 1 if needed, but home (STEP 2) is the natural next screen after the shell.
