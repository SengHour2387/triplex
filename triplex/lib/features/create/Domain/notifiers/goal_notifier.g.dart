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

String _$goalNotifierHash() => r'4c95d047a704b9fb0d2b4933f55327516a013aa0';

abstract class _$GoalNotifier extends $Notifier<StopItemModel> {
  StopItemModel build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<StopItemModel, StopItemModel>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<StopItemModel, StopItemModel>,
              StopItemModel,
              Object?,
              Object?
            >;
    element.handleValue(ref, created);
  }
}
