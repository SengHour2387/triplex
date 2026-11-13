# TODO-002: Verify the glass fallback (tier B) on a real iOS 18 run

**Date Created:** 2026-10-03
**Created By:** agent
**Status:** Done (2026-10-03)
**Affects:** triplex_expo — design system (Task 1 close-out)
**Priority:** High (Task 1 cannot be called done without it)

---

## Goal
Confirm the iOS < 26 fallback (`BlurView` system material) looks right on a real iOS 18 OS.

## What is known
- The same debug build is already installed on the iPhone 16 Pro (iOS 18.5) simulator.
- The simulator-control tool needs the owner to click **"Let Claude use it"** for that device; it was pending when this note was written.
- Interim evidence only: tier B's code path was forced on an iOS 26.5 device (gallery → *Forced surface → Blur*) and rendered correctly. That is **not** a substitute for the real OS.

## Acceptance Criteria
- [ ] iOS 18.5 gallery screenshot, light + dark: blur surfaces, buttons, fields, toasts all correct.
- [ ] Reduce Transparency on iOS 18 → solid surfaces.
- [ ] **Native sheets on iOS 18** (gallery → Sheets): resizable + compact. Expect the standard system sheet material (not glass); confirm the transparent screen background doesn't produce an odd or see-through sheet, and that the glass close button (tier B blur) looks right.
- [ ] Toast above a sheet on iOS 18 (`FullWindowOverlay`).

## Result (2026-10-03)
Access granted; ran on the iPhone 16 Pro (iOS 18.5) simulator.
- [x] Gallery: surface mode auto-detects **B · Material blur (iOS < 26)**; glass, buttons, fields, icons, toasts correct in light. Dark: glass + buttons + both sheets checked.
- [x] Reduce Transparency → every glass surface becomes an opaque surface, live.
- [x] Native sheets (resizable + compact): drag to full, drag-to-dismiss, close button, light + dark.
- [x] Toast above a sheet (`FullWindowOverlay`) works.
- **Bug found:** sheets were see-through (transparent screen background is only right where the system draws the glass). Fixed — see ADR-004 addendum.
- Not captured on iOS 18: text fields / toasts in dark mode.

## Progress Log
- 2026-10-03: Created; forced-mode preview done on iOS 26.5.
- 2026-10-03: Real iOS 18.5 run completed; one bug fixed; closed.
