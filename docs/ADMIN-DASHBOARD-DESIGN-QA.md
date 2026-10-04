# My Hikayat Admin Dashboard — Final Design QA

**Design direction:** Direction C — Library Catalog  
**Functional source:** `src/imports/ADMIN-DASHBOARD-DISCOVERY.md`  
**Design source:** `src/AdminC.tsx`  
**Review scope:** Design prototype only. No backend, API, database, business-rule, or mobile changes.

## 1. Executive Summary

Direction C remains clear and appropriate. The prototype reads as a library operations and publishing workspace rather than a consumer reader or generic analytics dashboard. The dark teal navigation, pale blue-grey working canvas, structured metadata, restrained semantic colors, compact tables, and serif-only page accents create a calm institutional identity.

The QA confirmed representation of all 19 protected Admin screens, the `/admin/users` landing behavior, and the related public invitation-accept screen. Existing functionality remains separated from future proposals. The seven requested future capabilities are designed as realistic screen-level experiences in the prototype under **Design handoff → Enhancements** and documented in this report.

Design-only fixes completed during QA:

- Added the verified exact-email filter pattern to Admins and explicit Apply/Clear actions to both user lists.
- Added pagination treatment to Invitations and Plans.
- Surfaced `displayName` in User Detail as a presentation improvement using an already-returned field.
- Added fixed-layout heatmap coverage alongside reflowable chapter engagement.
- Added the separate public invitation-accept design surface.
- Expanded all seven future capabilities into selectable interface proposals with realistic controls, data, workflows, and state coverage.
- Kept CSV export out of verified list screens.
- Added field-level validation hierarchy and dirty-form confirmation.
- Added the final one-time invitation-link success modal.
- Added compact-width column priorities for Books and Revenue Analytics.
- Confirmed Lora at 16px for restrained page-level identity; Source Sans 3 remains the workhorse face.

### Final assessment

The core screen architecture, visual system, interaction rules, responsive behavior, and future-capability designs are complete. Repeated mutation dialogs use the shared overlay contract rather than duplicating identical frames for every trigger.

**Final status: READY FOR BACKEND PLANNING**

---

## 2. Functional Coverage

Status meanings:

- **PASS** — verified capability has a clear place without material change.
- **IMPROVED** — verified capability is retained with a clearer presentation or flow.
- **NEEDS REVIEW** — represented, but a final interaction detail should be approved.
- **MISSING** — no adequate design representation.

