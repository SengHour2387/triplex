import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/features/feed/domain/models/post_model.dart';
import 'package:triplex/features/feed/domain/notifiers/feed_notifier.dart';
import 'package:triplex/features/profile/data/profile_repo.dart';
import 'package:triplex/features/profile/domain/user_profile_model.dart';

part 'other_profile_notifier.g.dart';

@riverpod
class OtherProfileNotifier extends _$OtherProfileNotifier {
  @override
  FutureOr<UserProfileModel?> build(String userId) async {
    final repo = ref.watch(profileRepoProvider);
    return await repo.getUserProfile(userId);
  }

  Future<void> toggleFollow() async {
    final current = state.value;
    if (current == null) return;

    final wasFollowing = current.isFollowing;
    final newFollowing = !wasFollowing;
    final newFollowersCount = wasFollowing
        ? (current.followersCount > 0 ? current.followersCount - 1 : 0)
        : current.followersCount + 1;

    // Optimistic update
    state = AsyncValue.data(
      current.copyWith(
        isFollowing: newFollowing,
        followersCount: newFollowersCount,
      ),
    );

    try {
      if (newFollowing) {
        await ref.read(profileRepoProvider).followUser(userId);
      } else {
        await ref.read(profileRepoProvider).unfollowUser(userId);
      }
    } catch (e) {
      // Rollback on failure
      state = AsyncValue.data(current);
      rethrow;
    }
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => ref.read(profileRepoProvider).getUserProfile(userId),
    );
  }
}

@riverpod
class OtherUserPostsNotifier extends _$OtherUserPostsNotifier {
  @override
  FutureOr<List<PostModel>> build(String userId) async {
    final feedState = ref.watch(feedProvider);
    final feedPosts = feedState.value ?? [];

    try {
      final posts =
          await ref.read(profileRepoProvider).getUserPosts(userId: userId);

      if (posts.isNotEmpty) {
        final postMap = <String, PostModel>{};
        for (final p in posts) {
          postMap[p.id] = p;
        }
        for (final fp in feedPosts) {
          if (postMap.containsKey(fp.id)) {
            postMap[fp.id] = fp;
          }
        }
        final merged = postMap.values.toList()
          ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
        return merged;
      }
    } catch (_) {}

    final matchingFeedPosts = feedPosts.where((p) {
      return p.user.id == userId ||
          p.user.username.toLowerCase() == userId.toLowerCase();
    }).toList();

    return matchingFeedPosts;
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    try {
      await ref.read(feedProvider.notifier).refreshFeed();
    } catch (_) {}
    ref.invalidateSelf();
  }
}
