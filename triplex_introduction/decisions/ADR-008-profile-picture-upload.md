# ADR-008: Profile picture — native menu, system pickers, shrink then upload

**Date:** 2026-10-03
**Status:** Accepted (iOS 26 verified; Android and iOS 18 deferred)
**Deciders:** Project owner (asked for a camera button next to Settings with "Camera / Photos"), Claude (implementation)
**Context link:** [[ADR-006-app-shell-and-navigation]], [[ADR-007-settings-theme-and-account-changes]]

---

## Context
Flutter's profile app bar has a camera button that opens a dialog (Take Photo / Choose from Gallery / Cancel), then picks, compresses and uploads with a progress ring. Flutter declares **no camera permission**, so its camera option crashes. The owner asked for the same feature as a toolbar button next to Settings showing "Camera" and "Photos". (This pulls the *avatar change* part of Task 9 forward.)

## Decision
1. **A native toolbar menu, not a dialog.** `Stack.Toolbar.Menu` (camera glyph) with two `MenuAction`s — Camera, Photos — drawn by iOS as a real glass menu from the button. Placed before Settings, as in Flutter. Disabled while an upload runs.
2. **System pickers (`expo-image-picker`).** *Photos* = PHPicker: runs out of process and needs **no photo-library permission** (iOS shows "Private Access to Photos"). *Camera* needs permission: the refusal is mapped to a warning toast with a **Settings** action; a device with no camera (the simulator throws) gets an info toast pointing to Photos instead of a crash.
3. **Usage strings are declared through the config plugin** (`app.config.ts`: camera + photos text, microphone off). **A plugin change needs `npx expo prebuild --platform ios` before `run:ios`** — without it the build had no `NSCameraUsageDescription` and *Camera* crashed the app (found on device; documented in the README).
4. **Shrink before upload** (`expo-image-manipulator`): longest side ≤ 1280 px, JPEG quality 0.8, never enlarged. Flutter used WebP q75 ≤ 2000 px; WebP encoding on iOS is not dependable and the server re-encodes anyway (Cloudinary stored a 500×500 face-cropped JPEG from a 3000×2000 upload), so a larger file buys nothing.
5. **Upload:** `POST profile/profile-picture`, multipart field `image`, 60 s timeout, progress from `onUploadProgress`. Progress is shown **on the avatar** (dimmed, spinner, percentage; `progressbar` role for VoiceOver) from the moment the photo is being prepared.
6. **The result lands in the session and the cached user** (so it survives a restart) — unless the user signed out or changed while it uploaded, in which case it is dropped (it must not resurrect a session or rewrite the cache). One change at a time.
7. **Orchestration is a plain function** (`changeAvatar`: pick → prepare → upload → user) with injected steps, so every outcome — cancelled / denied / unavailable / failed / updated, progress always ending at `null` — is unit-tested without native modules.

## Consequences
- Two new native dependencies: `expo-image-picker`, `expo-image-manipulator` (dev client rebuilt).
- **Not implemented here:** tapping the avatar for a full-screen view (Task 7's viewer), removing a picture (no backend endpoint), Android (the toolbar *menu* icon must be an image source there; SF Symbols are dropped — TODO-001).
- The throwaway test account now has an avatar (a test-pattern image); there is no way to unset it.
