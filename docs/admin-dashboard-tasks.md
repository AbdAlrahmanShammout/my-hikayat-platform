# Admin dashboard — implementation STEPs

This file is the **delivery tracker** for the admin dashboard: what to build, in what
order, and whether it is done. Architecture conventions live in
`docs/FRONTEND-ARCHITECTURE.md` (admin/author web) and `docs/MOBILE-ARCHITECTURE.md`
(reader mobile). Do not update architecture documents for STEP completion.

Product requirements: `docs/SRS.md` §2.2, §2.3, §2.5, §2.4, §7.3–7.4, §12.0–§12.3.
Frontend engineering: `docs/FRONTEND-ARCHITECTURE.md`.
Mobile engineering: `docs/MOBILE-ARCHITECTURE.md` (package runbook: `mobile/README.md`).
Backend contracts: existing `/admin/*`, `/author/*`, `/auth/*`, and `POST /user/publisher`.
Dedicated Home summary endpoints are required by STEPs 29–30; do not add
other backend endpoints unless a STEP explicitly records a contract gap.

STEPs 0–15 are the admin web dashboard. STEPs 16–30 are the author dashboard in this
same sequential tracker. STEPs 31+ are the reader mobile app (Expo + React Native).

Status values: **Pending**, **In progress**, **Complete**.

Bootstrap already done (not a UI STEP): `frontend/` workspace, Vite on `:5173`,
CORS default includes the Vite origin, agent routing to
`docs/FRONTEND-ARCHITECTURE.md`. Mobile bootstrap is STEP 31 (R0) under `mobile/`,
governed by `docs/MOBILE-ARCHITECTURE.md`.

| STEP | Capability | Status |
| --- | --- | --- |
| 0 | Frontend foundation (design system + data layer) | Complete |
| 1 | Auth session + admin shell | Complete |
| 2 | Admin home (composed KPIs) | Complete |
| 3 | Books review and catalog management | Complete |
| 4 | Users | Complete |
| 5 | Subscriptions | Complete |
| 6 | Collections | Complete |
| 7 | Category weights | Complete |
| 8 | Revenue periods | Complete |
| 9 | Revenue calculate, analytics, heatmap | Complete |
| 10 | Audit log | Complete |
| 11 | Invite admin (pending list + email invite) | Complete |
| 12 | Accept admin invitation (public page) | Complete |
| 13 | Create and rename categories | Complete |
| 14 | Reject book with required reason | Complete |
| 15 | Admin subscription refund | Complete |
| 16 | Auth session + author shell | Complete |
| 17 | Author books list | Complete |
| 18 | Author book create | Complete |
| 19 | Author book detail and metadata edit | Complete |
| 20 | Author source upload | Complete |
| 21 | Author preview image and promo video | Complete |
| 22 | Author submit for review | Complete |
| 23 | Author book rejection history | Complete |
| 24 | Author category picker | Complete |
| 25 | Author analytics | Complete |
| 26 | Author earnings | Complete |
| 27 | Author heatmap | Complete |
| 28 | Author account create | Complete |
| 29 | Admin home KPI summary | Complete |
| 30 | Author home KPI summary | Complete |
| 31 | Mobile reader bootstrap (Expo RN+TS, Replit-portable) | Complete |
| 32 | Mobile auth session + kids-friendly tab shell | Complete |
| 33 | Mobile catalog browse + book detail (R2) | Complete |
| 34 | Mobile catalog metadata search (R2) | Complete |
| 35 | Mobile curated collections discovery (R2) | Complete |
| 36 | R2 Mobile Discovery E2E (Maestro) — testing phase | Deferred |
| 37 | Mobile open-book shell + dual-engine routing (R3) | Complete |

Each STEP must include loading, empty, error, and success states; responsive layout;
accessible controls; TanStack Query for server data; and display of **backend** values
without re-implementing business rules.

---

## STEP 0 — Frontend foundation

**Goal:** Make `frontend/` a real dashboard app, not a stub.

Installed:

- Tailwind CSS (only styling system)
- shadcn/ui primitives needed for later STEPs (Button, Dialog, Sheet, Tabs, Select,
  Input, Form, Table, Tooltip, Sonner, Skeleton, Alert, Card, Badge)
- Lucide, Framer Motion, TanStack Query, React Router, React Hook Form, Zod
- Shared API client (`Authorization: Bearer`, error mapping of
  `{ message, code, statusCode, validationErrorObjects }`)
- Query-key conventions
- Generated types from `/docs/admin-json` (and auth from that document)
- `PageHeader`, empty/error/skeleton patterns in `components/`

The Vite package exists. Libraries are installed. The feature tree, Tailwind
tokens, HTTP client, query keys, and shared `PageHeader` / empty / error /
skeleton components are in place. Audience OpenAPI types are generated into
`frontend/src/generated/` via `pnpm --filter frontend generate:api` (requires a
running API). Auth types are aliases of those generated schemas.

Remaining shadcn primitives (Dialog, Sheet, Tabs, Select, Form, Table, Tooltip)
live under `components/ui`. They are hand-written so later STEPs have a surface;
the shadcn CLI was not run because the npm registry timed out. Sonner is not
installed yet.

**APIs:** none yet.

**Done when:** `pnpm frontend dev` serves the shell on `:5173`, types
are generated, remaining primitives exist, and a later STEP can add a
feature without inventing a second stack.

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

**Routes:** `/login`, `/admin` (layout). Sidebar links to later STEPs render empty
states until those STEPs land.

**Written:** login form (`POST /auth/login`), `GET /auth/me`, sessionStorage Bearer
token, 401 clears the session, admin UX guard, sidebar/drawer shell, sign out.
Non-admins see a forbidden screen. Auth wire types come from `src/generated/admin.ts`.

---

## STEP 2 — Admin home

**Goal:** A calm overview. The original STEP shipped four composed list
`total` cards (books, users, subscriptions, revenue periods). That Home
metric set is **replaced by STEP 29**. Keep this STEP Complete as the
historical composed-totals work. Do not add more list-fan-out cards here.

