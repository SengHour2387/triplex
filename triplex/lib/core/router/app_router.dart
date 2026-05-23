import 'package:cupertino_native_better/utils/transition_observer.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/core/navigation/settings_shell.dart';
import 'package:triplex/features/accountCenter/Screen/account_center_screen.dart';
import '../../features/auth/Domain/AuthNotifier.dart';
import '../../features/auth/Screen/LoginScreen.dart';
import '../../features/auth/Screen/RegisterScreen.dart';
import '../../features/create/presentation/screens/create_screen.dart';
import '../../features/feed/presentation/screens/feed_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/message/presentation/screens/message_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/settings/screens/settings_screen.dart';
import '../navigation/main_shell.dart';

final routerProvider = Provider<GoRouter>((ref) {
  // Listen to auth state changes and refresh the router
  final authNotifier = ValueNotifier<bool>(false);
  ref.listen(authNotifierProvider, (_, __) {
    authNotifier.value = !authNotifier.value;
  });

  return GoRouter(
    initialLocation: '/home',
    debugLogDiagnostics: false,
    observers: [CNTransitionObserver()],
    refreshListenable: authNotifier,
    redirect: (context, state) {
      final authState = ref.read(authNotifierProvider);
      final isLoading = authState.isLoading;
      if (isLoading) return null;

      final isLoggedIn = authState.valueOrNull != null;
      final isOnAuthPage =
          state.matchedLocation == '/login' ||
          state.matchedLocation == '/register';

      if (!isLoggedIn && !isOnAuthPage) return '/login';
      if (isLoggedIn && isOnAuthPage) return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),

      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            MainShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/feed',
                builder: (context, state) => const FeedScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/create',
                builder: (context, state) => const CreateScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/messages',
                builder: (context, state) => const MessageScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),

      GoRoute(
        path: '/settings',
          redirect: (context, state) => state.uri.path == '/settings'
              ? '/settings/main'
              : null,
        routes: [
          ShellRoute(
              builder: (context,state,subpage) => SettingsShell(subPage: subpage),
              routes: [
                GoRoute(
                    path: 'main',
                  builder: (_,_) => const SettingsScreen()
                ),
                GoRoute(
                    path: 'account-center',
                    builder: (_,_) => const AccountCenterScreen()
                )
              ]
          ),
        ]
      ),
    ],
  );
});
