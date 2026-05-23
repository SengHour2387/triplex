import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/core/api/auth_logout_signal.dart';
import 'package:triplex/core/storage/SecureStorage.dart';
import 'package:triplex/features/auth/Domain/userModel.dart';
import 'package:triplex/features/profile/Domain/ProfileNotifier.dart';

import '../Repo/AuthRepo.dart';

part 'AuthNotifier.g.dart';

@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  Future<UserModel?> build() async {
    // ── Listen to forced-logout signal from the Dio interceptor ──────────────
    // We only act when state is NOT loading — during startup (AsyncLoading)
    // build() handles its own error path, preventing an infinite restart loop.
    ref.listen(authLogoutSignalProvider, (_, __) {
      if (!state.isLoading) {
        state = const AsyncData(null);
      }
    });

    final storage = ref.read(secureStorageProvider.notifier);
    final accessToken = await storage.getAccessToken();

    // No token stored → not logged in.
    if (accessToken == null || accessToken.isEmpty) return null;

    try {
      // Happy path: access token still valid.
      // The interceptor transparently handles refresh if the token is expired,
      // so getMe() may succeed even with an expired token after one retry.
      return await ref.read(authRepoProvider).getMe(accessToken);
    } catch (_) {
      // getMe() failed even after the interceptor tried to refresh.
      // Try one final direct refresh before giving up.
      final refreshToken = await storage.getRefreshToken();
      if (refreshToken == null || refreshToken.isEmpty) {
        await storage.deleteAll();
        return null;
      }
      try {
        return await ref.read(authRepoProvider).refreshAndSave(refreshToken);
      } catch (_) {
        // await storage.deleteAll();
        return null;
      }
    }
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  Future<void> login(String email, String password) async {
    state = const AsyncLoading();
    try {
      final result = await ref.read(authRepoProvider).login(email, password);
      await ref.read(profileNotifierProvider.notifier).setUser(result);
      state = AsyncValue.data(result);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> register(String email, String username, String password) async {
    state = const AsyncLoading();
    try {
      final result = await ref
          .read(authRepoProvider)
          .register(email, username, password);
      await ref.read(profileNotifierProvider.notifier).setUser(result);
      state = AsyncValue.data(result);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> logout() async {
    await ref.read(secureStorageProvider.notifier).deleteAll();
    ref.read(profileNotifierProvider.notifier).clearUser();
    state = const AsyncValue.data(null);
  }
}
