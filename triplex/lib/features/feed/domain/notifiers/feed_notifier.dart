import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/features/feed/data/feed_repo.dart';
import 'package:triplex/features/feed/domain/models/post_model.dart';
import 'package:triplex/features/reactions/data/reactions_repo.dart';

part 'feed_notifier.g.dart';

@Riverpod(keepAlive: true)
class FeedNotifier extends _$FeedNotifier {
  @override
  FutureOr<List<PostModel>> build() async {
    final repo = ref.read(feedRepoProvider);

    // ── Stale-While-Revalidate ──────────────────────────────────────────
    // 1. Show cached data instantly (if available)
    final stopwatch = Stopwatch()..start();
    final cached = await repo.getCachedFeed();
    stopwatch.stop();

    if (cached.isNotEmpty) {
      if (kDebugMode) {
        print(
            '💾 [CACHE HIT] Showing ${cached.length} cached posts in ${stopwatch.elapsedMilliseconds}ms');
      }
      state = AsyncData(cached);
    } else {
      if (kDebugMode) {
        print('💾 [CACHE MISS] No cached posts found');
      }
    }

    // 2. Fetch fresh data from network in the background
    try {
      final networkStopwatch = Stopwatch()..start();
      final fresh = await repo.fetchFreshFeed();
      networkStopwatch.stop();

      if (kDebugMode) {
        print(
            '🌐 [NETWORK] Fetched ${fresh.length} posts in ${networkStopwatch.elapsedMilliseconds}ms');
      }

      await repo.cacheFeed(fresh);
      if (kDebugMode) {
        print('💾 [CACHE WRITE] Saved ${fresh.length} posts to SQLite');
      }

      return fresh;
    } catch (e, stack) {
      // If network fails but we have cache, keep showing cached data
      if (cached.isNotEmpty) {
        if (kDebugMode) {
          print('❌ [NETWORK FAILED] Using cached data: $e');
        }
        return cached;
      }
      // No cache and no network — propagate the error
      if (kDebugMode) {
        print('❌ [NETWORK FAILED] No cache available, showing error');
      }
      throw AsyncError(e, stack);
    }
  }

  /// Pull-to-refresh: force fresh network fetch and update cache.
  Future<void> refreshFeed() async {
    if (kDebugMode) {
      print('🔄 [REFRESH] Pull-to-refresh triggered');
    }
    final repo = ref.read(feedRepoProvider);
    try {
      final fresh = await repo.fetchFreshFeed();
      await repo.cacheFeed(fresh);
      state = AsyncData(fresh);
      if (kDebugMode) {
        print('🔄 [REFRESH] Done — ${fresh.length} posts updated');
      }
    } catch (e, stack) {
      if (kDebugMode) {
        print('❌ [REFRESH FAILED] $e');
      }
      if (state.hasValue && state.value != null) {
        state = AsyncData(state.value!);
      } else {
        state = AsyncError(e, stack);
      }
    }
  }

  /// Optimistically react / unreact to a post
  Future<void> togglePostReaction(String postId, {String type = 'like'}) async {
    final posts = state.value;
    if (posts == null) return;

    final targetPost = posts.firstWhere((p) => p.id == postId);
    final activeReaction =
        targetPost.myReaction ?? (targetPost.isLiked ? 'like' : null);
    final isCurrentlySameReaction =
        targetPost.isLiked && activeReaction == type;
    final newIsLiked = !isCurrentlySameReaction;
    final newMyReaction = newIsLiked ? type : null;
    final newLikeCount = newIsLiked
        ? (targetPost.isLiked ? targetPost.likeCount : targetPost.likeCount + 1)
        : (targetPost.likeCount > 0 ? targetPost.likeCount - 1 : 0);

    state = AsyncData(
      posts.map((p) {
        if (p.id == postId) {
          return p.copyWith(
            isLiked: newIsLiked,
            myReaction: newMyReaction,
            likeCount: newLikeCount,
          );
        }
        return p;
      }).toList(),
    );

    // Network sync in background
    try {
      final reactionsRepo = ref.read(reactionsRepoProvider);
      if (newIsLiked) {
        await reactionsRepo.reactToPost(postId, type: type);
      } else {
        await reactionsRepo.removePostReaction(postId, type: type);
      }
    } catch (_) {
      // Revert if failed
      state = AsyncData(posts);
    }
  }

  /// Increment comment count on a post
  void incrementCommentCount(String postId) {
    final posts = state.value;
    if (posts == null) return;

    state = AsyncData(
      posts.map((p) {
        if (p.id == postId) {
          return p.copyWith(commentCount: p.commentCount + 1);
        }
        return p;
      }).toList(),
    );
  }

  /// Repost a post with optional caption and prepend to feed
  Future<void> repostPost(String postId, {String? caption}) async {
    final repo = ref.read(feedRepoProvider);
    final newPost = await repo.repostPost(postId, caption: caption);

    final currentPosts = state.value ?? [];
    // Update original post's repostCount and isReposted
    final updatedList = currentPosts.map((p) {
      if (p.id == postId) {
        return p.copyWith(
          repostCount: p.repostCount + 1,
          isReposted: true,
        );
      }
      return p;
    }).toList();

    // Prepend the new repost
    final combined = [newPost, ...updatedList];
    state = AsyncData(combined);
    await repo.cacheFeed(combined);
  }

  /// Decrement comment count on a post
  void decrementCommentCount(String postId) {
    final posts = state.value;
    if (posts == null) return;

    state = AsyncData(
      posts.map((p) {
        if (p.id == postId) {
          return p.copyWith(
            commentCount: p.commentCount > 0 ? p.commentCount - 1 : 0,
          );
        }
        return p;
      }).toList(),
    );
  }
}
