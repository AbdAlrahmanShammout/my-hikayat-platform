# Mobile Product Gaps — Implementation Roadmap

**Purpose.** Actionable, dependency-aware roadmap for product gaps identified in
`docs/MOBILE-PRODUCT-SPEC.md`, revalidated against the current codebase on
**2026-09-03**.

**Working rules.**

- Implement **one task at a time**.
- Do not start the next task until the user explicitly says to continue.
- Do **not** create Git commits unless the user explicitly asks.
- After each task: update this roadmap and `docs/MOBILE-PRODUCT-SPEC.md`.

**Authority.**

| Document | Role |
| --- | --- |
| `docs/SRS.md` | Product / business rules |
| `ARCHITECTURE.md` | NestJS backend |
| `docs/MOBILE-ARCHITECTURE.md` | Mobile conventions |
| `docs/MOBILE-PRODUCT-SPEC.md` | Mobile product source of truth |
| `docs/admin-dashboard-tasks.md` | Historical STEP delivery tracker (STEPs 31–54 Complete) |
| **This file** | Gap remediation order and status |

**Status values:** `BLOCKED` · `TODO` · `IN PROGRESS` · `COMPLETE` · `DEFERRED`

---

## Revalidation summary (2026-09-03)

| Gap | Spec claim | Code reality | Verdict |
| --- | --- | --- | --- |
| Cover art | Not in book contract | Authors upload `preview_image` assets (`POST /author/books/:id/preview-image`); **not** projected on reader `BookResponse` | **Valid gap** — expose existing preview, do not invent a new storage system |
| Author / publisher display | Searchable only; detail shows `owner.email` | EPUB `BookSourceMetadata.creator` / `.publisher` exist and power search; **not** on `BookResponse` | **Valid gap** — expose source-metadata display fields |
| Access token lifetime | UNKNOWN | **Confirmed:** default `JWT_ACCESS_EXPIRES_IN = 15m`; no refresh token; recovery JWT purpose exists (1h) unused by HTTP password-reset | **Valid + confirmed blocker** for long sessions |
| Entitlement visibility | Denial-driven | `readingAccessState` already on `GET /reader/billing/subscription`; only shown on Me | **Valid** — mostly mobile surfacing |
| Trial discovery | Only on Me | `POST /reader/billing/trial/start` + `trialEligible` exist; no first-run / Home offer | **Valid** |
| Offline resume | Starts at beginning | Confirmed in offline shell/session stub | **Valid** |
| Offline bookmarks / progress | Discarded | No offline write queue in `mobile/src/features/offline/` | **Valid** |
| Offline lease expiry UX | Invisible | Lease `expiresAt` already stored in offline manifest | **Valid** — UX only; do not weaken crypto |
| Sign-out purge | Silent destruction | Confirmed purge on sign-out / abandon restore | **Valid** — keep purge; add confirmation |
| Catalog/search pagination | First 20 only | API supports `limit`/`offset`; UI hardcodes `offset: 0` | **Valid** — mobile-only |
| Settings | Absent | No settings route/screen | **Valid** — scope tightly |
| Password reset | Absent | No forgot/reset HTTP; mail + recovery JWT infrastructure exist | **Valid** — needs backend + mobile |
| Reader cancel | Absent | Admin `POST /admin/subscriptions/:id/cancel` exists; **no** reader cancel endpoint | **Valid** — needs backend + mobile |
| Push notifications | Absent | No mobile push / device-token stack | **Valid** — architecture first; in-app banners possible without push |
| Refresh tokens | Absent | Confirmed | **Valid** — FINAL task |

**Deferred (not in the ordered remediation list below).**

| ID | Item | Why deferred |
| --- | --- | --- |
| FR-1…FR-6 | Fixed-layout pinch/RTL/dark, PDF, preference sync, in-book search | Existing backlog in `admin-dashboard-tasks.md`; not required for this gap pass |
| Parental / age gates | Compliance | Product/legal decision; not enough evidence to implement now |
| Reading statistics UI | Engagement collected, never shown | Product decision |
| Screenshot / watermark | Not specified | Do not invent |
| “My books” rename | Label vs downloads shelf | Product IA decision; note under Settings / Library copy when touching those screens |
| STEP 36 Maestro R2 E2E | Deferred testing phase | Separate testing track |

---

## Ordered implementation plan

Priority bands used:

