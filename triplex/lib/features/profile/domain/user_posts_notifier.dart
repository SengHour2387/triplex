import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:triplex/features/auth/domain/auth_notifier.dart';
import 'package:triplex/features/feed/domain/models/post_model.dart';
import 'package:triplex/features/feed/domain/notifiers/feed_notifier.dart';
import 'package:triplex/features/profile/data/profile_repo.dart';

final userPostsProvider =
    AsyncNotifierProvider<UserPostsNotifier, List<PostModel>>(
  UserPostsNotifier.new,
);

class UserPostsNotifier extends AsyncNotifier<List<PostModel>> {
  @override
  FutureOr<List<PostModel>> build() async {
    final user = ref.watch(authProvider).value;
    if (user == null) return [];

    // Watch feedProvider so likes/reactions and comment updates sync reactively
    final feedState = ref.watch(feedProvider);
    final feedPosts = feedState.value ?? [];

    final matchingFeedPosts = feedPosts.where((p) {
      final matchesId = user.id.isNotEmpty && p.user.id == user.id;
      final matchesUsername = user.username.isNotEmpty &&
          p.user.username.toLowerCase() == user.username.toLowerCase();
      final matchesEmail = user.email.isNotEmpty &&
          p.user.email.toLowerCase() == user.email.toLowerCase();
      return matchesId || matchesUsername || matchesEmail;
    }).toList();

    try {
      final userPosts = await ref.read(profileRepoProvider).getUserPosts(
            userId: user.id,
            username: user.username,
          );

      if (userPosts.isNotEmpty) {
        final postMap = <String, PostModel>{};
        for (final p in userPosts) {
          postMap[p.id] = p;
        }
        for (final p in matchingFeedPosts) {
          postMap[p.id] = p;
        }
        final merged = postMap.values.toList()
          ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
        return merged;
      }
    } catch (_) {}

    return matchingFeedPosts;
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    try {
      await ref.read(feedProvider.notifier).refreshFeed();
    } catch (_) {}
    ref.invalidateSelf();
  }
}
