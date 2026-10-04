# Admin Dashboard Backend Implementation Plan

Planning only. No backend, schema, frontend, or design files were changed to produce this document.

**Inspection date:** 2026-10-04.  
**Decisions applied:** 2026-10-04.

**Authority for how new backend work must be built:** `ARCHITECTURE.md`. This plan does not modify that document. One bounded exception is recorded in section 10: admin list endpoints that the finalized design sorts may accept an allowlisted `sortBy` / `sortOrder`. Field names are never interpolated into queries. Reader and author list order stays fixed inside the repository, as section 9.8 requires today.

---

# 1. Executive Summary

The current NestJS admin API already covers the operational admin product described in `docs/ADMIN-DASHBOARD-DISCOVERY.md`: users, invitations (create and pending list), books (status and owner filters, review actions), categories, plans, subscriptions (list, cancel, refund), collections, platform settings, revenue periods, and audit logs. Authorization is JWT plus role `admin` on every `/admin/*` route. There is no second permission model.

Sources for this revision:

| Source | Result |
| --- | --- |
| `docs/ADMIN-DASHBOARD-DISCOVERY.md` | Functional contract the redesign must keep, especially section 21. |
| `docs/ADMIN-DASHBOARD-DESIGN-QA.md` | Present. Future-capability handoff in section 14, plus data-semantics QA. |
| `docs/ADMIN-DASHBOARD-BACKEND-REQUIREMENTS.md` | Present. Endpoint, schema, and service proposal for the finalized design. |
| `src/AdminC.tsx` | Still outside the repository. Absence is an open verification item in section 13. It does not block implementation. |
| Product decisions in this revision | Approved. Applied below unless the codebase contradicts them. |

The approved decisions do not contradict the codebase. One implementation constraint does change the shape of the Stripe decision: `SubscriptionResponse` is shared, and its unit test asserts `stripeCustomerId` is absent. Stripe customer and subscription ids therefore belong on the admin-only support-context payload, not on the shared list or member DTOs.

**Backend status: ready to implement.** Section 13 records that readiness, the open verification items, and the work that stays out of scope. No product decision remains in the way of the nine implementation steps in section 14.

What is already true, and must stay true:

- Entitlement is server-side. `readingAccessState` is `paid`, then `trial`, then `free`. A canceled paid subscription stays `paid` until `currentPeriodEnd`. The admin API must keep returning that state. It must not grow a second access rule.
- Publisher **accounts** are `User.isPublisher` plus `Book.ownerId`. EPUB author and EPUB publisher are `BookSourceMetadata.creator` and `BookSourceMetadata.publisher`, exposed today as `authorName` and `publisherName` on `BookResponse`. They are not accounts. This plan does not add an Author model or a Publisher model.
- Home reading minutes are `(BookEngagement.activeReadingMs + BookEngagement.activeSpreadMs) / 60000` across all periods. Visual scene time and idle time are excluded. A drill-down that summed raw `ReadingSession` rows would disagree with the card whenever engagement has not been refreshed.
- Catalog-visible books are approved, processing `ready`, and `publishedAt` set. `GET /admin/books?publishingStatus=approved` is a wider set. The published-books drill-down needs the catalog-visible predicate.
- There is no CSV export, no invitation resend or revoke, no admin global search, no durable background queue, and no PostgreSQL full-text or trigram index.

---

# 2. Current Backend Architecture

Runtime is NestJS, Prisma, and PostgreSQL. Admin routes are mounted at the root (`/admin/...`). There is no global path prefix and no API version segment.

## 2.1 Request path

`AdminApiModule` (`backend/src/modules/admin-api.module.ts`) is the only place admin controllers are registered. Domain modules do not declare those controllers.

Each admin controller uses `JwtAuthGuard`, `RolesGuard`, and `@Roles(UserRole.ADMIN)`. The role enum is `reader`, `author`, `admin`. Publisher capability is `User.isPublisher`, not a role. Author accounts are always publishers. Admin is independent of that flag.

Controllers return DTO instances. There is no response envelope interceptor. List responses use a named array plus a real `total` from the same `where` as the page (`limit` / `offset`, defaults 20 and 0, applied in the service). Sort is fixed in the repository today.

Writes that matter record `AuditLog`. Invitation create does not. Payment failure records an audit row and does not change `Subscription.status`.

## 2.2 Modules that admin already uses

| Area | Module | Admin controller |
| --- | --- | --- |
| Users | `user` | `UserAdminController` |
| User detail orchestration | `user-admin-detail` | used by `UserAdminController.getUser` |
| Invitations | `user` | `AdminInvitationAdminController` |
| Books | `book` | `BookAdminController` |
| Categories | `category` | `CategoryAdminController` |
| Plans and subscriptions | `subscription` | `PlanAdminController`, `SubscriptionAdminController` |
| Collections | `collection` | `CollectionAdminController` |
| Settings | `platform-setting` | `PlatformSettingAdminController` |
| Home KPIs and revenue | `monetization` | `DashboardAdminController`, `MonetizationAdminController` |
| Audit | `audit` | `AuditAdminController` |

Reader search (`GET /reader/search`) lives in the search module. It is catalog-visible only, any authenticated role, and is not an admin catalog API.

## 2.3 Data model facts that constrain the design

There is no `Publisher` model and no `Author` model.

`BookSourceMetadata` stores EPUB `creator` and `publisher` strings. The book mapper copies them to `authorName` and `publisherName`. There is no foreign key from those strings to `User`.

`Subscription` is one row per user. Status is only `active` or `canceled`. Trial is `trialStartedAt` / `trialEndsAt`. Stripe ids exist on the entity and are omitted from `SubscriptionResponse` on purpose (`subscription.response.spec.ts` asserts `stripeCustomerId` is absent).

`AdminInvitation.status` is `pending` or `accepted`. Expiry is seven days (`ADMIN_INVITATION_WINDOW`). The raw token is returned once from create and stored only as a SHA-256 hash. Accept loads by hash where `deletedAt` is null, then rejects accepted and expired invitations.

Reading data used by admin user detail:

- `ReadingProgress` for position, capped at 100 rows (`ADMIN_USER_READING_PROGRESS_LIMIT`), ordered by `lastSessionAt` desc.
- Sum of `ReadingSession.activeDurationMs` per book for that user.
- Progress percent is calculated in `buildAdminUserReadingProgressItems`.

`ReadingChapterEngagement` and `ReadingVisualEngagement` are written by the reader and read for revenue heatmaps. Heatmap sums are by book and period, not by user. User detail does not return chapter or spread engagement.

## 2.4 Jobs, storage, and search infrastructure

`MemoryJobManagerService.enqueue` runs the handler inline and returns after it finishes. The only job name is book source processing. There is no cron, Bull, or Redis.

`StorageManagerService` already has memory and S3 implementations. Export files can use it.

Book text search is Prisma `contains` with `mode: 'insensitive'` (PostgreSQL `ILIKE`). Schema indexes on `Book` are `publishingStatus`, `processingStatus`, `publishedAt`, and `ownerId`. There is no index on `title`, `description`, `BookSourceMetadata.creator`, or `BookSourceMetadata.publisher`.

## 2.5 Existing inconsistency to avoid copying

`AdminDashboardSummaryService` loads KPI totals by calling list services with `limit: 1` and reading `total`. That works and stays for the six current cards. New cross-domain reports (publisher directory aggregates, global search, export queries) should follow `ARCHITECTURE.md` section 11.8: a read-only read-model repository in the module that owns the report, returning projections rather than other domains' entities. Catalog filter changes stay inside the book repository, because they are filters on `Book`.

---

# 3. Existing Admin APIs

All routes below require `Authorization: Bearer` and role `admin`, except invitation accept, which is public.

Pagination on lists is `limit` and `offset`. Responses include `total` and do not echo `page`. Sort is fixed unless noted.

## 3.1 Home

### `GET /admin/dashboard/summary`

| | |
| --- | --- |
| Controller | `DashboardAdminController.getSummary` |
| Service | `AdminDashboardSummaryService` |
| Query | none |
| Response | `totalUsers`, `totalPublishers`, `totalBooks`, `publishedBooks`, `pendingReviewBooks`, `totalReadingMinutes` |
| Queries | non-deleted user count; same with `isPublisher: true`; non-deleted book count; catalog-visible book count (approved + ready + `publishedAt` not null); `publishingStatus = in_review` count; sum of all non-deleted `BookEngagement.activeReadingMs` and `activeSpreadMs`, converted to minutes |
| Pagination / filter / sort | none |

## 3.2 Users

### `GET /admin/users`

| | |
| --- | --- |
| Controller | `UserAdminController.listUsers` |
| Service | `UserService.listManagedUsers` → `UserPrismaRepository.listManaged` |
| Query | `limit`, `offset`, `role`, `excludeRole` (ignored when `role` is set), `isPublisher`, `email` (exact, lowercased) |
| Response | `{ users, total }`. Each user: `id`, `createdAt`, `updatedAt`, `email`, `displayName`, `role`, `isPublisher`, `lastSessionAt`, `currentPlan: { name, kind } \| null` |
| Query behavior | `deletedAt: null`, plus the optional filters. Includes subscription.plan and the latest non-deleted refresh token |
| Sort | `createdAt desc`, `id desc` |
| Permission | admin |

`lastSessionAt` is the latest refresh-token `createdAt`, not a reading session.

### `GET /admin/users/:id`