**APIs (read-only totals, superseded for Home by STEP 29)**

- `GET /admin/books?limit=1`
- `GET /admin/users?limit=1`
- `GET /admin/subscriptions?limit=1`
- `GET /admin/revenue-periods?limit=1`

Use a Bento/KPI layout. Do not invent analytics formulas.

**Route:** `/admin`

**Written:** four independent KPI cards read `total` from `GET /admin/books`,
`/admin/users`, `/admin/subscriptions`, and `/admin/revenue-periods` with
`limit=1`. Each card has loading, error/retry, and a zero empty label.
STEP 29 replaces this set with the SRS §2.3 Home KPIs and a dedicated
summary API. Subscription and revenue-period counts remain on their
dedicated pages.

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
  categories, `publishedAt`. Display both fields. Do not treat `bookType` as
  the reader engine. Engine and heatmap layout follow `layoutType`.
- Approve/reject only when `in_review`
- Unpublish only when catalog-visible; republish only when approved and unpublished
- Disable or explain actions the backend will reject; still handle 400/409 from the API

**Routes:** `/admin/books`, `/admin/books/:id`

**Written:** filterable `GET /admin/books` table (optional `publishingStatus`, `limit`/`offset`)
and a detail screen at `/admin/books/:bookId`. Detail shows publishing/processing status,
layout, type, owner, categories, and `publishedAt`. Metadata PATCH is limited to title,
description, bookType, and categoryIds. Approve/reject are offered only for `in_review`
(approve also needs `processingStatus === ready`). Unpublish is offered only when the
book is approved and catalog-visible; republish only when approved, unpublished, and
ready. Reject sends no body. 400/409 from the API still surface. Soft-delete returns
to the list.

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

**Written:** filterable `GET /admin/users` table (`role`, `isPublisher`, exact `email`,
`limit`/`offset`) and a detail screen at `/admin/users/:userId`. PATCH is limited to
`role` and `isPublisher`. Reader/author publisher coupling is reflected in the form and
still enforced by the API (`USER_INVALID_CAPABILITY`; SRS §2.5). An admin cannot change or delete
their own account (`USER_SELF_MANAGEMENT`). The last remaining admin cannot be demoted
or deleted (`USER_LAST_ADMIN`); 400/409 from the API still surface. Soft-delete returns
to the list.

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

**Written:** filterable `GET /admin/subscriptions` table (`status`, `userId`, `limit`/`offset`)
and a detail screen at `/admin/subscriptions/:subscriptionId`. The UI displays plan, status,
and `currentPeriodEnd` from the API and does not recompute entitlement. Cancel calls
`POST /admin/subscriptions/:id/cancel` without a refund and is disabled when status is
already `canceled`. There is no refund action.

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

**Written:** list + create at `/admin/collections`, detail at `/admin/collections/:collectionId`.
Title PATCH only. Membership add/remove/reorder uses the collection book APIs. Unpublished
books stay visible in the admin editor. Reorder is not sent when the order did not change.
409 `COLLECTION_BOOK_ALREADY_ADDED` and other API errors still surface.

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

**Written:** list + inline `categoryWeight` edit at `/admin/categories` (`limit`/`offset`).
PATCH is limited to `categoryWeight` greater than 0. Name and slug are read-only; there is
no create, rename, or delete. Unchanged weights are not sent. The screen states that a
weight change does not rewrite historical payouts until a period is recalculated. 422
from the API still surfaces.

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

**Written:** list + create + “open current UTC month” at `/admin/revenue`, detail at
`/admin/revenue/:revenuePeriodId`. Pool is displayed from integer cents and is not
derived from Stripe. PATCH is limited to `poolAmountCents` and, while open,
`platformCutPercent`. Cut is disabled after close; pool can still be set. Unchanged
values are not sent. Close is confirmed and idempotent. Calculate, earnings, analytics,
and heatmap stay on STEP 9.

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
- Heatmap is layout-aware from the API `layoutType`: `spreads` for
  `fixed_layout`, `chapters` for `reflowable`. Do not choose the heatmap
  shape from `bookType`.
- Confirm calculate; recalculate is allowed and creates another audit row.
- Visual scene time may be shown; it is **not** paid.

**Routes:** `/admin/revenue/:id` (earnings/analytics tabs), `/admin/revenue/:id/books/:bookId/heatmap`

**Written:** calculate and refresh-engagement on the period detail screen. Calculate is
confirmed, requires `poolAmountCents`, and is allowed to run again. Earnings and
analytics tabs show backend `authorCents`, `platformCutCents`, `weightedEngagement`,
and `totalReadingMinutes` without recomputing splits. Visual scene time is labeled
not paid. Heatmap at `/admin/revenue/:revenuePeriodId/books/:bookId/heatmap` uses
`spreads` for fixed-layout and `chapters` for reflowable.

---

## STEP 10 — Audit log

**SRS:** §2.4.

**APIs**

- `GET /admin/audit-logs` — filters: `actorUserId`, `action`, `subjectType`, `subjectId`
- `GET /admin/audit-logs/:id`

Read-only. Show actor, action, subject, reason, metadata. Do not invent missing
events (metadata PATCH and category-weight PATCH are not required audit events).

**Routes:** `/admin/audit`, `/admin/audit/:id`

**Written:** read-only list at `/admin/audit` with `actorUserId`, `action`,
`subjectType`, and `subjectId` filters, and detail at `/admin/audit/:auditLogId`.
Actor, action, subject, reason, and metadata come from GET `/admin/audit-logs`.
Missing events are not invented. Metadata PATCH and category-weight PATCH are
labeled as not required audit events. Subject rows link to the matching admin
screen when the type is known.

---

## STEP 11 — Invite admin

**SRS:** §2.3 invitation-only admin grant; official invitation email.

**APIs**

- `POST /admin/invitations` `{ email }` — sends the official email; returns the
  raw token **once**
- `GET /admin/invitations` — pending unexpired only; never `token` / `tokenHash`

**UI**

