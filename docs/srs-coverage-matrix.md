# Part 1 backend SRS coverage matrix

This matrix validates the Part 1 NestJS backend against `docs/SRS.md`.

**Scope:** Part 1 backend only. Reader UI, author/admin dashboards, the mobile app, Part 2 (ElevenLabs TTS), and Part 3 (formatting) are out of scope. Those rows are **Not Required** for this phase.

**Status values**

| Status | Meaning |
| --- | --- |
| Complete | Implemented in the backend and covered by unit and/or e2e tests |
| In Progress | A Part 1 backend requirement that is missing or only partly implemented |
| Future | SRS requirement still present; out of scope for current Part 1 until a documented decision is resolved. Tracked in `docs/FUTURE.md` |
| Blocked | Cannot finish because of an external dependency |
| Not Required | Client UI, Part 2, Part 3, or a client-only runtime rule |

Do not treat a row as Complete unless both the backend behavior and tests exist.

**Validation snapshot:** 351 unit spec files, 52 e2e suites, including `test/critical-flow.e2e-spec.ts`. Snapshot after Steps 1–8 and the reflowable page-tracking decision.

## Summary

| Status | Count |
| --- | ---: |
| Complete | 64 |
| In Progress | 0 |
| Future | 2 |
| Blocked | 0 |
| Not Required | 15 |
| **Total** | **81** |

## Future / out of scope for current Part 1

Tracked in `docs/FUTURE.md`. The SRS requirements remain in `docs/SRS.md`.

| SRS Requirement | Status | Reason |
| --- | --- | --- |
| §5.1 Reflowable time per page | Future / out of scope for current Part 1 | No stable server-side page definition exists for reflowable content. |
| §5.1 Reading speed (pages/minute) | Future / out of scope for current Part 1 | No stable server-side page definition exists for reflowable content. |

## Matrix

