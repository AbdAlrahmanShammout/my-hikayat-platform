# My Hikayat Admin Dashboard — Discovery

Discovery-only inventory of the Admin Dashboard as it exists in this repository. This document is a functional source of truth for a later redesign. It does not recommend visual changes.
اغ
**Confidence labels**

- **Verified** — confirmed in the current source.
- **Likely** — strongly indicated, but not fully traced.
- **Unknown** — cannot be determined from the repository.

**Date of inspection:** 2026-09-27.

The Admin Dashboard is not a separate application. It is a route tree inside the React dashboard at `frontend/`, protected by an admin role check, talking to NestJS controllers under `backend/src/modules/**/*.admin.controller.ts`.

---

## 1. Repository map

**Verified.** Workspace packages (`pnpm-workspace.yaml`):

| Package | Role |
| --- | --- |
| `frontend/` | React dashboard. Contains both the Admin shell (`/admin`) and the Author shell (`/author`). |
| `backend/` | NestJS API and Prisma schema. Admin HTTP controllers live here. |
| `mobile/` | Expo reader. Not part of the Admin Dashboard. |

There is no shared TypeScript package between frontend and backend. The frontend consumes generated OpenAPI types in `frontend/src/generated/admin.ts` and calls HTTP paths such as `/admin/users`. It does not import `backend/src`.

There is no folder named only `admin/` at the repo root. Admin UI lives in:

- Routes: `frontend/src/app/app-router.tsx`
- Shell and nav: `frontend/src/app/admin-shell.tsx`, `frontend/src/app/admin-nav-items.ts`, `frontend/src/app/admin-route-guard.tsx`
- Pages: `frontend/src/pages/admin/`
- Features: `frontend/src/features/*/components/admin-*.tsx` and matching `api/`, `hooks/`, `lib/`, `schemas/`

Admin API controllers:

| Controller file | HTTP prefix |
| --- | --- |
| `user.admin.controller.ts` | `/admin/users` |
| `admin-invitation.admin.controller.ts` | `/admin/invitations` |
| `book.admin.controller.ts` | `/admin/books` |
| `category.admin.controller.ts` | `/admin/categories` |
| `plan.admin.controller.ts` | `/admin/plans` |
| `subscription.admin.controller.ts` | `/admin/subscriptions` |
| `collection.admin.controller.ts` | `/admin/collections` |
| `platform-setting.admin.controller.ts` | `/admin/platform-settings` |
| `monetization.admin.controller.ts` | `/admin/revenue-periods` |
| `dashboard.admin.controller.ts` | `/admin/dashboard` |
| `audit.admin.controller.ts` | `/admin/audit-logs` |

**Verified.** No global Nest path prefix was found in `backend/src/main.ts`. The frontend prefixes these paths with `getApiBaseUrl()`.

**State.** Server data uses TanStack Query. Filters, paging, and some tabs live in URL search params. Dialogs and confirmations are local React state. No Redux store was found for admin.

**Authentication.** JWT access token plus `GET` current user. Admin pages require role `admin`. See section 14.

---

## 2. Admin route inventory

**Verified** from `frontend/src/app/app-router.tsx`.

Access for every row inside `/admin` is: signed-in user whose current-user role is `admin`. Anyone else is sent to login, shown a load/error state, or shown “Admin access required”. Backend endpoints independently require JWT plus role `admin`.

| Route | Screen | Purpose | Access | Type | URL params | Query params | Nested UI |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/admin` | Overview (nav label: Home) | Platform KPI totals | admin | dashboard | none | none | none |
| `/admin/books` | Books | Catalog list | admin | list | none | `publishingStatus`, `offset` | none |
| `/admin/books/:bookId` | Book | Review, metadata edit, rejection history | admin | detail + form | `bookId` positive integer | none on the page itself | Confirm dialogs; reject dialog |
| `/admin/users` | — | Redirect to `/admin/users/members` | admin | redirect | none | none | none |
| `/admin/users/admins` | Admins | Staff account list | admin | list | none | `email`, `offset` | Invite-admin dialog |
| `/admin/users/members` | Members | Reader and publisher list | admin | list | none | `email`, `offset` | none |
| `/admin/users/:userId` | User | Account, role, subscription, reading progress; books tab if publisher | admin | detail + form | `userId` positive integer | `section` = `books` only when the user is a publisher. Profile is the default and clears `section`. Book filters on the Books tab reuse `publishingStatus` and `offset`. | Confirm delete dialog |
| `/admin/invitations` | Invitations | Pending admin invitations | admin | list | none | `offset` | Invite-admin dialog |
| `/admin/plans` | Plans | Stripe-backed plan catalog | admin | list | none | `offset` | Create dialog; per-row edit dialog |
| `/admin/subscriptions` | Subscriptions | Subscription list | admin | list | none | `status`, `userId`, `offset` | none |
| `/admin/subscriptions/:subscriptionId` | Subscription | Period dates, cancel, refund | admin | detail | `subscriptionId` positive integer | none | Confirm dialogs |
| `/admin/collections` | Collections | Curated collection list | admin | list | none | `offset` | Create dialog, then navigates to detail |
| `/admin/collections/:collectionId` | Collection | Cover, title, membership, order, delete | admin | detail | `collectionId` positive integer | none verified on this page | Edit dialog; add-book dialog; remove confirm; cover file input |
| `/admin/categories` | Categories | Create, rename, weight | admin | list | none | `offset` | Create dialog; per-row rename dialog; inline weight form |
| `/admin/settings` | Settings | Reader-app legal, about, and sign-in media URLs | admin | settings form | none | none | none |
| `/admin/revenue` | Revenue periods | Period list, open current month, create | admin | list | none | `offset` | Create dialog, then navigates to detail |
| `/admin/revenue/:revenuePeriodId` | Revenue period | Pool, close, engagement, shares, earnings, analytics | admin | detail + report | `revenuePeriodId` positive integer | `tab` = `earnings` (default) or `analytics`; `ownerId`; `offset` | Confirm dialogs for close and calculate |
| `/admin/revenue/:revenuePeriodId/books/:bookId/heatmap` | Heatmap | Layout-aware engagement cells for one book in one period | admin | report | `revenuePeriodId`, `bookId` positive integers | none | none |
| `/admin/audit` | Audit log | Read-only admin action history | admin | list | none | `actorUserId`, `action`, `subjectType`, `subjectId`, `offset` | none |
| `/admin/audit/:auditLogId` | Audit entry | Actor, action, subject, reason, metadata | admin | detail | `auditLogId` positive integer | none | none |

**Related route outside the admin shell (Verified):**

| Route | Screen | Purpose | Access | Type |
| --- | --- | --- | --- | --- |
| `/accept-admin-invitation` | Accept admin invitation | Public page. Token query creates or upgrades an account to admin. | Public. Token required. | form |

`/login` and `/register` are shared auth pages, not admin screens. `/register` creates a reader account. Admin accounts are created by invitation, not by the register form.

Invalid numeric ids on detail routes render an error state on that page. They do not redirect.

**Counts (Verified):**

- 19 admin screens inside the shell.
- 1 redirect (`/admin/users`).
- 1 public invitation-accept screen used by the admin workflow.
- Detail, heatmap, and invitation-accept screens are not sidebar items.

---

## 3. Navigation

**Verified** from `admin-nav-items.ts` and `admin-shell.tsx`.

```text
Admin
├── Home                         /admin
├── Books                        /admin/books
│   └── Book detail              /admin/books/:bookId          (not in sidebar)
├── Users                        (collapsible group)
│   ├── Admins                   /admin/users/admins
│   └── Members                  /admin/users/members
│       └── User detail          /admin/users/:userId          (not in sidebar)
├── Invitations                  /admin/invitations
├── Plans                        /admin/plans
├── Subscriptions                /admin/subscriptions
│   └── Subscription detail      /admin/subscriptions/:subscriptionId
├── Collections                  /admin/collections
│   └── Collection detail        /admin/collections/:collectionId
├── Categories                   /admin/categories
├── Settings                     /admin/settings
├── Revenue                      /admin/revenue
│   ├── Revenue period           /admin/revenue/:revenuePeriodId
│   └── Book heatmap             /admin/revenue/:revenuePeriodId/books/:bookId/heatmap
└── Audit                        /admin/audit
    └── Audit entry              /admin/audit/:auditLogId