1. Product/data blockers  
2. Backend/API contract blockers  
3. Authentication/session blockers *(FINAL only — intentionally last)*  
4. Core reading/access  
5. Offline reliability  
6. Discovery/catalog  
7. Subscription/trial UX  
8. Account/settings  
9. Lower-priority / infra-heavy enhancements  

| Order | Task ID | Title | Status | Band | Depends on |
| --- | --- | --- | --- | --- | --- |
| 1 | **MG-1** | Book cover / preview image on catalog | `COMPLETE` | 1–2 | — |
| 2 | **MG-2** | Author & publisher display fields | `TODO` | 1–2 | — (can parallelize with MG-1; sequential by rule) |
| 3 | **MG-3** | Entitlement visibility before reader | `TODO` | 4 | Prefer after MG-1/MG-2 so book detail can show access + identity together |
| 4 | **MG-4** | Trial discovery & trial UX | `TODO` | 7 | MG-3 (reuse access-state surfaces) |
| 5 | **MG-5** | Offline reading resume (local progress) | `TODO` | 5 | — |
| 6 | **MG-6** | Offline bookmark persistence & sync | `TODO` | 5 | Prefer after MG-5 (shared local offline store patterns) |
| 7 | **MG-7** | Offline progress write queue / sync | `TODO` | 5 | **MG-5** |
| 8 | **MG-8** | Offline lease expiration UX | `TODO` | 5 | — (lease already on device) |
| 9 | **MG-9** | Sign-out & offline content confirmation | `TODO` | 8 | — |
| 10 | **MG-10** | Catalog & search pagination | `TODO` | 6 | Prefer after MG-1/MG-2 so new pages include cover/author |
| 11 | **MG-11** | Settings (scoped) | `TODO` | 8 | Prefer after MG-5 (reading prefs), MG-9 |
| 12 | **MG-12** | Password reset | `TODO` | 8 | — (backend mail + recovery JWT) |
| 13 | **MG-13** | Subscription cancellation (reader) | `TODO` | 7 | — (extends existing billing) |
| 14 | **MG-14** | Trial / subscription expiry notifications | `TODO` | 9 | MG-3/MG-4 for in-app; push infra may be `BLOCKED` |
| 15 | **MG-FINAL** | Access + refresh token architecture | `TODO` | 3 | After MG-1…MG-14 (largest auth change; last by requirement) |

**Next task to start when approved:** **MG-2**.

---

## Task details

### MG-1 — Book cover / preview image on catalog

| Field | Content |
| --- | --- |
| **Status** | `COMPLETE` |
| **Problem** | Reader catalog/search/collections/detail cannot show cover art. Cover-driven discovery is impossible. |
| **Current behavior** | Authors can upload JPEG/PNG/WebP preview images (`BookAssetKind.PREVIEW_IMAGE`). Reader `BookResponse` has no cover field. Source delivery grants require full-book entitlement and only serve encrypted sources. |
| **Desired behavior** | Authenticated readers browsing the catalog see a cover (or a clear placeholder) for each book that has a preview image, **without** needing reading entitlement. |
| **Why it matters** | Highest-impact visual/product blocker for a kids/picture-book product. |
| **Affected** | Backend book + book-asset modules; reader catalog/search/collections responses; mobile catalog rows, book detail, continue reading, offline library (optional cached cover later). |
| **Backend impact** | Project a catalog-safe cover URL (or cover asset descriptor) onto reader-facing book payloads. Prefer signed GET URLs for preview assets that do **not** require full-book entitlement. Handle missing preview. |
| **API impact** | Extend reader `BookResponse` (or nested cover DTO). Regenerate mobile OpenAPI types. |
| **Data/model** | Reuse existing preview assets — no new required upload path if authors already upload; may need admin/author guidance that preview = cover. |
| **Mobile impact** | Display cover with loading / error / placeholder states on list + detail. |
| **UX impact** | Enables cover-driven bookstore layouts. |
| **Dependencies** | None. |
| **Implementation notes** | Do not require entitlement for cover. Do not use encrypted source bytes as cover. Keep signed URL expiry short; client may refresh via book refetch. Backward compatible: null/absent cover → placeholder. |
| **Testing** | Backend unit/e2e for catalog with/without preview; mobile unit tests for placeholder/mapping; typecheck. |
| **Completion** | **2026-09-03.** Implemented `BookCatalogCoverService` (batch latest `preview_image` → signed GET URL, 1h expiry, no entitlement). Extended `BookResponse.cover` (`url`, `expiresAt`, `contentType`, nullable). Wired catalog, search, and collections reader controllers. Mobile `CatalogBookCover` on rows, detail, and Continue reading; placeholder on missing/failed image. Generated types updated in `mobile/` and `frontend/` reader (and admin/author) schemas. |

