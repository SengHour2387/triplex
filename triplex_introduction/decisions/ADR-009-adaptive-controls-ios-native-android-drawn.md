# ADR-009: Adaptive controls — native on iOS, drawn in the iOS 26 style on Android

**Date:** 2026-10-03
**Status:** Accepted (Android: verified on an API 36 emulator, light + dark; iOS 26.5: verified on the simulator. API 30, iOS 18, iPad, release builds: not run)
**Deciders:** Project owner (direction: "make Android look as iOS 26 as much as possible… I don't have a native Android look"), Claude (implementation)
**Context link:** [[ADR-004-glass-surface-tiers]] · [[todo/TODO-001-android-verification-deferred]]

---

## Context

The owner wants the app to look the same on both platforms and to look like iOS 26 — not like Material. Before this change the design system had the glass surface, button, row, text field, toast, sheet header and a segmented picker. On Android everything else was stock Material: the tab bar (lavender pill indicator), the app bar (left-aligned title, flat icons), the toolbar menu, and there was no switch, slider, stepper, list, alert, action sheet, menu, spinner or search field at all.

"What common iOS has" was taken from two sources: Apple's component set, and — more reliably — **the real iOS 26.5 controls rendered in the simulator from the same screens**, which were screenshotted and used as the reference for every Android drawing.

## Decision

New folder `triplex_expo/src/design-system/adaptive/`, exported through `src/design-system/index.ts`.

**One rule decides how each control is built:**

| The control is… | iOS | Android | Examples |
|---|---|---|---|
| Atomic and self-contained | the **system** control (`@expo/ui/swift-ui`, `Alert`, `ActionSheetIOS`, `NativeTabs`, `Stack.Toolbar`, `ActivityIndicator`) in `Foo.ios.tsx` | **drawn** in JS in `drawn/DrawnFoo.tsx`, re-exported by `Foo.tsx` | `Switch`, `Slider`, `Stepper`, `Spinner`, `Menu`, `showAlert` / `showActionSheet` / `confirm`, `AppTabs`, `Toolbar` |
| Layout, not a control | one JS drawing, both platforms | same | `List` / `ListSection` / `ListRow`, `SearchField`, `ProgressBar` |

Feature code imports only the switchboard name (`Switch`, `Menu`, `AppTabs`…) and never branches on `Platform.OS`. The drawn versions are exported too (`DrawnSwitch`, …) so the Gallery can show them **next to the native iOS ones** — that comparison is how the Android look was tuned.

### Public API

- `Switch`, `Slider`, `Stepper`, `Spinner` — props in `adaptive/types.ts` (identical on both platforms; `label` is required for accessibility).
- `Menu` — pull-down menu behind a circular glass button: `items: (MenuItem | 'divider')[]`.
- `showAlert`, `showActionSheet`, `confirm` (→ `Promise<boolean>`) — imperative like `toast`. **Mount `<DialogHost />` once at the root** (next to `ToastHost`); on iOS it renders nothing. Android queues a second alert behind the first (UIKit does the same).
- `Toolbar` — `<Toolbar placement="right" items={[{ type: 'menu' | 'button', icon: IconName, … }]} />`, **data-driven** because Expo Router reads `Stack.Toolbar`'s children by element type (a wrapper component would be invisible to it). iOS renders real `Stack.Toolbar` items; Android sets the screen's `headerLeft` / `headerRight` for the drawn header.
- `AppTabs` — `<AppTabs tabs={[{ name, label, icon: { sf, md, mdSelected }, badge }]} />`. iOS: `NativeTabs` (same colours and minimise behaviour as before). Android: Expo Router JS `Tabs` + the drawn floating bar.
- `useScrollInsets(underHeader?)` — for hand-built `ScrollView`s (the feed), the same top/bottom padding `Screen` applies on Android.
- `Glass` gained `opaque` (see below).

### Android chrome

