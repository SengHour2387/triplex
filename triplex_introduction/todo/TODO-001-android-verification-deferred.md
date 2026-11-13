# TODO-001: Android verification & Android glass (deferred by owner)

**Date Created:** 2026-10-03
**Created By:** agent (at the owner's instruction: "debug on iOS only")
**Status:** In progress — the owner re-opened Android on 2026-10-03 ("make Android as close to iOS 26 as possible"); the look is done and verified on an emulator, the rest below is still open
**Affects:** triplex_expo — design system, every feature task
**Priority:** High (must be done before any release; blocks Task 6)

---

## Goal
Bring Android to the same standard as iOS in the React Native app. The owner narrowed scope to iOS-only debugging on 2026-10-02; this note keeps the debt visible.

## What is known / already done
- Android dev build compiled, installed and ran on an API 36 emulator (Task 0, 2026-10-02): boots, no JS warnings, cleartext HTTP to `10.0.2.2` works in debug.
- Android release build was started and stopped before finishing — **no release build has ever completed**.
- Android code paths exist (`Icon.tsx` Material glyphs, `Glass` `frosted` mode) but have **never been looked at on Android**.

## Acceptance Criteria
- [ ] Every shipped screen verified on an Android emulator (API 36) **and** an API 30 AVD (no efficient blur).
- [ ] Real blur for tier C: `expo-blur` + `BlurTargetView` on API ≥ 31, opaque below; reviewed by eye; no stock-Material look.
- [ ] Decide on third-party AGSL glass libraries against: maintained / New-Architecture safe / mid-range perf / licence.
- [ ] Android sheets: `formSheet` on Android allows ≤ 3 detents, no native header (we draw our own — OK), and `FullWindowOverlay` is iOS-only (the toast falls back to a normal overlay, which a native Android sheet may cover — **check**).
- [ ] Android tab bar decision (restyled `NativeTabs` vs custom) — Task 4 shipped iOS-only (ADR-006); the Android bar, predictive back and Android deep links are still undecided/unverified. The iOS prototype exists in `app/gallery-tabs/`; the same `NativeTabs` already declares Material Symbol icons (`md=`) but has **never been run on Android**. Android limits: ≤ 5 tabs, Material styling only (`backgroundColor`, `tintColor`, `labelStyle`, `indicatorColor`).
- [ ] Release-configuration builds compile on both platforms.
- [ ] Android env needs written down (done in README): `ANDROID_HOME`, JDK 17, AVD name for `-d`.

## Notes
- Same app ID as the Flutter app: Flutter and RN debug builds can't coexist on one device (signature mismatch). See `MIGRATION_PLAN.md` Task 6 on upload-key continuity.

## Progress Log
- 2026-10-03: **Task 7 (Feed & posts) added a lot of unverified Android surface** — everything was written to run on both platforms and the lint guard rails hold, but only iOS 26.5 was run (owner: "debug and test on iOS 26 only"). To check on the emulator: the feed list + native-tab-less scroll (the drawn tab bar, `useScrollInsets`), the photo carousel and `expo-image` caching, the long-press reaction bar in a `Modal` (does the Android Modal cover `ToastHost`?), the reactions + repost `formSheet`s (≤ 3 detents; the two-children / `collapsable` rule in ADR-010), the photo viewer (`BlurView` backdrop needs `BlurTargetView` on API 31+ — currently a plain dim on Android; gesture-handler pinch / pan / drag-to-dismiss inside a transparent modal needs its `GestureHandlerRootView`, which the viewer has), `triplex://post/<id>` as an Android deep link, smooth scrolling on a mid-range profile (plan acceptance), TalkBack custom actions on the heart.
- 2026-10-03 (owner: "create custom views for Android, as close to iOS 26 as possible"): **adaptive control set built and verified on the API 36 emulator, light + dark** — see [[decisions/ADR-009-adaptive-controls-ios-native-android-drawn]]. Done: drawn header (circular glass back, centred / large title, grouped glass toolbar capsule), drawn floating glass tab bar (`AppTabs`; replaces the Material `NativeTabs` bar on Android — the "restyled NativeTabs vs custom" decision above is now **custom**), `Switch` / `Slider` / `Stepper` / `Spinner`, `Menu`, `showAlert` / `showActionSheet` / `confirm` (+ `DialogHost`), inset-grouped `List`, `SearchField`, `ProgressBar`; Android toolbar icons no longer rely on `useToolbarIcon` bitmaps (`Toolbar` draws them). Tuned against the real iOS 26.5 controls. Still open from the acceptance list: real blur (`BlurTargetView`, API 31+) — overlays are opaque meanwhile; API 30 AVD; `formSheet` / `confirm-password` sheet on Android; toast vs Modal stacking; predictive back; Android deep links; release-configuration builds; and the font (Roboto vs SF → owner decision, see the ADR).
- 2026-10-03: **Android toolbar icons fixed.** Android's native header toolbar accepts only image sources, so the SF-Symbol-only buttons were invisible. `useToolbarIcon({ sf, md })` (design system; `.ios` returns the SF Symbol, the default file renders the Material glyph to a bitmap in the text colour via `MaterialIcons.getImageSource`) now feeds the Profile camera menu + Settings button and Settings' back button. Verified on the Pixel emulator (light): icons show, the camera menu lists Camera / Photos with icons, Settings has a back arrow. Not yet checked: dark mode icon colour on Android, the Camera / Photos actions themselves, the bitmap's first-frame delay.
- 2026-10-03: **Android top/bottom padding fixed** (owner's report: content under the status bar / transparent header). `Screen scroll` now pads its *content container* on Android only — `insets.top` (+ 56 dp app bar when the screen has `underHeader`) and `insets.bottom` — so scrolling stays edge to edge (content slides under the system bars) while starting clear of them. iOS gets no extra padding (UIKit handles it; padding it too double-counts — same finding as ADR-004). Pinned by `screen.test.ts`; verified on the Pixel emulator (Profile, Settings, Account Center) and unchanged on iOS 26.5. Still open on Android: no icon on the Profile toolbar buttons / Settings back button (SF Symbols are dropped), `Glass` card is invisible on the near-white canvas, the 56 dp header height is a constant (fine for the stock native header).
- 2026-10-03 (owner: "build android"): Android dev client **rebuilt** after `npx expo prebuild --platform android` (JDK 17 = JBR 17.0.14, `ANDROID_HOME=~/Library/Android/sdk`, AVD `Pixel_10_Pro_XL_2`, `npx expo run:android -d Pixel_10_Pro_XL_2 --no-bundler`; 1m32s). The previous build (09:03, Task 0) lacked every native module added since — it crashed on `ExpoNetwork`. After the rebuild it boots to the login screen with no JS errors; the APK declares `CAMERA`, `READ_EXTERNAL_STORAGE` (≤ API 32), `INTERNET`, and no microphone. Needs `adb reverse tcp:8081 tcp:8081 && adb reverse tcp:3000 tcp:3000`. **Nothing beyond "boots to login" has been verified on Android** — every acceptance item above is still open.
- 2026-10-03: Avatar change added (ADR-008). Android unknowns: `Stack.Toolbar.Menu` needs an *image source* icon on Android (SF Symbols are dropped, so the camera button would have no glyph), camera permission flow, `expo-image-picker` on API 30/36. iOS 18: the same menu + picker.
- 2026-10-03: Task 5 added more unverified Android/iOS 18 surface: `OptionPicker.tsx` (non-iOS segmented control), the password formSheet + keyboard on Android, AsyncStorage theme persistence, Account Center. Same for iOS 18: the SwiftUI segmented picker and the password sheet.
- 2026-10-03: Owner narrowed iOS verification further: "only debug on iOS 26". iOS 18 re-checks are now also skipped; Task 4 closed on iOS 26.5 only. Debt: iOS 18, Android, iPad.
- 2026-10-03: Created. Nothing done yet beyond the Task 0 dev-build check.
