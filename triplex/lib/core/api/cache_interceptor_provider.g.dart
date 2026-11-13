// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cache_interceptor_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// In-memory HTTP cache with 5-minute TTL.
/// Reduces redundant network calls for profile lookups and static endpoints.
/// Feed data uses Drift for persistent caching instead.

@ProviderFor(cacheOptions)
const cacheOptionsProvider = CacheOptionsProvider._();

/// In-memory HTTP cache with 5-minute TTL.
/// Reduces redundant network calls for profile lookups and static endpoints.
/// Feed data uses Drift for persistent caching instead.

final class CacheOptionsProvider
    extends $FunctionalProvider<CacheOptions, CacheOptions, CacheOptions>
    with $Provider<CacheOptions> {
  /// In-memory HTTP cache with 5-minute TTL.
  /// Reduces redundant network calls for profile lookups and static endpoints.
  /// Feed data uses Drift for persistent caching instead.
  const CacheOptionsProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'cacheOptionsProvider',
          isAutoDispose: false,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$cacheOptionsHash();

  @$internal
  @override
  $ProviderElement<CacheOptions> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  CacheOptions create(Ref ref) {
    return cacheOptions(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(CacheOptions value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<CacheOptions>(value),
    );
  }
}

String _$cacheOptionsHash() => r'8f8e63b0795e35d676fc32f3ce797b90849637e4';

@ProviderFor(dioCacheInterceptor)
const dioCacheInterceptorProvider = DioCacheInterceptorProvider._();

final class DioCacheInterceptorProvider extends $FunctionalProvider<
    DioCacheInterceptor,
    DioCacheInterceptor,
    DioCacheInterceptor> with $Provider<DioCacheInterceptor> {
  const DioCacheInterceptorProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'dioCacheInterceptorProvider',
          isAutoDispose: false,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$dioCacheInterceptorHash();

  @$internal
  @override
  $ProviderElement<DioCacheInterceptor> $createElement(
    $ProviderPointer pointer,
  ) =>
      $ProviderElement(pointer);

  @override
  DioCacheInterceptor create(Ref ref) {
    return dioCacheInterceptor(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(DioCacheInterceptor value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<DioCacheInterceptor>(value),
    );
  }
}

String _$dioCacheInterceptorHash() =>
    r'4ecf6b0ec07124281822eb0d60e5cd6b66860ad7';
