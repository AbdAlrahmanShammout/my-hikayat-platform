# My Hikayat Admin Dashboard — Backend and API Requirements

**Status:** Backend-planning handoff  
**Design source:** Finalized Direction C prototype in `src/AdminC.tsx`  
**Functional baseline:** `src/imports/ADMIN-DASHBOARD-DISCOVERY.md`  
**Design QA:** `docs/ADMIN-DASHBOARD-DESIGN-QA.md`

This document describes the backend support required by the finalized Admin design. It is a proposal, not an implementation record. No endpoint, schema, permission, or business-rule change described here should be treated as existing until implemented and verified.

## Guiding principles

1. The approved Admin UX is the product requirement; current endpoint boundaries do not determine page composition.
2. Existing publishing, entitlement, refund, revenue, and role rules remain authoritative unless the product owner explicitly changes them.
3. The server must calculate access, revenue, and eligibility outcomes. The client displays those outcomes and must not recreate business rules.
4. All Admin data and mutations require authenticated Admin authorization unless a route is explicitly public, such as invitation acceptance.
5. List endpoints should converge on consistent filtering, sorting, pagination, validation, and error contracts.
6. New mutations should produce appropriate audit events.

---

## 1. Existing APIs That Are Sufficient

These APIs are sufficient for the verified core experience or can remain the source for current fields. Some may still be composed by a future backend-for-frontend layer.

| Endpoint | Current capability sufficient for | Notes | Priority |
|---|---|---|---|
| `GET /admin/dashboard/summary` | Six verified overview totals | Keep totals server-calculated. Destination filters are a navigation concern. | High |
| `GET /admin/users/:id` | Account, subscription summary, access, reading progress | Remains the canonical managed-user detail source. | High |
| `PATCH /admin/users/:id` | Role and publisher update | Preserve self-management, last-admin, and role/publisher rules. | High |
| `DELETE /admin/users/:id` | Soft-delete user | Keep destructive confirmation client-side and server authorization authoritative. | High |
| `POST /admin/invitations` | Create invitation and one-time acceptance URL | Response must continue returning the raw acceptance token/URL once only. | High |
| Public invitation-accept endpoint | Accept token, set credentials/display name, create or upgrade Admin | Keep outside Admin guard; validate token and terminal states. | High |
| `GET /admin/books/:id` | Book catalog record | Already supplies owner, categories, EPUB author/publisher metadata, status, processing, layout, and type. | High |
| `PATCH /admin/books/:id` | Editable metadata | Continue limiting fields to title, description, book type, and categories. | High |
| Book approve/reject/unpublish/republish endpoints | Publishing actions | Preserve transition and processing guards. | High |
| `DELETE /admin/books/:id` | Soft-delete book | No change required for core action. | High |
| `GET /admin/books/:id/rejection-history` | Rejection history | Keep paged and linked to Audit entries. | Medium |
| Category GET/POST/PATCH endpoints | List, create, rename, weight update | No delete should be inferred. | High |
| Plan GET/POST/PATCH endpoints | Plan list, create paid plan, edit | Preserve Stripe-first registration model unless product changes it. | High |
| `GET /admin/subscriptions/:id` | Canonical subscription record | Existing fields remain useful even when a support-context endpoint is added. | High |
| Subscription cancel/refund endpoints | Existing billing actions | Preserve server-side eligibility and Stripe behavior. | High |
| Collection GET/POST/PATCH/DELETE and cover/membership/reorder endpoints | Full collection workflow | Existing mutation set covers finalized verified design. | High |
| Platform settings GET/PATCH | Four reader-app settings | Preserve clear-value behavior and field limits. | Medium |
| Revenue-period GET/POST/PATCH/current/close/engagement/calculate endpoints | Revenue workflow | Continue calculating shares server-side. | High |
| Revenue earnings/analytics endpoints | Period tables and totals | Existing owner filtering and paging remain useful. | High |
| Revenue heatmap endpoint | Reflowable and fixed-layout engagement | Must continue returning layout-specific cells and visual scene time. | High |
| Audit list/detail endpoints | Read-only history and detail | Existing model remains canonical. | High |