- Invite by email. Show that the official email was sent. Show the one-time
  accept link only on the create response (G2 is the public accept page).
- List pending invitations from the API. Do not invent used/expired rows.
- `PATCH /admin/users` must not offer granting `ADMIN`. Demote remains available.

**Route:** `/admin/invitations`

**Written:** list + invite form at `/admin/invitations` (`limit`/`offset`). Create
calls `POST /admin/invitations` `{ email }`, shows that the official email was
sent, and shows the one-time accept link only on that response. The pending
table is `GET /admin/invitations` and never displays `token` or `tokenHash`.
User edit no longer offers granting `ADMIN`; demote remains available. 409/400
from the API still surface.

---

## STEP 12 — Accept admin invitation

**SRS:** §2.3 public accept; token + password; session returned.

**APIs**

- `POST /auth/accept-admin-invitation` `{ token, password }` — public and
  credential-throttled; returns an auth session

**UI**

- Public route reads `token` from the query string. Missing or blank token is an
  incomplete-link state with a path to sign in. The token is never displayed.
- Password + confirm (confirm is UX only). Client length checks match the API
  bounds; the backend remains authoritative.
- Invalid, expired, and already-accepted failures show the API `message`.
- Success stores the session and replaces the history entry with `/admin`.

**Route:** `/accept-admin-invitation`

**Written:** public page at `/accept-admin-invitation`. `token` comes from the
emailed query string via `parseAdminInvitationToken`. The form posts
`POST /auth/accept-admin-invitation` `{ token, password }`, maps password
validation onto the field, and surfaces 400 invitation errors as the API
message. Confirm-password is client-only. A successful accept writes the
access token, seeds `GET /auth/me`, and navigates to `/admin`.

---

## STEP 13 — Create and rename categories

**SRS:** §2.3 admin HTTP create and rename. No delete.

**APIs**

- `POST /admin/categories` `{ name }`; optional `slug` and `categoryWeight`
- `PATCH /admin/categories/:id` `{ name?, slug?, categoryWeight? }` — omitted
  fields are left unchanged. Rename does not change weight.

**UI**

- Create on `/admin/categories`. Blank slug and weight are omitted so the API
  applies defaults. Do not derive slug or default weight in the UI.
- Rename name and/or slug. Do not send `categoryWeight` from the rename form.
- Keep inline `categoryWeight` edit. Do not offer delete.
- 409 name/slug conflicts and 422 validation still surface.

**Route:** `/admin/categories`

**Written:** create form posts `POST /admin/categories` and omits blank slug and
weight. Rename dialog PATCHes only changed `name`/`slug`. Weight stays on the
existing inline form. Empty list still allows create. Delete is not shown.
Conflict and validation errors from the API still surface.

---

## STEP 14 — Reject book with required reason

**SRS:** §2.3 reject requires a non-empty `reason` on `audit.reason`; rejection
history is the filtered audit log.

**APIs**

- `POST /admin/books/:id/reject` `{ reason }` — required, non-empty
- `GET /admin/books/:id/rejection-history` — `book_rejected` audit rows;
  `limit` / `offset`; empty list when never rejected

**UI**

- Reject dialog collects a reason. Do not send an empty reason. Confirm-only
  reject is gone.
- Book detail shows rejection history from the API. Do not invent missing
  reasons or a second rejection store.
- 400 `BOOK_REJECTION_REASON_REQUIRED` and other API failures still surface.

**Route:** `/admin/books/:bookId`

**Written:** reject posts `{ reason }`. History is
`GET /admin/books/:id/rejection-history` on the detail page (`rejectionOffset`).
Empty history is shown as an empty list. Reasons come from `audit.reason`.

---

## STEP 15 — Admin subscription refund

**SRS:** §2.3 / §6.2 same 7-day activation window as the reader refund.

**APIs**

- `POST /admin/subscriptions/:id/refund` — no body; backend eligibility and
  window remain authoritative

**UI**

- Refund action on the subscription detail screen.
- Do not compute the 7-day window or entitlement in the UI. Show displayed
  `activatedAt` in the confirm copy only.
- Disable from displayed fields when status is `canceled` or plan kind is
  `free`. Window expiry still comes from the API (`REFUND_WINDOW_EXPIRED`,
  `REFUND_NOT_ELIGIBLE`).
- Cancel without refund remains available.

**Route:** `/admin/subscriptions/:subscriptionId`

**Written:** refund posts `POST /admin/subscriptions/:id/refund`. Confirm copy
states the API owns the 7-day window and that a granted refund closes
`currentPeriodEnd` immediately. 400 from the API still surfaces.

---

## STEP 16 — Auth session + author shell

**Goal:** An author can sign in and see a protected author layout. Readers cannot
use author routes (UX only; backend still enforces `Roles(AUTHOR, ADMIN)`).

**APIs**

- `POST /auth/login`
- `GET /auth/me`

**Notes**

- Reuse the existing access-token session. Do not invent a second auth stack.
- After login, `admin` goes to `/admin` and `author` goes to `/author`.
- Hide author nav unless the current role is `author` or `admin`, matching the
  author HTTP Roles. Redirect others from `/author`. Do not treat hidden
  buttons as security.
- A signed-in reader on `/login` or `/register` is offered publisher enable
  (STEP 28). A reader who opens `/author` still sees the author-route forbidden
  screen. `isPublisher` is not an HTTP role and does not admit `/author`.
- Do not duplicate publisher rules. Display `isPublisher` from `GET /auth/me`
  only.
- Shell: sidebar/drawer, page header, sign out.
- Book list, create, upload, analytics, and earnings are later STEPs.

**Routes:** `/login`, `/author` (layout). `/author/books` is STEP 17.

**Written:** login routes by role, `/` goes to `/login`, author UX guard,
sidebar/drawer shell, sign out, home shows `GET /auth/me` identity. Readers who
open `/author` see a forbidden screen. Admins may open `/author` because the API
allows it. Reader sign-in onboarding to publisher is STEP 28. Home KPI cards are
STEP 30.

