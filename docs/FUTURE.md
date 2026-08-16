# Future and deferred work

This file tracks SRS requirements and product decisions that are **not** part of the currently implemented Part 1 backend.

`docs/SRS.md` remains the product source of truth. Requirements listed here stay in the SRS; this file only records that they are deferred or future work.

Do not treat items here as implemented.

## Locked Part 1 decision — reflowable page tracking

Reflowable books remain **spine/chapter-based** for Part 1.

- Do not introduce a server-side `pageNumber` for reflowable books.
- Pagination is client-dependent and can vary with font size, screen dimensions, spacing, and other reader settings.
- The reflowable position model stays `spineIndex` + `scrollOffset`.
- Do not add `pageNumber` to reading sessions, reading progress, bookmarks, or activity.
- Time-per-page and reading speed (pages/minute) are out of scope for the current Part 1 implementation until a client pagination contract is defined.

## Future requirements

These SRS requirements are still expected to be implemented later. They are not part of the current Part 1 backend.

| Item | SRS | Notes |
| --- | --- | --- |
| Reflowable time-per-page | §5.1 | Requires a stable page definition from a client pagination contract. |
| Reflowable reading speed (pages/minute) | §5.1 | Requires the same page definition as time-per-page. |
| Related reflowable `pageNumber` tracking | — | May be needed later on sessions, progress, bookmarks, or activity. Not added in Part 1. |

## Deferred product decisions

These decisions still need clarification before the future requirements above can be implemented.

| Item | Why it is deferred |
| --- | --- |
| Client-side pagination contract / page definition for reflowable books | There is no stable server-side page definition for reflowable content. Pagination depends on the reader. |

## Out of current Part 1 scope

The following are explicitly out of the current Part 1 implementation:

- Implementing reflowable time-per-page
- Implementing reflowable reading speed (pages/minute)
- Adding server-side reflowable `pageNumber` anywhere

Client UI, Part 2, and Part 3 remain out of Part 1. Those rows are **Not Required** in `docs/srs-coverage-matrix.md`.