---

## 2. Existing APIs That Need Changes

### 2.1 Catalog list

**Endpoint:** `GET /admin/books`

**Current capability:** Offset pagination, owner ID, publishing status.

**Missing data/query behavior:**

- keyword search;
- multiple categories;
- multiple publication and processing statuses;
- book type and layout type;
- owner account search/selection;
- EPUB author and EPUB publisher matching;
- validated sorting;
- catalog-visible filter distinct from `approved`;
- normalized filter metadata for stable URL restoration.

**Required change:** Extend the endpoint or replace it with a versioned catalog-query endpoint supporting compound filters and sort.

**Reason:** Final catalog discovery design combines search and multiple filters while keeping concepts distinct.

**Priority:** High.

### 2.2 Managed user lists

**Endpoint:** `GET /admin/users`

**Current capability:** Exact email, role/excludeRole, publisher flag, offset pagination.

**Missing data/query behavior:**

- partial search across email and display name;
- multiple roles;
- account-state filtering if deletion/status is exposed;
- sorting;
- optional associated-book counts for Publisher Directory;
- normalized query metadata.

**Required change:** Add safe partial search and sorting. Keep exact-email behavior available where support requires deterministic lookup. Publisher aggregates may be a separate summary endpoint.

**Reason:** Publisher Directory and Global Search need scalable account lookup.

**Priority:** High.

### 2.3 Invitation list

**Endpoint:** `GET /admin/invitations`

**Current capability:** Pending, unexpired invitations only.

**Missing data/query behavior:**

- pending, expired, accepted, and revoked lifecycle states;
- status filter;
- sent, accepted, revoked, and last-resend timestamps;
- resend count or delivery metadata where allowed;
- sorting and pagination across lifecycle states.

**Required change:** Add lifecycle query support while retaining a pending default view.

**Reason:** The finalized invitation-management design needs a complete lifecycle, not only the active queue.

**Priority:** Medium.

### 2.4 Subscription detail

**Endpoint:** `GET /admin/subscriptions/:id`

**Current capability:** Subscription record and dates.

**Missing data/query behavior:**

- authoritative reading-access explanation;
- trial eligibility/start/end in a consistent Admin response;
- refund eligibility and reason code;
- provider-reference redaction policy;
- support “as of” timestamp;
- optional invoice/payment summaries.

**Required change:** Keep the canonical record endpoint and add or embed a server-authored support context. Do not make the client infer entitlement or refund rules.

**Reason:** Support staff need to explain why access exists without reproducing service logic.

**Priority:** High for access explanation; Medium for provider/payment details.

### 2.5 Audit filters

**Endpoint:** `GET /admin/audit-logs`

**Current capability:** Actor, action, subject type, subject ID, offset.

**Missing behavior:** The accepted action filter must include every stored Admin-relevant action, including content-key issuance when present.

**Required change:** Align request validation/filter constants with the audit enum.

**Reason:** A read-only audit system must not hide known action types from filtering.

**Priority:** Medium.

### 2.6 Dashboard destination semantics

**Endpoints:** `GET /admin/dashboard/summary`, `GET /admin/books`, `GET /admin/users`

**Current capability:** Correct summary totals; destination endpoints cannot represent every summary definition.

**Required change:**

- Books query needs a `catalogVisible=true` or equivalent filter for Published Books.
- Publisher drill-down uses `isPublisher=true`.
- Pending Review uses `publishingStatus=in_review`.

**Reason:** A metric must lead to the records that make up that metric.

**Priority:** High.

### 2.7 List contract consistency

**Endpoints:** All Admin list endpoints.

**Current capability:** Mostly offset pagination with route-specific filter conventions.

**Required change:** Standardize:

- `limit`, `offset`, `total`;
- validated `sort` and `order`;
- normalized filter echo where useful;
- stable error shape;
- maximum page size;
- deterministic tie-breaker sorting;
- cancellation and request tracing.

