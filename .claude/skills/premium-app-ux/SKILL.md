---
name: premium-app-ux
description: Audit, design, or build app interfaces so they feel premium rather than commodity, using a three-pillar framework (complete system-state coverage, cross-screen consistency, and failure/recovery design). Use this skill whenever the user asks to review, critique, or audit an app, screen, mockup, prototype, Figma file, screenshot, or UI code; asks how to make their app feel more polished, premium, trustworthy, or "worth paying for"; is building screens or flows with AI tools and wants them production-ready; or asks about loading, empty, error, offline, quota/limit, payment-failure, undo, or onboarding states. Also use it proactively when Claude itself is building a UI flow, so the happy path doesn't ship without its unglamorous states, even if the user never says "premium".
---

# Premium App UX

A good-looking interface gets an app *picked*. What makes people call it *premium* — and pay more for it — is accumulated evidence, during real use, that the product was thought through. Users don't have a single "premium detector"; they keep a quiet running score. Every moment of "did my tap work?", "can I go back?", or "wait, is this the same app?" costs points. Every moment where the app anticipated them earns points.

Because everyone now has the same AI coding agents and pattern libraries, a clean-looking UI takes a day to produce, and everything looks alike. That's the **commodity ceiling**. Visual polish alone no longer clears it. The three places that do are exactly the ones AI tools and stock component libraries tend to skip:

1. **System states** — what the app shows *between* and *around* the happy-path screens.
2. **Connective tissue** — whether screen 80 agrees with screen 1.
3. **Failure recovery** — what happens in the user's worst, most anxious moment.

Read `references/research.md` when the user wants the evidence behind a recommendation, or when citing a finding would help persuade a stakeholder.

---

## Modes

Figure out which of these the user needs, then follow that section. Many requests mix them.

- **Audit** — they've shared screenshots, a link, a mockup, a Figma file, or code and want to know what's wrong. → *Audit workflow*
- **Build** — they want Claude to create or extend screens/components/flows. → *Build rules*
- **Advise** — they're asking a conceptual question ("how do I make my app feel more premium?", "how should I handle payment failures?"). → Answer directly from the pillars below, concretely, tied to their product if you know it.

---

## Pillar 1 — Kill "design theater" (complete state coverage)

**Design theater** is an interface that looks complete in screenshots but omits the unglamorous mechanics: showing what the system is doing, letting users undo, and helping them recover when input falls short. AI-generated UIs are prone to it — the reasoning about these states often gets *explained* but never *implemented*.

At every interaction in the core flow, three things should be true:

1. **The user knows what the system is doing and what just happened.** Pressed states, progress, saving/saved indicators, confirmation of completion. No silent taps.
2. **The user knows how to take it back.** Undo, cancel, edit, restore — visible, not buried. Destructive actions either confirm or (better) are undoable.
3. **The user knows what to do next.** One obvious next action after every step, including after errors and on empty screens.

**Never give "nothing" for effort.** When a user invests effort (records something, fills a long form, runs a test) and the input falls short of a threshold, don't throw it away with "too short to count." Give partial value: save the draft, show what was captured, explain what's needed and how close they got. People who expected *anything* and received *nothing* feel robbed, and that's where they churn.

States to check for every meaningful screen or action: idle, pressed/active, loading/in-progress, success, partial success, empty (first-use and cleared), error (recoverable and not), offline, permission denied, limit reached, and too-short/invalid input.

## Pillar 2 — Strengthen the connective tissue (cross-screen consistency)

Teams build and review one screen at a time. Users live in the app as *one continuous product* for months, where screen 80 sits right next to screen 1. AI agents make it trivially easy to ship 80 screens that subtly disagree on layout, terminology, and data presentation.

Inconsistency costs far more than users report. Moving a navigation element mid-task can more than double time on page and keep people slower afterward — while they insist it barely affected them. So you won't hear about these problems in feedback, and you won't see them cleanly in analytics. You have to look.

What to enforce:
- **Same position, same job.** Navigation, primary actions, back/close, and destructive buttons stay where they are across screens.
- **Same words for the same thing.** One term per concept ("session" vs "entry" vs "recording" — pick one). Same button verbs for the same action.
- **One pattern per state.** If two screens represent the same underlying state (quota exhausted, paywall, sync error), they should be the *same reusable component*, not two lookalikes.
- **Exact data over vague copy.** Status messages should carry the specific facts.

The canonical example — a usage limit:

| Commodity | Premium |
|---|---|
| Two different screens, each saying "You've used all your sessions." No count, no reset date. | One shared component everywhere: a count badge (`2 of 2 sessions used`), period-specific copy ("You've used both sessions this month"), and the exact refresh date ("Resets on Nov 1"). Plus a next step (upgrade, or a reminder when it resets). |

Hundreds of micro-decisions like this are what make an app feel like one coherent thing someone cared about.

## Pillar 3 — Design the worst moments (service recovery)

This is where "premium" stops being subjective. When a failure is handled exceptionally well, users can end up as satisfied as — sometimes more than — if nothing had gone wrong (the *service recovery paradox*). The feeling to engineer is: *"That went wrong, but they caught me."* Meanwhile, a meaningful share of people will leave after a single bad experience, and it's usually a bad failure, not a mediocre home screen, that drives them away.