---

## STEP 17 — Author books list

**Goal:** An author can list books they own. The list is owner-scoped by the API.
The UI does not show other publishers’ books and does not re-filter ownership.

**APIs**

- `GET /author/books` — optional `publishingStatus` (`pending` \| `in_review` \|
  `approved` \| `rejected`), `limit`, `offset`

**Notes**

- Display backend `publishingStatus`, `processingStatus`, `layoutType`, `bookType`,
  categories, and `publishedAt`. Do not invent catalog visibility. `bookType` is
  content metadata; `layoutType` is the detected rendering model.
- Do not call `/admin/books` on this screen. Create, detail, upload, submit-for-review,
  and rejection history stay on later STEPs.
- Admins may open `/author/books` because author HTTP allows `ADMIN`; they still only
  see books they own.

**Routes:** `/author/books`

**Written:** filterable `GET /author/books` table (`publishingStatus`, `limit`/`offset`)
at `/author/books`. Empty, loading, and error states are covered. There is no create
or detail action yet.

---

## STEP 18 — Author book create

**Goal:** An author with publisher capability can create a book they own. The backend
sets owner and pending publishing status. The UI does not invent publisher rules.

**APIs**

- `POST /author/books` `{ title, description, bookType }` — optional `categoryIds`
  omitted until the category-picker STEP
- `GET /auth/me` — display `isPublisher` only

**Notes**

- Owner is the authenticated publisher. Do not send ownerId.
- Do not send publishing status, processing status, or layout type.
- Disable create when displayed `isPublisher` is false. Still surface
  `BOOK_OWNER_NOT_PUBLISHER` from the API. `isPublisher` is a book-ownership
  capability, not an HTTP role. Author routes still require `role` `author` or
  `admin`.
- Category assignment stays on a later STEP.

**Routes:** `/author/books`

**Written:** create form posts `POST /author/books` with title, description, and
bookType. `isPublisher` comes from `GET /auth/me`. Empty list still allows create.
Success opens the new book detail. Upload and categories are later STEPs.

---

## STEP 19 — Author book detail and metadata edit

**Goal:** An author can open one owned book and update title, description, and type.
Publishing status is displayed, not patched.

**APIs**

- `GET /author/books/:id`
- `PATCH /author/books/:id` `{ title?, description?, bookType? }` — omitted fields
  unchanged. Do not send publishing status, processing status, or layout type.

**Notes**

- Ownership is enforced by the API (`404` when the actor is not the owner and is not
  an admin). Do not re-filter ownership in the UI.
- `bookType` is author-editable metadata. `layoutType` is processing-detected and
  not patched here. Changing type does not change the reader engine.
- Assigned categories are displayed from the GET payload. Category edit stays on the
  picker STEP. Do not send `categoryIds`.
- Source upload is STEP 20. Submit-for-review and rejection history stay on later
  STEPs.

**Routes:** `/author/books/:bookId`

**Written:** detail at `/author/books/:bookId` loads `GET /author/books/:id`. Metadata
PATCH is limited to title, description, and bookType. Status fields are read-only.
List rows and a successful create open this screen.

---

## STEP 20 — Author source upload

**Goal:** An author can upload an EPUB or PDF source for an owned book. The backend
encrypts and stores the file. The browser does not encrypt.

**APIs**

- `POST /author/books/:bookId/source` — multipart field `file`

**Notes**

- Accept EPUB or PDF only as UX. The API remains authoritative
  (`BOOK_ASSET_INVALID_SOURCE_TYPE`, `BOOK_ASSET_EMPTY_SOURCE`,
  `BOOK_ASSET_SOURCE_TOO_LARGE`).
- Do not send JSON. Do not set `Content-Type` on the multipart request.
- Do not list historical source assets; there is no author source-list API. Show the
  `201` `BookAssetResponse` (`originalFileName`, `contentType`, `byteSize`,
  `isEncrypted`). Do not display `storageKey`.
- A successful upload resets processing status on the server; invalidate the book
  queries so the summary refreshes.
- Preview image, promo video, and submit-for-review stay on later STEPs.

**Routes:** `/author/books/:bookId`

**Written:** source form posts multipart `file` to `POST /author/books/:bookId/source`.
Client checks empty, size, and extension only. Encryption stays on the API. Success
shows the created asset without `storageKey`.

---

## STEP 21 — Author preview image and promo video

**Goal:** An author can upload catalog media for an owned book. Preview is JPEG/PNG/WebP.
Promo video is optional MP4/WebM. Encryption of catalog media is not done in the
browser; the API stores these assets unencrypted.

**APIs**

- `POST /author/books/:bookId/preview-image` — multipart field `file`
- `POST /author/books/:bookId/promo-video` — multipart field `file`

**Notes**

- Client type/size checks are UX only. The API remains authoritative
  (`BOOK_ASSET_INVALID_PREVIEW_TYPE`, `BOOK_ASSET_EMPTY_PREVIEW`,
  `BOOK_ASSET_PREVIEW_TOO_LARGE`, `BOOK_ASSET_INVALID_PROMO_VIDEO_TYPE`,
  `BOOK_ASSET_EMPTY_PROMO_VIDEO`, `BOOK_ASSET_PROMO_VIDEO_TOO_LARGE`).
- Do not list historical media; there is no author media-list API. Show the `201`
  `BookAssetResponse` without `storageKey`. Display `isEncrypted` from the API.
- A promo upload replaces the stored promo video when one already exists. Do not
  offer delete; there is no delete media HTTP.
- Submit-for-review stays on a later STEP.

**Routes:** `/author/books/:bookId`

**Written:** preview and optional promo forms post multipart `file` to the matching
author media routes. Success shows filename, content type, byte size, and
`isEncrypted` from the API.

---

## STEP 22 — Author submit for review

**Goal:** An author can submit an owned book for editorial review. The backend owns
processing and the publishing-status machine. The UI does not PATCH publishing status.

**APIs**

- `POST /author/books/:bookId/submit-for-review` — no body; returns the book

**Notes**

