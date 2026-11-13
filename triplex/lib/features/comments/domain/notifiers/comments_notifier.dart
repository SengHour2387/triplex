import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/features/comments/data/comments_repo.dart';
import 'package:triplex/features/comments/domain/models/comment_model.dart';
import 'package:triplex/features/feed/domain/notifiers/feed_notifier.dart';

part 'comments_notifier.g.dart';

@riverpod
class CommentsNotifier extends _$CommentsNotifier {
  @override
  FutureOr<List<CommentModel>> build(String postId) async {
    final repo = ref.read(commentsRepoProvider);
    return await repo.getComments(postId);
  }

  CommentsRepo get _repo => ref.read(commentsRepoProvider);

  /// Refresh top-level comments
  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _repo.getComments(postId));
  }

  /// Lazy-load replies for a parent comment and expand it
  Future<void> loadReplies(String parentCommentId) async {
    final currentComments = state.value;
    if (currentComments == null) return;

    // Set loading indicator on the parent comment
    state = AsyncValue.data(
      currentComments.map((c) {
        if (c.id == parentCommentId) {
          return c.copyWith(isRepliesLoading: true);
        }
        return c;
      }).toList(),
    );

    try {
      final replies = await _repo.getReplies(parentCommentId);
      final updatedComments = state.value ?? currentComments;

      state = AsyncValue.data(
        updatedComments.map((c) {
          if (c.id == parentCommentId) {
            return c.copyWith(
              replies: replies,
              repliesCount: replies.length,
              isRepliesLoading: false,
              isRepliesExpanded: true,
            );
          }
          return c;
        }).toList(),
      );
    } catch (_) {
      final updatedComments = state.value ?? currentComments;
      state = AsyncValue.data(
        updatedComments.map((c) {
          if (c.id == parentCommentId) {
            return c.copyWith(isRepliesLoading: false);
          }
          return c;
        }).toList(),
      );
    }
  }

  /// Toggle accordion visibility for replies under a parent comment
  Future<void> toggleReplies(String parentCommentId) async {
    final currentComments = state.value;
    if (currentComments == null) return;

    final parent = currentComments.firstWhere((c) => c.id == parentCommentId);
    if (parent.replies.isEmpty && parent.repliesCount > 0) {
      await loadReplies(parentCommentId);
    } else {
      state = AsyncValue.data(
        currentComments.map((c) {
          if (c.id == parentCommentId) {
            return c.copyWith(isRepliesExpanded: !c.isRepliesExpanded);
          }
          return c;
        }).toList(),
      );
    }
  }

  /// Add a top-level comment to the post
  Future<CommentModel> addComment(String content) async {
    final newComment = await _repo.addComment(postId, content);

    final currentComments = state.value ?? [];
    state = AsyncValue.data([...currentComments, newComment]);

    // Update comment counter on feed post
    ref.read(feedProvider.notifier).incrementCommentCount(postId);

    return newComment;
  }

  /// Add a reply to a parent comment
  Future<CommentModel> addReply(String parentCommentId, String content) async {
    final newReply = await _repo.addReply(parentCommentId, content);

    final currentComments = state.value ?? [];
    state = AsyncValue.data(
      currentComments.map((c) {
        if (c.id == parentCommentId) {
          final updatedReplies = [...c.replies, newReply];
          return c.copyWith(
            replies: updatedReplies,
            repliesCount: c.repliesCount + 1,
            isRepliesExpanded: true,
          );
        }
        return c;
      }).toList(),
    );

    // Update comment counter on feed post
    ref.read(feedProvider.notifier).incrementCommentCount(postId);

    return newReply;
  }

  /// Optimistically react / unreact to a comment or reply
  Future<void> toggleReaction(String commentId, {String type = 'like'}) async {
    final currentComments = state.value;
    if (currentComments == null) return;

    CommentModel? targetComment;
    bool isChildReply = false;
    String? parentId;

    for (final c in currentComments) {
      if (c.id == commentId) {
        targetComment = c;
        break;
      }
      for (final r in c.replies) {
        if (r.id == commentId) {
          targetComment = r;
          isChildReply = true;
          parentId = c.id;
          break;
        }
      }
      if (targetComment != null) break;
    }

    if (targetComment == null) return;

    final isCurrentlyReacted =
        targetComment.isReacted && targetComment.myReaction == type;
    final newIsReacted = !isCurrentlyReacted;
    final newMyReaction = newIsReacted ? type : null;
    final newLikesCount = newIsReacted
        ? (targetComment.isReacted
            ? targetComment.likesCount
            : targetComment.likesCount + 1)
        : (targetComment.likesCount > 0 ? targetComment.likesCount - 1 : 0);

    // Apply optimistic update
    state = AsyncValue.data(
      currentComments.map((c) {
        if (!isChildReply && c.id == commentId) {
          return c.copyWith(
            isReacted: newIsReacted,
            myReaction: newMyReaction,
            likesCount: newLikesCount,
          );
        } else if (isChildReply && c.id == parentId) {
          final updatedReplies = c.replies.map((r) {
            if (r.id == commentId) {
              return r.copyWith(
                isReacted: newIsReacted,
                myReaction: newMyReaction,
                likesCount: newLikesCount,
              );
            }
            return r;
          }).toList();
          return c.copyWith(replies: updatedReplies);
        }
        return c;
      }).toList(),
    );

    // Sync with network in background
    try {
      if (newIsReacted) {
        await _repo.reactToComment(commentId, type: type);
      } else {
        await _repo.removeCommentReaction(commentId, type: type);
      }
    } catch (_) {
      // Revert on error
      state = AsyncValue.data(currentComments);
    }
  }

  /// Soft-delete a comment or reply
  Future<void> deleteComment(String commentId) async {
    final currentComments = state.value;
    if (currentComments == null) return;

    // Apply optimistic soft delete
    state = AsyncValue.data(
      currentComments.map((c) {
        if (c.id == commentId) {
          return c.copyWith(
            isDeleted: true,
            content: 'This comment was deleted.',
          );
        }
        final updatedReplies = c.replies.map((r) {
          if (r.id == commentId) {
            return r.copyWith(
              isDeleted: true,
              content: 'This comment was deleted.',
            );
          }
          return r;
        }).toList();
        return c.copyWith(replies: updatedReplies);
      }).toList(),
    );

    try {
      await _repo.deleteComment(commentId);
    } catch (_) {
      state = AsyncValue.data(currentComments);
    }
  }
}

const commentsNotifierProvider = commentsProvider;
