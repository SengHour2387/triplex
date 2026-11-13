# ADR-006: App shell — native tabs, per-tab stacks, settings as its own stack

**Date:** 2026-10-03
**Status:** Accepted (iOS 26 verified; iOS 18 and Android deferred)
**Deciders:** Project owner (direction: "from now on only debug on iOS 26"), Claude (implementation)
**Context link:** [[ADR-003-migrate-flutter-to-react-native-expo]], [[ADR-004-glass-surface-tiers]]

---

## Context
Task 4 builds the container every feature lives in. Flutter had `StatefulShellRoute.indexedStack` with 5 tabs (Home and Messages are stubs) and a separate settings shell. The plan registers only tabs for *finished* features, so today the shell has one tab: **Profile**.

## Decision

```
app/
  _layout.tsx          Stack. Protected(signedIn): (tabs), settings. anchor = (tabs)
  (tabs)/_layout.tsx   NativeTabs  → real Liquid Glass bar on iOS 26 (UIKit bar below)
  (tabs)/(profile)/    Stack with an inline "Profile" header + Settings button → index = Profile
  settings/            Stack presented over the tabs (no tab bar) → index = Settings
```

1. **`NativeTabs`, not a custom bar, on iOS.** The OS draws the glass bar, minimize-on-scroll and the selected-pill animation. (Android's bar is still undecided — TODO-001.)
2. **Every tab owns a `Stack`.** The tab keeps its place when you switch away, and pushes happen inside the tab. New tabs (Feed, Create) add their own `(name)/_layout.tsx`.
3. **Settings is a separate root-level stack**, like Flutter's settings shell: it covers the tab bar and later gains Account center screens.
4. **`unstable_settings.anchor = '(tabs)'`** so a deep link that lands on `triplex://settings` still has the tabs underneath and Back returns to Me.
5. **Large-title transparent headers via one hook** (`useStackScreenOptions`). It sets the title colour explicitly — left to the system, the title kept the launch scheme's colour and was dark grey on black after switching to dark mode (found on device).
6. **The first screen of a nested stack has no automatic back button** (its parent is a different navigator), so Settings draws a native glass `Stack.Toolbar.Button` for it. Edge-swipe back works natively.
7. **Profile tab = Flutter's profile layout** (owner correction, 2026-10-03): inline centred "Profile" title; a camera button (change profile picture — see [[ADR-008-profile-picture-upload]]) and Settings as native glass toolbar buttons at the top right; one centred glass card — avatar (92 pt; a person glyph on a faint primary tint when there is no photo), **username** in bold (not the display name — as in Flutter), email. *(Owner later removed Flutter's "Edit Profile & Settings" button from the card: Settings is the toolbar button.)* Pull to refresh; error state "Can't get user info" + Retry. Data: `GET profile/me` through TanStack Query, seeded from the signed-in session user so it renders instantly and offline; a failed refresh keeps the saved user and shows an inline notice. Fresh data is written back to the auth store (`updateUser`).
8. **Deliberately not on the card yet** (they need features that don't exist in the RN app, and a "0 Posts" chip would be false data): the Posts / Drafts stat chips and the Posts / Drafts segmented list (Tasks 9 and 12), and tapping the avatar for a full-screen view (Task 7's image viewer).

## Consequences
- A tab bar with a single tab looks sparse. That is deliberate (plan §5: no stub tabs); it fills out in Tasks 7 and 10.
- Avatar uses React Native's `Image` (no new native dependency). Revisit with `expo-image` when images matter (Task 7).
- Deep link while **signed out** is not verified on device: `Stack.Protected` should send the user to login (the link target is not remembered after sign-in).
- Android tab bar, predictive back and iOS 18 behaviour: **not verified** (TODO-001).
