# Architecture Decision Records (ADRs)

This folder records the *why* behind significant technical decisions in the Triplex project.

> Before making a major design choice, check here first. If a similar decision was already made, follow it. If you're making a new one, document it here afterward.

## ADR Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| [[ADR-001-riverpod-state-management]] | Riverpod v3 for State Management & DI | Accepted (Flutter app only) | 2026-08-26 |
| [[ADR-002-adaptive-platform-ui]] | Replace flutter_cupertino_better with adaptive_platform_ui | Accepted, **but not reflected in the code** (`adaptive_platform_ui` is not used); direction superseded by ADR-003 | 2026-09-02 |
| [[ADR-003-migrate-flutter-to-react-native-expo]] | Migrate the client from Flutter to React Native (Expo) | Accepted | 2026-10-02 |
| [[ADR-004-glass-surface-tiers]] | One glass surface, three rendering tiers (RN design system) | Accepted (tier C deferred) | 2026-10-03 |
| [[ADR-005-rn-api-layer-and-error-model]] | RN API layer: AppError, 401-only single-flight refresh, zod boundary, TanStack Query | Accepted | 2026-10-03 |
| [[ADR-006-app-shell-and-navigation]] | RN app shell: NativeTabs, a Stack per tab, Settings as its own stack | Accepted (iOS 26 verified) | 2026-10-03 |
| [[ADR-007-settings-theme-and-account-changes]] | RN Settings: persisted theme, native segmented picker, token-safe account changes | Accepted (iOS 26 verified) | 2026-10-03 |
| [[ADR-008-profile-picture-upload]] | RN profile picture: native toolbar menu, system pickers, shrink then upload | Accepted (iOS 26 verified) | 2026-10-03 |
| [[ADR-009-adaptive-controls-ios-native-android-drawn]] | Adaptive controls: system controls on iOS, drawn iOS 26 look on Android (switch, slider, list, alerts, menu, header, tab bar…) | Accepted (Android emulator + iOS 26.5 verified) | 2026-10-03 |

## How to Write an ADR

Create a new file: `ADR-XXX-short-title.md`

Use this template:

```markdown
# ADR-XXX: Title

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-YYY
**Deciders:** [who was involved]

---

## Context
What problem or situation prompted this decision.

## Options Considered
| Option | Pros | Cons |
|--------|------|------|

## Decision
What was chosen and why.

## Consequences
What changes or constraints result from this decision.
```
