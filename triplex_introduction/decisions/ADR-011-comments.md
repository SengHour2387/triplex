# ADR-011: Comments — optimistic everything, one cache, the post's reaction machinery reused

**Date:** 2026-10-27
**Status:** Accepted — iOS 26.5 verified on a temp simulator against the local backend; Android, iOS 18, iPad not run
**Deciders:** Project owner (Task 8 of the migration plan), Claude (implementation)
**Context link:** [[ADR-010-feed-and-posts]], [[ADR-005-rn-api-layer-and-error-model]], [[ADR-009-adaptive-controls-ios-native-android-drawn]]

---

## Context
Task 8 ports Flutter's `CommentsSheet` / `CommentTile`: a sheet with a list, one level of lazily loaded replies, comment reactions, delete-own, and a composer. Reading the backend (`commentController.js`, `likeController.js`) found things the API doc does not say:
- A **deleted comment comes back with `content: null` and `user: null`** — there is no author to show.
- A comment reaction answer has **per-type counts and `my_reactions`, no total** (a post's has `likes_count`).
- The delete route is **`DELETE comments/comment/:id`**; the RN `Endpoints.comments.delete` pointed at `comments/:id`, which is not a route (fixed).
- A reply to a reply is refused by the server (`comment/parent_not_found`): the parent must be top-level.

## Decisions
1. **Same shape as posts: the query cache is the only place a comment lives.** `['comments','post',postId]` holds the top-level list, `['comments','replies',commentId]` a thread's replies; every change goes through `patchComment` / `appendComment` / `removeComment` / `confirmComment` (`model/commentCache.ts`), so the sheet and the post screen can't disagree. Which threads are open, the draft and who it replies to are screen state (`useCommentsController`), not cache.
2. **Add, delete and react are all optimistic, with rollback.** *Add:* a placeholder (`pending: true`, "Sending…", can't be liked / replied to / deleted) appears and for a **top-level** comment the post's `commentCount` goes +1 on every cached copy (`adjustCommentCount` → `patchPost`); a reply doesn't touch it; the server's copy replaces it in place; on failure both are taken back, the reason is toasted (the query client's default) and **the text returns to the box** — nothing the user wrote is lost. *Delete:* the row reads "This comment was deleted." (no count change); on failure it comes back and the list is invalidated (a 410 "already deleted" is then corrected by the refetch). *React:* see 3.
3. **Comment reactions reuse `ReactionSync`** (ADR-010 #2), now generic over anything with `myReaction` / `reactionCount`. The comment's count after a reaction is the **sum of the answer's per-type counts**. Same long-press `ReactionPicker`, same screen-reader actions.
4. **Replies are one level deep.** `threadRoot(comment)` maps a reply to a reply onto its top-level parent (`POST comments/:parentId/replies`). Replying opens that thread. If its replies aren't loaded when a reply is sent, they are fetched first (or the list is seeded empty when `replies_count` is 0) so the placeholder never hides older replies.
5. **A deleted comment has no author** (schema allows `user: null` only when `is_deleted`; a live comment without one is an `invalid_response`).
6. **UI:** one `ComposerBar` primitive in the design system (glass bar: avatar, growing text box, round send button, "Replying to @x" strip; in the Gallery) used by `CommentsSheet` (native formSheet route `comments/[postId]`, detents 0.75 / 1) and by the post screen, which now lists the comments under the card with the composer pinned at the bottom. Both lift the composer by the keyboard's height (`useKeyboardHeight`) — `KeyboardAvoidingView` left it under the keyboard inside the form sheet (found on device). The count on a feed card opens the sheet; on the post screen it is a plain stat.
7. **Not ported from Flutter:** the amber/blue tinted counts (contrast), tappable avatar / username (profiles are Task 9), Flutter's wipe-the-list-on-refresh (`state = loading`).

## Consequences
- `features/posts` now exports what comments share (`ReactionPicker`, `ReactionSync`, `FeedMessage`, `adjustCommentCount`, the wire helpers) through its index.
- **Measured against the real backend:** `posts.comments_count` (maintained outside this repo) goes +1 per **top-level** comment, does not change for a reply, and does not go down on delete (the deleted row stays, listed as deleted). The client mirrors exactly that.
- `features/comments` must not read runtime values from `features/posts`'s index at module level (that index loads the post screen, which loads comments — a cycle that crashed the app at launch). Model files import posts' model files directly; hooks and components may use the index (used at call time).
- No pagination for comments (the backend returns all) — [[todo/TODO-004-comments-backend-notes]].
