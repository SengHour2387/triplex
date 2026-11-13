# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# This app is the Flutter → React Native migration

**Read [`MIGRATION_PLAN.md`](./MIGRATION_PLAN.md) before doing any work here.** It holds the task order, scope and Definition of Done.

The owner's instructions (verbatim source in the plan, §1) — these are binding:

- Goal: move from Flutter to React Native for **real native feel** — native **Liquid Glass** on iOS and a **proper, good-looking Android fallback, not stock Material UI**.
- Work **one task at a time**, in the order of the plan. Don't start the next task until the current one is finished.
- **Quality over task count.** Each task must be good, perfect and **shippable** before moving on.
- Every task is verified on **iOS 26, iOS 18 and Android** — not just typechecked.
- `triplex/` (Flutter) is a **read-only reference**. Don't edit it.

Hard rules that follow from that:

- **Build UI from the Gallery.** Before writing any screen UI, open `app/gallery.tsx` (in a dev build: Profile → Settings → *Design gallery*) and the exports of `src/design-system/index.ts`, and assemble the screen from those: `Screen`, `Glass`, `GlassButton`, `GlassRow`, `TextField`, `OptionPicker`, `Text` (its variants), `Icon`, `toast`, `SheetHeader` + `useSheetOptions`, and the **adaptive set** — `Switch`, `Slider`, `Stepper`, `Spinner`, `ProgressBar`, `List` / `ListSection` / `ListRow`, `SearchField`, `Menu`, `showAlert` / `showActionSheet` / `confirm`, `Toolbar`, `AppTabs` — and the tokens (`spacing`, `radii`, `useTheme().colors`). Do **not** hand-roll a card, button, field, row, toast or sheet inside a feature, and don't hard-code colours or font sizes. Plain `View` / `Pressable` are for layout only. If a screen needs something the Gallery lacks, add it to `src/design-system/` as a primitive **and add it to the Gallery** (every state, light + dark) in the same change, then use it. A one-off styled component in a feature is a defect.

- **Navigation chrome goes through the adaptive set, not the router's native pieces.** Header buttons/menus: `<Toolbar placement items={…}/>` (never `Stack.Toolbar` in a screen). Bottom tabs: `<AppTabs tabs={…}/>` (never `NativeTabs` directly). Alerts / confirmations / action sheets: `showAlert` / `confirm` / `showActionSheet` (never `Alert.alert` or `ActionSheetIOS` directly). A hand-built `ScrollView` adds `useScrollInsets()` to its content padding. Why and how: vault `decisions/ADR-009-adaptive-controls-ios-native-android-drawn.md`; conventions: `src/design-system/adaptive/README.md`.
- `@expo/ui/swift-ui` is iOS-only: import it **only from `*.ios.ts(x)` files**. Feature code never branches on `Platform.OS` for visual style — only `src/design-system/` does.
- Never copy API keys from the Flutter app. Keys come from env / EAS secrets.
- After a non-trivial task, follow the repo-root `AGENTS.md` post-task checklist (vault `_INDEX.md`, task note, ADR if a significant choice was made).