---

### MG-2 — Author & publisher display information

| Field | Content |
| --- | --- |
| **Status** | `TODO` |
| **Problem** | Author/publisher are searchable via EPUB source metadata but not displayable. Book detail shows `By {owner.email}`. |
| **Current behavior** | `BookSourceMetadata.creator` / `.publisher` stored at processing time; search filters on them; `BookResponse` only exposes `owner` (`UserResponse` with email). |
| **Desired behavior** | Reader-facing book payloads include user-facing **author display name** and **publisher display name** (nullable when missing). Mobile must not use uploader email as the primary public identity. |
| **Why it matters** | Book identity; kids should not see account emails as “authors.” |
| **Affected** | Backend catalog projection; search result shape; mobile book rows/detail. |
| **Backend impact** | Include source-metadata creator/publisher on catalog book loads (join/include). Map to explicit display fields (e.g. `authorName`, `publisherName`) — do not overload `owner`. |
| **API impact** | Extend `BookResponse`; regenerate mobile types. |
| **Data/model** | Existing `BookSourceMetadata` — no new tables if fields are sufficient. Document null when EPUB had no creator/publisher. |
| **Mobile impact** | Show author/publisher when present; remove email-as-author primary line (owner email may remain admin-only or hidden). |
| **UX impact** | Search results can confirm why a match occurred. |
| **Dependencies** | None (ordered after MG-1 only by working rule). |
| **Implementation notes** | Search already uses `creator` as “author”. Keep naming consistent. Do not invent free-text author editing in this task unless SRS already requires it. |
| **Testing** | Backend mapping tests; search still works; mobile display tests. |
| **Completion** | — |

---

### MG-3 — Subscription / entitlement visibility

| Field | Content |
| --- | --- |
| **Status** | `TODO` |
| **Problem** | Free users browse a full catalog with no access signal until open fails. |
| **Current behavior** | Denial only inside reader open (`FULL_BOOK_ACCESS_DENIED` → Go to Subscribe). `readingAccessState` exists on subscription API but is Me-only. |
| **Desired behavior** | User can understand access state **before** entering the reader: free / trial / paid / expired-or-restricted, with a clear path to trial or subscribe. Do **not** invent client entitlement math — display backend `readingAccessState` (and related fields). |
| **Why it matters** | Conversion + kids/adult clarity; removes denial-as-onboarding. |
| **Affected** | Mobile Home, book detail, optionally continue-reading; billing hooks reuse. |
| **Backend impact** | Prefer **none** if subscription query is enough. Optional later: lightweight access hint on book detail only if product requires per-book gating (today all catalog books share the same entitlement gate). |
| **API impact** | None expected for v1 of this task. |
| **Mobile impact** | Surface access state on discovery/detail CTAs (“Start Free Trial”, “Subscribe to read”, “Read” / “Continue” when entitled). |
| **UX impact** | Anticipated wall instead of sprung failure. Keep denial path as fallback. |
| **Dependencies** | Prefer MG-1/MG-2 complete so detail screen redesign includes cover + author + access. |
| **Implementation notes** | Reuse `useReaderSubscription`. Never treat UI labels as authorization. |
| **Testing** | Unit tests for CTA label mapping by `readingAccessState` / `trialEligible`; manual state matrix. |
| **Completion** | — |

---

### MG-4 — Trial discovery and trial UX

| Field | Content |
| --- | --- |
| **Status** | `TODO` |
| **Problem** | Trial is under-discovered; no post-registration or Home offer. |
| **Current behavior** | Profile shows Start Free Trial when `trialEligible`; 7-day no-card rules already enforced server-side. |
| **Desired behavior** | Eligible users encounter a clear trial offer after register / on Home / on entitlement-aware book CTAs, without auto-starting trial. Surface active trial remaining time outside Me where appropriate. |
| **Why it matters** | Primary conversion path for free users. |
| **Affected** | Mobile auth success routing, Home, book detail CTAs, Profile (existing). |
| **Backend impact** | None expected — reuse `trialEligible`, `trialEndsAt`, `POST /reader/billing/trial/start`. |
| **API impact** | None. |
| **Business rules** | Keep: one trial per account; no card; not automatic; server-authoritative. |
| **Dependencies** | **MG-3**. |
| **Implementation notes** | Do not auto-start on register. Kids-friendly copy; route billing actions toward grown-up language already used. |
| **Testing** | Eligible / ineligible / active trial UI branches; trial start mutation. |
| **Completion** | — |

