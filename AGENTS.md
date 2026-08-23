# Project Engineering Instructions

This repository has three architecture sources of truth and a separate delivery tracker.
Use the document that matches the work.

| Work | Authority |
| --- | --- |
| Product / business behavior | `docs/SRS.md` |
| NestJS backend | `ARCHITECTURE.md` |
| React dashboard / frontend | `docs/FRONTEND-ARCHITECTURE.md` |
| Mobile reader (Expo RN) | `docs/MOBILE-ARCHITECTURE.md` |
| Admin / author / mobile delivery STEPs | `docs/admin-dashboard-tasks.md` |
| Mobile package runbook (commands, env, Replit) | `mobile/README.md` |
| Deferred product work | `docs/FUTURE.md` |
| Coverage tracking | `docs/srs-coverage-matrix.md` |

Do not mix backend layering into frontend work. Do not mix React/UI rules into backend or
mobile work. Do not redefine backend business rules in any client. The backend remains
authoritative for permissions, entitlement, monetization, and validation.

Do not modify `ARCHITECTURE.md`, `docs/FRONTEND-ARCHITECTURE.md`, `docs/MOBILE-ARCHITECTURE.md`,
or `docs/SRS.md` unless the user explicitly requests it. Do not record STEP progress, install
status, or remaining bootstrap in architecture documents. Track delivery in
`docs/admin-dashboard-tasks.md`.

## Backend work

Before planning, generating, modifying, refactoring, debugging, or reviewing **backend** code:

1. Read and follow `ARCHITECTURE.md`.
2. Treat its architecture, dependency rules, folder structure, naming conventions, layering,
   repository patterns, DTO patterns, provider patterns, transaction rules, error handling,
   testing conventions, and implementation workflows as the default engineering standard.
3. Do not introduce a conflicting architectural pattern without explicitly identifying the
   conflict and explaining why a deviation is necessary.
4. When implementing a new feature, follow the relevant implementation workflow defined in
   `ARCHITECTURE.md`.
5. When modifying existing code, preserve architectural consistency with `ARCHITECTURE.md`.
6. If existing code conflicts with `ARCHITECTURE.md`, prefer `ARCHITECTURE.md` for new work and
   explicitly flag the inconsistency before expanding the conflicting pattern.
7. Do not silently invent alternative architectural conventions when the specification already
   defines one.
8. Before implementation, identify the relevant sections of `ARCHITECTURE.md`.
9. After implementation, verify the resulting code against `ARCHITECTURE.md` before considering
   the task complete.

If there is a conflict between existing backend code, an inferred convention, a generic NestJS
pattern, and `ARCHITECTURE.md`, follow `ARCHITECTURE.md` unless the user explicitly instructs
otherwise.

## Frontend work

Before planning, generating, modifying, refactoring, debugging, or reviewing **frontend** code:

1. Read and follow `docs/FRONTEND-ARCHITECTURE.md`.
2. Consume backend APIs according to their contracts. Do not import `backend/src`.
3. Keep pages thin, features cohesive, and server state in TanStack Query.
4. Do not duplicate monetization, entitlement, authorization, or category-weight logic in the UI.
5. After implementation, verify the result against `docs/FRONTEND-ARCHITECTURE.md`.
6. Update STEP status only in `docs/admin-dashboard-tasks.md`.

If there is a conflict between existing frontend code, a generic React pattern, and
`docs/FRONTEND-ARCHITECTURE.md`, follow `docs/FRONTEND-ARCHITECTURE.md` unless the user
explicitly instructs otherwise.

## Mobile reader work

Before planning, generating, modifying, refactoring, debugging, or reviewing **mobile**
code under `mobile/`:

1. Read and follow `docs/MOBILE-ARCHITECTURE.md`.
2. Use `mobile/README.md` for package commands, env, and Replit checklist only — not as a
   substitute for architecture.
3. Follow STEP notes in `docs/admin-dashboard-tasks.md` for delivery scope and order.
4. Keep the app Expo + React Native + TypeScript, env-driven, and Replit-portable.
5. Do not hardcode localhost, secrets, or machine-only paths.
6. Do not duplicate monetization, entitlement, or authorization rules in the client.
7. Do not start R3+ reader features until STEP 33 (R2) is Complete.
8. Update STEP status only in `docs/admin-dashboard-tasks.md`.

If there is a conflict between existing mobile code, a generic React Native/Expo pattern, and
`docs/MOBILE-ARCHITECTURE.md`, follow `docs/MOBILE-ARCHITECTURE.md` unless the user
explicitly instructs otherwise.

## Working Procedure

For every substantial implementation:

1. Read the relevant architecture sections for that side of the repo.
2. Inspect the existing affected code.
3. Identify the boundaries involved (backend domains/modules, or frontend/mobile
   features/routes/APIs).
4. Produce a short implementation plan.
5. Implement according to the governing architecture document.
6. Run or update the appropriate tests.
7. Run lint/type-check/build where available.
8. Perform a final architecture-compliance review.
9. Report any existing architecture violations discovered during the work.

Do not introduce architecture changes merely for convenience.
