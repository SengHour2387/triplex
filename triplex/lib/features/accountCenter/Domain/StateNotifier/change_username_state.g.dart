// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'change_username_state.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(ChangeUsernameState)
const changeUsernameStateProvider = ChangeUsernameStateProvider._();

final class ChangeUsernameStateProvider
    extends $NotifierProvider<ChangeUsernameState, UsernameState> {
  const ChangeUsernameStateProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'changeUsernameStateProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$changeUsernameStateHash();

  @$internal
  @override
  ChangeUsernameState create() => ChangeUsernameState();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(UsernameState value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<UsernameState>(value),
    );
  }
}

String _$changeUsernameStateHash() =>
    r'e1150db5c052f9a24c1bbf93f284d9d2b62c200b';

abstract class _$ChangeUsernameState extends $Notifier<UsernameState> {
  UsernameState build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<UsernameState, UsernameState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<UsernameState, UsernameState>,
              UsernameState,
              Object?,
              Object?
            >;
    element.handleValue(ref, created);
  }
}
