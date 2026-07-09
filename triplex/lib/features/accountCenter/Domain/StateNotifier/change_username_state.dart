import 'package:riverpod_annotation/riverpod_annotation.dart';


part 'change_username_state.g.dart';

enum UsernameState {
  idle,
  wait,
  wrongPassword,
  missingField,
  usernameIsTaken,
  error
}


@riverpod
class ChangeUsernameState extends _$ChangeUsernameState {

  @override
  UsernameState build() {
    return UsernameState.idle;
  }

  void setState( UsernameState newState ) {
    state = newState;
  }

  void resetState() {
    state = UsernameState.idle;
  }

}