| Capability | Verified in Discovery | Represented in Design | Screen | Status | Notes |
|---|---:|---:|---|---|---|
| Six platform summary metrics | Yes | Yes | Overview | PASS | Uses only Users, Publishers, Books, Published Books, Pending Review, and Reading Minutes. |
| Per-card loading/empty/error model | Yes | Yes | Design System; Overview contract | PASS | Shared state contract applies per KPI. |
| KPI navigation | Yes | Yes | Overview | IMPROVED | Reading Minutes goes to Revenue rather than the invalid legacy path. Filter-preserving drill-downs remain a future proposal. |
| Admin list | Yes | Yes | People → Admins | PASS | Email filter, paging, invite action, last session, publisher flag, created date. |
| Member list | Yes | Yes | People → Members | PASS | Email filter, role, publisher, plan, access, created date, paging. |
| Exact-email filter | Yes | Yes | Admins; Members | IMPROVED | Apply and Clear make the exact-match behavior explicit. |
| Invite admin | Yes | Yes | Admins; Invitations | PASS | Primary action and public acceptance preview are represented. |
| Pending invitation list | Yes | Yes | Invitations | PASS | Pending/unexpired semantics and paging are explicit. |
| Show acceptance URL once | Yes | Yes | Invitations guidance; overlay contract | NEEDS REVIEW | Final invite-created modal should show copy interaction and “shown once” warning. |
| Public invitation acceptance | Yes | Yes | Public acceptance surface | IMPROVED | Separated from the protected shell as required. |
| User account identity | Yes | Yes | User Detail → Profile | IMPROVED | Includes email, ID, created, updated, and returned display name. |
| Role and publisher update | Yes | Yes | User Detail → Profile | PASS | Rules and invitation-only Admin role are explained. |
| Self/last-admin protection | Yes | Yes | User Detail → Danger Zone | PASS | Disabled-rule warning is visible. |
| Soft-delete user | Yes | Yes | User Detail → Danger Zone | PASS | Uses destructive treatment and shared confirmation contract. |
| User subscription summary | Yes | Yes | User Detail → Profile | PASS | Plan, status, access, period, remaining time, and detail link. |
| User reading progress | Yes | Yes | User Detail → Profile | PASS | Book, progress, location, active time, last read. |
| Publisher-owned books | Yes | Yes | User Detail → Books | PASS | Status filter and catalog links retained. |
| Book list and status filter | Yes | Yes | Catalog → Books | PASS | All verified columns, paging, and status filter are present. |
| Catalog text search | No | Future proposal | Enhancements | PASS | Correctly excluded from current Books and labeled future. |
| Book catalog record | Yes | Yes | Book Detail | IMPROVED | Separates owner account from EPUB author and publisher metadata. |
| Edit book metadata | Yes | Yes | Book Detail | PASS | Title, description, book type, and categories only. |
| Approve book | Yes | Yes | Book Detail | PASS | Status/processing explanation and confirmation contract present. |
| Reject with reason | Yes | Yes | Book Detail | PASS | Required-reason treatment is directly shown. |
| Unpublish/republish | Yes | Yes | Book Detail | PASS | Kept separate from publishing status. |
| Soft-delete book | Yes | Yes | Book Detail | PASS | Destructive action present. |
| Rejection history | Yes | Yes | Book Detail | PASS | Empty state is shown; populated table follows shared table pattern. |
| Category list/create | Yes | Yes | Catalog → Categories | PASS | Name, slug, weight, create action, paging. |
| Rename category | Yes | Yes | Categories | PASS | Row action present. |
| Edit category weight | Yes | Yes | Categories | PASS | Inline form and recalculation guidance retained. |
| Delete category | No | No | Categories | PASS | Explicitly identified as unavailable. |
| Plan list/create/edit | Yes | Yes | Access & Billing → Plans | PASS | Stripe-first guidance, plan fields, edit action, paging. |
| Delete plan | No | No | Plans | PASS | Not implied. |
| Subscription list filters | Yes | Yes | Subscriptions | PASS | Status and user-ID patterns retained. |
| Subscription detail | Yes | Yes | Subscription Detail | PASS | User, plan, status, access, period, activation, cancellation. |
| Cancel subscription | Yes | Yes | Subscription Detail | PASS | Access-through-period explanation is clear. |
| Refund within server rules | Yes | Yes | Subscription Detail | PASS | Eligibility and expired-window disabled state are shown. |
| Collection list/create | Yes | Yes | Catalog → Collections | PASS | Covers, titles, counts, paging, create action. |
| Edit collection | Yes | Yes | Collection Detail | PASS | Title/description edit entry point. |
| Upload/clear cover | Yes | Yes | Collection Detail | PASS | Formats and 10 MB limit shown. |
| Add/remove/reorder books | Yes | Yes | Collection Detail | PASS | Membership and unpublished visibility distinction retained. |
| Delete collection | Yes | Yes | Collection Detail | PASS | Danger zone and retained-book consequence are clear. |
| Platform settings | Yes | Yes | Operations → Settings | PASS | All four verified fields and clear-value behavior are represented. |
| Revenue period list/create/current | Yes | Yes | Operations → Revenue | PASS | List and both creation paths shown. |
| Edit pool and platform cut | Yes | Yes | Revenue Period | PASS | Closed-period cut restriction is visible. |
| Close period | Yes | Yes | Revenue Period | PASS | Shared confirmation requirement and disabled closed state. |
| Refresh engagement | Yes | Yes | Revenue Period | PASS | No confirmation; success alert shown. |
| Calculate/recalculate shares | Yes | Yes | Revenue Period | PASS | Pool requirement and audit consequence explained. |
| Earnings and analytics | Yes | Yes | Revenue Period tabs | PASS | Verified totals and row data only. |
| Owner filter and paging | Yes | Yes | Revenue Period | PASS | Control and pagination represented. |
| Reflowable heatmap | Yes | Yes | Engagement Heatmap | PASS | Chapter cells and active duration. |
| Fixed-layout heatmap | Yes | Yes | Engagement Heatmap | IMPROVED | Spread/page cells and visual time marked Not paid. |
| Audit list/filter/page | Yes | Yes | Operations → Audit Log | PASS | Actor, action, subject type/ID filters and paging. |
| Audit entry detail | Yes | Yes | Audit Entry | PASS | Actor, action, subject, reason, metadata, contextual links. |
| Admin role gate | Yes | Yes | Design System state contract | PASS | Permission denied is a full-page shell gate. |
| Loading, empty, error, success, disabled, confirmation | Yes | Yes | Design System and contextual examples | PASS | Shared patterns are documented and reused. |
| CSV export | No | Future proposal only | Enhancements | PASS | No current-product control implies support. |
| Resend/revoke invitation | No | Future proposal only | Enhancements | PASS | Clearly separated from verified Create-only behavior. |

### Coverage conclusion

No verified product area is absent. The most consequential semantics—access entitlement, publication versus processing state, publisher account versus EPUB metadata, active time versus visual time, and category-weight effects—are preserved.

---

## 3. Screen Coverage

