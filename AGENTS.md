# AGENTS.md — Triplex Monorepo Agent Contract

> **Every AI agent working in this repo MUST read this file first.**

---

## 1. Knowledge Vault Location

The single source of truth is the Obsidian vault at:

```
triplex_introduction/
```

It is **git-versioned** — changes you make here are visible to the human in Obsidian *and* committed to the repo simultaneously.

---

## 2. Mandatory Pre-Task Checklist

Before starting **any non-trivial task** (new feature, refactor, bug fix, major edit):

1. **Read `triplex_introduction/_INDEX.md`** — the current-state snapshot.
2. **Read `triplex_introduction/architecture/`** notes relevant to the area you will touch.
3. **Read `triplex_introduction/decisions/`** for any ADRs (Architecture Decision Records) related to the feature.
4. **Check `triplex_introduction/bugs/`** for known open bugs in the area.
5. **Check `triplex_introduction/todo/`** for pending work that might overlap with the task.

---

## 3. Mandatory Post-Task Checklist

After completing **any non-trivial task**:

1. **Update `triplex_introduction/_INDEX.md`** — bump "Last Updated", update the status of the relevant section.
2. **Append or update** the relevant note in `architecture/`, `decisions/`, `bugs/`, or `todo/`.
3. **Create a new ADR** in `decisions/` if a significant design choice was made.
4. **Close/update** any bug or todo note that was resolved.

---

## 4. Vault Folder Map

| Folder | Purpose | When to read | When to write |
|--------|---------|--------------|---------------|
| `architecture/` | How each part of the system works | Before touching a feature | After structural changes |
| `decisions/` | ADRs — *why* choices were made | Before big refactors/additions | After any significant design choice |
| `bugs/` | Known issues, repro steps, root cause | Before fixing or adding to a buggy area | When a new bug is found or one is fixed |
| `todo/` | Backlog and in-progress work | At task start to avoid overlap | When a task is created, started, or completed |

---

## 5. Repo Sub-Projects

| Directory | Description |
|-----------|-------------|
| `triplex/` | Flutter mobile app (iOS + Android) |
| `triplex_expo/` | React Native / Expo variant |
| `Triplex_swift/` | Native Swift iOS app |
| `triplex_node/` | Node.js backend API |
| `triplex_introduction/` | **Obsidian knowledge vault** (this is the brain) |
| `.agents/` | Agent rules and skills |

---

## 6. Code Generation Rule

Whenever you modify any Dart file that uses `@riverpod`, `@freezed`, `@JsonSerializable`, or any `drift` table/DAO, you **must** run:

```bash
cd triplex && dart run build_runner build -d
```

---

## 7. Architecture Rule (CRITICAL)

Follow the Feature-First Clean Architecture strictly. See `triplex_introduction/architecture/triplex_architecture.md` for the full breakdown. In short:

- `features/[name]/data/` → Repositories only (no state)
- `features/[name]/domain/` → Notifiers + Models (state + business logic)
- `features/[name]/presentation/` → Screens + Widgets (UI only, no logic)
- `core/` → Shared cross-feature utilities
