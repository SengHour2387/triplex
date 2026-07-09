import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/features/accountCenter/Domain/StateNotifier/change_username_state.dart';
import 'package:triplex/features/accountCenter/Repo/account_center_repo.dart';
import 'package:triplex/features/profile/Domain/ProfileNotifier.dart';


part 'change_username_notifier.g.dart';

@riverpod
class ChangeUsernameNotifier  extends _$ChangeUsernameNotifier {
  @override
  Future<void> build() async {

  }


  Future<bool> isUsernameAvailable( String? newUsername ) async {

    if (newUsername != null) {
      await ref.watch(accountCenterRepoProvider).isUsernameAvailable(newUsername);
    }
    return false;
  }

  Future<void> changeUsername( String newUsername, String password ) async {

    if (newUsername.isEmpty || password.isEmpty) {
      ref.read(changeUsernameStateProvider.notifier).setState(UsernameState.missingField);
      state = AsyncError(Exception("Username or password cannot be empty"), StackTrace.current);
      return;
    }

    ref.read(changeUsernameStateProvider.notifier).setState(UsernameState.wait);
    state = const AsyncLoading();

    try {
      final response = await ref.read(accountCenterRepoProvider).changeUsername(password, newUsername);
      ref.read(changeUsernameStateProvider.notifier).setState(UsernameState.idle);
      ref.read(profileProvider.notifier).setUsername(response);
      state = const AsyncData(null);
    } catch (e, st) {
      ref.read(changeUsernameStateProvider.notifier).setState(UsernameState.error);
      state = AsyncError(e, st);
      rethrow;
    }
  }
}