| Screen | Route | Present | Navigation | Main Actions | States | Status |
|---|---|---:|---|---|---|---|
| Overview | `/admin` | Yes | Overview | Refresh, metric drill-down | KPI loading/empty/error contract | PASS |
| Books | `/admin/books` | Yes | Catalog → Books | Status filter, page, open | Empty/error/no-result contract | PASS |
| Book Detail | `/admin/books/:bookId` | Yes | Books row; breadcrumb | Edit, approve, reject, unpublish, republish, delete | Disabled, confirm, success, rejection empty | PASS |
| Admins | `/admin/users/admins` | Yes | People → Admins | Exact email, invite, page, open | Empty/error/filter | PASS |
| Members | `/admin/users/members` | Yes | People → Members | Exact email, page, open | Empty/error/filter | PASS |
| User Detail | `/admin/users/:userId` | Yes | User rows and contextual links | Save role/publisher, delete, open subscription/books | Success, disabled, confirm, reading empty | PASS |
| Users redirect | `/admin/users` | Conceptual | People landing is Members | Redirect/landing | Not applicable | IMPROVED |
| Invitations | `/admin/invitations` | Yes | People → Invitations | Invite, page, open inviter | Empty/error/success contract | PASS |
| Accept Invitation | `/accept-admin-invitation` | Yes | External invite link; design preview | Set display name/password, accept | Invalid, expired, accepted, already-admin contract | PASS |
| Plans | `/admin/plans` | Yes | Access & Billing → Plans | Create, edit, page | Validation/success/error contract | PASS |
| Subscriptions | `/admin/subscriptions` | Yes | Access & Billing → Subscriptions | Filter, page, open | Empty/error/no-results contract | PASS |
| Subscription Detail | `/admin/subscriptions/:subscriptionId` | Yes | Subscription row/user detail | Cancel, refund | Disabled, confirm, server rejection | PASS |
| Collections | `/admin/collections` | Yes | Catalog → Collections | Create, page, open | Empty/error contract | PASS |
| Collection Detail | `/admin/collections/:collectionId` | Yes | Collection card; breadcrumb | Edit, cover, add/remove/reorder, delete | Empty membership, confirm, upload error contract | PASS |
| Categories | `/admin/categories` | Yes | Catalog → Categories | Create, rename, edit weight, page | Inline editing, unavailable delete | PASS |
| Settings | `/admin/settings` | Yes | Operations → Settings | Save, discard | Success/error/validation contract | PASS |
| Revenue Periods | `/admin/revenue` | Yes | Operations → Revenue | Current month, create, page, open | Empty/error contract | PASS |
| Revenue Period | `/admin/revenue/:id` | Yes | Revenue row; breadcrumb | Edit, close, refresh, calculate, filter | Success, disabled, confirm, empty tables | PASS |
| Heatmap | `/admin/revenue/:id/books/:bookId/heatmap` | Yes | Revenue tables | Read layout-specific engagement | Empty/error plus both layouts | PASS |
| Audit Log | `/admin/audit` | Yes | Operations → Audit Log | Filter, page, open | Empty/error/no-results contract | PASS |
| Audit Entry | `/admin/audit/:auditLogId` | Yes | Audit row; contextual links | Follow actor/subject | Invalid/missing record contract | PASS |

Design System and Enhancements are handoff-reference surfaces, not production Admin routes.

---

## 4. Workflow Review

### 4.1 Users

**Flow:** People → Members/Admins → exact-email filter → User Detail → account, subscription/access, reading, owned books, actions.

- The next action is clear from row-level Open controls and row interaction.
- User Detail groups editable account controls separately from subscription and destructive actions.
- Access is not inferred from subscription status; server-provided Paid/Trial/Free remains visible.
- Reading progress uses per-book rows rather than unrelated KPI cards.
- Publisher-owned books remain a conditional tab, matching verified behavior.
- **Improvement:** display name is now visible without making it editable.
- **Minor follow-up:** final implementation specification should define unsaved-change protection for role edits.

### 4.2 Books

**Flow:** Catalog → Books → status filter → Book Detail → record metadata → publishing actions → rejection history.

- Current capability intentionally has no title search; the UI says so.
- Book type and layout type remain distinct.
- Owner account, EPUB author, and EPUB publisher are explicitly separate.
- Metadata editing is visually separated from publishing actions.
- Admin-only limits are explicit: no source upload, cover upload, layout edit, or processing edit.
- **Future improvement:** search and compound filters are designed separately.

### 4.3 Authors and publishers

There is no verified Author or Publisher directory. The current valid path is:

**People → Members → publisher-capable User Detail → Books**, with revenue relationships reached through Revenue owner filtering.

This is coherent for current functionality and avoids inventing an author-management model. The proposed Publisher Directory is a future capability. It must never merge:

1. managed publisher account (`User.isPublisher`);
2. EPUB author display string (`Book.authorName`);
3. EPUB publisher display string (`Book.publisherName`).

### 4.4 Categories

**Flow:** Catalog → Categories → create, rename, or edit weight inline.

- A detail screen is unnecessary for verified functionality.
- Related-book browsing and book counts are not verified and are not shown as current functionality.
- Weight consequences are explained near the control.
- Delete remains unavailable.

### 4.5 Subscription and access

**Flow:** Access & Billing → Subscriptions → filters → Subscription Detail → inspect access context → cancel/refund.

- Subscription status and reading entitlement remain separate.
- “Canceled” does not visually imply immediate access loss.
- Refund eligibility is presented as server-governed.
- The User Detail panel links to the same canonical Subscription Detail.
- **Future improvement:** the support-context proposal adds explanation and provider context without changing business rules.

### 4.6 Reading and engagement

- User context: User Detail shows content progress, location, active duration, and last read.
- Platform context: Overview shows verified lifetime reading minutes.
- Revenue context: Revenue Period shows paid analytics and earnings.
- Book/period context: Heatmap switches between chapter-based reflowable cells and spread/page fixed-layout cells.
- Visual scene time is always labeled Not paid.
- Idle time is not presented as active engagement.

### 4.7 Invitations