| | |
| --- | --- |
| Service | `UserAdminDetailService.getAdminUserDetail` |
| Response | `user` (same account fields), `subscription` (`SubscriptionResponse` including `readingAccessState`, `trialEligible`, trial dates, period dates, nested plan without `stripePriceId`, nested user), `subscriptionPeriod` (`periodStartedAt`, `periodEndsAt`, `remainingMs`, `elapsedPercent`), `readingProgress[]` |
| Reading item | book (`BookResponse`, so `authorName` / `publisherName` / cover when loaded), `layoutType`, `contentProgressPercent`, `locationLabel`, position fields, `activeDurationMs`, `lastSessionAt` |
| Query behavior | progress `take` 100; active time is `groupBy` book on `ReadingSession.activeDurationMs` |
| Not returned | Stripe ids, payment-failure flag, chapter engagement, visual-scene engagement, bookmarks, idle time, offline downloads, a progress `total` |

### `PATCH /admin/users/:id`

Body: `role`, `isPublisher`. Cannot edit self. Cannot grant admin (invitation only). Cannot demote or delete the last admin. Audited.

### `DELETE /admin/users/:id`

Soft-delete (`deletedAt`). Same last-admin and self rules. Audited as `user_deleted`.

## 3.3 Invitations

### `GET /admin/invitations`

| | |
| --- | --- |
| Service | `AdminInvitationService.listPendingInvitations` |
| Query | `limit`, `offset` |
| Filter | `status = pending`, `expiresAt > now`, `deletedAt: null` |
| Sort | `createdAt desc`, `id desc` |
| Response item | `id`, timestamps, `email`, `status`, `expiresAt`, `invitedByUserId`, `acceptedAt`, optional `invitedBy` |

Accepted, expired, and soft-deleted rows are absent. There is no email filter.

### `POST /admin/invitations`

Body: `email`. Rejects an existing admin and an unexpired pending invite for that email. Creates a 32-byte token, stores the hash, emails `{publicOrigin}/accept-admin-invitation?token=...`. Response includes the raw `token` once. Mail failure soft-deletes the row. No audit row.

### `POST /auth/accept-admin-invitation` (public)

Body: `token`, `password`. Hash lookup, reject accepted or expired, mark accepted, grant admin. A revoked row must fail this path. Soft-deleted rows already fail the hash lookup.

There is no resend and no revoke.

## 3.4 Books

### `GET /admin/books`

| | |
| --- | --- |
| Service | `BookService.listBooks` → `BookPrismaRepository.list` |
| Query | `limit`, `offset`, `publishingStatus`, `ownerId` |
| Repository also supports | `processingStatus`, unused by the admin DTO |
| Where | `deletedAt: null` plus those equalities. Includes categories and source metadata |
| Sort | `createdAt desc` only |
| Response | `{ books, total }`. `BookResponse`: `id`, timestamps, `title`, `description`, `layoutType`, `bookType`, `publishingStatus`, `processingStatus`, `publishedAt`, `ownerId`, optional `owner`, `categories`, `authorName`, `publisherName`, optional `cover` |

Absent filters: keyword, category, EPUB creator, EPUB publisher, book type, layout type, catalog visibility, client sort.

### `GET /admin/books/:id`

One non-deleted book, same `BookResponse` shape.

### `PATCH /admin/books/:id`

Body: `title`, `description`, `bookType`, `categoryIds`. Does not change publishing status, layout, or files.

### `POST /admin/books/:id/approve`

Requires processing `ready`. Sets `publishingStatus = approved` and `publishedAt`. Audit `book_approved`.

### `POST /admin/books/:id/reject`

Body: `reason` required. Audit `book_rejected`.

### `POST /admin/books/:id/unpublish`

Sets `publishedAt` null. Does not change `publishingStatus`. Audit `book_unpublished`.

### `POST /admin/books/:id/republish`

Requires approved, `publishedAt` null, processing `ready`. Sets `publishedAt`. Audit `book_republished`.

### `DELETE /admin/books/:id`

Soft-delete. Audit `book_deleted`.

### `GET /admin/books/:id/rejection-history`

Audit rows with `action = book_rejected`, `subjectType = book`, `subjectId`. `limit`, `offset`, `total`. Sort `createdAt desc`.

## 3.5 Categories

