import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:triplex/features/reactions/data/reactions_repo.dart';
import 'package:triplex/features/reactions/domain/models/reaction_model.dart';

class PostReactionsSheet extends ConsumerStatefulWidget {
  final String postId;

  const PostReactionsSheet({
    super.key,
    required this.postId,
  });

  static Future<void> show(BuildContext context, String postId) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => PostReactionsSheet(postId: postId),
    );
  }

  @override
  ConsumerState<PostReactionsSheet> createState() => _PostReactionsSheetState();
}

class _PostReactionsSheetState extends ConsumerState<PostReactionsSheet> {
  String _selectedFilter = 'all';
  late Future<PostReactionsResponse> _reactionsFuture;

  @override
  void initState() {
    super.initState();
    _fetchReactions();
  }

  void _fetchReactions() {
    _reactionsFuture =
        ref.read(reactionsRepoProvider).getPostReactions(widget.postId);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      height: MediaQuery.of(context).size.height * 0.65,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Header Drag Handle
          const SizedBox(height: 10),
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: colorScheme.onSurface.withAlpha(60),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Header Title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Reactions',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: colorScheme.onSurface,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 20),
                  onPressed: () => Navigator.of(context).pop(),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Content
          Expanded(
            child: FutureBuilder<PostReactionsResponse>(
              future: _reactionsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                      child: CircularProgressIndicator.adaptive());
                }

                if (snapshot.hasError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Failed to load reactions',
                          style: TextStyle(color: colorScheme.error),
                        ),
                        const SizedBox(height: 8),
                        TextButton(
                          onPressed: () => setState(_fetchReactions),
                          child: const Text('Try Again'),
                        ),
                      ],
                    ),
                  );
                }

                final data = snapshot.data;
                if (data == null || data.users.isEmpty) {
                  return Center(
                    child: Text(
                      'No reactions yet',
                      style: TextStyle(
                          color: colorScheme.onSurface.withAlpha(120)),
                    ),
                  );
                }

                final filteredUsers = _selectedFilter == 'all'
                    ? data.users
                    : data.users
                        .where((u) => u.type == _selectedFilter)
                        .toList();

                return Column(
                  children: [
                    // Reaction Type Filter Chips
                    Container(
                      height: 44,
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        children: [
                          _buildFilterChip(
                            label: 'All ${data.total}',
                            isSelected: _selectedFilter == 'all',
                            onTap: () =>
                                setState(() => _selectedFilter = 'all'),
                          ),
                          ...data.reactions.map((r) {
                            return _buildFilterChip(
                              label:
                                  '${ReactionTypes.getEmoji(r.type)} ${r.count}',
                              isSelected: _selectedFilter == r.type,
                              onTap: () =>
                                  setState(() => _selectedFilter = r.type),
                            );
                          }),
                        ],
                      ),
                    ),
                    const Divider(height: 1),

                    // Users List
                    Expanded(
                      child: ListView.separated(
                        itemCount: filteredUsers.length,
                        separatorBuilder: (context, index) =>
                            const Divider(height: 1, indent: 64),
                        itemBuilder: (context, index) {
                          final user = filteredUsers[index];
                          return ListTile(
                            leading: Stack(
                              clipBehavior: Clip.none,
                              children: [
                                CircleAvatar(
                                  radius: 20,
                                  backgroundColor:
                                      colorScheme.surfaceContainerHighest,
                                  backgroundImage: (user.avatarUrl != null &&
                                          user.avatarUrl!.isNotEmpty)
                                      ? CachedNetworkImageProvider(
                                          user.avatarUrl!)
                                      : null,
                                  child: (user.avatarUrl == null ||
                                          user.avatarUrl!.isEmpty)
                                      ? Text(
                                          user.username.isNotEmpty
                                              ? user.username[0].toUpperCase()
                                              : 'U',
                                          style: TextStyle(
                                            color: colorScheme.primary,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        )
                                      : null,
                                ),
                                Positioned(
                                  right: -4,
                                  bottom: -4,
                                  child: Container(
                                    padding: const EdgeInsets.all(2),
                                    decoration: BoxDecoration(
                                      color: isDark
                                          ? const Color(0xFF1E1E1E)
                                          : Colors.white,
                                      shape: BoxShape.circle,
                                    ),
                                    child: Text(
                                      ReactionTypes.getEmoji(user.type),
                                      style: const TextStyle(fontSize: 14),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            title: Text(
                              user.name != null && user.name!.isNotEmpty
                                  ? user.name!
                                  : user.username,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w600, fontSize: 14),
                            ),
                            subtitle: Text(
                              '@${user.username}',
                              style: TextStyle(
                                color: colorScheme.onSurface.withAlpha(140),
                                fontSize: 12,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: isSelected
                ? colorScheme.primary.withAlpha(25)
                : colorScheme.surfaceContainerHighest.withAlpha(80),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected ? colorScheme.primary : Colors.transparent,
              width: 1.2,
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              color: isSelected ? colorScheme.primary : colorScheme.onSurface,
            ),
          ),
        ),
      ),
    );
  }
}