**Flow:** Admins or Invitations → Invite Admin → one-time acceptance URL → public acceptance screen.

- Current workflow is complete.
- Resend and Revoke remain future proposals.
- **Minor follow-up:** draw the final one-time-link success modal during implementation handoff.

### 4.8 Collections

**Flow:** Collections → Create/Open → edit record → manage cover → manage ordered membership → delete.

- Membership explains that unpublished books remain visible to Admin but not readers.
- Remove and delete consequences are distinct.

### 4.9 Revenue and audit

Revenue preserves the operational sequence: create/open period → pool/cut → refresh → calculate → inspect earnings/analytics → heatmap → close. Audit remains read-only and contextually linked.

---

## 5. Navigation QA

### Current hierarchy

- **Overview**
- **Catalog:** Books, Collections, Categories
- **People:** Members, Admins, Invitations
- **Access & Billing:** Plans, Subscriptions
- **Operations:** Revenue, Audit Log, Settings
- **Design handoff:** Design System, Enhancements

### Findings

- Grouping is intuitive and more scalable than the legacy flat list.
- Catalog owns content records and curated/taxonomy structures.
- People cleanly separates member accounts, staff accounts, and invitations.
- Plans and Subscriptions form a coherent billing/access group.
- Revenue is correctly operational rather than generic analytics.
- Settings remains under Operations because it controls reader-app platform content, not the signed-in account.
- Active states use a pale monochrome/teal indicator and remain visible without orange.
- Detail pages correctly inherit their parent sidebar active state.
- Design-handoff entries are visually marked as reference items and must not ship as production navigation.

No regrouping is recommended.

---

## 6. Visual QA

### Direction C

**PASS.** The design is institutional, catalog-first, calm, structured, and desktop-oriented. The metadata-heavy Book Detail, restrained tables, catalog covers, taxonomy/revenue relationships, and operational language preserve the library identity.

### Icons

**PASS.**

- Heroicons v2 outline paths are used consistently.
- UI icons are monochrome and inherit context color.
- No emoji or multicolor illustration icons are present.
- The official logo image is a brand mark, not a UI icon.
- Stroke weight and standard optical sizes are consistent.

### Color

**PASS.**

- Teal is the primary action and focus color.
- Dark teal anchors navigation.
- Orange is limited to the logo and exceptional attention treatment.
- Orange is not used for ordinary links, selected navigation, headings, table borders, or routine actions.
- Semantic colors are pale-backed and text-labelled.

### Typography

**PASS with minor observation.**

- Lora is restrained to page-level identity.
- Source Sans 3 handles navigation, labels, forms, tables, and metadata.
- JetBrains Mono distinguishes IDs, technical values, durations, and money.
- Table text is compact but readable.
- KPI values are prominent without consumer-dashboard scale.
- Final implementation should ensure the three font families are loaded at all required weights.

### Spacing, shape, and density

**PASS.**

- Cards use small radii and minimal shadows.
- Tables remain the primary list pattern.
- Detail layouts use main/aside hierarchy rather than grids of unrelated cards.
- Compact metadata is aligned consistently.
- No oversized hero regions or decorative illustrations dilute the workspace.

---

## 7. Tables QA

| Table | Search/Filter | Paging | Width Strategy | Finding |
|---|---|---:|---|---|
| Books | Publishing status | Yes | Intentional horizontal scroll, 980px minimum | PASS |
| Members | Exact email | Yes | Horizontal scroll | PASS |
| Admins | Exact email | Yes | Horizontal scroll | PASS |
| Invitations | Current list only | Yes | Horizontal scroll | PASS |
| Plans | Current list only | Yes | Horizontal scroll | PASS |
| Subscriptions | Status + user ID | Yes | Horizontal scroll | PASS |
| Categories | None verified | Yes | Fixed hierarchy | PASS |
| Revenue periods | None verified | Yes | Compact six-column table | PASS |
| Earnings/analytics | Owner ID | Yes | Horizontal scroll | PASS |
| Audit | Actor/action/subject | Yes | Horizontal scroll | PASS |

Sorting is not verified and therefore is not presented as current functionality. Future catalog filtering and CSV export may require server sorting.

---

## 8. Forms QA

- Labels, required markers, helper text, save/cancel, semantic error color, and success banners are standardized.
- Book fields match verified editable metadata only.
- Settings fields match the four verified platform keys.
- Category weight remains inline because it is a frequent single-value edit.
- Revenue pool and platform-cut rules are adjacent to their fields.
- Destructive actions use a separate visual region.
- Shared overlay rules specify focus trapping, Escape behavior, processing lock, and record-specific confirmation copy.

### Finalized behavior

1. User, Book, Settings, Collection, and Revenue forms use the shared dirty-form confirmation before navigation.
2. Invitation creation uses a one-time acceptance-link success modal with Copy action and close warning.
3. Disabled actions require a visible tooltip and programmatically associated explanation.
4. Field errors sit directly below the affected control; multi-field and non-field errors also receive a form-level summary.
5. Save actions enter a processing state and prevent duplicate submission.

---

## 9. State QA

The design system covers:

- loading;
- empty;
- populated;
- error with Retry;
- no results;
- permission denied;
- success;
- confirmation;
- disabled;
- processing.