**Reason:** Tables, URL-persisted filters, exports, and Global Search depend on predictable list behavior.

**Priority:** Medium.

---

## 3. New APIs Required

### 3.1 Publisher summary

**Proposed endpoint:** `GET /admin/publishers/:userId/summary`

**Purpose:** Compose publisher account, associated-book status counts, and canonical owner-filter links without forcing the client to aggregate pages.

**Request:** Path `userId`.

**Query parameters:** Optional revenue period ID if period context is shown.

**Response:**

- managed user summary;
- publisher capability and role;
- total/approved/in-review/rejected/unpublished book counts;
- recent associated books;
- available revenue-period references, not lifetime earnings unless approved.

**Permissions:** Admin.

**Pagination/filtering/sorting:** Associated-book preview bounded; full records use Books endpoint with `ownerId`.

**Priority:** Medium. Basic Publisher Directory can launch without this aggregate.

### 3.2 Subscription support context

**Proposed endpoint:** `GET /admin/subscriptions/:id/support-context`

**Purpose:** Return an authoritative explanation of current access and action eligibility.

**Request:** Subscription ID.

**Response:**

- plan and subscription summary;
- server `readingAccessState`;
- explanation code and display-safe explanation inputs;
- relevant paid/trial/cancellation dates;
- refund eligible boolean and reason code;
- provider references according to policy;
- computed-at timestamp.

**Permissions:** Admin.

**Pagination/filtering/sorting:** Not applicable.

**Priority:** High.

### 3.3 Subscription payment history

**Proposed endpoint:** `GET /admin/subscriptions/:id/payments`

**Purpose:** Optional read-only support timeline for invoices, successful payments, failures, and refunds.

**Query parameters:** `limit`, `offset`, optional event type.

**Response:** Sanitized provider event/payment summaries without card secrets.

**Permissions:** Admin; consider a future narrower support/billing permission.

**Pagination:** Required.

**Sorting:** Newest first.

**Priority:** Low until product/privacy scope is approved.

### 3.4 Invitation resend

**Proposed endpoint:** `POST /admin/invitations/:id/resend`

**Purpose:** Re-send or rotate an invitation according to approved token policy.

**Request:** Optional reason; optional idempotency key.

**Response:** Sanitized invitation, new expiry, last-sent time. Raw token should be returned only if product requires another one-time copy surface.

**Permissions:** Admin.

**Priority:** Medium.

### 3.5 Invitation revoke

**Proposed endpoint:** `POST /admin/invitations/:id/revoke`

**Purpose:** Immediately invalidate a pending invitation.

**Request:** Optional or required reason, based on business decision.

**Response:** Sanitized revoked invitation and audit reference.

**Permissions:** Admin.

**Priority:** Medium.

### 3.6 Export estimate

**Proposed endpoint:** `POST /admin/exports/estimate`

**Purpose:** Validate export scope, field permissions, and estimated row count before confirmation.

**Request:**

- entity type;
- current search/filter/sort;
- selected IDs when relevant;
- requested columns.

**Response:** Estimated rows, allowed columns, denied columns, synchronous/asynchronous recommendation.

**Permissions:** Admin plus any future export permission.

**Priority:** Medium.

### 3.7 Create export

**Proposed endpoint:** `POST /admin/exports`

**Purpose:** Generate a bounded CSV immediately or enqueue a large export.

**Request:** Same normalized scope as estimate plus locale/time-zone formatting options if approved.

**Response:** Export ID, status, row estimate, created time, and immediate download when synchronous.

**Permissions:** Admin/export permission.

**Priority:** Medium.

### 3.8 Export status and download

**Proposed endpoints:**

- `GET /admin/exports/:id`
- `GET /admin/exports/:id/download` or a short-lived signed URL in the status response
- optional `GET /admin/exports`

**Purpose:** Poll job state, list recent jobs, and retrieve an authorized expiring file.

**Pagination:** Required for export history.

**Sorting:** Newest first.

