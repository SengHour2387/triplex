// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'feed_scroll_notifier.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(feedScrollController)
const feedScrollControllerProvider = FeedScrollControllerProvider._();

final class FeedScrollControllerProvider extends $FunctionalProvider<
    ScrollController,
    ScrollController,
    ScrollController> with $Provider<ScrollController> {
  const FeedScrollControllerProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'feedScrollControllerProvider',
          isAutoDispose: false,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$feedScrollControllerHash();

  @$internal
  @override
  $ProviderElement<ScrollController> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  ScrollController create(Ref ref) {
    return feedScrollController(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(ScrollController value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<ScrollController>(value),
    );
  }
}

String _$feedScrollControllerHash() =>
    r'0491540bf7b8ab8908780198e17aaef30fdda6fa';

@ProviderFor(FeedScrollMinimized)
const feedScrollMinimizedProvider = FeedScrollMinimizedProvider._();

final class FeedScrollMinimizedProvider
    extends $NotifierProvider<FeedScrollMinimized, bool> {
  const FeedScrollMinimizedProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'feedScrollMinimizedProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$feedScrollMinimizedHash();

  @$internal
  @override
  FeedScrollMinimized create() => FeedScrollMinimized();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(bool value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<bool>(value),
    );
  }
}

String _$feedScrollMinimizedHash() =>
    r'cd6e1ed49c5dedfd5c0d2054f56de52473dcda30';

abstract class _$FeedScrollMinimized extends $Notifier<bool> {
  bool build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<bool, bool>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<bool, bool>, bool, Object?, Object?>;
    element.handleValue(ref, created);
  }
}
