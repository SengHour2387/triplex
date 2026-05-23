import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'auth_logout_signal.g.dart';

/// A simple counter signal. When it increments, AuthNotifier knows to force logout.
/// This decouples the Dio interceptor from AuthNotifier to avoid circular dependencies.
@Riverpod(keepAlive: true)
class AuthLogoutSignal extends _$AuthLogoutSignal {
  @override
  int build() => 0;

  void trigger() => state++;
}
