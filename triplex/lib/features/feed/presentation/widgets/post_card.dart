import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/features/comments/presentation/widgets/comments_sheet.dart';
import 'package:triplex/features/feed/domain/models/post_model.dart';
import 'package:triplex/features/feed/domain/notifiers/feed_notifier.dart';
import 'package:triplex/features/feed/presentation/widgets/embedded_post_card.dart';
import 'package:triplex/features/feed/presentation/widgets/media_grid.dart';
import 'package:triplex/features/feed/presentation/widgets/repost_bottom_sheet.dart';
import 'package:triplex/features/feed/presentation/widgets/trip_plan_card.dart';
import 'package:triplex/features/reactions/domain/models/reaction_model.dart';
import 'package:triplex/features/reactions/presentation/widgets/post_reactions_sheet.dart';
import 'package:triplex/features/reactions/presentation/widgets/reaction_picker_popup.dart';

class PostCard extends ConsumerStatefulWidget {
  final PostModel post;
  final bool enableUserHero;
  final String heroPrefix;
  final bool enableNavigation;

  const PostCard({
    super.key,
    required this.post,
    this.enableUserHero = true,
    this.heroPrefix = 'feed',
    this.enableNavigation = true,
  });

  @override
  ConsumerState<PostCard> createState() => _PostCardState();
}

class _PostCardState extends ConsumerState<PostCard> {
  final GlobalKey _likeButtonKey = GlobalKey();

