# Project Engineering Instructions

`ARCHITECTURE.md` is the authoritative engineering and architecture specification for this repository.

Before planning, generating, modifying, refactoring, debugging, or reviewing code:

1. Read and follow `ARCHITECTURE.md`.
2. Treat its architecture, dependency rules, folder structure, naming conventions, layering, repository patterns, DTO patterns, provider patterns, transaction rules, error handling, testing conventions, and implementation workflows as the default engineering standard for this project.
3. Do not introduce a conflicting architectural pattern without explicitly identifying the conflict and explaining why a deviation is necessary.
4. When implementing a new feature, follow the relevant implementation workflow defined in `ARCHITECTURE.md`.
5. When modifying existing code, preserve architectural consistency with `ARCHITECTURE.md`.
6. If existing code conflicts with `ARCHITECTURE.md`, prefer `ARCHITECTURE.md` for new work and explicitly flag the inconsistency before expanding the conflicting pattern.
7. Do not silently invent alternative architectural conventions when the specification already defines one.
8. Before implementation, identify the relevant sections of `ARCHITECTURE.md`.
9. After implementation, verify the resulting code against `ARCHITECTURE.md` before considering the task complete.
10. Do not modify `ARCHITECTURE.md` unless the user explicitly requests it.

## Engineering Source of Truth

`ARCHITECTURE.md` is the source of truth for engineering decisions in this repository.

If there is a conflict between:

- existing code and `ARCHITECTURE.md`
- an inferred convention and `ARCHITECTURE.md`
- a generic NestJS pattern and `ARCHITECTURE.md`
- historical implementation patterns and `ARCHITECTURE.md`

follow `ARCHITECTURE.md` unless the user explicitly instructs otherwise.

## Working Procedure

For every substantial implementation:

1. Read the relevant architecture sections.
2. Inspect the existing affected code.
3. Identify the domains, modules, repositories, DTOs, providers, and other boundaries involved.
4. Produce a short implementation plan.
5. Implement according to `ARCHITECTURE.md`.
6. Run or update the appropriate tests.
7. Run lint/type-check/build where available.
8. Perform a final architecture-compliance review.
9. Report any existing architecture violations discovered during the work.

Do not introduce architecture changes merely for convenience.
