# ADR-002: Replace flutter_cupertino_better with adaptive_platform_ui

**Date:** 2026-09-02  
**Status:** Accepted  
**Deciders:** Project team

---

## Context

The Triplex Flutter app previously used `flutter_cupertino_better` / local plugin `cupertino_native_better` for iOS native widgets (such as `CNButton`, `CNPopupMenuButton`, `CNSymbol`). However, this introduced iOS-only platform limitations, coupling to custom native bindings, and brittle fallback logic across Android and other platforms.

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| `flutter_cupertino_better` / `cupertino_native_better` | Native iOS UI feel | iOS-only, broken or requires custom shims on Android, maintenance overhead |
| Pure Flutter `Material` / `Cupertino` widgets | Built-in, zero external dependency | Requires verbose branching (`Platform.isIOS ? Cupertino... : ...`) everywhere |
| `adaptive_platform_ui: 0.1.111` | Cross-platform native feel (iOS + Android + Web/Desktop), official adaptive primitives (`AdaptiveScaffold`, `AdaptiveButton`, `AdaptivePopupMenuButton`, `AdaptiveSegmentedControl`) | Requires migrating legacy imports and call sites |

## Decision

**Adopt `adaptive_platform_ui: 0.1.111`** and completely remove `flutter_cupertino_better` / `cupertino_native_better`.

## Consequences

- All buttons across the app use `AdaptiveButton` and `AdaptiveButton.icon` with `AdaptiveButtonStyle` (`filled`, `tinted`, `plain`, `glass`).
- Shell navigation uses `AdaptiveScaffold` with `AdaptiveBottomNavigationBar` and `AdaptiveNavigationDestination`.
- Context menus and dropdowns use `AdaptivePopupMenuButton.text` / `AdaptivePopupMenuButton.icon` with `AdaptivePopupMenuItem`.
- Segmented controls use `AdaptiveSegmentedControl`.
- Glass/blur effects use `liquidGlass(shape: LiquidGlassShape.rect)` shim to ensure cross-platform consistency.
- All legacy `CN*` widgets and unused imports were removed, resulting in a clean `dart analyze lib` (0 errors, 0 warnings).