```

Public, outside the shell:

```text
Accept admin invitation          /accept-admin-invitation?token=...
```

**Sidebar.** Fixed left column from the `md` breakpoint up (`w-64`). Below `md`, a menu button opens a left drawer with the same nav. Home uses an exact active match. Other links use React Router active matching. The Users group is expanded on first render when the current path starts with a child path. The group button toggles open/closed. Active child links use the sidebar accent style.

**Top bar.** Logo, the word “Admin” (hidden below `md`), signed-in email (hidden below `sm`, truncated), and Sign out. No second navigation, no search in the header, no breadcrumbs.

**Back navigation.** Detail pages expose an outline button:

- Book → Books
- User → Admins if role is `admin`, otherwise Members
- Subscription → Subscriptions
- Collection → Collections
- Revenue period → Revenue periods
- Heatmap → that period
- Audit entry → Audit log

**Contextual links (Verified):**

- Book owner email → user detail
- User subscription card → subscription detail
- Subscription user → user detail
- Collection membership book → book detail
- Earnings row book → book detail; owner → user detail; heatmap link → heatmap
- Analytics row book → book detail; heatmap link → heatmap
- Audit actor → user detail; known subject types link to book, user, subscription, collection, or revenue period
- Invitation “invited by” → user detail
- Rejection-history actor → user detail; View → audit entry
- Home KPI buttons → users or books. The reading-minutes card links to `/admin/revenue-periods`, which is not a registered route. See section 19.

There is no Authors, Publishers, Payments, or Reports item in the sidebar. Those concepts appear only as fields inside users, books, subscriptions, or revenue.

---

## 4. Capability inventory

Every admin API below requires role `admin` on the backend. Frontend disable rules are UX hints. The API remains the authority.

Page size for lists is 20 (`ADMIN_LIST_PAGE_SIZE`). **Verified:** no admin list exposes a sort control. Revenue periods are returned newest first by the API. Other list orders were not re-verified beyond “as returned.”

### Home

| Action | Where | Trigger | API | Success | Error | Permission |
| --- | --- | --- | --- | --- | --- | --- |
| View KPI totals | `/admin` | Page load | `GET /admin/dashboard/summary` | Six cards | Per-card error with retry | admin |
| Open users / books | KPI buttons | Click | none | Navigation | The reading-minutes target path is not a route | admin |

### Users

| Action | Where | Trigger | Fields | Confirm | API | Success | Error |
| --- | --- | --- | --- | --- | --- | --- | --- |
| List admins | `/admin/users/admins` | Load | query `role=admin` | no | `GET /admin/users` | Table | Error + retry |
| List members | `/admin/users/members` | Load | query `excludeRole=admin` | no | `GET /admin/users` | Table | Error + retry |
| Exact email filter | Both lists | Apply | Complete email, or blank to clear | no | `email` query | Resets offset to 0 | Client message if email is incomplete |
| Paginate | Both lists | Pagination | `offset` | no | `limit=20` | Next page | Error + retry |
| Open user | Row | Open | — | no | then `GET /admin/users/:id` | Detail | 404 copy if missing |
| Change role and publisher | User detail form | Save user | `role`, `isPublisher` | no | `PATCH /admin/users/:id` | “User saved.” | Field and root errors |
| Soft-delete user | Danger zone | Delete | — | “Delete this user?” | `DELETE /admin/users/:id` | Navigates to `/admin/users` (which redirects to Members) | Dialog shows API message |
| Invite admin | Admins header and Invitations header | Invite admin | `email` | no | `POST /admin/invitations` | Dialog shows accept URL once | API error in dialog |

**Verified backend rules for update and delete:**

- An admin cannot update or delete their own account (`UserSelfManagementException`).
- Role `admin` cannot be granted from this form. Invitation is required (`UserAdminInviteRequiredException`).
- The last remaining admin cannot be demoted or deleted (`UserLastAdminException`).
- Reader cannot have publisher capability. Author is always a publisher. Admin publisher capability can be toggled.
- Turning publisher on for a reader promotes them to author. Turning it off for an author demotes them to reader.
- Role change writes `user_role_changed`. Publisher toggle writes `publisher_enabled` or `publisher_disabled`. Delete writes `user_deleted`.

Frontend disables update and delete for self. It disables delete and leaving the admin role when the loaded admin count is 1. The admin count request uses `role=admin` and `ADMIN_COUNT_LIST_LIMIT`.

### Invitations

| Action | Trigger | Fields | API | Success | Error |
| --- | --- | --- | --- | --- | --- |
| List pending unexpired invitations | Page load | `offset` | `GET /admin/invitations` | Table: email, status, expires, invited by | Error + retry |
| Create invitation | Dialog | Email | `POST /admin/invitations` | Email is sent. Accept URL is shown once and must be copied before close. | API error |
| Accept invitation | Public page | Token from query, password, display name as implemented on that page | Auth accept endpoint, not an admin-guarded route | Account becomes admin | Invalid, expired, already accepted, already admin |

**Verified:** invitations expire after 7 days (`ADMIN_INVITATION_WINDOW.days`). The list query used by the admin page returns pending invitations whose `expiresAt` is still in the future. There is no revoke or resend action in the admin UI.

### Books

| Action | Where | Trigger | Required input | Confirm | API | Success | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| List | Books, and publisher Books tab | Load | optional `publishingStatus`, `ownerId` on the user tab, `offset` | no | `GET /admin/books` | Table | No title search |
| Filter publishing status | Status select | Change | `pending`, `in_review`, `approved`, `rejected`, or all | no | query param | Resets offset | — |
| Open | Row | Open | — | no | `GET /admin/books/:id` | Detail | 404 copy if missing |
| Edit metadata | Metadata form | Submit | title, description, bookType, categoryIds | no | `PATCH /admin/books/:id` | Saved alert | Does not change publishing status |
| Approve | Review actions | Approve | none | Yes | `POST /admin/books/:id/approve` | Status becomes approved and `publishedAt` is set to now | Only while `in_review` and processing `ready` |
| Reject | Review actions | Reject dialog | Non-empty reason | The dialog is the confirmation | `POST /admin/books/:id/reject` | Status becomes rejected. Reason is stored on the `book_rejected` audit row | Only while `in_review` |
| Unpublish | Review actions | Unpublish | none | Yes | `POST /admin/books/:id/unpublish` | Status stays approved. `publishedAt` cleared. Book leaves the reader catalog | Only when approved and `publishedAt` is set |
| Republish | Review actions | Republish | none | Yes | `POST /admin/books/:id/republish` | `publishedAt` set to now. Does not return the book to review | Approved, unpublished, processing `ready` |
| Soft-delete | Review actions | Delete | none | Yes | `DELETE /admin/books/:id` | Leaves the admin list. Navigates to Books | Always offered in the UI |
| View rejection history | Detail | Load | `offset` | no | `GET /admin/books/:id/rejection-history` | Table of `book_rejected` rows | Read-only |

**Verified publishing transitions** (`BOOK_PUBLISHING_TRANSITIONS`):

- `pending` → `in_review` (author submit; not an admin button)
- `in_review` → `approved` or `rejected`
- `rejected` → `in_review` (author resubmit; not an admin button)
- `approved` has no further status transition. Unpublish and republish change `publishedAt` only.

Admin cannot create a book, upload a source file, upload a cover, or change `layoutType` or `processingStatus` from these screens. Those belong to the author book flow.

### Categories

| Action | Trigger | Fields | Confirm | API | Notes |
| --- | --- | --- | --- | --- | --- |
| List | Page load | `offset` | no | `GET /admin/categories` | No search |
| Create | Create dialog | name required; slug optional; categoryWeight optional positive number | no | `POST /admin/categories` | Blank slug and weight are omitted so the server applies defaults |
| Rename | Row dialog | name | no | `PATCH /admin/categories/:id` | Copy on the page says rename does not change weight |
| Edit weight | Inline form | categoryWeight | no | `PATCH /admin/categories/:id` | Page says historical payouts are not rewritten until a revenue period is recalculated |
| Delete | — | — | — | No admin delete endpoint was found | Page states delete is not available |

`GET /admin/categories/:id` exists on the controller. The admin UI does not have a category detail route.

### Plans

| Action | Trigger | Fields | API | Notes |
| --- | --- | --- | --- | --- |
| List | Page load | `offset` | `GET /admin/plans` | Admin responses include Stripe price id, amount, currency |
| Create paid plan | Create dialog | name, description, stripePriceId | `POST /admin/plans` | UI text says Products and Prices are created in Stripe first. Free plan is local and is not created by this dialog |
| Edit | Row dialog | name, description, stripePriceId | `PATCH /admin/plans/:id` | Kind is displayed, not edited in the table flow |
| Delete | — | — | No delete endpoint on the admin plan controller | — |

`GET /admin/plans/:id` exists. There is no plan detail route.

### Subscriptions

| Action | Trigger | API | Confirm | Behavior |
| --- | --- | --- | --- | --- |
| List | Load | `GET /admin/subscriptions` | no | Filters: status `active` or `canceled`, positive user id, offset |
| Open | Open | `GET /admin/subscriptions/:id` | no | Detail |
| Cancel without refund | Billing actions | `POST /admin/subscriptions/:id/cancel` | Yes | UI says access lasts until `currentPeriodEnd`. Disabled when status is already `canceled` |
| Refund | Billing actions | `POST /admin/subscriptions/:id/refund` | Yes | Same 7-day window as the reader refund, measured from `activatedAt`, falling back to `currentPeriodStart`. On success, `currentPeriodEnd` is set to now. Disabled in the UI for canceled subscriptions and when plan kind is `free`. Backend still rejects ineligible refunds |

There is no admin action to start a trial, change plan, record a payment, or view an invoice. Stripe customer and subscription ids exist on the subscription model and are not shown on the admin detail summary.

### Collections

| Action | Trigger | API | Confirm | Notes |
| --- | --- | --- | --- | --- |
| List | Load | `GET /admin/collections` | no | Columns: cover, title, book count, Open |
| Create | Dialog | `POST /admin/collections` | no | Title required. Description optional. Navigates to the new detail |
| Edit title and description | Header dialog | `PATCH /admin/collections/:id` | no | — |
| Upload cover | Cover form | `POST /admin/collections/:id/cover` multipart field `file` | no | jpg, jpeg, png, webp. Max 10,485,760 bytes on the client constant |
| Clear cover | Cover form | `DELETE /admin/collections/:id/cover` | **Unknown** whether a confirm dialog is required; the clear control exists | — |
| Add book | Dialog | `POST /admin/collections/:id/books` | no | Book id |
| Remove book | Row | `DELETE /admin/collections/:id/books/:bookId` | Yes. Book stays in the catalog | — |
| Reorder | Move controls | `POST /admin/collections/:id/reorder` | no | Skipped when order did not change |
| Soft-delete collection | Danger zone | `DELETE /admin/collections/:id` | Yes. Membership is removed with the collection | Navigates to the list |

Unpublished books remain visible in admin membership. Reader collection results hide them. That split is stated in the collection detail UI.

### Settings

| Action | Fields | API | Success |
| --- | --- | --- | --- |
| Load | — | `GET /admin/platform-settings` | Form |
| Save | privacyPolicyUrl, termsOfServiceUrl, aboutMission, authCoverMediaUrl | `PATCH /admin/platform-settings` | “Settings saved.” Blank URL hides that destination |

Stored keys: `privacy_policy_url`, `terms_of_service_url`, `about_mission`, `auth_cover_media_url`. URL max length 2048. About mission max length 2000. Empty mission clears the copy. Omitted fields are unchanged.

### Revenue

| Action | Trigger | API | Confirm | Notes |
| --- | --- | --- | --- | --- |
| List periods | Load | `GET /admin/revenue-periods` | no | Newest first. Columns: startsAt, endsAt, status, platformCutPercent, pool, Open |
| Open current UTC month | Header button | `POST /admin/revenue-periods/current` | no | Creates the period if missing |
| Create period | Dialog | `POST /admin/revenue-periods` | no | startsAt, endsAt, platformCutPercent, poolAmountCents. Navigates to detail |
| Update pool and cut | Pool form | `PATCH /admin/revenue-periods/:id` | no | After close, platform cut cannot change. Pool can still be updated |
| Close period | Close card | `POST /admin/revenue-periods/:id/close` | Yes | Status becomes `closed` |
| Refresh engagement | Shares card | `POST /admin/revenue-periods/:id/engagements` | no | Does not write `revenue_calculated` |
| Calculate shares | Shares card | `POST /admin/revenue-periods/:id/calculate` | Yes | Requires `poolAmountCents`. Refreshes engagement, writes shares, appends `revenue_calculated`. Recalculating is allowed and writes another audit row |
| View earnings | Earnings tab | `GET /admin/revenue-periods/:id/earnings` | no | Optional `ownerId`, paging |
| View analytics | Analytics tab | `GET /admin/revenue-periods/:id/analytics` | no | Optional `ownerId`, paging |
| Open heatmap | Row link | `GET /admin/revenue-periods/:id/books/:bookId/heatmap` | no | Read-only |

### Audit

Read-only. List filters and detail. No create, edit, or delete in the UI. The page states that metadata PATCH and category-weight PATCH are not required audit events.

### Actions not present in Admin (Verified as absent from admin UI)

Search-as-you-type, column sort, export, suspend, restore, approve user, invoice list, payment list, bookmark management, reading-session timeline, chapter-engagement view on a user, and author-earnings management. Author earnings and author analytics exist under `/author`, which is a different shell.

---

## 5. Users and accounts

There is no separate “account” entity. A user row is the account.

### Lists

**Admins** (`/admin/users/admins`): email, publisher yes/no, last session, created, Open.

**Members** (`/admin/users/members`): email, role, publisher yes/no, plan name plus Paid/Free badge, created, Open.

Last session is the latest sign-in or session refresh. Null when the account has never signed in. The members table does not show last session. The admins table does not show plan or role (role is implied by the page).

Exact email match only. Incomplete text is rejected in the form and is not sent. No role filter beyond the page split. The list API also accepts `isPublisher`. The admin lists do not send it.

`displayName` is on `UserResponse`. Neither list renders it.

### User detail — fields the screen renders

The screen loads `GET /admin/users/:id` (`GetAdminUserDetailResponseDto`).

#### Identity / Account

Rendered:

- Email (page title and Account card)
- User id
- Created
- Updated

Returned by `UserResponse` and **not rendered** on the Account card:

- `displayName`

Not present on the admin user response: password, password hash, refresh tokens.

#### Role / Permissions

Rendered:

- Role badge
- Publisher yes/no
- Role and publisher form

Roles in code: `reader`, `author`, `admin`.

Publisher rules enforced by the backend and mirrored in the form:

- Reader is never a publisher.
- Author is always a publisher.
- Admin may or may not be a publisher. The checkbox is editable only when the selected role is admin.
- Admin cannot be granted from this form.

There is no permission matrix. Access to this dashboard is the single role `admin`.

#### Subscription

Rendered when a subscription row exists:

- Plan name, or `Plan #{planId}` if the name is missing
- Access badge from `readingAccessState`: Free, Trial, or Paid
- Status badge
- Started
- If the API returns a bounded period: elapsed percent bar, remaining time, period end
- If not bounded: “No expiration”
- Link to subscription detail

