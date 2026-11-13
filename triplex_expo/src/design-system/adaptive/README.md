# `design-system/adaptive/` — iOS 26 on both platforms

**iOS gets the system control. Android gets a drawing of it in the iOS 26 style.** Screens import
the plain name (`Switch`, `Menu`, `AppTabs`, …) from `src/design-system` and never branch on
`Platform.OS`. Decision record: vault `decisions/ADR-009-adaptive-controls-ios-native-android-drawn.md`.

## Layout of a component

| File | Role |
|---|---|
| `Foo.tsx` | Switchboard for **Android** (any non-iOS platform): `export { DrawnFoo as Foo }` |
| `Foo.ios.tsx` | The **system** control (`@expo/ui/swift-ui`, `Alert`, `ActionSheetIOS`, `NativeTabs`, …). The only place SwiftUI may be imported. |
| `drawn/DrawnFoo.tsx` | The drawn version — platform-neutral, so Jest can test it and the Gallery can show it on iOS next to the native one |
| `types.ts` | Props shared by both, so a screen writes `<Foo/>` once |

Controls that are really *layout* (`List`, `SearchField`, `ProgressBar`) are one JS drawing for both
platforms and have no `.ios` file.

## Adding one

1. Look at the **real iOS 26 control in the iOS simulator first** and screenshot it; draw the Android one
   from that, not from memory (alerts left-align, action sheets are one card of capsules, menus lead with
   the icon — all found that way).
2. Props in `types.ts`; accessibility name required for anything icon-only or label-less.
3. Colours / radii / type from the tokens only (`useTheme()`, `radii`, `Text` variants). A new colour
   needs a contrast test in `tokens.test.ts`.
4. A surface that floats over content on Android uses `<Glass opaque>` (no blur → text ghosts through).
5. Add it to the Gallery (`src/gallery/AdaptiveSections.tsx`): every state, light + dark, and — if it has a
   native iOS version — the drawn one under "Drawn versions" for comparison.
6. Tests: pure logic in `adaptiveLogic.test.ts`; behaviour in `adaptive.test.tsx`. Jest runs as **iOS**, so
   import the `Drawn*` component directly to test the Android drawing.
7. Verify on the Android emulator **and** the iOS simulator, light and dark.

## Gotchas found on device

- `Stack.Toolbar` children are read **by element type** — hence `Toolbar` takes `items`, not children.
- Android Modals are their own window: they cover `ToastHost`.
- The Android header is in the layout flow (opaque); `Screen underHeader` therefore adds **no** top padding there.
- Testing Library refuses events on a view whose `onStartShouldSetResponder` returns false — the slider needs
  `onLayout` called directly in tests (`measure()` helper).
- A `formSheet` route that holds a `ScrollView` must have exactly **two** children — the header and the `ScrollView` — and the header needs `collapsable={false}`. Otherwise React Native flattens the header view away, the sheet miscounts, and the scroll content is laid **over** the header (react-native-screens logs "FormSheet with ScrollView expects at most 2 subviews" in Metro). Found on the repost sheet; see ADR-010.