Contextual examples exist for books, invitations, rejection history, reading progress, settings, revenue refresh, refund eligibility, and access gating. Future proposals list their own required states.

**Finding:** PASS for design-system coverage. The implementation handoff should instantiate the shared state component on each route rather than create one-off variants.

---

## 10. Responsive QA

### Desktop, 1280px and wider

- Persistent 240px sidebar.
- Three-column KPI layout.
- Main/aside detail compositions.
- Full metadata table with local horizontal overflow as a fallback.

### Laptop, 1024–1279px

- Sidebar remains persistent.
- Two-column summary areas stay readable.
- Wide catalog, audit, and analytics tables scroll inside their surface instead of compressing text.

### Tablet, 768–1023px

- Sidebar becomes a drawer.
- Detail sidebars stack after primary content.
- Header actions wrap.
- Tables retain column structure with horizontal scroll.
- Forms remain two columns only when labels and controls retain usable width.

### Mobile, below 768px

- Single-column page headers, forms, and detail sections.
- Navigation uses a full-height drawer with backdrop.
- Tables are not transformed into lossy cards; horizontal scrolling preserves metadata.
- Primary and destructive actions must not share an ambiguous compact menu.

**Finding:** Responsive rules are coherent. Minor implementation handoff work remains to annotate exact column-priority behavior for the Books and Analytics tables.

---

## 11. Accessibility QA

### Passes

- Text status accompanies semantic color.
- Selected navigation uses background, text weight, and left indicator.
- Focus color is documented and does not rely on orange.
- Error and warning alerts include icons and text.
- Breadcrumbs and explicit Back actions preserve orientation.
- The icon system supports accessible names for icon-only controls.
- Reduced-motion behavior is specified.
- Body and metadata contrast are appropriate for long sessions.

### Required implementation checks

- Use semantic table markup even though the prototype visually composes grid rows.
- Maintain logical focus order in drawers and dialogs.
- Use at least 44px targets on touch layouts; compact desktop controls may remain smaller with sufficient spacing.
- Announce toast and inline-success messages through an appropriate live region.
- Associate validation text with inputs via IDs.
- Preserve status text when badges are truncated or viewed in high-contrast mode.

---

## 12. Data Semantics QA

| Concept | Design treatment | Result |
|---|---|---|
| Admin user | Staff account in People → Admins | Clear |
| Member/reader | Non-admin managed account in Members | Clear |
| Author role | User role with required publisher capability | Clear |
| Publisher account | Managed User with `isPublisher`; owns books | Clear |
| EPUB author | Source metadata string on Book Detail | Clear |
| EPUB publisher | Source metadata string on Book Detail | Clear |
| Subscription status | Active/canceled record state | Clear |
| Access entitlement | Server-provided Free/Trial/Paid state | Clear |
| Reading progress | Content/page/spread completion for a user/book | Clear |
| Active reading time | Active session duration, excluding idle | Clear |
| Chapter/spread engagement | Period/book heatmap input | Clear |
| Visual scene time | Fixed-layout context, explicitly Not paid | Clear |

No semantic collapse was found.

---

## 13. Design System QA

### Consistent

- Application shell, grouped sidebar, active state, breadcrumbs.
- Five button variants and three compact sizes.
- Shared form controls and field wrappers.
- Shared table, pagination, badge, alert, progress, KPI, empty, and definition-list patterns.
- Small-radius surfaces and restrained shadows.
- Teal focus/action system and semantic state tokens.
- Modal, drawer, menu, tooltip, and toast behavior contract.

### Implementation consistency notes

- Replace prototype-only inline links with one shared Link component during implementation.
- Use one shared segmented-control/tab component for status filters and detail tabs.
- Formalize compact icon-button dimensions and accessible labels.
- Exclude reference-only “Design handoff” navigation from the production shell.

---

## 14. Recommended Enhancements — Future Capability Handoff

Everything in this section is a **Recommended Enhancement / Future Capability**. Nothing here is claimed as current functionality.

### 14.1 Catalog Search + Compound Filters

#### 1. Problem

The current catalog supports only publishing-status filtering. It will become slow to operate as book volume grows.

#### 2. Proposed UX

Books receives a persistent search field and a filter button. Search covers title and clearly labelled metadata. A filter drawer groups Catalog, Publishing, and Ownership filters. Applied filters appear as removable chips above the table and are reflected in the URL. Reset clears all filters. Result count and active sort remain visible.

#### 3. Admin UI

- Existing Books page, enhanced filter bar.
- Search field with debounced submission.
- Filter drawer: category, owner account, EPUB author, EPUB publisher, book type, layout type, publishing status, processing status.
- Sort control: updated, title, published, created.
- Active filter chips and Reset all.
- Loading table, empty catalog, no-results, error/Retry, success result count.

#### 4. Required Data

- book ID, title, cover;
- publishing and processing status;
- layout and book type;
- owner account ID/email;
- EPUB author and publisher strings;
- category IDs/names;
- published, created, updated timestamps;
- total result count.

#### 5. Proposed Backend Requirement

- Extend the book-list query or add a search endpoint.
- Compound filtering, validated sorting, offset/cursor pagination.
- Authorization remains Admin-only.
- Normalize exact versus partial matching behavior.