Most teams skip failure states and AI tools handle them poorly, which makes them **the cheapest place in the product to buy the feeling of premium**.

High-stress moments to design deliberately: payment declined or failed midway, connection lost while saving, API timeout during a high-stakes action, data that seems missing, account/security alerts, anything involving the user's money, health, or irreplaceable content.

A premium failure state:
1. **Reassures first.** Say what is safe ("Your entry is saved on this device", "You haven't been charged").
2. **Says what happened in plain language.** No error codes as the headline.
3. **Gives the exact diagnostic step.** "Check that your card has enough balance" — not "Something went wrong."
4. **Embeds the recovery action in the alert itself.** Retry, Use another card, Contact support — one tap, right there. Don't make an anxious user go hunting.
5. **Preserves their work.** Queue offline actions, keep form contents, resume where they left off.

Dead ends can even become delight — the classic example is Chrome's offline T-Rex game, which turned a failure page into something played hundreds of millions of times a month. Not every app needs a game, but every dead end deserves the same care as the success screen.

---

## Audit workflow

When reviewing someone's app, work through the four stages below, scaled to what they've given you. If you only have a few screenshots, say which stages you could and couldn't assess rather than guessing.

1. **Core-flow state audit (Pillar 1).** Walk the primary flow interaction by interaction. At each step: is system status visible? What happens on short/invalid input? Can it be undone? Is the next step obvious? List the states that are missing — loading, empty, error, offline, etc. — not just the ones that look off.
2. **Continuity check (Pillar 2).** Compare screens against each other, not just individually. Flag shifts in nav placement, button position, modal style, terminology, and any duplicate-but-different patterns for the same state. Recommend the user do a real continuous one-hour session in the live build, logging every moment it "stops feeling like the same product" — screen-by-screen review in a design tool misses this.
3. **Status-pattern unification (Pillar 2).** Find every screen communicating a limit, quota, plan, or system status. Propose merging them into one component with count + period + reset date + next action.
4. **Break-it-on-purpose (Pillar 3).** Enumerate failure modes the user should trigger deliberately: cut Wi-Fi mid-save, force a declined payment, time out the API, empty every list and dashboard. For each, describe the premium version of that state.

### Audit report format

Lead with the few highest-leverage fixes, then the detail. Use this structure:

```
## Top fixes
[3–5 items, highest impact first. Each: what's wrong → the specific fix → which pillar.]

## Pillar 1 — System states
[Findings per flow step. Name the missing states explicitly.]

## Pillar 2 — Consistency
[Cross-screen mismatches; duplicate patterns to unify; vague copy to replace with exact data.]

## Pillar 3 — Failure & recovery
[Each failure mode: current behavior (or "not designed") → premium version, with suggested copy and the embedded action.]

## Not assessed
[What you couldn't evaluate from the material provided, and how to check it.]
```

Be concrete. "Improve error handling" is useless; "The payment-failed toast should say 'Your card was declined — you haven't been charged' with *Try another card* and *Contact support* buttons inside it" is useful. Write the actual microcopy whenever you can. Prioritize honestly — not every gap matters equally, and failures involving money or lost work come first.

---

## Build rules

When Claude is writing UI code or designing screens, don't perform design theater yourself. Explaining a loading or error state in prose but not implementing it is precisely the failure this skill exists to prevent.

- **Implement the states, don't describe them.** For each async action, build the loading, success, and error states in the actual code. For each list or dashboard, build the empty state. If something's out of scope, say so plainly in one line instead of implying it's handled.
- **Give every error an action.** Error UI includes a retry or alternative path and, for high-stakes flows, a support route.
- **Make destructive actions undoable** where feasible (undo toast with a few seconds' grace), otherwise confirm with specific copy ("Delete 3 recordings?").
- **Reuse, don't re-invent.** Before creating a new status/limit/error component, check whether one exists in the codebase or earlier in the conversation and extend it. Keep naming and placement consistent with existing screens.
- **Use exact data in status copy** — counts, dates, amounts — wired to real variables, not hard-coded vague strings.
- **Preserve user effort** — keep form state on error, autosave drafts, and handle too-short input with partial output plus guidance.
- After building, do a quick self-check against the three questions (what's happening / how to undo / what's next) and the failure list, and fix gaps before presenting.

---

## Quick checklist

Use when the user wants a checklist, or as a final pass.

**System states**
- [ ] Every tap/submit shows immediate feedback
- [ ] Loading and saving states exist for every async action
- [ ] Short or invalid input yields partial value + guidance, never "nothing"
- [ ] Undo/cancel is available and visible for meaningful actions
- [ ] Every screen, including empty and error screens, has a clear next step

**Consistency**
- [ ] Navigation and primary actions stay in the same place on every screen
- [ ] One term per concept across the whole app
- [ ] Same underlying state → same single component
- [ ] Limit/quota messages show exact count, period, and reset date
- [ ] App tested in a continuous real-use session, not only screen by screen

**Failure & recovery**
- [ ] Offline mid-task tested; work is preserved and resumes
- [ ] Payment/transaction failure says what's safe, what to check, and offers in-alert recovery
- [ ] API timeouts handled with retry
- [ ] Every empty state designed with the same polish as success screens
- [ ] Support is one tap away in high-stress moments