- Enable from displayed `publishingStatus` of `pending` or `rejected` only (`pending`
  and `rejected` can move to `in_review`). Still surface
  `BOOK_INVALID_PUBLISHING_TRANSITION` and `BOOK_NOT_READY_FOR_REVIEW`.
- Do not require `processingStatus === ready` in the UI. The API may process the
  source first.
- Do not send publishing status, processing status, or layout type.

**Routes:** `/author/books/:bookId`

**Written:** confirm action posts `POST /author/books/:bookId/submit-for-review`.
Disabled from displayed `in_review` and `approved`. Success refreshes the book
record so `publishingStatus` updates.

---

## STEP 23 — Author book rejection history

**Goal:** An author can read rejection reasons for an owned book from the existing
audit log. An empty list means the book was never rejected.

**APIs**

- `GET /author/books/:id/rejection-history` — `book_rejected` audit rows;
  `limit` / `offset`

**Notes**

- History is the append-only audit log filtered by action and subject. Do not invent
  a second rejection store or missing reasons.
- Do not link to admin audit or admin user screens from this table.
- Display `createdAt`, `actorUserId`, and `audit.reason` from the API.

**Routes:** `/author/books/:bookId`

**Written:** history panel on the detail page is `GET /author/books/:id/rejection-history`
(`rejectionOffset`). Empty history is shown as an empty list. Reasons come from
`audit.reason`.

---

## STEP 24 — Author category picker

**Goal:** An author can assign admin-owned categories when creating or editing a book.
The taxonomy is read-only. The author app does not create, rename, or delete
categories.

**APIs**

- `GET /author/categories` — read-only taxonomy, including `categoryWeight`;
  `limit` / `offset`
- `POST /author/books` `{ title, description, bookType, categoryIds? }`
- `PATCH /author/books/:id` `{ title?, description?, bookType?, categoryIds? }`

**Notes**

- Do not add a category-management screen or create form on the author app.
- Empty taxonomy is an empty list from the API, not invented options.
- Do not recompute category weights. Display names from `GET /author/categories`.
- Assigned categories on GET remain visible even if they fall outside the lookup page.

**Routes:** `/author/books`, `/author/books/:bookId`

**Written:** create and metadata forms load `GET /author/categories` and send
`categoryIds`. There is no author category create path.

---

## STEP 25 — Author analytics

**Goal:** An author can read engagement totals and per-book rows for one revenue
period. The UI displays backend values. It does not recompute weighted engagement.

**APIs**

- `GET /author/analytics` — `revenuePeriodId` required; `limit` / `offset`;
  totals and `bookEngagements` ranked by the API
- `GET /author/earnings/trend` — period lookup for `revenuePeriodId` only
  (dates and status). Do not display `authorCents` on this screen.

**Notes**

- There is no author `GET /author/revenue-periods`. Trend points are the period list.
- Empty engagement is an empty list from the API, not invented rows.
- Visual scene time is displayed and is not paid.
- Heatmap stays on a later STEP. Do not link to a heatmap screen yet.
- Do not re-sort API-ranked rows.

**Routes:** `/author/analytics`

**Written:** analytics page loads `GET /author/analytics` for the selected
`revenuePeriodId`. Totals are shown as returned. Period options come from
`GET /author/earnings/trend` without showing cents.

---

## STEP 26 — Author earnings

**Goal:** An author can read payout cents by revenue period and per owned book. The UI
displays backend cents. It does not recalculate pool shares or platform cut.

**APIs**

- `GET /author/earnings/trend` — `limit` / `offset`; `authorCents` per period
- `GET /author/earnings` — `revenuePeriodId` required; `limit` / `offset`;
  `authorCents` total and `bookRevenues`

**Notes**

- Do not sum row cents in the browser. Display `authorCents` from each endpoint.
- Do not re-sort API-ranked rows.
- Empty earnings is an empty list from the API, not invented shares.
- Heatmap stays on a later STEP. Do not link to admin revenue or user screens.

**Routes:** `/author/earnings`

**Written:** earnings page shows trend cents from `GET /author/earnings/trend` and
per-book shares from `GET /author/earnings` for the selected `revenuePeriodId`.

---

## STEP 27 — Author heatmap

**Goal:** An author can view layout-aware engagement cells for an owned book in a
revenue period. The UI renders the payload the API returns. It does not invent cells.

**APIs**

- `GET /author/analytics/books/:bookId/heatmap` — `revenuePeriodId` required;
  `layoutType`, `spreads`, `chapters`

**Notes**

- Fixed-layout uses `spreads`. Reflowable uses `chapters`. Unknown `layoutType`
  shows empty, not synthesized cells. Choose the view from heatmap `layoutType`,
  not from `bookType`.
- Do not re-sort API-ordered cells (hottest first).
- Missing reflowable titles are labeled, not invented.
- Visual scene time is displayed and is not paid.
- Ownership is enforced by the API (`404`). Do not re-filter ownership in the UI.

**Routes:** `/author/analytics/books/:bookId/heatmap`

**Written:** heatmap page loads `GET /author/analytics/books/:bookId/heatmap`.
Analytics rows open this screen with `revenuePeriodId`.

---

## STEP 28 — Author account create

**Goal:** A visitor can start Author / Publisher onboarding from this dashboard.
Public register still creates a reader. The UI then enables publisher capability.
There is no author-only register API. `/register` is part of the existing
author onboarding flow, not a separate product.

**Product flow**

1. Visitor opens `/register` (Create an author account), or follows the link
   from `/login`.
2. `POST /auth/register` creates a reader (`role = reader`,
   `isPublisher = false`) and returns a normal `AuthSession`. A local name such
   as `readerSession` is not a second session type.
3. `POST /user/publisher` uses that reader token, sets `isPublisher = true`,
   promotes `reader → author`, and returns a **new** `AuthSession`.
4. The client stores the new author session and navigates to `/author`.
5. If step 3 fails after step 2 succeeded, the reader session is stored so the
   become-publisher panel can retry.

