# Triplex (React Native / Expo)

The React Native client for Triplex — a location-based social app. It is the **replacement for the Flutter app** in `../triplex/`.

> **Working on this app? Read [`MIGRATION_PLAN.md`](./MIGRATION_PLAN.md) first.** It defines the task order, scope and Definition of Done, and contains the owner's binding instructions.

- **Stack:** Expo SDK 57 · React Native 0.86 · React 19.2 · TypeScript (strict) · expo-router
- **Backend:** `../triplex_node` (unchanged; contract in `../triplex_node/api_doc.md`)
- **Runs as a development build**, not Expo Go (native modules, custom config).

## Requirements

| Tool | Version | Notes |
|------|---------|-------|
| macOS + Xcode | Xcode **26.4+** (developed on 26.6) | iOS 26 simulator needed to see real Liquid Glass |
| Node | **≥ 22.13** | |
| CocoaPods | any recent | set `LANG=en_US.UTF-8` or it warns/fails |
| JDK | **17** | Not the machine default if that is 24/25 — see below |
| Android SDK | platform **36**, build-tools 36 | Emulator image: API 36 |

## Setup

```bash
npm install
```

Run the backend (`../triplex_node`) on port 3000 if you want live data.

## Run

Native projects are **generated** (`ios/` and `android/` are git-ignored — Continuous Native Generation). Don't edit them by hand; change `app.config.ts` or a config plugin and regenerate.

```bash
# iOS (dev build). Pick a simulator by name or UDID:
npm run ios -- -d "iPhone 17 Pro"

# Android (dev build) — Gradle needs JDK 17 and to be told where the SDK is
# (add these to your shell profile once; Gradle fails with "SDK location not found" without them):
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME=$HOME/Library/Android/sdk
npm run android -- -d <avd-name>      # the AVD *name* (e.g. Pixel_10_Pro_XL_2), not the adb serial

# JS only, once a dev build is installed:
npm start
```

**Connecting the iOS dev build.** `npm run ios` builds and installs the app, but on some Macs its final "open" step fails (it uses System Events via `osascript`, which needs an Automation permission). If the app opens to the dev launcher instead of your screen, start Metro (`npm start`) and tap your server in the launcher, or run:

```bash
xcrun simctl openurl booted "exp+triplex://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"
```

(then confirm the "Open in Triplex?" dialog). On Android the equivalent is `adb reverse tcp:8081 tcp:8081` followed by `adb shell am start -a android.intent.action.VIEW -d "exp+triplex://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081" com.templex.triplex`.

> **Same app ID as the Flutter app.** If the Flutter build (`com.templex.triplex`) is installed on a simulator/emulator, Android refuses to install this one (`INSTALL_FAILED_UPDATE_INCOMPATIBLE`) — uninstall the Flutter app from that device first. Never do this on a device with a store install you care about.

Regenerate the native projects after adding a native dependency or changing `app.config.ts`:

```bash
npm run prebuild
```

> **Config-plugin changes need a prebuild first.** `npm run ios` (`expo run:ios`) rebuilds but does **not** re-apply plugins to an existing `ios/`. Adding `expo-image-picker` without running `npx expo prebuild --platform ios` shipped a build with no `NSCameraUsageDescription`, and tapping *Camera* crashed the app (iOS aborts on a missing usage string). A new native *dependency* alone is picked up by the pod install; a new *plugin option* is not.

## API URL

| Situation | What happens |
|-----------|--------------|
| Dev build, no setting | iOS simulator → `http://localhost:3000/api/` · Android emulator → `http://10.0.2.2:3000/api/` |
| Physical device | Set `EXPO_PUBLIC_API_URL=http://<your-LAN-IP>:3000/api` |
| **Release build** | `EXPO_PUBLIC_API_URL` is **required** — the app refuses to start without it (it never silently targets `localhost`) |

Copy `.env.example` to `.env.local` to set it. Plain-HTTP traffic is permitted in **debug builds only**.

## Quality gates

```bash
npm run check       # typecheck + lint + tests — must pass before a task is considered done
npm run typecheck
npm run lint
npm test
```

## Platform guard rails (enforced by lint)

- `@expo/ui/swift-ui` is iOS-only → import it **only from `*.ios.ts(x)`** files.
- `@expo/ui/jetpack-compose` is Android-only → **only from `*.android.ts(x)`** files.
- The universal `@expo/ui` renders Jetpack Compose **Material** on Android (the look this app avoids) → **blocked everywhere**; use the design-system primitives.

Feature code never branches on `Platform.OS` for visual style; only `src/design-system/` does. See `MIGRATION_PLAN.md` §3.

## Placeholders to be aware of

- **Icon and splash artwork are Expo template placeholders.** No production icon master exists in the repo yet (`MIGRATION_PLAN.md` §9 #5). Replace before the first distributable build (Task 6).
- `app/index.tsx` is a temporary diagnostics screen. Task 4 replaces it with the real app shell.
