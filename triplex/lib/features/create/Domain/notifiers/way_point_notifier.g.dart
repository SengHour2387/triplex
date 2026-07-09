// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'way_point_notifier.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(WayPointNotifier)
const wayPointProvider = WayPointNotifierProvider._();

final class WayPointNotifierProvider
    extends $NotifierProvider<WayPointNotifier, StopItemModel> {
  const WayPointNotifierProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'wayPointProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$wayPointNotifierHash();

  @$internal
  @override
  WayPointNotifier create() => WayPointNotifier();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(StopItemModel value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<StopItemModel>(value),
    );
  }
}

String _$wayPointNotifierHash() => r'744d9ef0ce73080848a6699d390b3b09ffb40233';

abstract class _$WayPointNotifier extends $Notifier<StopItemModel> {
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
