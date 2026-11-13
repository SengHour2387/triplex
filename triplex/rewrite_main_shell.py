import re

with open('lib/core/navigation/main_shell.dart', 'r') as f:
    content = f.read()

content = content.replace("import 'package:adaptive_platform_ui/adaptive_platform_ui.dart';", "import 'package:flutter/cupertino.dart';")

# Scaffold replacement
new_scaffold = """          return Scaffold(
            bottomNavigationBar: hideTabBar ? null : CupertinoTabBar(
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
          );"""

content = re.sub(
    r"return AdaptiveScaffold\([\s\S]*?body: Stack\([\s\S]*?\),\n          \);",
    new_scaffold,
    content
)

# AdaptiveButton replacement
new_button = """    return Transform.scale(
      scale: 0.8,
      child: CupertinoButton.filled(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        onPressed: () {
          ref.read(feedScrollMinimizedProvider.notifier).setMinimized(false);
        },
        child: const Text("Feed"),
      ),
    );"""

content = re.sub(
    r"return Transform\.scale\([\s\S]*?AdaptiveButton\([\s\S]*?\),\n    \);",
    new_button,
    content
)

with open('lib/core/navigation/main_shell.dart', 'w') as f:
    f.write(content)
