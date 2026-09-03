# Mobile Application — Complete Product & Feature Specification

**Purpose of this document.** This is the product source of truth for designing the mobile
application's user experience. It describes what the product is, who uses it, what users can do,
what screens and flows exist, what information must be surfaced, what states users can be in, and
what business rules constrain behavior.

It intentionally does **not** prescribe layout, component hierarchy, colors, typography, spacing,
or visual patterns. Those are design decisions to be made by the reader of this document.

**Audience.** A professional UI/UX designer or an AI design system that has never seen this
project.

**Status legend.** Every feature, screen, and rule in this document carries one of these markers:

| Marker | Meaning |
| --- | --- |
| **IMPLEMENTED** | Currently working in the mobile application source code |
| **PARTIALLY IMPLEMENTED** | Some functionality exists; documented intent is not fully met |
| **PLANNED** | Documented or roadmapped, not currently in the mobile app |
| **UNKNOWN** | Mentioned or implied, but cannot be confirmed from the project |

**Evidence basis.** Derived from the mobile application source (`mobile/src/`), its unit tests
(`*.spec.ts`), its end-to-end tests (`mobile/e2e/`), the generated backend API contract
(`mobile/src/generated/reader.ts`), and the project documents: `docs/SRS.md`,
`docs/MOBILE-ARCHITECTURE.md`, `docs/admin-dashboard-tasks.md`, `docs/FUTURE.md`,
`docs/srs-coverage-matrix.md`, `mobile/README.md`, `mobile/e2e/README.md`.

**Gap remediation track.** Product gaps listed in §16 are tracked for implementation in
[`docs/MOBILE-PRODUCT-GAPS-ROADMAP.md`](./MOBILE-PRODUCT-GAPS-ROADMAP.md) (`MG-*` tasks). That
roadmap is the ordered implementation source of truth for closing gaps. Historical mobile STEPs
31–54 in `docs/admin-dashboard-tasks.md` remain Complete and are not rewritten. As each `MG-*`
task completes, this specification must be updated so it stays current.

