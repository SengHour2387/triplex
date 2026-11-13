import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/features/account_center/data/account_center_repo.dart';
import 'package:triplex/features/profile/domain/profile_notifier.dart';

part 'change_email_notifier.g.dart';

@riverpod
class ChangeEmailNotifier extends _$ChangeEmailNotifier {
  @override
  Future<void> build() async {}

  Future<void> changeEmail(String newEmail, String password) async {
    if (newEmail.isEmpty || password.isEmpty) {
      state = AsyncError(
          Exception("Email or password cannot be empty"), StackTrace.current);
      return;
    }

    state = const AsyncLoading();

    try {
      final response = await ref
          .read(accountCenterRepoProvider)
          .changeEmail(password, newEmail);
      ref.read(profileProvider.notifier).setUserEmail(response);
      state = const AsyncData(null);
    } catch (e, st) {
      state = AsyncError(e, st);
      rethrow;
    }
  }
}