**Priority:** Medium.

### 3.9 Unified Admin search

**Proposed endpoint:** `GET /admin/search`

**Purpose:** Permission-aware, ranked lookup across canonical Admin entities.

**Query parameters:**

- `q`;
- repeated `type` from users, books, publishers, categories, subscriptions;
- per-group or global limit;
- optional cursor for expanded group results.

**Response:**

- grouped results;
- entity type and canonical ID;
- primary label;
- disambiguating metadata;
- status;
- canonical Admin destination;
- match/highlight ranges where safe;
- group totals;
- partial-error metadata when one source fails.

**Permissions:** Admin; filter every result through authorization.

**Pagination:** Group-specific cursor for “View all”; command dialog itself remains bounded.

**Sorting:** Relevance first with deterministic tie-breakers.

**Priority:** Medium after catalog search, despite Low initial design priority, because shared infrastructure may reduce duplicated search work.

### 3.10 Optional search suggestions

**Proposed endpoint:** Could be included in `GET /admin/search` for short queries.

**Purpose:** Return useful scoped suggestions such as exact email, book ID, subscription ID, or category.

**Permissions:** Admin.

**Priority:** Low.

---

## 4. Database Requirements

### 4.1 Search and filtering indexes

Proposed indexes depend on the database engine and measured query plans:

- normalized/lowercase `User.email`;
- normalized `User.displayName`;
- `User.isPublisher`, role, and non-deleted scope;
- normalized `Book.title`;
- optional full-text/trigram indexes for Book title, EPUB author, and EPUB publisher;
- `Book.ownerId`;
- publishing status, processing status, layout type, book type;
- `Book.publishedAt`, created, updated;
- join indexes for category-to-book filtering;
- category normalized name;
- subscription ID, user ID, status, period end;
- audit action, actor, subject type/ID, created time.

**Priority:** High for catalog/user search indexes; Medium for cross-entity search tuning.

### 4.2 Invitation lifecycle fields

Potential fields:

- `revokedAt`;
- `revokedByUserId`;
- optional revoke reason;
- `lastSentAt`;
- `resendCount`;
- token generation/version identifier if rotation is supported;
- delivery status only if the email provider supplies reliable events.

Raw invitation tokens must not be stored.

**Priority:** Medium.

### 4.3 Export job persistence

For asynchronous exports, add an export-job store with:

- ID and requesting Admin;
- entity/export type;
- normalized scope snapshot;
- approved column set;
- status and progress;
- estimated/actual row count;
- storage key;
- created, started, completed, failed, and expires times;
- safe failure code;
- download count if policy requires it.

This can be a relational model or durable job-store record. Avoid storing generated CSV content in the primary database.

**Priority:** Medium.

### 4.4 Subscription support data

No obvious schema change is required for existing plan, period, trial, cancellation, and provider IDs. If payment history is synchronized rather than fetched live, add a provider-event/payment projection with idempotent external IDs.

**Priority:** High for query composition; Low for local payment projection until approved.

### 4.5 Publisher Directory

No new publisher entity is recommended. The publisher account remains a User with publisher capability. Efficient `isPublisher` and `Book.ownerId` indexes should be sufficient.

**Priority:** High.

### 4.6 Search analytics and recent searches

Not required for the approved initial Global Search. If product later adopts recent searches, define privacy, retention, and per-user storage before adding a table.

**Priority:** Low.

---

## 5. Backend Services

### 5.1 Admin catalog query service

Responsibilities:

- parse and validate compound filters;
- normalize keyword matching;
- apply deterministic sorting and pagination;
- return filter facets/counts only if approved;
- expose the same normalized query to CSV exports.

**Priority:** High.

### 5.2 Admin search orchestration service

Responsibilities:

- query relevant entities concurrently or through a search index;
- rank and group results;
- enforce permissions;
- tolerate/report partial source failures;
- cap query cost and result volume;
- emit tracing and performance metrics.

**Priority:** Medium.

### 5.3 Export service and worker

Responsibilities:

- validate field allowlists and scope;
- snapshot requesting filters/sort;
- generate RFC-compliant CSV with injection-safe escaping;
- stream small exports;
- enqueue large exports;
- store encrypted files;
- issue short-lived authorized downloads;
- expire and delete files;
- audit creation/download if required.

**Priority:** Medium.

### 5.4 Invitation lifecycle service

Responsibilities:

- validate legal status transitions;
- rotate or retain token according to policy;
- rate-limit resend;
- send email;
- revoke immediately;
- write audit events;
- handle stale-state conflicts idempotently.

**Priority:** Medium.

### 5.5 Subscription support-context service

Responsibilities:

- call existing entitlement and refund eligibility logic;
- return explanation codes and authoritative dates;
- redact provider references;
- optionally retrieve payment context from Stripe;
- never alter subscription behavior.

**Priority:** High.

### 5.6 Publisher summary service

Responsibilities:

- compose account and associated-book aggregates;
- preserve User as the managed identity;
- never infer publisher identity from EPUB publisher text.

**Priority:** Medium.

### 5.7 Query observability

Add metrics and traces for search latency, filter selectivity, export duration/failure, email delivery, and support-context dependencies.

**Priority:** Medium.

---

## 6. Future Capabilities

### 6.1 Catalog Search + Compound Filters

**Required data**

- Book identity and all verified catalog metadata.
- Owner account identity separate from EPUB author/publisher strings.
- Category relationships and relevant timestamps.
- Total and normalized active filters.

**API requirement**

- Extend `GET /admin/books` or add a versioned catalog-query endpoint.
- Search, compound filters, validated sorting, pagination, and catalog-visible semantics.

**Backend requirement**

- Shared catalog query service.
- Query-plan testing against realistic data volume.
- Stable URL-compatible filter grammar.

**Database requirement**

- Search/filter indexes and category relation optimization.

**Business decisions**

- Search matching model.
- Sort allowlist.
- Whether filter facets/counts are needed.
- Exact definition of Published filter.

**Priority:** High.

### 6.2 Publisher Directory

**Required data**

- User identity, role, publisher capability, account state.
- Associated-book counts and previews.
- Canonical owner ID for catalog and revenue filters.

**API requirement**

- Existing user list expanded for search/sort.
- Optional publisher summary endpoint.

**Backend requirement**

- Aggregate book counts efficiently.
- Keep EPUB metadata out of account identity.

**Database requirement**

- No new entity; index publisher flag and owner relation.

**Business decisions**

- Whether publisher-capable Admins appear.
- Which revenue context is shown.
- Which administrative actions belong on Publisher Detail.

**Priority:** High.

### 6.3 Dashboard Drill-downs

**Required data**

- Existing six metrics and their canonical filter definitions.

**API requirement**

- Add catalog-visible filtering to Books if absent.
- Existing `isPublisher` and `in_review` filters can support other drill-downs.

**Backend requirement**

- Document metric membership semantics so totals and filtered records agree.

**Database requirement**

- No obvious new model; relevant list indexes.

**Business decisions**

- Published/catalog-visible definition.
- Whether source context persists after further filter edits.

**Priority:** High.

### 6.4 CSV Export

**Required data**

- Requester, entity, normalized scope, sort, selected rows, allowed columns, row counts, job/file lifecycle.

**API requirement**

- Estimate, create, status, list, and authorized download.

**Backend requirement**

- Export worker, storage, expiry, rate limits, CSV hardening, audit.

**Database requirement**

- Export-job metadata or durable equivalent.

**Business decisions**

- Eligible entities/fields.
- Permissions and sensitive-data handling.
- Sync/async threshold, maximum rows, retention, and audit policy.

**Priority:** Medium.

### 6.5 Invitation Resend / Revoke

**Required data**

- Complete lifecycle state, send/expiry/accept/revoke times, inviter and actor, resend count.

**API requirement**

- Resend and revoke mutations; expanded list filters.

**Backend requirement**