Rendered when no subscription row exists: “No subscription record is stored for this user.”

`subscriptionPeriod` fields returned: `periodStartedAt`, `periodEndsAt`, `remainingMs`, `elapsedPercent`. The card uses remaining time, elapsed percent, and end. It does not label `periodStartedAt` separately.

The period helper uses the paid window when access is paid, the trial window when access is trial, and an already-ended paid or trial window for display when access is free. Null remaining time means no expiration.

The user card does not render `trialEligible`, `trialStartedAt`, `trialEndsAt`, `canceledAt`, `activatedAt`, `currentPeriodStart`, or Stripe ids. Some of those appear on subscription detail instead.

#### Access / Entitlement

The user screen displays `readingAccessState`. It does not recompute entitlement. The rules that produce that state are in section 9.

#### Reading Progress

Rendered per saved progress row, most recently read first:

- Cover
- Book title
- Author name when `book.authorName` is a non-empty string
- Progress bar from `contentProgressPercent`
- Location label when present
- Active reading duration when `activeDurationMs` is greater than 0
- Relative “Last read” from `lastSessionAt`

Empty: “No reading activity.”

Returned on each item and **not rendered**:

- `layoutType`
- `spineIndex`
- `scrollOffset`
- `spreadIndex`
- `pageNumber`

#### Engagement

The only engagement number on this screen is `activeDurationMs`: the sum of stored reading-session `activeDurationMs` for that user and book. Chapter engagement, visual scene time, bookmarks, and collections are not on this screen.

#### Activity

Last session is on the admins list only. User detail shows account updated time and per-book last read. There is no login history, device list, or session table.

#### Administrative actions

- Save role and publisher
- Soft-delete, with the self and last-admin disables described above
- If `isPublisher` is true, a Books tab lists that owner’s books, including unpublished and in-progress books, with the same publishing-status filter as the catalog

Non-publishers do not get the Books tab.

---

## 6. Books and content

### List

Columns: cover, title, publishing status, processing status, layout, type, owner (link), category chips, published time or “Not in catalog”, Open.

Filter: publishing status. No text search. No layout or type filter. No sort control.

### Detail — rendered

Catalog card:

- Cover
- Publishing status
- Processing status
- Layout (`layoutType`)
- Type (`bookType`)
- Owner (account email or owner id, not the EPUB author string)
- Category names
- Published at, or “Not in catalog”
- Book id

Metadata form:

- Title
- Description
- Book type: `standard_chapter`, `picture_book`, `illustrated_chapter`
- Category multi-select. Options come from `GET /admin/categories` with `ADMIN_CATEGORY_LOOKUP_LIMIT`, merged with categories already on the book

Rejection history: when, actor, reason, link to the audit entry. Paged.

Review actions: Approve, Reject, Unpublish, Republish, Delete. Disabled reasons are tooltips. Delete stays available.

### Returned on `BookResponse` and not shown on the catalog card

- `description` (it is in the edit form)
- `authorName` (EPUB creator). Shown on the user reading-progress row, not on the book detail card
- `publisherName` (EPUB publisher)
- `createdAt`, `updatedAt` from the base model response. The edit form remounts on `updatedAt`, so the field is consumed, but it is not labeled on the catalog card

### What admin cannot do on a book

**Verified:** no admin UI for creating a book, uploading source EPUB, uploading preview image, uploading promo video, editing chapters, editing pages, editing spreads, setting layout type, or setting processing status.

Layout type is detected from the EPUB and stays null until processing completes.

### Book type versus layout type

**Verified enums:**

| Concept | Values | Who sets it | Admin effect found |
| --- | --- | --- | --- |
| `bookType` | `standard_chapter`, `picture_book`, `illustrated_chapter` | Author at create; admin can edit | Catalog label and metadata only. No branch in admin screens changes layout, heatmap, or entitlement based on book type |
| `layoutType` | `reflowable`, `fixed_layout`, or null | Processing | Progress math, engagement buckets, and heatmap shape |

**Unknown:** a product definition that makes picture books behave differently from illustrated chapter books inside admin. The processing code searched does not branch on `BookType` for admin behavior. Behavioral differences that do exist are keyed off `layoutType`.

### Reflowable versus fixed layout, as it affects Admin

**Reflowable**