Signed-in authors and admins who open `/register` or `/login` go to their
dashboard. A signed-in reader sees become-publisher instead of a dead-end
forbidden screen. `isPublisher` is a book-ownership capability. It is not an
HTTP role and does not by itself admit `/author`.

**APIs**

- `POST /auth/register` — `{ email, password }`; always creates a reader
- `POST /user/publisher` — authenticated; a reader becomes `author` with
  `isPublisher: true`; an admin stays `admin` with `isPublisher: true`

**Notes**

- Do not invent `POST /auth/register-as-author`.
- Client password bounds are UX only (`8`–`72`). The API remains authoritative.
- Login links to `/register`. Register links to `/login`.
- SRS: §2.2, §2.5.

**Routes:** `/register`. `/login` remains the sign-in screen.

**Written:** public `/register` form, register-then-publisher mutation, become-
publisher panel for signed-in readers, login link to create an author account.

---

## STEP 29 — Admin home KPI summary

**SRS:** §2.3 Admin dashboard Home. Frontend Home contract:
`docs/FRONTEND-ARCHITECTURE.md` §9.

**Goal:** `/admin` answers “how is the platform doing?” with six backend
KPIs. It stays a summary. Users, books, analytics, and revenue details
remain on existing pages.

**Contract gap:** existing list endpoints cannot produce a correct
Published Books total (`publishingStatus=approved` includes unpublished
approved books; catalog visibility also requires processing `ready` and
`publishedAt`). Period-scoped analytics cannot produce lifetime reading
minutes without the UI summing pages. There is no dashboard-summary
pattern yet. Add one purpose-built response.

**API**

- `GET /admin/dashboard/summary` — `@Roles(ADMIN)`; platform-wide; no
  query filters

Returned fields (required; `0` when empty; never null):

- `totalUsers` — integer count
- `totalPublishers` — integer count; `isPublisher = true` (§2.5), including
  admin publishers. Not `role = author`
- `totalBooks` — integer count
- `publishedBooks` — integer count; catalog-visible (§3)
- `pendingReviewBooks` — integer count; `publishingStatus = in_review`
- `totalReadingMinutes` — number minutes; same division as analytics
  (`(sum(activeReadingMs) + sum(activeSpreadMs)) / 60000`). No extra
  rounding. Idle and `visualSceneTimeMs` excluded. Do not return ms.

Do not return individual earnings or private user fields. DTO:
`GetAdminDashboardSummaryResponseDto`. OpenAPI: `@ApiTags('Admin - Dashboard')`,
`@ApiOperation`, `@ApiBearerAuth`, `@ApiResponse({ status: 200, type: … })`.

**Backend**

- Thin controller on the admin audience module. Orchestrate in a summary
  service that calls existing `UserService`, `BookService`, and
  `BookEngagementService` (same home as `AdminAnalyticsService` is
  acceptable; do not duplicate formulas).
- Reuse `UserService` list totals (all users; `isPublisher=true`).
- Reuse `BookService.listBooks` totals (all books; `in_review`).
- Add an owner-optional **catalog-visible count** on `BookService` that
  uses the existing catalog predicate (`approved` + `ready` +
  `publishedAt`), not a new published definition.
- Extend engagement summarize so `revenuePeriodId` may be omitted for an
  all-period rollup of the same columns. Do not sum live reading
  sessions as a second total.
- Display minutes the API returns. Do not convert ms in the UI if the
  summary already returns minutes.

**UI**

- Replace STEP 2’s four composed list cards with these six KPIs.
- Loading, error/retry, and visible `0` empty states on every card.
- Do not link this screen into a full analytics dashboard.

**Route:** `/admin`

**Tests (required with the HTTP):** admin 200 with zeros and with seeded
counts; reader and author 403; unauthenticated 401; `publishedBooks`
ignores approved-but-unpublished; `totalPublishers` counts `isPublisher`
not `role`; `totalReadingMinutes` matches
`(activeReadingMs + activeSpreadMs) / 60000` and ignores idle /
`visualSceneTimeMs`; soft-deleted users/books excluded.

**Done when:** the summary API is tested; Home displays only backend
fields; zeros stay visible; no frontend aggregation of list pages.

---

## STEP 30 — Author home KPI summary

**SRS:** §12.0. Frontend Home contract: `docs/FRONTEND-ARCHITECTURE.md` §9.

**Goal:** `/author` answers “how is my publishing activity doing?” with
five owner-scoped KPIs. Identity from `GET /auth/me` may remain
secondary. Analytics, heatmap, earnings, and book management stay on
existing pages.

**Contract gap:** same as STEP 29 for published count and lifetime
rollups. Author list `total` is owner-scoped and can support Total Books
and Pending Review, but Home must still be one summary response so the
UI does not fan out requests or sum paginated earnings trend rows.

**API**

- `GET /author/dashboard/summary` — `@Roles(AUTHOR, ADMIN)`; scoped to
  the authenticated user’s `ownerId`. An admin caller still only sees
  books they own

Returned fields (required; `0` when empty; never null):

- `totalBooks` — integer count
- `publishedBooks` — catalog-visible and owned by the caller
- `pendingReviewBooks` — integer count
- `totalReadingMinutes` — number minutes; same division as
  `GET /author/analytics` `totalReadingMinutes`, all periods, that owner
  only. No extra rounding. Do not return ms
- `authorCents` — integer cents; sum of `BookRevenue.authorCents` for
  that owner across all periods (same cents as `GET /author/earnings`,
  rolled up)

DTO: `GetAuthorDashboardSummaryResponseDto`. OpenAPI:
`@ApiTags('Author - Dashboard')`, `@ApiOperation`, `@ApiBearerAuth`,
`@ApiResponse({ status: 200, type: … })`. No `ownerId` query parameter.

**Backend**

- Thin controller on the author audience module. Orchestrate through
  existing `BookService`, `BookEngagementService`, and
  `BookRevenueService` (same home as `AuthorAnalyticsService` is
  acceptable).
- Owner is the principal. Never accept another user’s id from the query
  string.
