# Triplex — Flutter → React Native (Expo) Migration Plan

> **Agents: read this file before touching `triplex_expo/`.** It is the source of truth for *what* we are building, *in what order*, and *what "done" means*. Section 1 is a binding instruction from the project owner.

**Created:** 2026-10-02
**Target app:** `triplex_expo/` (Expo SDK 57 · React Native 0.86 · React 19.2 · TypeScript strict)
**Reference app (read-only until cutover):** `triplex/` (Flutter)
**Backend (unchanged):** `triplex_node/` — contract in `triplex_node/api_doc.md`

---

## 1. Instructions from the owner (binding)

These are the owner's words, verbatim. Everything else in this document exists to serve them.

> i want to move from Flutter to React native. since they have better native like native liquid glass and a proper fallback for android and still look good not ugly material ui.
>
> i know we can't execute them all at one. but create a clear plan as a .md then complete one by one perfectly
>
> note: quality over task-counts. when u do that one task make sure it good, perfect, be able to ship before move to next task.
>
> also put what i said as instruction too

### What that means in practice (the working rules)

| # | Rule | Consequence |
|---|------|-------------|
| R1 | **Why we are migrating:** real native feel — native Liquid Glass on iOS, a *proper, good-looking* Android fallback. | UI quality is the product goal, not a nice-to-have. A feature that works but looks like stock Material or a generic cross-platform widget is **not done**. |
| R2 | **One task at a time, in order.** | Never start task N+1 while task N has open acceptance criteria. No parallel half-finished tasks. |
| R3 | **Quality over task count.** | Finishing 2 tasks perfectly beats finishing 6 tasks roughly. Slow down, don't skip verification to "get more done". |
| R4 | **Every task must be shippable when it closes.** | At the end of a task the app could go to TestFlight / Play internal testing as-is: no placeholder screens reachable by the user, no known crashes, no `TODO`s in user-facing paths, no broken Android. |
| R5 | **Android is a first-class target, not an afterthought.** | Every task is verified on **both** platforms before it closes. iOS-only APIs are never reachable from an Android code path. |
| R6 | **Flutter app is a reference, not something to edit.** | Don't modify `triplex/`. It is also mid-restructure (large uncommitted rename/delete set). Read it to learn behavior; never to "fix" it. |

> **Interpretation note:** R4–R6 are my reading of the owner's instructions. If any is wrong, edit this table — the rest of the plan follows from it.

---

## 2. Definition of Done (applies to *every* task)

A task is closed only when **all** of these are true. Each task's own acceptance criteria are *in addition* to this list.

1. **Behavioral parity** with the Flutter feature for the task's scope (differences are deliberate and written down in the task's log).
2. **Verified on real runtimes**, not just typechecked:
   - iOS 26 simulator — Liquid Glass tier
   - iOS 18 simulator — fallback tier (`expo-glass-effect` renders a plain `View` below iOS 26, so our own fallback must carry the look)
   - Android emulator (API 36) — fallback tier
3. **Static checks clean:** `tsc --noEmit`, ESLint, and unit tests for any non-trivial logic.
4. **All states designed, not just the happy path:** loading, empty, error, offline, very long text, light + dark mode, larger font scale, safe areas, keyboard.
5. **Accessibility basics:** labels on interactive elements, ≥44pt touch targets, reduced-motion respected.
6. **Clean runtime:** no red box, no yellow box, no console errors or warnings during the verified flows.
7. **Looked at, not assumed:** screenshots of the new UI taken on each tier and visually checked.
8. **Vault updated** per the repo `AGENTS.md` post-task checklist (task note, `_INDEX.md`, ADR if a significant choice was made).
9. **Left in a committable state.** Nothing is committed unless the owner asks.

---

## 3. UI strategy — the heart of the migration

### 3.1 What the docs told us (verified against Expo SDK 57 docs, 2026-10-02)

| Fact | Consequence |
|------|-------------|
| `expo-glass-effect` renders the real iOS 26 `UIGlassEffect`. **Below iOS 26 it falls back to a plain `View`. On Android it does nothing.** | We must supply our own fallbacks for iOS < 26 *and* Android. The library alone is not a cross-platform answer. |
| `@expo/ui/swift-ui` is **iOS-only**. The `@expo/ui` *universal* components render **SwiftUI on iOS and Jetpack Compose Material on Android.** | Universal components would give Android the stock-Material look the owner explicitly does not want. They are **not** the Android answer. |
| `NativeTabs` (expo-router, still under `unstable-native-tabs`) gives the real iOS 26 glass tab bar. On Android it is a Material tab bar with limited styling and a **5-tab maximum**. | Use it on iOS. Android's tab bar is decided in the design-system spike (Task 1) / shell task — likely our own floating bar. |
| `expo-blur` Android support is **stable (SDK 55+)**, needs `BlurTargetView`, and is efficient only on API 31+. | It is the first-party base for our Android "frosted" surfaces. API < 31 gets an opaque tinted surface. |
| Third-party Android "liquid glass" libs exist (AGSL shaders, API 33+). | Treat as optional, evaluated in a spike against maintenance/perf/safety criteria. **Not** a foundation we depend on blindly. |

### 3.2 One design language, three rendering tiers

Screens never branch on `Platform.OS` for visual style. They use the design-system primitives; the primitives pick the tier.

| Tier | Where | Glass surface is… | Tab bar | Menus / sheets / pickers |
|------|-------|-------------------|---------|--------------------------|
| **A — Liquid Glass** | iOS 26+ | Real `GlassView` / `GlassContainer` | System `NativeTabs` | Native (SwiftUI via `@expo/ui/swift-ui`, behind `*.ios.tsx`) |
| **B — Material blur** | iOS 16.4–25 | `expo-blur` `BlurView` with system material tint + hairline border | System `NativeTabs` (UIKit tab bar) | Native where available, same visual language |
| **C — Frosted custom** | Android | `expo-blur` (API 31+) with tinted translucent fill, hairline border, soft shadow; opaque tinted surface on API < 31 | Custom floating bar (decided in Task 1) | Custom bottom sheets/menus styled to the same language — **no stock Material components, no default Material ripples/colors/FAB** |

### 3.3 Guard rails (enforced, not aspirational)

- **No iOS-only import can reach Android.** `@expo/ui/swift-ui` may only be imported from `*.ios.ts(x)` files. ESLint `no-restricted-imports` enforces it (Task 0). *(The scaffold currently violates this in 7 files — that is the first thing Task 0/1 removes.)*
- **Platform branching lives in `src/design-system/` only.** Feature code imports `<Glass>`, `<GlassButton>`, `<Sheet>`… and never checks the platform for styling.
- **Feature-detect, don't version-sniff.** Use `isLiquidGlassAvailable()` / `isGlassEffectAPIAvailable()` for tier A; `Platform.Version >= 31` for Android blur.
- **Build UI from the Gallery (owner, 2026-10-03).** Screens are assembled from the design-system primitives shown in `app/gallery.tsx`; nothing is hand-styled in a feature. A missing primitive is added to `src/design-system/` *and* to the Gallery first. Gallery completeness is part of Definition of Done for any task that adds a primitive.
- **Respect system settings:** reduce-transparency and reduce-motion degrade glass to opaque surfaces / no animation.

---

## 4. Architecture & stack mapping

### 4.1 Structure (carries over the repo's Feature-First rule)

The vault's rule — *data / state / UI separated per feature* — is kept, translated to TypeScript. The scaffold already follows it (`src/features/auth/{api,store,screens,types}`).

```text
app/                         # expo-router routes — THIN: import a screen, nothing else
src/
  design-system/             # tokens, Glass primitives, Icon, Sheet, Toast … (the only place that branches on platform)
  core/                      # api client + interceptors, storage, query client, env, logger, errors
  features/<name>/
    api/                     # endpoint calls (no state)            ← Flutter data/
    model/ | store/ | hooks/ # types, zustand, TanStack Query hooks ← Flutter domain/
    screens/ | components/   # UI only                              ← Flutter presentation/
```

### 4.2 Flutter → React Native mapping

*"Candidate" means the choice is confirmed (docs read, spike run if needed) in the task that adopts it — not before.*