---

### MG-5 — Offline reading resume (local progress)

| Field | Content |
| --- | --- |
| **Status** | `TODO` |
| **Problem** | Offline opens always start at chapter/spread 1; online Smart Resume ignored offline. |
| **Current behavior** | Offline session stub forces start position; no local progress store. |
| **Desired behavior** | Offline open restores the best known local position for that book/user when available. Persist position locally during offline reading. |
| **Why it matters** | Core reading reliability; largest offline UX failure. |
| **Affected** | Mobile offline + reader open/close paths. |
| **Backend impact** | None for local resume alone. |
| **API impact** | None. |
| **Data/model** | New device-local progress records keyed by user + book + layout position fields. |
| **Dependencies** | None. **MG-7** builds the sync queue on top. |
| **Implementation notes** | Prefer last local write while offline; when online, existing server progress remains authoritative until MG-7 defines conflict rules. SecureStore/filesystem consistent with offline package storage patterns. Clear on sign-out purge. |
| **Testing** | Unit tests for save/load/resume; offline open uses local position. |
| **Completion** | — |

---

### MG-6 — Offline bookmark persistence and sync

| Field | Content |
| --- | --- |
| **Status** | `TODO` |
| **Problem** | Offline bookmark create/delete cannot reach the server and is effectively lost. |
| **Current behavior** | Bookmark APIs are online-only; no pending mutation queue. |
| **Desired behavior** | Offline: create/remove bookmarks against a local store; queue mutations; on reconnect sync without duplicates; handle failures/retries. |
| **Why it matters** | Bookmarks are a core reading feature; offline must not silently discard them. |
| **Affected** | Mobile reader bookmarks + offline storage. |
| **Backend impact** | None if existing bookmark CRUD is sufficient. |
| **Dependencies** | Prefer after **MG-5** (shared local persistence patterns). Independent of MG-7 but should align queue design. |
| **Implementation notes** | Per-book local bookmarks + pending ops (`create` / `delete`). Idempotency keys or client mutation ids if needed to avoid duplicates. Do not build a generic sync framework beyond bookmarks + (MG-7) progress. |
| **Testing** | Offline add/remove; reconnect sync; duplicate prevention; failure retry. |
| **Completion** | — |

---

### MG-7 — Offline progress write queue / synchronization

| Field | Content |
| --- | --- |
| **Status** | `TODO` |
| **Problem** | Offline progress is discarded; reconnect does not upload offline reading. |
| **Current behavior** | Progress PUT only while online; failures silent. |
| **Desired behavior** | Offline change → local persistence → pending sync → reconnect → server sync → ack → queue cleanup. Define conflict rule (recommended: **latest `lastSessionAt` / newer client timestamp wins**, aligned with existing Smart Resume single-progress-row model). |
| **Why it matters** | Completes offline reading honesty. |
| **Affected** | Mobile progress save path + offline queue. |
| **Backend impact** | Prefer existing `PUT /reader/books/:id/progress`. Only add backend support if conflict semantics require it. |
| **Dependencies** | **MG-5** (required). Align with MG-6 queue mechanics. |
| **Implementation notes** | Reuse MG-5 local store; add pending flag/ops. Sync on connectivity restore + app foreground. No infinite retry loops. |
| **Testing** | Queue lifecycle; reconnect sync; conflict fixture; offline→online resume matches uploaded position. |
| **Completion** | — |

---

### MG-8 — Offline lease expiration UX

| Field | Content |
| --- | --- |
| **Status** | `TODO` |
| **Problem** | Downloads lock when lease expires with no advance visibility. |
| **Current behavior** | Manifest stores signed `offlineLease.expiresAt`; UI never shows it; lock messages only on open failure. |
| **Desired behavior** | Surface safe states: active; approaching expiry; expired/locked — using existing `expiresAt` + trusted time. Do not expose signatures/keys. |
| **Why it matters** | Prevents surprise lockouts; clarifies leased nature of downloads. |
| **Affected** | Mobile My books + book detail offline section. |
| **Backend impact** | None required (lease already issued). |
| **Dependencies** | None. |
| **Implementation notes** | Fail-closed validation unchanged. “Approaching” threshold is a UX constant (document it). Clock-rollback messaging already distinct — keep it. |
| **Testing** | Label mapping for active / soon / expired; locked open still fail-closed. |
| **Completion** | — |

