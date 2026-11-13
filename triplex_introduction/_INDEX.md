# Triplex Project — Current State Index

> **Agent: Read this first.** It is the fast-path snapshot. Follow links for deep detail.

**Last Updated:** 2026-11-13  
**Updated By:** Claude (RN: **premium-UX audit fixes 2–4** — sign-out can't reject, post pull-to-refresh spinner, mutations fail fast offline; unit-tested, owner device check pending — [[todo/TODO-005-premium-ux-audit]]; earlier: **premium-UX audit fix 1** — failure toasts say what failed and offer Retry, 10 s when they have a button; unit-tested, not yet device-verified — [[todo/TODO-005-premium-ux-audit]]; earlier: **Task 8 Comments** — sheet, replies, reactions, delete, composer; verified on iOS 26.5 — [[decisions/ADR-011-comments]]; earlier: **Task 7 Feed & posts** — feed, post card, reactions, repost, photo viewer, post detail — [[decisions/ADR-010-feed-and-posts]]; earlier: **Android adaptive controls** — iOS 26 look for Android, native controls kept on iOS — [[decisions/ADR-009-adaptive-controls-ios-native-android-drawn]]; earlier: profile picture change (camera/photos menu, upload) — [[decisions/ADR-008-profile-picture-upload]]; Task 5 Settings & Account center implemented (see [[decisions/ADR-007-settings-theme-and-account-changes]]); Task 4 app shell implemented (see [[decisions/ADR-006-app-shell-and-navigation]]); Task 3 authentication implemented; Task 2 core infrastructure; see [[decisions/ADR-005-rn-api-layer-and-error-model]], [[decisions/ADR-003-migrate-flutter-to-react-native-expo]], [[decisions/ADR-004-glass-surface-tiers]])

> 🔀 **Direction change (2026-10-02):** the client is migrating from Flutter to **React Native (Expo SDK 57)** in `triplex_expo/`. The source of truth for scope, order and "done" is `triplex_expo/MIGRATION_PLAN.md`. The Flutter app is a **read-only reference** until cutover.

---

## Project Overview

Triplex is a location-based social media app. Users can post geo-tagged content that appears on a map and in a social feed. The repo is a monorepo containing multiple client apps and a shared Node.js backend.

---

## System Health Snapshot

| Area | Status | Notes |
|------|--------|-------|
| Flutter App (`triplex/`) | 🟠 Frozen reference | Feature-first clean arch, Riverpod v3, `liquid_glass_widgets` + custom blur shim. *(ADR-002's `adaptive_platform_ui` is **not** in the code.)* Mid-restructure; don't edit |
| Node.js Backend (`triplex_node/`) | 🟢 Active | Check `api_doc.md` for endpoints. Unchanged by the migration |
| React Native (`triplex_expo/`) | 🟦 **Primary — migration in progress** | Expo SDK 57. **iOS-only debugging by owner's decision; since 2026-10-03 iOS 26 only** (Android deferred: [[todo/TODO-001-android-verification-deferred]]). Task 0 ✅, Task 1 design system implemented and verified on iOS 26 + iOS 18 (one open item: dark-mode glass-button contrast, owner decision), **Task 2 core infrastructure (`src/core/`: AppError, 401-only single-flight refresh, zod boundary, TanStack Query, toasts, logger) implemented — 177 tests green, boots on iOS 26.5 and reaches the backend; not yet exercised with a real signed-in session (Task 3)**. Adds native dep `expo-network` → rebuild dev client. **Task 3 authentication implemented and device-verified on iOS 26.5 + 18.5 (login/register/restore/sign-out, `Stack.Protected` gating, real token refresh, forced sign-out, offline + wrong-password messages, dark mode + max text size); fixed a Dynamic Type clipping bug in `Text`/`TextField`. No-login-flash on cold start proven frame by frame (0/249 login frames; positive control OK). Android, iPad, and server-500-on-device remain unverified. Adds native dep `expo-haptics` → rebuild.** **Task 4 app shell (2026-10-03): `NativeTabs` with one tab (Profile, laid out like Flutter's profile screen), per-tab Stack, Settings as its own stack, `triplex://` deep links, real profile from `GET profile/me`. Verified on iOS 26.5 only — owner: "only debug on iOS 26" (iOS 18 / Android / iPad unverified). No new native dep.** **Task 5 (2026-10-03): Settings (persisted Light/Dark/System theme, native segmented control), Account Center (username availability + email, password in a native sheet, rotated tokens stored — verified on iOS 26.5 incl. real partial failure and relaunch). Adds native dep `@react-native-async-storage/async-storage` → rebuild.** **Profile tab now mirrors Flutter's layout (avatar/username/email card; camera + Settings in the app bar) and changes the profile picture from Camera or Photos — real upload, verified on iOS 26.5. Adds native deps `expo-image-picker`, `expo-image-manipulator` + usage strings → `npx expo prebuild --platform ios`, then rebuild.** **Task 7 Feed & posts (2026-10-03): Feed is now the first tab (`NativeTabs`: Feed, Profile). Real feed from `GET posts/feed` with stale-while-revalidate across launches, post card (photos carousel with peek + dots, trip plan, embedded repost, reactions / comments / reposts footer), long-press reaction bar (+ screen-reader actions), reactions list and repost as native sheets, post detail by id (`triplex://post/<id>` works cold), full-screen photo viewer (pinch / pan / drag-to-dismiss). One cache is the truth for feed and detail; reactions are optimistic and coalesce. Verified on iOS 26.5 only (owner: "debug and test on iOS 26 only"; temp simulator + throwaway account for every write). New native dep `expo-image` → rebuild; gesture-handler / reanimated pinned to Expo's versions. 537 tests. Task 6 deferred (needs owner accounts). Unverified: Android, iOS 18, iPad, offline/error states on device, double-tap zoom on device, Reduce Motion.** **Task 8 Comments (2026-10-27, iOS 26.5 device-verified + 607 tests): comments sheet from the feed card's count (list, one level of lazy replies, reactions, delete-own with confirm, optimistic add / delete / react with rollback), comments + pinned composer on the post screen, new `ComposerBar` primitive. No new native dep.** **Android pass (2026-10-03, owner re-opened Android): `src/design-system/adaptive/` — iOS keeps the system controls (SwiftUI `Toggle`/`Slider`/`Stepper`/`Menu`, `Alert`, `ActionSheetIOS`, `NativeTabs`, `Stack.Toolbar`); Android gets drawn iOS 26 equivalents plus a drawn header and floating tab bar. Emulator-verified (API 36, light + dark); iOS 26.5 re-checked, no regression. No new native dep. Open: real Android blur, API 30, Android sheets, font.** See `MIGRATION_PLAN.md` |
| Swift App (`Triplex_swift/`) | 🟡 Unknown | Native iOS variant |
| Knowledge Vault | 🟢 Active | This vault |

---

## Active Architecture

The Flutter app (`triplex/`) uses **Feature-First Clean Architecture** with Riverpod.

```
lib/
  core/            ← app-wide: API, DB, Router, Storage
  features/
    auth/          ← login, register, token refresh
    feed/          ← post list and creation
    home/          ← home shell / navigation container
    map/           ← Google Maps view
    profile/       ← user profile
    create/        ← post creation
    message/       ← messaging
    comments/      ← comments on posts
    reactions/     ← like/react system
    settings/      ← user settings
    account_center/ ← account management
```

> Full detail: [[architecture/triplex_architecture]]

---

## Key Technology Decisions

| Decision | Choice | Link |
|----------|--------|------|
| State management | Riverpod v3 (code-gen) | [[decisions/ADR-001-riverpod]] |
| Adaptive UI (Flutter) | ~~`adaptive_platform_ui`~~ — documented but never adopted in code; actual: `liquid_glass_widgets` + blur shim | [[decisions/ADR-002-adaptive-platform-ui]] |
| **Client framework** | **React Native + Expo SDK 57** (replaces Flutter) | [[decisions/ADR-003-migrate-flutter-to-react-native-expo]] |
| **RN API layer** | `AppError` + 401-only single-flight refresh + zod at the boundary + TanStack Query v5 | [[decisions/ADR-005-rn-api-layer-and-error-model]] |
| **RN app shell** | `NativeTabs` + a Stack per tab; Settings is a separate root stack; anchor `(tabs)` | [[decisions/ADR-006-app-shell-and-navigation]] |
| **RN settings / account** | Theme via `Appearance.setColorScheme` + AsyncStorage; password in a native sheet; tokens stored inside the API call | [[decisions/ADR-007-settings-theme-and-account-changes]] |
| **RN profile picture** | Native toolbar menu → system pickers → shrink → `POST profile/profile-picture` | [[decisions/ADR-008-profile-picture-upload]] |
| **RN feed & posts** | One query-cache truth (`patchPost`); optimistic per-post reaction queue that coalesces; snapshot SWR; reposting a repost reposts the original; sheets/viewer as root routes; viewer on gesture-handler + Reanimated | [[decisions/ADR-010-feed-and-posts]] |
| **RN comments** | Same cache-as-truth as posts; optimistic add / delete / react with rollback (text returned on a failed add); `ReactionSync` generic; replies one level via `threadRoot`; `ComposerBar` primitive | [[decisions/ADR-011-comments]] |
| **RN glass / design system** | One `<Glass>` surface; tiers A (iOS 26 Liquid Glass) / B (blur) / C (Android) | [[decisions/ADR-004-glass-surface-tiers]] |
| **RN adaptive controls** | System control on iOS (`Foo.ios.tsx`), drawn iOS 26 look on Android (`adaptive/drawn/`); shared JS for list / search / progress | [[decisions/ADR-009-adaptive-controls-ios-native-android-drawn]] |
| Navigation | go_router | [[architecture/triplex_architecture]] |
| Local DB | Drift (SQLite) | [[architecture/triplex_architecture]] |
| HTTP client | Dio + AuthInterceptor | [[architecture/triplex_architecture]] |
| Token strategy | JWT (access + refresh), stored in flutter_secure_storage | [[architecture/triplex_architecture]] |

---

## Open Bugs

> See [[bugs/]] for details. Summary below.

*No known bugs logged yet. Add them to `bugs/` as they are found.*

---

## Active Todo / Backlog

> See [[todo/]] for details.

- [[todo/TODO-001-android-verification-deferred]] — **in progress**: the Android look is built and emulator-verified (ADR-009); still open: real Android blur, API 30, Android sheets, font (Roboto vs SF — owner decision), iOS 18 + iPad, release builds
- [[todo/TODO-004-comments-backend-notes]] — `comments_count` ignores replies and deletes, no comment pagination; Task 8 open items: comment reaction picker, largest text, Android / iOS 18 / iPad
- [[todo/TODO-003-feed-backend-limits]] — backlog: no pagination, N+1 queries, capped reaction total, API doc vs behaviour, author email exposed (found in Task 7)
- ~~[[todo/TODO-002-ios18-tier-b-device-check]]~~ — real iOS 18 run of the glass fallback: **done 2026-10-03**

---

## Vault Navigation

| Note | Purpose |
|------|---------|
| [[architecture/triplex_architecture]] | Full app architecture (layers, patterns, workflow) |
| `decisions/` | ADRs — why we made the choices we made |
| `bugs/` | Known bugs with repro steps |
| `todo/` | Task backlog |

---

## Agent Notes & Conventions

- **Build runner:** Always run `cd triplex && dart run build_runner build -d` after touching any `@riverpod`, `@freezed`, or `drift` annotated file.
- **Hot reload:** After Dart edits, connect to the running app via DTD and trigger hot reload.
- **API contract:** Check `triplex_node/api_doc.md` before adding any new API call.
- **New feature checklist:** Read `AGENTS.md` at repo root.
