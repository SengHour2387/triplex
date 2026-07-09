// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_logout_signal.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// A simple counter signal. When it increments, AuthNotifier knows to force logout.
/// This decouples the Dio interceptor from AuthNotifier to avoid circular dependencies.

@ProviderFor(AuthLogoutSignal)
const authLogoutSignalProvider = AuthLogoutSignalProvider._();

/// A simple counter signal. When it increments, AuthNotifier knows to force logout.
/// This decouples the Dio interceptor from AuthNotifier to avoid circular dependencies.
final class AuthLogoutSignalProvider
    extends $NotifierProvider<AuthLogoutSignal, int> {
  /// A simple counter signal. When it increments, AuthNotifier knows to force logout.
  /// This decouples the Dio interceptor from AuthNotifier to avoid circular dependencies.
  const AuthLogoutSignalProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'authLogoutSignalProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$authLogoutSignalHash();

  @$internal
  @override
  AuthLogoutSignal create() => AuthLogoutSignal();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(int value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<int>(value),
    );
  }
}

String _$authLogoutSignalHash() => r'60272c3d3c41ab821ea09351b2aff0a10f17a838';

/// A simple counter signal. When it increments, AuthNotifier knows to force logout.
/// This decouples the Dio interceptor from AuthNotifier to avoid circular dependencies.

abstract class _$AuthLogoutSignal extends $Notifier<int> {
  int build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<int, int>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<int, int>,
              int,
              Object?,
              Object?
            >;
    element.handleValue(ref, created);
  }
}
