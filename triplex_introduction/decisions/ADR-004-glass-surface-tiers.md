# ADR-004: One glass surface, three rendering tiers (React Native design system)

**Date:** 2026-10-03
**Status:** Accepted (tier C implementation deferred — see Consequences)
**Deciders:** Project owner (direction), Claude (implementation)
**Context link:** [[ADR-003-migrate-flutter-to-react-native-expo]]

---

## Context

The migration exists to get **real Liquid Glass on iOS** and a **good-looking Android fallback that is not stock Material** (ADR-003). Verified against Expo SDK 57 docs and the installed packages:

- `expo-glass-effect` draws the real iOS 26 `UIGlassEffect`. Below iOS 26 it renders a plain `View`; on Android it does nothing.
- `@expo/ui` *universal* components render **Jetpack Compose Material on Android** — the look we are avoiding.
- `expo-blur` provides system-material blur on iOS (all versions) and, since SDK 55, stable blur on Android (API 31+, via `BlurTargetView`).

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| `@expo/ui` universal components everywhere | Least code | Android = stock Material. Rejected outright. |
| `expo-glass-effect` only | Real glass on iOS 26 | Plain `View` everywhere else — not a fallback |
| Third-party "Android liquid glass" libraries (AGSL shaders) | Closest Android look | New-Architecture/maintenance/perf unknown; adds a dependency the whole UI would rest on |
| **One `<Glass>` primitive that picks an implementation per device** | Feature code never branches on platform; each tier can be improved independently | Need a tier per platform class |

## Decision

A single `Glass` surface (`src/design-system/Glass.tsx`). `useSurfaceMode()` (feature-detection, not OS-version sniffing) chooses:

| Mode | Where | Implementation |
|------|-------|----------------|
| `liquid` (A) | iOS 26+ (`isLiquidGlassAvailable()`) | `GlassView`, `colorScheme` driven by the app's own scheme |
| `blur` (B) | iOS 16.4–25 | `BlurView` with `systemThinMaterial` + hairline border |
| `frosted` (C) | Android | Near-opaque tinted fill + hairline border (**no blur yet**) |
| `solid` | Reduce Transparency, any platform | Opaque surface |

Supporting decisions, each driven by something observed on device:

1. **The no-blur fallback is 94 % opaque, not translucent.** A first version used 78 % and, over rich content, the backdrop text bled through the card text. Legibility over *any* backdrop is now asserted in `tokens.test.ts` (black / white / canvas).
2. **No `clear` glass variant.** Over a bright backdrop in dark mode its secondary text was nearly invisible. It returns only when a screen needs it, with a dimming layer.
3. **Accent colour is not Flutter's `#1D8BFF`.** It is 3.0:1 on the light canvas (fails AA for text); the accent is `#0066CC` / `#4DA3FF`. A test pins this.
4. **`Appearance.setColorScheme` is the single theme switch** (verified on device): it flips components *and* native glass. In RN 0.86 "follow system" is `'unspecified'`, not `null`.
5. Third-party Android glass libraries are **not adopted**. Revisit only inside the Android pass, against: maintained? New-Architecture safe? mid-range-device perf? licence?

## Addendum (2026-10-03): sheets and toasts

- **Sheets are native, not drawn.** `sheetOptions()` configures an Expo Router `formSheet` (a real `UISheetPresentationController`). On iOS 26 the system supplies the Liquid Glass background, floating inset, concentric corners, grabber and drag physics — we only keep the screen background **transparent** (an opaque container hides the glass; pinned by `sheet.test.ts`). Header = title + circular glass close button (`SheetHeader`). Glass-on-glass has no affordance, so primary actions inside a sheet are *prominent* (solid), not `glass`.
- **Toasts render in a `FullWindowOverlay` on iOS.** A native sheet is presented over the app's root view and covered the toast (observed). `FullWindowOverlay` is a separate native window above everything; touches pass through it.
- **Sheet background depends on the OS (found on iOS 18.5).** Transparent is right on iOS 26 (the system draws the glass; an opaque screen would cover it) and **wrong below it** (nothing draws a material → the sheet is see-through, the page shows through its text). So: `resolveSheetBackground(isSystemGlassAvailable(), colors.surface)` → transparent on iOS 26+, the opaque theme surface everywhere else. Exposed as `useSheetOptions()`. Both failure modes are pinned by `sheet.test.ts`. *(This corrects the first addendum bullet, which said the screen must always be transparent.)*
- **Tab bar = the system's, not ours.** `NativeTabs` (iOS) is drawn by the OS: floating Liquid Glass on iOS 26 (with native minimize-on-scroll), classic UIKit bar below. We don't recolour it on iOS 26 (the glass adapts to what is behind it); on older iOS only the *unselected* items are coloured, because the system grey measured 2.4:1 (labels) / 2.9:1 (icons) — below WCAG AA — and is replaced with `textSecondary` (≥ 4.5:1). See `resolveTabBarColors`.
- **Scroll-view screens leave safe areas to UIKit.** `Screen scroll` uses `contentInsetAdjustmentBehavior="automatic"`; padding by hand as well double-counted the top inset inside native tabs (found on device).
- **Open issue:** small glass controls over bright content in dark mode — static label colour vs adaptive glass → weak contrast. Not decided; see `MIGRATION_PLAN.md` Task 1 progress log.

## Consequences

- **Tier C is unverified.** The owner scoped work to "debug on iOS only" (2026-10-02). Android code is written to the same architecture and the lint guard rails stay on, but real Android blur (`expo-blur` + `BlurTargetView`, API 31+, opaque below) and its verification are the **Android pass** — tracked in `todo/TODO-001`.
- Tier B was previewed by forcing the mode on an iOS 26 device (a dev-only switch in the gallery). That exercises the code path, **not** a real iOS < 26 OS — real iOS 18 run tracked in `todo/TODO-002`.
- The `Glass` API is intentionally small (`radius`, `interactive`, `tint`). New needs extend it deliberately.

## Addendum (2026-10-03): native glass *under* a JS-drawn sheet — no Flutter-style problem

Experiment: `triplex_expo/app/gallery-overlap.tsx` (dev-only, linked from the gallery). Real `GlassView`s (straddling the edge, inside, tinted, circular) sit **under** an ordinary RN `View` sheet — not a native formSheet. Run on iPhone 17 Pro, iOS 26.5.

| Sheet over the glass | Result |
|---|---|
| `BlurView` (systemThinMaterial) | Native glass **is blurred** with the rest of the backdrop (shows as a soft smudge). |
| Semi-transparent `rgba` fill | Glass **shows through**, correctly tinted, rounded and clipped; label text inside it is intact. |
| Solid | Glass fully **covered**. |

Native views participate in the normal z-order/compositing, so JS-drawn overlays can blur, fade or hide them. This is the opposite of Flutter's platform-view limitation. Caveat: only iOS 26 tested; Android (TODO-001) and iOS 18 (TODO-002) not run.

## Addendum (2026-10-03): tier C grew up — see [[ADR-009-adaptive-controls-ios-native-android-drawn]]

Android is no longer just "a frosted card": it has a drawn header, a floating tab bar, menus, alerts, action sheets, a list and the basic controls, all in the iOS 26 style. One correction to this ADR's own tier-C row: surfaces that **float over content** (menus, sheets, alerts, the tab bar) are drawn **opaque** on Android (`Glass opaque`) — the 94 %-opaque frosted fill still let the page behind ghost through their text on device. Cards on the plain canvas keep the frosted fill. Real blur remains open (TODO-001).