**Roadmap snapshot (2026-09-03).** **MG-1 COMPLETE** (catalog covers from author preview
images). Next task when approved: **MG-2** (author & publisher display). Confirmed blocker:
access tokens default to **15 minutes** with no refresh (`MG-FINAL`, last).

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Feature Inventory](#2-feature-inventory)
3. [Screen Inventory](#3-screen-inventory)
4. [User Journeys & Flows](#4-user-journeys--flows)
5. [Reader Experience Specification](#5-reader-experience-specification)
6. [Library, Catalog & Discovery](#6-library-catalog--discovery)
7. [Authentication & User Account](#7-authentication--user-account)
8. [Subscription, Trial & Entitlement Model](#8-subscription-trial--entitlement-model)
9. [Offline Experience](#9-offline-experience)
10. [Application States](#10-application-states)
11. [Data & Information Model](#11-data--information-model-mobile-perspective)
12. [Navigation & Information Architecture](#12-navigation--information-architecture)
13. [Permissions, Restrictions & Business Rules](#13-permissions-restrictions--business-rules)
14. [Error & Edge-Case Behavior](#14-error--edge-case-behavior)
15. [UI/UX Design Brief](#15-uiux-design-brief)
16. [Coverage & Missing Information](#16-coverage--missing-information)

---

# 1. Product Overview

## 1.1 What the application is

The mobile application is a **subscription e-book reading app** — a native iOS and Android client
(Expo / React Native) for a digital reading platform. Users sign in, browse a curated catalog of
published books, read them inside a built-in reader, and keep their reading position synchronized
across devices. Books can be downloaded for encrypted offline reading.

The app is one of three clients on a shared backend. The other two are a web admin dashboard and a
web author dashboard, neither of which is in scope here. **The backend is authoritative for all
permissions, entitlement, monetization, and validation.** The mobile app displays backend-computed
values and never recalculates access rules locally.

## 1.2 Primary purpose

Give a reader frictionless access to a library of books they are entitled to read, and preserve
their place in every book they open — online or offline.

## 1.3 Who the users are

The app is described in the project as a *"reader client for children from about age 6, while
remaining suitable for older children, teenagers, and adults."*

This produces two overlapping audiences that the design must serve simultaneously:

- **The child reader (primary, ~6+).** Reads, browses, resumes. Needs plain language, large tap
  targets, forgiving interactions, and no exposure to billing complexity.
- **The accompanying adult (secondary, the payer).** Creates the account, starts the trial,
  subscribes, requests refunds, manages downloads. The existing product copy speaks to this split
  explicitly — for example, entitlement denial says *"Ask a grown-up to Start Free Trial or
  Subscribe on Profile."*

All mobile users are a single backend role: `reader`. There is no publisher, author, or admin
experience in the mobile app.

## 1.4 Value proposition

- A single subscription unlocks the whole published catalog.
- Books render in the engine that matches their layout — flowing text for chapter books, preserved
  page artwork for picture books.
- Reading position, bookmarks, and reading history follow the user across devices ("Smart Resume").
- Books can be taken offline, remain encrypted on the device, and are authorized by a
  server-signed lease.
- A 7-day free trial requires no credit card.

## 1.5 Core user activities

1. **Discover** — browse the catalog, filter by category, sort, search by title/author/publisher,
   browse curated editorial collections.
2. **Evaluate** — open a book's detail page to read its description, categories, and layout type.
3. **Read** — open a book in the reader, navigate chapters or page spreads, adjust reading
   settings (reflowable only), zoom (fixed-layout only), bookmark positions.
4. **Resume** — return to any previously opened book at the saved position, from Home or from the
   book's detail page.
5. **Take offline** — download a book to the device and read it without a network connection.
6. **Manage access** — view subscription status, start a free trial, choose a plan and subscribe,
   request a refund.
7. **Manage account** — register, sign in, sign out.

## 1.6 Major areas of the application

The app has three top-level areas plus a set of pushed detail contexts:

| Area | Contains |
| --- | --- |
| **Home** | Continue reading, entry to search, entry to collections, catalog browse |
| **My books** | Books downloaded to this device for offline reading |
| **Me** | Account identity, subscription status, trial, plans, refund, sign out |
| Pushed contexts | Search, collections list, collection detail, book detail, reader |
| Public (unauthenticated) | Sign in, register |

## 1.7 The overall reading experience

Reading is a **full-screen, focused context** entered from a book detail page, the Home "Continue
reading" shelf, or the offline library. Opening a book performs a multi-step authorization and
decryption pipeline behind a single loading state, then hands off to one of two reader engines
selected by the book's stored layout type. While reading, the app periodically records the user's
position and engagement. Closing the reader flushes the final position and ends the reading
session, so the next open resumes in place.

Book content is encrypted end to end. It is decrypted only in memory, inside the app, at read
time. Plaintext book content is never written to disk.

## 1.8 How content, subscriptions, and reading access relate

Three independent gates control what a user can do:

1. **Authentication.** Everything beyond the sign-in and register screens requires a signed-in
   session. Even browsing the catalog requires authentication.
2. **Catalog visibility.** A book appears in the catalog only if the backend considers it visible:
   publishing status approved, processing complete, and a published timestamp set. Books that fail
   this are simply absent (a direct link returns not-found).
3. **Full-book reading entitlement.** Browsing metadata is free to any authenticated user. Opening
   a book's *content* requires either an active free trial or an active paid subscription period.
   The backend decides this; the app surfaces the decision and routes the user toward the
   subscribe path.

This produces the product's central UX tension the design must handle gracefully: **an
authenticated free user can see the entire catalog but cannot read any of it.** The moment of
denial happens when they try to open a book, not when they browse it.

---

# 2. Feature Inventory

## 2.1 Authentication

### F-AUTH-1 · Account registration — **IMPLEMENTED**

- **What it does.** Creates a new reader account from an email and password, and immediately signs
  the user in.
- **Why it exists.** All content requires an identified user; entitlement and reading progress are
  per-account.
- **Who can use it.** Anyone not signed in.
- **Trigger.** "Create an account" from the sign-in screen, then submitting the form.
- **Depends on.** Email, password. Network availability.
- **After use.** The account is created with role `reader`, a token is persisted, and the user
  lands on Home. No email verification step exists in the mobile flow.
- **Rules.** Password must be 8–72 characters. Email must be a valid email address. Client
  validation is a convenience; the backend is authoritative and its field errors are surfaced
  per-field. Registration always produces a `reader` role account — the app cannot create authors
  or admins.

### F-AUTH-2 · Sign in — **IMPLEMENTED**

- **What it does.** Authenticates an existing user and starts a persisted session.
- **Trigger.** Submitting the sign-in form.
- **After use.** Token persisted to device secure storage; user lands on Home.
- **Rules.** Same field validation as registration. Failure produces a form-level error and the
  user stays on the screen.

### F-AUTH-3 · Session persistence and restore — **IMPLEMENTED**

- **What it does.** Remembers the signed-in user across app launches. On launch the app loads the
  stored token, revalidates it against the backend, and routes accordingly. The native splash
  screen is held until the routing decision is stable, so the user never sees a flash of the wrong
  screen.
- **Why it exists.** A child user should not have to sign in repeatedly.
- **Rules.** Three restore outcomes: no token → signed out; token valid → signed in; token present
  but revalidation fails for a non-authentication reason (e.g. no network, server down) → a
  dedicated recoverable "could not restore your session" state.

### F-AUTH-4 · Sign out — **IMPLEMENTED**

- **What it does.** Ends the session and returns the user to sign-in.
- **Trigger.** "Sign out" on the Me screen.
- **After use.** Four things are cleared: **(1)** all offline downloaded books, their encryption
  keys, and the offline manifest; **(2)** the stored access token; **(3)** the in-memory user;
  **(4)** the entire cached server state.
- **Important UX consequence.** **Signing out destroys all offline downloads.** This is a
  destructive action presented as a routine one. The design should treat it as destructive and
  make the consequence visible before it happens.

### F-AUTH-5 · Session expiry handling — **IMPLEMENTED**

- **What it does.** Any API response indicating the session is no longer valid immediately clears
  the stored token, which drops the user to signed-out and returns them to sign-in.
- **Rules.** There is **no token refresh mechanism**. A refresh-token storage key exists in the
  code but is never written or read. Session expiry is therefore an abrupt sign-out rather than a
  silent renewal.
- **Important UX consequence.** If backend access tokens are short-lived (the platform's admin
  documentation states a 15-minute lifetime and no refresh endpoint), a returning user could be
  bounced to sign-in frequently, including mid-reading. See
  [§16 open questions](#164-questions-to-answer-before-final-design).

## 2.2 Onboarding

### F-ONB-1 · Dedicated onboarding experience — **PLANNED / not evidenced**

There is **no onboarding, welcome tour, age gate, parental gate, profile setup, or first-run
explainer** anywhere in the mobile app. First launch goes directly to sign-in. The only
first-run-adjacent content is explanatory body copy on the sign-in and register screens.

This is a notable gap for a product aimed at 6-year-olds and their parents, and a likely area for
design proposal — but nothing in the project defines it, so it must not be presented as existing.

## 2.3 Home / Discovery

### F-HOME-1 · Continue reading shelf — **IMPLEMENTED**

- **What it does.** Shows the books the user has most recently been reading, so they can jump
  straight back in.
- **Why it exists.** Resuming is the single most common returning-user intent.
- **Information it depends on.** The backend reading-sync snapshot (progress rows), plus each
  book's title fetched from the catalog.
- **Rules.** Sorted by last reading session, newest first. Limited to **5** items. Each entry
  conveys the book cover (or placeholder), title, and a coarse position — chapter number for
  reflowable books, spread number for fixed-layout books.
- **After use.** Tapping an entry opens the reader directly, skipping book detail, and resumes at
  the saved position.
- **Empty state meaning.** The user has never opened a book.

### F-HOME-2 · Catalog browse on Home — **IMPLEMENTED**

- **What it does.** Lists published books available to browse, with sort and category filter
  controls, on the Home surface itself. Rows show cover (or placeholder), title, excerpt, and
  categories.
- **Rules.** Shows the first 20 books only — see F-CAT-4. Supports pull-to-refresh. Displays the
  total count of matching books.

### F-HOME-3 · Entry points to Search and Collections — **IMPLEMENTED**

Home is the only route into the search experience and the collections experience. Both are pushed
contexts, not tabs.

### F-HOME-4 · Personalized greeting — **IMPLEMENTED**

Home addresses the signed-in user by their email address and invites them to pick a book. Note
that greeting a 6-year-old by raw email address is a product weakness; there is no display-name or
nickname concept in the data model.

### F-HOME-5 · Recommendations / personalized discovery — **PLANNED / not evidenced**

There is no recommendation engine, "because you read", "new for you", trending, or algorithmic
personalization. Discovery is: recency sort, popularity sort, category filter, metadata search,
and human-curated collections.

## 2.4 Catalog

### F-CAT-1 · Book list — **IMPLEMENTED**

- **What it does.** Presents browsable published books. Each entry conveys cover (or placeholder),
  title, a short description excerpt, and category names.
- **Rules.** Only catalog-visible books appear (approved + processed + published). A book with
  incomplete processing may appear without a usable layout type and will fail to open.
- **Critical information constraint.** **Cover images are available when an author uploaded a
  `preview_image` (`BookResponse.cover`, signed URL, no reading entitlement).** Author name and
  publisher name are still absent from the catalog contract — see
  [§6.2](#62-book-metadata--what-is-actually-available) and **MG-2**.

### F-CAT-2 · Sorting — **IMPLEMENTED**

Two sort orders: newest first, and most popular. Popularity is backend-defined (ranked by count of
reading-progress records, i.e. how many users have started the book — not by reading minutes or
ratings). Default is newest.

### F-CAT-3 · Category filtering — **IMPLEMENTED**

- **What it does.** Narrows the catalog to a single category, or shows all categories.
- **Depends on.** The backend category taxonomy (up to 50 categories loaded).
- **Rules.** Single-select only — one category or "all". No multi-select, no combined filters, no
  filtering by layout type, book type, or language.

### F-CAT-4 · Pagination — **PARTIALLY IMPLEMENTED**

The backend API fully supports paged access (limit/offset) and the app requests a page size of 20
and displays the true total count. **But the mobile UI never advances past the first page.** There
is no load-more, no infinite scroll, no page controls. A catalog of 500 books surfaces 20 of them
and truthfully reports "500 books".

This is a significant functional gap and a required design input.

### F-CAT-5 · Book detail — **IMPLEMENTED**

- **What it does.** The evaluation and action hub for a single book.
- **Information shown.** Cover (or placeholder); title; category names; a "By {publisher account
  email}" line when available; a layout label ("Reflowable", "Fixed layout", or "Layout not
  ready"); the full description; an offline notice when disconnected; and a resume hint.
- **Actions available.** Read or Continue reading; download for offline or remove the download;
  back.
- **Conditional behavior.** The primary action reads "Continue reading" when saved progress
  exists, otherwise "Read". The offline action is disabled with alternative wording when the
  device has no network. If the book is already downloaded, the download action becomes a remove
  action.
- **Notable.** Book detail does **not** show a subscribe prompt, entitlement state, or progress
  percentage. Entitlement is only discovered by attempting to open the book.

## 2.5 Search

### F-SRCH-1 · Metadata search — **IMPLEMENTED**

- **What it does.** Finds books by **title**, **author**, or **publisher**.
- **Trigger.** The user picks one of the three fields, types a query, and explicitly submits.
- **Rules.** Exactly **one field at a time** — the field selection is a mode, not a set of
  filters. The query is whitespace-normalized; a blank query performs no request. There is **no
  minimum length** (a single character searches) and **no debounce or as-you-type search** —
  search is submit-driven only. Results are the first 20 matches, no pagination. Default field is
  title.
- **After use.** Results render as book rows; tapping one opens book detail.
- **Product note.** Author and publisher are *searchable* but not *displayable* — the app can find
  a book by author but cannot show the user who the author is.

### F-SRCH-2 · In-book full-text search — **PLANNED**

The backend implements full-text search inside a book, including positional highlight data for
fixed-layout text layers. The mobile client has **no in-reader search overlay**. This is tracked
as a deferred reader improvement.

### F-SRCH-3 · Search history / suggestions / autocomplete — **PLANNED / not evidenced**

None exists.

## 2.6 Collections

### F-COLL-1 · Curated collections discovery — **IMPLEMENTED**

- **What it does.** Presents human-curated editorial shelves ("Editorial shelves picked for
  readers"), each containing an ordered set of books.
- **Why it exists.** Editorial curation is the platform's substitute for algorithmic
  recommendation.
- **Rules.** Collection order and book order within a collection are decided by the backend and
  must be preserved by the client. Unpublished books are excluded from reader-facing collection
  results, so a collection's book count can differ from what an editor configured.
- **Screens.** A collections list (each showing title and book count) and a collection detail
  (title, count, ordered books).
- **After use.** Tapping a book in a collection opens book detail.

## 2.7 Reading

Covered in depth in [§5](#5-reader-experience-specification). Summary of features:

| Feature | Status |
| --- | --- |
| F-READ-1 · Open a book with authorization + decryption pipeline | **IMPLEMENTED** |
| F-READ-2 · Automatic engine selection from the book's layout type | **IMPLEMENTED** |
| F-READ-3 · Reflowable reading engine (chapter navigation, scrolling) | **IMPLEMENTED** |
| F-READ-4 · Reflowable reading settings (font size, line spacing, margin, light/dark) | **IMPLEMENTED** |
| F-READ-5 · Fixed-layout reading engine (spread navigation, aspect-fit canvas) | **IMPLEMENTED** |
| F-READ-6 · Fixed-layout stepped zoom | **IMPLEMENTED** |
| F-READ-7 · Fixed-layout pinch-to-zoom / gesture zoom | **PLANNED** (explicitly disabled today) |
| F-READ-8 · Right-to-left reading direction | **PLANNED** (documented in requirements, absent in both engines) |
| F-READ-9 · Fixed-layout dark theme | **PLANNED** |
| F-READ-10 · PDF fixed-layout rendering | **PLANNED** (fails with an explicit "not available in this build" message) |
| F-READ-11 · Persisted / cross-device reading preferences | **PLANNED** (settings are session-local today) |
| F-READ-12 · Close reader with position flush | **IMPLEMENTED** |
| F-READ-13 · Reading session lifecycle (start / activity / end) | **IMPLEMENTED** |
| F-READ-14 · Idle-time detection | **PLANNED** (idle duration is always reported as zero) |
| F-READ-15 · Background/foreground reading lifecycle handling | **PLANNED** (no lifecycle listener in the reader) |

### F-PROG-1 · Smart Resume — **IMPLEMENTED**

- **What it does.** Saves the user's exact reading position and restores it the next time they open
  the book, on any device.
- **When it saves.** Every ~15 seconds while reading, and once more when the reader is closed.
- **Position saved.** For reflowable books: which chapter, and how far scrolled within it. For
  fixed-layout books: which spread, and which page.
- **Rules.** Resume is **automatic and unavoidable** — there is no "start from the beginning"
  option anywhere. Progress saves are best-effort: if a save fails, reading continues silently and
  the user is not told.
- **Important limitation.** **Smart Resume does not work offline.** An offline open always starts
  the book at its beginning, regardless of how far the user had previously read. See
  [§9.5](#95-offline-vs-online-differences).

### F-BM-1 · In-reader bookmarks — **IMPLEMENTED**

- **What it does.** Lets the user save named positions in the current book and jump back to them.
- **Trigger.** A bookmarks action inside the reader opens a bookmark panel.
- **Capabilities.** Add a bookmark at the current position; jump to any saved bookmark (which
  closes the panel and moves the reader); remove a bookmark.
- **Information a bookmark holds.** The layout-specific position, and a system-generated label
  derived from it — chapter and scroll offset for reflowable, spread and page for fixed-layout.
- **Rules.** Bookmarks are **per-book and only reachable from inside that book's reader.** There is
  no cross-book bookmark library screen. Bookmark labels are **not user-editable** — the user
  cannot name or annotate a bookmark. There is no highlighting, note-taking, or text selection
  feature. No client-side bookmark limit.

### F-ACT-1 · Reading activity and engagement tracking — **IMPLEMENTED, invisible to the user**

- **What it does.** Periodically reports the user's position and active reading duration to the
  backend. Fixed-layout books additionally report visual engagement time per page — the platform
  pays authors based on real reading engagement, and this is the client half of that mechanism.
- **Rules.** Reported roughly every 15 seconds during reading. **Entirely invisible in the UI** —
  the user is never shown reading time, streaks, statistics, or minutes read. Failures are silent.
- **Design consideration.** The data to build a reading-stats experience is being collected but is
  not surfaced anywhere. Any such feature would be new product surface, not a re-skin.

## 2.8 Library

### F-LIB-1 · My books (downloaded books) — **IMPLEMENTED**

- **What it does.** Lists every book downloaded to this device for offline reading, and lets the
  user open or remove each one.
- **Information shown per book.** Title and layout type. That is all that is cached — see
  [§9.2](#92-what-is-stored-locally).
- **Rules.** **"My books" contains only downloads.** It is not a personal library, not a
  reading-history view, not a favorites list, and not a shelf of everything the user has read.
  Continue-reading lives on Home instead. It works fully without a network. It shows an offline
  notice when disconnected. It is emptied entirely on sign-out.
- **Important information architecture consequence.** The tab is labeled "My books", which a user
  will reasonably read as "my personal library". Its actual contents are "books saved on this
  device". This mismatch between label and meaning is a real UX risk worth resolving in design.

### F-LIB-2 · Favorites / wishlist / custom shelves — **PLANNED / not evidenced**

Users cannot favorite, save-for-later, rate, review, or organize books into personal shelves.

## 2.9 Subscriptions, trial and paid access

Covered in depth in [§8](#8-subscription-trial--entitlement-model).

| Feature | Status |
| --- | --- |
| F-SUB-1 · View subscription status (plan, reading access, status, period, trial remaining) | **IMPLEMENTED** |
| F-SUB-2 · Start a 7-day free trial with no credit card | **IMPLEMENTED** |
| F-SUB-3 · Browse purchasable plans and select one | **IMPLEMENTED** |
| F-SUB-4 · Subscribe via hosted external checkout | **IMPLEMENTED** |
| F-SUB-5 · Request a refund within the refund window | **IMPLEMENTED** |
| F-SUB-6 · Entitlement-denied recovery path into the subscribe flow | **IMPLEMENTED** |
| F-SUB-7 · Cancel a subscription from the mobile app | **NOT AVAILABLE** — no cancel action exists in the mobile app |
| F-SUB-8 · Manage payment method / view invoices / billing history | **NOT AVAILABLE** |
| F-SUB-9 · Native in-app purchase (App Store / Play billing) | **NOT AVAILABLE** — payment is external hosted checkout only |
| F-SUB-10 · Renewal reminders, trial-expiry warnings, dunning notices | **NOT AVAILABLE** |

**Notable absence.** The mobile app can *start* a paid subscription and can *request a refund*, but
it cannot *cancel* one. A user who wants to stop paying has no in-app path. This is a hard gap to
flag, not to design around silently.

## 2.10 Account and settings

### F-ACC-1 · Account identity view — **IMPLEMENTED**

The Me screen shows the user's email address and their role, both read-only.

### F-ACC-2 · Profile editing — **NOT AVAILABLE**

Users cannot change their email, password, display name, or avatar, and cannot delete their
account. There is no profile-edit surface at all.

### F-ACC-3 · Application settings screen — **NOT AVAILABLE**

There is **no settings screen**. No app-level appearance setting, no language selection, no
notification preferences, no download preferences (Wi-Fi-only, storage cap), no accessibility
settings, no about/legal/privacy screen. The only user-adjustable preferences in the entire
product are the four reflowable reading controls, and those live inside the reader and reset when
the reader closes.

This is one of the largest structural gaps in the product.

## 2.11 Notifications

### F-NOTIF-1 · Push or local notifications — **NOT AVAILABLE**

No push notification capability, no local scheduling, no in-app notification center, no messaging
or announcements. Notification-adjacent product moments that would normally be notified (trial
about to expire, subscription renewed, payment failed, download finished) have no delivery channel.

## 2.12 Offline reading

Covered in depth in [§9](#9-offline-experience).

| Feature | Status |
| --- | --- |
| F-OFF-1 · Download a book for offline reading | **IMPLEMENTED** |
| F-OFF-2 · Download progress feedback | **IMPLEMENTED** |
| F-OFF-3 · Integrity verification of the downloaded file | **IMPLEMENTED** |
| F-OFF-4 · Open a downloaded book with no network | **IMPLEMENTED** |
| F-OFF-5 · Server-signed offline reading authorization (lease) | **IMPLEMENTED** |
| F-OFF-6 · Re-authorize an existing download without re-downloading | **IMPLEMENTED** |
| F-OFF-7 · Remove a single download | **IMPLEMENTED** |
| F-OFF-8 · Purge all downloads on sign-out | **IMPLEMENTED** |
| F-OFF-9 · Device-clock-tampering resistance | **IMPLEMENTED** |
| F-OFF-10 · Offline reading progress queue (save progress while offline, sync later) | **PLANNED** — explicitly out of scope |
| F-OFF-11 · Offline bookmark creation | **PLANNED / UNKNOWN** — no offline write queue exists |
| F-OFF-12 · Download-all / bulk download / auto-download | **NOT AVAILABLE** |
| F-OFF-13 · Storage usage view or storage management | **NOT AVAILABLE** |
| F-OFF-14 · Wi-Fi-only download preference | **NOT AVAILABLE** |

## 2.13 Synchronization

### F-SYNC-1 · Reading progress and bookmark sync — **IMPLEMENTED (online only)**

- **What it does.** Reading position and bookmarks are stored server-side, so any device signed
  into the account sees the same state. The Home continue-reading shelf is built from this
  server-side snapshot.
- **Rules.** Sync is **implicit and immediate, not deferred** — every write goes straight to the
  server while online. There is **no local write queue, no offline sync, no conflict resolution,
  and no sync status surface.** The user is never shown "syncing", "synced", "pending", or a
  last-synced time.
- **Consequence.** Anything the user does while fully offline that would normally be synced —
  reading progress, new bookmarks — is **lost**, silently.

## 2.14 Network handling

### F-NET-1 · Real connectivity awareness — **IMPLEMENTED**

- **What it does.** The app observes actual device connectivity and exposes a single online/offline
  signal that drives behavior and messaging.
- **Rules.** Deliberately **fails open**: when connectivity is unknown or indeterminate, the app
  treats itself as online. This is a conscious product decision so the app never falsely claims to
  be offline. It also means a device with a captive portal or a dead-but-connected network may
  behave as online and produce request failures instead of a clean offline state.
- **Where it surfaces.** An offline notice on My books and on book detail; the download action
  disabled and reworded when offline; the reader routing to the offline open path; server-state
  fetching paused while offline.

### F-NET-2 · Slow-network handling — **NOT AVAILABLE**

There is no slow-connection detection, no request timeout, no "this is taking a while" state, and
no cancellable requests. A hung network request produces an indefinite loading state with no
escape other than leaving the screen. This is a meaningful reliability gap for a mobile product.

## 2.15 Error recovery

### F-ERR-1 · Per-screen recoverable error states — **IMPLEMENTED**

Every data-backed screen has an explicit error state with a retry affordance. Error messages are
written in plain, child-appropriate language and never expose technical detail.

### F-ERR-2 · Global crash boundary — **IMPLEMENTED**

An uncaught rendering error anywhere shows a friendly "something went wrong" state with a single
retry action that re-renders the app, and advice to restart the app if it persists.

### F-ERR-3 · Entitlement-denied recovery — **IMPLEMENTED**

When a book cannot be opened for access reasons, the error state replaces the generic retry with a
direct route into the subscribe path on the Me screen — the app's most important
conversion moment.

### F-ERR-4 · Session-restore recovery — **IMPLEMENTED**

When the app has a stored session it cannot revalidate, the user gets a two-choice recovery: retry
the restore, or abandon it and sign in fresh (which purges offline content).

### F-ERR-5 · Field-level validation feedback — **IMPLEMENTED**

Auth forms map backend validation errors back onto the specific offending field, in addition to a
form-level message.

## 2.16 Security-related user experiences

### F-SEC-1 · Encrypted content at rest and in transit — **IMPLEMENTED**

Books are stored and transferred encrypted, and are decrypted only in memory inside the app.
Plaintext book content is never written to the device's filesystem. Content keys are held in the
device's secure keystore and are zeroed in memory immediately after use.

**UX-visible consequence.** Downloaded books are unreadable outside the app — they cannot be
opened by a file manager, shared, exported, or copied. Users should not expect to "find" their
downloads as files.

### F-SEC-2 · Server-authorized offline reading — **IMPLEMENTED**

A downloaded book carries a server-signed authorization with an expiry. The app validates it
before every offline decrypt and **fails closed** — if the authorization is missing, expired,
tampered with, issued to a different account, or issued for a different book, the download will
not open. See [§9.3](#93-how-offline-access-is-authorized).

### F-SEC-3 · Device clock tamper resistance — **IMPLEMENTED**

The app remembers the latest trustworthy server time it has seen (from API response headers and
from issued authorizations) and detects when the device clock has been moved backwards beyond a
5-minute tolerance. If it detects rollback, offline reading is locked with a distinct message
telling the user their device time changed and to reconnect.

**UX consequence.** A legitimate timezone change, a manual clock correction, or a device that
restores a bad clock on boot can lock a paying user out of their downloads until they reconnect.
The recovery path must be obvious and non-accusatory.

### F-SEC-4 · Screenshot / screen-recording prevention, watermarking — **UNKNOWN**

Requirements documents describe client-side anti-piracy intent (content unopenable outside the
app, no direct file access), which is satisfied by F-SEC-1. **No screenshot blocking, screen
recording detection, or visible watermarking is implemented or specified.** Do not design as if
these exist.

### F-SEC-5 · Biometric lock, app passcode, parental PIN — **NOT AVAILABLE**

No app-level lock of any kind. Notably, there is **no parental gate on the billing surface** — a
child can reach the plan picker, subscribe button, and refund action unaided. The product's only
mitigation is copy ("Ask a grown-up..."). This is a design problem worth raising.

---

# 3. Screen Inventory

Screens are grouped by access context. For each: purpose, access, what the user accomplishes,
what information must be present, what actions originate there, where they can go, and conditions.

## 3.1 Bootstrap surfaces

### S-01 · Splash / session bootstrap — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | Hold the app until it knows whether the user is signed in, so no wrong screen flashes. |
| **Access** | Every launch, automatically. |
| **User accomplishes** | Nothing — it is a wait. |
| **Information needed** | Brand presence and an indication that the app is working. |
| **Actions** | None. Not dismissible. |
| **Navigates to** | Home (signed in), sign-in (signed out), or session-restore-failed. |
| **Conditions** | Duration depends on network. If the backend is slow or unreachable, this state persists — there is no timeout. |

### S-02 · Session restore failed — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | Recover when the app has a saved session it cannot currently confirm (typically no network or backend unavailable). |
| **Access** | Automatic, only in that condition. |
| **User accomplishes** | Chooses whether to retry or start over. |
| **Information needed** | That this is a connection problem rather than an account problem; the specific reason when available; that their session was not necessarily lost. |
| **Actions** | Retry the restore; abandon and go sign in. |
| **Conditions** | **Abandoning purges all offline downloads.** The user must understand this before choosing it. |

### S-03 · Global error boundary — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | Catch unexpected app-level failures without a crash-to-home. |
| **Access** | Automatic on an unhandled rendering error. |
| **Information needed** | Reassurance, a next step, and the fallback advice to restart. Never technical detail. |
| **Actions** | Retry. |

## 3.2 Public (unauthenticated) screens

### S-04 · Sign in — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | Authenticate a returning user. |
| **Access** | Anyone signed out. Signed-in users are redirected away. |
| **User accomplishes** | Enters the app. |
| **Information needed** | Product identity; a short reassurance of what signing in gives them ("find books and keep your place"); the two required fields; validation feedback; a route to registration. |
| **Actions** | Submit credentials; go to registration. |
| **Navigates to** | Home on success; registration. |
| **Conditions** | Fields and submit disable while in flight. Failure keeps the user here with a form-level error. **No password reset, no social sign-in, no "remember me", no guest/browse-without-account mode.** |

### S-05 · Register — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | Create a new reader account. |
| **Access** | Anyone signed out. |
| **User accomplishes** | Gets an account and is signed straight in. |
| **Information needed** | The password requirement stated up front (8+ characters); the two fields; per-field validation; a route back to sign-in. |
| **Actions** | Submit; go to sign-in. |
| **Navigates to** | Home on success. |
| **Conditions** | No confirm-password, no terms acceptance, no email verification step, no age or parental gate. New accounts have **no reading entitlement** — they land on Home able to browse but not read. |

## 3.3 Main authenticated shell

### S-06 · Home — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | The default landing surface: resume reading, and discover what to read next. |
| **Access** | Signed-in users. |
| **User accomplishes** | Returns to a book in progress; browses and filters the catalog; enters search; enters collections. |
| **Information needed** | Who they are; their in-progress books with a sense of where they left off; the browsable catalog with total count; the active sort and category filter; loading/empty/error states for both the resume shelf and the catalog independently (they fail separately). |
| **Actions** | Open a continue-reading entry (straight into the reader); open a catalog book (to detail); change sort; change category filter; pull to refresh; go to search; go to collections. |
| **Navigates to** | Reader, book detail, search, collections; and the other two tabs. |
| **Conditions** | Two independent async regions with independent states. The catalog shows only its first page. Entitlement state is **not** represented here at all — a free user sees a full, inviting catalog with no indication they cannot read any of it. |

### S-07 · My books (offline library) — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | Manage and open books saved on this device. |
| **Access** | Signed-in users. Fully functional with no network. |
| **User accomplishes** | Opens a downloaded book; frees space by removing one. |
| **Information needed** | That these books are stored encrypted on this device until removed; each book's title and layout; current connectivity and what it means ("you can still open downloaded books"); loading/empty/error states; a clear empty state that teaches *how* to get books here. |
| **Actions** | Open a book (into the reader); remove a download; retry loading; navigate tabs. |
| **Navigates to** | Reader. |
| **Conditions** | Contains **only** downloads. Cached metadata is minimal — title and layout only, no description, categories, or author. Emptied entirely by sign-out. A book listed here may still refuse to open if its offline authorization has expired. |

### S-08 · Me (account, subscription, trial, plans, refund) — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | The single screen for identity and everything about paying for and accessing content. |
| **Access** | Signed-in users. |
| **User accomplishes** | Understands their current reading access; starts a free trial; picks a plan and subscribes; requests a refund; signs out. |
| **Information needed** | Email and role; **plan name and type**; **reading access level** (free / trial / paid); **subscription status** (active / canceled); **paid access end date** when there is one; **trial time remaining** when on trial; the trial offer with its terms (7 days, no card, does not itself start a paid subscription) when eligible; the purchasable plans with prices; the note that reading access is decided by the server; per-action loading and error states. |
| **Actions** | Start free trial (only when eligible); select a plan; subscribe (opens external checkout); request refund (only for a paid plan) with a confirm step; retry loading subscription; sign out. |
| **Navigates to** | External hosted checkout and back; sign-in on sign-out. |
| **Conditions** | This screen carries an unusual amount of conditional content — the trial offer, trial-remaining, period end, refund action, and post-checkout messages each appear only in specific states. It is also the destination of the entitlement-denied path, so users often **arrive here with intent**, from a book they wanted to read. It has **no cancel-subscription action** and **no parental gate**. |

## 3.4 Pushed discovery contexts

### S-09 · Search — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | Find a specific book by metadata. |
| **Access** | Signed-in users, from Home. |
| **User accomplishes** | Locates a known book by its title, author, or publisher. |
| **Information needed** | Which of the three fields is currently being searched; the query; a pre-search hint explaining that they must type and then submit; result count; results; distinct idle / empty-results / error states. |
| **Actions** | Choose a search field; type; submit; clear; open a result; go back. |
| **Navigates to** | Book detail; back to Home. |
| **Conditions** | One field at a time. Submit-driven, not live. First 20 results only. Blank submits do nothing. Results carry the same limited metadata as catalog rows — so a user who searched by author gets back results that never show an author. |

### S-10 · Collections list — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | Show curated editorial shelves. |
| **Access** | Signed-in users, from Home. |
| **User accomplishes** | Finds a themed shelf to explore. |
| **Information needed** | What collections are ("editorial shelves picked for readers"); collection titles; how many books each holds; count of collections; loading/empty/error states. |
| **Actions** | Open a collection; retry; back. |
| **Conditions** | Backend order must be preserved. Book counts reflect only reader-visible books. |

### S-11 · Collection detail — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | Show the ordered books in one curated shelf. |
| **Access** | Signed-in users, from the collections list (or a direct route). |
| **User accomplishes** | Browses a curated set and picks a book. |
| **Information needed** | Collection title; book count; books in editorial order; loading/empty/error states. |
| **Actions** | Open a book; retry; back. |
| **Conditions** | Four distinct negative states, which the design should differentiate: the link itself was invalid; the collection is not available (removed or hidden); the collection could not be loaded (transient); and the collection loaded but currently has no published books. |

### S-12 · Book detail — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | The decision and action point for a single book. |
| **Access** | Signed-in users, from catalog rows, search results, or collection contents. |
| **User accomplishes** | Decides whether to read it; starts or resumes reading; makes it available offline; removes it. |
| **Information needed** | Cover (or placeholder); title; categories; the publisher/owner line when available; the layout type; the full description; connectivity impact on downloading; whether they already have progress (which changes the primary action's meaning) and a matching resume hint; whether it is already downloaded; download progress; the outcome of the last offline action. |
| **Actions** | Read / Continue reading; download for offline; remove offline download; retry loading; back. |
| **Navigates to** | Reader; back. |
| **Conditions** | Primary action label switches on saved progress. Offline action has three shapes: download (online, not downloaded), disabled "connect to download" (offline, not downloaded), and remove (downloaded). Cover art shows when a preview image exists; otherwise a placeholder. Author name and publisher name are still unavailable (**MG-2**). **No entitlement information at all** — the user learns they cannot read the book only after tapping Read. |

## 3.5 Reader context

### S-13 · Reader — opening — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | Cover the multi-step authorization, download, decryption, and parsing pipeline with a single calm wait. |
| **Access** | Signed-in users opening any book. |
| **Information needed** | That the book is opening. Nothing else — the internal pipeline steps are deliberately not exposed. |
| **Actions** | None; not cancellable. |
| **Conditions** | For a large book on a slow network this can be a long wait with **no progress indication and no cancel**. This is the app's most fragile wait and a priority design concern. |

### S-14 · Reader — reflowable engine — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | Read flowing text content (chapter books) comfortably. |
| **Access** | Automatically, for books whose layout is reflowable. |
| **User accomplishes** | Reads; moves between chapters; scrolls within a chapter; tunes text presentation for comfort; bookmarks positions; leaves. |
| **Information needed** | Book title; current chapter title; position in the book (which chapter of how many); the current state of each reading setting; whether they are at the first or last chapter; loading and error states for the content itself. |
| **Actions** | Previous / next chapter; scroll; increase/decrease font size; increase/decrease line spacing; increase/decrease margin; toggle light/dark reading theme; open bookmarks; close the reader. |
| **Conditions** | Settings are **session-local** — they reset when the reader closes. Changing chapter resets scroll to the top. Position is captured continuously and saved periodically and on close. No RTL support. No text selection, search, dictionary, or table of contents jump list. |

### S-15 · Reader — fixed-layout engine — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | Read page-designed content (picture books, illustrated chapter books) with artwork and text positioning preserved exactly. |
| **Access** | Automatically, for books whose layout is fixed. |
| **User accomplishes** | Views spreads; moves between spreads; zooms in to inspect detail; bookmarks spreads; leaves. |
| **Information needed** | Book title; current spread title; position (which spread of how many, and which page); whether they are at the first or last spread; whether zoom can go further in or out; loading and error states. |
| **Information deliberately preserved** | Original page proportions. Content is fitted to the viewport without cropping or distortion, letterboxed as needed, so a 4:3 page and a tall phone screen coexist correctly. |
| **Actions** | Previous / next spread; zoom in; zoom out; open bookmarks; close. |
| **Conditions** | Typography and theme controls are correctly **absent** — they are meaningless for fixed pages. Zoom is **stepped button zoom, not pinch**; pinch gestures are explicitly disabled. Zoom resets when the spread changes. Fixed-layout PDF sources cannot be rendered in this build. No RTL page-turn direction. |

### S-16 · Reader — bookmarks panel — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | Save and return to positions within the current book. |
| **Access** | From inside the reader, for the current book only. |
| **User accomplishes** | Adds a bookmark where they are; jumps to a saved one; removes one. |
| **Information needed** | What bookmarks do in this engine ("save and jump to chapter positions" vs "to spreads"); the list of saved bookmarks with their positions; loading, empty, and per-action error states. |
| **Actions** | Add at current position; jump to a bookmark (moves the reader and dismisses the panel); remove a bookmark; dismiss. |
| **Conditions** | Overlays the reader without ending the session. Labels are system-generated and non-editable. No notes or highlights. |

### S-17 · Reader — open failed — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | Explain why a book will not open, and offer the right recovery for the reason. |
| **Access** | Automatic on any open failure. |
| **Information needed** | A plain-language reason, and a recovery action **matched to the cause**. |
| **Actions** | Either "go to subscribe" (for access failures) or "try again" (for everything else), plus always a way back. |
| **Conditions** | This screen carries the product's key conversion moment. The distinct causes it must express are enumerated in [§14](#14-error--edge-case-behavior): needs entitlement; offline authorization locked; device clock changed; not downloaded and offline; book unavailable; layout not ready; file integrity failure; and generic failure. |

## 3.6 External context

### S-18 · Hosted checkout (external browser session) — **IMPLEMENTED**

| | |
| --- | --- |
| **Purpose** | Take payment outside the app, on the payment provider's hosted page. |
| **Access** | From the subscribe action on Me. |
| **User accomplishes** | Pays, or abandons. |
| **Actions** | Provider-controlled; not designable here. |
| **Navigates to** | Back into the app via a return link, landing on Me. |
| **Conditions** | The app does not design or control this surface. It **must not** treat the return link as proof of payment — entitlement is re-read from the server afterwards. The app must handle three returns distinctly: completed, canceled, and dismissed-without-outcome. |

## 3.7 Screens implied by functionality but absent

These are screens a reader would reasonably expect, which the product does not have. They are
listed so the design can propose them deliberately rather than assume them.

| Missing screen | Status | Consequence |
| --- | --- | --- |
| Onboarding / welcome | **PLANNED / not evidenced** | First-time users get no orientation |
| Settings | **NOT AVAILABLE** | No home for app preferences, legal, about, storage |
| Profile edit | **NOT AVAILABLE** | Email and password are unchangeable in-app |
| Password reset / forgot password | **NOT AVAILABLE** | A user who forgets their password is locked out with no in-app recovery |
| Cancel subscription | **NOT AVAILABLE** | No in-app path to stop paying |
| Billing history / payment method | **NOT AVAILABLE** | No record of what was charged |
| Cross-book bookmark library | **PLANNED** (explicitly out of scope) | Bookmarks are only reachable inside each book |
| Reading statistics | **NOT AVAILABLE** | Engagement data is collected but never shown |
| Storage / download management | **NOT AVAILABLE** | No visibility into space used |
| Notification center | **NOT AVAILABLE** | No channel for trial-expiry or billing events |
| In-reader table of contents | **NOT AVAILABLE** | Chapter navigation is sequential only |
| In-reader search | **PLANNED** (backend ready) | Cannot search within a book |

---

# 4. User Journeys & Flows

## 4.1 New user: install to first reading attempt

**Starting state.** App freshly installed, no session.
**Intent.** "I want to read books."

**Steps.**
1. Launch → bootstrap resolves to signed-out → sign-in screen.
2. User chooses to create an account.
3. Enters email and a password of 8+ characters; submits.
4. Account is created as a reader; session persisted; user lands on Home.
5. Home shows an empty continue-reading shelf and a populated catalog.
6. User opens a book's detail page and taps Read.
7. **Decision point — entitlement.** A brand-new account has no reading entitlement.
8. The reader open fails with an access-required explanation pointing at trial or subscribe.
9. User follows that path to Me.

**Key decisions.** Register vs sign in; which book to try; whether to pursue access after denial.

**Outcomes.** Most likely: the user reaches Me with intent to start a trial (continue at §4.4).
Alternatively they abandon at the denial.

**Alternative paths.** Registration fails on a duplicate email or backend validation → per-field
error, user stays and corrects. User already has an account → routes to sign-in instead.

**Failure cases.** No network during registration → form-level failure; nothing is created. Backend
unreachable at launch → indefinite splash (no timeout).

**Final state.** Authenticated free user who has discovered that reading requires access.

**Critical UX observation.** The product's onboarding is *denial-driven*: nothing tells a new user
they need a subscription until they try to read and are refused. There is no value framing, no
trial offer at registration, and no entitlement signal while browsing. Fixing the first-run
narrative is the single highest-leverage design opportunity in this product.

## 4.2 Returning user: open to reading

**Starting state.** App installed, valid stored session.
**Intent.** "Continue my book."

**Steps.**
1. Launch → splash held while the stored session is revalidated.
2. Session confirmed → Home.
3. Continue-reading shelf shows up to 5 recent books with a coarse position each.
4. User taps one → straight into the reader (book detail is skipped).
5. Reader runs the open pipeline, restores the saved position, and renders.
6. User reads.

**Outcomes.** Reading resumes in place.

**Alternative paths.** Shelf is empty → user browses the catalog instead. User goes via book detail
→ the primary action reads "Continue reading" with a matching hint.

**Failure cases.** Session revalidation fails on network → session-restore-failed recovery.
Session no longer valid → silent drop to sign-in. Continue-reading fetch fails → shelf shows its
own error with retry while the rest of Home still works. Entitlement lapsed since last read →
opening now fails with the access path even though the book is in their history. This last case
deserves careful design: a book in "continue reading" that refuses to open is a jarring betrayal
of the affordance.

**Final state.** Reading, at the saved position.

## 4.3 Free user hits the access wall

**Starting state.** Authenticated, no trial, no paid period.
**Intent.** "Read this book."

**Steps.**
1. Browses freely — catalog, search, collections, book detail all fully available.
2. Nothing at any point indicates that reading is gated.
3. Taps Read.
4. Open pipeline reaches the backend entitlement check and is refused.
5. Reader shows the access-required explanation, phrased for a child to relay to an adult, and
   offers a direct route to the subscribe path.
6. **Decision point.** Follow the path, or go back.

**Outcomes.** Reaches Me → trial or subscription (§4.4, §4.5). Or abandons.

**Failure cases.** The denial is discovered *inside* a full-screen reader context the user entered
expecting content — the mode switch from "I'm about to read" to "you can't read" is abrupt.

**Final state.** Either on the conversion path, or back in discovery.

**Design implication.** Consider surfacing entitlement state earlier — during browsing and on book
detail — so the wall is anticipated rather than sprung.

## 4.4 Trial user: start, use, expire

**Starting state.** Authenticated, trial-eligible (server-determined, one trial per account,
lifetime).
**Intent.** "Try before paying."

**Steps.**
1. On Me, a trial offer appears **only when the server says the account is eligible**.
2. Terms are stated: 7 days free, no credit card required, and explicitly that this does not by
   itself start a paid subscription.
3. User starts the trial.
4. Server activates it; the app re-reads subscription state.
5. Me now shows reading access "Free Trial", the time remaining, and a note that no card was
   charged.
6. User can now open and read any catalog book, and download books for offline reading.
7. As the trial runs down, the remaining-time display steps from days to hours to a
   "trial ending soon" state.
8. **Trial expires.** Reading access reverts to free. Reading attempts are refused again.
   Downloaded books lock once their offline authorization expires.

**Key decisions.** Whether to start the trial; whether to convert before it ends.

**Outcomes.** Converts to paid (§4.5); or lapses back to free with downloads locked.

**Alternative paths.** Already used the trial → the offer is absent and any attempt is refused as
already-used. Already has paid access → trial is unnecessary and refused as such.

**Failure cases.** Trial start fails on network or server → error on Me, state unchanged.

**Final state.** Trial user, converted subscriber, or lapsed free user.

**Critical gap.** **There is no expiry warning of any kind.** No notification channel exists, and
the remaining-time display is only visible if the user happens to visit Me. A trial can end
silently, and the user discovers it by being refused a book they were reading yesterday. This is
both a UX failure and a conversion failure.

## 4.5 Paid subscriber: subscribe, read, lifecycle

**Starting state.** Authenticated, without paid access.
**Intent.** "Get full access."

**Steps.**
1. On Me, the user sees purchasable plans with names, descriptions, and prices.
2. Selects a plan. (If none is selected and they try to subscribe, they are prompted to pick one.)
3. Subscribes → the app opens the payment provider's hosted checkout in an external browser
   session.
4. User completes payment there.
5. Returns to the app via a return link. **The return link never grants access.** The app states
   that it is refreshing the plan from the server, and re-reads subscription state.
6. Once the server confirms, Me shows plan, reading access "Paid", status "Active", and the date
   paid access runs through.
7. User reads and downloads freely.

**Key decisions.** Which plan; whether to complete payment.

**Outcomes.**
- **Completed** → app states checkout finished and is refreshing from the server.
- **Canceled at checkout** → app states the plan was not changed.
- **Dismissed without an outcome** → app states the plan updates only after the server confirms
  payment. This honest-uncertainty state is important: the user may in fact have paid.

**Alternative paths.** Already entitled → a second checkout is refused ("this plan is already
active"). The chosen plan is not purchasable → the user is told to pick one that is ready to buy.
Return links are misconfigured → a configuration error surfaces.

**Failure cases.** Payment succeeds but the server has not yet processed it when the app re-reads
→ the user briefly sees stale non-paid state. The messaging is designed for exactly this, but the
design must not let the user conclude their payment failed.

**Subscription lifecycle after activation.**

| Event | Effect on the user |
| --- | --- |
| Period runs | Paid reading works; Me shows the period end date |
| Payment fails on renewal | **No local status change and no user-visible signal.** Recorded server-side only. The user is not told. |
| Canceled (elsewhere — not possible in-app) | Status shows "Canceled" **but reading continues until the period end date** |
| Period end passes | Reading access ends; reading attempts refused; downloads lock as their authorizations expire |
| Refund granted within the window | **Paid reading ends immediately**, not at period end |

**Final state.** Active subscriber, canceled-but-still-active subscriber, or expired user.

## 4.6 Refund

**Starting state.** Paid plan on the account.
**Intent.** "Undo this purchase."

**Steps.** On Me, a refund request action is available whenever the plan is a paid one. Requesting
it surfaces a confirmation that explicitly states the server checks a 7-day window. Confirming
sends the request; the app re-reads subscription state.

**Outcomes.** Granted → the paid subscription is canceled and **paid reading ends immediately**.
Refused (outside the window) → the server's reason is shown and nothing changes.

**Failure cases.** Network failure → error, no state change.

**Note.** The client never evaluates the refund window; it only relays the server's decision. Also
note the refund action is offered based on plan type alone, so users outside the window still see
it and can be refused — the confirmation copy sets that expectation deliberately.

## 4.7 Search journey

**Starting state.** Authenticated, on Home.
**Intent.** "Find a specific book."

**Steps.** Home → search. The user picks which field to search (title, author, or publisher),
types, and submits explicitly. Results appear as book rows with a count. Tapping one opens book
detail, from which the normal reading journey continues.

**Outcomes.** Match found and opened; no matches (distinct empty state inviting different words);
search failed (error with retry).

**Alternative paths.** Nothing typed yet → an idle hint teaches the submit-driven model. Blank
submit → nothing happens. Clear → resets query, results, and field back to title.

**Failure cases.** The desired book exists beyond the first 20 results → unreachable, with no
indication that more exist. Offline → search cannot run.

**Design implication.** Because search does not run as the user types, the idle hint carries real
instructional weight; and because author/publisher are searchable but never displayed, result
lists cannot confirm *why* something matched.

## 4.8 Reading journey (full session)

**Starting state.** Authenticated and entitled, on book detail or the continue shelf.
**Intent.** "Read this book."

**Steps.**
1. User opens the book.
2. A single "opening" wait covers the whole pipeline: connectivity check → book metadata → layout
   validation → engine selection → look up saved progress → start a reading session → obtain a
   time-limited content delivery authorization.
3. The matching engine loads content: prefer an existing offline copy, otherwise download the
   encrypted file, verify its integrity, obtain the content key, decrypt in memory, and parse.
4. Content renders at the resumed position (or the beginning if there is no progress).
5. User reads, navigating chapters or spreads, adjusting settings or zoom, optionally bookmarking.
6. Every ~15 seconds the app quietly records position, activity, and (for fixed-layout) visual
   engagement.
7. User closes the reader. The final position is flushed, the reading session is ended, and the
   continue-reading data is refreshed so Home reflects the session immediately.
8. Later, the user reopens the book and resumes in place.

**Key decisions.** Navigate or adjust; bookmark or not; when to leave.

**Outcomes.** Position preserved and reflected on Home and in the book's primary action label.

**Alternative paths.** A session was already open for this book → the app silently recovers the
existing session rather than surfacing a conflict. An offline copy exists → it is used in
preference to downloading, even while online.

**Failure cases.** Any pipeline step can fail; each maps to a specific user-facing explanation
(see [§14](#14-error--edge-case-behavior)). Progress saves fail silently and reading continues. If
the app is killed rather than closed via the reader, the last periodic save is the resume point —
up to ~15 seconds of reading is lost, and the session is never formally ended.

**Final state.** Out of the reader with position saved, or stopped at an error.

## 4.9 Offline journey

**Starting state.** Authenticated, entitled, online.
**Intent.** "Read where I have no connection."

**Steps — preparing.**
1. On a book's detail page, while online, the user chooses to download it.
2. The app verifies connectivity, fetches the book's metadata, confirms it has a supported layout,
   and obtains a delivery authorization.
3. The encrypted file downloads with progress feedback — a percentage when the size is known,
   otherwise an indeterminate "downloading" state.
4. The file's integrity is verified against its checksum.
5. A short-lived reading session is opened solely to obtain the content key and the
   **server-signed offline reading authorization**, then closed again.
6. The content key is stored in the device's secure keystore; the encrypted file and a small
   metadata record (title, layout, checksum, the signed authorization) are stored on the device.
7. The user is told the download is saved and can be read offline from My books.

**Steps — reading offline.**
8. Connection is lost. My books shows an offline notice and continues to work.
9. The user opens a downloaded book. The app takes the offline path entirely — no network calls.
10. Before decrypting, the app **validates the signed offline authorization**: it must exist, match
    this book and this account, carry a valid signature, not be expired against trusted time, and
    the device clock must not have been rolled back.
11. Valid → the file is decrypted in memory and rendered.
12. **The book opens at its beginning, not at the saved position** — offline reading has no access
    to server-side progress.
13. Reading works normally. Position and bookmark writes cannot reach the server and are lost.

**Steps — reconnecting.**
14. Connectivity returns; server-state fetching resumes.
15. On the next online open of a downloaded book, if its offline authorization has expired, the app
    silently obtains a fresh key and authorization and **unlocks the existing download without
    re-downloading the file**. Reading proceeds and Smart Resume works again.

**Key decisions.** Which books to take offline (one at a time — there is no bulk download).

**Outcomes.** Successful offline reading; or a locked download requiring reconnection.

**Failure cases.** Not downloaded and offline → told to connect or download first. Authorization
expired, missing, tampered with, or for another account → locked, with a message pointing at
reconnecting or subscribing. Device clock rolled back → locked, with a distinct message about the
device time. Corrupted file → integrity failure. Offline with a lapsed trial → downloads lock when
the authorization expires, which is the intended design.

**Final state.** Reading offline, or blocked pending reconnection.

**Critical UX observations.**
- **Offline loses your place.** A user who reads offline for an hour and then reconnects finds
  their position unchanged from before, and their offline reading has no record. This is the most
  user-hostile behavior in the product.
- **Downloaded ≠ permanently yours.** Downloads are leased and expire. My books gives no
  indication of remaining offline validity, so a locked download is always a surprise.
- **Sign-out destroys downloads.** Including the abandon path on the session-restore screen.

## 4.10 Session expiry mid-use

**Starting state.** Signed in and active.
**Intent.** Continue whatever they were doing.

**Steps.** A request returns an authentication failure → the stored token is cleared → the session
drops to signed-out → route guards return the user to sign-in.

**Outcomes.** The user is ejected to sign-in, potentially from inside the reader, potentially
mid-page. Unsaved position since the last periodic save is lost.

**Failure cases.** There is no re-authentication prompt, no return-to-where-you-were, and no
warning. Because there is no token refresh, this is driven purely by token lifetime.

**Final state.** Signed out at sign-in with no context preserved.

---

# 5. Reader Experience Specification

## 5.1 Two engines, one chosen automatically

The product has **two distinct reader engines**. The user never chooses between them and is never
asked. The engine is determined by the book's stored **layout type**, decided by the backend during
content processing.

Critically, the engine is chosen by **layout**, not by **book type**. The catalog distinguishes
book types (standard chapter, picture book, illustrated chapter) but these must never drive engine
selection.

| Layout type | Engine | Content character |
| --- | --- | --- |
| Reflowable | Reflowable engine | Text that adapts to the screen — chapter books |
| Fixed layout | Fixed-layout engine | Pages designed as artwork — picture books, illustrated chapter books |
| Missing / not yet processed | *No engine* | The book cannot be opened; book detail shows "Layout not ready" |

There is no third engine and no fallback. A book without a resolved layout is un-openable, and the
open attempt fails with a "not ready to open in a reader yet" explanation.

## 5.2 Opening a book

The open sequence is presented to the user as **one uninterrupted wait**, deliberately hiding the
following internal steps:

1. Validate the book reference.
2. Check connectivity — this decides between the online and offline paths entirely.
3. **Online path:** fetch book metadata → validate layout → resolve engine → look up saved
   progress → start a reading session seeded with the resume position (recovering an already-open
   session if one exists) → obtain a time-limited content delivery authorization.
4. **Offline path:** load the local record for the book → validate layout → resolve engine → build
   a local session stub positioned at the **beginning of the book** → no network calls at all.
5. Engine content load: prefer a local downloaded copy if one exists; otherwise download the
   encrypted file and verify its checksum; obtain the content key; decrypt in memory; parse the
   book structure; render.

**What the user must understand during this wait:** that the book is opening. Nothing more.

**What the user is not given, and should be considered in design:** any progress indication for
what can be a large download, any sense of how long it will take, and any way to cancel.

## 5.3 Closing a book

Closing is an explicit user action inside the reader. On close the app flushes the final reading
position, formally ends the reading session, and refreshes the continue-reading data so Home is
immediately correct. If ending the session fails, the user still leaves — the failure is absorbed.

The user returns to wherever they came from, or to the book's detail page if there is no history.

**Gap:** there is **no lifecycle handling**. If the app is backgrounded or killed instead of
closed, no flush occurs and the session is never ended. The resume point is the last periodic save.

## 5.4 Resuming vs starting over

- Resume is **automatic**. Opening a book with saved progress always continues from that position.
- There is **no "start from the beginning" action anywhere in the product.** A user who wants to
  reread a book from page one has no supported way to do it, short of navigating manually back to
  the first chapter or spread.
- Book detail signals the distinction through its primary action ("Read" vs "Continue reading") and
  a matching hint, but offers no choice.
- **Offline opens always start at the beginning**, which means offline reading and online reading
  disagree about where the user is.

This is a genuine functional gap. Design should raise it rather than paper over it.

## 5.5 Reflowable engine

**Content.** Flowing text organized as a sequence of chapters, with embedded images. Rendered
inside a sandboxed content view with no external network access.

**What the user must be able to do.**

| Capability | Behavior |
| --- | --- |
| Read the current chapter | Vertical scrolling within the chapter |
| Know where they are | Book title, current chapter title, and which chapter of how many |
| Move between chapters | Sequential previous / next only; unavailable at the first and last chapter |
| Adjust text size | Stepped between roughly 90% and 160% of base, in 10% steps, starting slightly enlarged |
| Adjust line spacing | Stepped between 1.2 and 2.0, in 0.1 steps, starting at about 1.55 |
| Adjust margins | Stepped between 8 and 36 units, in 4-unit steps, starting at 18 |
| Switch reading theme | Toggle between a warm light theme and a dark theme |
| Bookmark | Save, jump to, and remove positions within this book |
| Leave | Close, flushing position |

**Behavioral rules.**
- Changing chapter **resets scroll to the top** of the new chapter.
- Scroll position within a chapter is restored on return.
- All four settings are **session-local and reset on close** — they are not remembered across
  sessions or devices.
- Reading position is captured continuously and saved periodically and on close.

**Not available.** Right-to-left reading direction; a table of contents or chapter jump list;
in-book search; text selection, highlighting, notes, dictionary, or translation; page-turn
pagination (the model is chapter + scroll, not pages); per-page timing or reading-speed metrics.

## 5.6 Fixed-layout engine

**Content.** A sequence of page spreads whose original dimensions and artwork/text positioning must
be preserved exactly. A spread is either a single centered page or a left/right page pair shown
side by side.

**Canvas behavior.** Content is fitted to the available viewport by uniform scaling — never cropped,
never distorted, letterboxed as needed. This must work across page aspect ratios such as 4:3 and
16:11 and device aspect ratios as extreme as 19.5:9. The canvas host is dark so letterboxing reads
as intentional framing.

**What the user must be able to do.**

| Capability | Behavior |
| --- | --- |
| View the current spread | Rendered at correct proportions, fitted to the screen |
| Know where they are | Book title, spread title, which spread of how many, and current page |
| Move between spreads | Sequential previous / next only; unavailable at the first and last spread |
| Zoom in to inspect artwork | Stepped zoom from 1× to 3× in 0.25 steps — nine levels |
| Bookmark | Save, jump to, and remove spread positions |
| Leave | Close, flushing position |

**Behavioral rules.**
- Changing spread **resets zoom to 1×**.
- Typography, line spacing, margin, and theme controls are correctly **absent** — they have no
  meaning for fixed pages.
- Zoom limits are enforced and the corresponding controls become unavailable at each end.
- Fixed-layout books additionally report visual engagement time per page, invisibly.

**Not available.** Pinch-to-zoom or any gesture zoom — pinch is explicitly disabled and zoom is
button-driven only. Panning within a zoomed spread is not a defined interaction. Right-to-left page
turn direction. Dark theme. A magnifying-glass inspection tool. PDF-sourced fixed-layout content,
which fails with an explicit "not available in this build" message.

The requirements documents describe pinch-to-zoom, a magnifier, RTL navigation, and fixed-layout
dark mode; all are deferred reader improvements, not current capabilities. **Do not design as if
they exist.**

## 5.7 Progress and position tracking

| | Reflowable | Fixed layout |
| --- | --- | --- |
| Position is | Which chapter + how far scrolled in it | Which spread + which page |
| Continue-reading label conveys | Chapter number | Spread number |
| Bookmark label conveys | Chapter and scroll offset | Spread and page |
| Saved | Every ~15s and on close | Every ~15s and on close |

Progress is **server-side and cross-device**. There is no page-number concept for reflowable books
anywhere in the system — no page counts, no percentage complete, and no time-remaining estimate.
This is a deliberate, documented platform decision, not an oversight.

**What the user is never shown:** a percentage complete, pages remaining, time remaining, minutes
read, reading speed, streaks, or any reading statistic. The continue-reading label's coarse
chapter or spread number is the only progress information in the entire product.

## 5.8 Reading sessions

A reading session is opened when a book is opened and ended when the reader closes. During the
session the app reports position and active reading duration roughly every 15 seconds. Sessions
exist so the platform can attribute genuine reading engagement to authors.

**Rules.**
- If a session is already open for the book, the app silently recovers it rather than surfacing a
  conflict, so the user normally never sees session-conflict messaging.
- Idle time is part of the data model but is **always reported as zero** — no idle detection is
  implemented. A book left open on screen counts as active reading.
- Offline reading uses a purely local session stub. No session data reaches the server for offline
  reading, so offline reading is invisible to the platform's engagement accounting.
- All session and activity reporting is invisible and silent, including its failures.

## 5.9 Bookmarks

Bookmarks are **per-book, in-reader only**. From inside a book, the user can add a bookmark at the
current position, jump to any saved bookmark, and remove bookmarks. Labels are generated from the
position and are not editable — there is no naming, note, or annotation capability. Bookmarks sync
server-side and are included in the platform's sync snapshot.

There is **no cross-book bookmark library**, which is explicitly out of scope. A user cannot answer
"show me everything I've bookmarked."

## 5.10 Online vs offline reader behavior

| Aspect | Online | Offline |
| --- | --- | --- |
| Book metadata | Live, complete | Cached title and layout only |
| Opening position | **Resumed** from saved progress | **Always the beginning** |
| Reading session | Real server session | Local stub; nothing recorded |
| Content source | Local copy if present, else download | Local copy only |
| Progress saving | Works | Attempted and lost |
| Bookmarks | Full create / list / delete | Not functional |
| Authorization | Live entitlement check | Signed offline authorization, validated locally |
| Re-authorization | Automatic and silent | Impossible |

## 5.11 Access, entitlement and expiry in the reader

- Reading content always requires backend authorization. The client never decides entitlement.
- Denied online → a plain-language access-required explanation with a direct route to the
  subscribe path. This is the product's primary conversion surface.
- Denied offline (authorization expired or invalid) → the download is locked, with guidance to
  reconnect or subscribe.
- Device clock rolled back → locked, with a distinct message about the device time changing.
- **Fail closed always.** Any doubt about authorization results in no access.

## 5.12 Protection behavior relevant to the user experience

- Book content is encrypted at rest and in transit, and decrypted only in memory inside the app.
- Plaintext book content never reaches the filesystem.
- Content keys live in the device's secure keystore and are wiped from memory immediately after
  use.
- Downloads cannot be opened, shared, exported, or inspected outside the app.
- Content views are sandboxed and cannot reach the network.
- **No screenshot blocking, screen-recording detection, or watermarking exists.**

---

# 6. Library, Catalog & Discovery

## 6.1 How users discover books

Five mechanisms, all requiring authentication:

1. **Catalog browse on Home** — the default, with sort and single-category filtering.
2. **Metadata search** — one of title, author, or publisher at a time, submit-driven.
3. **Curated collections** — human-curated editorial shelves in a backend-defined order.
4. **Continue reading** — up to 5 recent books, the primary path for returning users.
5. **My books** — downloaded books, functioning as a device-local shelf.

There is **no algorithmic discovery** of any kind: no recommendations, no similar books, no
trending, no personalization, no genre landing pages, no author pages, no "new releases" beyond
the recency sort.

## 6.2 Book metadata — what is actually available

This is the most important constraint in this document for a designer, and it must be read
carefully before any book-centric layout is proposed.

**Available and displayed today:**

| Information | Where used | Notes |
| --- | --- | --- |
| Cover image | List rows, detail, Continue reading | From author `preview_image` via `BookResponse.cover` (signed GET URL, ~1h expiry). Missing or failed load → placeholder. No reading entitlement required. Offline library does **not** cache covers yet. |
| Title | Everywhere | Still the primary text identifier |
| Description | List rows (excerpt), detail (full) | |
| Category names | List rows, detail | May be empty |
| Layout type | Detail | Shown as "Reflowable" / "Fixed layout" / "Layout not ready" |
| Owner account email | Detail only | Rendered as "By {email}" — an *account address*, not an author name, and often absent |

**Available in the contract but not displayed:** book type (standard chapter / picture book /
illustrated chapter), publishing status, processing status, published date, created and updated
dates, owner role, category slugs and weights.

**Not available on the reader catalog contract today** (fields absent from reader
`BookResponse` / mobile generated types):

- **No author / publisher display names on the catalog contract.** EPUB processing stores
  `BookSourceMetadata.creator` / `.publisher` and search uses them, but catalog responses do
  not return them. Tracked as **MG-2**.
- **No language, page count, word count, reading level, age rating, duration estimate, series
  information, rating, or review data** on the reader contract.

**Design consequences, stated plainly.**
1. Cover-driven bookstore layouts are now possible when authors upload preview images. Books
   without a preview still need a clear placeholder so rows stay scannable.
2. For a product aimed at 6-year-olds, covers are the primary recognition cue — authors should
   treat preview upload as required for discovery quality.
3. Book detail cannot answer "who wrote this?" until **MG-2** — today it can only show
   "which account uploaded it", and only sometimes.
4. There is no age or reading-level information, so an adult cannot judge suitability from the app.

**Remediation.** Author/publisher display is next in
`docs/MOBILE-PRODUCT-GAPS-ROADMAP.md` (**MG-2**). Cover exposure is **COMPLETE** (**MG-1**).

## 6.3 Catalog behavior

- **Visibility.** Only approved, fully processed, published books appear. Anything else is absent;
  a direct link to it returns not-found.
- **Sort.** Newest (default) or most popular. Popularity means how many users have started the
  book, not reading time or ratings.
- **Filter.** One category, or all. No other filter dimension exists.
- **Page size.** 20 items.
- **Pagination.** **Not implemented in the UI** — the first 20 only, while truthfully displaying
  the full total count. This will read as a bug to users of any real catalog.
- **Refresh.** Pull-to-refresh on the catalog.
- **Count.** The true total of matching books is shown.

## 6.4 Categories

A flat, backend-owned taxonomy (seeded with categories such as Picture Books, Children's, Fiction,
Nonfiction, Young Adult). Each category has a name, a slug, and a weight used by backend
monetization. Up to 50 are loaded. Only the names are shown, only as filter options and as book
metadata. There are no category landing pages, no nesting, and no category browse experience.

## 6.5 Collections

Curated editorial shelves with a title and an ordered set of books. Ordering — both of collections
and of books within them — is a backend editorial decision the client must preserve. Unpublished
books are filtered out of reader-facing results, so a collection may show fewer books than an
editor placed in it, or none.

## 6.6 Reading status and progress in discovery

Progress information is available in exactly two places:

1. **Continue reading on Home** — the book plus a coarse chapter or spread number.
2. **Book detail** — indirectly, via the primary action label and resume hint.

Catalog rows, search results, and collection contents carry **no** reading status. Nothing anywhere
distinguishes unread, in-progress, and finished books, and there is no concept of "finished" in the
product at all.

## 6.7 Library behavior

"My books" is the offline downloads shelf, not a personal library. It lists downloaded books with
their title and layout, works fully offline, and offers open and remove per book. Its empty state
must teach the download flow, because there is no other way for a book to arrive here.

Its cached metadata is minimal — offline, a book has a title and a layout type and nothing else.

## 6.8 Recently accessed content

The continue-reading shelf is the only recency surface: the 5 most recent books by last reading
session. There is no full history, no "recently viewed", and no way to see the sixth-most-recent
book.

---

# 7. Authentication & User Account

## 7.1 Registration

Email plus a password of 8–72 characters creates a reader account and signs the user in
immediately. Client-side validation covers email format and password length; the backend is
authoritative and its field-level errors are mapped back onto the offending field alongside a
form-level message.

**Absent:** confirm-password, password strength guidance beyond the minimum, terms/privacy
acceptance, email verification, age gate, parental consent, display name, and any social or
federated sign-up.

**Note for a children's product:** there is no age gate or parental consent mechanism, which is
likely to matter for compliance in many jurisdictions. Flagged, not designed.

## 7.2 Sign in

Email and password, with the same validation and the same error-mapping behavior. Failure keeps the
user on the screen with a form-level message.

**Absent — and significant:** **there is no password reset or account recovery of any kind.** A
user who forgets their password has no in-app path back to their account, their subscription, or
their reading progress. This is a serious product gap.

## 7.3 Session persistence

The access token is stored in the device's secure keystore (with a web fallback for the web build).
On every launch the app loads it and revalidates it against the backend before deciding where to
route, holding the splash screen until that decision is stable.

## 7.4 Authentication states

| State | Meaning | User experience |
| --- | --- | --- |
| **Loading** | Bootstrap or revalidation in progress | Splash held; no content, no interaction |
| **Signed out** | No valid session | Sign-in; all authenticated routes redirect here |
| **Signed in** | Session confirmed | Full app shell |
| **Restore failed** | A stored session could not be revalidated for a non-authentication reason | Dedicated recovery screen with retry and start-over |

Transitions: launch → loading → one of the three outcomes. Sign-in or registration → signed in.
Sign-out or abandoning restore → signed out. An authentication failure on any request → signed out.
Retrying a failed restore → loading → resolve again.

## 7.5 Authentication errors

- Bad credentials → form-level message, user stays put.
- Backend field validation → mapped to the specific field, plus a form-level message.
- Network failure → the failure reason surfaces as a form-level message; nothing is created or
  changed.
- Session no longer valid → **immediate, silent sign-out** with no prompt and no explanation.

## 7.6 Unauthorized behavior

Route guards redirect signed-out users out of authenticated areas and signed-in users away from the
public auth screens. These guards are a UX convenience only — the backend independently enforces
every rule.

## 7.7 The user experience of an expired session

This deserves explicit attention because it is currently poor:

- There is **no token refresh**. Expiry is terminal.
- The user is dropped to sign-in **without warning, explanation, or preservation of context**.
- It can happen **mid-reading**, discarding up to ~15 seconds of unsaved position.
- There is no "your session expired, please sign in again" message, and no return to where they
  were after re-authenticating.
- If backend tokens are short-lived (platform documentation for the shared auth stack states a
  15-minute lifetime with no refresh endpoint), this could occur very frequently — potentially
  making the app unusable for a child. **This needs confirmation before design.** See
  [§16.4](#164-questions-to-answer-before-final-design).

## 7.8 Account and profile

The Me screen shows email and role, read-only. There is no profile editing, no password change, no
email change, no display name or avatar, and **no account deletion**.

## 7.9 Settings

**There is no settings screen.** The only user-adjustable preferences in the product are the four
reflowable reading controls, which live inside the reader and reset when it closes.

## 7.10 Sign out

Available on Me. It clears the session, the cached server state, **and every offline download with
its keys**. The same purge happens when a user abandons a failed session restore.

**This is a destructive action currently presented as a routine one.** The design should reflect
its true consequence.

---

# 8. Subscription, Trial & Entitlement Model

## 8.1 The model in one paragraph

Every authenticated user can browse everything. Reading a book's *content* requires **full-book
reading entitlement**, which comes from exactly two sources: an active free trial, or an active
paid subscription period. The free plan **never** grants reading. All of this is computed by the
backend; the mobile app displays the result and must never recalculate it.

## 8.2 Free tier

- **What it is.** The default state, including for brand-new accounts. Exactly one free plan exists
  platform-wide, with no price and no card.
- **What a free user can do.** Sign in; browse the entire catalog; filter and sort; search;
  browse collections; open any book's detail page; view their subscription state; start a trial if
  eligible; subscribe.
- **What a free user cannot do.** Read any book's content. Download for offline reading (the
  download flow requires backend authorization). Nothing else in the app is restricted.
- **How they find out.** Only by attempting to open a book and being refused.
- **Note.** A brand-new account may have no subscription record at all; the absence of one is
  treated as unpaid.

## 8.3 Free trial

- **Terms as stated in the product.** 7 days. **No credit card required.** Explicitly does not by
  itself start a paid subscription.
- **Eligibility.** Server-determined; **one trial per account, ever.** The offer appears on Me
  only when the server says the account is eligible.
- **Not automatic.** A trial is never started at registration; the user must choose it.
- **What a trial user can do.** Everything a paid subscriber can — read any catalog book, and
  download for offline reading.
- **Countdown.** While on trial, Me shows the remaining time, stepping down from days to hours,
  then to an "ending soon, the server decides access" state once the end time passes. This
  countdown is **only visible on Me** — nowhere else in the app.
- **Expiry.** Access reverts to free. Reading is refused again. Downloaded books lock once their
  offline authorizations expire — the offline authorization mechanism exists precisely to make
  trial downloads stop working when the trial ends.
- **No warnings.** No notification, no in-app banner, no email path from the app. Expiry is
  discovered by refusal.

## 8.4 Paid subscription

- **Plans.** Monthly paid plans defined by the backend, each with a name, description, and price.
  Presented for selection on Me. The app hardcodes a "per month" framing.
- **Purchase.** Via the payment provider's **hosted external checkout**, opened in a browser
  session from the app. There is **no native in-app purchase.**
- **Activation.** Only the server activates access. The return link is not evidence of payment —
  the app re-reads subscription state from the server after every checkout return, and says so.
- **Entitlement rule.** Paid reading is granted when the plan is a paid monthly plan **and** the
  current time is before the paid period end. If no period end is recorded, paid reading is denied.
- **Duplicate purchase prevention.** A user who already has reading entitlement cannot start
  another checkout; the attempt is refused. Once entitlement ends, checkout is available again.

## 8.5 Cancellation, expiry and renewal

- **Cancellation is not possible in the mobile app.** No cancel action exists.
- **A canceled subscription still grants reading until the paid period end.** Status reads
  "Canceled" while reading continues to work — the design must make this non-alarming and clear.
- **After the period end, access stops** regardless of the recorded status.
- **Failed renewal payments produce no user-visible signal.** They are recorded server-side and do
  not by themselves change status, period end, or access. The user is not told. There is no dunning
  or payment-recovery experience.
- **No renewal receipts, reminders, or billing history.**

## 8.6 Refunds

- A refund can be requested within **7 days of activating the subscription**, enforced entirely by
  the server.
- The action is offered on Me whenever the plan is a paid one, with a confirmation step that
  states the server checks the 7-day window.
- **A granted refund cancels the subscription and ends paid reading immediately** — not at the
  period end. This is a sharper consequence than cancellation and should be communicated as such.

## 8.7 Subscription states and what each permits

| State | Reading access | Browse | Read content | Download offline | Existing downloads | Available actions |
| --- | --- | --- | --- | --- | --- | --- |
| **Unauthenticated** | none | No | No | No | n/a | Sign in, register |
| **Free, trial-eligible** | free | Yes | **No** | No | n/a | Start trial, subscribe |
| **Free, trial already used** | free | Yes | **No** | No | Locked once authorizations expire | Subscribe |
| **Active trial** | trial | Yes | **Yes** | Yes | Work until authorization expiry | Subscribe; view remaining time |
| **Active paid, period open** | paid | Yes | **Yes** | Yes | Work; silently re-authorized when online | Request refund |
| **Canceled paid, before period end** | paid | Yes | **Yes** | Yes | Work | Request refund |
| **Expired (period passed)** | free | Yes | **No** | No | Locked once authorizations expire | Subscribe again |
| **Refunded** | free | Yes | **No** (immediately) | No | Locked | Subscribe again |

Two additional distinctions the design must express:

- **Canceled but still active** is a common, non-urgent state that looks alarming if presented
  purely as "Canceled". Reading still works; the period end date is the important information.
- **Payment failed** is a state that exists on the platform but has **no mobile representation at
  all.**

## 8.8 What the user must be able to see about their access

On Me, in the relevant states:

- Plan name and whether it is free or monthly paid.
- **Reading access level** — free, trial, or paid. This is the field that actually answers "can I
  read?"
- Subscription status — active or canceled.
- The date paid access runs through, when one exists.
- Trial time remaining, when on trial, plus reassurance that no card was charged.
- The trial offer with its full terms, when eligible.
- Purchasable plans with prices.
- The standing note that reading access is decided by the server, and that billing changes should
  involve an adult.
- The outcome of the most recent checkout attempt.

## 8.9 What must never be done in the client

- Never compute or infer entitlement locally.
- Never treat a checkout return link as proof of payment.
- Never assume a trial started, a payment succeeded, or a refund was granted without re-reading
  server state.
- Never show a reading-access state the server did not report.

---

# 9. Offline Experience

## 9.1 What can be offline, and how

**One book at a time, explicitly, from its detail page, while online.** There is no bulk download,
no download-all, no automatic or predictive caching, and no download queue. Only books the user
can currently read can be downloaded, since the download flow requires backend authorization.

The download sequence, as the user experiences it: they tap download; progress is reported as a
percentage when the file size is known and as an indeterminate "downloading" state otherwise; on
completion they are told the download is saved and can be read offline from My books. Behind that,
the app verifies connectivity, fetches metadata, validates layout, obtains a delivery
authorization, downloads the encrypted file, verifies its integrity against a checksum, and
obtains both the content key and a server-signed offline reading authorization.

## 9.2 What is stored locally

| Stored | Where | Notes |
| --- | --- | --- |
| The encrypted book file | App-private storage | Never decrypted to disk |
| The content key | Device secure keystore | Zeroed from memory immediately after each use |
| A small metadata record per book | App-private storage | Title, layout, description, checksum, size, download time, and the signed offline authorization |
| The signed offline authorization | Inside that record | Validated before every offline decrypt |
| A trusted-time reference | Device secure keystore | Underpins clock-rollback detection |

**Not stored offline:** cover art (online covers are not cached into the offline package),
categories, author or publisher information, reading progress, bookmarks, or any catalog data
beyond the record above. This is why My books can only show a title and a layout type.

**Never stored:** decrypted book content, in any form, at any time.

## 9.3 How offline access is authorized

Each downloaded book carries a **server-signed offline reading authorization** that records which
account and which book it is for, whether it was issued under trial or paid access, when it was
issued, and when it expires.

Before decrypting any offline book, the app checks all of the following, in order, and **fails
closed** on any of them:

1. An authorization exists.
2. It is for this exact book and file.
3. It is for the currently signed-in account.
4. Its cryptographic signature is valid — it has not been tampered with.
5. The device clock has not been rolled back beyond a 5-minute tolerance relative to the latest
   trustworthy time the app has seen.
6. It has not expired, measured against that trusted time rather than naive device time.

**User-facing outcomes.** Cases 1–4 and 6 all present as "this offline download is locked; connect
to the internet or subscribe to refresh access." Case 5 presents distinctly as "your device time
changed; connect to the internet to refresh this download."

**Why it exists.** So that when a trial or paid period ends, previously downloaded books stop
working — even on a device that never reconnects.

## 9.4 What happens with no network

- Connectivity is detected from the actual device state, and deliberately **fails open**: when
  connectivity is unknown, the app assumes it is online, so it never falsely claims to be offline.
- My books works fully and shows an offline notice explaining that downloaded books still open.
- Book detail shows an offline notice, and the download action is disabled with wording that
  invites the user to connect.
- Opening a book takes the offline path entirely — no network calls.
- A book that is not downloaded cannot be opened, and the user is told to connect or download it
  first.
- Server-state fetching is paused while offline.
- **No offline writes are queued.** Reading progress and bookmarks created offline are lost.

## 9.5 Offline vs online differences

| Aspect | Online | Offline |
| --- | --- | --- |
| Which books can open | Any entitled catalog book | Downloaded books only |
| Metadata richness | Full | Title and layout only |
| **Opening position** | **Resumed** | **Always the beginning** |
| Progress saving | Works | Lost |
| Bookmarks | Full | Not functional |
| Reading recorded for the platform | Yes | No |
| Authorization | Live check | Signed authorization, validated locally |
| Recovery from expiry | Automatic and silent | Impossible |

## 9.6 When offline access expires

The download does not disappear — it **locks**. The book remains listed in My books and remains
tappable, but opening it produces the locked message. My books gives **no advance indication** of
remaining offline validity, so this is always a surprise.

**Recovery.** Reconnect and open the book while online. The app silently obtains a fresh content
key and a fresh authorization and unlocks the existing download **without re-downloading the
file**. If the user's entitlement has genuinely ended, re-authorization fails and they are routed
to the subscribe path instead.

## 9.7 Invalid or unavailable cached content

- **Corrupted file** → integrity verification fails and the user is told the file failed its
  integrity check. There is no automatic re-download or repair; recovery is to remove and download
  again, which the app does not suggest.
- **Missing content key** → the book cannot be decrypted; offline, this presents as not being
  downloaded.
- **Missing local record** → the book is treated as not downloaded.
- **Unreadable local record** → treated as no downloads at all, which would silently orphan every
  download.

## 9.8 After reconnecting

Server-state fetching resumes and refreshes on app foreground. The next online open of a
downloaded book silently re-authorizes it if needed. Smart Resume works again — but only from the
last *online* position; any offline reading has left no trace.

**There is no reconciliation, no sync indicator, no "catching up" state, and no conflict
resolution**, because there is nothing queued to reconcile.

## 9.9 Removing downloads

- **Per book**, from either book detail or My books, with confirmation copy after the fact
  ("download removed from this device"). No pre-confirmation for this genuinely destructive action.
- **All downloads at once**, implicitly, on sign-out or on abandoning a failed session restore.
  There is no warning.

## 9.10 Documented intent vs implementation

The requirements describe an "offline-first architecture" and a "full reading experience offline."
The mobile architecture document is explicit that the actual model is **"online-first with graceful
temporary disconnection, not offline-first."** The implementation matches the latter.

Design to the implementation: offline is a **supported temporary condition for pre-downloaded
content**, not a first-class mode. In particular, offline reading loses the user's place and
records nothing.

---

# 10. Application States

## 10.1 Lifecycle and session states

| State | Meaning | Can do | Cannot do | Transitions to |
| --- | --- | --- | --- | --- |
| **First launch** | Installed, never signed in | Sign in, register | Anything else | Signed out |
| **Bootstrapping** | Resolving session | Nothing; splash held | Interact | Signed in / signed out / restore failed |
| **Signed out** | No valid session | Sign in, register | Browse, read, download | Signed in |
| **Signed in** | Valid session | Everything their entitlement allows | Exceed entitlement | Signed out; access states |
| **Restore failed** | Stored session unconfirmable | Retry, or start over (purges downloads) | Reach the app | Signed in / signed out |
| **Invalid session** | Session rejected mid-use | Nothing — immediate sign-out | Continue, or be warned | Signed out |
| **Crashed (boundary)** | Unhandled render error | Retry, restart the app | Continue in place | Signed in |

## 10.2 Data-fetch states

Every data-backed surface has four independent states, and surfaces on the same screen fail
independently — Home's continue-reading shelf and its catalog list can be in different states
simultaneously.

| State | Meaning | User can |
| --- | --- | --- |
| **Loading** | First fetch in flight | Wait; navigate away |
| **Empty** | Succeeded, nothing to show — **not an error** | Read guidance on how to populate it |
| **Error** | Fetch failed | Retry |
| **Success** | Content available | Act on it |

Empty states in this product carry instructional weight, because several are the user's only
explanation of how a surface gets populated (notably My books, continue reading, and the search
idle hint).

## 10.3 Network states

| State | Meaning | Behavior |
| --- | --- | --- |
| **Online** | Connected, or connectivity unknown (fails open) | Everything available |
| **Offline** | Definitely no usable connection | Offline notices on My books and book detail; downloads disabled; reader takes the offline path; server fetching paused; downloaded books still open |
| **Slow network** | **NOT MODELED** | Presents as an indefinite loading state; no timeout, no cancel, no "taking a while" |
| **Connected but unusable** (captive portal, dead link) | Treated as **online** | Produces request failures rather than a clean offline state |

## 10.4 Access states

| State | Meaning | Can read | Notes |
| --- | --- | --- | --- |
| **Free** | No trial, no paid period | **No** | Full browse access; the wall appears at open |
| **Trial** | Active 7-day trial | Yes | Countdown visible only on Me |
| **Paid** | Active paid period | Yes | Period end shown on Me |
| **Canceled, still active** | Canceled, before period end | Yes | Status reads "Canceled" while reading works |
| **Expired** | Period passed | **No** | Downloads lock as authorizations expire |
| **Refunded** | Refund granted | **No** (immediately) | Sharper than cancellation |
| **Payment failed** | Renewal payment failed | Unchanged | **No mobile representation whatsoever** |

## 10.5 Content states

| State | Meaning | User experience |
| --- | --- | --- |
| **Book available** | Catalog-visible and processed | Opens normally |
| **Layout not ready** | Processing incomplete | Detail shows "Layout not ready"; opening fails as not ready |
| **Book not found** | Not visible to readers, or removed | Not-found state; unavailable to read |
| **Collection unavailable** | Removed or hidden | Distinct from a load failure |
| **Collection empty** | Loaded, no published books | Distinct empty state |
| **Empty catalog** | No published books at all | Empty state inviting a later return |
| **PDF fixed layout** | Unsupported source format | Explicit "not available in this build" |

## 10.6 Offline content states

| State | Meaning | User experience |
| --- | --- | --- |
| **Not downloaded** | No local copy | Download offered when online; blocked when offline |
| **Downloading** | In progress | Percentage when size is known, otherwise indeterminate |
| **Downloaded and authorized** | Ready | Opens offline, at the beginning |
| **Downloaded but locked** | Authorization expired, invalid, or for another account | Listed but refuses to open; reconnect to recover |
| **Locked by clock rollback** | Device time moved backwards | Distinct message about device time |
| **Corrupted** | Integrity check failed | Integrity error; no automatic repair |
| **Purged** | Removed by user or by sign-out | Gone; must be downloaded again |

## 10.7 Sync states

| State | Reality |
| --- | --- |
| **Synced** | The implicit normal state while online — never surfaced |
| **Sync pending** | **Does not exist** — no write queue |
| **Sync conflict** | **Does not exist** — no conflict resolution |
| **Sync failed** | Happens, silently; the user is never told |

There is **no sync status surface anywhere in the product.** The user cannot tell whether their
progress was saved.

---

# 11. Data & Information Model (Mobile Perspective)

Only entities the mobile app actually handles are listed, with the fields that matter to the user
experience.

## 11.1 User

Represents the signed-in account. User-facing: **email** (the only human-readable identifier, and
therefore used as the greeting and as the account label) and **role** (always `reader` for mobile
users). Related to exactly one subscription, and to all of that user's progress, sessions, and
bookmarks.

**No display name, nickname, or avatar exists.** This is why the app greets children by email
address, and it constrains any personalization design.

## 11.2 Subscription

The user's access record and the single source of truth for "can I read?".

User-facing fields: **reading access state** (free / trial / paid — the field that answers the
question), **status** (active / canceled), **paid period end** (when access runs through),
**trial start and end**, **trial eligibility** (whether to offer a trial at all), and the
associated **plan**.

Drives: whether books open; whether the trial offer appears; whether the refund action appears;
whether downloads can be created; and how long offline authorizations last.

## 11.3 Plan

A purchasable or free option. User-facing: **name**, **description**, **kind** (free or monthly
paid), **interval**, **price amount**, and **currency**. Plans without a price show name and
description only. The free plan **never** grants reading.

## 11.4 Book

The core content entity. User-facing: **cover** (when a preview image exists; otherwise
placeholder), **title**, **description**, **categories**, **layout type** (which silently
determines the entire reading experience), and sometimes an **owner account email** used as an
author surrogate.

**Absent and consequential:** author name, publisher name, language, page count, reading level,
age rating, rating, series. See [§6.2](#62-book-metadata--what-is-actually-available).

Relationships: belongs to an owner account; has many categories; has at most one reading progress
record per user; has many bookmarks and sessions per user; may have one offline package per device.

**State effects:** layout type decides the engine and whether the book can open at all; catalog
visibility decides whether it exists for the user; processing state can leave a book listed but
un-openable.

## 11.5 Category

A flat taxonomy entry. User-facing: **name** only. Used as a filter option and as book metadata.
Also carries a backend weight used for author monetization, which must never be shown or acted on
in the client.

## 11.6 Collection

A curated editorial shelf. User-facing: **title** and its **ordered books**. Order is a backend
editorial decision. Only reader-visible books appear, so counts can differ from editorial intent.

## 11.7 Reading position

Not a standalone entity but the shared shape underlying progress, bookmarks, sessions, and
activity. It is **layout-discriminated**:

- **Reflowable:** which chapter, and how far scrolled within it.
- **Fixed layout:** which spread, and which page.

There is deliberately **no page number and no percentage for reflowable books** anywhere in the
system.

## 11.8 Reading progress

One record per user per book: the last position, plus the **last session time**. Server-side and
cross-device. Drives Smart Resume, the continue-reading shelf and its ordering, and the book detail
primary action label. Its absence means the book has never been opened.

## 11.9 Reading session

One record per reading visit: start and end times, the book, active and idle durations, layout
type, and the final position. Exists so the platform can attribute genuine reading engagement to
authors. **Entirely invisible to the user.** Idle duration is always zero. Offline reading produces
only a local stub that never reaches the server.

## 11.10 Bookmark

A user-saved position within a book, with a system-generated label derived from that position.
Per-book and only reachable inside that book's reader. **Not user-nameable and not annotatable.**
Server-side and cross-device.

## 11.11 Offline package

A device-local record of one downloaded book: the encrypted file reference, the book's **title**
and **layout type** (the only metadata available offline), integrity checksum, size, download
time, and the signed offline authorization. Its presence makes a book appear in My books and
readable offline. Destroyed by removal or by sign-out.

## 11.12 Offline reading authorization (lease)

A server-signed grant permitting offline decryption of one book for one account. Carries the
**access kind** (trial or paid), an **issue time**, and an **expiry**. Validated before every
offline decrypt, and refreshed silently on online opens. Its expiry is what makes trial and
expired-subscription downloads stop working, and its validation is what produces the "locked
download" and "device time changed" states.

**Currently never surfaced to the user** — the user cannot see how long their downloads remain
valid, which is why locking always surprises them.

## 11.13 Content delivery authorization and content key

Short-lived, internal, never user-visible. A delivery authorization grants temporary access to the
encrypted file; a content key permits its in-memory decryption. Both appear in the user experience
only as failure states.

## 11.14 Sync state

**Not a modeled entity.** Sync is implicit and immediate while online. There is no queue, no
pending state, no conflict record, and no user-visible sync status.

---

# 12. Navigation & Information Architecture

## 12.1 Top-level structure

```
App
├── Bootstrap (splash held until the session decision is stable)
│   ├── → Public area          (no valid session)
│   ├── → Main area            (valid session)
│   └── → Session restore recovery  (session unconfirmable)
│
├── PUBLIC AREA  (signed out only; signed-in users are redirected out)
│   ├── Sign in  ⇄  Register
│   └── → Main area on success
│
└── MAIN AREA  (signed in only; signed-out users are redirected out)
    │
    ├── PERSISTENT THREE-WAY NAVIGATION
    │   ├── Home
    │   ├── My books
    │   └── Me
    │
    └── PUSHED CONTEXTS  (over the main navigation)
        ├── Search                     ← from Home only
        ├── Collections list           ← from Home only
        │   └── Collection detail
        ├── Book detail                ← from any book row anywhere
        └── Reader (full-screen)       ← from book detail, Home continue shelf, My books
            └── Bookmarks panel        (overlay; session stays open)

    EXTERNAL
    └── Hosted checkout (browser session)  ← from Me; returns to Me
```

## 12.2 The three main areas

| Area | Role | Reached from |
| --- | --- | --- |
| **Home** | Resume and discover — the default landing surface | Default; persistent navigation |
| **My books** | Device-local downloaded books | Persistent navigation |
| **Me** | Identity, access, and money | Persistent navigation; **and as the destination of every entitlement-denied path** |

## 12.3 Hierarchy and depth

The deepest routine path is four levels: Home → Collections → Collection detail → Book detail →
Reader. Every pushed context provides its own way back and tolerates being entered without
history (falling back to Home or the book's detail page).

**Search and Collections are reachable only from Home.** They are not in the persistent
navigation, so a user in My books or Me must first return to Home to search. For search — a
primary discovery mechanism — this is a questionable placement worth revisiting.

## 12.4 Reader navigation

The reader is a **full-screen modal context** that replaces the main navigation entirely. Inside
it, navigation is:

- Sequential chapter or spread movement only — **no table of contents, no jump-to-position, no
  scrubber, no page-number entry.**
- The bookmarks panel is the only non-sequential way to move within a book.
- Exit is an explicit close, which flushes position and ends the session, returning the user to
  where they came from.

## 12.5 Subscription navigation

All billing lives on Me: status, trial offer, plan selection, subscribe, and refund. There is no
dedicated subscription, paywall, or plan-comparison screen. Checkout leaves the app for a hosted
browser session and returns to Me.

The most important navigational relationship in the product: **entitlement denial in the reader
routes directly to Me.** Me is therefore both a settings destination and a conversion landing
surface, and users frequently arrive with a specific unmet intent (a book they wanted to read).
Nothing currently carries that intent across — Me looks identical whether the user wandered in or
arrived blocked from a book. Preserving and honoring that intent is a strong design opportunity.

## 12.6 Navigation behavior by condition

**By authentication.** Route guards are absolute: signed-out users are redirected out of the main
area; signed-in users are redirected out of the public area; bootstrap holds everything until the
decision is stable. Losing the session mid-use ejects the user to sign-in immediately, from
wherever they are, including the reader.

**By entitlement.** Entitlement never blocks *navigation* — a free user can reach every screen,
including every book's detail page. It blocks only the *reader content*, and it does so at the
moment of opening. This produces the deferred-wall pattern described throughout this document.

**By connectivity.** Offline does not remove any screen. It changes behavior within screens: the
download action is disabled on book detail; offline notices appear on book detail and My books;
the reader takes the offline path; and books without a local copy cannot be opened.

## 12.7 Deep links

The app registers a custom URL scheme and uses it for exactly one purpose: returning from hosted
checkout via distinct success and cancel links. **These links never grant access** — the app
always re-reads entitlement from the server on return.

There are **no content deep links.** A book, collection, or search result cannot be linked to or
shared from outside the app. All internal routes accept identifiers, so content deep linking is
technically within reach but is not a supported product feature today.

---

# 13. Permissions, Restrictions & Business Rules

## 13.1 Authentication rules

| Rule | Detail |
| --- | --- |
| R-A1 | Everything except sign-in and register requires a valid session — **including browsing the catalog**. There is no anonymous or guest browsing. |
| R-A2 | Mobile registration always produces a `reader` account. Authors and admins cannot be created here. |
| R-A3 | Passwords must be 8–72 characters; emails must be valid. Backend validation is authoritative. |
| R-A4 | Sessions persist across launches and are revalidated against the backend on every launch. |
| R-A5 | **There is no token refresh.** A rejected session means immediate sign-out. |
| R-A6 | Sign-out **and abandoning a failed session restore** both purge all offline downloads. |
| R-A7 | Client route guards are UX convenience only; the backend enforces everything independently. |
| R-A8 | No password reset, no account recovery, and no account deletion exist. |

## 13.2 Content visibility rules

| Rule | Detail |
| --- | --- |
| R-C1 | A book is visible to readers only if it is approved, fully processed, **and** has a published timestamp. All three are required. |
| R-C2 | Non-visible books are absent from every reader surface; a direct link returns not-found. |
| R-C3 | The same visibility rule filters collection contents, so a collection may show fewer books than an editor placed in it, or none. |
| R-C4 | A book with no resolved layout type **cannot be opened**, even if it is otherwise visible. |
| R-C5 | Fixed-layout books sourced from PDF cannot be rendered in this build. |

## 13.3 Reading entitlement rules

| Rule | Detail |
| --- | --- |
| R-E1 | Reading a book's content requires either an active trial or an active paid period. |
| R-E2 | **The free plan never grants reading**, regardless of status. |
| R-E3 | Paid reading requires a paid monthly plan **and** a current time before the period end. A missing period end denies access. |
| R-E4 | A **canceled** paid subscription **still grants reading until the period end.** |
| R-E5 | After the period end, access stops regardless of recorded status. |
| R-E6 | A granted refund **ends paid reading immediately**, not at the period end. |
| R-E7 | Failed renewal payments do **not** by themselves change status, period end, or access, and produce no user-visible signal. |
| R-E8 | Entitlement is computed **exclusively** by the backend. The client must never calculate, infer, cache, or optimistically assume it. |
| R-E9 | Browsing metadata is never gated by entitlement — only content is. |

## 13.4 Trial rules

| Rule | Detail |
| --- | --- |
| R-T1 | The trial lasts 7 days and requires no credit card. |
| R-T2 | **One trial per account, ever.** Eligibility is server-determined. |
| R-T3 | Trials are never started automatically; the user must choose. |
| R-T4 | The trial offer appears only when the server reports eligibility. |
| R-T5 | A trial grants the same reading and download access as a paid subscription. |
| R-T6 | Starting a trial does not by itself create a paid subscription. |
| R-T7 | A user who already has paid access cannot start a trial. |
| R-T8 | Trial remaining time must come from the server's end timestamp — never computed from a local start. |

## 13.5 Purchase rules

| Rule | Detail |
| --- | --- |
| R-P1 | Payment happens only in the provider's hosted external checkout. There is no native in-app purchase. |
| R-P2 | A user who already has reading entitlement cannot start a checkout. |
| R-P3 | Only purchasable plans can be checked out. |
| R-P4 | **A checkout return link never grants access.** Entitlement must be re-read from the server. |
| R-P5 | A dismissed checkout has an genuinely unknown outcome and must be communicated as such. |
| R-P6 | Refunds are limited to 7 days from activation, enforced entirely server-side. |
| R-P7 | The mobile app cannot cancel a subscription. |

## 13.6 Offline rules

| Rule | Detail |
| --- | --- |
| R-O1 | Downloads require a network connection and current reading entitlement. |
| R-O2 | Downloads are per-book and user-initiated. No bulk, automatic, or predictive download. |
| R-O3 | Downloaded content is always encrypted at rest; plaintext never reaches disk. |
| R-O4 | Every offline decrypt requires a valid server-signed authorization. |
| R-O5 | Authorization validation **fails closed** on any doubt: missing, wrong book, wrong account, bad signature, expired, or clock rollback. |
| R-O6 | Expiry is judged against trusted server-derived time, not naive device time. |
| R-O7 | Device clock rollback beyond a 5-minute tolerance locks offline reading. |
| R-O8 | Re-authorization requires connectivity and **does not** re-download the file. |
| R-O9 | Offline reading **always starts at the beginning of the book.** |
| R-O10 | Offline reading progress and bookmarks are **not** queued and are lost. |
| R-O11 | Sign-out purges every download and key. |
| R-O12 | Integrity is verified on download and on every offline read. |
| R-O13 | Downloaded books cannot be opened, shared, or exported outside the app. |

## 13.7 Reader rules

| Rule | Detail |
| --- | --- |
| R-R1 | The engine is chosen from the book's **layout type**, never from its book type. |
| R-R2 | Reflowable position is chapter plus scroll offset; fixed-layout position is spread plus page. There is no reflowable page number or percentage. |
| R-R3 | Reflowable reading settings are session-local and reset on close. |
| R-R4 | Fixed-layout books must not offer typography or theme controls. |
| R-R5 | Fixed-layout content must be scaled uniformly and never cropped or distorted; letterboxing is expected. |
| R-R6 | Fixed-layout zoom is stepped from 1× to 3× and resets on spread change. Pinch zoom is disabled. |
| R-R7 | Resume is automatic; there is no start-from-the-beginning action. |
| R-R8 | Progress saves are best-effort and fail silently. |
| R-R9 | Bookmarks are per-book, in-reader only, and not user-nameable. |
| R-R10 | An already-open session is recovered silently rather than surfaced as a conflict. |
| R-R11 | Reading activity is reported invisibly; idle time is always reported as zero. |
| R-R12 | Content views are sandboxed with no network access. |

## 13.8 Discovery rules

| Rule | Detail |
| --- | --- |
| R-D1 | Catalog and search surface only the first 20 results; there is no pagination in the UI. |
| R-D2 | Search covers exactly one of title, author, or publisher at a time. |
| R-D3 | Search is submit-driven with no debounce and no minimum length; blank queries do nothing. |
| R-D4 | Category filtering is single-select. |
| R-D5 | Backend ordering of collections and of books within them must be preserved. |
| R-D6 | Continue reading is limited to 5 books, ordered by most recent session. |
| R-D7 | Category weights, publishing statuses, and processing statuses must never be shown to readers. |

---

# 14. Error & Edge-Case Behavior

Each case states the condition, what the user experiences, and the recovery the product offers.

## 14.1 Authentication and session

| Case | Experience | Recovery |
| --- | --- | --- |
| Invalid credentials | Form-level failure; the user stays on the screen | Correct and retry |
| Registration validation failure | Backend field errors mapped to the offending field, plus a form-level message | Correct and resubmit |
| Duplicate email at registration | Backend message surfaced | Sign in instead |
| Network failure during auth | Failure message; nothing created or changed | Retry when connected |
| Session unconfirmable at launch | Dedicated recovery screen distinguishing a connection problem from an account problem | Retry, or start over (**purges downloads**) |
| **Session expires mid-use** | **Immediate, unexplained sign-out** — possibly mid-page in the reader; unsaved position lost | Sign in again; **context is not restored** |
| Forgotten password | **No in-app path exists** | None — hard lockout |
| Missing app configuration | Requests fail rather than the app refusing to start | None available to the user |

## 14.2 Content and discovery

| Case | Experience | Recovery |
| --- | --- | --- |
| Empty catalog | Empty state inviting a later return | Retry later |
| Catalog load failure | Error state with retry, independent of other regions on the screen | Retry |
| Book not found or not visible | Not-found state | Go back |
| Invalid book link | "That book link is not valid" — distinguished from a missing book | Go back |
| Book detail load failure | Error with retry | Retry |
| No search results | Distinct empty state inviting different words | Change the query or field |
| Search failure | Error with retry | Retry |
| Blank search submitted | Nothing happens; the idle hint remains | Type something |
| Desired book beyond the first 20 results | **Silently unreachable** with no indication more exist | None |
| Empty collections list | Empty state explaining that editors add shelves | Retry later |
| Collection unavailable | Distinct from a load failure | Go back |
| Collection loaded but empty of published books | Distinct empty state | Go back |
| Invalid collection link | Distinguished from an unavailable collection | Go back |

## 14.3 Reader open failures

The reader must express these distinctly, because the correct user action differs for each.

| Case | Experience | Recovery offered |
| --- | --- | --- |
| **Entitlement required** | Plain-language explanation, phrased for a child to relay to an adult, naming both the trial and subscribing | **Direct route into the subscribe path on Me** |
| **Offline download locked** (authorization expired, missing, tampered, or for another account) | The download is locked; connect or subscribe to refresh access | Route to subscribe; reconnecting also resolves it |
| **Device clock changed** | Distinct message: the device time changed, connect to refresh | Reconnect |
| **Not downloaded while offline** | This book is not downloaded; connect or download first | Reconnect |
| **Book unavailable to read** | Not available | Back |
| **Layout not ready** | Not ready to open in a reader yet | Back; retry later |
| **Session already open** | Normally invisible — silently recovered | Automatic; a retry message exists as a fallback |
| **Download failure** | Could not download the book file | Retry |
| **Integrity failure** | The downloaded file failed its integrity check | Retry; **removing and re-downloading is not suggested** |
| **Decryption or format failure** | Specific messages for truncated, unknown-format, not-ready-for-this-reader, and invalid or missing key | Retry |
| **Unsupported PDF fixed layout** | Explicitly not available in this build | Back |
| **No readable chapters or pages** | The book has no readable content | Back |
| **Missing internal file or viewport** | Specific structural failure | Retry |
| **Chapter or spread not found at the target position** | That chapter or spread could not be found | Retry |
| **Generic failure** | Could not open this book | Retry |

## 14.4 Reading

| Case | Experience | Recovery |
| --- | --- | --- |
| Network lost while reading | Reading continues from already-decrypted content; progress saves fail **silently** | Reconnect; position may be stale |
| Progress save fails | **Nothing is shown.** Reading continues; the position is lost | None; the next save may succeed |
| Session end fails on close | The user still leaves normally | Absorbed |
| App killed instead of closed | No flush and no session end; resume point is the last periodic save (up to ~15s lost) | Automatic on next open |
| Bookmark load, create, or delete fails | Specific per-action message in the bookmarks panel | Retry |
| Activity reporting fails | Invisible | None needed |
| Offline reading progress | **Lost entirely, silently** | None |

## 14.5 Subscription and billing

| Case | Experience | Recovery |
| --- | --- | --- |
| Subscription load failure | Error with retry on Me; the subscribe flow remains usable | Retry |
| No subscription record | Explains that none is set up and suggests involving an adult | Start trial or subscribe |
| No purchasable plans | Explains that no plans are ready and to check back later | Retry later |
| Subscribe with no plan selected | Prompted to pick a plan first | Select one |
| Trial already used | The offer is absent; any attempt is refused as already used | Subscribe instead |
| Trial unnecessary (already paid) | Refused as not needed | None needed |
| Trial start failure | Error on Me; state unchanged | Retry |
| Already entitled at checkout | Refused: the plan is already active | None needed |
| Plan not purchasable | Told to pick a plan that is ready to buy | Select another |
| Checkout return links misconfigured | Configuration error surfaced | None available to the user |
| Checkout canceled | The plan was not changed | Try again |
| **Checkout dismissed with unknown outcome** | Honest uncertainty: the plan updates only once the server confirms payment | Re-check Me |
| **Payment succeeded but not yet processed** | Briefly stale non-paid state, with messaging designed for it | Re-check shortly |
| **Renewal payment failed** | **No signal at all** | None |
| Refund outside the window | The server's reason is shown; nothing changes | None |
| Refund failure | Error; state unchanged | Retry |
| **Trial expires** | **No warning.** Discovered by being refused a book | Subscribe |
| **Subscription expires** | **No warning.** Same discovery | Subscribe |

## 14.6 Offline and downloads

| Case | Experience | Recovery |
| --- | --- | --- |
| Download attempted while offline | The action is disabled and reworded to invite connecting | Reconnect |
| Download fails mid-transfer | Could not download for offline reading | Retry |
| Downloaded file fails its integrity check | Integrity failure message | Retry the download |
| Unsupported content key format | Told the format is not supported yet | None |
| Book has no usable layout | Not ready to download yet | None |
| Downloads list unreadable | Presents as **no downloads at all**, silently orphaning them | None |
| Downloads list load failure | Error with retry | Retry |
| Remove fails | Could not remove the download | Retry |
| Authorization expired while offline | The download locks; listed but refuses to open | Reconnect to re-authorize |
| Authorization for another account | Locks with the same message | Sign in as the right account, or re-download |
| Device clock rolled back | Locks with the distinct device-time message | Reconnect |
| Re-authorization fails because entitlement genuinely ended | Routed to the subscribe path | Subscribe |
| Sign-out purges downloads | **No warning; downloads simply vanish** | Re-download after signing in |

## 14.7 Platform and infrastructure

| Case | Experience | Recovery |
| --- | --- | --- |
| Backend unreachable at launch | **Indefinite splash** — no timeout, no message | Kill and relaunch |
| Backend unreachable in-app | Per-screen error states with retry | Retry |
| Slow network | **Indefinite loading** — no timeout, no cancel, no "taking a while" | Leave the screen |
| Empty response from the server | Generic request failure | Retry |
| Unhandled render error | Friendly global error state with retry and restart advice | Retry |
| Connected but unusable network | Treated as **online**; produces request failures rather than an offline state | Retry |

---

# 15. UI/UX Design Brief

Everything a design system needs before designing this application. This section summarizes; it
does not prescribe visual solutions.

## 15.1 Product type

A native mobile (iOS and Android) **subscription e-book reading application** with a dual-engine
built-in reader and encrypted offline reading. Content-consumption-first, with a light commerce
surface and no social features.

## 15.2 Target users

- **Primary: children from about age 6**, extending to teenagers and adults. Requires plain
  language, generous touch targets, forgiving interaction, and no exposure to billing complexity.
- **Secondary: the accompanying adult** who creates the account, starts the trial, subscribes,
  requests refunds, and manages downloads. Existing product copy explicitly routes decisions to
  this person ("ask a grown-up").

The design must serve both without a mode switch, an account-linking model, or a parental gate —
none of which exist today.

## 15.3 Core user goals

1. Get back into the book I was reading, in one action.
2. Find something worth reading.
3. Read comfortably, in the form the book was designed for.
4. Keep my place, everywhere.
5. Take books where there is no connection.
6. Understand whether I can read, and what to do if I cannot.

## 15.4 Main user journeys, by importance

1. **Return and resume** — the highest-frequency journey. Launch → Home → continue reading →
   reader.
2. **Discover and start** — Home or search or collections → book detail → reader.
3. **Hit the wall and convert** — attempt to read → denial → Me → trial or subscribe. **The
   product's most important commercial moment, and currently its weakest experience.**
4. **Prepare and read offline** — book detail → download → disconnect → My books → reader.
5. **Register and first read** — currently denial-driven; the biggest first-run design opportunity.
6. **Manage access** — Me: status, trial, plans, refund.

## 15.5 Complete screen list

**Bootstrap:** splash / session bootstrap; session-restore recovery; global error boundary.

**Public:** sign in; register.

**Main (persistent navigation):** Home; My books; Me.

**Pushed:** search; collections list; collection detail; book detail; reader (opening state);
reader (reflowable); reader (fixed layout); reader bookmarks panel; reader open-failed.

**External:** hosted checkout (not designable here).

**Absent but reasonably expected** — propose deliberately, do not assume: onboarding; settings;
profile edit; password reset; cancel subscription; billing history; cross-book bookmarks; reading
statistics; storage management; notification center; in-reader table of contents; in-reader
search.

## 15.6 Main navigation areas

Three persistent areas — **Home**, **My books**, **Me** — with search and collections as pushed
contexts reachable **only from Home**, and the reader as a full-screen context that replaces
navigation entirely.

## 15.7 Core features

Authentication with persisted sessions; catalog browse with sort and single-category filter;
single-field metadata search; curated collections; book detail with read and offline actions;
dual-engine reader; reflowable reading settings; fixed-layout stepped zoom; Smart Resume; per-book
bookmarks; continue-reading shelf; encrypted per-book offline download with server-signed
authorization; subscription status; 7-day no-card trial; plan selection and hosted checkout;
refund request; connectivity-aware behavior.

## 15.8 Content types

Two, distinguished only by layout and handled by different engines:

- **Reflowable** — flowing text in chapters. Chapter books for older readers. Text presentation is
  user-adjustable.
- **Fixed layout** — designed page spreads whose artwork and text positioning must be preserved
  exactly. Picture books and illustrated chapter books, i.e. the youngest readers' content.
  Presentation is fixed; only zoom is adjustable.

Books also carry a book type (standard chapter, picture book, illustrated chapter) that is
available but never displayed and must never drive the engine.

## 15.9 Important user states

Session: bootstrapping, signed out, signed in, restore-failed, invalid-session.
Data: loading, empty, error, success — **independently per region on a screen**.
Network: online, offline, and connected-but-unusable (treated as online). Slow is not modeled.
Content: available, layout-not-ready, not-found, unsupported.
Offline content: not downloaded, downloading, downloaded-and-authorized, downloaded-but-locked,
locked-by-clock-rollback, corrupted, purged.

## 15.10 Subscription states

Free (trial-eligible), free (trial used), active trial, active paid, canceled-but-still-active,
expired, refunded, and payment-failed (which has **no** mobile representation).

The two that most need careful design: **canceled-but-still-active** (reads alarming, works fine)
and **free** (looks fully capable while being unable to read anything).

## 15.11 Reader capabilities to support

**Both engines:** open with a single calm wait; know the book and position; move sequentially;
bookmark, jump, and remove; close with position flushed; distinct error states with
cause-appropriate recovery.

**Reflowable only:** chapter navigation; scroll; adjustable font size, line spacing, margin, and
light/dark theme (session-local).

**Fixed layout only:** spread navigation; stepped 1×–3× zoom; uniform aspect-fit scaling with
letterboxing and no cropping or distortion.

**Deliberately absent:** pinch zoom; RTL; table of contents; in-book search; text selection,
highlights, or notes; page numbers or percentage for reflowable; start-from-the-beginning;
persisted preferences; reading statistics.

## 15.12 Offline capabilities to support

Per-book explicit download with progress; a downloads shelf that works with no network; offline
opening of downloaded books; per-book removal; clear connectivity messaging; and clear, actionable
locked-download states with distinct recovery for expiry versus device-clock change.

**Constraints to design around:** offline metadata is title and layout only; offline reading always
starts at the beginning; offline progress and bookmarks are lost; downloads lock without warning;
sign-out destroys all downloads.

## 15.13 Critical business rules

1. Authentication is required for everything, including browsing.
2. Browsing is free; **reading content is not**.
3. Reading requires an active trial or an active paid period. The free plan never grants reading.
4. Entitlement is **backend-only**. Never compute, infer, or optimistically assume it.
5. A canceled subscription still grants reading until the period end.
6. A refund ends paid reading immediately.
7. One trial per account, ever, 7 days, no card, never automatic.
8. Checkout return links never grant access; always re-read server state.
9. The reader engine follows layout type, never book type.
10. Offline authorization validation fails closed.
11. Offline reading has no Smart Resume and records nothing.
12. Sign-out purges all offline content.
13. Only the first 20 results are reachable in the catalog and in search.
14. Backend ordering of collections and their books must be preserved.

## 15.14 Important edge cases to design for

Session expiring mid-reading with no warning and no context restoration; entitlement denial as a
full-screen interruption of an expected reading experience; trial and subscription expiring with
no warning; downloads locking without notice; device clock changes locking a paying user out;
integrity failures with no suggested repair; indefinite loading on a slow or dead network with no
cancel; sign-out silently destroying downloads; a book in "continue reading" that refuses to open
because entitlement lapsed; and the catalog reporting hundreds of books while surfacing twenty.

## 15.15 Information that must be surfaced to users

**High priority, currently under-surfaced or absent:**
- **Reading access state** — whether the user can read, visible outside Me. Today a free user gets
  no signal until refusal.
- **Trial and subscription time remaining**, visible before it becomes urgent, outside Me.
- **Offline authorization validity** — how long downloads will keep working. Currently invisible.
- **The consequence of signing out** — that downloads will be destroyed.
- **Whether reading progress was actually saved**, especially offline where it silently is not.
- **That offline reading starts at the beginning** and will not record progress.

**Already surfaced and must be preserved:**
- Book title, description, categories, and layout.
- Position in the current book, and coarse position in the continue-reading shelf.
- Plan, reading access, status, period end, and trial remaining on Me.
- Trial terms: 7 days, no card, not itself a paid subscription.
- Connectivity and its concrete consequences.
- Download progress and outcome.
- Distinct, cause-appropriate error explanations everywhere.
- That reading access is decided by the server and billing should involve an adult.

**Available but unused — potential design material:** book type; category weights (must stay
hidden); publication dates; reading session and engagement data (collected, never shown).

## 15.16 Areas where the UX is particularly important

1. **The entitlement wall.** The product's conversion moment currently fires as a full-screen
   failure inside a context the user entered expecting a book. Making the requirement anticipated
   rather than sprung, and carrying the user's intent into the subscribe path, is the highest-value
   design work available.
2. **The reader itself.** Where nearly all user time is spent. It must disappear behind the
   content while keeping navigation, position, settings, and exit reachable — for a 6-year-old.
3. **The opening wait.** A potentially long, uncancellable, progress-free wait fronting a complex
   pipeline. It must feel intentional rather than stuck.
4. **Offline honesty.** Downloads are leased, lose the user's place, and record nothing. The
   experience must set accurate expectations rather than implying permanent ownership.
5. **Session expiry.** Currently an abrupt, unexplained ejection, possibly mid-page. Needs
   explanation, and ideally return-to-context.
6. **The dual audience.** One interface must be operable by a six-year-old and trustworthy to the
   adult paying for it, with billing reachable but not child-triggerable.
7. **Book identity still incomplete without author/publisher.** Covers (**MG-1**) now support
   visual recognition when previews exist; author and publisher names remain missing until
   **MG-2**. Books without covers still need strong placeholders.
8. **Empty states as instruction.** Several empty states are the only place the product explains
   how a surface gets populated.
9. **Error differentiation.** Roughly two dozen distinct failure causes each have a different
   correct user action. Collapsing them into one generic error would break recovery.
10. **The "My books" label.** It means "downloaded to this device", not "my library". Resolving
    that mismatch is an information-architecture decision, not a copy tweak.

## 15.17 Established constraints the design must respect

These already exist in the product and are not free choices:

- **Platform.** Native iOS and Android, portrait-oriented, tablet-supported.
- **Two reader engines** with genuinely different control sets — typography controls must not
  appear on fixed-layout books.
- **Fixed-layout fidelity.** Uniform scaling, no cropping, no distortion; letterboxing is expected
  and must read as intentional across page ratios from 4:3 to 16:11 and device ratios up to 19.5:9.
- **Large touch targets.** The existing product uses a 56-unit minimum for primary controls and 44
  for secondary ones, as a deliberate accessibility decision for young users.
- **Plain, child-appropriate language** throughout, including in errors, which never expose
  technical detail.
- **A warm, light, paper-like base palette** with a dark reading theme available for reflowable
  content, and a dark canvas host framing fixed-layout pages.
- **Accessibility labels and roles** on interactive elements, already established throughout.
- **Cover art when preview exists**; placeholder when missing or load fails. **No author name or
  publisher name** on the catalog contract yet (**MG-2**). Offline My books still has no cached
  cover.

These are existing product requirements, not aesthetic direction. Everything else — layout,
composition, iconography, illustration, motion, color expression beyond the base palette,
typographic hierarchy, and component design — is open.

---

# 16. Coverage & Missing Information

## 16.1 Features confirmed to exist

**Authentication and session.** Registration with validation; sign-in; persisted sessions with
launch-time revalidation and a held splash; four-state session model; session-restore recovery;
sign-out with full purge; immediate sign-out on session rejection; field-level error mapping.

**Discovery.** Catalog browse with newest/popularity sort and single-category filtering; category
taxonomy loading; single-field metadata search over title, author, or publisher; curated
collections list and detail with preserved backend ordering; book detail; continue-reading shelf;
catalog covers from author preview images with placeholders when missing (**MG-1**).

**Reader.** Layout-driven dual-engine selection; full open pipeline with authorization,
integrity verification, in-memory decryption, and parsing; reflowable engine with chapter
navigation, scrolling, and four session-local settings; fixed-layout engine with spread
navigation, stepped zoom, and aspect-fit canvas; Smart Resume; per-book in-reader bookmarks;
reading session lifecycle; invisible activity and visual-engagement reporting; position flush on
close; comprehensive cause-specific error mapping.

**Billing.** Subscription status display across all states; 7-day no-card trial with server-owned
eligibility and a stepped remaining-time display; plan listing and selection; hosted external
checkout with three distinct return outcomes; refund request with confirmation; entitlement-denied
recovery routing to the subscribe path; all billing errors mapped to plain language.

**Offline.** Per-book encrypted download with progress and integrity verification; local package
records; server-signed offline authorization with fail-closed validation; trusted-time and
clock-rollback detection; offline open path; silent online re-authorization without re-download;
per-book removal; sign-out purge; connectivity-aware behavior and messaging.

**Cross-cutting.** Real connectivity detection bound to server-state fetching; foreground refresh;
per-screen loading, empty, error, and success states; a global crash boundary; child-appropriate
copy throughout.

**Verified delivery status.** The project's delivery tracker marks mobile steps 31 through 54
**Complete**, with one exception: the R2 discovery end-to-end test suite is **Deferred (testing
phase)** — deferred, not cancelled. No mobile steps are pending or in progress, and none exist
beyond 54.

## 16.2 Features planned but not implemented

**Explicitly tracked as deferred reader improvements:** fixed-layout pinch and gesture zoom;
fixed-layout right-to-left navigation; fixed-layout dark theme; PDF fixed-layout rendering;
persisted and cross-device reading preferences; an in-book search overlay (the backend is ready).

**Explicitly out of scope in delivery notes:** offline reading-progress write queues; offline
conflict resolution; a local sync cache; a cross-book bookmark library screen; device-bound offline
licenses; instant refund revocation while fully offline; automatic trial start at registration.

**Documented in requirements but absent from both engines:** right-to-left reading support; a
magnifying-glass inspection tool for fixed-layout content; reflowable page numbers and
reading-speed metrics (deliberately deferred pending a client pagination contract).

**Out of scope for this release entirely:** AI audiobooks with mobile playback and offline audio
(a separate documented product phase); advanced formatting and typesetting.

**Test coverage deferred:** end-to-end coverage exists only for authentication and tab-shell
navigation. Discovery, reader engines, offline, and checkout have **no** end-to-end coverage.

## 16.3 Areas where the code or documentation is incomplete

1. **Catalog and search pagination.** The API supports paging and the UI displays true totals, but
   never advances past the first 20 results. Functionally incomplete rather than deliberately
   scoped.
2. **No settings surface at all.** No home exists for app preferences, legal content, about
   information, or storage management.
3. **No password reset or account recovery.** A hard lockout path with no in-app remedy.
4. **No account deletion or profile editing.**
5. **No in-app subscription cancellation**, despite full support for subscribing and refunding.
6. **No expiry warnings** for trials or subscriptions, and no notification channel to deliver
   them.
7. **No payment-failure representation.** The platform models failed renewals; the mobile app does
   not surface them at all.
8. **Offline reading loses progress silently.** The most user-hostile behavior in the product, and
   an acknowledged scope decision rather than a bug.
9. **No offline validity visibility.** Users cannot see how long their downloads will keep working,
   which makes locking always surprising.
10. **No slow-network or timeout handling.** Hung requests produce indefinite, uncancellable
    loading, including an indefinite splash if the backend is unreachable at launch.
11. **No reader lifecycle handling.** Backgrounding or killing the app skips the position flush and
    never ends the session.
12. **Idle-time detection is unimplemented** while being part of the data model — idle duration is
    always reported as zero, so a book left open counts as active reading.
13. **No onboarding.** Notable for a product aimed at six-year-olds.
14. **No parental gate on billing.** A child can reach the plan picker, subscribe action, and
    refund action unaided; the only mitigation is copy.
15. **No age gate or parental consent at registration**, which is likely a compliance concern for
    a children's product.
16. **Dead code.** A reflowable reader placeholder component from an earlier delivery phase remains
    in the codebase and is no longer referenced.
17. **Minor cache-key inconsistency.** The continue-reading shelf fetches book titles under a
    different cache key than the catalog uses, so the same book can be fetched and stored twice.
18. **Documented architectural conflict.** The requirements describe an "offline-first
    architecture" while the mobile architecture document explicitly states the model is
    "online-first with graceful temporary disconnection." The implementation follows the latter.
    This document follows the implementation.

## 16.4 Assumptions made in writing this document

1. **The dual audience is real and intentional.** Inferred from the package description ("children
   from about age 6... also suitable for teens and adults") and from copy that routes decisions to
   adults. No formal persona documentation exists.
2. **The owner account email displayed on book detail is an author surrogate**, not a deliberate
   product decision to show publisher email addresses to children. The field is labeled "By
   {email}" in the code; its product intent is not documented.
3. **The access token is short-lived (CONFIRMED).** Backend default
   `JWT_ACCESS_EXPIRES_IN` is **`15m`** (`backend/src/config/jwt/jwt-config.schema.ts`). There is
   **no refresh token** and no refresh HTTP endpoint. The mobile app clears the session on any
   401. Deployed environments may override the env var; treat **15m** as the product default and
   audit production config in **MG-FINAL**. Severity is high: reading sessions longer than the
   access lifetime are structurally at risk.
4. **Offline authorization lifetime equals entitlement end.** Server-issued leases expire at
   `trialEndsAt` (trial) or `currentPeriodEnd` (paid). The timestamp is already stored on the
   device manifest as `offlineLease.expiresAt` but is not shown in the UI (**MG-8**).
5. **Absent features are absent, not undiscovered.** Where no code, test, or documentation
   evidence exists (onboarding, settings, notifications, password reset), this document marks them
   unavailable rather than inferring intent.
6. **The "Complete" delivery status of steps 31–54 reflects scoped completion**, not
   feature-completeness against the full requirements. Several requirement-level capabilities
   (right-to-left support, pinch zoom, fixed-layout dark mode) are documented as required yet
   remain unimplemented within steps marked Complete.
7. **Design tokens are treated as existing constraints, not prescriptions.** Touch-target minimums
   and the light paper-like palette are reported because they are established product decisions,
   particularly the accessibility-driven target sizes.

## 16.5 Gap decisions and remediation map

Revalidated against code on **2026-09-03**. Implementation order and full task specs live in
[`docs/MOBILE-PRODUCT-GAPS-ROADMAP.md`](./MOBILE-PRODUCT-GAPS-ROADMAP.md).

### Resolved or confirmed (no longer open questions)

| Topic | Decision / finding | Roadmap |
| --- | --- | --- |
| Cover art | **COMPLETE.** Reader `BookResponse.cover` exposes signed preview URLs without reading entitlement; mobile shows cover + placeholder. | **MG-1** |
| Author / publisher display | **Will be added** from EPUB `BookSourceMetadata.creator` / `.publisher`; stop using `owner.email` as primary public “By”. | **MG-2** |
| Access token lifetime | **Confirmed 15m default**, no refresh today. Refresh architecture is mandatory and scheduled last. | **MG-FINAL** |
| Offline lease lifetime | Equals trial end or paid `currentPeriodEnd`; already on device as `expiresAt`. | **MG-8** (UX) |
| Sign-out purge | **Keep** security purge; require explicit confirmation when downloads exist. | **MG-9** |
| Entitlement visibility | **Will surface** backend `readingAccessState` before reader entry (no client entitlement math). | **MG-3** |
| Trial discovery | **Will improve** discovery without auto-start; keep one-trial / no-card rules. | **MG-4** |
| Offline resume + sync | **Will implement** local resume, then bookmark + progress sync queues. | **MG-5**, **MG-6**, **MG-7** |
| Catalog/search pagination | **Will implement** against existing `limit`/`offset`. | **MG-10** |
| Password reset | **Will implement** using recovery JWT + mail infrastructure. | **MG-12** |
| Reader cancellation | **Will implement** reader cancel (access until period end); distinct from refund. | **MG-13** |
| Expiry notifications | **Phase A in-app** banners from subscription fields; push only after real infra (no fakes). | **MG-14** |
| Settings | **Scoped settings only** — no invented toggles; final scope set during **MG-11**. | **MG-11** |

### Still deferred / product decisions (not in MG-1…MG-FINAL)

| Topic | Notes |
| --- | --- |
| “My books” label vs downloads shelf | IA/copy decision; address when touching Library/Settings |
| Parental gate / age gate / parental consent | Legal/product decision; insufficient evidence to implement in this track |
| Full onboarding tour | Partially addressed by MG-3/MG-4; dedicated onboarding still optional |
| Start-from-beginning control | Still absent; raise if product wants it after Smart Resume work |
| Reading statistics UI | Data collected; surface later if product wants it |
| Screenshot blocking / watermarking | Not specified; do not invent |
| RTL / pinch-zoom / PDF / in-book search / preference sync | FR-1…FR-6 backlog; not part of this remediation track |
| STEP 36 Maestro R2 E2E | Deferred testing phase — separate track |

### Ordered task list (do not reorder without updating the roadmap)

1. **MG-1** Book cover / preview on catalog — `TODO`
2. **MG-2** Author & publisher display — `TODO`
3. **MG-3** Entitlement visibility before reader — `TODO`
4. **MG-4** Trial discovery & trial UX — `TODO`
5. **MG-5** Offline local resume — `TODO`
6. **MG-6** Offline bookmark persistence & sync — `TODO`
7. **MG-7** Offline progress write queue — `TODO` (depends on MG-5)
8. **MG-8** Offline lease expiration UX — `TODO`
9. **MG-9** Sign-out confirmation for downloads — `TODO`
10. **MG-10** Catalog & search pagination — `TODO`
11. **MG-11** Settings (scoped) — `TODO`
12. **MG-12** Password reset — `TODO`
13. **MG-13** Reader subscription cancellation — `TODO`
14. **MG-14** Trial/subscription expiry notifications — `TODO`
15. **MG-FINAL** Access + refresh tokens — `TODO` (last)

**Working rule:** one task at a time; stop for review after each; no automatic commits.

---

*End of specification.*