---

### MG-9 — Sign-out and offline content behavior

| Field | Content |
| --- | --- |
| **Status** | `TODO` |
| **Problem** | Sign-out (and abandon-restore) purge all offline packages with no warning. |
| **Current behavior** | Security-motivated purge is correct; UX presents Sign out as routine. |
| **Desired behavior** | Keep purge. Before sign-out / abandon-restore, tell the user downloads will be removed and require confirmation when downloads exist. |
| **Why it matters** | Security vs trust; avoids silent data loss. |
| **Affected** | Mobile Profile sign-out; session restore abandon. |
| **Backend impact** | None. |
| **Dependencies** | None. |
| **Implementation notes** | Do not keep DEKs/ciphertext after sign-out. Confirmation only when `packages.length > 0`. |
| **Testing** | Confirm dialog appears when downloads exist; purge still runs; no downloads → optional lighter confirm or direct sign-out (document choice). |
| **Completion** | — |

---

### MG-10 — Catalog and search pagination

| Field | Content |
| --- | --- |
| **Status** | `TODO` |
| **Problem** | UI loads first 20 while showing full `total`. |
| **Current behavior** | `limit=20`, `offset=0` only for catalog and search. |
| **Desired behavior** | Infinite load / next page via existing `limit`/`offset`; end-of-results; load errors + retry; no duplicate rows; search query changes reset paging; UI must not imply all results are loaded until end. |
| **Why it matters** | Discovery completeness. |
| **Affected** | Mobile catalog list, search results; optionally collections list if same pattern. |
| **Backend impact** | None. |
| **Dependencies** | Prefer after **MG-1** / **MG-2** so pages include cover/author. |
| **Implementation notes** | TanStack Query infinite query pattern preferred. Preserve pull-to-refresh. |
| **Testing** | Page 1/2 append; empty; error retry; search reset. |
| **Completion** | — |

---

### MG-11 — Settings (scoped)

| Field | Content |
| --- | --- |
| **Status** | `TODO` |
| **Problem** | No settings surface for justified preferences and account actions. |
| **Current behavior** | Me has identity + billing + sign-out only. Reading prefs are session-local. |
| **Desired behavior** | Add a **minimal** Settings experience justified by product needs only. Evaluate, then include only what is warranted — candidates: persisted reading preferences (ties FR-5), offline/storage summary + manage downloads link, legal/about placeholders if required, account actions (sign-out, password change/reset entry after MG-12), notification prefs only if MG-14 lands. |
| **Why it matters** | Avoid dumping unrelated controls onto Me; give prefs a home. |
| **Affected** | Mobile navigation + new screen(s). |
| **Backend impact** | Only if preference sync is in scope (optional; local-first acceptable). |
| **Dependencies** | Prefer after **MG-5**, **MG-9**; coordinate with **MG-12** / **MG-14**. |
| **Implementation notes** | **Do not invent** unused toggles. Document final scope in the product spec when implementing. |
| **Testing** | Navigation; persistence of any included prefs. |
| **Completion** | — |

---

### MG-12 — Password reset

| Field | Content |
| --- | --- |
| **Status** | `TODO` |
| **Problem** | Forgotten password = hard lockout. |
| **Current behavior** | Auth has register/login/me only. Recovery JWT purpose + mail provider exist; no forgot/reset HTTP for readers. |
| **Desired behavior** | Complete secure flow: request reset → email with token → set new password → success/failure/expired/invalid handling. |
| **Why it matters** | Account recovery for a consumer app. |
| **Affected** | Backend auth + mail; mobile public auth screens. |
| **Backend impact** | New endpoints; use `JwtTokenPurpose.RECOVERY`; rate-limit; do not leak whether email exists (enumeration-safe responses). |
| **API impact** | New public auth routes; document in OpenAPI; regenerate mobile types. |
| **Dependencies** | None (but do before MG-FINAL so refresh work does not collide with auth controller churn — refresh still last). |
| **Implementation notes** | Align with `ARCHITECTURE.md` auth patterns. SRS lacks a reader forgot-password section — treat as product gap fix and document in SRS only if user requests SRS edits. |
| **Testing** | Unit + e2e for happy path, expired token, invalid token, enumeration-safe request. |
| **Completion** | — |

---

### MG-13 — Subscription cancellation (reader)

