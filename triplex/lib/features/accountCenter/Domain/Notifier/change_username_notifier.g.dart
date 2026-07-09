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
    r'43a6379b96f10d0a33e4fc0e9499838454fc7d59';

abstract class _$ChangeUsernameNotifier extends $AsyncNotifier<void> {
  FutureOr<void> build();
  @$mustCallSuper
  @override
  void runBuild() {
    build();
    final ref = this.ref as $Ref<AsyncValue<void>, void>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<void>, void>,
              AsyncValue<void>,
              Object?,
              Object?
            >;
    element.handleValue(ref, null);
  }
}
