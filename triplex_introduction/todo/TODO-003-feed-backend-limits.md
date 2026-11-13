# TODO-003: Feed backend limits found during Task 7

**Date Created:** 2026-10-03
**Created By:** agent
**Status:** Backlog
**Affects:** triplex_node (`postController.js`, `likeController.js`), feed
**Priority:** Medium (none blocks the migration; the first two matter once the feed has real traffic)

---

## Goal
Record what the RN feed has to work around, so a backend pass can remove the workarounds.

## Findings
- [ ] **No pagination.** `GET posts/feed` returns every non-deleted post, newest first, with *N+1* queries per post (media, trip stops, nested repost). The RN app asks once and keeps the newest 30 on disk. Needs a cursor (`?before=<created_at>&limit=`) before the feed grows.
- [ ] **The feed isn't personalised.** It is all posts, not the people you follow.
- [ ] **`GET likes/:postId/likes` → `total`** is the length of the capped (50) user list, not the number of reactions. The app sums the per-type counts instead.
- [ ] **`POST likes/:postId/like` upserts**; `api_doc.md` §3.9 says choosing the same reaction again removes it — it doesn't. (The app toggles client-side.) Fix the doc or the behaviour.
- [ ] **A repost of a repost** nests the middle repost but not the original (depth limit 1). The app avoids it by always reposting the original; the API still allows the chain.
- [ ] **The author's email** is sent with every post (`user.email`). The app drops it at the boundary; the API shouldn't expose it.
- [ ] **No per-type reaction breakdown in the feed payload.** The card's emoji stack therefore fetches `GET likes/:id/likes` per visible post with reactions; adding the top 3 `{type,count}` to each feed post would remove those requests.
- [ ] **No `comment_preview`, `saved_count`, `share_count`** — Flutter's UI for them was fake; not rebuilt.

## Progress Log
- 2026-10-03: Logged from Task 7 (see [[decisions/ADR-010-feed-and-posts]]).
