import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/profile_entity.dart';
import '../providers/profile_providers.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(profileNotifierProvider);
    const primary = Color(0xFF7C3AED);

    return Scaffold(
      extendBodyBehindAppBar: true,
      body: profileAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: primary),
        ),
        error: (e, _) => Center(
          child: Text(e.toString(),
              style: const TextStyle(color: Colors.redAccent)),
        ),
        data: (profile) => profile == null
            ? const Center(child: Text('No profile found'))
            : _ProfileContent(
                profile: profile,
                tabController: _tabController,
              ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
class _ProfileContent extends StatelessWidget {
  const _ProfileContent({
    required this.profile,
    required this.tabController,
  });

  final ProfileEntity profile;
  final TabController tabController;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return NestedScrollView(
      clipBehavior: Clip.antiAlias,
      headerSliverBuilder: (context, innerBoxIsScrolled) => [
        _buildSliverAppBar(context, isDark),
        SliverToBoxAdapter(child: _buildProfileInfo(context, colorScheme)),
        SliverToBoxAdapter(child: _buildStatsRow(context, colorScheme, isDark)),
        SliverToBoxAdapter(child: _buildActionButtons(context, colorScheme, isDark)),
        SliverPersistentHeader(
          pinned: true,
          delegate: _StickyTabBarDelegate(
            tabBar: TabBar(
              controller: tabController,
              indicatorColor: colorScheme.primary,
              indicatorWeight: 2,
              labelColor: colorScheme.onSurface,
              unselectedLabelColor: colorScheme.onSurfaceVariant,
              labelStyle: const TextStyle(
                  fontSize: 13, fontWeight: FontWeight.w600),
              tabs: const [
                Tab(icon: Icon(Icons.grid_on, size: 20)),
                Tab(icon: Icon(Icons.play_circle_outline, size: 20)),
                Tab(icon: Icon(Icons.person_pin_outlined, size: 20)),
              ],
            ),
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
          ),
        ),
      ],
      body: TabBarView(
        controller: tabController,
        children: [
          _PostsGrid(count: profile.postsCount),
          _EmptyTab(icon: Icons.play_circle_outline, label: 'No Reels yet'),
          _EmptyTab(icon: Icons.person_pin_outlined, label: 'No tagged posts'),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar(BuildContext context, bool isDark) {
    final scaffoldBg = Theme.of(context).scaffoldBackgroundColor;

    return SliverAppBar(
      expandedHeight: 220,
      collapsedHeight: kToolbarHeight,
      pinned: true,
      backgroundColor: scaffoldBg,
      actions: [
        IconButton(
          icon: Icon(
            Icons.more_vert,
            color: Theme.of(context).colorScheme.onSurface,
          ),
          onPressed: () {},
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            // Cover gradient — stays consistent in both modes
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF4F46E5),
                    Color(0xFF7C3AED),
                    Color(0xFFDB2777),
                  ],
                ),
              ),
            ),
            // Bottom fade into scaffold background
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                height: 80,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      scaffoldBg.withValues(alpha: 0.9),
                    ],
                  ),
                ),
              ),
            ),
            // Avatar
            Positioned(
              bottom: 12,
              left: 20,
              child: _Avatar(
                name: profile.displayName,
                avatarUrl: profile.avatarUrl,
                radius: 44,
                borderColor: scaffoldBg,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileInfo(BuildContext context, ColorScheme colorScheme) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                profile.displayName,
                style: TextStyle(
                  color: colorScheme.onSurface,
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.3,
                ),
              ),
              if (profile.isVerified) ...[
                const SizedBox(width: 6),
                Icon(Icons.verified, color: colorScheme.primary, size: 20),
              ],
            ],
          ),
          const SizedBox(height: 3),
          Text(
            '@${profile.username}',
            style: TextStyle(
              color: colorScheme.onSurfaceVariant,
              fontSize: 14,
              fontWeight: FontWeight.w400,
            ),
          ),
          if (profile.bio != null) ...[
            const SizedBox(height: 10),
            Text(
              profile.bio!,
              style: TextStyle(
                color: colorScheme.onSurface.withValues(alpha: 0.8),
                fontSize: 14,
                height: 1.5,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatsRow(
      BuildContext context, ColorScheme colorScheme, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      child: Row(
        children: [
          _StatItem(
              value: _formatCount(profile.postsCount),
              label: 'Posts',
              colorScheme: colorScheme),
          _VerticalDividerWidget(isDark: isDark),
          _StatItem(
              value: _formatCount(profile.followersCount),
              label: 'Followers',
              colorScheme: colorScheme),
          _VerticalDividerWidget(isDark: isDark),
          _StatItem(
              value: _formatCount(profile.followingCount),
              label: 'Following',
              colorScheme: colorScheme),
        ],
      ),
    );
  }

  Widget _buildActionButtons(
      BuildContext context, ColorScheme colorScheme, bool isDark) {
    final borderColor =
        isDark ? const Color(0xFF374151) : const Color(0xFFD1D5DB);
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 18),
      child: Row(
        children: [
          Expanded(
            child: _OutlineButton(
              label: 'Edit Profile',
              onTap: () {},
              colorScheme: colorScheme,
              borderColor: borderColor,
            ),
          ),
          const SizedBox(width: 10),
          _IconOutlineButton(
              icon: Icons.person_add_outlined,
              onTap: () {},
              colorScheme: colorScheme,
              borderColor: borderColor),
          const SizedBox(width: 10),
          _IconOutlineButton(
              icon: Icons.share_outlined,
              onTap: () {},
              colorScheme: colorScheme,
              borderColor: borderColor),
        ],
      ),
    );
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
String _formatCount(int count) {
  if (count >= 1000000) return '${(count / 1000000).toStringAsFixed(1)}M';
  if (count >= 1000) return '${(count / 1000).toStringAsFixed(1)}K';
  return count.toString();
}

class _Avatar extends StatelessWidget {
  const _Avatar(
      {required this.name,
      this.avatarUrl,
      required this.radius,
      required this.borderColor});
  final String name;
  final String? avatarUrl;
  final double radius;
  final Color borderColor;

  @override
  Widget build(BuildContext context) {
    final initials = name.trim().split(' ').take(2).map((w) => w[0]).join();
    return Container(
      width: radius * 2,
      height: radius * 2,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: const LinearGradient(
          colors: [Color(0xFF7C3AED), Color(0xFF4F46E5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: borderColor, width: 3),
      ),
      child: Center(
        child: Text(
          initials.toUpperCase(),
          style: TextStyle(
            color: Colors.white,
            fontSize: radius * 0.55,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  const _StatItem(
      {required this.value,
      required this.label,
      required this.colorScheme});
  final String value;
  final String label;
  final ColorScheme colorScheme;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              color: colorScheme.onSurface,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            label,
            style: TextStyle(
              color: colorScheme.onSurfaceVariant,
              fontSize: 12,
              fontWeight: FontWeight.w400,
            ),
          ),
        ],
      ),
    );
  }
}

class _VerticalDividerWidget extends StatelessWidget {
  const _VerticalDividerWidget({required this.isDark});
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 34,
      color: isDark ? const Color(0xFF1F1F2E) : const Color(0xFFE5E7EB),
    );
  }
}

