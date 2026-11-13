import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/core/navigation/main_shell.dart';
import 'package:triplex/core/navigation/settings_shell.dart';
import 'package:triplex/features/account_center/presentation/screens/account_center_screen.dart';
import 'package:triplex/features/auth/domain/auth_notifier.dart';
import 'package:triplex/features/auth/presentation/screens/login_screen.dart';
import 'package:triplex/features/auth/presentation/screens/register_screen.dart';
import 'package:triplex/features/create/presentation/screens/create_screen.dart';
import 'package:triplex/features/feed/domain/models/post_model.dart';
import 'package:triplex/features/feed/presentation/screens/feed_screen.dart';
import 'package:triplex/features/feed/presentation/screens/post_detail_screen.dart';
import 'package:triplex/features/home/presentation/screens/home_screen.dart';
import 'package:triplex/features/message/presentation/screens/message_screen.dart';
import 'package:triplex/features/profile/presentation/screens/drafts_screen.dart';
import 'package:triplex/features/profile/presentation/screens/other_profile_screen.dart';
import 'package:triplex/features/profile/presentation/screens/profile_screen.dart';
import 'package:triplex/features/settings/presentation/screens/settings_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  // Listen to auth state changes and refresh the router
  final authNotifier = ValueNotifier<bool>(false);
  ref.listen(authProvider, (_, __) {
    authNotifier.value = !authNotifier.value;
  });

  return GoRouter(
    initialLocation: '/home',
    observers: [],
    refreshListenable: authNotifier,
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final isLoading = authState.isLoading;
      if (isLoading) return null;

      final isLoggedIn = authState.value != null;
      final isOnAuthPage = state.matchedLocation == '/login' ||
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
        path: '/user/:userId',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return OtherProfileScreen(
            userId: state.pathParameters['userId'] ?? '',
            avatarHeroTag: extra?['avatarHeroTag'] as String?,
            usernameHeroTag: extra?['usernameHeroTag'] as String?,
            initialUsername: extra?['username'] as String?,
            initialName: extra?['name'] as String?,
            initialAvatarUrl: extra?['avatarUrl'] as String?,
          );
        },
      ),
      GoRoute(
        path: '/post/:postId',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          final post = extra?['post'] as PostModel;
          return PostDetailScreen(post: post);
        },
      ),
      GoRoute(
        path: '/settings',
        redirect: (context, state) =>
            state.uri.path == '/settings' ? '/settings/main' : null,
        routes: [
          ShellRoute(
            builder: (context, state, subpage) =>
                SettingsShell(subPage: subpage),
            routes: [
              GoRoute(path: 'main', builder: (_, __) => const SettingsScreen()),
              GoRoute(
                path: 'account-center',
                builder: (_, __) => const AccountCenterScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/drafts',
        builder: (context, state) => const DraftsScreen(),
      ),
    ],
  );
});