| Method | Route | Query / body | Sort | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/admin/categories` | `name`, optional `slug`, optional `categoryWeight` | — | `CategoryResponse` |
| `GET` | `/admin/categories` | `limit`, `offset` | `name asc` | `{ categories, total }` |
| `GET` | `/admin/categories/:id` | — | — | `CategoryResponse` |
| `PATCH` | `/admin/categories/:id` | `name`, `slug`, `categoryWeight` | — | `CategoryResponse` |

Fields: `id`, timestamps, `name`, `slug`, `categoryWeight`. No delete. No book count. No text filter.

## 3.6 Plans

| Method | Route | Notes |
| --- | --- | --- |
| `POST` | `/admin/plans` | `name`, `description`, `kind`, optional `slug`, `stripePriceId` required for `monthly_paid`. Paid plans resolve amount and currency from Stripe |
| `GET` | `/admin/plans` | `limit`, `offset`, optional `kind`. Sort `slug asc`. Response includes `stripePriceId` |
| `GET` | `/admin/plans/:id` | same plan shape |
| `PATCH` | `/admin/plans/:id` | `name`, `description`, optional `stripePriceId`. Free plans cannot gain a Stripe price |

Plan fields: `slug`, `name`, `description`, `kind`, `interval`, `stripePriceId`, `amountCents`, `currency`.

## 3.7 Subscriptions

### `GET /admin/subscriptions`

Query: `limit`, `offset`, `userId`, `status` (`active` \| `canceled`). Sort `createdAt desc`, `id desc`. `{ subscriptions, total }` of `SubscriptionResponse`.

`SubscriptionResponse` fields: `userId`, `planId`, `status`, `startedAt`, `currentPeriodStart`, `currentPeriodEnd`, `canceledAt`, `activatedAt`, `trialStartedAt`, `trialEndsAt`, `readingAccessState`, `trialEligible`, nested `plan` (no Stripe price id), nested `user`.

Stripe customer id and Stripe subscription id are stored and not serialized.

### `GET /admin/subscriptions/:id`

Same object.

### `POST /admin/subscriptions/:id/cancel`

If a Stripe subscription id exists, cancels in Stripe. Local status `canceled`, `canceledAt` set. `currentPeriodEnd` is left as-is, so access continues until that instant. Audit `subscription_canceled`.

### `POST /admin/subscriptions/:id/refund`

Allowed for an active monthly paid Stripe subscription inside 7 days of `activatedAt` (else `currentPeriodStart`). Refunds the latest paid invoice, cancels, sets `currentPeriodEnd` to now. Audit metadata includes `refunded: true`. The Stripe refund id is not stored.

Webhook `invoice.payment_failed` writes audit `subscription_payment_failed` with invoice and Stripe ids in metadata. It does not change status or access.

## 3.8 Collections

| Method | Route | Notes |
| --- | --- | --- |
| `POST` | `/admin/collections` | `title`, optional `description`, optional `bookIds` |
| `GET` | `/admin/collections` | `limit`, `offset`. Sort `createdAt desc`, `id desc`. No text filter |
| `GET` | `/admin/collections/:id` | title, description, cover, ordered items |
| `PATCH` | `/admin/collections/:id` | `title`, `description` |
| `POST` | `/admin/collections/:id/cover` | jpeg, png, webp |
| `DELETE` | `/admin/collections/:id/cover` | clears cover |
| `DELETE` | `/admin/collections/:id` | soft-delete |
| `POST` | `/admin/collections/:id/books` | `bookId`. Any non-deleted book, including unpublished |
| `DELETE` | `/admin/collections/:id/books/:bookId` | |
| `POST` | `/admin/collections/:id/reorder` | `bookIds` |

## 3.9 Settings

`GET /admin/platform-settings` and `PATCH /admin/platform-settings`.

Fields: `privacyPolicyUrl`, `termsOfServiceUrl`, `aboutMission`, `authCoverMediaUrl`. Omitted patch fields stay unchanged. Empty string clears.

## 3.10 Revenue

| Method | Route | Query / body | Sort |
| --- | --- | --- | --- |
| `GET` | `/admin/revenue-periods` | `limit`, `offset` | `startsAt desc` |
| `POST` | `/admin/revenue-periods/current` | opens current UTC month if missing | |
| `POST` | `/admin/revenue-periods` | `startsAt`, `endsAt`, `platformCutPercent`, `poolAmountCents` | |
| `GET` | `/admin/revenue-periods/:id` | | |
| `PATCH` | `/admin/revenue-periods/:id` | pool; platform cut only while open | |
| `POST` | `/admin/revenue-periods/:id/close` | | |
| `POST` | `/admin/revenue-periods/:id/engagements` | refresh engagement, no revenue-calculated audit | |
| `POST` | `/admin/revenue-periods/:id/calculate` | requires a pool; writes `BookRevenue`; audit `revenue_calculated` | |
| `GET` | `/admin/revenue-periods/:id/earnings` | `limit`, `offset`, `ownerId` | `authorCents desc` |
| `GET` | `/admin/revenue-periods/:id/analytics` | `limit`, `offset`, `ownerId` | `weightedEngagement desc` |
| `GET` | `/admin/revenue-periods/:id/books/:bookId/heatmap` | none | layout-specific cells |

Earnings row: `weightedEngagement`, `poolShareCents`, `platformCutCents`, `authorCents`, `ownerId`, `bookId`. Analytics row: `activeReadingMs`, `activeSpreadMs`, `visualSceneTimeMs`, `categoryWeight`, `weightedEngagement`, `layoutType`. Heatmap: chapters for reflowable, spreads and pages for fixed layout. Visual scene time is stored and is not paid engagement.

## 3.11 Audit

`GET /admin/audit-logs` query: `limit`, `offset`, `actorUserId`, `action`, `subjectType`, `subjectId`. Sort `createdAt desc`. `{ auditLogs, total }`.

`GET /admin/audit-logs/:id` returns `actorUserId`, `action`, `subjectType`, `subjectId`, `reason`, `metadata`, optional `actor`.

No writes. Invitation actions are not in `AuditAction` today.

## 3.12 Reader search (not an admin API)

`GET /reader/search` query: `title`, `author`, `publisher`, `limit`, `offset`. AND across provided fields. Restricted to catalog-visible books. Sort is newest (`publishedAt desc`). Any authenticated role, including admin. In-book `GET /reader/search/:id?q=` requires full-book entitlement and is not an admin catalog tool.

---

# 4. Design → Backend Gap Analysis

Legend:

| Class | Meaning |
| --- | --- |
| A | Existing API is sufficient |
| B | Keep the endpoint; extend the response |
| C | Keep the endpoint; extend query or filter |
| D | New API |
| E | Data exists; indexes or query shape must change |
| F | New field, model, or relationship |
| G | Product decision before implementation |

| Admin area | Required data | Existing API | Sufficient? | Required change |
| --- | --- | --- | --- | --- |
| Shell auth | Admin role gate, sign-out is client-side | JWT + `RolesGuard` on every admin route | A | None |
| Home KPIs | Six server totals, no client math | `GET /admin/dashboard/summary` | A | None for the numbers |
| Home → users | All non-deleted users, including admins | `GET /admin/users` with no `excludeRole` | A | Drill-down must not use the members `excludeRole=admin` query, or the count will not match |
| Home → publishers | Publisher accounts | `GET /admin/users?isPublisher=true` | A for a user table. D if the screen is a directory with book counts | See section 12.2 |
| Home → all books | All non-deleted books | `GET /admin/books` | A | None |
| Home → published books | Catalog-visible count | Summary uses catalog visibility. List filter `publishingStatus=approved` does not | C | Add `catalogVisible=true` on `GET /admin/books`, implemented with the existing catalog-visibility predicate |
| Home → in review | `publishingStatus=in_review` | `GET /admin/books?publishingStatus=in_review` | A | None |
| Home → reading minutes | Same minutes as the card, then the books that produced them | Summary only. Period analytics are per period | D | `GET /admin/dashboard/reading` grouped from `BookEngagement`, not from raw sessions |
| Members list | Email, role, publisher flag, plan name, paid vs free plan kind, created time, exact email, paging | `GET /admin/users` | A | `currentPlan.kind` is the paid-vs-free plan fact. It is not `readingAccessState` |
| Members list access state | Keep access state off the members table | Plan kind is already on the row. `readingAccessState` is on user detail and subscription detail | A | Do not add `readingAccessState` to `GET /admin/users`. Do not duplicate the entitlement helper in a list filter |
| Admins list | Email, publisher flag, last session, created time | `GET /admin/users?role=admin` | A | None |
| User detail account | Email, id, names, role, publisher, timestamps | `GET /admin/users/:id` | A | `displayName` is already returned |
| User detail subscription | Plan, status, access state, trial, period, remaining time | Same detail payload | A for discovery section 21 | Stripe ids and payment failure are separate rows below |
| User detail reading | Every book, paged. Reflowable position stays spine/scroll/content percent. Fixed layout stays spread/page | Same payload, hard `take` 100 and no `total` | C + D | `GET /admin/users/:userId/reading-progress` with `limit`, `offset`, and `total`. Detail includes `readingProgressTotal` so the extra books are reachable. Do not change `ReadingProgress` |
| User detail chapter engagement | Per-chapter or per-spread time for that user | Not on the detail payload. Heatmap is all readers in one revenue period | D | `GET /admin/users/:userId/books/:bookId/engagement` |
| User detail owned books | Unpublished included, status filter | `GET /admin/books?ownerId=` | A for status + owner. C once catalog filters exist | Reuse the extended book list |
| User update / delete | Role and publisher rules, soft-delete, no self-admin grant | `PATCH` and `DELETE /admin/users/:id` | A | None |
| Invitations list and create | Pending unexpired queue, plus a lifecycle view | `GET` and `POST /admin/invitations` return only pending unexpired | C + F | Default list stays pending and unexpired. Add `status` for pending, expired, accepted, and revoked, plus send/revoke metadata |
| Invitation resend / revoke | Resend only pending, unexpired, not revoked. Revoke blocks accept. Both audited. Short cooldown | Not implemented | D + F | Section 6.4 and section 12.5 |
| Catalog table | Cover, title, both statuses, layout, book type, owner, categories, published time, author and publisher names | `GET /admin/books` and `BookResponse` | A for columns | Names are already on the row when source metadata exists |
| Catalog compound filters | Keyword on title, EPUB creator, EPUB publisher, and description. Not `contentText`. Repeated category, status, type, and layout values. Allowlisted sort. Total | Only `publishingStatus` and `ownerId` | C + E | Extend `GET /admin/books`. Filters AND across facets. Repeated values OR inside one facet. See section 5.1 |
| Book detail actions | Edit metadata, approve, reject, unpublish, republish, delete, rejection history | Existing book routes | A | Layout stays a processing result. Admin still does not upload the source file |
| Publisher directory | Accounts, book counts, lifetime author cents on detail, books, revenue rows | Users filter + `ownerId` on books and earnings | D | List without the money sum. Summary carries `lifetimeAuthorCents`. No Publisher table. See section 6.1 |
| EPUB author / publisher strings | Display and filter, distinct from the account | On `BookResponse` only | C | String filters on the book list. No id filters |
| Categories | Create, rename, weight, paging | Category admin routes | A | Weight still does not rewrite past payouts until recalculation. No delete unless product adds it |
| Plans | List, create paid plan, edit name, description, Stripe price id, show kind, amount, currency, interval | Plan admin routes | A | Free plan stays out of the paid-plan create path |
| Subscriptions list | Status and user filters, period end, plan, user | `GET /admin/subscriptions` | A for discovery fields. C if the design filters by access state or plan | Add `readingAccessState` or `planId` only if section 13 asks for those filters |
| Subscription support detail | Access explanation, refund eligibility, copyable Stripe customer and subscription ids | Canonical `GET /admin/subscriptions/:id` has the dates and `readingAccessState`. Shared `SubscriptionResponse` omits Stripe ids, including on the list | D | `GET /admin/subscriptions/:id/support-context`. Stripe ids stay off list and member payloads |
| Collections | CRUD, cover, membership, reorder | Collection admin routes | A | No collection search unless a later design adds it |
| Settings | Four reader-app fields | Platform settings routes | A | None |
| Revenue | Periods, pool, cut, close, engagement refresh, calculate, earnings, analytics, heatmap, owner filter | Revenue routes | A | Shares stay server-side |
| Audit | Filterable log and detail | Audit routes | A | New invitation and export actions must be added to the action enum so this log can show them |
| CSV export | Filtered, sorted, or selected rows | None | D + F | Section 12.4 |
| Global admin search | Users, books, publishers, categories, subscriptions | None on `/admin`. Reader search is catalog-only | D + E | Section 12.7 |

---

# 5. Existing APIs to Modify

Follow current DTO style: optional query fields, validation in the request DTO, defaults in the service, `where` built in the repository, `total` from the same `where`.

## 5.1 `GET /admin/books`

Class C, plus E for indexes.

Purpose: one server-side catalog query. Facets combine with AND. Repeated values inside one facet combine with OR. Omitted parameters are unset. Reset in the UI is a request without those parameters.

`q` is catalog metadata only: case-insensitive contains on `Book.title`, `Book.description`, `BookSourceMetadata.creator`, or `BookSourceMetadata.publisher`. It does not search `BookChapter.contentText` or `BookPageTextLayer.contentText`.

Query (all optional; repeated keys are arrays):

| Param | Type | Behavior |
| --- | --- | --- |
| `q` | string, trimmed, min length 2 when present | OR across title, description, creator, and EPUB publisher |
| `categoryId` | repeated int | book has any of these non-deleted categories |
| `authorName` | string | `sourceMetadata.creator` contains. EPUB creator. There is no `authorId` |
| `publisherName` | string | `sourceMetadata.publisher` contains. EPUB publisher string. This is not `ownerId` |
| `ownerId` | repeated int | publisher **account** ids |
| `bookType` | repeated enum | `standard_chapter`, `picture_book`, `illustrated_chapter` |
| `layoutType` | repeated enum | `reflowable`, `fixed_layout`. A null layout matches neither |
| `publishingStatus` | repeated enum | existing publishing statuses |
| `processingStatus` | repeated enum | wire the filter the repository already supports for a single value |
| `catalogVisible` | boolean | `true` applies approved + ready + `publishedAt` not null, AND the other filters. `false` is the negation of that predicate among non-deleted books |
| `limit` | int | default 20, maximum 100 |
| `offset` | int | default 0 |
| `sortBy` | allowlist | `createdAt`, `publishedAt`, `title`, `updatedAt`. Default `createdAt`. Unknown values are 400 |
| `sortOrder` | `asc` or `desc` | default `desc`. Tie-break `id desc` |

A single value remains valid, so the current `publishingStatus` and `ownerId` callers keep working.

Response:

```json
{
  "books": [],
  "total": 0,
  "appliedFilters": {}
}
```

`appliedFilters` echoes only the filters that were present and valid, so the client can restore the URL. `books` stays `BookResponse[]`.

Errors: 400 for an unknown enum, unknown `sortBy`, or `q` shorter than 2. 401 and 403 as today.

`GET /reader/search` stays catalog-only and does not search admin-only books or description under this change.

## 5.2 `GET /admin/users`

Class C for account lookup. Exact `email` stays exact.

Add optional `q` (min length 2): case-insensitive contains on `email` OR `displayName`.

Add allowlisted `sortBy`: `createdAt` (default), `email`, `displayName`. `sortOrder`: `asc` or `desc`, default `desc` for `createdAt` and `asc` for the name fields. Tie-break `id desc`.

Do not add `readingAccessState`, period dates, Stripe ids, or book counts to this payload. Access stays on user detail and on subscription support context. Book counts and lifetime cents stay on the publisher endpoints.

## 5.3 Reading progress pagination

Class D for the full list. The current detail call uses `ADMIN_USER_READING_PROGRESS_LIMIT` of 100 and returns no total.

`GET /admin/users/:userId/reading-progress`

| Query | Behavior |
| --- | --- |
| `limit` | default 20, maximum 100 |
| `offset` | default 0 |

Response: `{ readingProgress, total }`. Each item keeps the current assembly: book, `layoutType`, `contentProgressPercent`, `locationLabel`, `spineIndex`, `scrollOffset`, `spreadIndex`, `pageNumber`, `activeDurationMs`, `lastSessionAt`. Reflowable percent and location stay content- and spine-based. Fixed layout stays page- or spread-based. `ReadingProgress` columns do not change.

`GET /admin/users/:id` adds `readingProgressTotal` and returns the first page (20) in `readingProgress`, so a user with more than 100 books is not truncated without a way to continue. The existing frontend can keep reading `readingProgress` and use `total` to request the next page.

## 5.4 Subscription list and canonical detail

`GET /admin/subscriptions` and `GET /admin/subscriptions/:id` keep `SubscriptionResponse`.

Do not add `readingAccessState` filtering. Do not add Stripe ids to this DTO. The list and the shared response stay free of customer and subscription ids. Support context is section 6.3.

## 5.5 `GET /admin/invitations`

Class C + F.

When `status` is omitted, the list stays pending and unexpired, so the current screen does not change.

| `status` | Rows |
| --- | --- |
| omitted | `pending` and `expiresAt > now` |
| `pending` | same as omitted |
| `expired` | `pending` and `expiresAt <= now` |
| `accepted` | `accepted` |
| `revoked` | `revoked` |

Also optional exact `email`. Pagination unchanged. Sort stays `createdAt desc`, `id desc` (the design does not add a sort control on this table).

Each item adds `lastSentAt`, `resendCount`, `revokedAt`, `revokedByUserId`, and optional `revokeReason`. No token and no token hash.

## 5.6 Lists that keep a fixed sort

Categories, collections, plans, revenue, audit, and settings do not gain client sort. The finalized design names a sort control on the catalog. Publisher directory sort is on `GET /admin/publishers`. Other admin lists keep the repository `orderBy` from section 3.

Audit's `action` filter already takes the enum. New invitation and export actions become valid filter values when the enum grows. Confirm the request DTO accepts every `AuditAction`, including `book_content_key_issued`, and widen it if a value is missing. That is a validation alignment, not a new log.

---

# 6. New APIs Required

Register each new controller only in `AdminApiModule`. Guard: `JwtAuthGuard`, `RolesGuard`, `@Roles(UserRole.ADMIN)`.

Shared error behavior: 400 validation, 401 unauthenticated, 403 non-admin, 404 missing id, 409 when the row is in a state that rejects the command.

## 6.1 `GET /admin/publishers`

Purpose: publisher **accounts**. A user with `isPublisher: true` and `deletedAt: null`, including admin publishers, matching the home KPI.

Query:

| Param | Behavior |
| --- | --- |
| `q` | optional, min 2. Contains on `email` or `displayName` |
| `limit`, `offset` | default 20 / 0 |
| `sortBy` | `createdAt` (default) or `email` or `bookCount` |
| `sortOrder` | `asc` or `desc`, default `desc` for dates and book count, `asc` for email |

Response:

```json
{
  "publishers": [
    {
      "id": 1,
      "email": "publisher@example.com",
      "displayName": "Name",
      "role": "author",
      "isPublisher": true,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "bookCount": 4,
      "catalogVisibleBookCount": 2
    }
  ],
  "total": 1
}
```

`bookCount` is non-deleted books with that `ownerId`. `catalogVisibleBookCount` uses the catalog-visibility predicate. Rows are publisher accounts, including admins with `isPublisher: true`, matching the home KPI. The row has no EPUB creator string and no EPUB publisher string.

Lifetime author cents are not on this list. Summing `BookRevenue` for every directory row is a heavier query than the page needs. That total is on the summary endpoint.

### `GET /admin/publishers/:userId/summary`

404 when the user is missing, deleted, or `isPublisher` is false.

Response:

- account: `id`, `email`, `displayName`, `role`, `isPublisher`, `createdAt`
- book counts: `total`, `catalogVisible`, and one count per `publishingStatus`
- `unpublishedApprovedCount`: approved, processing ready is not required, `publishedAt` null
- `lifetimeAuthorCents`: sum of non-deleted `BookRevenue.authorCents` for this `ownerId`. This is recorded payout history. It does not allocate a new pool
- `recentBooks`: up to 5 books from the catalog query with this `ownerId`, each with `id`, `title`, `publishingStatus`, `authorName`, `publisherName` so the screen can label metadata separately from the account
- `revenuePeriodLinks`: ids of revenue periods that have a `BookRevenue` row for this owner, newest first, capped at 12. Full earnings stay on `GET /admin/revenue-periods/:id/earnings?ownerId=`

Optional query `revenuePeriodId` limits `lifetimeAuthorCents` to that period when the detail is opened from one period. When omitted, the sum is all periods.

## 6.2 `GET /admin/users/:userId/books/:bookId/engagement`

Purpose: chapter or spread engagement for one reader and one book. This is support context, not a revenue calculation.

Auth: admin. 404 if the user or the book is missing or deleted. 404 if that user has no progress and no engagement for the book is a product choice; prefer 200 with empty cells so a book they opened with zero recorded chapter time still renders.

Response branches on the book's `layoutType`, same split as the revenue heatmap:

Reflowable:

```json
{
  "userId": 1,
  "bookId": 2,
  "layoutType": "reflowable",
  "activeDurationMs": 120000,
  "chapters": [
    { "spineIndex": 0, "title": "Chapter 1", "activeDurationMs": 120000 }
  ]
}
```

Fixed layout:

```json
{
  "userId": 1,
  "bookId": 2,
  "layoutType": "fixed_layout",
  "activeDurationMs": 40000,
  "spreads": [
    { "spreadIndex": 0, "pageNumber": 1, "activeDurationMs": 40000, "visualSceneTimeMs": 10000 }
  ]
}
```

`activeDurationMs` at the top is the same session sum already shown on the progress row. Chapter and spread arrays sum `ReadingChapterEngagement` or `ReadingVisualEngagement` for that `userId` and `bookId` across all time. They are not filtered by revenue period. Visual scene time is labeled unpaid by the existing product rule; the API returns the stored milliseconds and does not add them into paid minutes.

No query filters in the first version. A period window would be a new product rule about what "engagement" means on a user. Leave it off until asked.

## 6.3 `GET /admin/dashboard/reading`

Purpose: drill-down for `totalReadingMinutes`. Same source as the KPI.

Query: `limit`, `offset`, optional `ownerId`. Sort: summed paid milliseconds desc, then `bookId` asc.

Response:

```json
{
  "totalReadingMinutes": 0,
  "bookEngagements": [
    {
      "bookId": 1,
      "title": "Title",
      "ownerId": 2,
      "activeReadingMs": 0,
      "activeSpreadMs": 0,
      "readingMinutes": 0
    }
  ],
  "total": 0
}
```

`totalReadingMinutes` is the platform total (or the owner total when `ownerId` is set), computed like the home card: sum of `activeReadingMs + activeSpreadMs` on non-deleted `BookEngagement` joined to non-deleted books, divided by 60000. `readingMinutes` on each row uses that same conversion. Visual scene time is not included. The list total is the number of books that have at least one engagement row, not the minute count.

If no period has been aggregated, this list is empty and the home card is 0 even when `ReadingSession` rows exist. The API description must say that. Do not silently fall back to sessions.

## 6.4 Invitation commands

### `POST /admin/invitations/:id/resend`

Allowed only when status is `pending`, `expiresAt` is still in the future, and status is not `revoked`.

Cooldown: if `lastSentAt` is set and `now - lastSentAt` is under 60 seconds, respond 429 with `Retry-After`. This is one timestamp check on the invitation row. It does not add a new rate-limit store or a platform throttler policy.

On success: new token, replace `tokenHash`, set `expiresAt` to now plus the existing seven-day window, set `lastSentAt` to now, increment `resendCount`, send the existing mail. Response is the sanitized invitation (status, expiry, `lastSentAt`, `resendCount`). The raw token is not returned. Delivery is the email. Create still returns the token once.

If mail fails, restore the previous hash, expiry, `lastSentAt`, and `resendCount`. The previous link keeps working.

Audit `invitation_resent`. Metadata: email, actor. Never the raw token.

409 when accepted, revoked, or expired. 404 when the id does not exist.

Create also writes `invitation_created` and sets `lastSentAt` on the first send.

### `POST /admin/invitations/:id/revoke`

Body: optional `reason` (stored as `revokeReason` and as the audit `reason`).

Allowed for `pending` rows, including expired pending rows. Set `status` to `revoked`, `revokedAt` to now, `revokedByUserId` to the actor.

Accept must reject `revoked` even when the hash matches and `expiresAt` is still in the future. Add that check beside the existing accepted and expired checks in `assertInvitationAcceptable`.

Response: sanitized invitation. No token.

Audit `invitation_revoked`.

409 when already accepted or already revoked.

A later `POST /admin/invitations` for that email stays allowed, because create only blocks an unexpired pending row. Expired rows are not resent; the operator creates a new invitation, which matches the design QA.

## 6.5 Export

### `POST /admin/exports`

Body:

```json
{
  "resource": "users",
  "filters": {},
  "sortBy": "createdAt",
  "sortOrder": "desc",
  "selectedIds": [1, 2]
}
```

`resource` allowlist: `users`, `books`, `publishers`, `subscriptions`, `invitations`, `audit_logs`. There is no free-form query string. `filters` may contain only the query fields of that resource's list endpoint. Unknown keys are 400.

Optional `columns` is an allowlist per resource. Omitted `columns` exports the default column set for that resource. A column outside the allowlist is 400. Defaults exclude password hashes, token hashes, content keys, and Stripe ids. Subscription export may include Stripe customer and subscription ids because that file is an admin support extract, not a members list response. Document those two columns as opt-in, off by default.

When `selectedIds` is non-empty, export those ids and ignore other filters. Deleted rows are dropped. The cap still applies.

The row stores the snapshot: resource, filters, columns, sort, selected ids, actor, and the time of the request. Later default changes do not rewrite a queued file.

Every export is asynchronous. `POST` does not stream a CSV.

### `POST /admin/exports/estimate`

Same body as create, without persisting a job. Response: `{ resource, rowCount, allowedColumns, exceedsLimit }`. `exceedsLimit` is true when `rowCount` is greater than 10,000. Estimate does not start a job.

Create with a matching scope over 10,000 rows returns 422 `EXPORT_LIMIT_EXCEEDED` and writes no file.

Response `202`:

```json
{
  "id": 10,
  "status": "pending",
  "resource": "books",
  "createdAt": "2026-10-04T00:00:00.000Z",
  "expiresAt": null
}
```

The handler inserts the row and schedules deferred work. It does not build the CSV before responding.

### `GET /admin/exports/:id`

Returns `id`, `status` (`pending` \| `ready` \| `failed` \| `expired`), `resource`, `rowCount`, `errorCode`, `createdAt`, `expiresAt`, `actorUserId`.

### `GET /admin/exports/:id/download`

`ready` and not expired: stream the file from `StorageManagerService` with `text/csv` and a filename. Otherwise 409.

Any admin can download any admin export, consistent with the single admin role that can already open every list. Creation is audited as `export_requested`. Download is not a separate audit event.

`GET /admin/exports?limit&offset` lists export jobs, newest first, for operators to resume a download during the 24-hour window. Expired rows remain visible with status `expired` and no file.

Retention is 24 hours from the time the file becomes `ready`. Lazy expiry deletes the storage object.

## 6.6 `GET /admin/search`

Purpose: admin launcher across existing records. PostgreSQL only.

Query:

| Param | Behavior |
| --- | --- |
| `q` | required, trim, min 2, max 80 |
| `type` | optional: `users`, `books`, `epubAuthors`, `publishers`, `categories`, `subscriptions`. Omit to return every group |
| `limit` | per group, default 8, max 25 |
| `offset` | used when `type` is set. When `type` is omitted, offset is 0 and each group is the first page |

Response when `type` is omitted:

```json
{
  "query": "hikayat",
  "users": { "items": [], "total": 0 },
  "books": { "items": [], "total": 0 },
  "epubAuthors": { "items": [], "total": 0 },
  "publishers": { "items": [], "total": 0 },
  "categories": { "items": [], "total": 0 },
  "subscriptions": { "items": [], "total": 0 }
}
```

Item shapes are short projections, not full detail DTOs:

| Group | Match | Item fields |
| --- | --- | --- |
| users | email or displayName contains, not deleted | `id`, `email`, `displayName`, `role`, `isPublisher` |
| publishers | same, plus `isPublisher: true` | same |
| books | title, description, creator, or EPUB publisher contains, not deleted. Not chapter or page text | `id`, `title`, `publishingStatus`, `authorName`, `publisherName`, `ownerId` |
| epubAuthors | distinct `BookSourceMetadata.creator` contains, book not deleted | `creator`, `bookCount`. No user id. Destination is the catalog with `authorName` set to that creator |
| categories | name or slug contains, not deleted | `id`, `name`, `slug` |
| subscriptions | user email contains, or plan name contains, subscription not deleted | `id`, `userId`, `userEmail`, `status`, `planName`, `readingAccessState` |

Order inside a group: exact case-insensitive match, then prefix match, then contains, then `id` desc. Implement the rank in the read-model query. Do not sort in the controller.

Publishers are users with `isPublisher: true`. They overlap the user group on purpose. EPUB authors are creator strings, not accounts. EPUB publisher text is matched on the book group via `publisherName`, not as a publisher account.

Do not search password hashes, invitation token hashes, Stripe ids, book file keys, or chapter/page text. Do not persist recent searches.

## 6.7 `GET /admin/subscriptions/:id/support-context`

Admin only. Read-only. Does not cancel, refund, or change periods.

Response:

- `computedAt`
- plan summary: `id`, `name`, `kind`, `interval`, `amountCents`, `currency`
- subscription: `id`, `status`, `startedAt`, `currentPeriodStart`, `currentPeriodEnd`, `canceledAt`, `activatedAt`, `trialStartedAt`, `trialEndsAt`
- `readingAccessState` and `trialEligible` from the existing helpers
- `accessExplanationCode`: a label for the branch the helper already took (`paid_until_period_end`, `trial_until`, `free`). `paid_until_period_end` covers a canceled subscription that is still before `currentPeriodEnd`. The code is derived from the helper result and the stored dates. It is not a second entitlement rule
- `refundEligible` and `refundIneligibilityCode` using the same predicates as `SubscriptionBillingService.refundManagedSubscription` (`REFUND_WINDOW` of 7 days, active monthly paid, Stripe subscription id present). Codes match the existing exceptions (`REFUND_WINDOW_EXPIRED`, `REFUND_NOT_ELIGIBLE`) or `eligible`
- `stripeCustomerId` and `stripeSubscriptionId` (nullable). These two fields exist so the detail screen can show a copy control
- `latestPaymentFailure`: `null` or `{ createdAt, invoiceStatus }` from the newest `subscription_payment_failed` audit row for this subscription. The event does not change `status` or `readingAccessState`. Omit raw invoice Stripe ids from this object

`GET /admin/subscriptions` and `GET /admin/users` do not gain these Stripe fields. `GET /admin/users/:id` continues to embed `SubscriptionResponse` without them. The support screen calls this route.

Payment and invoice history is out of scope. Design QA marks that timeline as future, and there is no local invoice table. Do not add a live Stripe invoice fetch in this implementation.

---

# 7. Database Changes

No Author model. No Publisher model. No new subscription status. No copy of EPUB strings onto `User`.

| Change | Why | Reuse instead? | Migration |
| --- | --- | --- | --- |
| `AdminInvitationStatus.revoked` plus `revokedAt`, `revokedByUserId`, optional `revokeReason`, `lastSentAt`, `resendCount` | Lifecycle list, revoke audit, and the 60-second resend cooldown need these facts. Raw tokens stay hashed only | Status alone cannot show who revoked or when the last mail was sent | Yes |
| `AuditAction` values `invitation_created`, `invitation_resent`, `invitation_revoked`, `export_requested` | These operations are admin actions and the audit screen already lists by action | Metadata on an existing action would overload unrelated events | Yes, enum values |
| `AdminExport` model | Export status, actor, filter snapshot, storage key, row count, expiry, error. The request must return before the file exists | No existing job table | Yes |
| `pg_trgm` extension and GIN indexes | `ILIKE '%q%'` cannot use the current btree indexes | Btree on title does not serve contains search | Yes, raw SQL in a Prisma migration |
| Composite btree for admin book equality filters | `bookType`, `layoutType`, `ownerId`, `publishingStatus`, `processingStatus`, `deletedAt` will be combined | Single-column indexes on status, processing, owner, and `publishedAt` already exist. Add `bookType` and `layoutType` indexes. A wide composite is optional until `EXPLAIN` shows a need | Yes for the two missing columns; composite only if a query plan needs it |
| Chapter engagement query | Per-user sums | Table and `@@index([userId, bookId])` already exist. No new column | No |
| Payment failure on subscription detail | Latest audit row | `AuditLog` already stores the event. Index `@@index([subjectType, subjectId])` and `@@index([action])` exist | No |
| Publisher book counts | `_count` / grouped count on `Book.ownerId` | `ownerId` index exists | No |
| Dashboard reading list | Group `BookEngagement` by `bookId` | `@@index([bookId])` exists | No |
| Stripe ids | Already columns | Do not add columns | No |
| Reading progress paging | Already a table | Do not snapshot progress percent | No |

### `AdminExport` fields

`id`, `actorUserId`, `resource`, `filters` (JSON snapshot), `columns` (JSON string array), `selectedIds` (JSON int array, nullable), `sortBy`, `sortOrder`, `status` (`pending`, `processing`, `ready`, `failed`, `expired`), `storageKey` (nullable), `rowCount` (nullable), `errorCode` (nullable), `expiresAt` (nullable), `createdAt`, `updatedAt`, `deletedAt`.

Index `(status, createdAt)` and `(actorUserId, createdAt)`.

`filters` is the request snapshot so a later change to query defaults cannot change a file already queued.

### Trigram indexes

`CREATE EXTENSION IF NOT EXISTS pg_trgm`, then GIN indexes on:

- `Book.title`
- `Book.description`
- `BookSourceMetadata.creator`
- `BookSourceMetadata.publisher`
- `User.email`
- `User.displayName`
- `Category.name`
- `Category.slug`

`Book.description` is included because keyword search covers it. It is the largest of these indexes. Chapter and page text stay unindexed for admin search.

Hosted Postgres must allow the extension. That is an environment check, not a model change.

---

# 8. New Backend Services

| Service | Module | Responsibility |
| --- | --- | --- |
| Existing `BookService.listBooks` | `book` | Grow the list input and repository `where`. No new book service |
| `AdminPublisherDirectoryService` | `user` admin read path | List page with book counts. Summary composes status counts, recent books, and `lifetimeAuthorCents` from `BookRevenue` without a Publisher model |
| `UserReadingEngagementService` method, or a method on the existing reading-intelligence service | `reading-intelligence`, called from `user-admin-detail` | New repository methods: sum chapter durations by `userId` + `bookId`; sum visual durations by `userId` + `bookId`. The current sums are book + period and ignore user |
| `AdminDashboardReadingService` | `monetization` | Grouped `BookEngagement` projection. Reuse `toReadingMinutes`. Do not reimplement the minute formula |
| `AdminInvitationService.resendInvitation` and `revokeInvitation` | `user` | State checks, 60-second cooldown, token rotation, mail, audit |
| `SubscriptionSupportContextService` | `subscription` | Reads the existing entitlement and refund predicates. Returns explanation codes and Stripe ids. Does not write |
| `AdminExportService` | new `admin-export` module | Create, claim, render, fail, expire. Repository owns `AdminExport`. CSV rendering is a pure function per resource that reads through that resource's list service or a read-model paged at a fixed batch size (500) |
| `AdminExportWorker` | `admin-export` | Deferred execution. Not `JobManagerService.enqueue`, because that call blocks until the handler returns |
| `AdminSearchService` | new `admin-search` module | One read-model repository, parallel group queries, rank in SQL |

`UserAdminDetailModule` will import `ReadingIntelligenceModule` for the engagement route. It already imports book, reading, and subscription.

Export rendering must call the same filter code as the list endpoints so a CSV cannot disagree with the screen. Prefer shared repository `where` builders over a second copy of the predicates.

---

# 9. Authorization Changes

No new role. Frontend checks remain hints.

| Operation | Rule |
| --- | --- |
| Every new and modified `/admin/*` route | JWT and role `admin` |
| Invitation resend and revoke | Admin. No extra "inviter only" check. Any admin may resend another admin's invite. The actor is the current user in the audit row |
| Accept | Public, token hash. Add an explicit `revoked` rejection beside the existing accepted and expired checks |
| Export create and download | Admin. Download does not require the caller to be `actorUserId`, matching the shared admin audit log |
| Global search and publisher directory | Admin. Projections stay within fields already visible on admin list screens |
| Stripe customer and subscription ids | `GET /admin/subscriptions/:id/support-context` only. Absent from `SubscriptionResponse`, member lists, and `GET /admin/subscriptions` |
| User detail engagement | Admin. No check that the caller "owns" the reader |

Fields that stay out of admin JSON: password hashes, refresh-token hashes, invitation token hashes, wrapped content keys, payment intents, and refund ids. Stripe customer and subscription ids appear only on the support-context route.

Audit rows for resend must not contain the new token.

---

# 10. Performance / Indexing

| Query | Approach |
| --- | --- |
| Catalog `q` | Trigram GIN plus `OR` across title, description, creator, and EPUB publisher. AND with the other facets. Repeated values inside a facet use `in` or `some`. Count uses the same `where`. Description is indexed; chapter text is not |
| Equality filters | Existing status, processing, owner, and published-at indexes. Add btree on `bookType` and `layoutType` |
| `catalogVisible=true` | Same predicate as `countCatalogVisible`. It can use `publishingStatus`, `processingStatus`, and `publishedAt` |
| Publisher counts | One grouped count by `ownerId` for the page of user ids, not a per-row query |
| User engagement | Existing `(userId, bookId)` indexes on chapter and visual engagement |
| Dashboard reading | Aggregate `BookEngagement` by `bookId`. Acceptable without a new index at current admin volume. Revisit if the grouped query seq-scans |
| Global search | Per-group `LIMIT` with trigram filters. Run groups in parallel. Cap `limit` at 25 |
| Export | Page through the filter in batches. Never `findMany` the full table in one call |
| Sort | Allowlisted columns only, plus `id`, so the database can order without a filesort on an expression. This is the section 9.8 exception, limited to admin lists that this plan names |

Do not add Elasticsearch, OpenSearch, or a second search service. Admin search is an operator tool over one Postgres database, with short queries and small pages.

---

# 11. Background Jobs

The current job manager cannot host export. `enqueue` awaits the handler.

Export worker behavior:

1. `POST` writes `pending` and returns.
2. The worker claims the row by updating `pending` to a processing status only if it is still `pending` (use `processing` as a status value on `AdminExport`).
3. It writes the CSV object through `StorageManagerService`, then sets `ready`, `storageKey`, `rowCount`, and `expiresAt`.
4. Failure sets `failed` and `errorCode`. The token-style rule: a failed export does not change domain data.
5. On process start, claim `pending` or `processing` rows older than a short stale window and run them again. Generation overwrites the same storage key, so a crash mid-write can be retried.
6. Expiry is lazy. A download or status read past `expiresAt` deletes the object and sets `expired`. There is no cron in this codebase, and this does not add one.

Do not add Redis or Bull for this. One API process can own the worker. If the deployment later runs more than one API instance, the conditional status update is what prevents two workers writing two files for one id.

Book processing jobs stay on the existing job manager.

---

# 12. Seven Future Capabilities

## 12.1 Catalog search and compound filters

**Current support.** `GET /admin/books` filters by `publishingStatus` and `ownerId`, pages with `limit` / `offset`, returns `total`, sorts by `createdAt desc`. The repository can also filter `processingStatus`, and the admin DTO does not expose it. Reader search can AND `title`, `author`, and `publisher` for catalog-visible books only, using `ILIKE`, with no category, type, layout, or status filter.

**Missing.** A single admin query that ANDs keyword (title, description, creator, EPUB publisher), categories, EPUB creator, EPUB publisher, owner account, book type, layout, publishing status, processing status, and catalog visibility, with repeated values OR'd inside a facet and an allowlisted sort. Not chapter text.

**API.** Extend `GET /admin/books` as in section 5.1. Do not add `GET /admin/catalog`. Do not point the admin UI at `GET /reader/search`.

**Data.** Existing columns. `author` and `epubPublisher` are strings. `ownerId` is the account.

**Database.** Trigram indexes and btree on `bookType` and `layoutType`. No new tables.

**Services.** `BookService` and `BookPrismaRepository.list`.

**Authorization.** Admin.

**Performance.** Server-side page and count. Trigram indexes. Max page size 100.

**Clear / reset.** Absence of a parameter. No reset endpoint.

**Priority.** High. The catalog screen and the published-books drill-down both depend on it.

## 12.2 Publisher directory

**Current support.** `User.isPublisher`, `GET /admin/users?isPublisher=true` (exact email, no counts), `GET /admin/books?ownerId=`, earnings and analytics `ownerId` per revenue period. Home `totalPublishers` uses the same flag and includes admin publishers.

**Missing.** A directory of publisher accounts with book counts, and a summary with status counts plus lifetime author cents. Name search must not widen the exact `email` filter on the members list.

**API.** `GET /admin/publishers` for the list. `GET /admin/publishers/:userId/summary` for lifetime author cents, status counts, and recent books. Books and period earnings reuse `ownerId` filters.

**Data.** No new relationship. The relationship is `Book.ownerId → User`. EPUB `publisher` is a different fact and stays on the book.

**Database.** None beyond the user trigram index shared with search.

**Services.** Publisher read-model query in the user admin surface.

**Authorization.** Admin.

**Performance.** Counts for the current page of publishers only.

**Priority.** High, after book list filters, because the directory links into `ownerId` filters.

**Do not build.** A publisher organization table, a sync from EPUB metadata onto the user, or a screen that treats `publisherName` as an account.

## 12.3 Dashboard drill-downs

| Metric | Source today | List that matches | Change |
| --- | --- | --- | --- |
| `totalUsers` | non-deleted users | `GET /admin/users` | None. Client must omit `excludeRole` |
| `totalPublishers` | `isPublisher: true` | directory or `GET /admin/users?isPublisher=true` | Directory is the better target once it exists |
| `totalBooks` | non-deleted books | `GET /admin/books` | None |
| `publishedBooks` | catalog visibility | no matching list filter | `catalogVisible=true` |
| `pendingReviewBooks` | `in_review` | `GET /admin/books?publishingStatus=in_review` | None |
| `totalReadingMinutes` | all `BookEngagement` paid milliseconds | no platform-wide list | `GET /admin/dashboard/reading` |

Aggregation stays on the server. The home summary endpoint can stay a single call of six numbers.

**Priority.** High for `catalogVisible` and the reading list. The other four drills are query-parameter choices on APIs that exist.

## 12.4 CSV export

**Current support.** None. No CSV response anywhere in the backend.

**Missing.** Filtered export, selected-id export, status, download, retention, cleanup, and a path that does not build the file inside the POST.

**API.** Section 6.5.

**Data.** `AdminExport` plus an object in the existing storage provider.

**Database.** New model and indexes in section 7.

**Services.** `AdminExportService` and the deferred worker.

**Authorization.** Admin. Filters cannot widen visibility past the list APIs.

**Performance.** Asynchronous only. Batch reads. Hard stop at 10,000 rows with 422 and no file. 24-hour retention. Lazy expiry. The in-process job manager cannot defer this work.

**Priority.** Medium. It depends on the list filters being stable, so it follows catalog, publisher, and invitation work.

## 12.5 Invitation resend / revoke

**Current support.** Create, list pending unexpired, email on create, seven-day expiry, hash-only storage, public accept. Pending unexpired email blocks a second create. Mail failure on create soft-deletes the new row. No audit.

**Missing.** Resend, revoke, accept handling for revoked, audit.

**API.** Section 6.4.

**Data.** Status `revoked`. Token rotation on resend. Expiry rule stays seven days from the resend instant, which is the existing window applied again, not a new duration.

**Database.** Enum value and audit enum values.

**Services.** `AdminInvitationService`, existing mail helper and token helper.

**Authorization.** Admin for commands. Public accept must reject revoked.

**Performance.** One row and one email. No background job. Cooldown is 60 seconds from `lastSentAt` on that invitation. Expired invitations are not resent.

**Audit.** `invitation_created` should be added on the existing create path in the same change, so the log matches resend and revoke. That is a small extension of create, not a new product rule.

**Priority.** High. The operations are small and the design cannot fake them in the client. A copied accept URL from the create dialog is not a resend: the token is not stored in a recoverable form.

## 12.6 Subscription support context

**Current rules to expose, unchanged:**

- Plans: `free` or `monthly_paid`. Paid interval is `month`. Amount and currency live on `Plan`.
- One subscription per user. Status `active` or `canceled`.
- `readingAccessState`: `paid` if the plan is `monthly_paid`, `currentPeriodEnd` is set, and now is before `currentPeriodEnd`. Status `canceled` does not remove that access early.
- Else `trial` when both trial timestamps are set and now is before `trialEndsAt`.
- Else `free`.
- `trialEligible` is true when there is no subscription, or the user is not paid and `trialStartedAt` is null. Admin cannot start a trial.
- Cancel sets `canceled` and leaves `currentPeriodEnd`.
- Refund requires an active monthly paid Stripe subscription inside 7 days of activation, then sets `currentPeriodEnd` to now.

**Already on `GET /admin/subscriptions/:id` and on user detail:** status, plan, period dates, trial dates, `readingAccessState`, `trialEligible`, cancel and refund commands.

**Missing from the shared JSON:** Stripe customer id, Stripe subscription id, a refund-eligibility code, and the latest payment-failure audit. Those ids are stored. The shared DTO hides them on purpose.

**API.** `GET /admin/subscriptions/:id/support-context` (section 6.7). No new billing rule, no invoice endpoint, no admin "change plan" command.

**Priority.** High for the support summary. Payment history stays out of scope.

## 12.7 Global admin search

**Current support.** None under `/admin`. Reader search does not cover users, categories, subscriptions, or non-catalog books.

**Missing.** One admin query across users, books, distinct EPUB creators, publisher accounts, categories, and subscriptions.

**API.** Section 6.6.

**Data.** Existing tables only.

**Database.** The trigram indexes in section 7.

**Services.** `admin-search` read-model.

**Authorization.** Admin.

**Performance.** Grouped short pages, parallel queries, rank in SQL, hard max page size. No external search engine.

**Priority.** Medium. It should reuse the trigram indexes and the publisher/user/book match rules, so it follows those list filters.

---

# 13. Product Decisions

## Resolved

| Decision | Resolution in this plan |
| --- | --- |
| Figma files outside the repo | Do not block. Use discovery, design QA, backend requirements, and the decisions below. `src/AdminC.tsx` remains an open verification item. |
| Catalog keyword fields | Title, EPUB creator, EPUB publisher, and `Book.description`. Not chapter or page text. |
| Compound filters | Server-side. AND across facets. OR inside a repeated facet. |
| Publisher money | `lifetimeAuthorCents` on `GET /admin/publishers/:userId/summary` only. List carries book counts. No Publisher model. Admin publishers stay in the directory. |
| Global search groups | Users, books, distinct EPUB creators, publisher accounts (`isPublisher: true`), categories, subscriptions. |
| CSV export | Async, 10,000-row maximum, 24-hour retention, snapshotted allowlisted filters and sort, admin authorization. Database-backed worker. |
| Invitation resend | Pending, unexpired, and not revoked. 60-second cooldown from `lastSentAt`. Audited. Token rotates. Mail failure restores the previous token. |
| Invitation revoke | Audited. Accept rejects `revoked`. Optional reason. |
| Stripe ids | Support-context detail only, for copy. Not on member or subscription list responses. |
| Access state | Stays off `GET /admin/users`. Existing helper on detail and support context. |
| Reading progress | Paged past 100. Reflowable and fixed-layout position fields stay as they are. |
| Admin sort | Allowlisted `sortBy` / `sortOrder` on books, users, and publishers. Unknown fields are 400. Other admin lists keep a fixed repository order. |

## Remaining product decisions

None. The items below are verification or explicit non-goals. They do not block the implementation order.

## Open verification

| Item | What is unsettled | What implementation does anyway |
| --- | --- | --- |
| `src/AdminC.tsx` is not in the repo | A prototype frame could show a column these documents do not name | Build the contracts in this plan. Do not invent extra columns from an unseen frame |
| Design QA section 14.3 sends Reading Minutes to Revenue and says no new aggregation is required | The home minute total is all-period `BookEngagement`, which the revenue-period list does not equal | Keep `GET /admin/dashboard/reading` so the metric has a matching list. The UI can still link to Revenue. Confirm the card target when the prototype is available |
| Which list pages show Export | Design QA says supported list pages and does not name each one | First allowlist: users, books, publishers, subscriptions, invitations, audit logs |

## Out of scope

- Payment and invoice timeline (`GET /admin/subscriptions/:id/payments`). Design QA labels it future. No local invoice table, and this plan does not add a live Stripe invoice read.
- Recent-search storage.
- External search engine.
- Facet counts on the catalog response. Result `total` and `appliedFilters` are enough.
- Client sort on categories, collections, plans, revenue, and audit.
- A new entitlement, refund window, category-weight, or invitation-duration rule. The resend cooldown is 60 seconds. The invitation lifetime stays seven days.

---

# 14. Implementation Order

Dependencies run downward. Do not start export or global search before the list filters they share.

1. **Database and index foundations.** Invitation lifecycle columns, audit actions, `AdminExport`, `pg_trgm` (including description), `bookType` and `layoutType` indexes.
2. **Invitation resend and revoke.** Accept-path rejection, 60-second cooldown, token restore on mail failure, audit on create, resend, and revoke.
3. **Catalog compound search, filter, and sort.** Extend `GET /admin/books`, including description in `q`, repeated facets, and `catalogVisible`. This `where` builder is shared with export.
4. **Publisher directory.** List counts, then the summary with `lifetimeAuthorCents`. Book and earnings links use step 3 and the existing revenue `ownerId` filter.
5. **Subscription support context.** Explanation codes, refund eligibility from the existing predicates, Stripe ids on this route only, latest payment-failure audit.
6. **User engagement and reading-progress pagination.** Per-user chapter or spread engagement, and `GET /admin/users/:userId/reading-progress` with a real `total`.
7. **Dashboard reading drill-down.** `GET /admin/dashboard/reading` on `BookEngagement`.
8. **CSV export.** Worker, storage, estimate, 10,000-row cap, 24-hour retention. Depends on the filter builders from steps 3 through 5.
9. **Global admin search.** Same match fields and trigram indexes, plus the distinct EPUB-creator group.

Support context does not depend on the catalog, but it stays after the publisher summary so billing work is not interleaved with the catalog query change. Export stays after those filters so the snapshot reuses one `where` builder. Search stays last because it reuses the indexes and the account-versus-metadata split.

Complexity:

| Area | Complexity |
| --- | --- |
| Invitation resend / revoke | Low |
| Subscription payment-failure context | Low |
| Catalog compound filters | Medium |
| Publisher directory | Medium |
| Dashboard reading drill-down | Medium |
| User chapter / spread engagement | Medium |
| Global search | Medium |
| CSV export and worker | High |
| New search engine, Publisher model, or queue product | Not recommended |

---

# 15. Risks

| Risk | Why it matters | Mitigation in this plan |
| --- | --- | --- |
| Prototype file is outside the repo | A frame could name a column the written docs do not | Section 13 verification. Do not drop a documented field, and do not add an undocumented one |
| Published drill-down uses `publishingStatus=approved` | Unpublished-but-approved books would appear in the "published" list | `catalogVisible` uses the existing three-part predicate |
| Reading drill-down uses raw sessions | The number will not match the home card | Group `BookEngagement` only, and document empty engagement before refresh |
| Resend mail failure deletes the only token | Create deletes the row on mail failure. Copying that onto resend destroys the working link | Restore previous hash and expiry |
| Revoke forgets the accept check | A non-accepted status is still acceptable today until expiry | Explicit `revoked` check in `assertInvitationAcceptable` |
| `pg_trgm` unavailable on the host | Migration fails, contains search stays a sequential scan | Confirm the extension before the migration. Equality filters still work without it |
| In-process export worker dies | Row stuck in `processing` | Stale-claim on startup. Conditional status update for multiple instances |
| Export and list filters diverge | The file would not match the screen | One `where` builder per resource |
| Client sort becomes a raw `orderBy` string | Injection and filesorts | Allowlist enum on the DTO |
| Stripe ids leak through the shared `SubscriptionResponse` | Reader clients and member lists would start seeing them | Ids are fields on the support-context DTO only. The existing response spec stays green |
| Payment-failure badge treated as loss of access | The webhook does not cancel the subscription | API docs and the field name `latestPaymentFailure` stay separate from `readingAccessState` |
| Silent progress cap | Books after the first 100 never appear | Paged route plus `readingProgressTotal` on user detail |
| Description trigram index is large | Migration time and write cost on `Book.description` | Index it because search includes description. Do not index chapter text |
| Reading-minutes card target | Design QA points at Revenue; the matching rows are all-period engagement | Ship the drill-down endpoint. Confirm the card link against the prototype later |

---

# 16. Testing Requirements

Follow `ARCHITECTURE.md` section 20. Unit tests mock repositories and peer services. DTO tests are pure. e2e uses the test app, a test database, and provider doubles (mail, storage, Stripe). No test sends real mail or writes real S3.

Do not implement these tests in this phase.

## 16.1 Catalog `GET /admin/books`

- Service: each filter sets the repository input; combined filters are all present; omitted filters are absent; `q` shorter than 2 is rejected; `catalogVisible: true` and `false` map to the visibility predicate.
- Repository integration: AND across facets; OR inside repeated category, status, type, and layout values; `q` matches title, description, creator, and EPUB publisher; `q` does not match chapter or page text; `total` matches the filtered set, not the page length; unknown `sortBy` is rejected; tie-break is `id desc`; soft-deleted books and categories are excluded.
- Controller: admin allowed, non-admin 403, unauthenticated 401.
- DTO validation: unknown `sortBy`, unknown enums, non-integer ids.

## 16.2 Publisher directory

- Service: only `isPublisher: true` and not deleted; admin publishers included; `bookCount` and `catalogVisibleBookCount` match fixtures; `q` matches email and display name. Summary `lifetimeAuthorCents` equals the sum of that owner's `BookRevenue.authorCents` and is absent from the list payload. A non-publisher id is 404 on the summary.
- Authorization 401/403.
- Pagination `total` with a page size smaller than the fixture set.
- Sort by `bookCount` and by `email`.

## 16.3 Dashboard reading

- Aggregation fixture: two periods, two books, visual scene milliseconds present. `totalReadingMinutes` equals `(activeReadingMs + activeSpreadMs) / 60000` and ignores visual scene time and idle time.
- `ownerId` limits both the total and the rows.
- A session with no `BookEngagement` row does not appear and does not change the total.
- Pagination and sort.

## 16.4 User engagement

- Reflowable: sums `ReadingChapterEngagement` for that user and book only; another user's rows are excluded; chapter title comes from `BookChapter`.
- Fixed layout: sums active duration and visual scene time per spread/page for that user.
- 404 for unknown user or book.
- Progress paging: a user with more than 100 books returns the later page; `readingProgressTotal` is the full count; reflowable items still expose spine and scroll; fixed-layout items still expose spread and page. The progress table schema is unchanged.

## 16.5 Subscription context

- Latest payment-failure audit is returned; an older one is not; a different subject id is not.
- `readingAccessState` stays `paid` when status is `canceled` and `currentPeriodEnd` is in the future.
- Trial state, free state, and refund-window rejection stay covered by existing subscription tests; extend them if the response gains fields.
- Support context includes `stripeCustomerId` and `stripeSubscriptionId`. `GET /admin/subscriptions`, `GET /admin/users`, and `SubscriptionResponse` still omit both. `refundEligible` follows the existing 7-day window. `latestPaymentFailure` does not change `readingAccessState`.

## 16.6 Invitations

- Resend on pending unexpired rotates the hash, extends expiry by seven days, emails once, does not return the raw token, increments `resendCount`, writes `invitation_resent` without the token.
- A second resend inside 60 seconds returns 429.
- The previous token fails accept after a successful resend.
- Mail failure restores the previous hash, expiry, `lastSentAt`, and `resendCount`; the old token still accepts.
- Resend on accepted, revoked, or expired returns 409.
- Revoke sets `revoked`, writes audit, and accept of that token fails.
- Revoke on accepted returns 409.
- Create still rejects only an unexpired pending email; a revoked email can be invited again.
- Create writes `invitation_created`.
- Omitted `status` still returns only pending unexpired rows. `status=expired`, `accepted`, and `revoked` return those rows.

## 16.7 Export

- POST returns pending without waiting for the file body.
- Worker writes a CSV whose rows match the list filter and sort, including a compound book filter.
- `selectedIds` exports those rows and ignores a contradictory filter.
- Count above 10,000 returns 422 and does not upload a file. A ready file expires 24 hours after it becomes ready. `POST` returns before the CSV exists. Unknown filter keys and unknown columns are 400.
- Download of `ready` streams CSV; download of `pending`, `failed`, and `expired` returns 409.
- Expired status deletes the storage object.
- Non-admin receives 403 on create, status, and download.
- A second worker claim does not create two objects.
- CSV does not contain password hashes, token hashes, or content keys.

## 16.8 Global search

- Each group matches only its fields. `epubAuthors` returns distinct creator strings and no user id. Book search can match description and does not match chapter text.
- Non-catalog and in-review books are findable. Reader search behavior stays catalog-only (regression).
- Rank: exact email before prefix before contains.
- `type` plus `offset` pages one group; omitted `type` returns the first page of each group and real totals.
- Deleted rows are absent.
- Non-admin receives 403.
- `q` of length 1 is 400.

## 16.9 Regression

Existing e2e for book review, subscriptions, audit, and dashboard summary should be run after the book list and subscription DTO changes so catalog visibility counts and entitlement fields stay stable.

---

# 17. Final Backend Change Checklist

## Reuse with no change

- [ ] `GET /admin/dashboard/summary`
- [ ] `GET /admin/users` exact `email`, `role`, `excludeRole`, `isPublisher` (plus optional `q` only as an addition)
- [ ] `PATCH` and `DELETE /admin/users/:id`
- [ ] `GET /admin/users/:id` subscription, access state, trial, and per-book active duration for the first page of progress
- [ ] `POST /admin/invitations` and `GET /admin/invitations` pending list
- [ ] `POST /auth/accept-admin-invitation` aside from the new revoked check
- [ ] Book approve, reject, unpublish, republish, delete, metadata patch, rejection history
- [ ] Category create, list, get, patch
- [ ] Plan create, list, get, patch
- [ ] Subscription list, get, cancel, refund, and the existing entitlement helpers
- [ ] Collection routes
- [ ] Platform settings
- [ ] Revenue period routes, including `ownerId` on earnings and analytics, and heatmap
- [ ] Audit list and detail
- [ ] `GET /reader/search` left as a reader catalog API

## Modify

- [ ] `GET /admin/books` compound filters, `catalogVisible`, `processingStatus`, allowlisted sort
- [ ] `GET /admin/users` optional `q` and allowlisted sort, without `readingAccessState` or Stripe ids
- [ ] `GET /admin/users/:id` includes `readingProgressTotal` and does not stop at a hidden 100
- [ ] `GET /admin/invitations` lifecycle `status`, send and revoke metadata
- [ ] Accept path rejects `revoked`
- [ ] Create invitation writes `invitation_created` and sets `lastSentAt`

## Add

- [ ] `GET /admin/publishers` and `GET /admin/publishers/:userId/summary`
- [ ] `GET /admin/users/:userId/reading-progress`
- [ ] `GET /admin/subscriptions/:id/support-context`
- [ ] `POST /admin/exports/estimate` and `GET /admin/exports`
- [ ] `GET /admin/users/:userId/books/:bookId/engagement`
- [ ] `GET /admin/dashboard/reading`
- [ ] `POST /admin/invitations/:id/resend`
- [ ] `POST /admin/invitations/:id/revoke`
- [ ] `POST /admin/exports`, `GET /admin/exports/:id`, `GET /admin/exports/:id/download`
- [ ] `GET /admin/search`
- [ ] `AdminExport` model, export worker, storage object
- [ ] Invitation status `revoked`
- [ ] Audit actions for invitations and export request
- [ ] `pg_trgm` indexes and book type / layout indexes
- [ ] Tests in section 16

## Do not add

- [ ] Author or Publisher tables
- [ ] A new entitlement or refund rule
- [ ] Elasticsearch or a Redis queue
- [ ] Client-side filtering of a full catalog download
- [ ] Admin book upload or admin-editable layout type
- [ ] Category or plan delete
- [ ] Changes to `ARCHITECTURE.md`, the Figma files, frontend, or mobile in this planning phase
