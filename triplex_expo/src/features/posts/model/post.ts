import type { ReactionType } from './reactions';

export interface PostAuthor {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface TripStop {
  id: string;
  title: string;
  description: string | null;
  cost: number | null;
  currency: string | null;
}

export interface TripPlan {
  id: string;
  title: string;
  caption: string | null;
  totalCost: number | null;
  currency: string | null;
  start: TripStop | null;
  waypoints: TripStop[];
  end: TripStop | null;
}

/**
 * A post as the app uses it (camelCase; the wire format is parsed in `schemas.ts`). Everything that
 * changes while the user looks at it — reaction, counts — lives here so the query cache is the one
 * place it is held, and a feed card and the detail screen can never disagree.
 */
export interface Post {
  id: string;
  /** `media` | `trip_plan` | `trip_plan_media` | `repost` (kept as a string: an unknown kind still renders). */
  type: string;
  caption: string | null;
  /** ISO 8601. Kept as text so the cache stays serialisable (the feed snapshot is persisted). */
  createdAt: string;
  author: PostAuthor;
  /** Photo URLs in display order. */
  images: string[];
  tripPlan: TripPlan | null;
  /** Set on a repost. `repostedPost` is null when the original was deleted. */
  repostId: string | null;
  repostedPost: Post | null;
  reactionCount: number;
  commentCount: number;
  repostCount: number;
  myReaction: ReactionType | null;
  isReposted: boolean;
}

/** The post a repost would embed: reposting a repost reposts its original, never a chain. */
export const repostTarget = (post: Post): Post | null =>
  post.repostId === null ? post : post.repostedPost;

/** The author's display name, falling back to the username. */
export const authorName = (author: PostAuthor): string => author.name?.trim() || author.username;
