import 'dart:io';
import 'dart:ui';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/core/widgets/fullscreen_image_viewer.dart';
import 'package:triplex/core/widgets/text_h.dart';
import 'package:triplex/features/auth/domain/auth_notifier.dart';
import 'package:triplex/features/feed/presentation/widgets/post_card.dart';
import 'package:triplex/features/profile/domain/other_profile_notifier.dart';
import 'package:triplex/features/profile/presentation/widgets/user_list_sheet.dart';

class OtherProfileScreen extends ConsumerStatefulWidget {
  final String userId;
  final String? avatarHeroTag;
  final String? usernameHeroTag;
  final String? initialUsername;
  final String? initialName;
  final String? initialAvatarUrl;

  const OtherProfileScreen({
    super.key,
    required this.userId,
    this.avatarHeroTag,
    this.usernameHeroTag,
    this.initialUsername,
    this.initialName,
    this.initialAvatarUrl,
  });

  @override
  ConsumerState<OtherProfileScreen> createState() => _OtherProfileScreenState();
}

class _OtherProfileScreenState extends ConsumerState<OtherProfileScreen> {
  bool _isTogglingFollow = false;

  Future<void> _handleToggleFollow() async {
    HapticFeedback.lightImpact();
    setState(() => _isTogglingFollow = true);
    try {
      await ref
          .read(otherProfileProvider(widget.userId).notifier)
          .toggleFollow();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to update follow status: $e'), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) {
        setState(() => _isTogglingFollow = false);
      }
    }
  }

  void _openFollowersSheet(String username) {
    UserListSheet.show(
      context,
      userId: widget.userId,
      username: username,
      type: UserListType.followers,
    );
  }

  void _openFollowingSheet(String username) {
    UserListSheet.show(
      context,
      userId: widget.userId,
      username: username,
      type: UserListType.following,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final profileState = ref.watch(otherProfileProvider(widget.userId));
    final postsState = ref.watch(otherUserPostsProvider(widget.userId));
    final currentUser = ref.watch(authProvider).value;

    final displayUsername =
        profileState.value?.username ?? widget.initialUsername ?? '';

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text(displayUsername.isNotEmpty ? '@$displayUsername' : 'Profile'),
        leading: IconButton(
          icon: const Icon(Icons.chevron_left_rounded),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            }
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {
              Clipboard.setData(ClipboardData(text: '@$displayUsername'));
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Copied @$displayUsername to clipboard')),
              );
            },
          ),
        ],
      ),
      body: profileState.when(
        data: (user) {
          if (user == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.person_off_outlined,
                    size: 64,
                    color: colorScheme.onSurfaceVariant.withAlpha(120),
                  ),
                  const SizedBox(height: 16),
                  const TextH5("User not found"),
                  const SizedBox(height: 8),
                  Text(
                    "This account might have been removed or does not exist.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: colorScheme.onSurfaceVariant.withAlpha(150),
                    ),
                  ),
                ],
              ),
            );
          }

          final isSelf =
              user.isSelf || (currentUser != null && currentUser.id == user.id);
          final avatarUrl = user.avatarUrl ?? widget.initialAvatarUrl;
          final userName = user.name ?? widget.initialName;

          Widget avatarContent = Container(
            decoration: BoxDecoration(
              color:
                  colorScheme.surfaceBright.withAlpha(Platform.isIOS ? 0 : 128),
              borderRadius: BorderRadius.circular(70),
              border: Border.all(width: 3, color: Colors.grey.withAlpha(80)),
            ),
            width: 130,
            height: 130,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(70),
              child: (avatarUrl != null && avatarUrl.isNotEmpty)
                  ? CachedNetworkImage(
                      imageUrl: avatarUrl,
                      fit: BoxFit.cover,
                      progressIndicatorBuilder: (_, __, ___) => const Padding(
                        padding: EdgeInsets.all(10.0),
                        child: CircularProgressIndicator.adaptive(),
                      ),
                      errorWidget: (context, message, error) =>
                          _buildAvatarFallback(user.username, colorScheme),
                    )
                  : _buildAvatarFallback(user.username, colorScheme),
            ),
          );

          if (widget.avatarHeroTag != null) {
            avatarContent = Hero(
              tag: widget.avatarHeroTag!,
              child: avatarContent,
            );
          }

          Widget usernameContent = Text(
            '@${user.username}',
            style: TextStyle(
              fontSize: 14,
              color: colorScheme.onSurfaceVariant.withAlpha(180),
              fontWeight: FontWeight.w500,
            ),
          );

          if (widget.usernameHeroTag != null) {
            usernameContent = Hero(
              tag: widget.usernameHeroTag!,
              child: Material(
                type: MaterialType.transparency,
                child: usernameContent,
              ),
            );
          }

          return RefreshIndicator.adaptive(
            onRefresh: () async {
              await ref
                  .read(otherProfileProvider(widget.userId).notifier)
                  .refresh();
              await ref
                  .read(otherUserPostsProvider(widget.userId).notifier)
                  .refresh();
            },
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                const SizedBox(height: 10),

                // Avatar with Blur Gradient & Context Menu
                Center(
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      ImageFiltered(
                        imageFilter: ImageFilter.blur(sigmaX: 40, sigmaY: 40),
                        child: Container(
                          width: 160,
                          height: 160,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(80),
                            gradient: const RadialGradient(
                              colors: [
                                Colors.amber,
                                Colors.pinkAccent,
                                Colors.greenAccent,
                                Colors.blueAccent,
                              ],
                              focal: Alignment.bottomLeft,
                              focalRadius: .1,
                              center: Alignment.topRight,
                            ),
                          ),
                        ),
                      ),
                      PopupMenuButton(
                        itemBuilder: (context) => [
                          if (avatarUrl != null && avatarUrl.isNotEmpty)
                            PopupMenuItem(
                              onTap: () {
                                showFullScreenImageViewer(
                                  context,
                                  images: [avatarUrl],
                                );
                              },
                              child: const Row(children: [Icon(Icons.fullscreen_rounded), SizedBox(width: 8), Text('View Photo')]),
                            ),
                          PopupMenuItem(
                            onTap: () {
                              Clipboard.setData(
                                  ClipboardData(text: '@${user.username}'));
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Copied @${user.username} to clipboard')),
                              );
                            },
                            child: const Row(children: [Icon(Icons.copy_rounded), SizedBox(width: 8), Text('Copy Username')]),
                          ),
                        ],
                        child: GestureDetector(
                          onTap: () {
                            if (avatarUrl != null && avatarUrl.isNotEmpty) {
                              showFullScreenImageViewer(
                                context,
                                images: [avatarUrl],
                              );
                            }
                          },
                          child: avatarContent,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // Username & Full Name
                Center(
                  child: Column(
                    children: [
                      if (userName != null && userName.isNotEmpty)
                        Text(
                          userName,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                      usernameContent,
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Stats Row inside AdaptiveCard: Posts | Followers | Following
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          vertical: 14, horizontal: 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _buildStatItem(

                          context,
                          label: 'Posts',
                          count: user.postsCount,
                        ),
                        Container(
                          height: 28,
                          width: 1,
                          color: colorScheme.onSurfaceVariant.withAlpha(50),
                        ),
                        GestureDetector(
                          onTap: () => _openFollowersSheet(user.username),
                          child: _buildStatItem(
                            context,
                            label: 'Followers',
                            count: user.followersCount,
                          ),
                        ),
                        Container(
                          height: 28,
                          width: 1,
                          color: colorScheme.onSurfaceVariant.withAlpha(50),
                        ),
                        GestureDetector(
                          onTap: () => _openFollowingSheet(user.username),
                          child: _buildStatItem(
                            context,
                            label: 'Following',
                            count: user.followingCount,
                          ),
                        ),
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // Action Buttons (Follow / Following / Edit Profile) with AdaptiveButton
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: isSelf
                      ? CupertinoButton.filled(
                          borderRadius: BorderRadius.circular(24),
                          onPressed: () => context.push('/settings'),
                          child: const Text('Edit Profile & Settings'),
                        )
                      : SizedBox(
                          width: double.infinity,
                          child: CupertinoButton.filled(
                            borderRadius: BorderRadius.circular(24),
                            onPressed:
                                _isTogglingFollow ? null : _handleToggleFollow,
                            child: Text(user.isFollowing ? 'Following' : 'Follow'),
                          ),
                        ),
                ),

                const Divider(height: 36, indent: 20, endIndent: 20),

                // Posts Section Header with AdaptiveBadge
                Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                  child: Row(
                    children: [
                      const Icon(Icons.grid_on_rounded, size: 20),
                      const SizedBox(width: 8),
                      const TextH5("Posts"),
                      const Spacer(),
                      postsState.when(
                        data: (posts) => posts.isNotEmpty
                            ? Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: Badge(
                                  label: Text(posts.length.toString(), style: TextStyle(color: colorScheme.onPrimary)),
                                  backgroundColor: colorScheme.primary,
                                  child: const SizedBox(width: 8, height: 8),
                                ),
                              )
                            : const SizedBox.shrink(),
                        error: (err, stack) => const SizedBox.shrink(),
                        loading: () => const SizedBox.shrink(),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 8),

                // Posts List with AdaptiveCard for empty state
                postsState.when(
                  data: (posts) {
                    if (posts.isEmpty) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 12,
                        ),
                        child: Card(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(24),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(28),
                            child: Column(
                            children: [
                              Icon(
                                Icons.photo_library_outlined,
                                size: 40,
                                color:
                                    colorScheme.onSurfaceVariant.withAlpha(120),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                "No posts yet",
                                style: TextStyle(
                                  color: colorScheme.onSurfaceVariant,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                "@${user.username} hasn't posted any trip plans or media yet.",
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: colorScheme.onSurfaceVariant
                                      .withAlpha(150),
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                    }

                    return Column(
                      children: posts
                          .map((post) => PostCard(
                                post: post,
                                enableUserHero: false,
                                heroPrefix: 'other_profile',
                              ))
                          .toList(),
                    );
                  },
                  error: (err, _) => Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Center(
                      child: Text(
                        "Error loading posts: $err",
                        style: TextStyle(color: colorScheme.error),
                      ),
                    ),
                  ),
                  loading: () => const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32.0),
                      child: CircularProgressIndicator.adaptive(),
                    ),
                  ),
                ),

                const SizedBox(height: 100),
              ],
            ),
          );
        },
        error: (err, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                "Failed to load profile",
                style: TextStyle(
                    color: colorScheme.error, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              CupertinoButton.filled(
                borderRadius: BorderRadius.circular(24),
                onPressed: () {
                  ref.invalidate(otherProfileProvider(widget.userId));
                  ref.invalidate(otherUserPostsProvider(widget.userId));
                },
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        loading: () => const Center(
          child: CircularProgressIndicator.adaptive(),
        ),
      ),
    );
  }

  Widget _buildStatItem(
    BuildContext context, {
    required String label,
    required int count,
  }) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    String formatCount(int c) {
      if (c >= 1000) {
        final kValue = c / 1000;
        final formatted = kValue.toStringAsFixed(kValue % 1 == 0 ? 0 : 1);
        return '${formatted}k';
      }
      return '$c';
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          formatCount(count),
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            fontSize: 17,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: colorScheme.onSurfaceVariant.withAlpha(160),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildAvatarFallback(String username, ColorScheme colorScheme) {
    return Center(
      child: Text(
        username.isNotEmpty ? username[0].toUpperCase() : 'U',
        style: TextStyle(
          color: colorScheme.primary,
          fontWeight: FontWeight.bold,
          fontSize: 36,
        ),
      ),
    );
  }
}