| SRS Requirement | Backend | Tests | Status |
| --- | --- | --- | --- |
| §1 Secure online reading contracts (catalog, progress, sessions, encrypted grants) | `reader/catalog`, `reader/books/:id/progress`, sessions, `delivery-grant` | `reader-catalog.e2e-spec.ts`, `reading-progress.e2e-spec.ts`, `reading-intelligence.e2e-spec.ts`, `reader-book-asset.e2e-spec.ts`, `critical-flow.e2e-spec.ts` | Complete |
| §1 Offline reader UI / device runtime | Client decrypts and renders offline | — | Not Required |
| §1 Advanced reading-intelligence tracking | Session ingest of active vs idle; chapter engagement for reflowable; visual engagement for fixed-layout | `reading-intelligence.e2e-spec.ts`, `reading-chapter-engagement.e2e-spec.ts`, `reading-visual-engagement.e2e-spec.ts` | Complete |
| §1 Subscription-based access | Free + monthly paid plans, Stripe checkout/webhooks, period-end entitlement | `subscription.e2e-spec.ts`, `subscription-billing.e2e-spec.ts`, `entitlement.e2e-spec.ts` | Complete |
| §1 Author monetization from reading time | Revenue periods, weighted engagement, `BookRevenue` | `book-engagement.e2e-spec.ts`, `book-revenue.e2e-spec.ts`, `author-monetization.e2e-spec.ts` | Complete |
| §1 AES content protection | Encryption provider; source uploads stored encrypted; reader grant does not decrypt | `book-source.e2e-spec.ts`, `reader-book-asset.e2e-spec.ts`, encryption provider specs | Complete |
| §1 Reflowable and fixed-layout domain models | `BookLayoutType`, chapters vs pages/spreads/text layers | `book-epub-layout.e2e-spec.ts`, `book-epub-chapters.e2e-spec.ts`, `book-epub-fixed-layout.e2e-spec.ts` | Complete |
| §1 Visual canvas reading experience | Reader viewport / artwork rendering | — | Not Required |
| §2.1 Create account / login | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | `auth.e2e-spec.ts` | Complete |
| §2.1 Subscribe (single monthly model) | `POST /reader/billing/checkout`, `POST /webhooks/stripe`, `GET /reader/billing/subscription` | `subscription-billing.e2e-spec.ts` | Complete |
| §2.1 Browse published books | `GET /reader/catalog`, `GET /reader/catalog/:id`; unpublished books are catalog 404 | `reader-catalog.e2e-spec.ts`, `admin-book.e2e-spec.ts` | Complete |
| §2.1 Read / download full books | Paid entitlement + `POST /reader/books/:id/delivery-grant` | `entitlement.e2e-spec.ts`, `reader-book-asset.e2e-spec.ts`, `critical-flow.e2e-spec.ts` | Complete |
| §2.1 Sync reading progress across devices | `GET /reader/sync`, `GET /reader/books/:id/sync` | `reading-sync.e2e-spec.ts` | Complete |
| §2.1 Customize reading experience (font, spacing, theme, zoom) | Client reader settings | — | Not Required |
| §2.2 Any user can become a publisher | `POST /user/publisher` | `reader-user.e2e-spec.ts` | Complete |
| §2.2 Upload books (PDF / EPUB) | `POST /author/books/:bookId/source` | `book-source.e2e-spec.ts`, `book-pdf-source-ingest.e2e-spec.ts` | Complete |
| §2.2 Author HTTP create / list / get / update book metadata | `POST/GET/PATCH /author/books`, `GET /author/books/:id`; owner from JWT; PATCH is metadata only | `author-book.e2e-spec.ts`, `book.author.controller.spec.ts` | Complete |
| §2.2 Book status lifecycle pending → in_review → approved / rejected | Publishing status machine; submit, approve, reject | `book-submit-for-review.e2e-spec.ts`, `book-admin-review.e2e-spec.ts` | Complete |
| §2.2 Author analytics and earnings APIs | `GET /author/analytics`, `GET /author/earnings`, trend, heatmap | `author-monetization.e2e-spec.ts` | Complete |
| §2.2 Author dashboard UI | — | — | Not Required |
| §2.3 Review then approve or reject books | `POST /admin/books/:id/approve`, `POST /admin/books/:id/reject` | `book-admin-review.e2e-spec.ts` | Complete |
| §2.3 Manage users | `GET/PATCH/DELETE /admin/users` | `admin-user.e2e-spec.ts` | Complete |
| §2.3 Manage subscriptions | `GET /admin/subscriptions`, `POST /admin/subscriptions/:id/cancel` | `admin-subscription.e2e-spec.ts` | Complete |
| §2.3 Admin book list, metadata edit, unpublish, republish, soft-delete | `GET /admin/books` lists all statuses by default, optional `publishingStatus`; `PATCH`; `POST .../unpublish`; `POST .../republish` sets `publishedAt` to now; `DELETE` soft-deletes | `admin-book.e2e-spec.ts` | Complete |
| §2.3 Admin category-weight HTTP | `GET /admin/categories`, `GET /admin/categories/:id`, `PATCH /admin/categories/:id` (`categoryWeight` > 0 only; no create/rename/delete HTTP) | `admin-category.e2e-spec.ts` | Complete |
| §2.3 Curated collections CRUD, membership, display order | `admin/collections` create, title edit, delete, add, remove, reorder | `admin-collection.e2e-spec.ts` | Complete |
| §2.3 Admin dashboard UI | — | — | Not Required |
| §2.4 Append-only admin audit log for required mutations | `GET /admin/audit-logs`; book publish/unpublish/delete, user/publisher, subscription cancel and payment_failed, collection mutations, revenue calculate | `admin-audit.e2e-spec.ts`, `admin-collection.e2e-spec.ts`, `admin-monetization.e2e-spec.ts`, `subscription-billing.e2e-spec.ts` | Complete |
| §3 Book metadata (title, description, owner, categories, dates, statuses, layout, type) | `Book` Prisma model and `BookResponse` | `book.service.spec.ts`, catalog/review e2e | Complete |
| §3 Catalog visibility (approved + processed + published timestamp); unpublish/republish/soft-delete | Catalog and full-book access require `publishedAt`; unpublish clears it and keeps `approved` | `admin-book.e2e-spec.ts`, `reader-catalog.e2e-spec.ts` | Complete |
| §3 Encrypted source file (PDF / EPUB) | Encrypted `BookAsset` kind `source` | `book-source.e2e-spec.ts`, `book-pdf-source-ingest.e2e-spec.ts` | Complete |
| §3 Preview images | `POST /author/books/:bookId/preview-image` | `book-catalog-media.e2e-spec.ts` | Complete |
| §3 Optional promo video | `POST /author/books/:bookId/promo-video` | `book-catalog-media.e2e-spec.ts` | Complete |
| §3 EPUB layout detection (reflowable vs fixed-layout) | Book-processing layout detection | `book-epub-layout.e2e-spec.ts` | Complete |
| §3 Dual reader-engine selection in the client | Client chooses engine from `layoutType` | — | Not Required |
| §3.1 Persist fixed-layout as locked visual structure (no reflow conversion) | Pages, spreads, dimensions, text layer | `book-epub-fixed-layout.e2e-spec.ts`, `book-epub-fixed-layout-text.e2e-spec.ts` | Complete |
| §4.1 Dual reader engine UI (fonts, margins, dark/light, zoom, pinch, magnifier, aspect-fit, letterboxing, RTL chrome) | Client viewport | — | Not Required |
| §4.1 Layout-discriminated reading position APIs | `ReadingProgress` reflowable vs spread/page | `reading-progress.e2e-spec.ts` | Complete |
| §4.2 Smart Resume reflowable (page / scroll offset / last session) | `PUT/GET /reader/books/:id/progress`; CORS allows PUT | `reading-smart-resume.e2e-spec.ts`, `http-surface.constant.spec.ts` | Complete |
| §4.2 Smart Resume fixed-layout (spread id / page number / last session) | Same progress APIs; no scroll offset for fixed-layout | `reading-smart-resume.e2e-spec.ts`, `reading-progress.e2e-spec.ts` | Complete |
| §5.1 Reflowable total reading time and session counts | Session active ms aggregated into `BookEngagement` | `book-engagement.e2e-spec.ts`, `reading-session.e2e-spec.ts` | Complete |
| §5.1 Reflowable idle-time detection | `idleDurationMs` on session ingest/end | `reading-intelligence.e2e-spec.ts` | Complete |
| §5.1 Reflowable time per chapter (active ms per spine index) | Chapter engagement piggybacks on session activity; payload spine or session fallback; unmatched spines allowed; session totals remain monetization source | `reading-chapter-engagement.e2e-spec.ts`, `reading-intelligence.service.spec.ts` | Complete |
| §5.1 Reflowable time per page | Out of scope for current Part 1. Reflowable unit is spine/chapter (`spineIndex` + `scrollOffset`); no server-side page definition. See `docs/FUTURE.md`. | — | Future |
| §5.1 Reading speed (pages/minute) | Out of scope for current Part 1. Pages/minute needs the same client pagination contract. See `docs/FUTURE.md`. | — | Future |
| §5.1 Fixed-layout time per page/spread, active spread time, visual scene time, idle | `ReadingVisualEngagement` + session idle | `reading-visual-engagement.e2e-spec.ts` | Complete |
| §5.2 Session tracking model (start/end, bookId, active vs idle, layout, layout-specific position) | `ReadingSession` | `reading-session.e2e-spec.ts`, `reading-intelligence.e2e-spec.ts` | Complete |
| §5.2 Reflowable chapter attribution from session activity | Recorded with the session; idle is not copied onto chapter rows | `reading-chapter-engagement.e2e-spec.ts` | Complete |
| §6 Single subscription, monthly Stripe, automatic renewal, free tier without a card | Plans, checkout, `customer.subscription.updated`, free plan | `subscription.e2e-spec.ts`, `subscription-billing.e2e-spec.ts` | Complete |
| §6.1 Paid entitlement (monthly paid + now < currentPeriodEnd); canceled access until period end; payment_failed audit only; checkout blocked while entitled | `hasPaidReadingEntitlement`; `invoice.payment_failed` audit; checkout uses the same entitlement check | `entitlement.e2e-spec.ts`, `subscription-billing.e2e-spec.ts`, `has-paid-reading-entitlement.helper.spec.ts` | Complete |
| §6.2 7-day refund ends paid reading immediately | `POST /reader/billing/refund` clamps `currentPeriodEnd` to now | `subscription-refund.e2e-spec.ts`, `subscription-billing.e2e-spec.ts` | Complete |
| §7.1 / §7.2 Weighted engagement and book revenue formula | Reflowable: active reading ms × category weight. Fixed-layout: spread `activeDurationMs` × category weight. `visualSceneTimeMs` is stored and shown, not added to the revenue weight (matches the SRS example formula). Multi-category weight is the sum of assigned weights. | `book-engagement.service.spec.ts`, `book-revenue.e2e-spec.ts` | Complete |
| §7.3 Platform cut and remaining author share | `PLATFORM_CUT_PERCENT` on revenue periods | `revenue-period.service.spec.ts`, `book-revenue.e2e-spec.ts` | Complete |
| §7.4 Admin revenue-period calculate (audited; recalculate appends another row) | `POST /admin/revenue-periods/:id/calculate` | `admin-monetization.e2e-spec.ts`, `book-revenue.service.spec.ts` | Complete |
| §8.1 AES encryption, encrypted blobs, downloads stay encrypted | Encryption provider; `isEncrypted`; grant URL has no `storageKey` and is not decrypted | `reader-book-asset.e2e-spec.ts`, `critical-flow.e2e-spec.ts` | Complete |
| §8.2 Client-only anti-piracy (no open outside app, no file-manager access, decrypt only in app runtime) | Client runtime | — | Not Required |
| §8 JWT auth, authorization, validation, upload checks, webhook verification, rate limits | Auth module, guards, validation pipe, Stripe signature, throttling | `auth.e2e-spec.ts`, `http-surface.e2e-spec.ts`, `auth-throttle.e2e-spec.ts`, `subscription-billing.e2e-spec.ts` | Complete |
| §9 Encrypted download for offline | `POST /reader/books/:id/delivery-grant` | `reader-book-asset.e2e-spec.ts` | Complete |
| §9 Full offline reading experience | Client cache + reader | — | Not Required |
| §10 Metadata search (title, author, publisher) | `GET /reader/search` | `reader-search.e2e-spec.ts` | Complete |
| §10 Catalog filters (category, popularity, newest) | `GET /reader/catalog?categoryId&sort=` Popularity ranks by reading-progress row count, not engagement minutes. | `reader-catalog.e2e-spec.ts` | Complete |
| §10 In-book full-text search | `GET /reader/search/:id?q=` | `reader-in-book-search.e2e-spec.ts` | Complete |
| §10.1 Fixed-layout searchable text layer and hit highlights | Text layer + runs; hit `highlights` in the API. Client overlay is out of scope. | `book-epub-fixed-layout-text.e2e-spec.ts`, `reader-in-book-search.e2e-spec.ts` | Complete |
| §10.2 Collection entity, admin management, reader discovery in editorial order | Collection domain; `admin/collections`; `reader/collections` | `admin-collection.e2e-spec.ts`, `reader-collection.e2e-spec.ts` | Complete |
| §10.2 Unpublished books excluded from reader-facing collections | Discovery hydrates via catalog-visible books only; membership is unchanged for admins | `reader-collection.e2e-spec.ts`, `collection-discovery.service.spec.ts` | Complete |
| §11 Sync reflowable position and bookmarks | Sync snapshot includes progress + bookmarks | `reading-sync.e2e-spec.ts`, `reading-bookmarks.e2e-spec.ts` | Complete |
| §11 Sync fixed-layout spread/page and bookmarks | Same sync APIs, layout-discriminated fields | `reading-sync.e2e-spec.ts` | Complete |
| §12.1 Author analytics APIs (total minutes, per book, ranking) | `GET /author/analytics` | `author-monetization.e2e-spec.ts` | Complete |
| §12.2 Author earnings APIs (per book, total, trend) | `GET /author/earnings`, `GET /author/earnings/trend` | `author-monetization.e2e-spec.ts` | Complete |
| §12.3 Layout-aware heatmap (fixed-layout spreads; reflowable chapters; unmatched title null; hottest first) | `GET /author/analytics/books/:bookId/heatmap`, `GET /admin/revenue-periods/:id/books/:bookId/heatmap` | `author-monetization.e2e-spec.ts`, `admin-monetization.e2e-spec.ts`, `book-heatmap.service.spec.ts` | Complete |
| §12 Author dashboard UI | — | — | Not Required |
| §13 JWT authentication | JWT provider + guards | `auth.e2e-spec.ts` | Complete |
| §13 Modular NestJS + Prisma + PostgreSQL | `ARCHITECTURE.md` layout, Prisma provider | `app.e2e-spec.ts`, `health.e2e-spec.ts` | Complete |
| §13 Stripe payments | Stripe provider + billing services | `subscription-billing.e2e-spec.ts` | Complete |
| §13 Strong encryption for IP protection | AES provider and encrypted source assets | encryption specs, `book-source.e2e-spec.ts` | Complete |
| §13 Highly scalable / high-performance analytics as a load-tested property | Job provider for processing; no load tests | — | Not Required |
| §13 Offline-first mobile architecture | Client | Backend grants + sync are Complete above | Not Required |
| §14 React Native dual reader frontend | — | — | Not Required |
| §14 Object storage for encrypted files | Storage provider (S3-compatible + memory double) | storage provider specs, source/media e2e | Complete |
| Part 2 AI audiobook generation, ElevenLabs, playback | Not implemented. Part 1 left `BookAssetKind.audio` and extractable chapter text. | — | Not Required |
| Part 3 formatting / typesetting service | Not implemented. Publishing is not coupled to a formatting workflow. | — | Not Required |

## Notes that do not change a Complete row

- Catalog popularity is a progress-row count, not weighted engagement.
- Fixed-layout revenue weight uses spread `activeDurationMs` only; `visualSceneTimeMs` is persisted and returned on analytics, matching the SRS example formula.
- Registration does not insert a free subscription row. Missing subscription is treated as unpaid. Checkout calls `ensureFreeSubscription`.
- Delivery grants are signed URLs, not persisted rows.
- PDF sources are stored encrypted; deep PDF structure extraction is not part of Part 1.
- There is no complimentary paid grant and no user ban flag (soft-delete only).
- Last-admin protection is unit-tested; it is hard to hit over HTTP because an admin cannot change themselves.
- Author/admin book metadata PATCH and category-weight PATCH are implemented and are not listed in §2.4 as required audit events.
- Reflowable time-per-page and reading speed remain SRS requirements. They are Future / out of scope for current Part 1 because there is no stable server-side page definition. See `docs/FUTURE.md`.
