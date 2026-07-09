import 'dart:io';

import 'package:cupertino_native_better/cupertino_native.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/features/auth/Screen/LoginScreen.dart';

import '../../features/auth/Domain/AuthNotifier.dart';
import '../widgets/AdaptiveIcon.dart';

class MainShell extends ConsumerWidget {
  const MainShell({super.key, required this.navigationShell});
  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authNotifier = ref.watch(authProvider);

    return authNotifier.when(
      data: (data) {
        if (data == null) {
          return LoginScreen();
        } else {
          return Scaffold(
            extendBodyBehindAppBar: true,
            backgroundColor: Theme.of(context).colorScheme.surface,
            body: navigationShell,
            bottomNavigationBar:

            Platform.isIOS ?

            CNTabBar(
              shrinkCentered: false,
                items: [
                  CNTabBarItem(
                    label: "Discover",
                    icon: CNSymbol("house",size: 16),
                    activeIcon: CNSymbol("house.fill",size: 16),
                  ),
                  CNTabBarItem(
                      label: "Feed",
                      icon: CNSymbol("list.dash.header.rectangle",size: 16),
                      activeIcon: CNSymbol("list.bullet.rectangle.fill",size: 16)
                  ),
                  CNTabBarItem(
                      // label: "Create",
                      icon: CNSymbol("plus.circle",size: 26),
                      activeIcon: CNSymbol("plus.circle.fill",size: 26),
                  ),
                  CNTabBarItem(
                      label: "Message",
                      icon: CNSymbol("message.badge",size: 16),
                      activeIcon: CNSymbol("message.badge.fill",size: 16)
                  ),
                  CNTabBarItem(
                      label: "Profile",
                      icon: CNSymbol("person.crop.circle",size: 16),
                      activeIcon: CNSymbol("person.crop.circle.fill",size: 16)
                  ),
                ],
                currentIndex: navigationShell.currentIndex,
                onTap: _onTap
            )
                :

            ClipRRect(
              child: BackdropFilter(
                filter:  Platform.isIOS ? .blur(sigmaX:0, sigmaY:0): .blur(sigmaX:20, sigmaY:20),
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