- Catalog-visible count with `ownerId`.
- All-period engagement summarize with `ownerId`.
- All-period `sumAuthorCents` with `ownerId`. Do not invent a live
  payout from engagement. Uncalculated periods contribute `0`.

**UI**

- One TanStack Query for the summary. Format cents for display only.
- Loading, error/retry, visible `0` on every KPI.
- Do not duplicate the analytics or earnings pages.

**Route:** `/author`

**Tests (required with the HTTP):** author 200 scoped to principal;
second author’s books/minutes/cents do not leak; admin 200 for **their
own** books only; reader 403; unauthenticated 401; no `ownerId` query
accepted; `publishedBooks` uses catalog visibility; `pendingReviewBooks`
is `in_review` only; minutes and `authorCents` match all-period
aggregates of the existing analytics/earnings sources; empty owner
returns zeros.

**Done when:** the summary API is tested for owner isolation; Home
displays only backend fields; a second author’s data never appears.

---

## STEP 31 — Mobile reader bootstrap (R0)

**Goal:** Create a production-shaped, Replit-portable Expo + React Native +
TypeScript package under `mobile/` that installs, typechecks, lints, tests, and
starts. Empty foundation only — same role as admin STEP 0.

**Stack:** Expo managed workflow, Expo Router, React Native (New Architecture),
TypeScript (strict), TanStack Query, Jest (`jest-expo`), ESLint (`eslint-config-expo`).
Conventions: `docs/MOBILE-ARCHITECTURE.md`.

**In scope:**

- Workspace package `mobile/` wired in `pnpm-workspace.yaml`
- Folders per mobile architecture: `src/app`, `src/screens`, `src/features`,
  `src/api`, `src/session`, `src/storage`, `src/config`, `src/theme`
- `EXPO_PUBLIC_API_BASE_URL` via `.env.example` (real `.env` gitignored)
- Scripts: `start`, `typecheck`, `lint`, `test`, `build`
- `mobile/README.md` for Cursor develop / Replit test (runbook only)

**Out of scope:** auth, catalog, dual engines, Smart Resume, offline DRM,
subscriptions UI, audiobooks, kids visual system.

**Done when:** fresh install works; `typecheck` / `lint` / `test` / `build` pass;
app starts; API config comes from env; no secrets committed; no machine-only
deps. Develop in Cursor; Replit is a test host only.

**Next:** R1+ reader features must not start until this STEP is Complete.

---

## STEP 32 — Mobile auth session + kids-friendly tab shell (R1)

**Goal:** Sign-in / register against existing auth HTTP, restore via `GET /auth/me`,
and land in a calm tab shell (Home / My books / Me) with large tap targets.

**APIs (existing only):**

- `POST /auth/register` — `{ email, password }` → `AuthSession` (always `role = reader`)
- `POST /auth/login` — `{ email, password }` → `AuthSession`
- `GET /auth/me` — Bearer → `User`

**In scope:**

- Secure token persistence via `src/storage` + `src/session` (`expo-secure-store`;
  web `localStorage` fallback)
- Shared mobile HTTP client (`src/api/client.ts`) + NestJS `ApiError` mapping;
  clear token on 401
- Expo Router public routes + thin screens; React Hook Form + Zod for auth UX
- Bottom tabs: Home, My books, Me (placeholders — no catalog yet)
- Profile shows email/role from session and Sign out

**Out of scope:** catalog, engines, offline, subscriptions UI, kids illustration system.

**Done when:** cold start restores a valid token via `/auth/me`; invalid/missing token
shows auth; login/register write the session; tabs are navigable; typecheck/lint/tests pass.

---

## STEP 33 — Mobile catalog browse + book detail (R2)

**Goal:** Signed-in readers can browse catalog-visible books on Home (newest /
popularity, optional category) and open a book detail screen. No reading engines yet.

**Architecture:** `docs/MOBILE-ARCHITECTURE.md`.
**APIs (existing only):**

- `GET /reader/catalog?limit&offset&categoryId&sort=` → `{ books, total }`
- `GET /reader/catalog/:id` → `BookResponse` (404 when not catalog-visible)
- `GET /reader/categories?limit&offset` → `{ categories, total }` (filter chips)

**In scope:**

- `features/catalog` API functions + TanStack Query hooks + query keys
- Home tab: list with loading / empty / error / pull-to-refresh
- Sort: newest | popularity (backend values only)
- Optional category filter from `/reader/categories`
- Thin Expo Router detail route → book detail screen
- Kids-friendly targets and plain language; display backend fields only

**Out of scope:** delivery grants, reading sessions, Smart Resume, offline, search,
collections, subscriptions UI, dual engines, preview-image fetch.

**Done when:** Home lists catalog books from the API; filters/sort work; detail loads
a published book and shows a clear not-found/error for unavailable ids;
typecheck/lint/tests pass.

---

## STEP 34 — Mobile catalog metadata search (R2)

**Goal:** Signed-in readers can search catalog-visible books by title, author, or
publisher metadata and open an existing book detail screen. No collections or
in-book search.

**Architecture:** `docs/MOBILE-ARCHITECTURE.md`.
**APIs (existing only):**

- `GET /reader/search?limit&offset&title&author&publisher` → `{ books, total }`

**In scope:**

- `features/search` API function + TanStack Query hook + query keys
- Kids-friendly search screen (loading / empty / error / results / clear)
- Search entry from Home; results open existing `/(app)/books/[bookId]`
- Display backend fields only; reuse catalog book row where practical
- Stable `testID`s for E2E later

**Out of scope:** collections, in-book / full-text search, highlights, dual engines,
Library entitlement list, delivery grants, preview-image fetch, Maestro R2 suite.

**Done when:** a reader can search by title, author, or publisher against
`GET /reader/search`, see empty/error/success states, open an existing book
detail route, and typecheck/lint/tests pass.

---

## STEP 35 — Mobile curated collections discovery (R2)

**Goal:** Signed-in readers can browse curated collections, open a collection,
and open an existing book detail screen. Editorial order and catalog visibility
stay on the backend.

