# ADR-003: Migrate the client from Flutter to React Native (Expo)

**Date:** 2026-10-02
**Status:** Accepted
**Deciders:** Project owner
**Supersedes (in part):** [[ADR-002-adaptive-platform-ui]] — the adaptive-UI approach is replaced by the design system described below. [[ADR-001-riverpod-state-management]] applies to the Flutter app only.

---

## Context

The product goal is an app that feels truly native: **real Liquid Glass on iOS 26**, and a **proper, good-looking fallback on Android** — explicitly *not* a stock-Material look.

With Flutter this has been a continuing fight: native-feeling iOS UI arrives through third-party plugins (`cupertino_native_better`, later `liquid_glass_widgets`), most "glass" in the app is a hand-rolled `BackdropFilter` blur shim rather than real Liquid Glass, Android gets whatever those widgets render, and the map already needs hand-written Kotlin (`GoogleMapView.kt`) and Swift (`SwiftUIMapView.swift`) views embedded in Flutter.

> **Vault correction (2026-10-02):** [[ADR-002-adaptive-platform-ui]] and `_INDEX.md` say the Flutter app adopted `adaptive_platform_ui`. **The code never did** — it is absent from `pubspec.yaml` and `lib/` (one comment mentions it). The real stack is `liquid_glass_widgets` + the custom blur shim + Cupertino widgets. ADR-002 describes an intention that was not carried through.

`triplex_expo/` already exists as a parallel React Native scaffold (auth, API client with token refresh, `NativeTabs`) on Expo SDK 57.

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| Stay on Flutter + third-party glass/adaptive plugins | No rewrite | Glass/native feel depends on third-party plugins; Flutter draws its own pixels, so "native" is always emulated; Android fallback quality out of our hands |
| Two fully native apps (Swift + Kotlin) | Best possible native feel | Two codebases; `Triplex_swift/` is already an unfinished variant; far more work |
| React Native (bare) | Full control | Re-implements what Expo already provides (build, config, OTA) |
| **React Native + Expo (dev builds + CNG)** | First-party `expo-glass-effect` (real `UIGlassEffect`), `NativeTabs` (real iOS 26 tab bar), `@expo/ui` SwiftUI primitives; real native views, so platform controls are *actually* native; scaffold already exists; one TypeScript codebase | Android has no system glass — we must build our own fallback; some Expo APIs still unstable (`unstable-native-tabs`, `expo-maps` alpha); full rewrite of the client |

## Decision

**Migrate the client to React Native with Expo SDK 57**, in `triplex_expo/`, following [[../../triplex_expo/MIGRATION_PLAN]].

Key consequences of *how* we do it:

- **Three rendering tiers, one design language:** iOS 26 = real Liquid Glass; older iOS = blur; Android = custom frosted surfaces. Feature code never branches on platform for style — only `src/design-system/` does.
- **`@expo/ui` universal components are *not* used for Android**, because they render Jetpack Compose Material (the look we are avoiding). `@expo/ui/swift-ui` is allowed on iOS only, from `*.ios.tsx` files, enforced by lint.
- **Work is sequential and quality-gated** (owner instruction): one task at a time, each shippable and verified on iOS 26, iOS 18 and Android before the next starts.
- **The Flutter app is frozen as a read-only reference** until cutover. It is mid-restructure and is not to be edited as part of this work.
- **Backend is unchanged.** The API contract (`triplex_node/api_doc.md`) is the interface; defects found in client auth handling are fixed in the new client (see the plan, Task 2).
- **Platform floor changes:** iOS 15 → iOS 16.4; Android 7+.
- **Identity preserved:** bundle ID / application ID stay `com.templex.triplex`.

## Consequences

- `triplex_expo/MIGRATION_PLAN.md` is the source of truth for scope, order and "done".
- The Flutter-specific rules in the root `AGENTS.md` (§6 build_runner, §7 clean-architecture layout) apply to `triplex/` only. The React Native app keeps the same *spirit* (feature-first, data/state/UI separated) in TypeScript — see plan §4.1.
- Cutover (deprecating `triplex/`) is a deliberate, owner-approved final task, not an automatic side effect.