- Token policy, email dispatch, rate limiting, audit, stale-state handling.

**Database requirement**

- Revocation and send metadata.

**Business decisions**

- Whether resend rotates token and extends expiry.
- Reason requirement.
- Resend limits and notification copy.

**Priority:** Medium.

### 6.6 Subscription Support Context

**Required data**

- Plan/status, authoritative access state, explanation, trial/paid/cancel dates, refund eligibility, provider references, optional payments.

**API requirement**

- Support-context endpoint; optional paged payments endpoint.

**Backend requirement**

- Compose existing entitlement/refund services without changing rules.
- Redact provider data.

**Database requirement**

- None obvious for core context; optional payment projection.

**Business decisions**

- Provider/payment visibility and support permissions.
- Whether live Stripe lookup or synchronized history is preferred.

**Priority:** High for access explanation; Medium/Low for payment expansion.

### 6.7 Global Admin Search

**Required data**

- Canonical entity IDs, labels, metadata, status, destinations, and permission-filtered totals.

**API requirement**

- Unified bounded search with types, ranking, grouped results, and optional cursors.

**Backend requirement**

- Search orchestration, ranking, timeouts/partial failures, observability.

**Database requirement**

- Cross-entity indexes or external search index after scale evaluation.

**Business decisions**

- Entity/field scope, matching/ranking, result limits, retention of queries.

**Priority:** Medium after catalog search.

---

## 7. Business Decisions

| Decision | Options / question | Affected capability | Priority |
|---|---|---|---|
| Catalog matching | Prefix/token/fuzzy; minimum query length | Catalog Search, Global Search | High |
| Published definition | Approved vs catalog-visible | Dashboard Drill-downs, Catalog | High |
| Publisher membership | Include publisher-capable Admins? | Publisher Directory | High |
| Publisher revenue scope | Period links only vs broader aggregates | Publisher Directory | Medium |
| Export permissions | All Admins vs future narrower permission | CSV Export | High |
| Export sensitive fields | Approved allowlist and redaction | CSV Export | High |
| Export limits | Sync threshold, max rows, retention, expiry | CSV Export | Medium |
| Invitation resend | Rotate token? Extend expiry? Invalidate old token? | Invitation lifecycle | High |
| Invitation revoke reason | Optional or required | Invitation lifecycle, Audit | Medium |
| Resend rate limit | Attempts and time window | Invitation lifecycle | Medium |
| Provider identifiers | Visibility and copy policy | Subscription Support | High |
| Payment history | Live Stripe vs synchronized projection | Subscription Support | Medium |
| Search scope | Included entities and fields | Global Search | High |
| Search query retention | None, metrics only, or per-admin recent searches | Global Search | Low |
| Search infrastructure | Database-native first vs external service | Search | Medium |
| Audit policy | Which future actions and exports are logged | All future mutations | High |
| Time zones | UTC-only technical values vs localized display with UTC source | Revenue, subscriptions, exports | Medium |

---

## 8. Priority

### High

1. Catalog compound-query contract and indexes.
2. Dashboard drill-down membership semantics.
3. Publisher Directory user search and owner relationships.
4. Subscription support-context endpoint using authoritative services.
5. Existing publishing, entitlement, refund, role, and revenue rules preserved.
6. Authorization and audit policy for every new action.

### Medium

1. Invitation lifecycle expansion.
2. CSV export service, worker, storage, and retention.
3. Global Admin Search after catalog search foundations.
4. Publisher aggregate summary.
5. Standardized list sorting/pagination/error contracts.
6. Query observability and performance budgets.

### Low

1. Payment/invoice history beyond core support context.
2. Recent search persistence.
3. Search suggestions beyond direct grouped results.
4. External search infrastructure before database-native performance is measured.

---

## Backend Planning Readiness

The finalized design supplies enough information to begin endpoint, service, schema/index, permission, and delivery planning. Planning should begin with metric/filter semantics and data contracts, then validate query performance and business decisions before implementation.

**Design status: READY FOR BACKEND PLANNING**