**Architecture:** `docs/MOBILE-ARCHITECTURE.md`.
**APIs (existing only):**

- `GET /reader/collections?limit&offset` → `{ collections, total }`
- `GET /reader/collections/:id` → `CollectionDiscoveryResponse`

**In scope:**

- `features/collections` API functions + TanStack Query hooks + query keys
- Collections list screen (loading / empty / error / retry / success)
- Collection detail screen with books in backend editorial order
- Entry from Home; books open existing `/(app)/books/[bookId]`
- Stable `testID`s for E2E later

**Out of scope:** Library entitlement list, search changes, in-book search,
dual engines, offline, subscriptions, delivery grants, Maestro R2 suite,
backend collection API changes.

**Done when:** a reader can open Collections from Home, see list and detail
states, open a book via the existing detail route, and typecheck/lint/tests pass.

---

## STEP 36 — R2 Mobile Discovery E2E (Maestro) — DEFERRED testing phase

**Status:** **Deferred — Testing phase** (intentionally paused; **not** cancelled;
**not** complete).

**Goal (when resumed):** Maestro E2E coverage for R2 discovery features already
implemented in STEPs **33**, **34**, and **35**:

1. Catalog discovery
2. Catalog filters / sorting
3. Book detail
4. Metadata search
5. Collections list
6. Collection detail
7. Navigation between these screens
8. Relevant negative / error cases

Reuse Phase 1 Maestro + Nest E2E infrastructure (`open-app`, `wait-for-sign-in`,
`login`, Android Emulator, Expo Go, `lib_app_e2e`).

**Why deferred:** E2E needs deterministic discovery seed data, additional
`testID`s, environment setup, and Maestro flows. Product implementation is
prioritized; testing is a dedicated later phase.

**Do not treat as complete.** Do not invent a duplicate R2 discovery E2E STEP
later — **resume STEP 36** for that work.

**When resumed (dedicated testing phase):**

- Add deterministic E2E discovery seed data
- Add any missing stable `testID`s
- Implement Maestro flows + R2 suite
- Run flows, fix failures, re-verify
- Then mark STEP 36 **Complete**

**Out of scope for STEP 36:** R3 engines, in-book search, offline, subscriptions,
Library entitlements, CI, iOS, Detox, product feature work.

**Execution rule (project-wide from 2026-08-25):** Prefer implementation STEPs
over Maestro/E2E unless the user explicitly requests testing. Lightweight
typecheck/lint/unit checks remain OK for development STEPs.

---

## STEP 37 — Mobile open-book shell + dual-engine routing (R3)

**Goal:** From book detail, open a reading shell that proves paid entitlement,
starts (or resumes) a reading session, and routes to a **placeholder** engine
selected only by backend `layoutType` (`reflowable` | `fixed_layout`).

**Architecture:** `docs/MOBILE-ARCHITECTURE.md`, SRS dual-engine selection.
**APIs (existing only):**

- `GET /reader/catalog/:id` (layoutType + metadata)
- `POST /reader/books/:id/sessions` (+ `GET .../sessions/current` if already open)
- `POST /reader/books/:id/sessions/:sessionId/end` (close shell)
- `POST /reader/books/:bookId/delivery-grant` (best-effort; missing source does not
  invent entitlement)

**In scope:**

- `features/reader` API helpers + hooks + query keys
- Book detail **Read** entry
- Route `/(app)/books/read/[bookId]`
- Open orchestration: entitlement/session errors → kids-friendly deny/retry
- Engine router by `layoutType` only (never `bookType`)
- Separate placeholder UIs for reflowable vs fixed-layout
- Default layout-correct session start position

**Out of scope:** Real EPUB/PDF/canvas renderers, fonts/zoom/RTL, Smart Resume
progress UI, bookmarks, activity ingest, offline decrypt, subscription purchase
UI, in-book search, Maestro/E2E, backend API changes, STEP 36 work.

**Done when:** a paid reader can open Read and see the correct placeholder by
`layoutType` with a live session; unpaid/denied gets a clear message without a
fake engine; typecheck/lint/unit tests pass.

---

## Out of scope for this list

- Reader R3+ features (dual engines, offline, subscriptions UI)
- Part 2 TTS, Part 3 formatting
- Admin delete categories
- Recalculating publisher earnings in the browser

## Implementation order

Implement STEPs in order. STEP 0 and STEP 1 are prerequisites for every admin
screen. STEP 16 is the author-shell prerequisite for later author screens.
STEP 17 depends on STEP 16. STEP 18 depends on STEP 17. STEP 19 depends on
STEP 17. STEP 20 depends on STEP 19. STEP 21 depends on STEP 19. STEP 22 depends on STEP 19. STEP 23 depends on STEP 19. STEP 24 depends on
STEP 18 and STEP 19. STEP 25 depends on STEP 16. STEP 26 depends on STEP 16. STEP 27 depends on
STEP 25. STEP 28 depends on STEP 16. STEP 8 must exist before STEP 9.
STEP 29 replaces Admin Home KPIs and depends on STEP 1. STEP 30 depends
on STEP 16. Implement the summary HTTP in each STEP before the Home UI.
STEPs 0–15 on this list are the completed admin dashboard work except
the Home metric replacement in STEP 29.
STEP 31 (R0) is the mobile reader bootstrap and must complete before any
later reader mobile STEPs. STEP 32 (R1) depends on STEP 31. STEP 33 (R2
browse) depends on STEP 32. STEP 34 (R2 metadata search) depends on STEP 33.
STEP 35 (R2 curated collections) depends on STEP 33.
STEP 36 (R2 discovery Maestro E2E) is a **deferred testing-phase** STEP that
depends on STEPs 33–35. Resume it later; do not invent a duplicate R2 E2E STEP.
Do not block product STEPs on Maestro/E2E unless testing is explicitly requested.
STEP 37 (R3 open-book shell + dual-engine routing) depends on STEP 33 and may
reuse catalog book detail. It must not wait on STEP 36.
