// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'goal_notifier.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(GoalNotifier)
const goalProvider = GoalNotifierProvider._();

final class GoalNotifierProvider
    extends $NotifierProvider<GoalNotifier, StopItemModel> {
  const GoalNotifierProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'goalProvider',
          isAutoDispose: false,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$goalNotifierHash();

  @$internal
  @override
  GoalNotifier create() => GoalNotifier();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(StopItemModel value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<StopItemModel>(value),
    );
  }
}

String _$goalNotifierHash() => r'201ef3f96f9d97dc97cb74697ca77bd7f8616db1';

abstract class _$GoalNotifier extends $Notifier<StopItemModel> {
  StopItemModel build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<StopItemModel, StopItemModel>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<StopItemModel, StopItemModel>,
        StopItemModel,
        Object?,
        Object?>;
    element.handleValue(ref, created);
  }
}
