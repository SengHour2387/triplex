// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'feed_repo.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(feedRepo)
const feedRepoProvider = FeedRepoProvider._();

final class FeedRepoProvider
    extends $FunctionalProvider<FeedRepo, FeedRepo, FeedRepo>
    with $Provider<FeedRepo> {
  const FeedRepoProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'feedRepoProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$feedRepoHash();

  @$internal
  @override
  $ProviderElement<FeedRepo> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  FeedRepo create(Ref ref) {
    return feedRepo(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(FeedRepo value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<FeedRepo>(value),
    );
  }
}

String _$feedRepoHash() => r'057321b5e4c4e326b7fb75f6c7320c1d3fda98d3';
