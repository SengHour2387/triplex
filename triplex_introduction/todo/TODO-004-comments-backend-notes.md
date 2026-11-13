# TODO-004: Comments — backend notes and unverified items

**Status:** backlog / to check (found in Task 8, 2026-10-27)

## Backend (`triplex_node`)
- **No pagination:** `GET comments/:postId/comments` and `…/replies` return every row.
- **`posts.comments_count`** is read by the feed but nothing in the repo writes it (no trigger in the SQL here). Measured on the local backend: +1 per top-level comment, unchanged by replies and deletes (so it counts deleted comments). Probably not the intent — decide with the backend owner; the client mirrors today's behaviour (ADR-011).
- A **deleted top-level comment is still listed** (`content: null`, `user: null`) and keeps its replies; `replies_count` is a stored column, not recomputed.
- Comment reaction answers carry per-type counts and no total; `POST …/like` **upserts** (as posts do) — the toggle is client-side.
- `DELETE comments/comment/:id` uses `authenticateToken`, the others `authenticate` — worth confirming they behave the same on an expired token.
- `api_doc.md` §3.8 doesn't mention that a deleted comment has no `user`.

## Not yet verified on a device (Task 8)
The long-press reaction picker on a comment; rollback on device (offline / refused); largest text size, Reduce Motion, VoiceOver; Android; iOS 18; iPad. (Done on iOS 26.5: add, like, reply, reply-to-reply, delete, keyboard on the sheet and the post screen.)
