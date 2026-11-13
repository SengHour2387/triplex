---
trigger: always_on
---

## Pre-Task (MANDATORY — do before any non-trivial work)
1. Read `triplex_introduction/_INDEX.md` — current state snapshot.
2. Read relevant notes in `triplex_introduction/architecture/`, `decisions/`, `bugs/`, `todo/`.
3. Check `triplex_node/api_doc.md` before adding any new API call.

## Post-Task (MANDATORY — do after completing any non-trivial work)
1. Update `triplex_introduction/_INDEX.md` (bump "Last Updated", update relevant status).
2. Append to or create a note in the relevant vault folder (`architecture/`, `decisions/`, `bugs/`, `todo/`).
3. If a significant design decision was made, create a new `ADR-XXX.md` in `decisions/`.

## Code Generation
After editing any file with `@riverpod`, `@freezed`, `@JsonSerializable`, or Drift tables:
```
cd triplex && dart run build_runner build -d
```

## Full Contract
See `AGENTS.md` at the repo root.
