# TODO-005: Premium-UX audit of the Expo app — fixes

**Date Created:** 2026-10-28
**Created By:** agent (premium-app-ux skill audit, source review only — nothing was run on a device)
**Status:** In Progress (fix 1 coded and unit-tested; **not yet device-verified**)
**Affects:** triplex_expo — toasts, mutations, error states, auth
**Priority:** Medium

---

## Fix 1 — action-specific failure toasts with Retry (coded 2026-10-28)
- `core/errors/failureCopy.ts` `describeFailure`: "Couldn't <what>. <cause>. <what became of their work>"; Retry only for transient kinds (network / timeout / server) — a refusal (4xx) keeps the server's own text and no Retry.
- `core/notify.ts` `notifyError(error, { action, retry })`; toasts with a button stay 10 s (`toastDisplayMs`), plain ones 4 s.
- Wired: post + comment reactions (Retry re-asks for the user's last wish — `ReactionSync.onFailure` now receives `{id, desired}`), comment delete (Retry), add comment ("Your text is still in the box."), repost ("Your note is still here."; the sheet's button is the retry). These mutations are `meta: { silent: true }` so the query client's generic toast doesn't double up.
- 616 unit tests, `tsc`, ESLint clean.
- [ ] **Device check on iOS 26 sim** — the simulator tooling did not respond in the session (`simctl` hung, no booted device). Check: like in airplane mode → toast has Retry, stays ~10 s, Retry re-sends; delete comment offline; send comment offline (see next item).

## Fixes 2–4 (coded 2026-11-13, unit-tested, not device-verified)
- **Sign-out:** `authStore.logout` now catches a failed credential wipe (logged) so `void logout()` can't reject; the session still ends. There is **no server revoke** — `AuthApi.logout` only clears secure storage.
- **Post detail pull-to-refresh:** spinner follows a local `refreshing` state around post + comments refetch (not the query's `isRefetching`, which is true on open from the feed).
- **Offline mutations:** default `networkMode: 'always'` — a send/delete/react fails at once (toast + Retry, text kept) instead of pausing until reconnect. Trade-off: no "will send when back online" queue.
- **Audit correction:** "forced sign-out is silent" was wrong — `authStore` sets "Your session has expired…" and `useAuthForm` leaves it showing on the login screen. Nothing to fix.
- 617 tests, `tsc`, ESLint clean.
- [ ] **Owner check:** (a) airplane mode → send a comment: fails at once, Retry works, text stays; (b) open a post, pull down: spinner shows; (c) Settings → Sign out works.

## Still open from the audit
- [x] ~~Verify whether mutations pause offline~~ → fixed above (fail fast). Original note: whether mutations pause offline (TanStack `networkMode: 'online'` default + `onlineManager` from expo-network): a comment sent in airplane mode may spin until reconnect instead of failing. Decide: `networkMode: 'always'` for these, or a visible "will send when back online" queue.
- [ ] Offline banner with last-updated time when cached data is shown (feed snapshot).
- [ ] Toast queue instead of replace (a second error erases the first).
- [ ] `+not-found` route and root `ErrorBoundary`.
- [x] Sign out: unhandled rejection fixed; no confirm by choice (iOS convention).
- [ ] Login: "Forgot password?" — check `triplex_node/api_doc.md` for a reset endpoint.
- [ ] Post detail pull-to-refresh passes `refreshing={false}` (no spinner) — verify on device.
- [ ] Consistency: profile error → `FeedMessage`; one retry verb ("Try again"), "Couldn't load …" wording, one Sign in / Sign out vocabulary, toast punctuation.
- [ ] Broken image tile: tap to retry.