- Progress percent uses chapter text length and spine index, not page count (`resolveReflowableContentProgressPercent`).
- Location label is the chapter title, or `Chapter {spineIndex + 1}`.
- Revenue engagement stores `activeReadingMs`. Spread time and visual scene time are stored as 0 for that signal.
- Heatmap renders chapter cells: spine index, title, `activeDurationMs`, intensity bar.

**Fixed layout**

- Progress percent uses page number divided by page count when pages exist; otherwise `(spreadIndex + 1) / spreadCount` (`resolveFixedLayoutProgressPercent`).
- Location label is `Page n of N`, or a spread label.
- Revenue engagement stores `activeSpreadMs` from active duration and stores `visualSceneTimeMs` separately. Weighted minutes use active duration, not visual scene time.
- Heatmap renders spread cells: spread index, page number, `activeDurationMs`, `visualSceneTimeMs` labeled “Not paid”, intensity bar.

If heatmap `layoutType` is neither, the screen shows an empty state and does not invent cells.

### Publishing and visibility

Catalog visibility for readers is an approved book with `publishedAt` set. Admin lists include every non-deleted book regardless of status. Processing statuses in the enum: `not_started`, `processing`, `ready`, `failed`. Approve and republish require `ready`.

---

## 7. Authors and publishers

**Verified:** Admin has no Author directory and no Publisher directory.

Two different “author” ideas exist:

1. **Publisher account.** `User.isPublisher`. Author role is always a publisher. An admin may also be a publisher. Admin sees this on user lists and user detail, and can change it with the rules in section 5. Books owned by that user appear on the user Books tab (`ownerId`). Earnings rows link to `ownerId`.
2. **Catalog author name.** `Book.authorName` from EPUB source metadata (`creator`). It is not an account. Admin book detail does not show it. User reading progress does, when the string is present. Admin cannot edit it in the metadata form.

**Catalog publisher name** (`Book.publisherName` from EPUB metadata) is the same kind of display string. It is not the publisher account. The book detail card does not render it.

**Revenue and engagement for a publisher** are visible on a revenue period, filtered by owner id, not on a dedicated author profile:

- Earnings: weighted engagement, pool share cents, platform cut cents, author cents
- Analytics: active reading ms, active spread ms, visual scene time ms, category weight, weighted engagement
- Heatmap per book

The Author shell (`/author`) has books, analytics, heatmap, and earnings for the signed-in publisher. That shell is not the Admin Dashboard. An admin who is also a publisher is not given those author screens by the admin route guard; a non-admin who hits `/admin` can be sent to author home.

**Not exposed on any admin screen:** a publisher profile bio, a list of all publishers as its own page, payout account details, or a per-author lifetime earnings page. Publisher count exists only as a Home KPI.

---

## 8. Categories

**Verified model `Category`:** id, name, unique slug, `categoryWeight` decimal default 1.0000, timestamps, soft-delete column, many-to-many with books.

Admin can list, create, rename, and change weight. Admin cannot delete, reorder categories, or open a category detail page. There is no book-count column.

**Weight and money (Verified in monetization code):**

When engagement is aggregated for a book, `categoryWeight` stored on `BookEngagement` is the average of the book’s category weights. If the book has no categories, the code uses `DEFAULT_CATEGORY_WEIGHT`.

Weighted engagement minutes:

```text
(engagementMs / 60000) * categoryWeight
```

`engagementMs` is active reading time for reflowable books and active spread time for fixed-layout books. Visual scene time is stored and displayed and is excluded from the weighted minutes.

Calculate then splits the pool using those weights: platform cut is a percent of the pool; the remainder is allocated to authors by weight; the platform-cut cents are also allocated by the same weights onto each book row. `poolShareCents` is `authorCents + platformCutCents`.

The categories page states that changing a weight does not rewrite historical payouts until that revenue period is recalculated.

**Discovery:** categories are attached to books and returned on book responses. How reader discovery ranks categories was not traced for this admin inventory. Admin does not configure a separate discovery order.

---

## 9. Subscriptions, payments, and access

### Plans

Kinds: `free`, `monthly_paid`. Interval on paid plans: `month`.

Admin registers a paid plan with a Stripe price id. Amount and currency on the list come from the backend plan record. The UI tells the operator to create the Stripe Product and Price elsewhere first.

The free plan is described as a local plan without a card. The create dialog does not create it.

### Subscription record

One subscription row per user (`userId` unique). Status: `active` or `canceled`.

Fields on the model: plan, status, startedAt, currentPeriodStart, currentPeriodEnd, canceledAt, activatedAt, trialStartedAt, trialEndsAt, stripeCustomerId, stripeSubscriptionId.

### What full-book access means

**Verified** in `EntitlementService` and helpers. Clients must not invent this. Admin UI displays `readingAccessState` and does not recompute it.

`hasFullBookReadingAccess(userId)` loads the user’s subscription and returns true when either paid entitlement or trial entitlement is true.

**Paid entitlement** (`hasPaidReadingEntitlement`):

- Subscription exists
- Plan kind is `monthly_paid`
- `currentPeriodEnd` is not null
- Now is strictly before `currentPeriodEnd`

A free plan is never paid entitlement. A canceled paid subscription stays entitled until `currentPeriodEnd`. Status `canceled` alone does not remove access before that instant.

**Trial entitlement** (`hasTrialReadingEntitlement`):

- `trialStartedAt` and `trialEndsAt` are both set
- Now is strictly before `trialEndsAt`

Paid is checked first. If paid is true, reading access state is `paid` even if a trial window also exists.

**Reading access state:**

- `paid` when paid entitlement is true
- otherwise `trial` when trial entitlement is true
- otherwise `free`

**Trial eligible** (`isTrialEligible`): true when there is no subscription, or when the user is not currently paid and `trialStartedAt` is null. One trial start is represented by `trialStartedAt` being set. Admin cannot start a trial from the dashboard.

`assertCanAccessFullBook` also requires the book to be a catalog book (`getCatalogBookById`) and then the same full-book access check. Preview versus full-book access beyond that assertion was not re-traced for this document.

### Cancel and refund

**Cancel:** sets the subscription canceled and does not refund. UI copy says access continues until `currentPeriodEnd`.

**Refund:** allowed only for an active monthly paid subscription with a Stripe subscription id, and only while now is within 7 days after `activatedAt` (or `currentPeriodStart` if `activatedAt` is null). Window length is `REFUND_WINDOW.days = 7`. After the window, the API raises `REFUND_WINDOW_EXPIRED`. If the subscription is not a paid monthly Stripe subscription, it raises `REFUND_NOT_ELIGIBLE`. A successful refund cancels the subscription and sets `currentPeriodEnd` to now.

Stripe webhook handling exists at `POST /webhooks/stripe`. It is not an admin screen. `subscription_payment_failed` is an audit action. No admin payments or invoices page was found.

---

## 10. Reading, progress, and engagement

### Metric: content progress percent

- **Source:** `ReadingProgress` plus processed chapters, pages, and spreads, assembled in `buildAdminUserReadingProgressItems`.
- **Calculation:** reflowable: floor of completed chapter text length over total chapter text length, using spine index. If total text length is 0, floor of spine index over chapter count. Fixed layout: floor of page number over page count, else floor of `(spreadIndex + 1) / spreadCount`. Missing structure yields 0.
- **Stored or calculated:** position fields are stored. Percent is calculated on the admin detail response.
- **Used by:** user detail Reading Progress card.

### Metric: location label

- **Source:** same assembly. Reflowable uses chapter title or `Chapter {n}`. Fixed layout uses page or spread wording.
- **Stored or calculated:** calculated.
- **Used by:** user detail, when non-null.

### Metric: active duration on a user and book

- **Source:** sum of `ReadingSession.activeDurationMs` for that user and book.
- **Stored or calculated:** sessions store the milliseconds. The admin item sums them.
- **Used by:** user detail, shown only when greater than 0. Idle duration is stored on the session model and is not included.

### Metric: last session on a book

- **Source:** `ReadingProgress.lastSessionAt`.
- **Used by:** user detail, formatted as a relative time.

### Metric: last session on an admin account

- **Source:** latest session-token issue. Updates on sign-in and refresh. Null if the account never signed in.
- **Used by:** Admins list only.

### Metric: Home reading minutes

- **Source:** `BookEngagement` summary across periods via `summarizeOwnerEngagement` with no owner and no period filter.
- **Calculation:** `(totalActiveReadingMs + totalActiveSpreadMs) / 60000`. No extra rounding. Idle time and visual scene time are excluded (`toReadingMinutes`).
- **Stored or calculated:** engagement rows are stored. Minutes are calculated in the dashboard summary.
- **Used by:** Home “Reading minutes” card.

### Metric: period analytics

Per book engagement row, stored on `BookEngagement`: layout type, activeReadingMs, activeSpreadMs, visualSceneTimeMs, categoryWeight, weightedEngagement.

Period totals on the analytics response include totalReadingMinutes, totalWeightedEngagement, totalActiveReadingMs, totalActiveSpreadMs, totalVisualSceneTimeMs, and row count. The admin screen displays those API numbers.

### Metric: heatmap cell