#### 6. Database Requirements

Likely indexes on normalized title, owner ID, statuses, type, layout, and timestamps. Category filtering needs efficient relation indexes. Partial author/publisher search may require trigram/full-text indexing depending on database.

#### 7. Proposed API Contract

`GET /admin/books`

- Inputs: `q`, repeated `categoryId`, `ownerId`, `authorName`, `publisherName`, repeated statuses/types/layouts, `sort`, `order`, `limit`, `offset`.
- Response: rows, total, normalized applied filters.
- Permission: Admin.

#### 8. Business Decisions

- Search scope and minimum query length.
- Whether metadata matching is prefix, token, or fuzzy.
- Allowed sort fields.
- Maximum selected filters and URL length behavior.

#### 9. Dependencies

Books, categories, users/publisher accounts, database search/indexing, Admin authorization.

#### 10. Priority

**High.** Catalog operation is core to Direction C and degrades directly with growth.

### 14.2 Publisher Directory

#### 1. Problem

Publisher-capable accounts are mixed into Members even though they own books and participate in revenue.

#### 2. Proposed UX

Add People → Publishers. The directory lists managed publisher accounts only. Publisher Detail reuses User Detail identity and access rules, then emphasizes associated books and links to owner-filtered Revenue. It explicitly labels EPUB author/publisher strings as book metadata, not account identity.

#### 3. Admin UI

- Publisher list with search, role, and account-state filters.
- Publisher Detail: Account, Books, Revenue links, administrative actions.
- Associated-book table with publishing status.
- Empty, no-results, error, loading, save success, and delete/role confirmation.

#### 4. Required Data

- user ID, email, display name, role, `isPublisher`;
- account created/updated and soft-delete state;
- book count and associated book summaries;
- current plan/access where operationally useful;
- owner-filter-compatible ID.

#### 5. Proposed Backend Requirement

The basic list can use the verified `isPublisher` user query. Aggregated book counts or publisher summaries may require response expansion or a dedicated endpoint.

#### 6. Database Requirements

No obvious database change required for the basic directory. Index `User.isPublisher` if list volume warrants it. Aggregates should use indexed `Book.ownerId`.

#### 7. Proposed API Contract

- `GET /admin/users?isPublisher=true&email&role&limit&offset`
- Optional proposal: `GET /admin/publishers/:userId/summary`
- Optional response: account plus book/status counts and canonical revenue-filter link data.
- Permission: Admin.

#### 8. Business Decisions

- Whether “publisher” includes publisher-capable Admin accounts.
- Whether publisher detail exposes lifetime earnings or only period-filtered revenue.
- Whether deleted/suspended concepts are included if introduced later.

#### 9. Dependencies

Users, books, revenue owner IDs, role/publisher rules, Admin authorization.

#### 10. Priority

**High.** It resolves a frequent catalog ownership workflow while preserving semantic clarity.

### 14.3 Dashboard Drill-downs

#### 1. Problem

Verified KPI cards open broad destinations without preserving the metric context.

#### 2. Proposed UX

Clicking Published Books or Pending Review opens Books with the matching status context visible. Publishers opens the proposed Publisher Directory or Members filtered by publisher capability. Reading Minutes opens Revenue. A source-context banner provides a clear return to Overview.

#### 3. Admin UI

- Interactive KPI cards.
- URL-persisted destination filters.
- Context banner/chip on the destination list.
- Per-card loading/empty/error/Retry.
- Filtered empty state and clear-context action.

#### 4. Required Data

Only the six verified dashboard totals plus destination filter values. No new metric is required.

#### 5. Proposed Backend Requirement

No new dashboard aggregation is required. Destination list APIs must accept the matching filter; books already accept status and users already accept publisher capability.

#### 6. Database Requirements

No obvious database change required.

#### 7. Proposed API Contract

Existing:

- `GET /admin/dashboard/summary`
- `GET /admin/books?publishingStatus=approved|in_review`
- `GET /admin/users?isPublisher=true`

Navigation contract should encode filters in URL query parameters.

#### 8. Business Decisions

- Whether Published means `approved` or strictly catalog-visible (`approved` plus `publishedAt`).
- Destination for lifetime Reading Minutes.
- Whether filter context survives subsequent navigation.

#### 9. Dependencies

Overview, Books, Members/Publishers, Revenue, router search parameters.

#### 10. Priority

**High.** It converts existing metrics into reliable operational shortcuts with low backend risk.

### 14.4 CSV Export

#### 1. Problem

Administrators cannot extract filtered operational data for review or reporting.

#### 2. Proposed UX

Supported list pages show a secondary Export CSV action. A dialog summarizes entity, filters, sort, columns, estimated rows, and delivery method. Small exports download directly; large exports run asynchronously and notify the Admin when ready.

#### 3. Admin UI

- Secondary page-header action.
- Export-scope modal.
- Column checklist using approved exportable fields.
- Current-filter/current-sort summary.
- Generate, processing, success/download, failure/Retry, and empty-scope states.
- Optional export-history panel for asynchronous jobs.

#### 4. Required Data

