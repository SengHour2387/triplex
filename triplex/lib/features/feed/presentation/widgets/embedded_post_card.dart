import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/features/feed/domain/models/post_model.dart';
import 'package:triplex/features/feed/presentation/widgets/media_grid.dart';
import 'package:triplex/features/feed/presentation/widgets/trip_plan_card.dart';

class EmbeddedPostCard extends StatelessWidget {
  final PostModel post;

  const EmbeddedPostCard({super.key, required this.post});

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

  void _navigateToUserProfile(BuildContext context) {
    final user = post.user;
    final identifier = user.id.isNotEmpty ? user.id : user.username;
    if (identifier.isNotEmpty) {
      context.push(
        '/user/$identifier',
        extra: {
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
    final isDark = theme.brightness == Brightness.dark;

    return GestureDetector(
      onTap: () {
        context.push('/post/${post.id}', extra: {'post': post});
      },
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDark
              ? colorScheme.surfaceContainerHighest.withAlpha(40)
              : colorScheme.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Original Author Header
            GestureDetector(
              onTap: () => _navigateToUserProfile(context),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 14,
                    backgroundColor: colorScheme.surfaceContainerHighest,
                    child: ClipOval(
                      child: post.user.avatarUrl != null &&
                              post.user.avatarUrl!.isNotEmpty
                          ? CachedNetworkImage(
                              imageUrl: post.user.avatarUrl!,
                              width: 28,
                              height: 28,
                              fit: BoxFit.cover,
                              errorWidget: (context, url, error) =>
                                  _buildAvatarFallback(colorScheme),
                            )
                          : _buildAvatarFallback(colorScheme),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    post.user.name != null && post.user.name!.isNotEmpty
                        ? post.user.name!
                        : post.user.username,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '• ${_formatRelativeTime(post.createdAt)}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurface.withAlpha(110),
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),

            // Original Caption
            if (post.caption != null && post.caption!.isNotEmpty) ...[
              Text(
                post.caption!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontSize: 13,
                  color: colorScheme.onSurface.withAlpha(230),
                ),
                maxLines: 4,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
            ],

            // Original Media Grid
            if (post.mediaUrls != null && post.mediaUrls!.isNotEmpty) ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: MediaGrid(
                  mediaUrls: post.mediaUrls,
                  heroTagPrefix: 'embedded_${post.id}',
                ),
              ),
              const SizedBox(height: 4),
            ],

            // Original Trip Plan Card
            if (post.tripPlan != null) ...[
              TripPlanCard(tripPlan: post.tripPlan!),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildAvatarFallback(ColorScheme colorScheme) {
    return Center(
      child: Text(
        post.user.username.isNotEmpty
            ? post.user.username[0].toUpperCase()
            : 'U',
        style: TextStyle(
          color: colorScheme.primary,
          fontWeight: FontWeight.bold,
          fontSize: 11,
        ),
      ),
    );
  }
}
