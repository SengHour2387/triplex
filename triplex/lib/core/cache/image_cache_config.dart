import 'package:flutter_cache_manager/flutter_cache_manager.dart';

/// Custom cache manager for network images with social-media-appropriate limits.
///
/// Configuration:
/// - Max 500 cached objects
/// - 7-day cache duration
/// - LRU eviction policy (built-in)
///
/// Usage with CachedNetworkImage:
/// ```dart
/// CachedNetworkImage(
///   imageUrl: url,
///   cacheManager: AppImageCacheManager(),
/// )
/// ```
class AppImageCacheManager extends CacheManager {
  static const _key = 'triplexImageCache';

  static final AppImageCacheManager _instance = AppImageCacheManager._();
  factory AppImageCacheManager() => _instance;

  AppImageCacheManager._()
      : super(
          Config(
            _key,
            stalePeriod: const Duration(days: 7),
            maxNrOfCacheObjects: 500,
          ),
        );
}
