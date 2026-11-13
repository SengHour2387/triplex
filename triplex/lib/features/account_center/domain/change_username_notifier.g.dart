// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'change_username_notifier.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(ChangeUsernameNotifier)
const changeUsernameProvider = ChangeUsernameNotifierProvider._();

final class ChangeUsernameNotifierProvider
    extends $AsyncNotifierProvider<ChangeUsernameNotifier, void> {
  const ChangeUsernameNotifierProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'changeUsernameProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$changeUsernameNotifierHash();

  @$internal
  @override
  ChangeUsernameNotifier create() => ChangeUsernameNotifier();
}

String _$changeUsernameNotifierHash() =>
    r'a563d09aee3066b8a2787809dcc638213c6d0872';

abstract class _$ChangeUsernameNotifier extends $AsyncNotifier<void> {
  FutureOr<void> build();
  @$mustCallSuper
  @override
  void runBuild() {
    build();
    final ref = this.ref as $Ref<AsyncValue<void>, void>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<AsyncValue<void>, void>,
        AsyncValue<void>,
        Object?,
        Object?>;
    element.handleValue(ref, null);
  }
}
