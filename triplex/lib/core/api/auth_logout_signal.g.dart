// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_logout_signal.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$authLogoutSignalHash() => r'60272c3d3c41ab821ea09351b2aff0a10f17a838';

/// A simple counter signal. When it increments, AuthNotifier knows to force logout.
/// This decouples the Dio interceptor from AuthNotifier to avoid circular dependencies.
///
/// Copied from [AuthLogoutSignal].
@ProviderFor(AuthLogoutSignal)
final authLogoutSignalProvider =
    NotifierProvider<AuthLogoutSignal, int>.internal(
      AuthLogoutSignal.new,
      name: r'authLogoutSignalProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$authLogoutSignalHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$AuthLogoutSignal = Notifier<int>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
