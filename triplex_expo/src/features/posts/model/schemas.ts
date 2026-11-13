import { z } from 'zod';

import type { Post, PostAuthor, TripPlan, TripStop } from './post';
import { toReactionType, type ReactionType } from './reactions';

/**
 * Wire format (`triplex_node/controllers/postController.js`) → the app's `Post`.
 *
 * Node's `pg` returns NUMERIC columns (`total_cost`, a stop's `cost`) and `COUNT(*)` as *strings*, so
 * money and counts go through lenient converters: a malformed number is `null` / `0`, it never fails
 * the whole feed. A *structurally* wrong post (no id, no author) does fail — better a visible error
 * than a card full of `undefined`.
 */

const lenientNumber = z.unknown().transform((value): number | null => {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : Number.NaN;
  return Number.isFinite(n) ? n : null;
});

/** A server count (`COUNT(*)` arrives as a string): a non-negative integer, `0` when malformed. Shared with comments. */
export const count = lenientNumber.transform((n) => (n === null ? 0 : Math.max(0, Math.trunc(n))));

/** The `user` object on a post or a comment. */
export const authorSchema = z
  .object({
    id: z.string(),
    username: z.string(),
    name: z.string().nullish(),
    avatar_url: z.string().nullish(),
  })
  .transform(
    (u): PostAuthor => ({ id: u.id, username: u.username, name: u.name?.trim() || null, avatarUrl: u.avatar_url?.trim() || null }),
  );

const stopSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullish(),
    cost: lenientNumber.optional(),
    currency: z.string().nullish(),
  })
  .transform(
    (s): TripStop => ({
      id: s.id,
      title: s.title,
      description: s.description?.trim() || null,
      cost: s.cost ?? null,
      currency: s.currency?.trim() || null,
    }),
  );

const tripPlanSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    caption: z.string().nullish(),
    total_cost: lenientNumber.optional(),
    total_cost_currency: z.string().nullish(),
    start: stopSchema.nullish(),
    waypoints: z.array(stopSchema).nullish(),
    end: stopSchema.nullish(),
  })
  .transform(
    (t): TripPlan => ({
      id: t.id,
      title: t.title,
      caption: t.caption?.trim() || null,
      totalCost: t.total_cost ?? null,
      currency: t.total_cost_currency?.trim() || null,
      start: t.start ?? null,
      waypoints: t.waypoints ?? [],
      end: t.end ?? null,
    }),
  );

const mediaSchema = z.object({ cloud_url: z.string(), sort_order: z.number().nullish() });

const baseShape = {
  id: z.string(),
  type: z.string().nullish(),
  caption: z.string().nullish(),
  created_at: z.string(),
  user: authorSchema,
  media: z.array(mediaSchema).nullish(),
  media_urls: z.array(z.string()).nullish(),
  tripPlan: tripPlanSchema.nullish(),
  repost_id: z.string().nullish(),
  likes_count: count.optional(),
  comments_count: count.optional(),
  reposts_count: count.optional(),
  repost_count: count.optional(),
  my_reaction: z.string().nullish(),
  is_liked: z.boolean().nullish(),
  is_reposted: z.boolean().nullish(),
};

type WirePost = z.infer<z.ZodObject<typeof baseShape>>;

function toPost(wire: WirePost, repostedPost: Post | null): Post {
  const images = wire.media?.length
    ? [...wire.media].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((m) => m.cloud_url)
    : (wire.media_urls ?? []);
  // `is_liked` and `my_reaction` come from the same JOIN; trust the reaction, but honour an explicit `false`.
  const myReaction = wire.is_liked === false ? null : toReactionType(wire.my_reaction ?? (wire.is_liked ? 'like' : null));
  return {
    id: wire.id,
    type: wire.type ?? 'media',
    caption: wire.caption?.trim() || null,
    createdAt: wire.created_at,
    author: wire.user,
    images: images.filter((url) => url.trim() !== ''),
    tripPlan: wire.tripPlan ?? null,
    repostId: wire.repost_id ?? null,
    repostedPost,
    reactionCount: wire.likes_count ?? 0,
    commentCount: wire.comments_count ?? 0,
    repostCount: wire.reposts_count ?? wire.repost_count ?? 0,
    myReaction,
    isReposted: wire.is_reposted ?? false,
  };
}

const embeddedPostSchema = z.object(baseShape).transform((wire) => toPost(wire, null));

/**
 * One post. The backend nests the original of a repost exactly one level deep (`reposted_post`), and
 * that original has no `reposted_post` of its own — so the schema is deliberately one level, not
 * recursive. It is `null` when the original was deleted.
 */
export const postSchema = z
  .object({ ...baseShape, reposted_post: embeddedPostSchema.nullish() })
  .transform((wire) => toPost(wire, wire.reposted_post ?? null));

/** `{ status, data: Post }` — `GET posts/:id`, `POST posts/:id/repost`. */
export const postResponseSchema = z.object({ data: postSchema }).transform((r) => r.data);

/** `{ status, data: Post[] }` — `GET posts/feed`. */
export const feedResponseSchema = z.object({ data: z.array(postSchema) }).transform((r) => r.data);

/** Used to validate the persisted feed snapshot (the cached copy is the *domain* shape, not the wire one). */
export const feedSnapshotSchema: z.ZodType<Post[]> = z.array(z.custom<Post>(isPost));

function isPost(value: unknown): value is Post {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Partial<Post>;
  return (
    typeof p.id === 'string' &&
    typeof p.createdAt === 'string' &&
    typeof p.author?.username === 'string' &&
    Array.isArray(p.images) &&
    typeof p.reactionCount === 'number'
  );
}

/** Per-type totals. `COUNT(*)` arrives as a string (`"42"`). */
const reactionCountSchema = z
  .object({ type: z.string(), count: count })
  .transform((r): { type: ReactionType; count: number } => ({ type: toReactionType(r.type) ?? 'like', count: r.count }));

/** `POST` / `DELETE likes/:postId/like` — what the server now holds for this post. */
export const reactResponseSchema = z
  .object({
    likes_count: count,
    my_reaction: z.string().nullish(),
    is_liked: z.boolean().nullish(),
  })
  .transform((r) => ({
    reactionCount: r.likes_count,
    myReaction: r.is_liked === false ? null : toReactionType(r.my_reaction),
  }));
export type ReactResult = z.infer<typeof reactResponseSchema>;

const reactionUserSchema = z
  .object({
    type: z.string(),
    user_id: z.string(),
    username: z.string(),
    name: z.string().nullish(),
    avatar_url: z.string().nullish(),
  })
  .transform((u) => ({
    type: toReactionType(u.type) ?? 'like',
    userId: u.user_id,
    username: u.username,
    name: u.name?.trim() || null,
    avatarUrl: u.avatar_url?.trim() || null,
  }));

/**
 * `GET likes/:postId/likes`. The server's `total` is the length of the user list, which is capped at 50,
 * so the real total is the sum of the per-type counts.
 */
export const postReactionsSchema = z
  .object({
    reactions: z.array(reactionCountSchema).nullish(),
    users: z.array(reactionUserSchema).nullish(),
  })
  .transform((r) => {
    const reactions = r.reactions ?? [];
    const users = r.users ?? [];
    return { total: reactions.reduce((sum, item) => sum + item.count, 0), reactions, users };
  });
export type PostReactions = z.infer<typeof postReactionsSchema>;
