import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/features/auth/domain/auth_notifier.dart';
import 'package:triplex/features/auth/presentation/screens/login_screen.dart';
import 'package:triplex/features/feed/domain/notifiers/feed_scroll_notifier.dart';

class MainShell extends ConsumerWidget {
  const MainShell({super.key, required this.navigationShell});
  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authNotifier = ref.watch(authProvider);
    final isMinimized = ref.watch(feedScrollMinimizedProvider);
    final isFeedTab = navigationShell.currentIndex == 1;
    final hideTabBar = isFeedTab && isMinimized;

    return authNotifier.when(
      data: (data) {
        if (data == null) {
          return const LoginScreen();
        } else {
          return Scaffold(
            bottomNavigationBar: hideTabBar
                ? null
                : CupertinoTabBar(
                    items: const [
                      BottomNavigationBarItem(
                        icon: Icon(CupertinoIcons.house),
                        activeIcon: Icon(CupertinoIcons.house_fill),
                        label: 'Home',
                      ),
                      BottomNavigationBarItem(
                        icon: Icon(CupertinoIcons.news),
                        activeIcon: Icon(CupertinoIcons.news_solid),
                        label: 'Feed',
                      ),
                      BottomNavigationBarItem(
                        icon: Icon(CupertinoIcons.add_circled),
                        activeIcon: Icon(CupertinoIcons.add_circled_solid),
                        label: 'Create',
                      ),
                      BottomNavigationBarItem(
                        icon: Icon(CupertinoIcons.chat_bubble),
                        activeIcon: Icon(CupertinoIcons.chat_bubble_fill),
                        label: 'Messages',
                      ),
                      BottomNavigationBarItem(
                        icon: Icon(CupertinoIcons.person),
                        activeIcon: Icon(CupertinoIcons.person_solid),
                        label: 'Profile',
                      ),
                    ],
                    currentIndex: navigationShell.currentIndex,
                    onTap: _onTap,
                  ),
            body: Stack(
              children: [
                navigationShell,
                // Floating Minimized Feed Tab
                Align(
                  alignment: Alignment.bottomCenter,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: AnimatedSlide(
                      duration: const Duration(milliseconds: 350),
                      curve: Curves.easeOutBack,
                      offset: hideTabBar ? Offset.zero : const Offset(0, 2),
                      child: AnimatedOpacity(
                        duration: const Duration(milliseconds: 250),
                        opacity: hideTabBar ? 1.0 : 0.0,
                        child: _buildFloatingFeedTab(context, ref),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        }
      },
      error: (err, trac) {
        return const LoginScreen();
      },
      loading: () {
        return const Scaffold(body: Center(child: CircularProgressIndicator()));
      },
    );
  }

  Widget _buildFloatingFeedTab(BuildContext context, WidgetRef ref) {
    return Transform.scale(
      scale: 0.8,
      child: CupertinoButton.filled(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        onPressed: () {
          ref.read(feedScrollMinimizedProvider.notifier).setMinimized(false);
        },
        child: const Text("Feed"),
      ),
    );
  }

  void _onTap(int index) {
    navigationShell.goBranch(
      index,
      // Re-tap same tab → scroll to top / pop to root
      initialLocation: index == navigationShell.currentIndex,
    );
  }
}
