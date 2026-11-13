// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'change_email_notifier.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(ChangeEmailNotifier)
const changeEmailProvider = ChangeEmailNotifierProvider._();

final class ChangeEmailNotifierProvider
    extends $AsyncNotifierProvider<ChangeEmailNotifier, void> {
  const ChangeEmailNotifierProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'changeEmailProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$changeEmailNotifierHash();

  @$internal
  @override
  ChangeEmailNotifier create() => ChangeEmailNotifier();
}

String _$changeEmailNotifierHash() =>
    r'e2f57b9a24c99f9c90f10979697a83e02ffe9d3c';

abstract class _$ChangeEmailNotifier extends $AsyncNotifier<void> {
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