| Field | Content |
| --- | --- |
| **Status** | `TODO` |
| **Problem** | Users can subscribe/refund in-app but cannot cancel. |
| **Current behavior** | Admin cancel via Stripe + local status; reader billing has plans/checkout/trial/refund only. Canceled-but-active-until-period-end rules already exist. |
| **Desired behavior** | Reader can request cancellation; UI distinguishes canceled-but-still-active vs expired; access continues until `currentPeriodEnd` (existing rule). |
| **Why it matters** | Billing completeness and trust. |
| **Affected** | Backend reader billing; Stripe cancel; mobile Me. |
| **Backend impact** | Add reader cancel endpoint wrapping existing cancel semantics (not refund). |
| **API impact** | New `POST /reader/billing/...` cancel; regenerate types. |
| **Dependencies** | None. |
| **Implementation notes** | Do not end access immediately (contrast with refund). Confirm Stripe subscription id handling matches admin path. |
| **Testing** | Backend e2e cancel; mobile confirm flow; state display. |
| **Completion** | — |

---

### MG-14 — Trial / subscription expiration notifications

| Field | Content |
| --- | --- |
| **Status** | `TODO` (push sub-scope may become `BLOCKED`) |
| **Problem** | No channel warns before trial/subscription access ends. |
| **Current behavior** | Remaining trial label only on Me; no push; no local scheduled notifications. |
| **Desired behavior** | Phase A (feasible now): **in-app** expiry awareness using existing subscription fields (banners on Home/Me when trial/paid window is near end or ended). Phase B: push/local notifications **only after** documenting device-token + backend push architecture — do not fake push. |
| **Why it matters** | Conversion retention; fewer surprise refusals. |
| **Affected** | Mobile UI first; push would need backend + native config. |
| **Backend impact** | Phase A none. Phase B new infra (device tokens, provider). |
| **Dependencies** | **MG-3**, **MG-4** for consistent access messaging. |
| **Implementation notes** | Prefer Phase A in this task unless push architecture is approved mid-task. Record Phase B as follow-up if deferred. |
| **Testing** | Banner visibility matrix for trial/paid near expiry / expired. |
| **Completion** | — |

---

### MG-FINAL — Access token lifetime & refresh token

| Field | Content |
| --- | --- |
| **Status** | `TODO` |
| **Problem** | Access tokens default to **15 minutes** with **no refresh**; any 401 clears session → abrupt sign-out, including mid-reading. |
| **Current behavior** | Confirmed in `jwt-config.schema.ts` (`JWT_ACCESS_EXPIRES_IN_DEFAULT = '15m'`). Mobile stores access token only; `session.refresh-token` key unused; `clearAccessToken` on 401. |
| **Desired behavior** | Robust refresh-token architecture: short-lived access token; secure refresh storage; refresh endpoint; single-flight refresh on concurrent 401s; retry original request; no refresh loops; offline-safe failure; logout revokes refresh; app launch/resume/read flows validated. |
| **Why it matters** | Without this, a kids reading session longer than ~15m is structurally broken. |
| **Affected** | Backend auth/JWT; mobile session store, HTTP client, E2E auth. |
| **Backend impact** | Design refresh tokens (storage, rotation, revocation) per `ARCHITECTURE.md` — do not invent conflicting patterns. |
| **API impact** | Login/register/refresh/logout contract changes; regenerate clients. |
| **Dependencies** | **After MG-1…MG-14** (required final task). |
| **Implementation notes** | Audit actual `JWT_ACCESS_EXPIRES_IN` in deployed env, not only default. Coordinate web dashboard auth if same API. |
| **Testing** | Unit + E2E: success refresh, expired access, expired/invalid refresh, concurrent 401 single refresh, offline refresh failure, logout, restart restore. |
| **Completion** | — |

---

## Progress log

| Date | Event |
| --- | --- |
| 2026-09-03 | Roadmap created after revalidation. No implementation started. Next: MG-1 on explicit approval. |
| 2026-09-03 | **MG-1 COMPLETE.** Catalog covers from existing preview images. Next: MG-2 on explicit approval. |

---

## Relationship to historical STEPs

Mobile STEPs 31–54 in `docs/admin-dashboard-tasks.md` remain the historical delivery record and stay **Complete** (STEP 36 Deferred — testing). **Do not rewrite those STEP statuses.** This roadmap is a **new remediation track** (`MG-*`) for product gaps discovered after that delivery.