- requesting admin ID;
- entity/export type;
- normalized filters and sorting;
- requested columns;
- estimated/actual row count;
- job status, timestamps, file name, expiry, failure reason.

#### 5. Proposed Backend Requirement

- Export authorization and field allowlists.
- Query reuse from list endpoints.
- CSV generation and escaping.
- Direct response for bounded exports or background job/object storage for large files.
- Audit logging and rate limiting.

#### 6. Database Requirements

No change for synchronous export. Background exports may need an `AdminExportJob` record or equivalent job-store metadata. Existing query fields should be indexed.

#### 7. Proposed API Contract

- `POST /admin/exports` — create export with entity, filters, sort, columns.
- `GET /admin/exports/:id` — status and expiring download URL.
- Optional `GET /admin/exports` — requesting Admin’s recent jobs.
- Permission: Admin, potentially narrower export permission in future.

#### 8. Business Decisions

- Exportable entities and sensitive fields.
- Maximum synchronous rows, retention, expiry, and rate limits.
- Whether every export requires an audit event.
- Whether deleted records can be exported.

#### 9. Dependencies

List query builders, authorization, CSV library, optional queue/object storage, audit.

#### 10. Priority

**Medium.** Valuable for operations, but search/filter usability has greater immediate impact.

### 14.5 Invitation Resend / Revoke

#### 1. Problem

Pending invitations cannot be recovered from delivery issues or invalidated after being sent incorrectly.

#### 2. Proposed UX

Pending invitation rows expose Resend and Revoke in a contextual menu. Resend confirms the recipient and refresh behavior. Revoke explains that the existing token will stop working. Expired invites offer Create new invitation rather than silently reusing an expired token.

#### 3. Admin UI

- Invitation row contextual menu.
- Read-only invitation detail drawer.
- Resend confirmation and processing state.
- Revoke destructive confirmation.
- Success toast/row status update.
- Delivery failure, stale-state conflict, expired, accepted, and empty states.

#### 4. Required Data

- invitation ID, email, status;
- created, expires, accepted, revoked timestamps;
- inviter ID/email;
- last sent timestamp and resend count;
- current-token validity without exposing token hash.

#### 5. Proposed Backend Requirement

- Resend mutation with rate limiting and email dispatch.
- Revoke mutation that invalidates the token.
- State-transition validation.
- Audit events and concurrency handling.

#### 6. Database Requirements

Likely add revoked timestamp/status and optional last-sent/resend-count fields if not already representable. Never store the raw token.

#### 7. Proposed API Contract

- `POST /admin/invitations/:id/resend`
- `POST /admin/invitations/:id/revoke`
- Inputs: optional reason for revoke.
- Responses: sanitized invitation with updated status/expiry.
- Permission: Admin.

#### 8. Business Decisions

- Does resend extend expiry or issue a new token?
- Rate limits and maximum attempts.
- Whether the old token is invalidated on resend.
- Audit reason requirement and email copy.

#### 9. Dependencies

AdminInvitation, email provider, token service, audit, authorization.

#### 10. Priority

**Medium.** Improves staff onboarding reliability but is not a daily catalog workflow.

### 14.6 Subscription Support Context

#### 1. Problem

Support staff must mentally combine status, period dates, trial fields, and entitlement rules to explain access.

#### 2. Proposed UX

Subscription Detail gains a read-only Support Summary: plan, subscription status, server-provided reading access state, “Why this access?” explanation, trial/paid windows, cancellation effect, refund eligibility, and provider references. Business rules remain unchanged.

#### 3. Admin UI

- Support Summary at top of Subscription Detail.
- Entitlement explanation with source timestamp.
- Timeline of trial, activation, current period, cancellation, and access end.
- Read-only Stripe references with copy controls.
- Optional payment/invoice timeline clearly labelled future.
- No-subscription, trial, paid, canceled-but-entitled, expired/free, provider-unavailable, and server-rejection states.

#### 4. Required Data

- user and subscription IDs;
- plan name/kind;
- subscription status;
- server `readingAccessState`;
- trial eligibility/start/end;
- activation/current period/cancellation dates;
- refund eligibility and reason;
- Stripe customer/subscription references;
- optional invoice/payment summaries.

#### 5. Proposed Backend Requirement

Prefer a server-computed support summary so the client does not reimplement entitlement or refund rules. Payment history would require Stripe reads or synchronized records.

#### 6. Database Requirements

No obvious change for existing subscription/trial/provider fields. Payment history may need no local schema if fetched live, or a synchronized event model if reliability/reporting requires it.

#### 7. Proposed API Contract

- Proposal: `GET /admin/subscriptions/:id/support-context`
- Response: authoritative access state, explanation code/text inputs, relevant dates, refund eligibility, provider references.
- Optional: `GET /admin/subscriptions/:id/payments`
- Permission: Admin; sensitive fields redacted.

#### 8. Business Decisions

- Which provider identifiers are safe to expose/copy.
- Whether payment/invoice data is required.
- Whether support staff may trigger provider-side actions beyond existing cancel/refund.
- Data retention and privacy expectations.

#### 9. Dependencies

Subscription, entitlement service, refund rules, Plans, Users, Stripe, authorization.

#### 10. Priority

**Medium.** High support value, but scope depends on privacy and Stripe decisions.

