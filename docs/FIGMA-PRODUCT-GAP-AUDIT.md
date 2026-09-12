# Figma Product Gap Audit

**Status:** Discovery / planning only. No application code was changed.

**Figma file (Priority 1):** [my-hikayat-platform](https://www.figma.com/make/uSXMIXa3eY8MoyEOqXTMa9/my-hikayat-platform?t=jmIETU8kwoO2wfgx-0) `-0`  
**File key:** `uSXMIXa3eY8MoyEOqXTMa9`  
**Approved visual language:** Direction B — Warm / Playful Story World (`src/p3/` + `src/p4/`)

**Inspected implementation (Priority 2):** `backend/`, `frontend/` (admin/author dashboard), `mobile/` (Expo reader)

**Inspected documents (Priority 3, not used to silently override Figma):** `docs/MOBILE-PRODUCT-SPEC.md`, `docs/SRS.md`, `ARCHITECTURE.md`, `docs/FRONTEND-ARCHITECTURE.md`, `docs/MOBILE-ARCHITECTURE.md`, `docs/FUTURE.md`

---



## 1. Executive Summary

This Figma Make file specifies the **reader mobile product**, not the admin/author web dashboard. Production UI lives in Phase 3–4 screens; Phase 1 is direction exploration; Phase 6–7 are handoff/blueprint docs.

Figma is treated as the product specification for this audit. Where the current app, APIs, or `MOBILE-PRODUCT-SPEC.md` disagree with Figma, the conflict is recorded. Nothing is discarded because an older spec omitted it. Items that look like demo data are classified, not deleted.

### Counts (method)

- **Figma surfaces:** 23 distinct user-facing surfaces (screens + major sheets). Multiple states of one screen count as one surface in this total, and are listed separately in §3.
- **State variants inspected:** 50+ (auth, home, search, book access, my books, me, subscription).
- **Implemented (reachable + wired):** 16 surfaces.
- **Partial:** 10 surfaces.
- **Missing as dedicated surfaces:** 6 (Privacy Policy, About My Hikayat, Terms of Service, dedicated Subscription route, clock-tamper full screen, sign-up success interstitial).
- **Actionable tasks:** 48 (`FIGMA-001` … `FIGMA-048`).
- **Business-owner questions:** 22 (`Q-001` … `Q-022`).
- **Engineering decisions (recommended, still listed):** 8 (`E-001` … `E-008`).
- **Backend/API gaps:** 9 fields/capabilities.
- **Web (admin/author) gaps:** 4 (only where Figma-required data would need an editor).
- **Mobile gaps:** 40+ UI/nav/state items.



### Top blockers (need owner answers before build)

Owner answers are recorded in §14. Remaining work is implementation, not unanswered product questions:

1. Legal destinations (Privacy, Terms, About) — admin-configured URLs/mission; hide when null.
2. Dedicated Subscription screen — **A** (built).
3. Display name / greeting — **C** (built).
4. Plan picker — **Q-014b C**: bind to `GET /reader/billing/plans` only.
5. Reactivate — **B** (checkout; no Stripe resume).
6. Offline author + cover — **A** (built).
7. Download cap of 3 — **Q-015b A**: enforce backend + mobile.
8. Dashboard Direction B — **Q-021d B**: restyle admin/author web.

---



## 2. Source of Truth & Audit Rules



### Hierarchy for this document

1. **Figma** `-0` **production UI** (`src/p3/`, `src/p4/`, plus Phase 4 state explorer and Phase 6 handoff).
2. **Running implementation** (Prisma, reader APIs, Expo routes, React dashboard).
3. **Existing specs** — used to explain *why* the current app behaves as it does, and to flag conflicts. Not used to hide a Figma requirement.



### Production Figma vs earlier Figma


| Destination                                           | Production Figma file                            | Earlier / superseded                                  |
| ----------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------- |
| Auth                                                  | `src/p4/AuthScreens.tsx`                         | —                                                     |
| Search                                                | `src/p4/EnhancedSearch.tsx`                      | `src/p3/SearchScreen.tsx` (recents, “You might like”) |
| Me                                                    | `src/p4/EnhancedMe.tsx`                          | `src/p3/MeScreen.tsx` (Font size + Language on Me)    |
| My Books                                              | `src/p4/EnhancedMyBooks.tsx`                     | `src/p3` simpler list                                 |
| Settings / sheets                                     | `src/p4/SettingsScreen.tsx`, `src/p4/Sheets.tsx` | —                                                     |
| Home, collections, book detail, readers, subscription | `src/p3/*`                                       | —                                                     |


p3 Search recents and p3 Me Language are still inventoried because they exist in the file. They are marked **superseded by p4** unless the owner restores them.

### What this Figma does **not** specify

- Admin web dashboard
- Author web dashboard
- Stripe hosted checkout page chrome
- Push notification center
- Onboarding (Figma Phase 4 audit: “F-ONB-1 not designed”)
- In-reader full-text search overlay
- Parental gate

Those absences are recorded in §17, not treated as “delete from the product.”

### Classification key


| Code                | Meaning                                                 |
| ------------------- | ------------------------------------------------------- |
| COMPLETE            | Figma requirement exists in the product                 |
| PARTIAL             | Some of it exists                                       |
| MISSING             | Figma has it; product does not                          |
| VISUAL GAP          | Same behavior, different UI                             |
| BEHAVIOR GAP        | Both exist, different rules                             |
| NAVIGATION GAP      | Destination exists but path differs, or path is missing |
| DATA GAP            | UI needs a field the API/DB does not have               |
| API GAP             | Endpoint missing or insufficient                        |
| BACKEND GAP         | Domain/service/schema work                              |
| CONTENT GAP         | Copy/URL missing                                        |
| BUSINESS DECISION   | Owner must choose                                       |
| TECHNICAL DECISION  | Engineering can recommend                               |
| POTENTIAL PROTOTYPE | May be demo data; still needs a decision                |
| CONFLICT            | Figma vs current product/spec disagree                  |


---



## 3. Complete Figma Inventory



### 3.1 Auth / bootstrap


| Area | Surface                | Figma location                      | Purpose           | Entry       | Exit                    | Visible UI                                                       | Actions                  | States                                                   | Data             | Implied behavior                                                  |
| ---- | ---------------------- | ----------------------------------- | ----------------- | ----------- | ----------------------- | ---------------------------------------------------------------- | ------------------------ | -------------------------------------------------------- | ---------------- | ----------------------------------------------------------------- |
| Auth | Splash                 | `p4/AuthScreens.tsx` `SplashScreen` | Session bootstrap | Cold start  | Home or Sign in         | Italic “My Hikayat”, spinner, `navBg`                            | None                     | Loading only                                             | None             | Hold until session resolved                                       |
| Auth | Session restore failed | `SessionRestoreFailedScreen`        | Restore failed    | Splash fail | Retry / Sign in         | Warning icon, copy, two buttons, download-removal note           | Try again; Sign in again | Default                                                  | None             | Re-sign-in removes downloads                                      |
| Auth | Sign in                | `SignInScreen`                      | Login             | Public      | Home / Sign up / Forgot | Cover strip, Welcome back, email, password, Forgot, Create one   | Submit, navigate         | default, loading, invalid-credentials, network-error     | Email/password   | Field error on bad credentials                                    |
| Auth | Sign up                | `SignUpScreen`                      | Register          | Public      | App / Sign in           | Cover strip, email, password hint 8–72, Terms + Privacy, Sign in | Submit                   | default, loading, validation, network-error, **success** | Email/password   | Immediate account; success interstitial; legal acceptance implied |
| Auth | Forgot password        | `ForgotPasswordScreen`              | Request reset     | Sign in     | Sign in                 | Email; sent card + Resend                                        | Send, Resend, Back       | default, loading, sent, error                            | Email            | Enumeration-safe send                                             |
| Auth | Reset password         | **Not in Figma**                    | —                 | Deep link   | —                       | —                                                                | —                        | —                                                        | Token + password | Phase 4 audit: deep link “not in scope for design”                |




### 3.2 Shell


| Area  | Surface    | Figma location           | Purpose       | Entry          | Exit                 | UI                          | Actions | States     |
| ----- | ---------- | ------------------------ | ------------- | -------------- | -------------------- | --------------------------- | ------- | ---------- |
| Shell | Tab bar    | `p3/shared.tsx` `TabBar` | Primary IA    | Always in tabs | Home / My Books / Me | Icons + labels + active dot | `goTab` | Active tab |
| Shell | Status bar | Fake 9:41                | Device chrome | —              | —                    | Time, signal, battery       | None    | Light/dark |




### 3.3 Home


| State     | Figma                          | What it shows                                                                                                                                            |
| --------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| returning | `HomeScreen` `state=returning` | Time-of-day greeting + first name “Aisha”; search icon; Continue Reading; New in My Hikayat + See all; Collections rail; Browse Stories + category pills |
| new       | `state=new`                    | “Welcome to My Hikayat”; trial banner “Try free”; no Continue Reading                                                                                    |
| trial     | `state=trial`                  | Active trial badge                                                                                                                                       |
| expiring  | `state=expiring`               | Trial ends in 3 days + Subscribe                                                                                                                         |
| loading   | `state=loading`                | Full-body skeletons; tab bar remains                                                                                                                     |
| error     | `state=error`                  | Full-body error + retry                                                                                                                                  |


**Implied navigation:** search icon → Search; book cards → Book detail; Continue Reading → Reader; See all on New → **Collections** (prototype wiring); All collections → Collections list; Try free / Subscribe → **Subscription screen**.

**Internal Figma conflict:** Phase 4 audit text says greeting uses **email** (F-HOME-4). `HomeScreen.tsx` uses **“Aisha”**. See Q-007.

### 3.4 Search (production = p4)


| State      | UI                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| idle       | Field selector Title/Author/Publisher; search field; Search button; idle copy; **Browse by Category pills** |
| results    | Count + rows (cover, title, author, publisher)                                                              |
| no-results | Empty “No stories found”                                                                                    |
| loading    | Row skeletons                                                                                               |
| error      | Error + retry                                                                                               |


p3 Search additionally has **Recent** searches and **You might like** — not in p4 Enhanced Search. Phase 4 audit: “F-SRCH-3: No search history (PLANNED — not designed).”

### 3.5 Collections


| Surface | UI                                                                                                | Data shown                                                   | Nav                                 |
| ------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------- |
| List    | Italic title, subtitle, mosaic cards, description, count, accent chevron                          | `title`, `description`, `count`, `coverBooks`, `accentColor` | Card → detail; TabBar Home selected |
| Detail  | Full-bleed **accentColor** hero, description, count, 2-col book grid with author + first category | Same + books                                                 | Book → detail                       |




### 3.6 Book detail (7 access states)


| State          | Access UI                                                          | Extra CTAs                         |
| -------------- | ------------------------------------------------------------------ | ---------------------------------- |
| free           | Locked banner; Start 7-day free trial; See plans                   | → Subscription                     |
| trial-eligible | Trial promo; Start free trial to read; Already subscribed? Sign in | Sign in on an already-authed stack |
| active-trial   | Trial badge; Read now                                              | Download if canRead                |
| subscriber     | Read now                                                           | Download                           |
| canceled       | Access-until banner; Read now; Reactivate subscription             | Download                           |
| expired        | Locked; Resubscribe to read                                        | → Subscription                     |
| downloaded     | Downloaded badge; Read now                                         | Remove download                    |


Shared: cover, italic title, author, publisher, category pills, layout pill, **% progress bar**, About this book, download none/downloading/downloaded.

### 3.7 My Books (p4)


| State        | UI                                                                      |
| ------------ | ----------------------------------------------------------------------- |
| populated    | Count banner; rows with cover, title, author, status pill, Read, Remove |
| downloading  | In-list circular progress + %                                           |
| clock-tamper | Warning banner; one row locked; Read hidden on locked row               |
| mixed        | Mix of active / expiring / locked                                       |
| empty        | Empty + Browse library → Home                                           |


Sheets: Remove download.

### 3.8 Me (p4 Enhanced)


| State                               | UI                                                                                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| trial / active / canceled / expired | Avatar, email, subscription card with CTA → **Subscription**, Settings, My Books + count, Privacy Policy, About My Hikayat, Sign out, version footer |
| loading                             | Header + skeleton rows                                                                                                                               |
| error                               | Couldn't load your account + Try again                                                                                                               |


Sign-out always opens `SignOutSheet` (copy varies with download count).

p3 Me also had Font size + Language on Me — superseded by Settings in p4.

### 3.9 Settings

Sections:

- Reading Defaults: font px 13–24, line spacing Compact/Normal/Relaxed, margins Narrow/Normal/Wide, Dark reading theme toggle
- Downloads: count → My Books tab
- About: App version, **Terms of Service**, **Privacy Policy** (both `onPress={() => {}}`)



### 3.10 Subscription (dedicated screen, 5 states)


| State    | UI                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------- |
| free     | Feature list including “Up to 3 downloaded books”; annual RM 99 / monthly RM 12; Start 7-day free trial |
| trial    | Status + 0% bar; Upgrade; plan picker; Continue with plan                                               |
| active   | Status; Plan Details; Cancel subscription                                                               |
| canceled | Access until date; **Reactivate subscription**                                                          |
| expired  | Expired; Subscribe                                                                                      |


Trust row: Secure payment / Cancel anytime / Instant access. No payment-failure state in Figma `SubState`. No refund UI on this screen.

### 3.11 Reader

**Reflowable:** tap canvas toggles chrome; Back; chapter title; **bookmark toggle**; settings; chapter prev/next; settings sheet with px font, Compact/Normal/Relaxed, Light/Dark. p4 `BookmarksPanel` is a list overlay (add / go / remove / empty / saved flash) used in the later reader design.

**Fixed layout:** spread, arrows, dots, zoom, aspect-fit canvas (see `p3/FixedLayoutReader.tsx`).

**Clock tamper:** full screen `DeviceClockTamperScreen`, CTA **Reconnect to unlock**.

### 3.12 Sheets


| Sheet               | File                    | Confirm / cancel                       |
| ------------------- | ----------------------- | -------------------------------------- |
| Sign out            | `p4/Sheets.tsx`         | Sign out and remove downloads / Cancel |
| Remove download     | same                    | Remove download / Keep it              |
| Cancel subscription | same                    | Cancel / Keep my subscription          |
| Reader settings     | in reader               | Close                                  |
| Bookmarks           | `p4/BookmarksPanel.tsx` | Add / Go / delete / Close              |


---



## 4. Complete Screen Matrix


| Area        | Figma surface           | Mobile                            | Web                                         | Backend                                 | Status                         |
| ----------- | ----------------------- | --------------------------------- | ------------------------------------------- | --------------------------------------- | ------------------------------ |
| Auth        | Splash                  | `SessionSplash`                   | N/A (dashboard)                             | Session restore                         | COMPLETE (visual diffs)        |
| Auth        | Session restore failed  | `session-restore-screen.tsx`      | N/A                                         | `/auth/me`                              | PARTIAL                        |
| Auth        | Sign in                 | `/(public)/sign-in`               | `/login` is **admin/author**, not reader    | `POST /auth/login`                      | COMPLETE reader mobile         |
| Auth        | Sign up                 | `/(public)/register`              | `/register` is dashboard                    | `POST /auth/register`                   | PARTIAL (legal + success)      |
| Auth        | Forgot password         | `/(public)/forgot-password`       | None for readers                            | `POST /auth/forgot-password`            | PARTIAL (sent UI)              |
| Auth        | Reset password          | `/(public)/reset-password`        | None                                        | `POST /auth/reset-password`             | Mobile COMPLETE; Figma missing |
| Shell       | Tabs                    | `(tabs)` Home / library / profile | N/A                                         | —                                       | COMPLETE                       |
| Home        | Home                    | `/(app)/(tabs)/home`              | N/A                                         | catalog, progress, billing, collections | PARTIAL                        |
| Search      | Enhanced Search         | `/(app)/search`                   | N/A                                         | `GET /reader/search`                    | PARTIAL                        |
| Collections | List                    | `/(app)/collections`              | Admin collections CRUD                      | `GET /reader/collections`               | PARTIAL                        |
| Collections | Detail                  | `/(app)/collections/[id]`         | Admin collection detail                     | `GET /reader/collections/:id`           | PARTIAL                        |
| Book        | Detail                  | `/(app)/books/[bookId]`           | Admin/author book pages (different product) | `GET /reader/books/:id`                 | PARTIAL                        |
| Library     | My Books                | `/(app)/(tabs)/library`           | N/A                                         | offline package + lease                 | PARTIAL                        |
| Me          | Me                      | `/(app)/(tabs)/profile`           | N/A                                         | `/auth/me`, billing                     | PARTIAL                        |
| Account     | Settings                | `/(app)/settings`                 | N/A                                         | local prefs                             | PARTIAL                        |
| Billing     | Subscription screen     | **None** (card on Me)             | Admin subscriptions                         | `reader/billing/`*                      | MISSING route; CONFLICT IA     |
| Reader      | Reflowable / fixed      | `/(app)/books/read/[bookId]`      | N/A                                         | reading APIs                            | PARTIAL chrome                 |
| Reader      | Bookmarks panel         | BottomSheet                       | N/A                                         | bookmark APIs                           | COMPLETE (visual)              |
| Legal       | Privacy / About / Terms | **None**                          | **None**                                    | **None**                                | MISSING + CONTENT              |
| Security    | Clock tamper screen     | Banner + open-fail                | N/A                                         | lease validation                        | PARTIAL                        |


---



## 5. Master Gap Table


| ID    | Area        | Figma Surface             | Figma Requirement                       | Current Implementation                        | Gap                           | Classification                | Backend                                      | Frontend             | Mobile                       | Business Decision | Priority | Dependencies      | Recommendation                                                                          |
| ----- | ----------- | ------------------------- | --------------------------------------- | --------------------------------------------- | ----------------------------- | ----------------------------- | -------------------------------------------- | -------------------- | ---------------------------- | ----------------- | -------- | ----------------- | --------------------------------------------------------------------------------------- |
| G-001 | Legal       | Me + Settings             | Privacy Policy row                      | No route, no URL                              | Missing destination + content | CONTENT GAP                   | Config or CMS                                | Optional public page | Row + WebView or Linking     | Q-001             | P0       | Content           | Implement after owner picks URL vs in-app vs hide                                       |
| G-002 | Legal       | Settings                  | Terms of Service row                    | No URL                                        | Missing                       | CONTENT GAP                   | Config                                       | Optional             | Row                          | Q-002             | P0       | Content           | Same as Privacy                                                                         |
| G-003 | Legal       | Me                        | About My Hikayat screen                 | Version string on Settings only               | Missing screen/copy           | CONTENT GAP                   | Optional static                              | Optional             | New route or Settings expand | Q-003             | P0       | Copy              | Build in-app About once copy exists                                                     |
| G-004 | Auth        | Sign up                   | Terms + Privacy links                   | No links (spec previously forbade acceptance) | Missing links                 | CONFLICT                      | None if URL only                             | None                 | Links on register            | Q-001 Q-002 Q-004 | P0       | Legal URLs        | Add links; do not block register unless owner requires acceptance                       |
| G-005 | Auth        | Sign up success           | Success interstitial                    | Immediate session into tabs                   | Missing                       | CONFLICT                      | None                                         | None                 | Optional screen              | Q-005             | P2       | —                 | Recommend skip; Figma is a 1s marketing beat                                            |
| G-006 | Auth        | Forgot                    | Dedicated sent + Resend                 | Ack message on same form                      | Visual/UX                     | VISUAL GAP                    | Existing                                     | None                 | Restyle                      | —                 | P2       | —                 | Match Figma sent card; reuse same API                                                   |
| G-007 | Auth        | Sign in/up                | Cover strip of real covers              | Colored placeholder blocks                    | Visual                        | VISUAL GAP                    | Catalog covers optional                      | None                 | Chrome                       | Q-006             | P3       | Catalog or assets | Prefer real covers if cheap; else keep blocks                                           |
| G-008 | Auth        | Session restore           | Always warn downloads wiped             | Sheet only if downloads exist                 | Behavior                      | BEHAVIOR GAP                  | None                                         | None                 | Copy/sheet                   | Q-022             | P2       | —                 | Keep MG-9 skip when zero downloads; restyle copy                                        |
| G-009 | Home        | Greeting                  | Time-of-day + “Aisha”                   | “Hello” + email                               | Missing name + time           | DATA GAP + CONFLICT           | User has no display name                     | Would need field     | Greeting                     | Q-007             | P1       | Q-007             | Do not invent names; implement time-of-day + chosen identity                            |
| G-010 | Home        | Search                    | Icon-only                               | “Search books” pill                           | Visual                        | VISUAL GAP                    | None                                         | None                 | Affordance                   | —                 | P2       | —                 | Icon + a11y label                                                                       |
| G-011 | Home        | New + Browse              | Two sections; See all → Collections     | One infinite grid; Newest/Popular             | IA                            | CONFLICT                      | Catalog already paged                        | None                 | Home composition             | Q-008             | P1       | —                 | Prefer Figma two-section **visual** but keep paging; do not wire See all to Collections |
| G-012 | Home        | See all                   | Navigates to Collections                | No See all                                    | Prototype nav                 | POTENTIAL PROTOTYPE           | None                                         | None                 | Action                       | Q-008             | P2       | —                 | See all should stay in catalog or open a “newest” view, not Collections                 |
| G-013 | Home        | Collections rail          | Always populated                        | Hide on empty/error                           | Missing states                | MISSING                       | Existing list API                            | None                 | Empty/error                  | —                 | P1       | —                 | Show empty/error; Figma omitted them but Home loading/error exist as a pattern          |
| G-014 | Home        | Trial CTAs                | → Subscription screen                   | → Me                                          | Navigation                    | NAVIGATION GAP                | None                                         | None                 | Destinations                 | Q-009             | P0       | Q-009             | Follow Figma if dedicated billing ships; else keep Me                                   |
| G-015 | Search      | Idle pills                | Category browse on Search               | Idle hint only                                | Missing                       | CONFLICT with p4 vs spec      | Categories API exists                        | None                 | Idle UI                      | Q-010             | P1       | —                 | Figma p4 shows pills; cheap to add using existing categories                            |
| G-016 | Search      | Recents (p3 only)         | Recent list                             | None                                          | Missing                       | POTENTIAL PROTOTYPE           | No history API                               | None                 | Local or API                 | Q-011             | P2       | Q-011             | p4 audit says not designed; confirm                                                     |
| G-017 | Collections | Description               | Shown on list + detail                  | Title + count only                            | Missing field                 | DATA/BACKEND                  | Prisma + DTO + admin                         | Admin form           | Cards/hero                   | Q-012             | P1       | Q-012             | Add if owner wants editorial blurbs                                                     |
| G-018 | Collections | Accent color              | Hero + chevron tint                     | Neutral                                       | Missing field                 | DATA/BACKEND                  | Prisma + DTO + admin                         | Color picker         | Hero                         | Q-012             | P1       | Q-012             | Same decision as description                                                            |
| G-019 | Collections | Tab chrome                | TabBar with Home selected               | Stack + BackHeader                            | IA                            | NAVIGATION GAP                | None                                         | None                 | Chrome                       | E-001             | P2       | —                 | Keep stack (Figma also `nav.push`); do not add a 4th tab                                |
| G-020 | Book        | Access layouts            | 7 exclusive layouts + extra CTAs        | Single CTA resolver → Me                      | Behavior/visual               | PARTIAL                       | readingAccessState exists                    | None                 | Layouts                      | Q-009 Q-013       | P1       | Q-009             | Restyle notices to Figma; extra CTAs depend on billing IA                               |
| G-021 | Book        | % progress                | Chapter/spread + percent bar            | Resume sentence                               | Missing visual                | VISUAL GAP                    | Progress exists                              | None                 | Bar                          | E-002             | P2       | —                 | Show content-based % already produced by backend; do not invent                         |
| G-022 | Book        | Reactivate                | Secondary CTA                           | No API                                        | Missing                       | API GAP                       | No reactivate                                | None                 | Button                       | Q-014             | P1       | Q-014             | If no API, map CTA to Subscribe/checkout                                                |
| G-023 | Book        | Sign in CTA               | “Already subscribed? Sign in”           | User is signed in                             | Prototype                     | POTENTIAL PROTOTYPE           | None                                         | None                 | Hide                         | E-003             | P3       | —                 | Do not show on authenticated book detail                                                |
| G-024 | Book        | Download gating           | Hidden unless canRead                   | Always offered; server authorizes             | Behavior                      | CONFLICT                      | Authz on download                            | None                 | Visibility                   | Q-015             | P1       | —                 | Figma hide is reasonable UX; server must remain authority                               |
| G-025 | Me          | App group                 | Settings + My Books count               | Settings + Sign out                           | Missing shortcut              | MISSING                       | Offline count local                          | None                 | Rows                         | —                 | P1       | —                 | Implement; local count                                                                  |
| G-026 | Me          | Legal rows                | Privacy + About                         | Absent                                        | Missing                       | MISSING                       | Content                                      | Optional             | Rows                         | Q-001 Q-003       | P0       | Content           |                                                                                         |
| G-027 | Me          | Version footer            | On Me                                   | On Settings                                   | Visual                        | VISUAL GAP                    | Expo version                                 | None                 | Footer                       | —                 | P3       | —                 | Add footer; keep Settings version too                                                   |
| G-028 | Me          | Loading/error             | Full tab                                | Billing-only                                  | Partial                       | PARTIAL                       | `/auth/me`                                   | None                 | States                       | —                 | P1       | —                 | Add Me-level error if billing or profile fails                                          |
| G-029 | Me          | Manage CTA                | Pushes Subscription                     | Inline billing                                | Navigation                    | NAVIGATION GAP                | Existing billing                             | None                 | Route                        | Q-009             | P0       | Q-009             |                                                                                         |
| G-030 | Settings    | Control language          | px / S-M-L / switch                     | ± percent/line/px buttons                     | Visual                        | VISUAL GAP                    | None                                         | None                 | Controls                     | Q-016             | P1       | —                 | Map Figma presets onto existing persisted values                                        |
| G-031 | Settings    | Legal rows                | Terms + Privacy                         | Absent                                        | Missing                       | CONTENT GAP                   | Config                                       | Optional             | Rows                         | Q-001 Q-002       | P0       | Content           |                                                                                         |
| G-032 | Settings    | Reset defaults            | Not in Figma                            | Button exists                                 | App-only                      | —                             | None                                         | None                 | Keep                         | E-004             | P3       | —                 | Keep; useful                                                                            |
| G-033 | My Books    | Author + cover            | Shown                                   | Placeholder cover; no author                  | Data                          | DATA GAP                      | Manifest has title/description, no cover URI | None                 | Rows                         | Q-017             | P1       | Q-017             | Do not invent; cache cover/author if owner says yes                                     |
| G-034 | My Books    | Downloading row           | In-list %                               | Progress on book detail only                  | Missing on tab                | PARTIAL                       | None                                         | None                 | Library hook                 | —                 | P1       | Offline actions   | Surface in-progress packages on My Books                                                |
| G-035 | My Books    | Hide Read when locked     | Hidden                                  | Open always shown                             | Behavior                      | CONFLICT                      | Fail-closed open                             | None                 | Buttons                      | Q-018             | P1       | —                 | Figma hide is reasonable; open can remain for fail-closed if owner prefers              |
| G-036 | Clock       | Full screen               | Reconnect to unlock                     | Banner + reader retry/subscribe               | Missing screen                | NAVIGATION GAP                | Clock flag exists                            | None                 | Route or modal               | Q-019             | P1       | —                 | Dedicated screen is reasonable                                                          |
| G-037 | Reader      | Settings presets          | px / Compact-Normal-Relaxed             | Increment percents                            | Visual                        | VISUAL GAP                    | None                                         | None                 | Settings                     | Q-016             | P1       | Same as Settings  | Share one control language                                                              |
| G-038 | Reader      | Tap canvas toggles chrome | Yes                                     | Overlay/edge; no HTML tap                     | Behavior                      | TECHNICAL DECISION            | None                                         | None                 | Engine                       | E-005             | P1       | Engine risk       | Prefer chrome controls; injecting WebView clicks is fragile                             |
| G-039 | Reader      | Bookmark toggle in chrome | Single toggle                           | Panel list                                    | Behavior                      | BEHAVIOR GAP                  | Bookmark APIs                                | None                 | Chrome                       | Q-020             | P2       | —                 | Keep panel (richer); add filled icon state                                              |
| G-040 | Reader      | Zoom 1 / 1.4 / 2          | Implied                                 | 1×–3× / 0.25                                  | Behavior                      | CONFLICT                      | None                                         | None                 | Zoom                         | Q-021             | P2       | —                 | Product stepped zoom already works; Figma values are likely demo                        |
| G-041 | Billing     | Dedicated screen          | 5 states + plan cards                   | Me card + Stripe                              | Missing screen                | CONFLICT                      | Plans API monthly only                       | Admin plans          | New route                    | Q-009 Q-014       | P0       | Plans             | Build if owner confirms Figma IA                                                        |
| G-042 | Billing     | Annual + RM prices        | Annual RM 99, monthly RM 12, Save 31%   | `monthly_paid` only; real cents               | Data                          | POTENTIAL PROTOTYPE + BACKEND | PlanKind/interval                            | Admin plans          | Plan picker                  | Q-014b            | P0       | Pricing           | Do not hardcode RM; extend Plan if annual is real                                       |
| G-043 | Billing     | Max 3 downloads           | Feature bullet                          | No cap                                        | Missing rule                  | POTENTIAL PROTOTYPE + BACKEND | Enforce if real                              | None                 | Messaging                    | Q-015b            | P0       | Policy            | Do not fake a cap                                                                       |
| G-044 | Billing     | Reactivate                | Restores previous plan                  | Checkout again                                | Missing                       | API GAP                       | New endpoint or reuse checkout               | Admin                | CTA                          | Q-014             | P1       | Stripe            |                                                                                         |
| G-045 | Billing     | Refund                    | Not in Figma billing UI                 | Request refund on Me                          | App-only                      | —                             | `POST /reader/billing/refund`                | Admin                | Keep                         | E-006             | P1       | —                 | Keep unless owner removes refunds                                                       |
| G-046 | Account     | Language                  | p3 Me “English”                         | Not implemented                               | Missing                       | POTENTIAL PROTOTYPE           | Locale later                                 | None                 | Row                          | Q-021b            | P2       | i18n              | p4 removed it from Me; confirm                                                          |
| G-047 | Visual      | Fonts                     | Fraunces + Nunito (Phase 6)             | System fonts                                  | Visual                        | TECHNICAL DECISION            | None                                         | Dashboard unrelated  | Expo fonts                   | Q-021c            | P1       | Licensing         | Load Google fonts if owner wants exact type                                             |
| G-048 | Shell       | Tab label                 | “My Books”                              | “My books”                                    | Copy                          | VISUAL GAP                    | None                                         | None                 | Tab                          | —                 | P3       | —                 | Match Figma capitalization                                                              |
| G-049 | Web         | Dashboard                 | Not in this Figma                       | Full admin/author app                         | Out of Figma scope            | —                             | Yes                                          | Yes                  | No                           | Q-021d            | —        | —                 | Do not restyle dashboard to Direction B unless owner expands scope                      |
| G-050 | Data        | Display name              | First name in greeting; p3 Me full name | `User.email` + `role` only                    | Missing column                | BACKEND GAP                   | Prisma User                                  | Optional profile     | Greeting/Me                  | Q-007             | P1       | Q-007             |                                                                                         |




---



## 6. Backend/API Gaps


| Need                            | Current                                                                                                    | Required if Figma is literal                            |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Display name / first name       | `User`: email, passwordHash, role, isPublisher                                                             | `displayName` or `firstName` + reader DTO               |
| Collection description          | `Collection.title` only                                                                                    | `description` + admin + reader DTO                      |
| Collection accent color         | None                                                                                                       | `accentColor` (hex) + admin validation                  |
| Annual plan                     | `PlanKind`: `free` | `monthly_paid`; `PlanInterval`: `month` only (Stripe manager already mentions `year`) | Enum + Stripe price + checkout                          |
| Reactivate                      | `cancel`, `checkout`, `trial/start`, `refund`                                                              | New command or documented mapping to checkout           |
| Download cap of 3               | No count limit in lease/download services                                                                  | Enforce + error code                                    |
| Legal URLs                      | None in schema/config                                                                                      | Env or settings table                                   |
| About content                   | None                                                                                                       | Static config or CMS                                    |
| Search history                  | None                                                                                                       | Optional local-only; no backend unless sync             |
| Offline cover/author in package | Manifest: title, description, layout, lease — **no cover URL**                                             | Include cover + authorName in package or sidecar cache  |
| In-book search                  | `GET /reader/search/:id` **exists**                                                                        | Figma reader has no search overlay — API ahead of Figma |


No reactivate, no privacy endpoint, no annual `PlanKind`, no collection description in `CreateCollectionRequestDto`.

---



## 7. Web Gaps

The React app is **admin + author**, not the Figma reader.

Figma-driven web work appears **only if** new reader-facing fields must be edited:


| If owner approves                | Web work                                                            |
| -------------------------------- | ------------------------------------------------------------------- |
| Collection description / accent  | Admin collection create/edit forms (`frontend` collections feature) |
| Display name                     | Optional admin user display; reader self-edit is **not** in Figma   |
| Annual plans                     | Admin plans already exist; extend kind/interval UI                  |
| Legal URLs                       | Possibly an admin “app settings” page — **does not exist today**    |
| Direction B restyle of dashboard | **Not in Figma.** Do not do this unless scope expands               |


Reader sign-in/up in Figma must not be confused with `/login` and `/register` on the dashboard.

---



## 8. Mobile Gaps

See §5 for the row-level list. Highest-impact mobile-only implementation (after decisions):

- New routes: Privacy, About, Terms (or Linking), Subscription, Clock tamper, optional Sign-up success
- Me rows: My Books count, legal, version footer, loading/error
- Settings: preset controls + legal
- Home: greeting, search icon, section split, collections empty/error
- Search idle category pills
- Collections description/accent (after API)
- Book detail Figma access layouts
- My Books downloading + metadata
- Reader settings/chrome/bookmark/clock CTA
- Fonts

Existing mobile capabilities to **preserve** unless the owner removes them: refund, reset password, role on Me, Newest/Popular, infinite paging, checkout return handling, reset reading defaults, offline connectivity banner.

---



## 9. Navigation Gaps


| Figma action              | Expected destination                   | Current destination               | Status               | Required change               |
| ------------------------- | -------------------------------------- | --------------------------------- | -------------------- | ----------------------------- |
| Splash done               | Home or Sign in                        | Same                              | OK                   | —                             |
| Restore Try again         | Retry restore                          | Same                              | OK                   | —                             |
| Restore Sign in again     | Sign in (purges downloads)             | Same + confirm sheet if downloads | Partial              | Copy/sheet always-on is Q-022 |
| Sign in Create one        | Sign up                                | Register                          | OK                   | —                             |
| Sign in Forgot            | Forgot password                        | Forgot                            | OK                   | —                             |
| Sign up Terms/Privacy     | Unknown (unwired in Figma)             | None                              | Missing              | Q-001 Q-002                   |
| Sign up success           | Auto to library                        | Tabs immediately                  | Missing interstitial | Q-005                         |
| Tab Home / My Books / Me  | Tabs                                   | Same                              | OK                   | Label casing                  |
| Home search icon          | Search                                 | Search (pill)                     | OK path              | Visual                        |
| Home book                 | Book detail                            | Book detail                       | OK                   | —                             |
| Home continue             | Reader                                 | Reader                            | OK                   | —                             |
| Home See all (New)        | Collections                            | None                              | Wrong target         | Q-008                         |
| Home All collections      | Collections                            | Collections                       | OK                   | —                             |
| Home Try free / Subscribe | Subscription                           | Me                                | Gap                  | Q-009                         |
| Search result             | Book detail                            | Book detail                       | OK                   | —                             |
| Search category pill      | Unspecified in p4 (no onClick handler) | N/A                               | Unwired in Figma     | Q-010                         |
| Collection card           | Detail                                 | Detail                            | OK                   | —                             |
| Collection book           | Book detail                            | Book detail                       | OK                   | —                             |
| Book Read                 | Reader                                 | Reader                            | OK                   | —                             |
| Book trial/plans          | Subscription                           | Me                                | Gap                  | Q-009                         |
| Book Reactivate           | Subscription canceled                  | None                              | Gap                  | Q-014                         |
| Book Sign in              | Sign in                                | N/A (already authed)              | Prototype            | Hide                          |
| Settings Downloaded books | My Books tab                           | Library tab                       | OK                   | —                             |
| Settings Terms/Privacy    | Unwired                                | None                              | Missing              | Q-001 Q-002                   |
| Me Settings               | Settings                               | Settings                          | OK                   | —                             |
| Me My Books               | My Books tab                           | None                              | Missing              | Add                           |
| Me Privacy / About        | Unwired                                | None                              | Missing              | Q-001 Q-003                   |
| Me Manage subscription    | Subscription                           | Inline Me                         | Gap                  | Q-009                         |
| Me Sign out               | Sign in                                | Sign in                           | OK                   | Sheet rules Q-022             |
| Clock Reconnect           | Unspecified (likely retry/online)      | No screen                         | Missing              | Q-019                         |
| Checkout                  | External (implied)                     | Stripe hosted                     | OK                   | Not in Figma chrome           |
| Reset password deep link  | Not designed                           | `/(public)/reset-password`        | App-only             | Keep                          |


---



## 10. State Gaps


| Screen                  | Figma states                       | Mobile states                                                   | Gap                      |
| ----------------------- | ---------------------------------- | --------------------------------------------------------------- | ------------------------ |
| Sign in                 | default, loading, invalid, network | Same via form errors                                            | Visual                   |
| Sign up                 | + validation + **success**         | No success interstitial                                         | G-005                    |
| Forgot                  | + sent                             | Ack on form                                                     | G-006                    |
| Home                    | 6 including loading/error          | Catalog skeleton/error; header live; collections hide errors    | G-013                    |
| Search                  | 5                                  | 5 core; no idle pills                                           | G-015                    |
| Book detail             | 7 access                           | Resolver + notices                                              | G-020                    |
| My Books                | 5 including downloading + clock    | Empty, populated, clock banner, load error; no in-list download | G-034                    |
| Me                      | 6 including loading/error          | Identity always; billing loading/error                          | G-028                    |
| Subscription            | 5                                  | Folded into Me; no annual; has refund (extra)                   | G-041                    |
| Clock                   | Full screen                        | Banner                                                          | G-036                    |
| Reader open failed      | Reconnect CTA                      | Subscribe vs retry                                              | G-036                    |
| Payment failure         | **Not in Figma SubState**          | Checkout return messages                                        | App-only; keep           |
| Collections empty/error | Not prototyped                     | List/detail have them                                           | App-ahead of Figma; keep |


---



## 11. Visual/Design Gaps

Phase 6 handoff tokens were already mapped into `mobile/src/theme/` (colors, radii, shadows). Remaining visual gaps:


| Token / component | Figma                                         | Mobile                     |
| ----------------- | --------------------------------------------- | -------------------------- |
| Display font      | Fraunces italic                               | System; italic simulated   |
| Body font         | Nunito                                        | System                     |
| Tab active        | 4pt primary dot under label                   | RN tab indicator           |
| Search home       | Icon 22pt                                     | Full-width pill            |
| Settings steppers | 32pt ± and S/M/L chips                        | Text buttons               |
| Theme control     | Switch (Settings) / Light-Dark chips (reader) | Toggle button              |
| Auth covers       | Book artwork                                  | Color blocks               |
| Collection hero   | Accent fill                                   | Canvas + BackHeader        |
| Book progress     | 4pt primary bar + %                           | Copy only                  |
| Sheets            | Icon well + italic title                      | BottomSheet + similar type |
| Dark reading      | In-reader only                                | Same (no app-wide dark)    |


Dark **app** theme is not in Figma (only reading theme). Do not add app-wide dark mode.

---



## 12. Accessibility Gaps

Figma implies large pills, 44pt-class controls (`touch` tokens in Phase 6), and labeled icon buttons.

Mobile already has `testID`s, roles, and min heights on many controls. Gaps vs Figma:


| Item                                | Issue                                                        | Task          |
| ----------------------------------- | ------------------------------------------------------------ | ------------- |
| Home search if changed to icon-only | Must keep `accessibilityLabel="Search books"`                | FIGMA-010     |
| Bookmark icon toggle                | Needs selected state for VoiceOver                           | FIGMA-039     |
| Category pills                      | Need selected state (Home has it; Search idle would need it) | FIGMA-015     |
| Cover strip                         | Decorative; must be `accessibilityElementsHidden`            | FIGMA-007     |
| Legal rows                          | Need labels and traits                                       | FIGMA-001–003 |
| Clock screen                        | Primary CTA must be focusable                                | FIGMA-036     |


Keyboard/web a11y for the **reader** Figma does not apply to the dashboard.

---



## 13. Missing Data


| Field                     | Figma usage                          | Current API                                                                                | Required API change                      | DB change?        | Business decision? | Recommendation                                              |
| ------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------ | ---------------------------------------- | ----------------- | ------------------ | ----------------------------------------------------------- |
| Display name / first name | Home greeting; p3 Me “Aisha Rahimah” | `UserResponse.email`, `role`                                                               | Add optional `displayName`               | Yes (`User`)      | Q-007              | Only if greeting uses a name                                |
| Collection.description    | List + detail                        | Title only                                                                                 | Create/update/get DTOs                   | Yes               | Q-012              | Yes if editorial                                            |
| Collection.accentColor    | Detail hero                          | None                                                                                       | Hex string validated                     | Yes               | Q-012              | Yes if hero stays                                           |
| Plan annual + amount      | RM 99 / RM 12                        | `amountCents`, `currency`, monthly only                                                    | `PlanInterval.year` + kind               | Yes (enum)        | Q-014b             | Use real Stripe prices, never hardcoded RM                  |
| Reactivate                | Canceled CTA                         | None                                                                                       | New POST or reuse checkout               | Maybe Stripe only | Q-014              | Prefer checkout unless Stripe has a resume API already used |
| Download max 3            | Marketing bullet                     | Unlimited (entitled)                                                                       | Enforce + error                          | Policy            | Q-015b             | Do not implement without policy                             |
| Privacy URL               | Rows                                 | None                                                                                       | Config                                   | Env or table      | Q-001              |                                                             |
| Terms URL                 | Rows                                 | None                                                                                       | Config                                   | Env or table      | Q-002              |                                                             |
| About body                | About screen                         | Version only                                                                               | Static or CMS                            | Optional          | Q-003              |                                                             |
| Offline cover URL         | My Books / Figma covers              | Not in manifest                                                                            | Include in package or cache while online | Package shape     | Q-017              |                                                             |
| Offline authorName        | My Books rows                        | Manifest `description` exists but is book blurb, not author; UI does not show it as author | Store `authorName` in manifest           | Package shape     | Q-017              |                                                             |
| Search history            | p3 only                              | None                                                                                       | Local AsyncStorage or API                | Optional          | Q-011              | Local-only if approved                                      |
| Language pref             | p3 Me                                | None                                                                                       | Device or account locale                 | Optional          | Q-021b             | Defer with i18n                                             |


Sample Figma dates (`15 Feb 2027`) and email `aisha@example.com` are **demo values**. Use live subscription dates and the signed-in email.

---



## 14. Business Decisions Required

Owner: fill **Owner decision** on each item. Do not implement these until answered.

### Q-001 — Privacy Policy destination

**Question:**  
Should Privacy Policy open an external website or an in-app page?

**Figma:**  
Shows a Privacy Policy row on Me and Settings. `onPress` is empty.

**Current app:**  
No destination exists. `MOBILE-PRODUCT-SPEC.md` previously forbade legal URLs without real content.

**Why it matters:**  
Determines whether we need a new route/screen, `Linking.openURL`, backend config, or to hide the row.

**Options:**  

- A — External Privacy Policy URL  
- B — Build an in-app Privacy Policy page (static or WebView)  
- C — Hide the row until content exists

**Recommended:**  
A — External URL, if the company already has a public legal page.

**Owner decision:**  
**A — External Privacy Policy URL.** Configure the URL from the admin panel (not a hardcoded env-only value). Mobile Me and Settings open that URL. Do not implement Terms (Q-002) from this answer.

---



### Q-002 — Terms of Service destination

**Question:**  
Same as Privacy, for Terms of Service on Settings (and Sign up links).

**Figma:**  
Settings row; Sign up footer links. Unwired.

**Current app:**  
None. Spec previously omitted terms acceptance.

**Why it matters:**  
Sign-up copy implies legal agreement even if the app does not block on a checkbox.

**Options:**  

- A — External Terms URL  
- B — In-app Terms page  
- C — Hide until content exists

**Recommended:**  
A — same host as Privacy.

**Owner decision:**  
**A — External Terms URL.** Same pattern as Privacy: admin-editable `termsOfServiceUrl` on platform settings (not env-only). Mobile Settings (and Sign up links) open that URL. Hide the row when the URL is null.

---



### Q-003 — About My Hikayat content

**Question:**  
What should About My Hikayat contain besides app version?

**Figma:**  
Me row “About My Hikayat”; no body content in source.

**Current app:**  
`My Hikayat · version {expo}` on Settings.

**Why it matters:**  
New route vs expanding Settings.

**Options:**  

- A — In-app screen: mission, version, maybe legal links  
- B — Expand Settings About section only  
- C — External website  
- D — Hide until copy is written

**Recommended:**  
A once copy exists; B as interim.

**Owner decision:**  
**A — In-app screen: mission, version, maybe legal links.** Dedicated About route from Me. Mission copy is admin-editable (`aboutMission`); version from Expo; Privacy/Terms links when those URLs exist. Do not invent a long marketing story.

---



### Q-004 — Sign-up legal acceptance

**Question:**  
Must the user accept Terms/Privacy to create an account, or are they informational links?

**Figma:**  
“By creating an account you agree to our Terms… and Privacy…” with underlined spans (not a checkbox).

**Current app:**  
No mention. Spec listed terms acceptance as absent.

**Why it matters:**  
Checkbox would be a product/compliance change; links-only is UI.

**Options:**  

- A — Informational links only (match Figma; no checkbox)  
- B — Required checkbox before submit  
- C — Omit until legal pages exist

**Recommended:**  
A after Q-001/Q-002 have URLs.

**Owner decision:**  
**A — Informational links only (match Figma; no checkbox).** Register stays unblocked. Show a Terms/Privacy sentence with tappable links when those URLs exist. Do not store acceptance.

---



### Q-005 — Sign-up success interstitial

**Question:**  
Show “Account created / Taking you to the library” before Home?

**Figma:**  
Dedicated success state.

**Current app:**  
Register returns a session and enters tabs.

**Why it matters:**  
Extra screen vs faster time-to-library.

**Options:**  

- A — Short interstitial then Home  
- B — Keep immediate entry (current)

**Recommended:**  
B — current is better UX; Figma success is a prototype beat.

**Owner decision:**  
**B — Keep immediate entry (current).** Do not build FIGMA-005.

---



### Q-006 — Auth cover strip artwork

**Question:**  
Use real catalog covers on Sign in/up?

**Figma:**  
Horizontal strip of sample book covers.

**Current app:**  
Colored decorative blocks (intentionally not prototype art).

**Options:**  

- A — Fetch a few published covers  
- B — Keep abstract blocks  
- C — Static bundled artwork

**Recommended:**  
B until a cover endpoint for unauthenticated marketing is defined (sign-in is public; catalog APIs are authenticated).

**Owner decision:**  
**Gif or video set in the admin panel** (not catalog covers, not abstract-only). Persist `authCoverMediaUrl`. Admin UI includes an aspect-ratio hint: landscape looping GIF or muted MP4, about **16:9** (a **3:1** strip also fits the Sign in cover area). Sign in/up chrome uses that media when set; keep colored blocks as fallback. No hardcoded artwork URLs.

---



### Q-007 — Display name vs email greeting

**Question:**  
What identity string does Home/Me show?

**Figma:**  
`HomeScreen` uses time-of-day + **Aisha**. Phase 4 audit says greeting should use **email**. Enhanced Me uses email as title.

**Current app:**  
Hello + email; Me shows email + role. DB has no display name.

**Why it matters:**  
May require `User.displayName`, registration field, and admin.

**Options:**  

- A — Email only (current + Phase 4 note)  
- B — Time-of-day + email  
- C — Collect display name at sign-up and use first name  
- D — Derive first token of email (fragile)

**Recommended:**  
B now; C only if the owner wants names in the product.

**Owner decision:**  
**C — Collect display name at sign-up and use first name.** Persist `User.displayName`; greet Home/Me with the first token. Existing accounts without a name fall back to email.

---



### Q-008 — Home catalog information architecture

**Question:**  
Keep one paged catalog, or Figma’s two sections (New in My Hikayat + Browse Stories) and what should “See all” do?

**Figma:**  
Two sections; See all on New goes to **Collections** (likely prototype wiring).

**Current app:**  
One infinite grid; heading switches Newest/Popular; real category filters.

**Options:**  

- A — Figma layout: finite New grid + Browse grid; See all opens a newest list (not Collections)  
- B — Keep one grid; only restyle  
- C — Two sections but See all → Collections as drawn

**Recommended:**  
A visual structure, **not** C. Collections is a different object.

**Owner decision:**  
**A — Figma layout: finite New grid + Browse grid; See all opens a newest list (not Collections).** Keep real category filters and paging on Browse. Do not wire See all to Collections.

---



### Q-009 — Dedicated Subscription screen

**Question:**  
Should subscription management remain inside Me or become a dedicated page as in Figma?

**Figma:**  
`SubscriptionScreen` with 5 states; Me “Manage” / trial CTAs / book CTAs push it.

**Current app:**  
All billing on Me (`SubscriptionStatusCard`). Spec §12.5 said no dedicated paywall. Checkout is Stripe hosted.

**Why it matters:**  
New route, duplicate state machine, Home/Book navigation.

**Options:**  

- A — Build Figma Subscription screen; Me card becomes a summary that navigates there  
- B — Keep billing on Me; restyle the card to look like Figma SubStatusCard  
- C — Hybrid: dedicated screen for plan pick/trial; manage/cancel stay on Me

**Recommended:**  
A if Figma is product truth; it is technically reasonable. Do not hardcode RM prices.

**Owner decision:**  
**A — Build Figma Subscription screen; Me card becomes a summary that navigates there.**

---



### Q-010 — Search idle category pills

**Question:**  
Should Search idle show category pills?

**Figma:**  
p4 idle “Browse by Category” chips; **no click handler** in source.

**Current app:**  
Idle hint only. Categories already on Home.

**Options:**  

- A — Pills filter/search by category (needs search-by-category or navigate Home with filter)  
- B — Pills navigate to Home with that category selected  
- C — Omit pills (decorative in Figma)

**Recommended:**  
B if cheap; A needs API confirmation (search is title/author/publisher only today).

**Owner decision:**  
**A — Pills filter/search by category** (catalog `categoryId` or navigate Home with that filter).

---



### Q-011 — Search history

**Question:**  
Persist recent searches?

**Figma:**  
p3 yes; p4 Enhanced Search no; Phase 4 audit: not designed.

**Current app:**  
None.

**Options:**  

- A — Local recents like p3  
- B — Server history  
- C — Do not implement

**Recommended:**  
C unless owner wants p3 restored.

**Owner decision:**  
**A — Local recents like p3.** Persist recent searches on-device only. No server history API.

---



### Q-012 — Collection description and accent color

**Question:**  
Should collections have editorial description and accent color?

**Figma:**  
Yes, on list and detail hero.

**Current app:**  
Title + books only. Admin can only set title + membership.

**Options:**  

- A — Add both fields (Prisma, admin, reader API, mobile)  
- B — Description only  
- C — Visual accent only (client hash of id — not in Figma)  
- D — Do not add

**Recommended:**  
A — this is real editorial product, not fake user data.

**Owner decision:**  
**A — Add both fields (Prisma, admin, reader API, mobile).**

---



### Q-013 — Book detail “Sign in” and extra billing CTAs

**Question:**  
Which of Figma’s extra book-detail CTAs are real: See plans, Already subscribed? Sign in, Reactivate?

**Figma:**  
All three appear in some access states.

**Current app:**  
One primary CTA.

**Options:**  

- A — Implement all that remain valid for an authenticated reader (drop Sign in)  
- B — Keep single CTA  
- C — Match Figma including Sign in (not recommended)

**Recommended:**  
A after Q-009/Q-014.

**Owner decision:**  
**A — Implement all that remain valid for an authenticated reader (drop Sign in).**

---



### Q-014 — Reactivate subscription

**Question:**  
Should a canceled-but-still-active user be able to “Reactivate” the previous plan without a new checkout?

**Figma:**  
Reactivate restores previous plan and billing.

**Current app:**  
Cancel stops renewal; access until `currentPeriodEnd`; user subscribes again via Stripe Checkout. No reactivate endpoint.

**Why it matters:**  
Stripe customer portal vs custom API vs “Subscribe” copy.

**Options:**  

- A — Build reactivate (Stripe resume / new subscription)  
- B — Relabel Figma “Reactivate” to open checkout  
- C — Hide Reactivate; keep Subscribe

**Recommended:**  
B unless billing already supports resume in Stripe.

**Owner decision:**  
**A if Stripe supports resume; otherwise B.** Current cancel uses immediate `subscriptions.cancel()`, so resume is not available. **Implement B — relabel Figma “Reactivate” to open checkout.**

---



### Q-014b — Annual plan and sample prices

**Question:**  
Are Figma prices (RM 99/year, RM 12/month, Save 31%) real commercial terms?

**Figma:**  
Hardcoded.

**Current app:**  
Plans from API (`amountCents`, `currency`). Kind `monthly_paid` only.

**Options:**  

- A — Introduce annual Stripe price and show real amounts  
- B — Monthly only; ignore annual card  
- C — Show two plans but bind to whatever `GET /reader/billing/plans` returns (no hardcoded RM)

**Recommended:**  
C always for display; A only if the business sells annual.

**Owner decision:**  
**C — Show two plans but bind to whatever `GET /reader/billing/plans` returns (no hardcoded RM).** Render however many plans the API returns. Do not invent an annual `PlanKind` or RM 99/12 / Save 31%.

---



### Q-015 — Hide download until entitled

**Question:**  
Hide Download on book detail unless the user can read?

**Figma:**  
Download only if `canRead`.

**Current app:**  
Download control always shown; backend authorizes.

**Options:**  

- A — Match Figma (hide when not entitled)  
- B — Keep visible; server rejects

**Recommended:**  
A for UX; never compute entitlement locally beyond `readingAccessState` display.

**Owner decision:**  
**A — Match Figma (hide when not entitled).** Hide Download unless `readingAccessState` is `trial` or `paid` (display-only). Server remains authoritative.

---



### Q-015b — Maximum 3 downloads

**Question:**  
Is “Up to 3 downloaded books at once” a real business rule?

**Figma:**  
Feature bullet on Subscription.

**Current app:**  
No cap.

**Options:**  

- A — Enforce 3 (backend + mobile)  
- B — Marketing copy only, do not enforce  
- C — Remove the bullet

**Recommended:**  
Do not enforce until A is explicit. C if it is prototype.

**Owner decision:**  
**A — Enforce 3 (backend + mobile).** Max three active offline downloads per user. Backend rejects a fourth with a clear error; mobile shows that error. Removing a download releases the slot.

---



### Q-016 — Reading settings control language

**Question:**  
Switch stored settings to Figma presets (px, Compact/Normal/Relaxed, Narrow/Normal/Wide, switch) or keep numeric steps?

**Figma:**  
Presets in Settings and reader.

**Current app:**  
fontScalePercent 90–160 step 10; lineHeight 1.2–2.0 step 0.1; marginPx 8–36 step 4.

**Options:**  

- A — New preset model matching Figma  
- B — Map Figma UI onto nearest existing values (no migration)  
- C — Keep increment UI

**Recommended:**  
B — visual Figma, same persistence.

**Owner decision:**  
**B — Map Figma UI onto nearest existing values (no migration).**

---



### Q-017 — Offline author and cover on My Books

**Question:**  
Should My Books show author and cover while offline?

**Figma:**  
Yes.

**Current app:**  
Title, layout, lease. Spec previously forbade inventing cover/author. Manifest has `description` (book blurb) unused as author; no cover URI.

**Options:**  

- A — Cache cover + authorName at download time  
- B — Show only when online (hydrate from catalog)  
- C — Keep title/layout/lease only

**Recommended:**  
A if Figma is product truth; it is reasonable and does not require inventing data.

**Owner decision:**  
**A — Cache cover + authorName at download time.**

---



### Q-018 — Open vs hide when lease expired / clock tamper

**Question:**  
Should an expired/locked download still show Read/Open?

**Figma:**  
Hide Read; show locked cover.

**Current app:**  
Open always; reader fail-closed.

**Options:**  

- A — Hide Open; show locked (Figma)  
- B — Keep Open (current)  
- C — Show Open disabled with explanation

**Recommended:**  
A on My Books list; keep fail-closed if they open another way.

**Owner decision:**  
**A on My Books list** (hide Open when locked/clock-tamper); keep fail-closed if they open another way.

---



### Q-019 — Clock tamper full screen

**Question:**  
Dedicated “Reconnect to unlock” screen vs banner?

**Figma:**  
Full screen + My Books banner.

**Current app:**  
My Books banner; reader error maps to subscribe/retry.

**Options:**  

- A — Full screen on open + banner  
- B — Banner only; change reader CTA to Reconnect  
- C — Keep current

**Recommended:**  
A for Figma alignment; CTA should retry network/open, not subscribe, when the cause is clock.

**Owner decision:**  
**A — Full screen on open + banner.** CTA reconnects/retries, not subscribe, when the cause is clock.

---



### Q-020 — Reader bookmark control

**Question:**  
Chrome bookmark toggle (p3 reader) vs bookmarks panel (p4 panel + current app)?

**Figma:**  
Both exist in the file.

**Current app:**  
Panel with add/jump/remove.

**Options:**  

- A — Toggle only  
- B — Panel only (current)  
- C — Toggle adds current position; icon opens panel

**Recommended:**  
C.

**Owner decision:**  
**C — Toggle adds current position; icon opens panel.**

---



### Q-021 — Fixed-layout zoom steps

**Question:**  
Use Figma-like 1 / 1.4 / 2 or keep 1×–3× step 0.25?

**Figma:**  
Not fully specified as product math; prototype zoom.

**Current app:**  
Product stepped zoom; pinch disabled.

**Options:**  

- A — Change steps to 1 / 1.4 / 2  
- B — Keep current range

**Recommended:**  
B.

**Owner decision:**  
**B — Keep current range.** Do not change fixed-layout zoom to 1 / 1.4 / 2.

---



### Q-021b — Language setting

**Question:**  
Expose Language = English on Me (p3)?

**Figma:**  
p3 Me only; p4 Settings does not include it.

**Current app:**  
English-only UI; no locale API.

**Options:**  

- A — Device language setting (future i18n)  
- B — Do not implement

**Recommended:**  
B until i18n is a program.

**Owner decision:**  
**B — Do not implement (maybe later).** No Language row.

---



### Q-021c — Custom fonts

**Question:**  
Ship Fraunces + Nunito as in Phase 6 handoff?

**Figma:**  
Yes.

**Current app:**  
System fonts (previous implementation constraint).

**Options:**  

- A — Add Expo Google fonts  
- B — Keep system; approximate italic/weight

**Recommended:**  
A if Figma is visual truth; licensing is standard Google Fonts.

**Owner decision:**  
**A — Add Expo Google fonts** Fraunces (titles, italic) and Nunito (UI/body). Fall back to system fonts if load fails.

---



### Q-021d — Dashboard in this program?

**Question:**  
Is this Figma alignment limited to the reader mobile app (plus APIs it needs), or should the web dashboard also change?

**Figma:**  
Reader mobile only.

**Current web:**  
Admin/author dashboard, different IA.

**Options:**  

- A — Mobile reader + required APIs/admin fields only  
- B — Also restyle dashboard to Direction B

**Recommended:**  
A.

**Owner decision:**  
**B — Also restyle dashboard to Direction B.** Admin/author web should use the same Warm / Playful visual language (tokens + Fraunces/Nunito), not only the reader app. Figma remains reader-mobile for screens; dashboard restyle follows `docs/FRONTEND-ARCHITECTURE.md`.

---



### Q-022 — Sign-out confirmation when there are zero downloads

**Question:**  
Always show a sign-out sheet?

**Figma:**  
Always shows a sheet; copy changes if downloads exist.

**Current app:**  
Confirms only when downloads exist.

**Options:**  

- A — Always sheet (Figma)  
- B — Keep skip when empty

**Recommended:**  
A for Figma parity; low cost.

**Owner decision:**  
**A — Always sheet (Figma).** Always confirm sign-out (and align session-restore abandon). Copy changes if downloads exist; destructive purge still only when packages exist.

---



## 15. Engineering Decisions

These can proceed with the recommended option unless the owner overrides.

### E-001 — Collections is a pushed screen, not a fourth tab

Figma list still renders `TabBar` with Home selected, but navigation is `nav.push({ type: 'collections' })`. Mobile stack + back is correct. Restyle header; do not add a tab.

### E-002 — Progress percent on book detail

Backend already derives content-based progress. Show it as Figma’s bar. Do not use viewport page counts (see `docs/FUTURE.md`).

### E-003 — Hide “Already subscribed? Sign in” on book detail

The reader is already authenticated. Showing Sign in is prototype.

### E-004 — Keep Reset reading defaults

Not in Figma; useful; no API.

### E-005 — Do not inject WebView click-to-toggle unless engines are explicitly opened

Figma taps the reading canvas. Current overlay hide is safer. Document as accepted unless Q-038/engine work is approved.

### E-006 — Keep refund

Not on Figma Subscription screen; it is real (`POST /reader/billing/refund`). Put it on the Figma billing surface if Q-009 = A.

### E-007 — Keep reset-password route

Figma omitted it; Phase 4 audit admitted deep link was out of design scope. Keep `/(public)/reset-password`.

### E-008 — Search production file is p4 Enhanced Search

Use field selector + submit. Treat p3 recents as Q-011, not silent scope.

---



## 16. Potential Prototype / Uncertain Items


| Item                   | Why it might be prototype-only | Why it might be real        | Evidence                     | Decision                                               |
| ---------------------- | ------------------------------ | --------------------------- | ---------------------------- | ------------------------------------------------------ |
| Name “Aisha Rahimah”   | Sample persona                 | Greeting needs a first name | Home vs Phase 4 email note   | Q-007                                                  |
| RM 99 / RM 12 / 31%    | Round marketing numbers        | Real SKU                    | No annual in DB              | Q-014b                                                 |
| Dates 15 Feb 2027      | Demo                           | Need live period end        | Subscription API has dates   | Use API                                                |
| Cover strip books      | Decor                          | Brand                       | Auth is public               | Q-006                                                  |
| See all → Collections  | Wrong object type              | Designer intent             | `onAction` in HomeScreen     | Q-008                                                  |
| Max 3 downloads        | Common demo cap                | Storage policy              | No backend cap               | Q-015b                                                 |
| Reactivate copy        | Stripe-ish                     | Real billing                | No endpoint                  | Q-014                                                  |
| Sign in on book detail | Copy-paste state               | Multi-account               | User is authed               | E-003                                                  |
| Search recents         | p3 leftover                    | Retention                   | p4 audit says not designed   | Q-011                                                  |
| Language English       | i18n stub                      | Real setting                | Removed in p4 Settings       | Q-021b                                                 |
| 0% trial progress bar  | Looks unfinished               | Day-elapsed bar             | Width hardcoded `0%`         | Implement with real trial window if Subscription ships |
| Payment failure        | Not in SubState                | Needed in production        | Mobile has checkout messages | Keep app behavior                                      |
| Fake 9:41 status bar   | Device frame                   | —                           | Ignore                       | Ignore                                                 |


---



## 17. Existing Product Features Not Represented in Figma

Do **not** remove automatically.


| Feature                             | Where                                | Why it exists                     | Still required?        | Figma update?          |
| ----------------------------------- | ------------------------------------ | --------------------------------- | ---------------------- | ---------------------- |
| Admin/author web dashboard          | `frontend/`                          | Publishing, users, revenue, audit | Yes                    | Separate design file   |
| Reset password                      | Mobile + `POST /auth/reset-password` | MG-12                             | Yes                    | Add to Figma later     |
| Refund                              | Me + `POST /reader/billing/refund`   | Monetization                      | Yes unless owner drops | Add to Subscription/Me |
| Role on Me                          | Mobile                               | F-ACC-1                           | Yes                    | Add “Reader” from API  |
| Newest/Popular sort                 | Home                                 | Catalog                           | Yes                    | Add to Home Figma      |
| Infinite paging                     | Catalog/search                       | MG-10                             | Yes                    | Figma shows 6 books    |
| Checkout return messages            | Me                                   | S-18                              | Yes                    | Out of Figma           |
| Reset reading defaults              | Settings                             | Support                           | Yes                    | Optional Figma         |
| Notifications-not-available note    | Settings                             | Honesty                           | Yes                    | Optional               |
| Offline connectivity banner         | My Books / book detail               | S-07                              | Yes                    | Add to Figma           |
| Collection/book invalid-link states | Mobile                               | S-11/S-12                         | Yes                    | Figma happy-path only  |
| In-book search API                  | Backend                              | Planned reader                    | Keep API               | Figma has no overlay   |
| Publisher enable                    | `POST /user/publisher`               | Author onboarding                 | Yes                    | Not in reader Figma    |
| Reading intelligence / heatmaps     | Backend + author web                 | Revenue                           | Yes                    | Not in reader Figma    |
| Push notifications                  | Spec deferred                        | —                                 | Not in Figma           | Do not invent          |
| `Alert.alert` purge fallback        | Mobile helper                        | Legacy                            | Cleanup later          | N/A                    |


---



## 18. Implementation Tasks

Blocked tasks list their `Open questions`. Do not start P0 billing/legal without answers.

---



### FIGMA-001 — Privacy Policy entry points

**Title:** Add Privacy Policy navigation from Me and Settings  
**Source:** `p4/EnhancedMe.tsx`, `p4/SettingsScreen.tsx`  
**Current state:** No row, no URL.  
**Target state:** Figma rows; destination per Q-001.  
**Scope:** Admin-editable external URL; mobile Me + Settings open it.  
**Backend:** Platform setting `privacy_policy_url` (admin GET/PATCH, reader GET).  
**Web:** Admin settings form to set the URL.  
**Mobile:** Me + Settings rows; `Linking.openURL`.  
**Dependencies:** Q-001 answered (A).  
**Open questions:** None.  
**Acceptance criteria:**  

- Given a configured destination, tapping Privacy Policy from Me and Settings opens it.  
- Given Q-001 = C, rows are absent.  
**Verification:** Manual Me/Settings; no invented URL in tests.

---



### FIGMA-002 — Terms of Service entry

**Title:** Add Terms of Service from Settings (and Sign up if Q-004)  
**Source:** `p4/SettingsScreen.tsx`, `p4/AuthScreens.tsx` Sign up  
**Current state:** None.  
**Target state:** Figma Settings row + sign-up links.  
**Backend:** Optional `TERMS_OF_SERVICE_URL`.  
**Web:** Same as FIGMA-001.  
**Mobile:** Settings + register footer.  
**Dependencies:** Q-002, Q-004  
**Open questions:** Q-002 Q-004  
**Acceptance criteria:** Terms row matches Figma; sign-up links work if required.  
**Verification:** Settings + register screens.

---



### FIGMA-003 — About My Hikayat

**Title:** About My Hikayat screen or expanded About  
**Source:** Enhanced Me “About My Hikayat”  
**Current state:** Version on Settings only.  
**Target state:** Reachable About per Q-003, including version.  
**Backend:** None unless CMS.  
**Web:** None unless shared content.  
**Mobile:** New route `/(app)/about` or Settings section.  
**Dependencies:** Q-003  
**Open questions:** Q-003  
**Acceptance criteria:** Me row opens About; version visible.  
**Verification:** Navigate Me → About → back.

---



### FIGMA-004 — Sign-up legal copy

**Title:** Sign-up Terms/Privacy sentence  
**Source:** SignUpScreen footer  
**Current state:** No legal sentence.  
**Target state:** Figma sentence; links per Q-004.  
**Backend:** No backend changes unless acceptance is stored (Q-004 = B).  
**Web:** Do not copy onto dashboard register unless owner asks.  
**Mobile:** `register-form.tsx`  
**Dependencies:** FIGMA-001, FIGMA-002  
**Open questions:** Q-004  
**Acceptance criteria:** Copy visible; links open destinations; register still succeeds.  
**Verification:** Register screen + one successful register.

---



### FIGMA-005 — Sign-up success interstitial

**Title:** Optional account-created interstitial  
**Source:** SignUpState `success`  
**Current state:** Immediate tabs.  
**Target state:** Per Q-005.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** Optional screen before tab redirect.  
**Dependencies:** Q-005  
**Open questions:** Q-005  
**Acceptance criteria:** If A, success UI then Home; if B, no extra screen.  
**Verification:** New account flow.

---



### FIGMA-006 — Forgot-password sent card

**Title:** Match Figma sent + Resend layout  
**Source:** ForgotPasswordScreen `sent`  
**Current state:** Ack text on the same form.  
**Target state:** Success card + Resend.  
**Backend:** No backend changes (`forgot-password` already idempotent).  
**Web:** None.  
**Mobile:** `forgot-password-screen.tsx`  
**Dependencies:** None  
**Open questions:** None  
**Acceptance criteria:** After success, Figma sent UI; Resend calls the same API.  
**Verification:** Request reset twice.

---



### FIGMA-007 — Auth cover strip

**Title:** Auth cover decoration  
**Source:** `CoverStrip`  
**Current state:** Color blocks.  
**Target state:** Per Q-006.  
**Backend:** Public covers would be a **new** unauthenticated endpoint — only if A.  
**Web:** None.  
**Mobile:** `auth-screen-chrome.tsx`  
**Dependencies:** Q-006  
**Open questions:** Q-006  
**Acceptance criteria:** Decorative; hidden from a11y.  
**Verification:** Sign in/up screens.

---



### FIGMA-008 — Session restore copy/sheet

**Title:** Align restore-failed warning with Figma  
**Source:** SessionRestoreFailedScreen  
**Current state:** Confirm sheet only with downloads.  
**Target state:** Per Q-022 (always vs skip).  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** `session-restore-screen.tsx`  
**Dependencies:** Q-022  
**Open questions:** Q-022  
**Acceptance criteria:** Retry and Sign in again both work; downloads purged on abandon.  
**Verification:** Airplane mode restore; with and without downloads.

---



### FIGMA-009 — Home greeting

**Title:** Home greeting per identity decision  
**Source:** HomeScreen header  
**Current state:** Hello + email.  
**Target state:** Figma time-of-day + chosen identity (Q-007).  
**Backend:** `displayName` only if Q-007 = C.  
**Web:** Admin display only if C.  
**Mobile:** `home-screen.tsx`  
**Dependencies:** Q-007  
**Open questions:** Q-007  
**Acceptance criteria:** No fake “Aisha” unless it is the real profile name.  
**Verification:** Morning/afternoon/evening if time-of-day chosen.

---



### FIGMA-010 — Home search icon

**Title:** Icon search affordance  
**Source:** Home header search button  
**Current state:** Pill “Search books”.  
**Target state:** Icon; still opens `/(app)/search`; a11y label preserved.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** `home-screen.tsx`  
**Dependencies:** None  
**Open questions:** None  
**Acceptance criteria:** `home-search-button` still works.  
**Verification:** Home → Search.

---



### FIGMA-011 — Home New + Browse layout

**Title:** Home catalog sections  
**Source:** HomeScreen New + Browse  
**Current state:** One grid.  
**Target state:** Per Q-008.  
**Backend:** Existing list/filter/sort.  
**Web:** None.  
**Mobile:** `catalog-book-list.tsx`, `home-screen.tsx`  
**Dependencies:** Q-008  
**Open questions:** Q-008  
**Acceptance criteria:** Real categories; infinite paging retained unless owner drops it.  
**Verification:** Newest, Popular, category, pull-to-refresh.

---



### FIGMA-012 — Home collections empty/error

**Title:** Home collections rail states  
**Source:** Home collections (Figma always populated; Home has loading/error pattern)  
**Current state:** Hide on empty/error.  
**Target state:** Visible empty or retry.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** `HomeCollectionsShelf`  
**Dependencies:** None  
**Open questions:** None  
**Acceptance criteria:** Loading skeleton; empty copy; error retry; populated rail.  
**Verification:** Mock empty/error.

---



### FIGMA-013 — Home billing CTA destinations

**Title:** Trial/expiry CTAs target  
**Source:** TrialBanner, ExpiryBanner  
**Current state:** Me.  
**Target state:** Subscription if Q-009 = A, else Me.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** `home-trial-discovery-card.tsx`, expiry banner  
**Dependencies:** Q-009, FIGMA-020  
**Open questions:** Q-009  
**Acceptance criteria:** CTA never auto-starts trial.  
**Verification:** Eligible, active trial, expiring.

---



### FIGMA-014 — Search idle category pills

**Title:** Search idle category chips  
**Source:** EnhancedSearch idle  
**Current state:** Hint only.  
**Target state:** Per Q-010.  
**Backend:** Category list exists; search-by-category does **not**.  
**Web:** None.  
**Mobile:** `catalog-search-screen.tsx`  
**Dependencies:** Q-010  
**Open questions:** Q-010  
**Acceptance criteria:** If implemented, chips are labeled and do not call fake local filters.  
**Verification:** Idle Search.

---



### FIGMA-015 — Collection description + accent (full stack)

**Title:** Editorial collection metadata  
**Source:** CollectionsScreen, CollectionDetailScreen, `p3/data.ts`  
**Current state:** Title + books.  
**Target state:** Description + accent hero if Q-012 = A.  
**Backend:** Prisma `Collection.description`, `accentColor`; create/update DTOs; reader `CollectionDiscoveryResponse`; migration.  
**Web:** Admin collection create/edit.  
**Mobile:** List card + detail hero.  
**Dependencies:** Q-012  
**Open questions:** Q-012  
**Acceptance criteria:** Admin can set fields; reader APIs return them; mobile renders; unpublished books still excluded from count.  
**Verification:** Admin update → mobile list/detail.

---



### FIGMA-016 — Book detail Figma access layouts

**Title:** Restyle book-detail access section  
**Source:** BookDetailScreen `AccessSection`  
**Current state:** Generic CTA + notices.  
**Target state:** State layouts for free, trial-eligible, trial, subscriber, canceled, expired, downloaded — extra CTAs per Q-013.  
**Backend:** Use `readingAccessState` / `trialEligible` only.  
**Web:** None.  
**Mobile:** `book-detail-screen.tsx`  
**Dependencies:** Q-009 Q-013 Q-014 Q-015  
**Open questions:** those  
**Acceptance criteria:** No client-invented entitlement; download visibility per Q-015.  
**Verification:** Each access state with test fixtures.

---



### FIGMA-017 — Book detail progress bar

**Title:** Show resume progress bar  
**Source:** Book detail progress block  
**Current state:** Sentence only.  
**Target state:** Label + percent bar from real progress.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** Book detail + continue-reading fraction if available.  
**Dependencies:** E-002  
**Open questions:** None  
**Acceptance criteria:** No fake 100%; hidden when no progress.  
**Verification:** Book with and without progress.

---



### FIGMA-018 — Me App group (Settings + My Books count)

**Title:** Figma Me App section  
**Source:** EnhancedMe App group  
**Current state:** Settings + Sign out only.  
**Target state:** Settings + My Books with download count.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** `profile-screen.tsx`  
**Dependencies:** None  
**Open questions:** None  
**Acceptance criteria:** Count matches My Books; row opens library tab.  
**Verification:** 0 and N downloads.

---



### FIGMA-019 — Me loading and error

**Title:** Me full-tab loading/error  
**Source:** EnhancedMe loading/error  
**Current state:** Billing skeletons only.  
**Target state:** Figma skeleton/error with Try again.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** Profile + billing error aggregation  
**Dependencies:** None  
**Open questions:** None  
**Acceptance criteria:** Retry refetches billing; session 401 still signs out.  
**Verification:** Force billing failure.

---



### FIGMA-020 — Dedicated Subscription screen

**Title:** Implement Figma My Subscription route  
**Source:** `p3/SubscriptionScreen.tsx`  
**Current state:** Billing on Me.  
**Target state:** Per Q-009.  
**Backend:** Existing billing APIs; annual/reactivate only if Q-014/Q-014b.  
**Web:** None for reader screen.  
**Mobile:** New `/(app)/subscription`; Me/Home/Book navigate here.  
**Dependencies:** Q-009 Q-014 Q-014b Q-015b  
**Open questions:** those  
**Acceptance criteria:** States free/trial/active/canceled/expired from **API**, not RM fixtures; cancel sheet; checkout; trial; refund remains reachable (E-006).  
**Verification:** Each subscription fixture + Stripe test mode.

---



### FIGMA-021 — Settings Figma controls

**Title:** Settings reading defaults chrome  
**Source:** `p4/SettingsScreen.tsx`  
**Current state:** Increment controls.  
**Target state:** Per Q-016.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** `settings-screen.tsx` + shared reader settings  
**Dependencies:** Q-016, FIGMA-028  
**Open questions:** Q-016  
**Acceptance criteria:** Values persist and apply in reflowable reader; reset defaults still works (E-004).  
**Verification:** Change in Settings, open book; change in reader, return to Settings.

---



### FIGMA-022 — Settings legal rows

**Title:** Settings About Terms + Privacy  
**Source:** Settings About card  
**Current state:** Version + notifications note.  
**Target state:** Version + Terms + Privacy per Q-001/Q-002.  
**Backend:** Config URLs.  
**Web:** Optional.  
**Mobile:** Settings card  
**Dependencies:** FIGMA-001 FIGMA-002  
**Open questions:** Q-001 Q-002  
**Acceptance criteria:** App version remains real Expo version.  
**Verification:** Settings screen.

---



### FIGMA-023 — My Books downloading row

**Title:** In-list download progress  
**Source:** EnhancedMyBooks `DownloadingBook`  
**Current state:** Progress on book detail.  
**Target state:** In-progress row on My Books with %.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** `library-screen.tsx` + offline actions store  
**Dependencies:** None  
**Open questions:** None  
**Acceptance criteria:** Starting download on detail appears on My Books; completion moves to leased row.  
**Verification:** Download a book while on My Books.

---



### FIGMA-024 — My Books cover/author cache

**Title:** Offline row metadata  
**Source:** EnhancedMyBooks `BookRow`  
**Current state:** Placeholder cover; no author.  
**Target state:** Per Q-017.  
**Backend:** If A, include `authorName` + cover snapshot in offline package/manifest.  
**Web:** None.  
**Mobile:** Manifest type + row UI  
**Dependencies:** Q-017  
**Open questions:** Q-017  
**Acceptance criteria:** Offline, no invented author; if uncached, placeholder.  
**Verification:** Download, airplane mode, My Books.

---



### FIGMA-025 — Locked download chrome

**Title:** Hide Read when locked / clock tamper  
**Source:** BookRow `isLocked`  
**Current state:** Open always.  
**Target state:** Per Q-018.  
**Backend:** No backend changes (open still fail-closed).  
**Web:** None.  
**Mobile:** `offline-library-book-row.tsx`  
**Dependencies:** Q-018  
**Open questions:** Q-018  
**Acceptance criteria:** Lease chip still visible; Remove still available.  
**Verification:** Expired lease fixture; clock flag.

---



### FIGMA-026 — Device clock tamper screen

**Title:** Reconnect-to-unlock screen  
**Source:** `DeviceClockTamperScreen`  
**Current state:** Banner + mapped reader error.  
**Target state:** Per Q-019.  
**Backend:** No new endpoint; reuse lease/clock detection.  
**Web:** None.  
**Mobile:** Full screen or modal; reader CTA copy  
**Dependencies:** Q-019  
**Open questions:** Q-019  
**Acceptance criteria:** CTA retries connectivity/open, not subscribe, when cause is clock.  
**Verification:** Force clock rollback flag.

---



### FIGMA-027 — Sign-out sheet always

**Title:** Sign-out sheet including zero-download copy  
**Source:** SignOutSheet  
**Current state:** Skip when empty.  
**Target state:** Per Q-022.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** `profile-screen.tsx`  
**Dependencies:** Q-022  
**Open questions:** Q-022  
**Acceptance criteria:** Destructive purge still only when downloads exist.  
**Verification:** Sign out with 0 and N packages.

---



### FIGMA-028 — Reader settings presets

**Title:** Reader settings match Settings  
**Source:** ReflowableReader settings panel  
**Current state:** Increment controls in BottomSheet.  
**Target state:** Same language as FIGMA-021.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** `reflowable-reader-engine.tsx` settings sheet  
**Dependencies:** Q-016 FIGMA-021  
**Open questions:** Q-016  
**Acceptance criteria:** Shared persistence key unchanged.  
**Verification:** Reader + Settings round-trip.

---



### FIGMA-029 — Reader chrome bookmark + tap

**Title:** Reader chrome interactions  
**Source:** ReflowableReader chrome; BookmarksPanel  
**Current state:** Panel; no HTML tap toggle.  
**Target state:** Per Q-020 and E-005.  
**Backend:** Existing bookmark APIs.  
**Web:** None.  
**Mobile:** Reader chrome  
**Dependencies:** Q-020 E-005  
**Open questions:** Q-020  
**Acceptance criteria:** Add/jump/remove still work; empty panel copy.  
**Verification:** Reflowable and fixed-layout books.

---



### FIGMA-030 — Annual plan support

**Title:** Annual plan if commercially real  
**Source:** Subscription PlanCard annual  
**Current state:** `monthly_paid` only.  
**Target state:** Per Q-014b.  
**Backend:** `PlanInterval`/`PlanKind`, Stripe price, `listPaidCatalogPlans`, migration.  
**Web:** Admin plan create/edit.  
**Mobile:** Plan picker shows API plans, never hardcoded RM.  
**Dependencies:** Q-014b  
**Open questions:** Q-014b  
**Acceptance criteria:** Display uses `amountCents` + `currency`.  
**Verification:** Admin creates annual; mobile checkout.

---



### FIGMA-031 — Reactivate API or mapping

**Title:** Canceled-plan reactivate  
**Source:** Subscription canceled + book detail  
**Current state:** Checkout only.  
**Target state:** Per Q-014.  
**Backend:** New service method **or** document mapping to checkout.  
**Web:** Admin may show status only.  
**Mobile:** CTA label + action.  
**Dependencies:** Q-014 FIGMA-020  
**Open questions:** Q-014  
**Acceptance criteria:** Access remains until period end after cancel (already true).  
**Verification:** Cancel then reactivate/checkout.

---



### FIGMA-032 — Download cap of 3

**Title:** Enforce or remove max-3 marketing  
**Source:** Subscription feature list  
**Current state:** No cap.  
**Target state:** Per Q-015b.  
**Backend:** If A, authorize download with count + error code.  
**Web:** None.  
**Mobile:** Error copy on 4th download; bullet on billing.  
**Dependencies:** Q-015b  
**Open questions:** Q-015b  
**Acceptance criteria:** If C, bullet absent; if A, 4th download fails clearly.  
**Verification:** Three downloads then fourth.

---



### FIGMA-033 — Display name API

**Title:** User display name  
**Source:** Home/Me persona  
**Current state:** Email only.  
**Target state:** Per Q-007 = C.  
**Backend:** Prisma field, register/update DTO, `UserResponse`.  
**Web:** Optional admin display.  
**Mobile:** Register field + greeting/Me.  
**Dependencies:** Q-007  
**Open questions:** Q-007  
**Acceptance criteria:** No required name unless owner says required; email remains unique login.  
**Verification:** Register + Home.

---



### FIGMA-034 — Fraunces + Nunito

**Title:** Load Figma fonts  
**Source:** Phase 6 handoff  
**Current state:** System.  
**Target state:** Per Q-021c.  
**Backend:** No backend changes.  
**Web:** Do not change dashboard fonts unless Q-021d = B.  
**Mobile:** Expo font load; theme typography.  
**Dependencies:** Q-021c  
**Open questions:** Q-021c  
**Acceptance criteria:** Fallback if font fails.  
**Verification:** Titles italic; body.

---



### FIGMA-035 — Tab label “My Books”

**Title:** Match Figma tab capitalization  
**Source:** TabBar  
**Current state:** “My books”.  
**Target state:** “My Books”.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** tabs `_layout.tsx`  
**Dependencies:** None  
**Open questions:** None  
**Acceptance criteria:** testIDs unchanged.  
**Verification:** Tab bar.

---



### FIGMA-036 — Version footer on Me

**Title:** Me footer version  
**Source:** EnhancedMe footer  
**Current state:** Settings only.  
**Target state:** Footer on Me.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** `profile-screen.tsx`  
**Dependencies:** None  
**Open questions:** None  
**Acceptance criteria:** Same version as Settings.  
**Verification:** Me scroll end.

---



### FIGMA-037 — Book download confirm already exists

**Title:** Confirm Remove download matches Figma  
**Source:** RemoveDownloadSheet  
**Current state:** BottomSheet on library + detail.  
**Target state:** Copy “Keep it” / italic title if not already matching.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** `remove-offline-download-sheet.tsx`  
**Dependencies:** None  
**Open questions:** None  
**Acceptance criteria:** Confirm removes; cancel keeps.  
**Verification:** Remove from both entry points.

---



### FIGMA-038 — Cancel subscription sheet copy

**Title:** Cancel sheet matches Figma access-until copy  
**Source:** CancelSubSheet  
**Current state:** BottomSheet on billing card.  
**Target state:** Access-until from `currentPeriodEnd`.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** `subscription-status-card.tsx`  
**Dependencies:** FIGMA-020 if moved  
**Open questions:** None  
**Acceptance criteria:** Cancel calls `POST /reader/billing/cancel`; reading continues until period end.  
**Verification:** Paid user cancel.

---



### FIGMA-039 — Refund on Figma billing surface

**Title:** Keep refund visible after Subscription IA change  
**Source:** Not in Figma; current Me  
**Current state:** Request refund + confirm.  
**Target state:** Still reachable on Me and/or Subscription.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** Billing UI  
**Dependencies:** Q-009 E-006  
**Open questions:** None (unless owner kills refunds)  
**Acceptance criteria:** Eligible paid user can refund; ineligible cannot.  
**Verification:** Within 7-day window fixture.

---



### FIGMA-040 — Reset password visual parity

**Title:** Reset password Direction B (already routed)  
**Source:** Not in Figma; keep screen  
**Current state:** TextField form.  
**Target state:** Same chrome family as Forgot.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** `reset-password-screen.tsx`  
**Dependencies:** E-007  
**Open questions:** None  
**Acceptance criteria:** Token + password; success message.  
**Verification:** Deep link + paste token.

---



### FIGMA-041 — Search result row chrome

**Title:** Search rows match Figma (cover, title, author, publisher, chevron)  
**Source:** EnhancedSearch `SearchResultRow`  
**Current state:** `BookCard` row variant.  
**Target state:** Visual match; same navigation.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** Search list  
**Dependencies:** None  
**Open questions:** None  
**Acceptance criteria:** Empty author/publisher omitted; paging works.  
**Verification:** Search each field.

---



### FIGMA-042 — Collection list as stack with Figma header

**Title:** Collections header copy and mosaic cards  
**Source:** CollectionsScreen  
**Current state:** “Editorial shelves picked for readers.”  
**Target state:** Figma title/subtitle; mosaic already exists.  
**Backend:** Description only if FIGMA-015.  
**Web:** None.  
**Mobile:** `collections-screen.tsx`  
**Dependencies:** E-001 FIGMA-015  
**Open questions:** Q-012  
**Acceptance criteria:** Back works; tabs not duplicated.  
**Verification:** Home → All collections.

---



### FIGMA-043 — Language setting (optional)

**Title:** Language row  
**Source:** p3 Me  
**Current state:** None.  
**Target state:** Per Q-021b.  
**Backend:** Only if account-level locale.  
**Web:** None.  
**Mobile:** Me or Settings  
**Dependencies:** Q-021b  
**Open questions:** Q-021b  
**Acceptance criteria:** If B, no row.  
**Verification:** N/A if deferred.

---



### FIGMA-044 — Zoom step policy

**Title:** Fixed-layout zoom  
**Source:** FixedLayoutReader  
**Current state:** 1×–3× / 0.25.  
**Target state:** Per Q-021.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** `fixed-layout-reader-engine.tsx`  
**Dependencies:** Q-021  
**Open questions:** Q-021  
**Acceptance criteria:** Pinch remains disabled unless a later program.  
**Verification:** Zoom in/out bounds.

---



### FIGMA-045 — Admin collection fields UI

**Title:** Web forms for collection description/accent  
**Source:** Figma collection metadata (admin not designed)  
**Current state:** Title + membership only.  
**Target state:** Fields if Q-012 = A.  
**Backend:** FIGMA-015.  
**Web:** `admin-collections` create/edit.  
**Mobile:** Consumer only.  
**Dependencies:** FIGMA-015 Q-012  
**Open questions:** Q-012  
**Acceptance criteria:** Validation; hex color; empty description allowed or not per owner.  
**Verification:** Admin CRUD.

---



### FIGMA-046 — Config module for legal URLs

**Title:** Backend config for Privacy/Terms  
**Source:** Unwired Figma rows  
**Current state:** None.  
**Target state:** Reader-accessible URLs if Q-001/Q-002 = A.  
**Backend:** Config service + optional `GET /reader/app-config` or bake into mobile env.  
**Web:** Optional admin settings.  
**Mobile:** Consume config or env.  
**Dependencies:** Q-001 Q-002  
**Open questions:** Q-001 Q-002  
**Acceptance criteria:** No fake URLs in repo.  
**Verification:** Staging env.

---



### FIGMA-047 — Home expiry/trial visual match

**Title:** Restyle Home trial/expiry banners to Figma  
**Source:** TrialBanner, ActiveTrialBadge, ExpiryBanner  
**Current state:** Direction B-ish but not identical.  
**Target state:** Gradient trial CTA; success badge; warning + Subscribe.  
**Backend:** No backend changes.  
**Web:** None.  
**Mobile:** billing home components  
**Dependencies:** FIGMA-013  
**Open questions:** Q-009  
**Acceptance criteria:** Copy from API remaining time, not “3 days” fixture.  
**Verification:** Fixtures.

---



### FIGMA-048 — Visual parity pass

**Title:** Final Direction B pass after IA lands  
**Source:** Phase 6 tokens + all screens  
**Current state:** 8.1–8.10 restyle.  
**Target state:** Remaining spacing/icon/sheet polish once P0/P1 IA exists.  
**Backend:** No backend changes.  
**Web:** None (Q-021d = A).  
**Mobile:** primitives as needed; **do not duplicate** Phase 8.2 components.  
**Dependencies:** P0/P1 tasks  
**Open questions:** Q-021c  
**Acceptance criteria:** No new parallel button/sheet systems.  
**Verification:** Walkthrough of all tabs.

---



## 19. Dependencies

```text
Q-001/002/003/004  → FIGMA-001,002,003,004,022,046
Q-007              → FIGMA-009,033
Q-008              → FIGMA-011,012
Q-009              → FIGMA-013,016,020,039
Q-012              → FIGMA-015,042,045
Q-014/014b         → FIGMA-020,030,031
Q-015/015b         → FIGMA-016,032
Q-016              → FIGMA-021,028
Q-017              → FIGMA-024
Q-018/019          → FIGMA-025,026
Q-021c             → FIGMA-034,048
FIGMA-015          → FIGMA-045
FIGMA-020          → FIGMA-013,016
FIGMA-021          → FIGMA-028
```

No task should invent Stripe prices, legal URLs, or display names without the matching question.

---



## 20. Prioritized Roadmap

Phases follow **decisions → data → IA → polish**. They are not the old 8.x visual-only series.

### Phase 9.0 — Owner decisions (blocking)

Answer Q-001–Q-022 (at least all P0 questions: legal, subscription IA, pricing, download cap, display name).

### Phase 9.1 — Content & configuration

FIGMA-001, 002, 003, 004, 022, 046 (legal/about).

### Phase 9.2 — Cross-platform data (only approved fields)

FIGMA-015, 030, 031, 032, 033, 045, 024 (collection fields, plans, reactivate, cap, display name, offline metadata).

### Phase 9.3 — Account IA

FIGMA-018, 019, 027, 036, 020, 039, 038 (Me + Subscription if approved).

### Phase 9.4 — Settings + reader controls

FIGMA-021, 028, 029, 034.

### Phase 9.5 — Home + Search + Collections UI

FIGMA-009–014, 041, 042, 047.

### Phase 9.6 — Book detail + My Books

FIGMA-016, 017, 023, 025, 026, 037.

### Phase 9.7 — Auth polish

FIGMA-006, 007, 008, 005, 040.

### Phase 9.8 — Final parity

FIGMA-010, 035, 044, 043, 048.

Do not start 9.2 backend work until 9.0 answers exist.

---



## 21. Final Reconciliation / Completeness Check



### Figma inventory → gaps/tasks


| Figma surface            | Represented in §3 | Gap IDs         | Tasks                   |
| ------------------------ | ----------------- | --------------- | ----------------------- |
| Splash                   | Yes               | visual only     | 048                     |
| Session restore          | Yes               | G-008           | 008                     |
| Sign in                  | Yes               | G-007           | 007                     |
| Sign up                  | Yes               | G-004 G-005     | 004 005                 |
| Forgot                   | Yes               | G-006           | 006                     |
| Reset (missing in Figma) | §17               | —               | 040                     |
| Home                     | Yes               | G-009–014 G-047 | 009–013 047             |
| Search p4                | Yes               | G-015 G-041     | 014 041                 |
| Search p3 recents        | Yes               | G-016           | Q-011                   |
| Collections              | Yes               | G-017–019       | 015 042 045             |
| Book detail              | Yes               | G-020–024       | 016 017                 |
| My Books                 | Yes               | G-033–035       | 023–025                 |
| Me                       | Yes               | G-025–029       | 001 003 018 019 027 036 |
| Settings                 | Yes               | G-030–032       | 021 022                 |
| Subscription             | Yes               | G-041–045       | 020 030–032 039         |
| Readers                  | Yes               | G-037–040       | 028 029 044             |
| Sheets                   | Yes               | G-027 G-036     | 027 037 038             |
| Clock screen             | Yes               | G-036           | 026                     |
| About/Privacy/Terms      | Yes               | G-001–003       | 001–003                 |
| Language p3              | Yes               | G-046           | 043                     |
| Fonts Phase 6            | Yes               | G-047           | 034                     |
| Tab bar                  | Yes               | G-048           | 035                     |




### Implementation-only features → §17

Dashboard, refund, reset password, role, sort, paging, checkout return, in-book search API, publisher enable, intelligence/heatmaps, offline banners, invalid-link states — all listed. None scheduled for deletion.

### Second pass notes

- Figma **payment failure** is not a designed SubState; mobile checkout messages stay (§17).
- Figma **onboarding** is explicitly undesigned (Phase 4 audit); no task to invent it.
- Figma **in-reader search** is absent; backend search-in-book stays unused on mobile until designed.
- Web dashboard is out of visual scope (Q-021d).

---



## Audit Completeness Checklist

```md
- [x] Every Figma screen inspected
- [x] Every Figma state inspected
- [x] Every Figma component inspected (production p3/p4 + sheets)
- [x] Every Figma interaction inspected
- [x] Every navigation path inspected
- [x] Every CTA inspected
- [x] Every sheet/modal inspected
- [x] Every loading state inspected
- [x] Every empty state inspected
- [x] Every error state inspected
- [x] Every success state inspected
- [x] Backend inspected
- [x] Web inspected
- [x] Mobile inspected
- [x] API contracts inspected
- [x] Database/data models inspected
- [x] Current app-only features inspected
- [x] Missing data identified
- [x] Business questions identified
- [x] Options provided for every unresolved question
- [x] Every actionable gap converted into a task
- [x] Every task has acceptance criteria
- [x] Final Figma ↔ implementation reconciliation completed
```

**Audit complete. No implementation changes were made.**