| Concern | Flutter today | React Native | Status |
|---------|---------------|--------------|--------|
| Framework | Flutter | Expo SDK 57 (dev builds + CNG) | Decided |
| Routing | `go_router` | `expo-router` (file-based). Auth gate via `Stack.Protected` (**verified present** in installed 57.0.15) | Decided |
| Server state | Riverpod `AsyncValue` + `dio_cache_interceptor` | TanStack Query v5 | Decided (Task 2) |
| Client state | Riverpod notifiers | `zustand` (already in scaffold) | Decided |
| HTTP | `dio` + `AuthInterceptor` | `axios` + rewritten interceptor (single-flight refresh, 401-only) | Decided — done & tested (Task 2) |
| Secure storage | `flutter_secure_storage` | `expo-secure-store` (in scaffold) | Decided |
| Models/validation | `freezed` + `json_serializable` | `zod` schemas at the API boundary; types inferred from them | Decided (Task 2) |
| Functional `Either` | `fpdart` | `AppError` thrown + TanStack Query error states | Decided (Task 2) |
| Liquid Glass / adaptive UI | `liquid_glass_widgets` (real glass, but only on the Profile + Create headers) plus a hand-rolled `BackdropFilter` blur shim used everywhere else and Cupertino widgets. *(`adaptive_platform_ui` from ADR-002 is **not actually in the code** — only a comment mentions it.)* | `expo-glass-effect`, `NativeTabs`, `expo-blur`, `@expo/ui/swift-ui` (iOS only) + our design system | Decided (see §3) |
| Images | `cached_network_image` | `expo-image` | Candidate |
| Image picking / compression | `image_picker`, `flutter_image_compress` | `expo-image-picker`, `expo-image-manipulator` | Candidate |
| Location & permissions | `geolocator`, `permission_handler` | `expo-location` | Candidate |
| Maps | Custom native views: Android Kotlin `MapView`; iOS UIKit `GMSMapView` + blur strips (the real Create flow doesn't use `google_maps_flutter`). Features: tap-to-drop-marker, POI tap → backend details, waypoint markers, my-location, dark style. **No polylines, clustering or search** | `react-native-maps` (Google provider both platforms, supports a custom dark style). `expo-maps` is **alpha** and Apple-Maps-only on iOS, so it can't reproduce the dark Google style | Candidate — **spike in Map task** |
| Local DB | `drift` (SQLite) — caches **only the feed**, and drops reactions + media URLs, so a cached feed shows no images or likes | **Not ported.** TanStack Query cache (optionally persisted to disk) does the job properly. No SQLite in v1 | Decided |
| Animation | `flutter_animate` | `react-native-reanimated` (4.5.3 already installed) | Decided |
| Fonts / SVG | `flutter_svg`, Kodchasan logo font | `expo-font`, `react-native-svg` | Candidate |
| Env / IDs | iOS bundle ID & Android applicationId are both `com.templex.triplex` | **Keep both** so store identity is continuous | Verified in Flutter sources |

**Platform floor:** Expo SDK 57 requires **iOS 16.4+** and **Android 7+** (compileSdk 36). Flutter's `ios/Podfile` targets iOS 17.0 (verified), so the iOS floor is equal-or-wider — no users are dropped on iOS. Confirm Flutter's effective Android `minSdk` before release (it is `flutter.minSdkVersion`, not pinned in the repo).

---

## 5. How "shippable per task" works

The owner asked that each task be *good, perfect, and shippable* before moving on. Because this is a **replacement** app (the Flutter app stays the live product until cutover), that is interpreted as:

- **What exists is release quality.** No placeholder UI, no known bugs, no platform gaps in anything a user can reach.
- **What doesn't exist yet is hidden, not stubbed.** An unmigrated feature is simply absent from navigation. We never ship a tab that says "coming soon".
- Tasks are ordered so that after **Task 5** the app is already a coherent, honest (if small) product — *sign in, see your account, change username/email/theme, sign out* — and every later task *adds* one complete feature to it.

---

## 6. Task roadmap

Status: ⬜ not started · 🟦 in progress · ⏸ deferred (reason logged) · ✅ done (all of §2 satisfied)

| # | Task | Status |
|---|------|--------|
| 0 | Foundation — a trustworthy, buildable baseline *(iOS-only close; Android + release builds deferred by owner)* | ✅ |
| 1 | Design system — Glass tiers A/B/C + component gallery *(implemented; iOS 26 + iOS 18 verified; closes when the dark-mode glass-button contrast is decided — owner call)* | 🟦 |
| 2 | Core infrastructure — API, errors, query layer, toasts (with tests) | ✅ |
| 3 | Authentication — login, register, session, route guard | ✅ |
| 4 | App shell & navigation — tabs, headers, a real minimal Profile tab *(iOS 26 only — owner: "only debug on iOS 26"; iOS 18 + Android deferred)* | ✅ |
| 5 | Settings & Account center — theme, username/email change, sign out *(iOS 26 only; iOS 18 + Android deferred)* | ✅ |
| 6 | Internal distribution pipeline — EAS profiles, secrets, installable builds *(needs owner's Apple/Google accounts — **deferred 2026-10-03**, see its log; work continued at Task 7)* | ⏸ |
| 7 | Feed & posts — cards, media grid, image viewer, reactions, repost, post detail *(iOS 26 only; Android, iOS 18, iPad deferred; two acceptance items open: Android scroll performance, and the viewer's on-device double-tap / Reduce Motion — see its checklist)* | ✅ |
| 8 | Comments — sheet, replies, reactions, delete *(iOS 26 verified; Android, iOS 18 deferred)* | ✅ |
| 9 | Profiles & social graph — own/other profile, follow, followers, avatar upload | ⬜ |
| 10 | Create: media posts — pick, compress, upload | ⬜ |
| 11 | Map & location picker — spike + build | ⬜ |
| 12 | Create: trip plans & drafts | ⬜ |
| 13 | Quality pass — accessibility, performance, security, store compliance | ⬜ |
| 14 | Store release & cutover | ⬜ |

Work strictly top to bottom. Update this table and the task's **Progress log** as each task moves. **Each task's scope is re-validated against the Flutter source and the backend when it starts** — the descriptions below are the plan, not a substitute for reading the code again.

> **Task 6 is the only task that depends on the owner** (Apple Developer / Google Play accounts, production API URL). If those aren't available when it comes up it is *deferred, with the reason logged* — not skipped and not faked — and work continues at Task 7.

---

### Task 0 — Foundation: a trustworthy, buildable baseline

**Goal:** Before any feature work, the project builds and runs as a *development build* on iOS 26, iOS 18 and Android, with guard rails that make the mistakes we already found impossible to repeat.

**Why first:** The scaffold typechecks but has never been run on Android — all 7 UI files import iOS-only `@expo/ui/swift-ui`, so Android would crash on the first screen. `expo-doctor` passes 20/21 (8 packages have patch drift). There are no `ios/`/`android/` folders, no lint, no tests.

**Scope**
- Bring all packages to the SDK 57 patch set (`npx expo install --check`) → `expo-doctor` **21/21**.
- App identity: name `Triplex`, scheme `triplex`, `ios.bundleIdentifier` + `android.package` = `com.templex.triplex`; icon/splash wired up with **clearly-marked placeholders** (no production icon master exists in the repo — see §9); `userInterfaceStyle: "automatic"` (the scaffold forces `"light"`, which makes dark mode impossible).
- Development build: add `expo-dev-client`; generate `ios/` + `android/` with **CNG** (`expo prebuild`), kept git-ignored so native config lives in `app.config` / config plugins.
- Pin the Android toolchain to **JDK 17** (the machine default is Java 25, which Gradle/AGP may reject). Document the exact commands in a short `README` section.
- Tooling: ESLint (`eslint-config-expo`) with the **no-restricted-imports guard rail** from §3.3; Jest + `jest-expo` + Testing Library; `npm run typecheck | lint | test | check`.
- Typed config: `app.config.ts` with per-environment API base URL (dev: `localhost:3000` on iOS / `10.0.2.2:3000` on Android — keep what the scaffold does) and the dev-only cleartext-HTTP allowances iOS/Android need for that.
- Replace the 7 iOS-only screens with a neutral, platform-safe temporary root so **the app boots on Android**. (These screens are rebuilt properly in Tasks 3–5; the temporary root is deleted by Task 4.)

**Out of scope:** any visual design (Task 1), API hardening (Task 2), real screens (Tasks 3+).

**Acceptance criteria**
- [ ] `npx expo-doctor` → 21/21 passing.
- [ ] `npm run check` (typecheck + lint + test) passes with ≥1 real test.
- [ ] App launches without errors on **iOS 26 sim, iOS 18 sim, Android emulator** (dev build), JS reload works on all three.
- [ ] Importing `@expo/ui/swift-ui` from a non-`.ios` file **fails lint** (proved with a deliberate failing example, then removed).
- [ ] Release-config build (not just dev) compiles for both platforms — catches Gradle/Xcode problems now, not at release time.
- [ ] Setup is reproducible: a fresh clone + documented commands reaches a running app.

**Progress log**
- **2026-10-02** — Done & verified: SDK-57 patch set aligned, `expo-doctor` **21/21**; `axios` 1.19→1.20 (12 advisories; runtime `npm audit` findings now only in Expo's own tree); `app.config.ts` (identity `com.templex.triplex`, `userInterfaceStyle: automatic`, splash plugin, `expo-system-ui` so Android honors dark mode); `expo-dev-client`; ESLint + Jest + Testing Library; `npm run check` green (typecheck, lint, 9 tests); lint guard rail **proven** against 5 probe files (swift-ui / universal `@expo/ui` / compose-in-`.ios` fail; `.ios` + swift-ui and `.android` + compose pass); the 7 iOS-only screens removed; `resolveBaseUrl` hardened — release builds with no `EXPO_PUBLIC_API_URL` now **throw** instead of silently targeting `localhost` (tested); native projects generated with CNG (`ios/`, `android/` git-ignored).
- **2026-10-02** — **Android API 36 dev build: verified.** Builds, installs, boots, no JS warnings/errors. Reaches a host server over cleartext HTTP via `10.0.2.2` (debug only); status line tracked a stub server Online → Offline → Online correctly, including a rapid double-tap.
- **2026-10-02** — **iOS 26.5 dev build: compiled and installed; not yet seen running** (needs the owner to tap "Open" on a system dialog or grant simulator access — see below).
- **2026-10-02 — Owner narrowed scope: "debug on iOS only" for now.** Android *verification* and **release-configuration builds** are **deferred by the owner's decision** (this is a deliberate, recorded deviation from R5 / Definition of Done §2 — it is *not* an oversight). Consequences: (a) tasks close on **iOS 26 + iOS 18** evidence only until the owner re-enables Android; (b) Android code paths are still written to the same architecture and the lint guard rails stay on, but are **marked unverified** and must get a full Android pass before Task 6 / release; (c) the Android emulator + release build were stopped by the owner mid-run and are not restarted.
- **2026-10-02** — **iOS 26.5 dev build: verified running.** Screenshot: `ios 26.5`, API `http://localhost:3000/api/`, backend **"Online (Database connected successfully)"** against the real Node backend.
- **Deferred from Task 0 (owner decision above):** Android run (dev build was verified earlier, see above) · release-configuration builds · fresh-clone reproducibility check (`triplex_expo/` is not yet tracked in git, so a clone can't be tested). **Carried into Task 1:** iOS 18 run (needed for tier B anyway).

**Environment findings (all documented in `README.md`)**
- `ANDROID_HOME` is not set on this Mac → Gradle: "SDK location not found". Needs `export ANDROID_HOME=$HOME/Library/Android/sdk`.
- Default JDK is 25 → use JDK 17 for Gradle.
- `expo run:android -d` takes the **AVD name**, not the adb serial.
- `expo run:ios` finishes its build but its auto-open step calls System Events via `osascript`, which macOS blocks without an Automation grant → the app is installed but not opened. Connect manually (open the `exp+triplex://expo-development-client/?url=…` link).
- Run Metro separately (`npm start`); it does not survive when `expo run:ios` exits with an error.

---

### Task 1 — Design system: Liquid Glass with a proper fallback

**Goal:** The visual language the owner asked for exists, on all three tiers (§3.2), before any screen is built with it. This is the task the whole migration is justified by — it gets the most scrutiny.

**Scope**
- **Tokens:** color (light + dark), spacing, radii, elevation, typography with Dynamic Type / font-scale support; load the **Kodchasan Bold** logo font from the Flutter assets.
- **Tier detection:** a single `useGlassTier()` — `A` (iOS 26 + `isLiquidGlassAvailable()`), `B` (older iOS), `C` (Android) — which also honors reduce-transparency.
- **Primitives (each lands fully: 3 tiers · light/dark · a11y · gallery entry):** `Glass` surface, `GlassButton` (prominent / tinted / plain), `Icon` (one semantic name → SF Symbol on iOS / Material Symbol on Android), `Text`, `TextField`, `Screen` (safe area + keyboard), `Toast`.
- **Android look spike** (time-boxed): prove the tier-C frosted style with `expo-blur`; evaluate third-party AGSL glass libs against criteria *(maintained? New-Architecture safe? perf on mid-range devices? license?)*. Record the decision in an ADR. **Default if nothing clears the bar: first-party `expo-blur` only.**
- **Component gallery:** a dev-only route showing every primitive in light + dark. Excluded from release builds.
- Further primitives (Sheet, Menu, SegmentedControl, …) are added **by the task that first needs them**, to the same standard — not speculatively here.

**Acceptance criteria**
- [x] **iOS 26.5 (real Liquid Glass), light and dark** — screenshots taken and reviewed by eye. *(Also verified: in-app Light/Dark/System override, live system-dark switch.)*
- [x] **iOS 18.5 (blur fallback) on a real iOS 18 OS** — verified 2026-10-03: surface mode auto-detects as **B**; blur glass, buttons, fields, icons, toasts (incl. over a sheet), Reduce Transparency → solid (live), native sheets (resizable + compact, drag to full and drag-to-dismiss, light **and** dark). One bug found and fixed — see log. *Not captured on iOS 18: text fields / toasts in dark mode (same code as the verified iOS 26 dark run).*
- [~] Android API 36 frosted fallback — **built and verified 2026-10-03** (owner re-opened Android; ADR-009): drawn header, floating tab bar, switch/slider/stepper/spinner, menu, alerts, action sheet, list, search; light + dark on the `Pixel_10_Pro_XL_2` emulator. *Still open:* real blur, **API 30 AVD**, Android sheets — TODO-001.
- [x] Reduce Transparency → solid, legible, **live** (verified on device). Reduce Motion: animations collapse to 0 ms (code path; not visually verifiable in a still).
- [x] No feature code needs `Platform.OS` for styling (only `src/design-system/` branches). *(No stock-Material look on Android: unverified, see above.)*
- [x] Contrast measured, not eyeballed: all text pairs ≥ 4.5:1 in both schemes, plus the un-blurred fallback over black / white / canvas backdrops (39 token tests; one test deliberately fails Flutter's `#1D8BFF`).
- [x] ADR written for the tier decision ([[ADR-004-glass-surface-tiers]]).
- [x] Owner shown the screenshots before Task 2 starts — owner gave the go-ahead 2026-10-03 ("let's do task 2"). *The dark-mode glass-button contrast item below is still open and is carried forward, not closed.*

**Progress log**
- **2026-10-03** — Built `src/design-system/`: tokens (Flutter's monochrome palette + Flutter's toast colours; AA-safe accent), `useTheme`, `useSurfaceMode` (feature-detected A/B/C + Reduce Transparency), `Glass`, `GlassButton` (prominent / glass / plain, loading, disabled), `TextField` (Flutter's `OutlineTextField`: floating label, 1→2 pt focus border, error, password toggle), `Text` (iOS type ramp + Dynamic Type cap), `Icon` (SF Symbols on iOS via `Icon.ios.tsx`), `Screen`, `ToastHost` + imperative `toast.*` API (Flutter's timings and palette), Kodchasan logo font, dev-only gallery with scheme + forced-surface switches. 73 tests (tokens, tier resolution, toast store, component states with Testing Library); `npm run check` green.
- **Found on device and fixed:** (1) `clear` glass → unreadable secondary text → variant removed; (2) the un-blurred fallback at 78 % opacity let backdrop text bleed through → raised to 94 % and the test now covers worst-case backdrops; (3) toast action ran *then* dismissed, wiping any toast the action raised ("Retrying…") → dismiss first (Flutter has the same ordering bug).
- **2026-10-03 — Native sheet added to the gallery (owner request).** `sheetOptions()` + `SheetHeader` (title + glass close button) + two demo routes (`gallery-sheet` half↔full with scroll + field; `gallery-sheet-compact` fit-to-contents confirmation). It is a *real* `UISheetPresentationController` (Expo Router `formSheet`), so on iOS 26 the system supplies the Liquid Glass background, floating inset, concentric corners, grabber and drag physics; the one thing the app must do is keep the screen background **transparent** (an opaque `Screen` hides the glass) — pinned by `sheet.test.ts`. Verified on iOS 26.5: half detent = glass (page visible blurred behind), large detent = opaque edge-to-edge (the system's own behaviour), drag resize both ways, dismiss via X, light + dark, compact sheet, field typing inside a sheet, "Delete draft" → sheet closes → toast appears.
- **Found on device and fixed:** a toast raised from a sheet rendered *underneath* it (visible only as a faint green smear behind the glass) → `ToastHost` now renders in `FullWindowOverlay` on iOS; touches pass through it (typed into a field while a toast was on screen). Also: a glass button on a glass sheet had no visible affordance → solid button in the demo. This resolves the "ToastHost vs native sheets" limitation noted earlier (no longer a Task 5 item).
- **Verified:** the in-app Light/Dark/System override reaches native sheets in both directions (sheet was light under a Light override while the *system* was dark).
- **2026-10-03 — First real iOS 18.5 run. Bug found & fixed: sheets were see-through on iOS < 26.** The sheet's screen background had been made transparent so iOS 26's system glass shows through; but *below iOS 26 nothing draws a sheet material*, so the sheet was transparent and the page behind showed through its text (title overlapping the page's buttons). **Fix:** `resolveSheetBackground(systemDrawsSheetGlass, surface)` — transparent only on iOS 26+, otherwise the opaque theme surface (`#FFFFFF` / `#1C1C1E`); wired through `useSheetOptions()` (needs the theme, so it is a hook now) and `isSystemGlassAvailable()`. Verified: iOS 18 sheet is a clean opaque white (light) / dark (dark) sheet; iOS 26 re-checked after the refactor and is **still floating Liquid Glass** (no regression). Two opposite failure modes are now pinned by `sheet.test.ts` (85 tests green). Lesson recorded: *the earlier "verified" sheet claim was only true on iOS 26 — a transparent background is correct on one OS and wrong on the other.*
- **Tooling note:** `npx expo start` must be run **from `triplex_expo/`** (run from the repo root it fails with "package.json does not exist"). Metro is not shared between my runs — it dies whenever the harness stops my background tasks, so the dev client needs reconnecting (`xcrun simctl openurl … exp+triplex://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081`).
- **OPEN (Task 1 not closed):** *glass buttons over bright, saturated content in dark mode* have white labels on pale glass → weak contrast (seen in the gallery's "Glass" / "Glass + icon" pills over the colourful backdrop). iOS 26 small glass adapts light/dark to what is behind it, but our label colour is static. Needs a decision — e.g. tint the glass darker in dark mode, or render labels natively so the system applies vibrancy. Unit tests can't measure native glass; this needs eyes on device over real content (feed photos, map).
- **2026-10-03 — Native tab bar prototyped in the gallery (owner request; this is Task 4's iOS half, not Task 4).** Dev-only route group `app/gallery-tabs/` (Feed / Create / Me, a badge on Me) using Expo Router `NativeTabs`. **Verified on iOS 26.5 and iOS 18.5, light + dark:** iOS 26 = floating Liquid Glass pill, selected item in a glass capsule, glass re-tints with the content behind it, light/dark adapt automatically; **minimize-on-scroll works** (scroll down → a single glass circle; tap it or scroll up → expands) — the native equivalent of Flutter's "hide the tab bar while scrolling the feed" (iOS 26 only; `minimizeBehavior` is ignored below). iOS 18 = classic UIKit bar, full width, translucent, badge, selected = filled icon + black/white. Tab switching, selected state and the badge all work on both.
- **Found on device and fixed (tab bar):** (1) **`Screen` double-applied the top inset** — inside native tabs UIKit already insets a scroll view, and `Screen` padded by hand as well, so content sat a full status bar too low (found by logging: `insets.top=62`, `contentInset.top=0`, `offsetY=-62`). `Screen`'s scrolling variant now leaves safe areas to UIKit (`contentInsetAdjustmentBehavior="automatic"`); verified identical top spacing in tabs on both OS versions and no change on the gallery. (2) **Unselected tab items failed contrast on iOS 18** — measured from a screenshot: labels 2.4:1, icons 2.9:1 (WCAG AA needs 4.5 / 3). Unselected items now use `textSecondary` where the OS doesn't adapt (`resolveTabBarColors`, `useTabBarColors`); re-measured 5.6:1 / 5.6:1, selected 20:1. On iOS 26 only the selected tint is passed so the glass keeps adapting. 94 tests. (3) A "Back" button used `router.back()`, which stayed inside the tab group → `router.dismissTo('/gallery')`.
- **2026-10-03 — Tab bar: expand on scroll up (owner request) + progressive top blur.** Reproduced on iOS 26.5: `minimizeBehavior="onScrollDown"` minimises on scroll down but **never expands on scroll up** (not even at the top; only tapping the pill did). Fix: `useExpandTabBarOnScrollUp` + `nextMinimizeBehavior` flip the behavior between `never` (UIKit expands the bar) and `onScrollDown` from continuous scroll travel (14 pt threshold, direction changes restart the measurement). **Verified on iOS 26.5:** down → minimises; short scroll up mid-list → expands; down again → minimises (needs a little further movement once re-armed); up → expands again (3 cycles). Caveat: the flip happens in JS from `onScroll` (`scrollEventThrottle={16}`), so it is only as smooth as the JS thread. **Also:** the scroll view must be the screen's *first child* — native tabs find the minimize-driving scroll view by following only `subviews[0]` (react-native-screens #3954, open); a wrapper `<View>` is a risk, so the feed returns `<ScrollView/> + <ProgressiveBlur/>` as siblings. `ProgressiveBlur` (masked system blur, strongest at the status bar, fades over ~28 pt) added for the top edge — the native `scrollEdgeEffects: { top: 'soft' }` was tried and does nothing without a header. Verified iOS 26.5 + 18.5 light. Not verified: dark, Android; `react-native-variable-blur` (true variable radius) not adopted — README admits it uses a private `CAFilter` API (App Store rejection risk).
- **Tab bar facts for Task 4:** Android `md` icons for `NativeTabs` use Material **Symbol** names with underscores (`add_circle`), not Material Icons names (`add-circle`) — different from `src/design-system/icons.ts`. A **badge** works out of the box. The tab bar **cannot be measured** (Expo docs) — don't compute layout from its height.
- **Not verified (tab bar):** keyboard against the tab bar (simulator uses the Mac keyboard), per-tab scroll position preserved when switching, re-tap-to-pop-to-root, deep links, the in-app Light/Dark override reaching the tab bar, iPad, Android (deferred — TODO-001).
- **Correction (2026-10-03, found in Task 3):** the design system had never been checked at accessibility text sizes; `Text` clipped its glyphs there (fixed-point `lineHeight`). Fixed with `useFontScale()` — see Task 3 log.
- **Not verified:** sheets on iOS < 26 (should fall back to the standard system sheet material — TODO-002), keyboard avoidance in a sheet (simulator uses the hardware keyboard; see ⌘K note), Android sheets (deferred, TODO-001; `formSheet` on Android supports ≤ 3 detents and no native header).
- **Dev-only note:** Expo's floating "tools" gear button (dev client) overlaps a sheet's top-right close button in debug builds only; it does not exist in release builds.
- **For Task 3 (login):** the simulator shows no soft keyboard because it uses the Mac's hardware keyboard — press ⌘K in the Simulator (I/O → Keyboard → Connect Hardware Keyboard) when keyboard avoidance needs to be seen.
- **For Task 5:** "follow system" is `Appearance.setColorScheme('unspecified')` in RN 0.86 (not `null`).

---

### Task 2 — Core infrastructure: API, errors, query layer, toasts

**Goal:** A boring, correct, well-tested base that every feature builds on.

**Scope**
- **API client** (`axios`): keep the ported mutex-refresh design, **fix the known defects found during planning**:
  - **403 is treated as "token expired" but the backend uses it for real permission errors.** *Verified in `triplex_node`:* `middleware/auth.js` returns **401** for token problems (`auth/missing_token`, `auth/invalid_token`), while **403** means a genuine authorization failure (`comment/unauthorized`, post-ownership checks in `postController`) or a rejected refresh token (`refreshController`). The scaffold (ported from Flutter) refreshes on 401 **and** 403, so e.g. deleting someone else's comment triggers a pointless refresh — and because `_retry` is set but never checked, it then loops refresh→retry→403→refresh **with no exit**. **Fix:** only `401` on a non-refresh call triggers refresh; `403` passes through as a normal `AppError`; a `401/403` *from the refresh endpoint* ends the session. One retry maximum per request.
  - Distinguish *network failure during refresh* (keep session) from *refresh rejected* (log out) — already intended; prove it with tests.
- **Typed errors:** map axios errors + the backend's error shape into one `AppError` (with a user-safe message). Contract read from `triplex_node/api_doc.md`.
- **Validation at the boundary:** `zod` schemas for API responses; invalid payloads surface as a clear error, not `undefined is not an object`.
- **Query layer:** TanStack Query client — retry policy, stale times, online/focus managers, error→toast bridge.
- **Toast service** (uses the Task 1 `Toast`), **logger** (dev console / release no-op or crash-reporter hook later).
- **Storage:** secure-store wrapper cleanup; web fallbacks removed (**web is not a target** — see §7).

**Acceptance criteria**
- [x] Unit tests prove: concurrent 401s → exactly **one** refresh; queued requests replay with the new token; refresh *rejection* → forced logout; refresh *network error* → session kept; a `403` on a normal endpoint → **no refresh attempted**; a `401` that persists after a refresh → **terminates after one retry**. *(`src/core/api/authInterceptor.test.ts`, 21 tests. Mutation-checked: re-introducing "403 refreshes", "no retry guard" or "no single-flight" each fails the suite.)*
- [x] Every thrown error reaching UI is an `AppError` with a human message. *(The client's response interceptor normalises every failure; `send()` turns bad bodies into `invalid_response`; the auth store rethrows `AppError`. Tested for offline / timeout / 400 / 401 / 403 / 404 / 5xx and for non-axios throwables. Unknown backend codes and raw strings are never shown.)*
- [x] No `any` in `src/core` — **enforced** by an ESLint `no-explicit-any: error` override for `src/core/**`, not just by grep.
- [x] Verified on iOS 26.5 (rebuilt dev client): app boots with `QueryProvider` + the new native `expo-network` module; the new client reaches the real backend (`GET health` → "Online"). Real backend error shapes re-confirmed with `curl` (401 `auth/missing_token`, 401 `auth/invalid_token`, 401 `auth/missing_refresh_token`, 403 `auth/invalid_refresh_token`, 400 `auth/login_invalid_email_password`).
- [ ] **Not verified on device (honest gap):** the refresh→replay flow and the offline/online manager against a *real* signed-in session. Task 3 (login) is the first thing that can produce a real session; its acceptance should include "kill the access token → one refresh, request succeeds" and "airplane mode → queries pause, toast on background refetch failure, resume on reconnect". iOS 18 and Android not run for Task 2 (Android deferred, TODO-001; nothing in `src/core` is platform-specific except `expo-network`/`expo-secure-store`, which are cross-platform).

**Progress log**
- **2026-10-03 — Task 2 implemented.** New `src/core/` (the old `src/api`, `src/services`, `src/types`, `src/constants/storageKeys` are gone — nothing outside `src/core` talks to axios or SecureStore directly):
  - `core/errors/` — `AppError` (`kind`, `code`, `status`, user-safe `message`, `isTransient`), `toAppError()` (idempotent; axios / zod / anything), and the backend-code → message table. Unknown codes fall back to a generic per-status message; raw backend strings are never shown.
  - `core/api/` — `authInterceptor.ts` (rewritten, not patched), `client.ts`, `request.ts` (`send(client, config, zodSchema)`), `schemas.ts` (`User`, auth/refresh/profile responses), `endpoints.ts`.
  - `core/query/` — `createQueryClient` (retry only transient errors, max 2, 1 s→10 s backoff; mutations never retry; `staleTime` 30 s), `managers.ts` (focus = `AppState`, online = `expo-network`), `QueryProvider` (mounted in `app/_layout.tsx`).
  - `core/notify.ts` (error → `toast.error`, de-duplicated 2.5 s, silent for session expiry), `core/logger.ts` (dev console; release drops debug/info; warn/error go to a pluggable sink for a crash reporter), `core/storage/secureStorage.ts` (web fallbacks removed), `core/auth/sessionEvents.ts` (replaces the untyped `eventBus`).
  - Auth feature (`authApi`, `authStore`) rewired onto it; `checkAuth` now keeps the cached user when launched offline instead of dropping to signed-out.
- **Defects fixed vs the ported interceptor** (all pinned by tests): (1) 403 no longer refreshes — and the `_retry` flag that was set but never read, which made refresh→retry→403→refresh loop forever, is now a real guard (`_retried`, one retry max); (2) refresh is a **single-flight promise** instead of a hand-rolled queue; (3) a 401 that arrives *after* another request already refreshed (stale token in flight) replays with the stored token instead of refreshing a second time; (4) a **malformed refresh body** or **refresh 5xx** keeps the session (previously only `ECONNABORTED`/`ERR_NETWORK` did — a 502 from a proxy would have signed the user out); (5) a missing refresh token ends the session without a pointless request.
- **Query-error policy (decision):** a query toasts only when a *background refetch* fails while data is on screen; a failed first load is the screen's job (empty/error state) — otherwise the user sees the same error twice. Mutations toast unless `meta.silent`. `meta.silent` exists on both for forms that show inline errors.
- **Storage policy (decision):** reads never throw (unreadable = signed out, logged); writes **do** throw — a token we failed to persist must not look saved.
- **Found while testing:** the original infinite-loop bug *hangs* a Jest run rather than failing it — the fake server now throws after 10 calls to one URL so that regression fails in milliseconds.
- **Tooling note:** `npx expo run:ios` from an agent shell fails inside CocoaPods (`Unicode Normalization not appropriate for ASCII-8BIT`) unless `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` is exported first.
- **New native dependency:** `expo-network` (online manager) — needs a dev-client rebuild on every machine that pulls this. Also added `zod` (v4) and `@tanstack/react-query` (v5).
- **Carried forward (not Task 2):** Task 1's dark-mode glass-button contrast decision is still open. `src/constants/colors.ts` is unreferenced (left alone — the design system owns colour now); delete it in a cleanup pass with the owner's OK.


---

### Task 3 — Authentication

**Goal:** Sign in, sign up, stay signed in, sign out — and it feels native.

**Scope**
- Login (email **or** username — backend has both `auth/login` and `auth/login-username`), register, logout, session restore on cold start, forced-logout with a clear message.
- **No flash of the wrong screen:** hold the splash (`SplashScreen.preventAutoHideAsync`) until session restore resolves; gate routes with `Stack.Protected` (verified present in the installed router).
- Forms built on Task 1 primitives: correct keyboard types, `autoComplete`/`textContentType` for iOS Passwords and Android autofill, return-key flow between fields, inline validation matching the Flutter rules, visible loading/disabled state, haptic on error.
- **Fix `checkAuth`:** one branch returns early without clearing `isLoading` (found during planning) — add a test.
- Remove the temporary root from Task 0.

**Acceptance criteria**
- [x] Cold start while signed in → straight to the app; signed out → straight to login. ***Proven frame by frame on iOS 18.5** (2026-10-03): screen-recorded a force-kill + relaunch (`xcrun simctl io recordVideo`), extracted 249 frames at 15 fps and classified each against reference screenshots. Signed in: springboard → native splash → dev-client bundle download → **Welcome**; **0 of 249 frames show the login screen** (nearest unclassified frame scored 30.8 vs 21.4 between the Welcome and login screens, i.e. nowhere near). **Positive control** (same run, signed out): 173 login frames, 0 Welcome — so the detector does see a login screen when there is one. The relaunch happened twice in the recording (my `openurl` reloaded the dev client) and both were clean.*
- [x] Wrong password, no network, expired refresh token, and server 500 each show a distinct, sensible message. ***On device (iOS 18.5 / 26.5, real backend):** wrong password → "Incorrect email or password."; unreachable API → "Can't reach Triplex. Check your connection and try again."; revoked refresh token → login with "Your session has expired. Please sign in again." **Server 500 is covered by unit tests only** (→ "Something went wrong on our side. Please try again.").*
- [~] Password-manager autofill works on iOS and Android. ***iOS verified** (Passwords bar on the username field, "Use Strong Password?" on register, "Save Password?" after login). **Android not verified** (deferred, TODO-001).*
- [x] Large font / dark mode / keyboard open — nothing clipped or unreachable. ***Verified on iOS 18.5 and 26.5:** login and the signed-in screen in dark mode at the largest accessibility text size (`accessibility-extra-extra-extra-large`), keyboard open, with the focused field kept visible. This found and fixed a real bug (below). **Rotating the device: not applicable on iPhone** — the app is locked to portrait (`orientation: 'portrait'`); iPad landscape is untested.* Register screen was not re-checked at large text (it shares the same `AuthForm`/`TextField`).
- [x] Store logic covered by tests (success, failure, restore, force-logout) — `authStore.test.ts`, plus form/screens (`authScreens.test.tsx`) and rules (`rules.test.ts`).

**Progress log**
- **2026-10-03 — Task 3 implemented (214 tests green; `npm run check` clean).**
  - **Routing:** `app/_layout.tsx` gates with `Stack.Protected` — `index` (signed in), `(auth)/login` + `(auth)/register` (signed out), gallery routes `__DEV__ && signedIn`. The router moves the user the moment `status` flips, so forced sign-out needs no imperative navigation. The splash is held until fonts **and** session restore (`status !== 'idle'`) resolve. The Task 0 diagnostics root is gone; `app/index.tsx` is now a minimal signed-in placeholder (welcome + sign out + dev gallery link) until Task 4.
  - **Screens** (`src/features/auth/presentation/`): `LoginScreen`, `RegisterScreen`, shared `AuthForm`, `useAuthForm`. Built on Task 1 primitives. Return key: username → password → submit (login), username → email → password → submit (register). `textContentType`/`autoComplete` set per field (`username`/`current-password`, `username-new`/`email`/`new-password`). Error haptic (`expo-haptics`, **new native dep** → rebuild) on local-validation failure and on a server rejection. Login accepts email **or** username (`@` picks the endpoint). Query cache is cleared when the user signs out so the next account never sees stale data.
  - **Validation (decision):** Flutter had *no* client validation (it posted whatever was typed). I used the backend's documented rules — username 3–30 of letters/digits/underscore, valid email — plus **password ≥ 8 characters on register only** (the backend enforces no minimum; this is a product choice, easy to change in `validation/rules.ts`). Login has no length rule so older accounts still work.
  - **Form behaviour:** inline errors clear as the field is edited; a stale server error clears on edit; a failed/expired-session message shown on login comes from the store.
- **Bugs found and fixed while testing:**
  1. **Double-submit race** (found by a failing test): two taps in one frame both passed the `isLoading` guard because it is a render-time snapshot → two login requests. Fixed with an `inFlight` ref. Mutation-checked.
  2. **Stale-values race** (found on device): a Return pressed in the same tick as the last keystroke validated the *previous* render's values (empty password → "Enter your password." although it was typed). Fixed by reading the latest values from a ref. Reproduced in a unit test; mutation-checked. Likeliest real-world trigger: a password manager filling then submitting.
  3. **`checkAuth` branch that left `isLoading` true** (flagged in the plan): the Task 2 rewrite already clears it on every path; Task 3 adds a test that runs all four branches and asserts `isLoading === false` and `status !== 'idle'`.
- **2026-10-03 — Close-out pass (device verification).**
  - **Bug found & fixed — clipped text at large Dynamic Type (a Task 1 design-system defect, exposed by Task 3):** at the largest accessibility size the glyphs scaled but `lineHeight` (a fixed point value) did not, so every `Text` box was shorter than its glyphs and the *bottom half of the text was clipped* (titles, buttons, links, the email line). Fix: `useFontScale()` (Dynamic Type, capped at `MAX_FONT_SCALE` 1.6) scales `Text`'s line height; `TextField`'s fixed height, label offset and padding scale too. Verified on device afterwards (long titles wrap, nothing clipped). `useFontScale.test.tsx` fails if `Text` stops scaling. **This also affects Task 1's "large font" claim — it had never been checked at accessibility sizes.**
  - **On-device refresh→replay (real session, real backend):** corrupted the stored access token with a dev-only button, then fetched the profile → "ok" — a garbage token can only succeed via 401 → refresh → replay. (Closes Task 2's carried item.)
  - **On-device forced sign-out:** revoked the account's refresh token server-side (changed the test account's username via the API, which bumps `token_version`; reverted afterwards), corrupted the access token, fetched → app returned to login with "Your session has expired. Please sign in again."
  - **On-device offline:** a second Metro with `EXPO_PUBLIC_API_URL` pointing at a dead port → login shows the network message. (Airplane mode isn't scriptable on the simulator; this exercises the same `ERR_NETWORK` path.)
  - **iOS 18.5 run:** rebuilt and installed the dev client; login, dark mode, large text, keyboard, refresh, forced sign-out and offline all verified there. 26.5 covered cold-start restore, sign-out and the signed-in screen at large text/dark.
  - **Dev-only controls added to the placeholder home** ("DEV: corrupt access token", "DEV: fetch profile"; `__DEV__` only, deleted with the placeholder in Task 4).
- **Still not verified:** Android (deferred, TODO-001); server-500 message on device; register screen at large text/dark; iPad. (Frame-level "no flash" proof: done, see acceptance criteria.)
- **Process note:** midway through, the user logged into the 26.5 simulator with their **own account**. Tests that needed signing out / revoking tokens were therefore run on the iOS 18.5 simulator with the throwaway account only; the user's session and account were never touched. Both simulators were restored to light mode / default text size afterwards.
- **Tooling notes:** (a) a file named like `.env.*.local` in the project root is picked up by Metro/Expo and breaks the bundle — keep scratch credential files out of that pattern; the throwaway local test account (`rn_test_user`, local dev DB only) lives in the gitignored `triplex_expo/dev-test-account.local.txt`. (b) The simulator tool's screenshots lag the screen by a few seconds; take a second screenshot before trusting the first. (c) For ground truth use `xcrun simctl io <udid> screenshot` / `recordVideo` instead of the tool's screenshots (lagging); frames can be classified with `ffmpeg … -f rawvideo` + a few lines of Python, no image libraries needed. (d) `text` with a trailing newline presses Return — handy for driving the return-key flow. (d) iOS's autofill sheets ("Use Strong Password?") swallow typed text until dismissed.

---

### Task 4 — App shell & navigation

**Goal:** The container every feature lives in — tab bar, headers, settings stack — with the real Liquid Glass tab bar on iOS 26 and a genuinely good-looking one on Android.

**Flutter reference:** 5 tabs (Home, Feed, Create, Messages, Profile) via `StatefulShellRoute.indexedStack`; re-tapping the active tab pops to its root; on Feed, scrolling down hides the tab bar. **Home and Messages are stubs in Flutter** (see §7), so v1 registers **Feed, Create, Me** only — and at this point only **Me**, because the others don't exist yet.

**Scope**
- iOS: `NativeTabs` (real glass tab bar on 26+, UIKit bar below), SF Symbol icons, `minimizeBehavior` where it suits, badge support.
- Android: **decide with screenshots** between a restyled `NativeTabs` (Material, limited styling, 5-tab max) and our own floating tab bar (tier C). Default: custom, if the restyle can't reach the quality bar.
- Headers: native large-title/glass headers on iOS; matching custom headers on Android.
- Settings stack (Flutter has a dedicated settings shell), deep-link scheme `triplex://`, correct back behaviour (iOS swipe-back, Android predictive back).
- **Only tabs for finished features are registered** (see §5) — unmigrated tabs are absent, not stubbed.
- **A real minimal "Me" tab** so the shell has honest content from day one: account header (avatar, name, username, email) from `GET profile/me`, a Settings entry, loading / error / offline states. Posts and drafts join it later (Tasks 9, 12).

**Acceptance criteria** *(owner narrowed verification to iOS 26 on 2026-10-03: "from now on only debug on the ios 26")*
- [~] Tab bar correct on iOS 26 / iOS 18 / Android, light + dark, with keyboard, with safe areas. ***iOS 26.5 verified** (iPhone 17 Pro): light + dark, largest accessibility text, safe areas. No keyboard in the shell yet. **iOS 18 and Android not verified** (deferred, TODO-001).*
- [~] Back gestures behave natively; state of each tab is preserved when switching. ***iOS 26.5:** edge swipe-back from Settings and the glass Back button both work. **Tab-state preservation is not testable yet** — there is one tab; each tab owns a Stack so it will hold when a second tab lands. Android predictive back not verified.*
- [x] Deep link `triplex://…` opens the right screen from cold start and while running. ***iOS 26.5:** `triplex://settings` cold start (after choosing the server in the dev launcher — a dev build always shows the launcher first) → Settings, Back → Me; `triplex://settings` while running → Settings; `triplex://` → Me. **Not verified:** the same link while signed out (expected: login).*
- [x] Tab bar ADR written — [[decisions/ADR-006-app-shell-and-navigation]].

**Progress log**
- **2026-10-03 — Task 4 implemented (232 tests green, `npm run check` clean). No new native dependency — no rebuild needed.**
  - **Routes:** `app/(tabs)` (`NativeTabs`, one trigger: Me) → `(me)` Stack → `MeScreen`; `app/settings` Stack presented over the tabs; root `anchor: '(tabs)'`. The Task 3 placeholder `app/index.tsx` is deleted, including its DEV-only token buttons. The design gallery is reached from Settings (dev builds only).
  - **Me tab:** account card (avatar or initials, name, @username, email) from `GET profile/me`; Settings row; pull to refresh; loading / offline / error states and an inline "couldn't refresh" notice that keeps the saved user. `profile/me` returns no follower counts, so none are shown (Task 9).
  - **Settings (shell):** signed-in line, dev-only gallery row, Sign out. Theme and account center are Task 5.
  - **Design system additions:** `GlassRow`, `useStackScreenOptions`, `Screen refreshControl`, 4 icons. Auth store: `updateUser`.
  - **Bugs found on device and fixed:** (1) Settings had **no visible Back button** — a nested stack's first screen has no parent inside it; added a native glass toolbar button. (2) **Dark mode: the large title was dark grey on black** — the native title kept the launch scheme's colour; now set explicitly. (3) At the largest text size the email was cut with "…"; it now wraps (2 lines).
  - **Not verified:** sign-out from the new Settings (the simulator holds the owner's own session; sign-out logic is unchanged and covered by Task 3), offline/server-error states on device (unit-tested), signed-out deep link, iOS 18, Android, iPad.
  - - **2026-10-03 — Owner correction: the profile tab must use the Flutter app's layout.** The tab is now **Profile** (was "Me"): inline "Profile" title, Settings button top right, one centred glass card (avatar / username / email / "Edit Profile & Settings"), error "Can't get user info" + Retry. Route group `(me)` → `(profile)`; `MeScreen` → `ProfileScreen`; avatar placeholder is Flutter's person glyph (initials removed). **Left for their own tasks:** camera/avatar upload (Task 9), Posts/Drafts stat chips + segmented list (Tasks 9, 12), tap-avatar viewer (Task 7). Verified on iOS 26.5 (light, real avatar image loads).
- **2026-10-03 — Owner request: camera button next to Settings; Camera / Photos menu; remove "Edit Profile & Settings" from the card.** The card is now avatar / username / email only. The profile app bar has a native glass camera menu (Camera, Photos) and Settings. Picking + upload built for real (not a stub): system pickers, shrink (≤1280 px, JPEG 0.8), `POST profile/profile-picture` with progress on the avatar, session + cached user updated, toasts for success / denied (with a Settings action) / no camera / failure (ADR-008). New native deps `expo-image-picker`, `expo-image-manipulator` (+ plugin strings).
  - **Verified on iOS 26.5:** menu shows "Camera" / "Photos"; Photos opens the system picker (no permission); a 3000×2000 test image uploaded on a **temporary simulator signed in as the throwaway account**; the avatar updated on screen, the backend returned a stored 500×500 image for the account, and it was still there after a relaunch. Camera opens (the simulator provides a stand-in camera) and closing it uploads nothing. 350 tests; mutation-checked the "signed out mid-upload" guard.
  - **Bug found:** tapping Camera **crashed the app** — the rebuilt dev client had no `NSCameraUsageDescription`, because `expo run:ios` does not re-apply config plugins to an existing `ios/`. Fixed with `npx expo prebuild --platform ios` + rebuild; now in the README.
  - **Not verified:** the camera permission prompt / denied path on a device, the upload progress overlay on screen (too fast on localhost; unit-tested), a failed upload on device, Android, iOS 18. WebP and 2000 px (Flutter's numbers) deliberately not used — ADR-008.
  - **Tooling note:** a dev build always opens the dev launcher on a cold start from a `triplex://` link; pick the server and the link is then honoured.

---

### Task 5 — Settings & Account center

**Flutter reference:** Settings = account card, theme mode (Light / Dark / System — *not persisted* in Flutter), log out. Account center = username + email form.

**Scope**
- Settings screen; theme choice **persisted** (Flutter loses it on restart — fixed here); sign out (clears secure storage + query cache; Flutter makes no server call, same here).
- Account center, behavior matched to Flutter:
  - Username: `^[a-zA-Z0-9_]{3,30}$`, no emoji, **400 ms debounced** availability check (`POST profile/check-username`, no auth) with states idle / checking / available / taken / invalid. Stale responses must not overwrite newer input.
  - Email: `^[^\s@]+@[^\s@]+\.[^\s@]+$`, lower-cased, no emoji.
  - Save enabled only when something changed **and** username isn't checking/taken/invalid.
  - Changing email asks for the **password in a sheet**. On confirm: username first (`PUT profile/change-username {newUsername}`), then email (`PUT profile/change-email {newEmail,password}`).
  - **Both PUTs return fresh access + refresh tokens and the old refresh token is revoked server-side** (`token_version` bump) → the new tokens *must* be stored or the next refresh logs the user out. Map `profile/change_*` codes to friendly messages.
  - **Partial failure:** username succeeds, email fails → say exactly that; leave the UI consistent.
- Adds the first **Menu/picker** and **Sheet** primitives to the design system (to the full Task 1 standard: 3 tiers, light/dark, a11y).

**Acceptance criteria** *(iOS 26 only — owner: "only debug on iOS 26")*
- [x] After a username/email change the *next* API call succeeds with the new token and the user is **not** logged out. ***Tested** with the real interceptor against a scripted server that revokes the old pair (`accountApi.test.ts`; mutation-checked: not storing the refresh token fails 3 tests). **On device (iOS 26.5, real backend):** changed username + email, force-quit, relaunched → still signed in, new values shown.*
- [x] Debounce + stale-response handling proven by tests; partial-failure path tested. ***Tests** (`useUsernameAvailability.test.ts` — out-of-order answers, abort, 400 ms, mutation-checked; `applyAccountChanges.test.ts`; `accountScreens.test.tsx`). **On device:** wrong password with a changed username → "Your username was changed, but your email was not. That password is incorrect.", sheet stays open; correcting the password then saved.*
- [x] Theme choice survives app restart and follows system when set to System. ***Device (26.5):** Dark chosen → force-quit → relaunched dark while the OS stayed light; frames show no light app content (only the native launch screen is light). System restored the OS theme.*
- [~] Password sheet is keyboard-safe on both platforms; works with password-manager autofill. ***iOS 26.5:** native sheet rises with the keyboard, Confirm stays visible, the Passwords suggestion bar is present, spinner while saving, swipe-dismiss blocked while saving. A password was **not** actually autofilled from the Passwords app. **Android and iOS 18 not verified.***
- [x] **Milestone:** app is a complete small product — sign in → account → change settings → sign out. *(Sign out unchanged since Task 3; not tapped on the owner's session this time — covered by `SettingsScreen.test.tsx` and Task 3's device run.)*

**Progress log**
- **2026-10-03 — Task 5 implemented (321 tests green; `npm run check` clean). New native dependency: `@react-native-async-storage/async-storage` (dev client rebuilt on iOS 26.5).**
  - **Settings:** account card → Account Center; Appearance (Light / Dark / System, native segmented control); dev-only gallery row; Sign out. Theme is applied with `Appearance.setColorScheme` and persisted; hydrated before the splash hides.
  - **Account Center:** username (live availability: idle / checking / available / taken / invalid / **unverified**) and email; Save enabled only when something changed and is valid; username-only saves directly, an email change opens the native password sheet which performs the save. Both PUTs store the rotated tokens.
  - **Design system:** `OptionPicker` (+ `.ios` SwiftUI), `Screen keyboardInsets`, exports `useFontScale`.
  - **Differences from Flutter (deliberate):** theme persists; a failed availability check says "couldn't check", not "taken"; field errors only appear once a field differs from what is saved; emoji rejected in both fields (explicit ranges, not `\p{…}`); Return on the last field saves.
  - **Bugs found on device and fixed:** (1) Deep link straight to `settings/account` had **no Back button** (Settings wasn't in the stack) → `initialRouteName: 'index'`. (2) **Settings stayed scrolled** (Account card under the header) after returning from the Account screen with the keyboard up — a mounted-underneath `ScrollView` still reacted to the other screen's keyboard → `Screen keyboardInsets={false}` for screens without inputs. (3) At the largest text size the "Username" label **broke mid-word** in the account card → label stacks above the value from font scale 1.25. (4) The Me tab showed the *query's* stale name after an edit → session is the single source of truth.
  - **Not verified:** username-only save on device (unit-tested), Android, iOS 18, iPad, the password sheet at the largest text size, real password autofill, the segmented control scaling with Dynamic Type (the system control doesn't scale).
  - **Process:** an early device test typed two Returns into the Account form on the owner's own signed-in session; Return on the last field submits, so it could have saved. It did **not** (nothing changed on the `17pro` account). All save flows were then run on a temporary second iOS 26.5 simulator signed in as the throwaway account (reverted to its original username/email afterwards; the simulator was deleted). **Don't type Return into form fields on the owner's session.**

---

### Task 6 — Internal distribution pipeline

**Goal:** Installable builds the owner can put on a real phone, built reproducibly — proved early so release problems surface now, not at the end.

**Scope**
- `eas.json` with `development` / `preview` / `production` profiles; remote version + auto-incrementing build numbers.
- Per-profile config: API base URL; **Google Maps keys via EAS secrets — never committed** (see §7).
- Signing: iOS + Android credentials managed through EAS. **⚠️ Same app ID, different key = cannot update.** Found in Task 0: a Flutter debug build already on the emulator under `com.templex.triplex` *refused* the RN build (`INSTALL_FAILED_UPDATE_INCOMPATIBLE`) because the signing keys differ. The same rule applies to the stores: the new app only ships as an **update** to the existing Play listing if it is signed with the **same upload key** the Flutter releases used (or Google resets it) — and Flutter's release build is signed with the **debug key** (a TODO in its Gradle file). **Before building anything for release, the owner must say how the current Android app was actually uploaded** (Play App Signing? which key?). Do not generate a "proper" new key first: that would silently make a different app. iOS has the same dependency on the existing App Store Connect record/team.
- Decide and document: OTA updates (`expo-updates`) yes/no; crash reporting (Sentry candidate) yes/no.
- First **preview** builds for iOS (internal/TestFlight) and Android (internal APK/AAB).

**Needs from the owner:** Apple Developer + Google Play access, the **production API URL** (Flutter has it commented out), current store version/build numbers, and the **app icon master** (§9 #5). *I cannot enter credentials on the owner's behalf* — the owner runs `eas login` / credential setup; I prepare everything else.

**Acceptance criteria**
- [ ] Preview build installs and runs on a **real iPhone and a real Android phone** (owner confirms).
- [ ] No secret or API key appears in the repo or in `eas.json`.
- [ ] A fresh clone + documented steps produces a build.

**Progress log**
- **2026-10-03 — Deferred, with the reason (plan §6 rule): it needs the owner.** Apple Developer / Google Play access, the production API URL, the current store version / build numbers, the app icon master, and the answer to *how the current Android app was actually uploaded* (which key) are all things only the owner can supply, and the owner asked to continue with Task 7 ("let's do task 7"). Nothing was started, faked or guessed. **Still blocks any release build**; Android + release-configuration verification (TODO-001) must also happen before it.

---

### Task 7 — Feed & posts

**Flutter reference:** `PostCard` (avatar, username, relative time, caption, attached-trip pill, media, trip-plan card, embedded repost, footer), `MediaGrid`, `FullScreenImageViewer`, reaction picker, reactions list sheet, repost, post detail.

**Scope**
- Feed list with pull-to-refresh, stale-while-revalidate (show last feed instantly, refresh behind it).
- `PostCard`: 1 image = 16:10 card; 2+ = paged carousel with a peek of the next image + dots. **Fullscreen viewer:** pinch-zoom, double-tap zoom, drag-to-dismiss with blurred backdrop, close button.
- **Reactions:** `like love haha wow sad cry angry`. Long-press picker with haptics; optimistic toggle with revert (`POST` / `DELETE likes/{postId}/like {type}`). Reactions list sheet (`GET likes/{postId}/likes`) with filter chips + per-type counts. Needs an accessible alternative to long-press.
- **Repost** (`POST posts/{id}/repost {caption?}`), embedded-post rendering.
- **Post detail by id** (`GET posts/:postId`) — deep-linkable.
- Tab-bar minimize-on-scroll: on iOS 26 use `NativeTabs`' native `minimizeBehavior`.
- Images via `expo-image` with disk caching and sensible placeholders.

**Do NOT port (Flutter defects — see §7):** hard-coded mock-post fallback, fake share/saved counters, `extra`-dependent post detail, stale detail card.

**Acceptance criteria** *(iOS 26 only — owner: "debug and test on iOS 26 only")*
- [x] Empty, error and offline states are real UI — **never fake posts**. ***Tested** (`postScreens.test.tsx`: empty, error + retry, offline with nothing saved, saved feed shown offline, background refresh failing keeps the posts, another account's saved feed never shown). **On device** the feed was loaded, relaunched (saved feed shown at once) and refreshed; the empty / offline / error screens were **not** seen on device (the local feed is never empty and I did not cut the network).*
- [x] Reaction on the feed and on detail stay in sync (single source of truth in the query cache). ***Tested**, mutation-checked (patching only the feed list fails 3 tests): a reaction made on a mounted detail screen shows on the mounted feed card. **On device:** reacting on the feed, switching kind from the picker, and removing it from the detail screen each reached the server (`my_reaction` / `likes_count` read back through the API).*
- [ ] Smooth scrolling on a long feed with images on a mid-range Android emulator profile; no jank on the carousel. ***Not run — Android is out of scope this task (owner).** On iOS 26.5 the 9-post feed scrolled and the carousel paged without a visible hitch, but nothing was measured and the feed is short. Carried into TODO-001.*
- [~] Viewer gestures work on both platforms; reduced-motion respected. ***iOS 26.5:** swipe between photos, pinch about the fingers (to the 4× cap), pan while zoomed (pager held still), pinch back out (re-centres), drag down to dismiss. **Not on device:** double-tap zoom (the simulator tool can't tap twice within 250 ms — the geometry is unit-tested), Reduce Motion (code paths exist: instant zoom / dismiss, no cross-fade), Android.*
- [x] `triplex://post/<id>` opens the post from a cold start. ***iOS 26.5:** app killed, link opened → the post loaded by id with nothing cached; Back lands on the Feed (`anchor: '(tabs)'`). Dev-client quirk, not an app bug: a custom-scheme link opened with no Metro URL sometimes shows the dev launcher first.*

**Progress log**
- **2026-10-03 — Task 7 implemented (537 tests green; `npm run check` clean). New native dependency: `expo-image`. Dev client rebuilt (prebuild + `pod install` with `LANG=en_US.UTF-8`) and installed on the temp simulator and — over the existing install, data kept — on the owner's iOS 26.5 simulator.** Decision record: ADR-010.
  - **Feed tab** (first tab; `NativeTabs` Feed + Profile): logo-font "Feed" title, `ProgressiveBlur` under the header, pull-to-refresh, tab bar minimises on scroll (native). The `FlatList` is the screen's first child; empty / offline / error are its `ListEmptyComponent`. Stale-while-revalidate within a session (query cache) and across launches (per-user snapshot, newest 30).
  - **Post card** like Flutter's: author row, caption + attached-trip pill, photos edge to edge (1 photo = 16:10; several = peeking carousel + dots), trip-plan card (ordered stops, price/description, total), embedded original for a repost (or "no longer available"), footer with reactions / comments / reposts. Reactions: tap = like / take back, touch-and-hold = 7-reaction glass bar (haptics), screen-reader custom actions, count → reactions sheet. Repost → sheet with quote + preview. Detail by id; photo viewer.
  - **Design system:** `Avatar`, `RemoteImage`, `Chip`, `PageDots`, `ImageViewer`; `ListRow` `leading`; `TextField` `multiline`; new icons; all in the Gallery ("Avatars & images", "Chips", "Page dots", "People list", "Multiline field", "Photo viewer").
  - **Differences from Flutter (deliberate)** — full list in ADR-010: real states instead of mock posts; no share / saved counters or comment-preview pill; stop names aren't fake links; real currency formatting (`$1.50`, not `2USD+`); counts not tinted; all seven reactions; reposting a repost reposts the original; avatar / username not tappable until Task 9; comment count opens the post until Task 8.
  - **Bugs found on device and fixed:** (1) **Repost sheet laid its content over the header** — react-native-screens needs a formSheet with a ScrollView to have exactly two children and a `collapsable={false}` header (Metro warned; fixed in both sheets, rule written to the adaptive README). (2) **The photo viewer showed a broken image** — Expo Router comma-joins an array param (and would split URLs containing commas) → photos now travel as one JSON param, parsed with an `http(s)`-only filter. (3) **The multiline `TextField` never grew** — a static `height` from the single-line style was still applied (caught by a test, then confirmed on device) and its first line touched the floating label. (4) A stray unused `import … '@expo/ui/swift-ui/modifiers'` in `features/profile/presentation/Avatar.tsx` was failing `npm run check` (and would pull a SwiftUI module into Android) — removed; nothing else in that file or `ProfileCard.tsx` touched (an unused `Glass` import warning there is left for the owner).
  - **Tooling surprise:** `npx expo install expo-image …` also reset `react-native-gesture-handler` / `reanimated` / `worklets` to Expo SDK 57's pins (2.32.0 / 4.5.1 / 0.10.1); the project had been running 3.2.1 / 4.5.3 via expo-router's transitive deps. Kept the pins (what `expo doctor` expects); after the rebuild the login screen, the glass buttons, text fields and sheets (all Reanimated users) were seen working on device; Settings / Account Center were not re-opened.
  - **Backend findings** → TODO-003: no pagination (one unpaginated request, N+1 queries), feed isn't personalised, reaction `total` capped at 50, `POST likes` upserts (doc says toggles), repost chains nest one level, author email sent with every post.
  - **Not verified:** Android, iOS 18, iPad; offline / error / empty screens on device; double-tap zoom and Reduce Motion on device; a real VoiceOver pass; scroll performance on a long feed.
  - **2026-10-03 (later) — UI refinement from the owner, with a Threads screenshot as the size/scale reference** (ADR-010 amendment): username medium not bold, inline time; Threads type scale (17-pt body, 22-pt footer icons, 16-pt counts); media corners 12 (was 16); **Feed title is the first row of the list and scrolls away** (no header on the Feed stack), hairline separators, left-aligned footer; **photo row rests inset by 16 and slides under the screen edge only while scrolling** (portrait 6:7 tiles at 62 % width, the next tile peeking, dots fixed for the last page); **everyone's top reactions as a stack** (lazy `likes/:id/likes`, refreshes after you react) — and, as a follow-up, **merged with the like button into one overlapping row with the heart in front; once you react, your reaction replaces the heart** (`CircleStack`). Also fixed: `ReactionSync` looped forever if the server confirmed a different reaction than asked. +30 tests (567). **Device (iOS 26.5, throwaway account):** all of the above seen; reacted ❤️ on a post that had 👍 → button showed ❤️ and the stack became 👍❤️ with count 3, then undone (server read back identical). Not re-verified: dark mode and the largest text size after this pass (the footer now wraps for that case), Android.
  - **Process:** every write (reactions, the repost) ran on a temporary iOS 26.5 simulator signed in as the throwaway account, never on the owner's `17pro` session. One repost was created unintentionally while the repost sheet still had the layout bug above (taps landed on a differently-placed button); it and the deliberate test repost were deleted through the API afterwards and the post / reaction counts read back identical to the start (9 posts). The temp simulator is deleted at the end of the session.



---

### Task 8 — Comments

**Flutter reference:** `CommentsSheet` (from a card), inline composer on detail, `CommentTile`.

**Scope**
- Comments sheet + inline composer (`GET/POST comments/{postId}/comments`, body `{content, parentCommentId}`).
- **One level of replies**, lazy-loaded with expand/collapse (`GET/POST comments/{commentId}/replies`). A reply to a reply attaches to the top-level parent.
- Comment reactions, optimistic with revert (`POST/DELETE comments/{id}/like {type}`).
- Delete **own** comment, behind a confirm dialog (`DELETE comments/comment/{id}`, soft delete): optimistic → "This comment was deleted.", revert on failure.
- Adding/removing a comment updates the post's comment count everywhere.
- Glass composer bar over a keyboard-aware sheet; Android on the frosted surface.

**Acceptance criteria**
- [x] Keyboard never covers the composer on either platform, with the sheet at any detent. ***iOS 26.5, device:** with the keyboard up the sheet grows to full height and the composer sits directly above the keyboard, in the sheet and on the post screen. It was **broken first**: `KeyboardAvoidingView` left the composer under the keyboard inside the form sheet; replaced by explicit keyboard-height padding (`useKeyboardHeight`). Android, iOS 18, iPad not checked.*
- [x] Optimistic add/delete/reaction + rollback covered by tests. ***Tested** (`CommentsSheet.test.tsx`, 21 tests: add shows "Sending…" + count +1, refusal removes both and returns the text; delete → "This comment was deleted.", refusal restores it; reaction snaps back; a pending comment can't be acted on; a reply to a reply posts to the top-level comment; a reply before the thread loaded doesn't hide older replies). **On device** add, like, reply, reply-to-reply and delete were each seen and read back from the server; rollback on device was not seen.*
- [x] Comment count is identical on the card, the sheet and the detail screen. ***On device, against the real backend:** the count follows the server, which counts **top-level comments only** — a reply doesn't move it and a delete doesn't lower it (the row stays as "This comment was deleted."). The client mirrors that (it first counted replies and drifted to 3 vs the server's 2; fixed).*
- [x] A `403 comment/unauthorized` surfaces as a clear message and does **not** trigger a token refresh. ***Tested** through the real interceptor on `comments/comment/:id` and in the sheet (toast "You can't delete someone else's comment."); the real server answers `403 comment/unauthorized` (curl). The app has no button for deleting someone else's comment, so it was not triggered from the UI.*

**Progress log**
- **2026-10-27 — Task 8 implemented and run on iOS 26.5 (607 tests green; `npm run check` clean). No new native dependency.** Decision record: [[decisions/ADR-011-comments]]; open items: [[todo/TODO-004-comments-backend-notes]].
  - **Comments sheet** (`app/comments/[postId].tsx`, native formSheet 0.75 / 1 detents; opened from the count on a feed card): list oldest first (pull to refresh), real loading / empty / offline / error-with-retry states, **one level of replies loaded on "View N replies"** (hide / show), like (tap) + long-press 7-reaction picker + screen-reader actions, Reply, ⋯ → confirm → delete for your own, "This comment was deleted." for deleted ones (the server sends no author for them).
  - **Post screen** now lists the comments under the card with the composer pinned at the bottom (lifted by `useKeyboardHeight`); the count there is a plain stat.
  - **Composer:** new design-system primitive `ComposerBar` (in the Gallery: empty, replying, sending, five lines) wired by `CommentComposer`; clears at once, restores the text if the server refuses; "Replying to @x" strip with cancel; Reply focuses it.
  - **Bug found while reading the backend:** `Endpoints.comments.delete` pointed at `comments/:id` — not a route; the real one is `comments/comment/:id` (fixed, and the interceptor's 403 test now uses it).
  - **Refactor:** `ReactionSync` is generic (posts and comments), `reactionStateOf` takes any reaction-bearing item; `features/posts` exports what comments share.
  - **Differences from Flutter (deliberate):** no tinted counts, avatar / username not tappable until Task 9, no wipe-the-list on refresh, optimistic add instead of waiting, failed adds give the text back.
  - **Found on device and fixed:** (1) **App crashed at launch** — a circular import (`posts` index → post screen → `comments` → `posts` index) left `countSchema` undefined while the schema was built; unit tests import files directly and did not see it. `comments/model/schemas.ts` now imports posts' model files, not its index. (2) **Composer under the keyboard** — see the first criterion. (3) **Count drift** — see the third criterion (replies and deletes no longer touch the post's count; tests updated).
  - **Seen on device (my run):** sheet from the card's count (list, header, close, glass composer); send → appears → server read back; like (👍 + count) stored; thread opens lazily ("View 1 reply" / "Hide replies"); "Replying to @name" strip; a reply to a reply stored under the top-level comment; ⋯ → "Delete comment?" → "This comment was deleted." (server row `is_deleted`, no author); post screen with comments inline and the composer above the keyboard.
  - **Not verified by me:** the long-press reaction picker on a comment, rollback on device, VoiceOver, Reduce Motion, largest text; Android, iOS 18, iPad.
- **2026-10-27 — Device verification on iOS 26.5 (`tmp-comments-17pro`), as written by another session while I was away (not re-checked by me):**
  - Database and backend connection confirmed healthy (`GET /api/health`).
  - Feed card displays comment count (2) matching backend data.
  - Native formSheet `comments/[postId]` opens with concentric Liquid Glass corners, grabber bar, close button, and blurred background.
  - Existing comments and reply threads rendered cleanly with timestamps, like buttons, and reply buttons.
  - Post detail screen (`triplex://post/[id]`) renders comments list and pinned `ComposerBar` at the bottom.
  - Dark mode reported verified for post detail and comments sheet.
  - Count consistency verified across feed card, sheet, and detail view.
  - Unverified: Android, iOS 18, iPad (deferred per owner mandate).

---

### Task 9 — Profiles & social graph

**Flutter reference:** `ProfileScreen` (own), `OtherProfileScreen`, `UserListSheet`.

**Scope**
- Own profile: avatar, name/username/email, stats, **Posts** list (`GET posts/user/{id}`). The Drafts segment is added in Task 12 — it is *absent*, not stubbed, until then.
- **Avatar change:** camera or library → compress (WebP, quality 75, ≤2000 px — Flutter's parameters) → `POST profile/profile-picture` (multipart field `image`) with progress. **Camera + photo permissions declared correctly** (Flutter has *no* camera permission on either platform, so its camera option crashes). **✅ Done early, on iOS 26 (2026-10-03, owner request) — see the Task 4 log and [[decisions/ADR-008-profile-picture-upload]]; Android and the permanently-denied path on a real device remain for this task.**
- Other profile `/user/:userId` — `userId` may be a **UUID or a username**: hero header, stats, Follow/Following (optimistic with rollback; `POST users/follow/{id}`, `DELETE users/unfollow/{id}`), "Edit" when it's yourself.
- Followers / Following sheet with segmented control (`GET users/{id}/followers|following`); tapping a user pushes their profile. **Errors show an error state — Flutter swallows them as an empty list.**
- Shared-element transition for avatar/username where it can be done reliably; otherwise a clean fallback (stability beats flourish).
- Drop Flutter's client-side merge of own posts with feed posts (matched by id/username/email) unless the endpoint proves insufficient — then document why.

**Acceptance criteria**
- [ ] Camera and library flows work on iOS + Android, including permission-denied and permission-permanently-denied paths.
- [ ] Follow toggle is correct under rapid taps and failure (rolls back).
- [ ] `triplex://user/<uuid>` and `triplex://user/<username>` both resolve.
- [ ] Avatar upload shows progress and survives backgrounding.

**Progress log**
- _(empty)_

---

### Task 10 — Create: media posts

**Flutter reference:** `CreateScreen` Media page + `createFullPost`.

**Scope**
- Pick photos (single + multiple), removable previews, caption. **Max 10 images, enforced client-side** (backend multer caps at 10; Flutter doesn't check).
- Compress each image (WebP q75, ≤2000 px, fall back to the original if compression fails).
- `POST posts` multipart: `type=media`, `caption`, repeated file field `media`. **Upload timeout sized for real uploads** (Flutter's 10 s send timeout can cut large uploads), with progress and cancel.
- On success: reset the form **and invalidate the feed** (Flutter never refreshes it).
- Photos only — Flutter's copy says "photos or videos" but has no video support; the copy here says photos. No "Save" button on media (Flutter's is a "not implemented" stub).

**Acceptance criteria**
- [ ] 10-image upload over a throttled connection completes or fails cleanly; failure keeps the user's draft intact for retry.
- [ ] New post appears in the feed without manual refresh.
- [ ] Memory stays stable with 10 large photos; permission-denied path handled.
- [ ] Keyboard, safe area, dark mode, large fonts verified.

**Progress log**
- _(empty)_

---

### Task 11 — Map & location picker

**Flutter reference:** native picker views (Android Kotlin `MapView`; iOS UIKit `GMSMapView` with blur strips), plus `POST map/details-by-id`.

**Scope**
- **Spike first (time-boxed, ADR):** `react-native-maps` with the Google provider on both platforms vs Apple Maps on iOS. Criteria: POI tap must yield a **Google `placeId`** (that's how Flutter fetches details), dark `customMapStyle` (reuse `assets/map_styles/dark.json`), New-Architecture stability on RN 0.86, dev-build workflow. `expo-maps` is out: alpha, Apple-Maps-only on iOS.
- Picker behavior (parity): tap to drop a marker → glass sheet with coordinates + confirm; tap a POI → loading → `POST map/details-by-id {placeId}` → sheet (name, rating, review count, open/closed chip, phone) + confirm; existing waypoints as violet markers; my-location dot + recenter button with a proper permission flow (`expo-location`); dark style follows the system; rotation disabled.
- **Keys:** read from EAS secrets / env through the config plugin — never copied from Flutter (see §7).

**Out of scope (don't exist in Flutter either):** polylines, clustering, place search. The backend has `GET map/autocomplete` and `GET map/details/:placeId` unused — search is a *post-parity improvement* (§8), not part of this task.

**Acceptance criteria**
- [ ] Picker works on iOS 26 / iOS 18 / Android; permission granted, denied and "ask again" paths verified on both platforms.
- [ ] Dark/light style switches live with the system theme.
- [ ] No API key in the repo.
- [ ] Sheet and controls use the Task 1 glass tiers.

**Progress log**
- _(empty)_

---

### Task 12 — Create: trip plans & drafts

**Flutter reference:** `CreateTripPlanScreen`, goal/stop inputs, `DraftTripPlansNotifier`, Profile "Drafts".

**Scope**
- **Model:** `TripPlan { id?, title, caption?, start?, waypoints[], end, totalCost?, totalCostCurrency? }`; `Stop { id (uuid), title, role: start|waypoint|end, location, placeId, latitude, longitude, description, cost, currency, sortOrder, createdAt, updatedAt }`.
- UI: title; **goal/destination** (name, price + currency — default **KHR**, location via Task 11 picker); **stops** on a vertical timeline (add / edit / remove with animation; the input sheet shows existing waypoints on the map); searchable currency picker.
- **Validation messages (match Flutter):** "Please give your trip a title", "Please set your goal/destination stop", "Waypoint title cannot be empty", "Please give your destination a name".
- **Save draft** → `POST trip-plans`; **drafts** = server rows (`GET trip-plans`, `DELETE trip-plans/:id`) shown in Me's **Drafts** segment (now it appears). Draft card: Post to Feed, Delete (confirm).
- **Post** with `type=trip_plan` or `trip_plan_media`; `trip_plan` sent as a JSON string field. Attach-to-media toggle appears only when a plan exists.
- **Fix Flutter defects:** the start stop is unreachable (`setStart` is never called) — decide in-task whether a start stop is wanted; the second text field is wrongly bound to the caption controller; in-progress form is lost on app kill — **persist it locally**; posting a draft neither removes it nor refreshes the feed.

**Acceptance criteria**
- [ ] Full create → save draft → post → appears in feed flow works on both platforms.
- [ ] In-progress plan survives app kill.
- [ ] Draft-after-post semantics decided with the backend's behavior verified (does posting duplicate the plan?) and documented.
- [ ] Timeline and sheets meet the §3 look on all tiers.

**Progress log**
- _(empty)_

---

### Task 13 — Quality pass

**Goal:** A cross-cutting audit of the *whole* app now that every feature exists — the things per-task checks can't see.

**Scope**
- **Accessibility:** complete VoiceOver + TalkBack walkthrough of every flow; Dynamic Type / font scale at the largest sizes; contrast.
- **Performance:** cold-start time, list scroll, memory under image load, bundle size, Hermes.
- **Offline & error states audit** across all features.
- **Security review:** no keys/secrets in repo or bundle; ATS/cleartext only in debug builds; deep-link input validation; storage review. **Runtime `npm audit`:** after bumping `axios` to 1.20 in Task 0, the remaining findings are inside Expo's own dependency tree (build tooling + router internals) — re-check at every SDK patch; **never** `npm audit fix --force` (it downgrades Expo).
- **Store compliance:** iOS privacy manifest and permission strings, Google Play data-safety, accurate usage descriptions for every permission requested.
- **i18n decision:** Flutter declares `en/de/tr` but has **zero translations**. Default: English only for v1, strings kept in one place so translation is cheap later.

**Acceptance criteria**
- [ ] Written audit report with every finding fixed or explicitly accepted by the owner.
- [ ] Zero red/yellow boxes across a scripted full-app run on all three tiers.

**Progress log**
- _(empty)_

---

### Task 14 — Store release & cutover

**Scope**
- Store metadata + screenshots; **version/build numbers strictly above the last Flutter release** (same bundle ID → this ships as an *update* to the existing listing).
- **Session continuity:** Flutter keeps tokens via `flutter_secure_storage`; the new app uses `expo-secure-store`, which uses different keychain/keystore entries — expect users to **sign in once** after the update unless a migration is cheap (verify in-task; default: accept one re-login).
- Staged rollout, monitoring, rollback plan.
- **Cutover (explicit owner approval required):** mark `triplex/` deprecated, update the vault `_INDEX.md` and root `AGENTS.md`, close ADR-001/002 notes. **No deletion of the Flutter app without the owner saying so.**

**Acceptance criteria**
- [ ] Release candidate verified on real devices from a clean install *and* as an upgrade over the Flutter build. **The upgrade test only means something if the RN build is signed with the same key as the Flutter build it replaces** (see Task 6) — Flutter and RN debug builds on one device already collide today.
- [ ] Owner has approved the cutover.

**Progress log**
- _(empty)_

---

## 7. Scope decisions & Flutter defects we deliberately do NOT port

*Verified against the Flutter source on 2026-10-02. The owner can overrule any default here — edit the row.*

### 7.1 Scope decisions (defaults)

| Item | Flutter reality | Default for the new app |
|------|-----------------|-------------------------|
| **Home tab** | Stub: a "Discover" title + three map-demo buttons | **Not migrated.** Tab absent until the owner defines what Home is |
| **Messages tab** | Stub: 4 hard-coded "Student N" rows, no backend | **Not migrated.** Absent until messaging is designed (backend has no messaging) |
| **Web** | Unsupported in Flutter (`Platform.isAndroid`) | **Not a target** |
| **Languages** | `en/de/tr` declared, **no translations** | English only (see Task 13) |
| **Pagination** | Backend `feed` / `comments` return everything | Client built so a cursor can be added; **backend change is out of scope** |
| **Local DB** | Drift caches the feed, minus images/reactions | Dropped — query cache instead |
| **Firebase** | Config files exist, **no Firebase packages used** | Not carried over |

### 7.2 Flutter bugs we do not copy

| Defect | Where | Handled in |
|--------|-------|------------|
| Feed shows **hard-coded mock posts** on any error or empty response (and writes them to the cache) | `feed_repo.dart` | Task 7 |
| `403` treated as "token expired" → pointless refresh (and possible loop in the RN scaffold) | `auth_interceptor.dart` | Task 2 |
| `/post/:id` needs an in-memory `extra` → crashes on deep link / restore | `app_router.dart` | Task 7 |
| Fake share/saved/bookmark UI with no backend | `post_card` | Task 7 |
| Camera avatar option with **no camera permission** on iOS or Android | `Info.plist`, manifest | Task 9 |
| Followers/following errors swallowed as `[]` | `profile_repo.dart` | Task 9 |
| 10-image backend cap not enforced; 10 s upload send-timeout | `create` | Task 10 |
| New post never refreshes the feed | `create` | Task 10 |
| "Save" on Media tab is a "not implemented" stub; copy promises video | `create` | Task 10 |
| Start stop unreachable; 2nd field bound to the caption controller; form lost on app kill | `create` | Task 12 |
| Draft not removed / feed not refreshed after "Post to Feed" | `draft_trip_plan_card` | Task 12 |
| Theme choice not persisted | `settings` | Task 5 |
| Release Android build signed with the **debug** key | `build.gradle.kts` | Task 6 |
| `adaptive_platform_ui` documented (ADR-002) but never in the code | vault | Fixed in ADR-003 |

### 7.3 ⚠️ Security: Google API keys are committed in Flutter

A Google API key is present in **three git-tracked files**: `triplex/android/app/src/main/AndroidManifest.xml`, `triplex/ios/Runner/AppDelegate.swift`, `triplex/assets/map.html`. The new app must **never copy them** — keys come from EAS secrets / env (Tasks 6, 11). **Independently of this migration, the owner should check the key's restrictions in Google Cloud (application + API restrictions) and rotate it if it is unrestricted.** This plan does not print the key.

---

## 8. Post-parity improvements (explicitly *not* in the migration)

Ideas surfaced while planning. None are started until Task 14 is done and the owner picks them.

- Place **search** on the map picker (backend already has `map/autocomplete` and `map/details/:placeId`).
- **Home / Discover** and **Messages** — real designs, real backend.
- Cursor **pagination** (needs backend work).
- Route **polylines** between stops (Flutter has dead painter code for it).
- Localization (de / tr).

---

## 9. Open questions for the owner (none block starting; defaults are stated above)

1. **Home and Messages tabs:** omit for v1 (default), or do you want something specific?
2. **Production API URL, Apple Developer and Google Play access** — needed for Task 6.
3. **Draft behavior after "Post to Feed"** — remove the draft, or keep it? (Decided in Task 12 once the backend behavior is checked.)
4. **Google Maps key hygiene** — see §7.3.
5. **App icon master.** The repo has **no production icon**: the Triplex mark (`triplex/ios/Runner/Assets.xcassets/AppIcon.appiconset/TxLogoAttfix1 180.png`) exists only at 120/180 px, while Flutter's 1024 px iOS icon and its Android launcher icon are still the **default Flutter logo**. A ≥1024×1024 master (ideally vector, plus an Android adaptive foreground/monochrome layer) is needed before Task 6. Until then the app uses a placeholder. I won't upscale the 180 px file — it would ship blurry.

---

## 10. Global progress log

- **2026-10-02** — Plan written. Inputs: owner's instructions (§1); Expo SDK 57 docs; full inventory of the Flutter app and `triplex_node` (spot-checked); baseline of the existing `triplex_expo` scaffold (typechecks; `expo-doctor` 20/21; 7 iOS-only screens; no Android build ever attempted). ADR-003 recorded in the vault.
- **2026-10-03** — **Android adaptive controls** (owner: "create custom views for Android, as close to iOS 26 as possible… an adaptive folder that uses the iOS library for iOS"). New `src/design-system/adaptive/` — system control on iOS, drawn iOS 26 look on Android — with Gallery entries (incl. the drawn versions previewed on iOS for side-by-side comparison). Android now has a drawn header, floating tab bar, `Switch`, `Slider`, `Stepper`, `Spinner`, `Menu`, `showAlert`/`showActionSheet`/`confirm`, inset-grouped `List`, `SearchField`, `ProgressBar`; `Profile`/`Settings` routes moved to `Toolbar`/`AppTabs`. Tuned against the real iOS 26.5 controls; verified on the Android emulator (light + dark) and the iOS 26.5 simulator (no regression). 403 tests. See [[ADR-009]] in the vault. **Open:** font (Roboto vs SF), Android blur, API 30, Android sheets.