- **Source:** `GET /admin/revenue-periods/:id/books/:bookId/heatmap`.
- **Reflowable cells:** spine index, chapter title, activeDurationMs.
- **Fixed-layout cells:** spread index, page number, activeDurationMs, visualSceneTimeMs.
- **Client calculation:** bar width is the cell’s active duration divided by the max active duration in the returned list (`getHeatmapBarPercent`). The durations themselves are not recomputed in the browser.
- **Paid or not:** UI labels visual scene time “Not paid”. Weighted engagement uses active duration only.

### Metric: earnings

Stored on `BookRevenue` after calculate: weightedEngagement, poolShareCents, platformCutCents, authorCents, ownerId, bookId. Admin displays them. The browser does not split the pool.

### Not shown in Admin

Reading bookmarks, individual reading sessions, idle time, offline downloads, and per-chapter engagement tables outside the revenue heatmap. Those models exist. See section 20.

---

## 11. Dashboard and analytics

The admin home is titled **Overview**. It is not a chart page. It renders six KPI cards from one request: `GET /admin/dashboard/summary`. There is no time-range filter. Totals are platform-wide and current.

| Card | Displayed value | Purpose in the UI | Source | Calculation | Drill-down |
| --- | --- | --- | --- | --- | --- |
| Users | `totalUsers` | Every non-deleted account | User list total with page size `DASHBOARD_COUNT_PAGE_SIZE` | Count of non-deleted users | Link to `/admin/users` (redirects to Members) |
| Publishers | `totalPublishers` | Accounts with publisher capability, including admin publishers | User list with `isPublisher=true` | Count | Same users link |
| Books | `totalBooks` | Every catalog record, all publishing statuses | Book list total | Count of non-deleted books | `/admin/books` |
| Published books | `publishedBooks` | Catalog-visible books only | `countCatalogVisibleBooks()` | Count of books that are catalog-visible | `/admin/books` (no status pre-filter) |
| Pending review | `pendingReviewBooks` | Books currently in review | Book list filtered to `in_review` | Count | `/admin/books` (no status pre-filter) |
| Reading minutes | `totalReadingMinutes` | Lifetime active reading plus spread time, in minutes | All-period book engagement summary | `(activeReadingMs + activeSpreadMs) / 60000` | Link target `/admin/revenue-periods` is not a route |

Each card has its own pending, empty, and error state. Empty labels are “No users yet”, “No publishers yet”, “No books yet”, “No published books yet”, “No books in review”, and “No reading minutes yet”. A zero total uses the empty label path inside `KpiCard` when `total` is 0. **Likely** from the `emptyLabel` prop; the exact `KpiCard` zero-versus-empty branch was not re-read line by line.

Values are calculated on the server at request time from stored rows. They are not stored as a dashboard snapshot table.

Period analytics and heatmaps are not on Home. They live on the revenue period screen. See section 10.

---

## 12. API mapping

All of these require `Authorization: Bearer` and role `admin`, except the public invitation accept flow.

Response names are the Nest DTO classes. Services are the classes the controllers call.

### Home

```text
Screen: Overview

GET:
  /admin/dashboard/summary
  Response: GetAdminDashboardSummaryResponseDto
  Controller: DashboardAdminController
  Service: AdminDashboardSummaryService
  Models: User, Book, BookEngagement (via engagement summary)
```

### Users

```text
Screen: Admins, Members, User detail

GET:
  /admin/users?limit&offset&role&excludeRole&email&isPublisher
  Response: GetUsersResponseDto
  Service: UserService.listManagedUsers
  Models: User, Subscription, Plan, auth session timestamp

  /admin/users/:id
  Response: GetAdminUserDetailResponseDto
  Service: UserAdminDetailService
  Models: User, Subscription, Plan, ReadingProgress, ReadingSession, Book, BookChapter, BookPage, BookSpread

PATCH:
  /admin/users/:id
  Body: role, isPublisher
  Response: UserResponse
  Service: UserService.updateManagedUser

DELETE:
  /admin/users/:id
  Response: UserResponse
  Service: UserService.deleteManagedUser
```

The members page sends `excludeRole=admin`. The admins page sends `role=admin`. User detail also calls the list endpoint to count admins before enabling demotion and delete.

### Invitations

```text
Screen: Invitations

GET:
  /admin/invitations?limit&offset
  Response: GetAdminInvitationsResponseDto
  Controller: AdminInvitationAdminController

POST:
  /admin/invitations
  Body: email
  Response: create response that includes the raw token once
  Service: AdminInvitationService
  Model: AdminInvitation
```

Accept is a public auth route, not under `/admin`. Path constant: `/accept-admin-invitation`.

### Books

```text
Screen: Books, Book detail, publisher Books tab

GET:
  /admin/books?limit&offset&publishingStatus&ownerId
  Response: GetBooksResponseDto (BookResponse[])
  Service: BookService.listBooks, covers via BookCatalogCoverService

  /admin/books/:id
  Response: BookResponse

  /admin/books/:id/rejection-history?limit&offset
  Response: GetBookRejectionHistoryResponseDto
  Model: AuditLog where action is book_rejected

PATCH:
  /admin/books/:id
  Body: title, description, bookType, categoryIds
  Response: BookResponse
  Service: BookService.updateBook

POST:
  /admin/books/:id/approve
  /admin/books/:id/reject   body: reason
  /admin/books/:id/unpublish
  /admin/books/:id/republish
  Service: BookPublishingStatusService

DELETE:
  /admin/books/:id
  Service: BookService.deleteBook
```

Book detail also calls `GET /admin/categories` to fill the category control.

### Categories

```text
Screen: Categories

GET:
  /admin/categories?limit&offset
  Also GET /admin/categories/:id exists and is unused by the UI

POST:
  /admin/categories
  Body: name, optional slug, optional categoryWeight

PATCH:
  /admin/categories/:id
  Body: name and/or categoryWeight

Controller: CategoryAdminController
Model: Category
```

### Plans

```text
Screen: Plans

GET:
  /admin/plans?limit&offset&kind
  UI sends limit and offset only
  GET /admin/plans/:id exists and has no admin screen

POST:
  /admin/plans
  Body: name, description, kind, slug, stripePriceId
  The create dialog collects name, description, and stripePriceId. Kind and slug are supplied by the client builder. The exact builder was not re-opened; the controller requires them on CreatePlanRequestDto.

PATCH:
  /admin/plans/:id
  Body: name, description, optional stripePriceId

Controller: PlanAdminController
Service: PlanService
Model: Plan
```

**Likely:** create always registers a monthly paid plan, because the page copy says paid Stripe plans and the form has no kind selector. Confirm in `build` helper before treating kind as user-editable.

### Subscriptions

```text
Screen: Subscriptions, Subscription detail

GET:
  /admin/subscriptions?limit&offset&userId&status
  Response: GetSubscriptionsResponseDto

  /admin/subscriptions/:id
  Response: SubscriptionResponse

POST:
  /admin/subscriptions/:id/cancel
  /admin/subscriptions/:id/refund

Controller: SubscriptionAdminController
Services: SubscriptionService, SubscriptionBillingService
Models: Subscription, Plan, User
Stripe: refund path calls Stripe. No card data is shown.
```

### Collections

```text
Screen: Collections, Collection detail

GET:
  /admin/collections?limit&offset
  /admin/collections/:id
  Detail also GET /admin/books?limit=ADMIN_COLLECTION_BOOK_LOOKUP_LIMIT for the add-book lookup

POST:
  /admin/collections
  /admin/collections/:id/cover          multipart file
  /admin/collections/:id/books          body includes book id
  /admin/collections/:id/reorder

PATCH:
  /admin/collections/:id                title, description

DELETE:
  /admin/collections/:id
  /admin/collections/:id/cover
  /admin/collections/:id/books/:bookId

Controller: CollectionAdminController
Models: Collection, CollectionBook, Book
```

### Settings

```text
Screen: Settings

GET:
  /admin/platform-settings
  Response: PlatformSettingsResponse

PATCH:
  /admin/platform-settings
  Body: privacyPolicyUrl, termsOfServiceUrl, aboutMission, authCoverMediaUrl
  Omitted fields stay unchanged

Controller: PlatformSettingAdminController
Model: PlatformSetting (key/value rows)
```

### Revenue

```text
Screen: Revenue periods, Revenue period, Heatmap

GET:
  /admin/revenue-periods?limit&offset
  /admin/revenue-periods/:id
  /admin/revenue-periods/:id/earnings?limit&offset&ownerId
  /admin/revenue-periods/:id/analytics?limit&offset&ownerId
  /admin/revenue-periods/:id/books/:bookId/heatmap

POST:
  /admin/revenue-periods
  /admin/revenue-periods/current
  /admin/revenue-periods/:id/close
  /admin/revenue-periods/:id/engagements
  /admin/revenue-periods/:id/calculate

PATCH:
  /admin/revenue-periods/:id
  Body: platformCutPercent, poolAmountCents, subject to close rules

Controller: MonetizationAdminController
Services: RevenuePeriodService, AdminAnalyticsService, and the engagement and revenue services they call
Models: RevenuePeriod, BookEngagement, BookRevenue, Book, User
```

### Audit

```text
Screen: Audit log, Audit entry

GET:
  /admin/audit-logs?limit&offset&actorUserId&action&subjectType&subjectId
  /admin/audit-logs/:id

Controller: AuditAdminController
Model: AuditLog
```

No POST, PATCH, or DELETE.

---

## 13. Data models used by Admin

