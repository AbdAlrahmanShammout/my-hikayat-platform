# Future and deferred work

This file tracks SRS requirements and product decisions that are **not** part of the currently implemented Part 1 backend.

`docs/SRS.md` remains the product source of truth. Requirements listed here stay in the SRS; this file only records that they are deferred or future work.

Do not treat items here as implemented.

## Locked decision — reflowable reading is content-based

Reflowable reading uses **stable content location**, not visual pages.

There is **no product requirement** for a server-side reflowable pagination contract or stable page numbers. Do not invent one.

| Concept | Canonical model | Not canonical |
| --- | --- | --- |
| Position | `spineIndex` + `scrollOffset` | Rendered `pageNumber` |
| Progress | Content location → percentage (chapter text length up to the current spine) | `current rendered page / current rendered page count` |
| Pagination | Device-local presentation only | Server-side reflowable pages |

Implications:

- Resume, bookmarks, and sync stay on `spineIndex` + `scrollOffset`. They must not send or store a reflowable `pageNumber`.
- Progress percent is derived from EPUB chapter text length at the current spine. It must not use font size, spacing, margins, viewport, or rendered page count.
- Reading time remains **active reading time**. Do not duplicate it into reflowable page records.
- Chapter engagement remains spine/chapter-based. Do not convert it to page engagement.
- Author revenue remains **active reading time × category weight**. Do not use page count, pages/minute, reflowable page number, or percentage completed for payouts.
- Percentage is a progress signal, not a monetization signal.
- Reading intelligence may use active time, chapter engagement, content-based progress, and session data. It must not depend on a device-specific reflowable page number.
- Fixed-layout `pageNumber` / spread tracking is unchanged.

A future CFI-like or character-offset locator may refine position without introducing pagination. Do not build a full pagination system for future-proofing.

## Intentionally deferred (not unfinished)

These remain deferred because there is **no stable reflowable pagination contract and no product requirement for one**. This is an intentional decision, not an incomplete implementation.

| Item | SRS | Notes |
| --- | --- | --- |
| Server-side reflowable `pageNumber` | — | Must not become reading-state source of truth. Must not mix with fixed-layout page/spread numbers. |
| Reflowable time-per-page | §5.1 | Page time is visual; active reading time is the reliable metric. |
| Reflowable reading speed (pages/minute) | §5.1 | Not a canonical reflowable metric. Do not introduce a fake pages/minute. |
| Server-side page-level reflowable heatmaps | — | Reflowable heatmaps stay chapter/spine-based. |
| Canonical reflowable pagination across devices | — | Pagination changes with font, spacing, margins, viewport, orientation, and device. |

Future page-level analytics may be added later **if a real product requirement appears**.

## Deferred product decisions

| Item | Why it is deferred |
| --- | --- |
| Client-side pagination contract / page definition for reflowable books | No product requirement. Pagination is presentation until a future requirement makes it canonical. |

## Out of current Part 1 scope

- Implementing reflowable time-per-page
- Implementing reflowable reading speed (pages/minute)
- Adding server-side reflowable `pageNumber` anywhere
- Storing the client's current visual page as canonical reading state

Client UI for Part 2 and Part 3 remain out of Part 1. Those rows are **Not Required** in `docs/srs-coverage-matrix.md`.
