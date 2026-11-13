import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/core/widgets/text_h.dart';
import 'package:triplex/features/profile/data/profile_repo.dart';
import 'package:triplex/features/profile/domain/user_profile_model.dart';

enum UserListType { followers, following }

class UserListSheet extends ConsumerStatefulWidget {
  final String userId;
  final String username;
  final UserListType type;

  const UserListSheet({
    super.key,
    required this.userId,
    required this.username,
    required this.type,
  });

  static Future<void> show(
    BuildContext context, {
    required String userId,
    required String username,
    required UserListType type,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => UserListSheet(
        userId: userId,
        username: username,
        type: type,
      ),
    );
  }

  @override
  ConsumerState<UserListSheet> createState() => _UserListSheetState();
}

class _UserListSheetState extends ConsumerState<UserListSheet> {
  late UserListType _currentType;
  late Future<List<UserProfileModel>> _usersFuture;

  @override
  void initState() {
    super.initState();
    _currentType = widget.type;
    _loadUsers();
  }

  void _loadUsers() {
    final repo = ref.read(profileRepoProvider);
    _usersFuture = _currentType == UserListType.followers
        ? repo.getFollowers(widget.userId)
        : repo.getFollowing(widget.userId);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final title =
        _currentType == UserListType.followers ? 'Followers' : 'Following';

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.75,
      ),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: colorScheme.onSurfaceVariant.withAlpha(80),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
            child: Row(
              children: [
                TextH5('@${widget.username}'),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),

          // Segmented Control to switch between Followers and Following
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: CupertinoSlidingSegmentedControl<int>(
              children: const {
                0: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text('Followers')),
                1: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text('Following'))
              },
              groupValue: _currentType == UserListType.followers ? 0 : 1,
              onValueChanged: (index) {
                setState(() {
                  _currentType = index == 0
                      ? UserListType.followers
                      : UserListType.following;
                  _loadUsers();
                });
              },
            ),
          ),
          const Divider(height: 1),

          // Content
          Expanded(
            child: FutureBuilder<List<UserProfileModel>>(
              future: _usersFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                    child: CircularProgressIndicator.adaptive(),
                  );
                }

                if (snapshot.hasError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Failed to load $title',
                          style: TextStyle(color: colorScheme.error),
                        ),
                        const SizedBox(height: 12),
                        CupertinoButton.filled(
                          borderRadius: BorderRadius.circular(24),
                          onPressed: () => setState(() => _loadUsers()),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }

                final users = snapshot.data ?? [];
                if (users.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Card(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(28),
                          child: Column(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              _currentType == UserListType.followers
                                  ? Icons.people_outline_rounded
                                  : Icons.person_add_outlined,
                              size: 44,
                              color:
                                  colorScheme.onSurfaceVariant.withAlpha(120),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              _currentType == UserListType.followers
                                  ? 'No followers yet'
                                  : 'Not following anyone yet',
                              style: TextStyle(
                                color: colorScheme.onSurfaceVariant,
                                fontWeight: FontWeight.w600,
                                fontSize: 15,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
                }

                return ListView.builder(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  itemCount: users.length,
                  itemBuilder: (context, index) {
                    final user = users[index];
                    final isLast = index == users.length - 1;
                    return ListTile(
                      leading: CircleAvatar(
                        radius: 20,
                        backgroundColor: colorScheme.surfaceContainerHighest,
                        backgroundImage: (user.avatarUrl != null &&
                                user.avatarUrl!.isNotEmpty)
                            ? CachedNetworkImageProvider(user.avatarUrl!)
                            : null,
                        child:
                            (user.avatarUrl == null || user.avatarUrl!.isEmpty)
                                ? Text(
                                    user.username.isNotEmpty
                                        ? user.username[0].toUpperCase()
                                        : 'U',
                                    style: TextStyle(
                                      color: colorScheme.primary,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
                                  )
                                : null,
                      ),
                      title: Text(
                        user.username,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                      subtitle: (user.name != null && user.name!.isNotEmpty)
                          ? Text(
                              user.name!,
                              style: TextStyle(
                                color:
                                    colorScheme.onSurfaceVariant.withAlpha(150),
                                fontSize: 12,
                              ),
                            )
                          : null,
                      trailing: Icon(
                        Icons.chevron_right_rounded,
                        size: 18,
                        color: colorScheme.onSurfaceVariant.withAlpha(120),
                      ),
                      onTap: () {
                        Navigator.of(context).pop();
                        context.push('/user/${user.id}');
                      },
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