### 14.7 Global Admin Search

#### 1. Problem

Administrators must know the owning section before locating a record.

#### 2. Proposed UX

The shell header exposes Search and Cmd/Ctrl+K. A command dialog searches Users, Books, Publisher Accounts, Categories, and Subscriptions. Results are grouped by entity and show enough metadata to disambiguate records. Selection navigates to the canonical screen.

#### 3. Admin UI

- Header search trigger and keyboard shortcut.
- Accessible command dialog with input.
- Grouped result sections and entity icons.
- Keyboard up/down/enter/Escape.
- Loading, no-results, partial-failure, and permission-filtered states.
- Optional recent searches should remain a separately approved enhancement.

#### 4. Required Data

- entity type and canonical ID;
- primary label and secondary disambiguating metadata;
- status where useful;
- canonical destination;
- match/highlight information;
- total/group counts.

#### 5. Proposed Backend Requirement

- Unified search orchestration or bounded parallel searches.
- Ranking, normalization, limits, permission filtering, and observability.
- Rate limiting and cancellation/debounce support.

#### 6. Database Requirements

Likely indexes for normalized user email/display name, book title/metadata, category name, subscription ID/user ID. Fuzzy search may require database full text/trigram indexes or an external search service.

#### 7. Proposed API Contract

`GET /admin/search?q&types&limit`

- Types: users, books, publishers, categories, subscriptions.
- Response: grouped results with entity type, ID, label, metadata, status, destination, score.
- Permission: Admin; future per-entity permission filtering if roles expand.

#### 8. Business Decisions

- Included entities and searchable fields.
- Prefix versus fuzzy matching and ranking priorities.
- Minimum query length and result limits.
- Whether search events/recent searches are retained.

#### 9. Dependencies

Users, Books, Categories, Subscriptions, publisher capability, router, search/index infrastructure, authorization.

#### 10. Priority

**Low initially, rising with scale.** Useful across the workspace, but catalog search should be solved first.

---

## 15. Future Backend / Product Work Required

| Enhancement | Frontend UI | New API | Database Change | Search/Indexing | Background Job | External Dependency | Business Decision |
|---|---|---|---|---|---|---|---|
| Catalog Search + Filters | Search bar, drawer, chips, sort | Extend Books list | Likely indexes | Yes | No | No | Match/sort semantics |
| Publisher Directory | List and detail composition | Optional summary API | Probably no | Basic user indexes | No | No | Publisher scope and metrics |
| Dashboard Drill-downs | Filter-preserving navigation | Usually no | No | No | No | No | Metric-to-filter semantics |
| CSV Export | Scope modal, progress, download | Export create/status | Maybe export-job record | Reuses list indexes | Likely for large files | Queue/object storage | Fields, limits, retention |
| Invitation Resend/Revoke | Row menu, drawer, confirms | Two mutations | Likely status/timestamps | No | Email dispatch may queue | Email provider | Token/expiry behavior |
| Subscription Support Context | Summary, timeline, provider context | Support-context; optional payments | Probably no | No | No | Stripe | Privacy and payment scope |
| Global Admin Search | Header command dialog | Unified search | Likely indexes | Yes | No | Optional search service | Scope, ranking, retention |

| Enhancement | Main Backend Work | Main Data Required | Main Risk / Consideration | Priority |
|---|---|---|---|---|
| Catalog Search + Filters | Compound query and validated sorting | Book metadata and relations | Query performance and understandable matching | High |
| Publisher Directory | Publisher filtering and optional aggregates | User, books, owner revenue link | Conflating account and metadata identities | High |
| Dashboard Drill-downs | Preserve filters across routes | Existing summary and list filters | Published-versus-approved semantics | High |
| CSV Export | Authorized generation and delivery | Filtered row data, field allowlist | Sensitive data, scale, retention | Medium |
| Invitation Resend/Revoke | Token transitions, email, audit | Invitation state and delivery metadata | Token safety and race conditions | Medium |
| Subscription Support Context | Server-authored explanation | Entitlement, periods, trial, provider IDs | Reimplementing business rules in UI | Medium |
| Global Admin Search | Ranking across entities | Identifiers, labels, status, destination | Search quality, permissions, performance | Low |

---

## 16. Final Refinement Resolution

All issues identified by the previous QA are resolved:

1. One-time invitation-link success modal: represented with Copy, expiry, and close warning.
2. Dirty-form behavior: specified for all editable detail screens.
3. Field validation: field-first priority and form-level summary specified.
4. Compact-width tables: Books and Revenue Analytics column priorities documented.
5. Typography: Lora remains a restrained 16px page-title accent; Source Sans 3 handles operational content.
6. Reference navigation: Design System and Future Experiences are explicitly excluded from the production shell.
7. Future capabilities: all seven are represented as actual Direction C interaction designs with required states.

No unresolved design issue blocks backend planning.

## 17. Final Status

# READY FOR BACKEND PLANNING

The Admin design is finalized, functionally comprehensive, responsive, and faithful to Direction C. The seven future capabilities are fully designed and remain clearly labelled as future product experiences. Backend planning may now use the finalized UX and `docs/ADMIN-DASHBOARD-BACKEND-REQUIREMENTS.md` as its requirements source.
