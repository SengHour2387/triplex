import 'dart:convert';

import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/core/api/auth_logout_signal.dart';
import 'package:triplex/core/storage/SecureStorage.dart';
import 'package:triplex/features/auth/Domain/userModel.dart';

import '../Repo/AuthRepo.dart';

part 'AuthNotifier.g.dart';

@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  Future<UserModel?> build() async {
    ref.listen(authLogoutSignalProvider, (_, __) {
      if (!state.isLoading) {
        state = const AsyncData(null);
      }
    });

    final storage = ref.read(secureStorageProvider.notifier);

    // Read cached user from secure storage (fast, no network).
    // No startup token validation — validate lazily on first real API call,
    // just like Facebook. If the interceptor fails to refresh, it emits
    // authLogoutSignal above which sets state to null.
    final cachedUserJson = await storage.readUser();
    if (cachedUserJson != null && cachedUserJson.isNotEmpty) {
      try {
        return UserModel.fromJson(
          jsonDecode(cachedUserJson) as Map<String, dynamic>,
        );
      } catch (_) {
        // cached user is corrupted, ignore
      }
    }
    return null;
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  Future<void> login(String email, String password) async {
    state = const AsyncLoading();
    try {
      final result = await ref.read(authRepoProvider).login(email, password);
      final storage = ref.read(secureStorageProvider.notifier);
      await storage.writeUser(jsonEncode(result.toJson()));
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
      final storage = ref.read(secureStorageProvider.notifier);
      await storage.writeUser(jsonEncode(result.toJson()));
      state = AsyncValue.data(result);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> logout() async {
    await ref.read(secureStorageProvider.notifier).deleteAll();
    state = const AsyncValue.data(null);
  }
}
