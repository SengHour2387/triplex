import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/features/accountCenter/Domain/StateNotifier/change_username_state.dart';
import 'package:triplex/features/accountCenter/Repo/account_center_repo.dart';


part 'change_username_notifier.g.dart';

@riverpod
class ChangeUsernameNotifier  extends _$ChangeUsernameNotifier {
  @override
  Future<void> build() async {

  }

  Future<void> changeUsername( String newUsername,String password ) async {

    ref.read(changeUsernameStateProvider.notifier).setState(.idle);

    if(newUsername.isEmpty || password.isEmpty) {
      ref.read(changeUsernameStateProvider.notifier).setState(.missingField);
    }

    ref.read(changeUsernameStateProvider.notifier).setState(.wait);
    await ref.watch(accountCenterRepoProvider).changeUsername(password, newUsername).whenComplete(() {
      ref.read(changeUsernameStateProvider.notifier).setState(.idle);
    });
  }
}