Admin can modify a model only through the actions in section 4. Soft-delete is a `deletedAt` timestamp, not a hard delete, wherever the UI says soft-delete.

| Model | Purpose | Important fields | Admin screens | Admin can modify |
| --- | --- | --- | --- | --- |
| User | Account | email, displayName, role, isPublisher, deletedAt | Users, detail, links from books, subscriptions, audit, earnings | Role, publisher flag, soft-delete. Not email, display name, or password |
| AdminInvitation | Staff invite | email, token hash, status, expiresAt, invitedByUserId, acceptedAt | Invitations | Create only |
| Book | Catalog record | title, description, layoutType, bookType, publishingStatus, processingStatus, publishedAt, ownerId, authorName, publisherName | Books, detail, collection membership, earnings, analytics | Metadata, publishing visibility, soft-delete. Not files or layout |
| Category | Taxonomy and payout weight | name, slug, categoryWeight | Categories, book form | Create, rename, weight. No delete in admin API |
| Book (categories relation) | Book classification | many-to-many | Book metadata form | Replace category ids |
| Plan | Subscription catalog | slug, name, description, kind, interval, stripePriceId, amountCents, currency | Plans, user plan badge, subscription | Create paid plan, edit display fields and Stripe price id |
| Subscription | One row per user | status, period dates, trial dates, Stripe ids | Subscriptions, user detail | Cancel, refund |
| Collection | Curated list | title, description, cover storage fields | Collections | Create, edit, cover, soft-delete |
| CollectionBook | Membership | bookId, displayOrder | Collection detail | Add, remove, reorder |
| PlatformSetting | Reader-app copy and URLs | key, value | Settings | Update the four known keys |
| RevenuePeriod | Payout window | startsAt, endsAt, status, platformCutPercent, poolAmountCents | Revenue | Create, ensure current month, edit pool and cut, close |
| BookEngagement | Period reading totals per book | activeReadingMs, activeSpreadMs, visualSceneTimeMs, categoryWeight, weightedEngagement | Revenue analytics and heatmap inputs | Written by refresh engagement and by calculate. Not hand-edited |
| BookRevenue | Period money per book | weightedEngagement, poolShareCents, platformCutCents, authorCents, ownerId | Revenue earnings | Written by calculate. Not hand-edited |
| AuditLog | Append-only admin history | actor, action, subject, reason, metadata | Audit, book rejection history | Inserted by other admin actions. Not edited in the UI |
| ReadingProgress | Resume position | layoutType, spine, scroll, spread, page, lastSessionAt | User detail, via calculated percent and label | No |
| ReadingSession | Active time | activeDurationMs, idleDurationMs | User detail sum; engagement pipeline | No |
| BookChapter, BookPage, BookSpread | Processed structure | titles, text, indexes | Used to compute progress labels and heatmap cells | No admin editor |

`BookAsset`, `BookSourceMetadata`, `ReadingBookmark`, `ReadingChapterEngagement`, `ReadingVisualEngagement`, and `OfflineDownload` support reader and author features. Admin screens do not edit them. Heatmap and engagement aggregation read the engagement tables that those pipelines fill.

---

## 14. Permissions and security

This section is an inventory, not a recommendation.

### Roles

`reader`, `author`, `admin`. Publisher capability is a boolean, not a role. Author implies publisher. Reader forbids publisher. Admin is orthogonal to publisher.

### Frontend protection

`AdminRouteGuard`:

- No access token → redirect to `/login`
- Current user loading → page skeleton
- Current user error → retry panel
- Role is not `admin` → “Admin access required”, with a link to author home when `getPostLoginPath` returns one
- Role is `admin` → `AdminShell`

After login, role `admin` goes to `/admin`. Role `author` goes to `/author`. Role `reader` has no dashboard home path from `getPostLoginPath`.

Additional UX disables: self user management, last admin, book actions by status, subscription cancel and refund by status and plan kind, revenue calculate when pool cents are missing. These are not the security boundary.

### Backend protection

Every admin controller listed in section 1 uses `JwtAuthGuard`, `RolesGuard`, and `@Roles(UserRole.ADMIN)`.

Business rules that reject otherwise authenticated admins include: self-management, last admin, granting admin without an invitation, invalid role and publisher combinations, illegal publishing transitions, processing not ready, refund window, and refund eligibility.

### Public related routes

`/login`, `/register`, and `/accept-admin-invitation` are outside the admin guard. Invitation acceptance still validates the token on the server.

### Both

Viewing and mutating admin data requires both the frontend role gate and the backend role guard. A non-admin who calls the API directly is rejected by the backend even if they bypass the React guard.

### Not found

No per-screen permission flags. No second admin role. No IP allow list in the admin UI.

---

## 15. UI states

Shared patterns, **Verified** on the list and detail pages that were read:

| State | Where |
| --- | --- |
| Loading | Route guard skeleton. Detail pages use `PageSkeleton`. Lists use table skeletons. Home KPIs have their own pending state |
| Empty | Lists, reading progress, rejection history, collection membership, earnings, analytics, heatmap cells, invitations |
| Populated | Tables and definition lists |
| Error | `ErrorState` with retry. Detail 404s use a specific missing-record message. Invalid ids use a specific invalid-id message |
| Validation error | Zod on the client, then API validation errors mapped onto fields where the form implements that mapping. User edit, book edit, category, plan, collection, revenue, settings, and invitation forms do this to different degrees |
| Success | Inline alerts such as “User saved.”, “Settings saved.”, “Weighted engagement refreshed.”, and the one-time invitation link |
| Disabled | Buttons with tooltips for illegal transitions, self/last admin, free-plan refund, missing pool |
| Permission denied | Full-page forbidden panel before the shell. Not an in-page state |
| Confirmation | User delete, book approve, unpublish, republish, delete, book reject dialog, subscription cancel, subscription refund, collection delete, collection book remove, revenue close, revenue calculate |
| Modal | Create and edit dialogs for invitation, category, plan, collection, revenue period, add collection book, reject book. Confirmations use `ConfirmDialog` |
| Drawer | Mobile navigation only. No record-detail drawer |
| Pagination | Lists and the earnings, analytics, and rejection-history tables. Offset in the query string. Page size 20 |
| Filtering | Users email; books publishing status; subscriptions status and user id; audit actor, action, subject type, subject id; revenue owner id |
| Searching | Exact email on users only. No catalog text search |

Destructive confirms that navigate away after success: user delete, book delete, collection delete.

Revenue “Refresh engagement” has no confirm dialog. It shows success or error inline.

---

## 16. Workflows

### Sign in as admin

```text
Open /login
→ submit credentials
→ current user role is admin
→ land on /admin
→ Overview loads GET /admin/dashboard/summary
```

A non-admin who opens `/admin` sees the forbidden panel.

### Invite an administrator

```text
Admins or Invitations
→ Invite admin
→ enter email
→ POST /admin/invitations
→ email is sent and the accept URL is shown once
→ invitee opens /accept-admin-invitation?token=...
→ sets credentials
→ account is created or updated to role admin
→ invitation becomes accepted
```

Pending list only shows unexpired pending invitations. There is no in-app revoke step.

### Change a member

```text
Members
→ optional exact email
→ Open
→ read account, subscription, access, reading progress
→ optional: change role or publisher and Save
→ or Delete, confirm, return to /admin/users which redirects to Members
```

If the user is a publisher, the Books tab lists their catalog with the publishing-status filter.

Demoting or deleting the signed-in admin is disabled. Demoting or deleting the last admin is disabled.

### Review a book

```text
Books
→ filter by in_review if desired
→ Open
→ read status, processing, layout, type, owner, categories
→ Approve (confirm) or Reject (reason)
→ book leaves in_review
→ rejection appears in rejection history and in Audit
```

Approve requires processing `ready`. Reject does not, in the frontend availability helper. The backend reject path checks the in-review transition and a non-empty reason. It does not check processing ready in the reject method that was read.

### Hide or restore a live book

```text
Open an approved book that has publishedAt
→ Unpublish, confirm
→ publishing status stays approved, publishedAt clears, catalog hides it
→ Republish, confirm, only if processing is still ready
→ publishedAt is set again without a new review
```

### Edit book metadata

```text
Book detail
→ Metadata form
→ change title, description, book type, categories
→ PATCH
→ publishing status unchanged
```

Author submission from `pending` or `rejected` into `in_review` happens in the author shell, not here.

### Curate a collection

```text
Collections
→ Create title
→ land on detail
→ optional cover upload or clear
→ edit title or description
→ add book by id
→ move order
→ remove book with confirm
→ or delete the collection with confirm
```

### Register a plan and manage a subscription

```text
Plans
→ Create with name, description, Stripe price id
→ Subscriptions
→ filter by status or user id
→ Open
→ Cancel without refund, or Refund inside the 7-day activation window
```

From a user, “View subscription” opens the same detail.

### Run a revenue period

```text
Revenue
→ Open current month, or Create a period
→ set pool cents and platform cut
→ optional Refresh engagement
→ Calculate shares (confirm)
→ Earnings tab and Analytics tab
→ optional owner id filter
→ Open heatmap for one book
→ Close period when platform cut should freeze
→ pool can still be edited after close
→ Calculate can be run again and writes another audit row
```

### Read audit history

