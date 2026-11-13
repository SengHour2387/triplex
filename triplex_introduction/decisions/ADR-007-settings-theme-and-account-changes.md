# ADR-007: Persisted theme, native segmented picker, and token-safe account changes

**Date:** 2026-10-03
**Status:** Accepted (iOS 26 verified; iOS 18 and Android deferred)
**Deciders:** Project owner (direction: "only debug on iOS 26"), Claude (implementation)
**Context link:** [[ADR-004-glass-surface-tiers]], [[ADR-005-rn-api-layer-and-error-model]], [[ADR-006-app-shell-and-navigation]]

---

## Context
Task 5 adds Settings (theme, sign out) and the Account Center (change username / email). Flutter lost the theme on restart, treated a *failed* username-availability check as "taken", and relied on two PUTs whose responses carry new tokens.

## Decisions

1. **Theme = `Appearance.setColorScheme` + AsyncStorage.** The choice (`light | dark | system`) is applied with one call that flips our components *and* native glass/tab bar/headers (`'unspecified'` = follow the OS in RN 0.86). It is stored with `@react-native-async-storage/async-storage` (new native dep → dev-client rebuild), **not** SecureStore: a preference is not a secret, iOS Keychain items survive uninstall, and sign-out must not wipe it. The saved value is read and applied **before the splash is hidden**, so the UI never flashes the wrong theme. *Known limit:* the native launch screen follows the OS theme (a static asset), so on a dark-choice/light-OS device the first ~2 s before JS is the light launch screen.
2. **Native segmented control for the picker.** `OptionPicker` is the first picker primitive: SwiftUI `Picker` (`segmented`) on iOS via `OptionPicker.ios.tsx` (glass on iOS 26 from the OS), and a design-system segmented control elsewhere (`OptionPicker.tsx`, unverified on Android). Segmented rather than Flutter's popup menu: three mutually exclusive options are the textbook segmented case and show the current value without a tap. *Limit:* the system segmented control does not grow with Dynamic Type.
3. **Password in a native sheet, and the sheet performs the save.** Email changes need the password. The drafts travel as route params; the sheet re-diffs against the *current* user at submit time, so after a partial failure a retry sends only what is still outstanding, and the password never lives in the Account screen's state. The sheet blocks swipe-dismiss while saving.
4. **Token rotation is part of the API call, not the UI.** `AccountApi` stores the returned access+refresh pair (and the user) **before returning**; the response schema *requires* both tokens. Without it the server-revoked old refresh token would sign the user out at the next refresh. Proven with the real interceptor against a scripted server (`accountApi.test.ts`, mutation-checked) and on device (relaunch after a change stays signed in).
5. **Order and partial failure.** Username first, then email; stop at the first failure. If the username succeeded and the email did not, the message says so ("Your username was changed, but your email was not. …") and the session already carries the new username.
6. **Availability check semantics.** 400 ms debounce; invalid names are decided locally with no request; every keystroke aborts the request in flight and an answer is only used while it is still about the name in the box. **A failed check is `unverified`, not `taken`** (Flutter said "taken" when offline); Save stays allowed because the server rejects a taken name anyway.
7. **The session is the single source of truth for the signed-in user.** The profile query writes into it and account edits update it; the Me tab reads only the session (preferring query data showed a stale name after a change).

## Consequences
- Sign-out leaves the theme alone by design.
- `Screen` gains `keyboardInsets` (default on). Screens without inputs (Me, Settings) turn it off: a screen kept mounted under another one still reacted to that screen's keyboard and stayed scrolled afterwards (found on device).
- Avatar upload, name/phone editing and the follower counts are not part of this task.
