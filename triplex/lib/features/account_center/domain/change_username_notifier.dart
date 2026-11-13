import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/features/account_center/data/account_center_repo.dart';
import 'package:triplex/features/account_center/domain/change_username_state.dart';
import 'package:triplex/features/profile/domain/profile_notifier.dart';

part 'change_username_notifier.g.dart';

@riverpod
class ChangeUsernameNotifier extends _$ChangeUsernameNotifier {
  @override
  Future<void> build() async {}

  Future<bool> isUsernameAvailable(String newUsername) {
    return ref.read(accountCenterRepoProvider).isUsernameAvailable(newUsername);
  }

  Future<void> changeUsername(String newUsername) async {
    if (newUsername.isEmpty) {
      ref
          .read(changeUsernameStateProvider.notifier)
          .setState(UsernameState.missingField);
      state =
          AsyncError(Exception("Username cannot be empty"), StackTrace.current);
      return;
    }

    ref.read(changeUsernameStateProvider.notifier).setState(UsernameState.wait);
    state = const AsyncLoading();

    try {
      final response =
          await ref.read(accountCenterRepoProvider).changeUsername(newUsername);
      ref
          .read(changeUsernameStateProvider.notifier)
          .setState(UsernameState.idle);
      ref.read(profileProvider.notifier).setUsername(response);
      state = const AsyncData(null);
    } catch (e, st) {
      ref
          .read(changeUsernameStateProvider.notifier)
          .setState(UsernameState.error);
      state = AsyncError(e, st);
      rethrow;
    }
  }
}
