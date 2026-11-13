import 'package:dio_cache_interceptor/dio_cache_interceptor.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'cache_interceptor_provider.g.dart';

/// In-memory HTTP cache with 5-minute TTL.
/// Reduces redundant network calls for profile lookups and static endpoints.
/// Feed data uses Drift for persistent caching instead.
@Riverpod(keepAlive: true)
CacheOptions cacheOptions(Ref ref) {
  return CacheOptions(
    store: MemCacheStore(),
    maxStale: const Duration(minutes: 5),
  );
}

@Riverpod(keepAlive: true)
DioCacheInterceptor dioCacheInterceptor(Ref ref) {
  return DioCacheInterceptor(options: ref.watch(cacheOptionsProvider));
}