  String _formatCount(int count) {
    if (count >= 1000) {
      final kValue = count / 1000;
      final formatted = kValue.toStringAsFixed(kValue % 1 == 0 ? 0 : 1);
      return '${formatted}k';
    }
    return '$count';
  }

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
    final post = widget.post;
    if (post.isLiked) {
      ref
          .read(feedProvider.notifier)
          .togglePostReaction(post.id, type: post.myReaction ?? 'like');
    } else {
      ref.read(feedProvider.notifier).togglePostReaction(post.id);
    }
  }

  void _onLikeLongPress() {
    ReactionPickerPopup.show(
      context: context,
      anchorKey: _likeButtonKey,
      currentReaction: widget.post.myReaction,
      onReactionSelected: (type) {
        ref
            .read(feedProvider.notifier)
            .togglePostReaction(widget.post.id, type: type);
      },
    );
  }

  void _openComments() {
    CommentsSheet.show(context, widget.post.id);
  }

  void _openRepost() {
    HapticFeedback.lightImpact();
    RepostBottomSheet.show(context, widget.post);
  }

  void _openReactionsBreakdown() {
    if (widget.post.likeCount > 0) {
      PostReactionsSheet.show(context, widget.post.id);
    }
  }

  void _navigateToUserProfile() {
    final user = widget.post.user;
    final identifier = user.id.isNotEmpty ? user.id : user.username;
    if (identifier.isNotEmpty) {
      context.push(
        '/user/$identifier',
        extra: {
          'avatarHeroTag':
              widget.enableUserHero ? 'user_avatar_${widget.post.id}' : null,
          'usernameHeroTag':
              widget.enableUserHero ? 'user_username_${widget.post.id}' : null,
          'avatarUrl': user.avatarUrl,
          'username': user.username,
          'name': user.name,
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final post = widget.post;

    final avatarTag = 'user_avatar_${post.id}';
    final usernameTag = 'user_username_${post.id}';

    Widget avatarWidget = CircleAvatar(
      radius: 18,
      backgroundColor: colorScheme.surfaceContainerHighest,
      child: ClipOval(
        child: post.user.avatarUrl != null && post.user.avatarUrl!.isNotEmpty
            ? CachedNetworkImage(
                imageUrl: post.user.avatarUrl!,
                width: 36,
                height: 36,
                fit: BoxFit.cover,
                errorWidget: (context, url, error) =>
                    _buildAvatarFallback(colorScheme),
              )
            : _buildAvatarFallback(colorScheme),
      ),
    );

    if (widget.enableUserHero) {
      avatarWidget = Hero(tag: avatarTag, child: avatarWidget);
    }

    Widget usernameWidget = Text(
      post.user.username,
      style: theme.textTheme.bodyMedium?.copyWith(
        fontWeight: FontWeight.w600,
        color: colorScheme.onSurface,
        fontSize: 14,
      ),
    );

    if (widget.enableUserHero) {
      usernameWidget = Hero(
        tag: usernameTag,
        child: Material(type: MaterialType.transparency, child: usernameWidget),
      );
    }

    return GestureDetector(
      onTap: widget.enableNavigation
          ? () {
              context.push('/post/${post.id}', extra: {'post': post});
            }
          : null,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        color: Colors.transparent, // Ensure the entire area is tappable
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: Avatar, Username, Time
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  // Avatar
                  GestureDetector(
                    onTap: _navigateToUserProfile,
                    child: avatarWidget,
                  ),
                  const SizedBox(width: 10),
                  // User Username & Time stacked
                  GestureDetector(
                    onTap: _navigateToUserProfile,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        usernameWidget,
                        Text(
                          _formatRelativeTime(post.createdAt),
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onSurface.withAlpha(140),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),

            // Caption with Inline/Attached Trip Pill Badge
            if (post.caption != null && post.caption!.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.only(left: 16, right: 16, bottom: 10),
                child: Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 8,
                  runSpacing: 4,
                  children: [
                    Text(
                      post.caption!,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: colorScheme.onSurface,
                        fontSize: 14,
                      ),
                    ),
                    if (post.tripPlan != null ||
                        (post.attachedTripTitle != null &&
                            post.attachedTripTitle!.isNotEmpty))
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: colorScheme.primaryContainer.withAlpha(160),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.explore_rounded,
                              size: 13,
                              color: colorScheme.onPrimaryContainer,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              post.tripPlan?.title ??
                                  post.attachedTripTitle ??
                                  '',
                              style: TextStyle(
                                color: colorScheme.onPrimaryContainer,
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ],

            // Render Media Grid if media present
            if (post.mediaUrls != null && post.mediaUrls!.isNotEmpty) ...[
              MediaGrid(
                mediaUrls: post.mediaUrls,
                heroTagPrefix: '${widget.heroPrefix}_${post.id}',
              ),
              const SizedBox(height: 10),
            ],

            // Render Trip Plan Card if trip plan present
            if (post.tripPlan != null) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: TripPlanCard(tripPlan: post.tripPlan!),
              ),
              const SizedBox(height: 8),
            ],

            // Render Embedded Reposted Post if present
            if (post.repostedPost != null) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: EmbeddedPostCard(post: post.repostedPost!),
              ),
              const SizedBox(height: 8),
            ],

            // Footer Action Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  // Like / Reaction Button
                  GestureDetector(
                    key: _likeButtonKey,
                    onTap: _onLikeTap,
                    onLongPress: _onLikeLongPress,
                    child: Row(
                      children: [
                        if (post.isLiked) ...[
                          Text(
                            ReactionTypes.getEmoji(post.myReaction ?? 'like'),
                            style: const TextStyle(fontSize: 18),
                          ),
                        ] else ...[
                          Icon(
                            Icons.favorite_border_rounded,
                            color: colorScheme.onSurface.withAlpha(180),
                            size: 20,
                          ),
                        ],
                        const SizedBox(width: 4),
                        GestureDetector(
                          onTap: _openReactionsBreakdown,
                          child: Text(
                            _formatCount(post.likeCount),
                            style: theme.textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: post.isLiked
                                  ? ReactionTypes.getColor(
                                      post.myReaction ?? 'like',
                                    )
                                  : colorScheme.onSurface,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 14),

                  // Comment Bubble
                  GestureDetector(
                    onTap: _openComments,
                    child: Row(
                      children: [
                        const Icon(Icons.chat_bubble_outline_rounded, size: 20),
                        const SizedBox(width: 4),
                        Text(
                          _formatCount(post.commentCount),
                          style: theme.textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: colorScheme.onSurface,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),

                  // Comment Preview Pill Chip
                  if (post.commentPreview != null &&
                      post.commentPreview!.isNotEmpty) ...[
                    Expanded(
                      child: GestureDetector(
                        onTap: _openComments,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF2F4F7),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Text(
                            post.commentPreview!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.grey[700],
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                  ] else ...[
                    const Spacer(),
                  ],

                  // Bookmark (Saved) Count if present
                  if (post.savedCount != null) ...[
                    Row(
                      children: [
                        const Icon(Icons.bookmark_outline_rounded, size: 20),
                        const SizedBox(width: 2),
                        Text(
                          _formatCount(post.savedCount!),
                          style: theme.textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: colorScheme.onSurface,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 12),
                  ],

                  // Repost Button (uses clone_outline.svg)
                  GestureDetector(
                    onTap: _openRepost,
                    child: Row(
                      children: [
                        SvgPicture.asset(
                          'assets/icons/clone_outline.svg',
                          width: 18,
                          height: 18,
                          colorFilter: ColorFilter.mode(
                            post.isReposted
                                ? colorScheme.primary
                                : colorScheme.onSurface.withAlpha(180),
                            BlendMode.srcIn,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _formatCount(post.repostCount),
                          style: theme.textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: post.isReposted
                                ? colorScheme.primary
                                : colorScheme.onSurface,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Share / Link
                  Row(
                    children: [
                      const Icon(Icons.link_rounded, size: 20),
                      const SizedBox(width: 4),
                      Text(
                        _formatCount(post.shareCount),
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: colorScheme.onSurface,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatarFallback(ColorScheme colorScheme) {
    return Center(
      child: Text(
        widget.post.user.username.isNotEmpty
            ? widget.post.user.username[0].toUpperCase()
            : 'U',
        style: TextStyle(
          color: colorScheme.primary,
          fontWeight: FontWeight.bold,
          fontSize: 14,
        ),
      ),
    );
  }
}