- **Header (`AppHeader`)**: given to every stack by `useStackScreenOptions` on Android only. Circular glass back button, centred title — or, for `headerLargeTitle` screens, a large title under the bar — and glass action buttons on the right. It sits **in the layout flow with the canvas colour** (no transparent overlay), so scrolling content slides cleanly behind it; the large title is static, not collapsing.
- **Screen insets**: `scrollPadding` now gives a screen under the drawn header **no** top padding (the header clears the status bar). Inside tabs the bottom padding is the whole floating tab bar (`useTabBarInset`, read from the tab bar's measured height).
- **Tab bar (`DrawnTabBar`)**: floating glass capsule above the gesture bar; selected tab on a soft inner capsule; with fewer than three tabs it hugs its tabs (as iOS 26 does), from three it spans the screen; hides while the keyboard is open.

### Fixes that came from comparing against the real iOS 26.5 controls

| Observed on iOS 26.5 | Android now |
|---|---|
| Alert text is **left-aligned**, corners ≈ 34 pt, buttons are quiet grey capsules, only a *preferred* action is emphasised | `radii.xxl = 34`, `DialogAction.preferred`, `colors.buttonFill` |
| Action sheet is **one floating card**: left-aligned title, choices *and Cancel* as stacked capsules, black labels, only destructive red | rewritten to match (the first draft was the old blue-text list) |
| Menu: icon / check mark **leading**, thin inset rules between groups | rewritten (first draft had trailing icons and a thick band) |
| Adjacent toolbar buttons share **one** glass capsule | `ToolbarItems` draws one capsule |
| Menu trigger is a circle | iOS `Menu` uses `buttonBorderShape('circle')` (it was a wide capsule) |
| Destructive rows (sign out) have no chevron | `resolveAccessory`: a destructive row defaults to none |

### `Glass opaque`

Without blur, even the 94 %-opaque fallback lets the page behind **ghost through the text** of a card floating over content (seen on device in the first action sheet and menu). Surfaces that float over content — alerts, action sheets, menus, the tab bar — therefore pass `opaque`, which draws them solid where nothing can blur. Real iOS 26 glass and iOS 16–25 system blur are unaffected. Cards that sit on the plain canvas keep the frosted fill.

## Alternatives considered

| Option | Why not |
|---|---|
| `@expo/ui` universal / Jetpack Compose components on Android | Stock Material — the look the owner rejected (ADR-003/004). The lint rule still forbids them. |
| A third-party "iOS-style for Android" component library | New dependency the whole UI would rest on; unknown New-Architecture / maintenance state. Everything here is ~2k lines of first-party code on `react-native-reanimated` + RN primitives. |
| Custom drawing on iOS too (one codebase) | Loses the system control's physics, haptics, Dynamic Type and — on iOS 26 — the real Liquid Glass. |
| Wrapping `Stack.Toolbar.*` in own components | The router inspects children by type; breaks. Hence the data-driven `Toolbar`. |

## Consequences

- **The Android look is first-party and tunable.** To change it, edit `drawn/*`; the Gallery shows it beside the native control.
- **Real Android blur is still not there.** `expo-blur`'s `BlurTargetView` needs the blurred content wrapped in a target and cannot see another window, so it can serve the tab bar but not Modal-based dialogs. Until it is built, overlays are opaque (above). Tracked in TODO-001.
- **Dialogs on Android are RN `Modal`s**, i.e. their own window: a toast raised while one is open is covered by it (iOS has the same inversion handled with `FullWindowOverlay`).
- `useToolbarIcon` is no longer used by any screen (`Toolbar` replaced it) but is still exported.
- `ProfileScreen` / `SettingsScreen` / `AccountScreen` were **not edited**; only the route files that declare the toolbar and tabs changed.

## Not done (known gaps, in priority order)

1. **Typography.** iOS uses SF Pro; Android uses Roboto. This is now the biggest visible difference. SF cannot be bundled (licence); **Inter** (OFL) is the usual stand-in. It needs a font package or bundled `.ttf` files and per-weight family names on Android → **owner decision**, not made here.
2. Real blur for the tab bar / header on Android (API 31+), opaque below.
3. A drawn **date picker**, swipe actions on rows, iOS-style pull-to-refresh (Android still shows the Material refresh circle), collapsing large titles.
4. Android `formSheet` (the Gallery sheets) and predictive back were not looked at; sheets used by Account Center (`confirm-password`) are unverified on Android.
5. iOS 18, iPad, API 30 emulator, release builds: not run.
6. The Expo dev-client's floating tools button appears in every Android screenshot; it is dev-only.

## Verification evidence (2026-10-03)

- Android API 36 emulator (`Pixel_10_Pro_XL_2`), **light and dark**: Profile (grouped glass toolbar, camera menu, floating tab bar), Settings (large title, glass back button, list), Gallery (switch, sliders, stepper, spinners, progress, list, search, alert × 3, action sheet, menu); Back button cancels alerts/sheets and resolves `confirm` with `false`; no new JS warnings.
- iOS 26.5 simulator (read-only on the owner's session — screenshots and Gallery taps only): native Toggle / Slider / Stepper, system `Alert` and `ActionSheetIOS`, SwiftUI `Menu`, Profile (native toolbar, native tab bar) and a freshly opened Settings (large title + glass back) show **no regression**.
- Unit tests: 403 passing (new: dialog model, menu placement, slider math, component behaviour, token contrast incl. destructive text on dialog buttons).
