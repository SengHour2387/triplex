// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'map_notifier.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(MapRevealNotifier)
const mapRevealProvider = MapRevealNotifierProvider._();

final class MapRevealNotifierProvider
    extends $NotifierProvider<MapRevealNotifier, void> {
  const MapRevealNotifierProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'mapRevealProvider',
          isAutoDispose: false,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$mapRevealNotifierHash();

  @$internal
  @override
  MapRevealNotifier create() => MapRevealNotifier();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(void value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<void>(value),
    );
  }
}

String _$mapRevealNotifierHash() => r'19f1f298ae8935a5f6922ad4a6df772b841bb151';

abstract class _$MapRevealNotifier extends $Notifier<void> {
  void build();
  @$mustCallSuper
  @override
  void runBuild() {
    build();
    final ref = this.ref as $Ref<void, void>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<void, void>, void, Object?, Object?>;
    element.handleValue(ref, null);
  }
}
