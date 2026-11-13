// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'feed_notifier.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(FeedNotifier)
const feedProvider = FeedNotifierProvider._();

final class FeedNotifierProvider
    extends $AsyncNotifierProvider<FeedNotifier, List<PostModel>> {
  const FeedNotifierProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'feedProvider',
          isAutoDispose: false,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$feedNotifierHash();

  @$internal
  @override
  FeedNotifier create() => FeedNotifier();
}

String _$feedNotifierHash() => r'0d87842aff91ef967cbd05ff0d45fe2826951c2b';

abstract class _$FeedNotifier extends $AsyncNotifier<List<PostModel>> {
  FutureOr<List<PostModel>> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<AsyncValue<List<PostModel>>, List<PostModel>>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<AsyncValue<List<PostModel>>, List<PostModel>>,
        AsyncValue<List<PostModel>>,
        Object?,
        Object?>;
    element.handleValue(ref, created);
  }
}