```text
Audit
→ filter by actor, action, subject
→ Open
→ follow actor to the user, or subject to book, user, subscription, collection, or revenue period
```

Book detail rejection history is the same audit rows limited to `book_rejected` for that book.

---

## 17. Current UI structure

Inventory only. No visual critique.

**Shell, every admin screen:** left sidebar (or mobile drawer), top bar with logo, “Admin”, email, Sign out, then a page header (`h1`, description, optional action buttons) and a padded main region.

**Overview:** page header plus a responsive card grid. No table, no chart.

**List screens** (books, users, invitations, plans, subscriptions, collections, categories, revenue, audit): page header, sometimes an informational alert, sometimes filters, then a table inside a horizontal scroll container, then offset pagination. Empty and error replace the table.

**User detail:** page header with back button. Publishers get Profile and Books tabs. Profile stacks danger zone, account card, subscription card, reading-progress card, role form. Books tab embeds the books table.

**Book detail:** page header, then stacked cards: review actions, catalog record, rejection history, metadata form.

**Subscription detail:** page header, billing-actions card, subscription definition list. No tabs.

**Collection detail:** page header with edit dialog and back button, then cover card, membership card with its own table, danger zone.

**Categories:** page header with Create, alert, table. Weight is an inline form. Rename is a dialog. No detail page.

**Plans:** page header with Create, alert, table. Edit is a dialog. No detail page.

**Settings:** one form card with four fields.

**Revenue list:** page header with two actions, table.

**Revenue detail:** page header, shares card, close card, pool form, period summary, owner-id filter, Earnings and Analytics tabs. Each tab has a metrics card and a table. No charts. Heatmap is a separate page of stacked cells with an intensity bar, not a grid chart.

**Audit detail:** one card, definition list, metadata in a `<pre>` block.

**Dialogs:** invitation, category create, category rename, plan create, plan edit, collection create, collection edit, add collection book, reject book, and generic confirm.

**No breadcrumbs. No global search. No data-export control. No chart library usage was found on admin home.**

---

## 18. Responsive behavior

**Verified** from Tailwind classes in the admin shell, page header, tables, and a sample of filters. No custom breakpoint map was found. The classes use Tailwind defaults:

- `sm` — page header switches from stacked to row; subscription filters use two columns; several definition lists use two columns; header email becomes visible.
- `md` — sidebar is fixed and the drawer is hidden; main content is offset by `pl-64`; page padding increases from `p-4` to `p-8`; the menu button hides.
- `xl` — Overview cards use three columns. Some filters use three columns.

**Navigation:** desktop sidebar at `md` and up. Below `md`, a full-height drawer with a dimmed backdrop. Motion is skipped when the user prefers reduced motion.

**Tables:** wrapped in `overflow-x-auto`, so wide tables scroll horizontally instead of being restacked into cards.

**Modals:** dialog content uses `max-h-[90vh] overflow-y-auto` on the dialogs that were read. They are not full-screen mobile sheets.

**KPI grid:** one column, then two at `sm`, then three at `xl`.

A dedicated tablet layout, separate from `md`, was not found. A card-list alternative for tables on small screens was not found.

---

## 19. Verified inconsistencies and ambiguities

1. **Home reading-minutes drill-down is not a route.** The card links to `/admin/revenue-periods`. The revenue list route is `/admin/revenue`. That link falls through to the not-found page.

2. **User delete always returns through `/admin/users`.** That path redirects to Members, including after deleting an admin.

3. **`displayName` is on the user API and not on the admin Account card or user tables.**

4. **Reading-progress position fields are returned and not shown.** `layoutType`, `spineIndex`, `scrollOffset`, `spreadIndex`, and `pageNumber` are on `AdminUserReadingProgressItemResponse`. The card shows percent, label, active duration, and last read.

5. **Book `authorName` and `publisherName` are on `BookResponse`.** The book detail catalog card shows the owner account, not those strings. Reading progress shows `authorName` when it is a non-empty string.

6. **Subscription detail omits fields the user card shows, and the reverse.** User card shows `readingAccessState` and a derived remaining-time bar. Subscription detail shows period start, period end, canceled at, and activated at, and does not show reading access, trial dates, trial eligibility, or Stripe ids. Both responses can carry the underlying subscription.

7. **Last session is only on the Admins table.** The same list item includes it for members, and the members table does not render it. Plan is only on the Members table.

8. **Audit filter list omits `book_content_key_issued`.** That action exists on the Prisma and backend audit enums. The admin filter constant does not include it. Unfiltered audit rows can still return it if the API does. Whether the list query validator accepts that action as a filter was not re-checked against the request DTO.

9. **Two “author” meanings.** Account role `author` and EPUB `authorName` are different. The admin UI does not label that distinction on the book page.

10. **Two “publisher” meanings.** `isPublisher` is an account flag. `publisherName` is EPUB metadata. Only the account flag is managed in Admin.

11. **Book type does not drive admin behavior.** Layout type does. The three book types are editable metadata without a verified admin workflow difference.

12. **Category and plan GET-by-id exist without screens.**

13. **User list API accepts `isPublisher`.** The admin user pages do not expose that filter.

14. **Book list API accepts `ownerId`.** The books page does not offer an owner filter. The publisher Books tab sends `ownerId` without putting it in a dedicated query param; it shares `publishingStatus` and `offset` with the rest of the URL, including the user `section` param.

15. **Dashboard KPI links do not apply the matching filter.** “Pending review” and “Published books” open the unfiltered books list.

16. **Metadata edits and category-weight edits are intentionally absent from required audit events.** The audit page says so. Other admin mutations do write audit rows.

17. **Settings nav icon and label.** The sidebar label is “Settings”. The icon import is `Link2`. The page edits URLs and about copy. This is a labeling fact, not a defect verdict.

18. **Plan create body.** The controller accepts kind and slug. The dialog fields are name, description, and Stripe price id. The client builder that fills kind and slug was not opened during this pass. **Likely** a paid monthly plan. Treat the hidden fields as **Unknown** until that builder is read.

19. **Collection cover clear confirmation.** Upload and clear endpoints exist. Whether clear asks for confirmation was not confirmed in the cover form’s click handler.

---

## 20. Missing and hidden functionality

### Backend capability not exposed in Admin

**Verified** as existing in backend modules or schema, with no admin screen that performs the action:

- Create a book, upload source, preview image, promo video, or audio (`author/books` and book-asset author controller)
- Submit a book for review (author transition `pending` or `rejected` → `in_review`)
- Edit processed chapters, pages, spreads, or text layers
- Start or end a reader trial from the dashboard
- Change a user’s plan directly
- View Stripe customer id, Stripe subscription id, invoices, or payment history
- View `trialStartedAt`, `trialEndsAt`, and `trialEligible` on an admin screen (they are on `SubscriptionResponse`; the admin detail summary does not render them)
- View or edit `displayName`
- View bookmarks, session-by-session history, or idle time
- View offline downloads
- Issue or rotate book content keys (`book_content_key_issued` audit action; no admin button found)
- Delete a category or a plan
- Revoke or resend an invitation
- Export any list
- Author-facing analytics and earnings (`/author/analytics`, `/author/earnings`) as a view of someone else’s author home. Admin sees the platform-wide revenue period instead
- Reader catalog, search, billing checkout, and reading sync. Those are reader APIs

### Admin UI references a capability that could not be verified

- The Overview “Reading minutes” button targets `/admin/revenue-periods`. No router entry uses that path. **Verified** as a broken link, not as a hidden screen.
- Plan create sends kind and slug from a helper that was not opened. **Unknown** exact payload beyond the three visible fields and the controller contract.
- Collection cover clear confirmation. **Unknown.**

---

## 21. Figma design requirements

These are functional requirements. They do not prescribe layout, color, or components.

### Shell

The Admin experience must support:

- Sign-in gate and a hard stop when the signed-in role is not admin
- Persistent navigation to Home, Books, Admins, Members, Invitations, Plans, Subscriptions, Collections, Categories, Settings, Revenue, and Audit
- Sign out and the signed-in email
- A way back from every detail screen to its list
- Loading, empty, error with retry, and permission-denied outcomes
- Confirmation before every destructive or publishing action listed below

### Overview

Must show, from the server summary, without client-side invention:

- Non-deleted user count
- Publisher count, including admin publishers
- Book count across all publishing statuses
- Catalog-visible book count
- In-review book count
- Lifetime reading minutes, defined as active reading plus spread time, excluding visual scene time and idle time

Each value must be able to lead to the related admin area. Published and in-review counts must be able to arrive with that status already in context if the redesign keeps those drill-downs.

### Users

Must support separate admin and member audiences.

Member list must be able to show email, role, publisher flag, current plan name, paid versus free, and created time.

Admin list must be able to show email, publisher flag, last session, and created time.

Exact email filter and paging must remain possible.

User detail must be able to show:

- Email, user id, created, updated
- Display name if the redesign chooses to surface the field the API already returns
- Role and publisher capability
- Subscription plan, status, reading access state (free, trial, paid), start, and remaining period when the API provides one
- A path to the full subscription record
- Reading progress per book: cover, title, author name when present, content progress percent, location, active duration, last read
- The underlying resume fields if the redesign wants them: layout, spine, scroll, spread, page
- Owned books when the user is a publisher, including unpublished work, with publishing-status filter

Must support:

- Save role and publisher under the reader, author, and admin rules
- Block self-service edits and deletion
- Block demotion and deletion of the last admin
- Soft-delete with confirmation
- No control that grants admin except invitation

### Invitations

Must support creating an invitation by email, showing the accept link once, and listing pending unexpired invitations with email, status, expiry, and inviter. Expiry is seven days. Accept happens on a public screen, not inside the shell.

### Books

Must support a filterable, paged catalog with cover, title, publishing status, processing status, layout, book type, owner, categories, and published time.

Book detail must support:

- The catalog fields above, plus description
- Author name and publisher name if the redesign surfaces the API fields
- Edit title, description, book type, and categories without changing publishing status
- Approve, reject with a required reason, unpublish, republish, and soft-delete, each with confirmation, enabled only when the current status and processing state allow it
- Rejection history with actor, time, reason, and a path to the audit entry

Must not imply that admin uploads the book file or sets layout type, unless a later product decision adds that capability. Layout remains a processing result. Book type remains one of three catalog values and must stay editable.

The three book types and the two layout types must stay distinct in the interface.

### Publishers and catalog authors

Must not collapse these into one person:

- The owning account (email, role, publisher flag, link to user detail)
- The EPUB author display name
- The EPUB publisher display name

There is no author-management screen today. A redesign may group publisher accounts, but it must still be able to reach the user record, that user’s books, and that owner’s revenue rows.

### Categories

Must support create (name, optional slug, optional weight), rename, and weight edit, with paging. Must not offer delete unless the product adds it. Must explain that weight affects later revenue recalculation and does not by itself rewrite past payouts. Weight is an average across a book’s categories when engagement is aggregated.

### Plans and subscriptions

Plans must support list and edit of name, description, and Stripe price id, and creation of a paid plan that references an existing Stripe price. Kind, amount, currency, and interval must remain visible. Free plan is not created from the paid-plan dialog.

Subscriptions must support filter by status and user id, and a detail view of plan, kind, status, user, started, period start, period end, canceled at, and activated at.

Must support cancel without refund, and refund only as an action the server may reject. The refund rule is: active monthly paid subscription, within 7 days of activation, after which access ends immediately. Cancel leaves access until the current period end.

If the redesign shows access, it must use server `readingAccessState` and the entitlement rules in section 9. It must not treat “canceled” as “no access” before `currentPeriodEnd`.

Trial start and trial end must be showable if the screen claims to explain trial access. They exist on the subscription payload and are not on the current detail summary.

### Collections

Must support create, edit title and description, cover upload and clear (jpeg, png, webp, max 10,485,760 bytes), add and remove books, reorder, and soft-delete. Membership must be able to show unpublished books and must not imply that readers see those books.

### Settings

Must support Privacy URL, Terms URL, About mission, and sign-in cover media URL, including clearing a value. These are reader-app settings, not admin-account settings.

### Revenue

Must support:

- Period list with start, end, open or closed, platform cut percent, and pool cents
- Open the current UTC month if missing
- Create a period
- Edit pool cents
- Edit platform cut only while the period is open
- Close, with confirmation
- Refresh engagement without writing the revenue-calculated audit event
- Calculate shares, with confirmation, requiring a pool, and allowing recalculation
- Earnings: per book and owner, weighted engagement, pool share cents, platform cut cents, author cents, plus period totals
- Analytics: per book, layout, active reading, active spread, visual scene time, category weight, weighted engagement, plus period totals
- Owner filter and paging on both tabs
- A heatmap per book that switches on layout type: chapters for reflowable, spreads and pages for fixed layout, with visual scene time marked as not paid

The interface must not recompute shares in the client.

### Audit

Must support a read-only, filterable, paged log and a detail view with time, actor, action, subject type, subject link, reason, and metadata. Filters must cover the audit actions the product still records, including content-key issuance if those rows are in the log.

### Reading

Any admin view of reading must keep these definitions:

- Progress percent is content-based for reflowable books and page- or spread-based for fixed layout
- Active duration is session active time, not idle time
- Paid engagement minutes exclude visual scene time
- Home minutes are lifetime active reading plus spread time

---

## 22. Screen coverage matrix

| Admin area | Existing screen | Route | Core data | Main actions | API dependencies | Figma must redesign |
| --- | --- | --- | --- | --- | --- | --- |
| Overview | Overview | `/admin` | User, publisher, book, and reading-minute totals | Open related areas | `GET /admin/dashboard/summary` | Yes |
| Books | Books | `/admin/books` | Catalog rows | Filter by publishing status, page, open | `GET /admin/books` | Yes |
| Books | Book | `/admin/books/:bookId` | Book, categories, rejection audit | Approve, reject, unpublish, republish, delete, edit metadata | `GET/PATCH /admin/books/:id`, approve, reject, unpublish, republish, `DELETE`, rejection history, categories list | Yes |
| Users | Admins | `/admin/users/admins` | Admin accounts, last session | Email filter, page, open, invite | `GET /admin/users`, `POST /admin/invitations` | Yes |
| Users | Members | `/admin/users/members` | Readers and publishers, current plan | Email filter, page, open | `GET /admin/users` | Yes |
| Users | User | `/admin/users/:userId` | Account, subscription, access, reading progress, owned books | Update role and publisher, soft-delete, open subscription, filter books | `GET/PATCH/DELETE /admin/users/:id`, `GET /admin/books` | Yes |
| Users | Redirect | `/admin/users` | None | Redirect to Members | None | Keep a members landing or an explicit replacement |
| Invitations | Invitations | `/admin/invitations` | Pending unexpired invites | Create, page, open inviter | `GET/POST /admin/invitations` | Yes |
| Invitations | Accept invitation | `/accept-admin-invitation` | Token | Set password and become admin | Public accept API | Yes, as a separate public screen |
| Plans | Plans | `/admin/plans` | Plan catalog including Stripe price and amount | Create, edit, page | `GET/POST /admin/plans`, `PATCH /admin/plans/:id` | Yes |
| Subscriptions | Subscriptions | `/admin/subscriptions` | Plan, status, user, period end | Filter, page, open | `GET /admin/subscriptions` | Yes |
| Subscriptions | Subscription | `/admin/subscriptions/:subscriptionId` | Period dates, plan, user | Cancel, refund | `GET /admin/subscriptions/:id`, cancel, refund | Yes |
| Collections | Collections | `/admin/collections` | Title, cover, book count | Create, page, open | `GET/POST /admin/collections` | Yes |
| Collections | Collection | `/admin/collections/:collectionId` | Title, description, cover, ordered books | Edit, cover, add, remove, reorder, delete | Collection GET, PATCH, cover, books, reorder, DELETE; books lookup | Yes |
| Categories | Categories | `/admin/categories` | Name, slug, weight | Create, rename, edit weight, page | `GET/POST /admin/categories`, `PATCH /admin/categories/:id` | Yes |
| Settings | Settings | `/admin/settings` | Privacy, terms, mission, auth cover URL | Save | `GET/PATCH /admin/platform-settings` | Yes |
| Revenue | Revenue periods | `/admin/revenue` | Period window, status, cut, pool | Open current month, create, open | `GET/POST /admin/revenue-periods`, `POST .../current` | Yes |
| Revenue | Revenue period | `/admin/revenue/:revenuePeriodId` | Pool, cut, earnings, analytics | Edit pool and cut, close, refresh engagement, calculate, filter owner, page | Period GET and PATCH, close, engagements, calculate, earnings, analytics | Yes |
| Revenue | Heatmap | `/admin/revenue/:revenuePeriodId/books/:bookId/heatmap` | Chapter or spread cells | Read | `GET .../heatmap` | Yes |
| Audit | Audit log | `/admin/audit` | Actor, action, subject, time | Filter, page, open | `GET /admin/audit-logs` | Yes |
| Audit | Audit entry | `/admin/audit/:auditLogId` | Reason and metadata | Follow actor and subject | `GET /admin/audit-logs/:id` | Yes |

---

## 23. Evidence and confidence

| Discovery | Confidence |
| --- | --- |
| Admin lives in `frontend/` under `/admin`, not a separate app | Verified |
| 19 shell screens, 1 redirect, 1 public accept page | Verified |
| Sidebar structure and the absence of breadcrumbs | Verified |
| Role `admin` is the only dashboard permission | Verified |
| User, book, subscription, category, plan, collection, settings, revenue, and audit actions and endpoints in section 12 | Verified |
| Entitlement rules in section 9 | Verified |
| Progress and reading-minute formulas in section 10 | Verified |
| Category weight is the average of a book’s categories and scales paid minutes | Verified |
| Book type does not branch admin behavior; layout type does | Verified for admin UI and the monetization and progress helpers that were read. Unknown whether a future processing rule exists outside those files |
| Home KPI link to `/admin/revenue-periods` is not a route | Verified |
| `displayName`, raw reading position, trial dates, and Stripe ids are largely unshown | Verified for the components that were read |
| Plan create kind and slug payload | Unknown |
| Collection cover clear confirmation | Unknown |
| Exact `KpiCard` treatment of numeric zero | Likely |
| Reader discovery ranking by category | Unknown for this document |

---

## 24. What this document is for

Use it as the functional checklist for an Admin redesign. The Admin interface should stay capable of every screen and action in the matrix. It is a separate product surface from the mobile reader. Visual direction is out of scope here.
