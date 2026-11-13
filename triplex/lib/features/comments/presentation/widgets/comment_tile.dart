import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/features/auth/domain/auth_notifier.dart';
import 'package:triplex/features/comments/domain/models/comment_model.dart';
import 'package:triplex/features/comments/domain/notifiers/comments_notifier.dart';
import 'package:triplex/features/reactions/domain/models/reaction_model.dart';
import 'package:triplex/features/reactions/presentation/widgets/reaction_picker_popup.dart';

class CommentTile extends ConsumerStatefulWidget {
  final CommentModel comment;
  final String postId;
  final Function(CommentModel targetComment) onReply;
  final bool isReply;
  final bool enableUserHero;

  const CommentTile({
    super.key,
    required this.comment,
    required this.postId,
    required this.onReply,
    this.isReply = false,
    this.enableUserHero = true,
  });

  @override
  ConsumerState<CommentTile> createState() => _CommentTileState();
}

class _CommentTileState extends ConsumerState<CommentTile> {
  final GlobalKey _likeButtonKey = GlobalKey();

  String _formatRelativeTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inSeconds < 60) {
      return '${difference.inSeconds}s';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d';
    } else {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    }
  }

  void _onLikeTap() {
    HapticFeedback.lightImpact();
    final notifier = ref.read(commentsNotifierProvider(widget.postId).notifier);
    if (widget.comment.isReacted) {
      notifier.toggleReaction(widget.comment.id,
          type: widget.comment.myReaction ?? 'like');
    } else {
      notifier.toggleReaction(widget.comment.id);
    }
  }

  void _onLikeLongPress() {
    ReactionPickerPopup.show(
      context: context,
      anchorKey: _likeButtonKey,
      currentReaction: widget.comment.myReaction,
      onReactionSelected: (type) {
        ref
            .read(commentsNotifierProvider(widget.postId).notifier)
            .toggleReaction(widget.comment.id, type: type);
      },
    );
  }

  void _confirmDelete() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete comment?'),
        content: const Text('Are you sure you want to delete this comment?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              ref
                  .read(commentsNotifierProvider(widget.postId).notifier)
                  .deleteComment(widget.comment.id);
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _navigateToUserProfile() {
    final user = widget.comment.user;
    final identifier = user.id.isNotEmpty ? user.id : user.username;
    if (identifier.isNotEmpty) {
      context.push(
        '/user/$identifier',
        extra: {
          'avatarHeroTag': widget.enableUserHero
              ? 'comment_${widget.comment.id}_avatar'
              : null,
          'usernameHeroTag': widget.enableUserHero
              ? 'comment_${widget.comment.id}_username'
              : null,
          'avatarUrl': user.avatarUrl,
          'username': user.username,
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final currentUser = ref.watch(authProvider).value;
    final isAuthor =
        currentUser != null && currentUser.id == widget.comment.user.id;

    final comment = widget.comment;
    final avatarRadius = widget.isReply ? 14.0 : 18.0;

    Widget avatarWidget = CircleAvatar(
      radius: avatarRadius,
      backgroundColor: colorScheme.surfaceContainerHighest,
      backgroundImage:
          (comment.user.avatarUrl != null && comment.user.avatarUrl!.isNotEmpty)
              ? CachedNetworkImageProvider(comment.user.avatarUrl!)
              : null,
      child: (comment.user.avatarUrl == null || comment.user.avatarUrl!.isEmpty)
          ? Text(
              comment.user.username.isNotEmpty
                  ? comment.user.username[0].toUpperCase()
                  : 'U',
              style: TextStyle(
                color: colorScheme.primary,
                fontWeight: FontWeight.bold,
                fontSize: widget.isReply ? 11 : 13,
              ),
            )
          : null,
    );

    if (widget.enableUserHero) {
      avatarWidget = Hero(
        tag: 'comment_${comment.id}_avatar',
        child: avatarWidget,
      );
    }

    Widget usernameWidget = Text(
      comment.user.username,
      style: theme.textTheme.bodyMedium?.copyWith(
        fontWeight: FontWeight.w600,
        fontSize: widget.isReply ? 12 : 13,
        color: colorScheme.onSurface,
      ),
    );

    if (widget.enableUserHero) {
      usernameWidget = Hero(
        tag: 'comment_${comment.id}_username',
        child: Material(
          type: MaterialType.transparency,
          child: usernameWidget,
        ),
      );
    }

    return Padding(
      padding: EdgeInsets.only(
        left: widget.isReply ? 44.0 : 16.0,
        right: 16.0,
        top: 6.0,
        bottom: 6.0,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User Avatar
              GestureDetector(
                onTap: _navigateToUserProfile,
                child: avatarWidget,
              ),
              const SizedBox(width: 10),

              // Comment Content & Actions
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header: Username & Relative Time & Options
                    Row(
                      children: [
                        GestureDetector(
                          onTap: _navigateToUserProfile,
                          child: usernameWidget,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          _formatRelativeTime(comment.createdAt),
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onSurface.withAlpha(120),
                            fontSize: 11,
                          ),
                        ),
                        const Spacer(),
                        if (isAuthor && !comment.isDeleted)
                          GestureDetector(
                            onTap: _confirmDelete,
                            child: Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 4),
                              child: Icon(
                                Icons.more_horiz_rounded,
                                size: 16,
                                color: colorScheme.onSurface.withAlpha(120),
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 2),

                    // Content text
                    Text(
                      comment.content,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontSize: widget.isReply ? 13 : 14,
                        fontStyle: comment.isDeleted
                            ? FontStyle.italic
                            : FontStyle.normal,
                        color: comment.isDeleted
                            ? colorScheme.onSurface.withAlpha(100)
                            : colorScheme.onSurface,
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 4),

                    // Action buttons (Like & Reply)
                    if (!comment.isDeleted) ...[
                      Row(
                        children: [
                          // Like / React Button
                          GestureDetector(
                            key: _likeButtonKey,
                            onTap: _onLikeTap,
                            onLongPress: _onLikeLongPress,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (comment.isReacted &&
                                    comment.myReaction != null) ...[
                                  Text(
                                    ReactionTypes.getEmoji(comment.myReaction),
                                    style: const TextStyle(fontSize: 13),
                                  ),
                                ] else ...[
                                  Icon(
                                    Icons.favorite_border_rounded,
                                    size: 14,
                                    color: colorScheme.onSurface.withAlpha(140),
                                  ),
                                ],
                                if (comment.likesCount > 0) ...[
                                  const SizedBox(width: 4),
                                  Text(
                                    '${comment.likesCount}',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: comment.isReacted
                                          ? ReactionTypes.getColor(
                                              comment.myReaction)
                                          : colorScheme.onSurface
                                              .withAlpha(150),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),

                          // Reply Button
                          GestureDetector(
                            onTap: () => widget.onReply(comment),
                            child: Text(
                              'Reply',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: colorScheme.onSurface.withAlpha(150),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),

          // Replies toggle & nested replies (Only for top-level comments)
          if (!widget.isReply && comment.repliesCount > 0) ...[
            Padding(
              padding: const EdgeInsets.only(left: 46.0, top: 4.0),
              child: GestureDetector(
                onTap: () {
                  ref
                      .read(commentsNotifierProvider(widget.postId).notifier)
                      .toggleReplies(comment.id);
                },
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 20,
                      height: 1,
                      color: colorScheme.onSurface.withAlpha(80),
                    ),
                    const SizedBox(width: 8),
                    if (comment.isRepliesLoading) ...[
                      const SizedBox(
                        width: 12,
                        height: 12,
                        child: CircularProgressIndicator.adaptive(
                            strokeWidth: 1.5),
                      ),
                      const SizedBox(width: 6),
                    ],
                    Text(
                      comment.isRepliesExpanded
                          ? 'Hide replies'
                          : 'View ${comment.repliesCount} ${comment.repliesCount == 1 ? 'reply' : 'replies'}',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: colorScheme.onSurface.withAlpha(140),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (comment.isRepliesExpanded && comment.replies.isNotEmpty) ...[
              ...comment.replies.map(
                (reply) => CommentTile(
                  key: ValueKey(reply.id),
                  comment: reply,
                  postId: widget.postId,
                  onReply: widget.onReply,
                  isReply: true,
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }
}
