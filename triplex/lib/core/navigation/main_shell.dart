import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:progressive_blur/progressive_blur.dart';

import '../widgets/AdaptiveIcon.dart';

class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor:Theme.of(context).colorScheme.surface,
      body: ProgressiveBlurWidget(
          linearGradientBlur:
          const LinearGradientBlur(
            values: [1, 0.75,0.5,0],
            stops: [0, 0.150,0.175,0.25],
            start: Alignment.bottomCenter,
            end: Alignment.center,
          ), sigma: 64, child: navigationShell),
      bottomNavigationBar: ClipRRect(
        child: Container(
          decoration: BoxDecoration(
            // gradient: LinearGradient(
            //     colors: [Theme.of(context).colorScheme.surface,Theme.of(context).colorScheme.surface.withAlpha(100),Colors.transparent,],
            //   begin: Alignment.bottomCenter,
            //   end: Alignment.topCenter,
            //   stops: [0.0,0.5,1.0],
            //   tileMode: TileMode.clamp
            // )
          ),
          child: NavigationBar(
            height: 70,
            maintainBottomViewPadding: false,
            indicatorShape: const CircleBorder(),
            indicatorColor: Colors.transparent,
            backgroundColor: Theme.of(context).colorScheme.surface.withAlpha(0),
            selectedIndex: navigationShell.currentIndex,
            onDestinationSelected: _onTap,
            labelBehavior: NavigationDestinationLabelBehavior.onlyShowSelected,
            destinations: [
              NavigationDestination(
                icon: AdaptiveIcon(icon: "assets/icons/home_outline.svg"),
                selectedIcon: AdaptiveIcon(icon: "assets/icons/home_bold.svg"),
                label: 'Home',
              ),
              const NavigationDestination(
                icon: AdaptiveIcon(icon: "assets/icons/feed_outline.svg"),
                selectedIcon: AdaptiveIcon(icon: "assets/icons/feed_bold.svg"),
                label: 'Feed',
              ),
              const NavigationDestination(
                icon: AdaptiveIcon(icon: "assets/icons/create_bold.svg"),
                selectedIcon: AdaptiveIcon(icon: "assets/icons/create_outline.svg"),
                label: 'Create',
              ),
              const NavigationDestination(
                icon: AdaptiveIcon(icon: "assets/icons/message_outline.svg"),
                selectedIcon: AdaptiveIcon(icon: "assets/icons/message_bold.svg"),
                label: 'Messages',
              ),
              const NavigationDestination(
                icon:  AdaptiveIcon(icon: "assets/icons/profile_outline.svg"),
                selectedIcon: AdaptiveIcon(icon: "assets/icons/profile_bold.svg"),
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
      extendBody: true,
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