class _OutlineButton extends StatelessWidget {
  const _OutlineButton(
      {required this.label,
      required this.onTap,
      required this.colorScheme,
      required this.borderColor});
  final String label;
  final VoidCallback onTap;
  final ColorScheme colorScheme;
  final Color borderColor;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 38,
        decoration: BoxDecoration(
          border: Border.all(color: borderColor),
          borderRadius: BorderRadius.circular(10),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            color: colorScheme.onSurface,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

class _IconOutlineButton extends StatelessWidget {
  const _IconOutlineButton(
      {required this.icon,
      required this.onTap,
      required this.colorScheme,
      required this.borderColor});
  final IconData icon;
  final VoidCallback onTap;
  final ColorScheme colorScheme;
  final Color borderColor;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          border: Border.all(color: borderColor),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: colorScheme.onSurface, size: 18),
      ),
    );
  }
}

class _PostsGrid extends StatelessWidget {
  const _PostsGrid({required this.count});
  final int count;

  static const _gradients = [
    [Color(0xFF7C3AED), Color(0xFF4F46E5)],
    [Color(0xFF0EA5E9), Color(0xFF06B6D4)],
    [Color(0xFFDB2777), Color(0xFFEC4899)],
    [Color(0xFF059669), Color(0xFF10B981)],
    [Color(0xFFF59E0B), Color(0xFFEF4444)],
    [Color(0xFF8B5CF6), Color(0xFFDB2777)],
  ];

  @override
  Widget build(BuildContext context) {
    final displayCount = count > 0 ? count.clamp(1, 18) : 12;
    return GridView.builder(
      padding: EdgeInsets.zero,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 2,
        mainAxisSpacing: 2,
      ),
      itemCount: displayCount,
      itemBuilder: (_, i) {
        final g = _gradients[i % _gradients.length];
        return Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: g,
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        );
      },
    );
  }
}

class _EmptyTab extends StatelessWidget {
  const _EmptyTab({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: colorScheme.onSurfaceVariant.withValues(alpha: 0.5), size: 48),
          const SizedBox(height: 12),
          Text(label,
              style: TextStyle(
                  color: colorScheme.onSurfaceVariant, fontSize: 14)),
        ],
      ),
    );
  }
}

// ── Sticky tab bar delegate ───────────────────────────────────────────────────
class _StickyTabBarDelegate extends SliverPersistentHeaderDelegate {
  const _StickyTabBarDelegate(
      {required this.tabBar, required this.backgroundColor});
  final TabBar tabBar;
  final Color backgroundColor;

  @override
  double get minExtent => tabBar.preferredSize.height;
  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: backgroundColor,
      child: tabBar,
    );
  }

  @override
  bool shouldRebuild(_StickyTabBarDelegate oldDelegate) =>
      oldDelegate.backgroundColor != backgroundColor;
}
