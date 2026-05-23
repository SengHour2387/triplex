import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:progressive_blur/progressive_blur.dart';
import 'package:triplex/core/storage/SecureStorage.dart';
import 'package:triplex/features/auth/Screen/LoginScreen.dart';
import 'package:triplex/features/auth/Screen/RegisterScreen.dart';

import '../../features/auth/Domain/AuthNotifier.dart';
import '../widgets/AdaptiveIcon.dart';

class MainShell extends ConsumerWidget {
  const MainShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authNotifier = ref.watch(authNotifierProvider);

    return authNotifier.when(
      skipError: true,
      data: (data) {
        if (data == null) {
          return LoginScreen();
        } else {
          return Scaffold(
            backgroundColor: Theme.of(context).colorScheme.surface,
            body: navigationShell,
            bottomNavigationBar: ClipRRect(
              child: NavigationBar(
                height: 70,
                maintainBottomViewPadding: false,
                indicatorShape: const CircleBorder(),
                indicatorColor: Colors.transparent,
                backgroundColor: Theme.of(
                  context,
                ).colorScheme.surface.withAlpha(0),
                selectedIndex: navigationShell.currentIndex,
                onDestinationSelected: _onTap,
                labelBehavior:
                    NavigationDestinationLabelBehavior.onlyShowSelected,
                destinations: [
                  NavigationDestination(
                    icon: AdaptiveIcon(icon: "assets/icons/home_outline.svg"),
                    selectedIcon: AdaptiveIcon(
                      icon: "assets/icons/home_bold.svg",
                    ),
                    label: 'Home',
                  ),
                  const NavigationDestination(
                    icon: AdaptiveIcon(icon: "assets/icons/feed_outline.svg"),
                    selectedIcon: AdaptiveIcon(
                      icon: "assets/icons/feed_bold.svg",
                    ),
                    label: 'Feed',
                  ),
                  const NavigationDestination(
                    icon: AdaptiveIcon(icon: "assets/icons/create_bold.svg"),
                    selectedIcon: AdaptiveIcon(
                      icon: "assets/icons/create_outline.svg",
                    ),
                    label: 'Create',
                  ),
                  const NavigationDestination(
                    icon: AdaptiveIcon(
                      icon: "assets/icons/message_outline.svg",
                    ),
                    selectedIcon: AdaptiveIcon(
                      icon: "assets/icons/message_bold.svg",
                    ),
                    label: 'Messages',
                  ),
                  const NavigationDestination(
                    icon: AdaptiveIcon(
                      icon: "assets/icons/profile_outline.svg",
                    ),
                    selectedIcon: AdaptiveIcon(
                      icon: "assets/icons/profile_bold.svg",
                    ),
                    label: 'Profile',
                  ),
                ],
              ),
            ),
            extendBody: true,
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

  void _onTap(int index) {
    navigationShell.goBranch(
      index,
      // Re-tap same tab → scroll to top / pop to root
      initialLocation: index == navigationShell.currentIndex,
    );
  }
}
