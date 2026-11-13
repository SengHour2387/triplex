import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:liquid_glass_widgets/liquid_glass_widgets.dart';
import 'package:triplex/core/widgets/fullscreen_image_viewer.dart';
import 'package:triplex/features/feed/presentation/widgets/post_card.dart';
import 'package:triplex/features/profile/domain/draft_trip_plans_notifier.dart';
import 'package:triplex/features/profile/domain/profile_notifier.dart';
import 'package:triplex/features/profile/domain/upload_profile_picture_progress_notifier.dart';
import 'package:triplex/features/profile/domain/user_posts_notifier.dart';
import 'package:triplex/features/profile/presentation/widgets/draft_trip_plan_card.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  int _tabIndex = 0;

  void goToSettings() {
    context.push('/settings');
  }

  Future<void> _showProfilePhotoOptions() async {
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Profile Picture'),
        content: const Text('Choose a photo source to set your profile picture'),
        actions: [
          TextButton(
            child: const Text('Take Photo'),
            onPressed: () async {
              Navigator.of(context).pop();
              await ref
                  .read(profileProvider.notifier)
                  .setProfilePicture(imageSource: ImageSource.camera);
            },
          ),
          TextButton(
            child: const Text('Choose from Gallery'),
            onPressed: () async {
              Navigator.of(context).pop();
              await ref
                  .read(profileProvider.notifier)
                  .setProfilePicture(imageSource: ImageSource.gallery);
            },
          ),
          TextButton(
            child: const Text('Cancel'),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStatChip(BuildContext context, String value, String label) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withAlpha(120),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final progressNotifier = ref.watch(uploadProfilePictureProgressProvider);
    final draftsState = ref.watch(draftTripPlansProvider);
    final userPostsState = ref.watch(userPostsProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return GlassScaffold(
      backgroundColor: colorScheme.surface,
      appBar: GlassAppBar(
        title: const Text('Profile'),
        actions: [
          GlassIconButton(
            icon: const Icon(Icons.camera_alt_outlined),
            onPressed: _showProfilePhotoOptions,
          ),
          GlassIconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: goToSettings,
          ),
        ],
      ),
      body: ref.watch(profileProvider).when(
        data: (user) {
          final draftsList = draftsState.value ?? [];
          final postsList = userPostsState.value ?? [];

          return RefreshIndicator.adaptive(
            onRefresh: () async {
              ref.invalidate(profileProvider);
              ref.invalidate(draftTripPlansProvider);
              await ref.read(userPostsProvider.notifier).refresh();
            },
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Column(
                      children: [
                        const SizedBox(height: 12),

                        // Single Profile Summary Header Card (standard quality)
                        Builder(
                          builder: (context) {
                            final avatarUrl = user?.avatarUrl;
                            final hasAvatar =
                                avatarUrl != null && avatarUrl.isNotEmpty;

                            return GlassCard(
                              quality: GlassQuality.standard,
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                children: [
                                  GestureDetector(
                                    onTap: () {
                                      if (hasAvatar) {
                                        showFullScreenImageViewer(
                                          context,
                                          images: [avatarUrl],
                                          heroTags: ['profile_avatar'],
                                        );
                                      } else {
                                        _showProfilePhotoOptions();
                                      }
                                    },
                                    child: Stack(
                                      alignment: Alignment.center,
                                      children: [
                                        CircleAvatar(
                                          radius: 46,
                                          backgroundColor:
                                              colorScheme.primary.withAlpha(30),
                                          backgroundImage: hasAvatar
                                              ? CachedNetworkImageProvider(
                                                  avatarUrl)
                                              : null,
                                          child: !hasAvatar
                                              ? Icon(Icons.person,
                                                  size: 48,
                                                  color: colorScheme.primary)
                                              : null,
                                        ),
                                        if (progressNotifier != null)
                                          Positioned.fill(
                                            child: CircularProgressIndicator
                                                .adaptive(
                                              value: progressNotifier / 100,
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    user?.username ?? 'Anonymous',
                                    style: theme.textTheme.titleLarge?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Builder(
                                    builder: (context) {
                                      final email = user?.email;
                                      if (email != null && email.isNotEmpty) {
                                        return Padding(
                                          padding:
                                              const EdgeInsets.only(top: 4),
                                          child: Text(
                                            email,
                                            style: theme.textTheme.bodyMedium
                                                ?.copyWith(
                                              color:
                                                  colorScheme.onSurfaceVariant,
                                            ),
                                          ),
                                        );
                                      }
                                      return const SizedBox.shrink();
                                    },
                                  ),
                                  const SizedBox(height: 16),

                                  // Stat chips
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceEvenly,
                                    children: [
                                      _buildStatChip(context,
                                          '${postsList.length}', 'Posts'),
                                      _buildStatChip(context,
                                          '${draftsList.length}', 'Drafts'),
                                    ],
                                  ),
                                  const SizedBox(height: 16),

                                  // Edit Profile Button (standard Flutter OutlinedButton inside GlassCard to satisfy zero-nested-glass rule)
                                  SizedBox(
                                    width: double.infinity,
                                    child: OutlinedButton.icon(
                                      onPressed: goToSettings,
                                      icon: const Icon(Icons.edit_outlined,
                                          size: 18),
                                      label:
                                          const Text("Edit Profile & Settings"),
                                      style: OutlinedButton.styleFrom(
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(20),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),

                        const SizedBox(height: 16),

                        // Segmented Control (standard quality, outside GlassCard)
                        GlassSegmentedControl(
                          quality: GlassQuality.standard,
                          segments: [
                            GlassSegment(
                              label: postsList.isNotEmpty
                                  ? 'Posts (${postsList.length})'
                                  : 'Posts',
                              icon: const Icon(Icons.photo_library_outlined,
                                  size: 18),
                            ),
                            GlassSegment(
                              label: draftsList.isNotEmpty
                                  ? 'Drafts (${draftsList.length})'
                                  : 'Drafts',
                              icon: const Icon(Icons.drafts_outlined, size: 18),
                            ),
                          ],
                          selectedIndex: _tabIndex,
                          onSegmentSelected: (index) {
                            setState(() => _tabIndex = index);
                          },
                        ),

                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                ),

                // Posts or Drafts content list
                if (_tabIndex == 0) ...[
                  if (postsList.isEmpty)
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 24),
                        child: Center(
                          child: Column(
                            children: [
                              Icon(
                                Icons.photo_library_outlined,
                                size: 44,
                                color:
                                    colorScheme.onSurfaceVariant.withAlpha(120),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                "No posts yet",
                                style: TextStyle(
                                  color: colorScheme.onSurfaceVariant,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                "Trip plans and media you post will appear here.",
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
                    )
                  else
                    SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final post = postsList[index];
                          return Padding(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 6),
                            child: PostCard(
                              post: post,
                              enableUserHero: false,
                              heroPrefix: 'my_profile',
                            ),
                          );
                        },
                        childCount: postsList.length,
                      ),
                    ),
                ] else ...[
                  if (draftsList.isEmpty)
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 24),
                        child: Center(
                          child: Column(
                            children: [
                              Icon(
                                Icons.drafts_outlined,
                                size: 44,
                                color:
                                    colorScheme.onSurfaceVariant.withAlpha(120),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                "No drafts yet",
                                style: TextStyle(
                                  color: colorScheme.onSurfaceVariant,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                "Saved trip plans will appear here before posting.",
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
                    )
                  else
                    SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final draft = draftsList[index];
                          return Padding(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 6),
                            child: DraftTripPlanCard(tripPlan: draft),
                          );
                        },
                        childCount: draftsList.length,
                      ),
                    ),
                ],

                const SliverToBoxAdapter(
                  child: SizedBox(height: 100),
                ),
              ],
            ),
          );
        },
        error: (e, t) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text("Can't get user info"),
                const SizedBox(height: 12),
                CupertinoButton.filled(
                  borderRadius: BorderRadius.circular(24),
                  onPressed: () => ref.invalidate(profileProvider),
                  child: const Text("Retry"),
                ),
              ],
            ),
          );
        },
        loading: () {
          return const Center(child: CircularProgressIndicator.adaptive());
        },
      ),
    );
  }
}
