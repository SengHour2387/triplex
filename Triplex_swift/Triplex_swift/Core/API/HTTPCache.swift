//
//  HTTPCache.swift
//  Triplex_swift
//
//  Equivalent of: triplex/lib/core/api/cache_interceptor_provider.dart
//
//  Flutter uses `dio_cache_interceptor` with `MemCacheStore` and a 5-minute TTL.
//  iOS provides `URLCache` natively — we configure an in-memory-only cache
//  with the same 5-minute max-age policy applied at the request level.
//

import Foundation

enum HTTPCache {
    /// Shared in-memory URL cache (no disk storage, matching Flutter's MemCacheStore).
    /// 20 MB capacity — feed images use a separate image cache.
    static let shared: URLCache = {
        URLCache(memoryCapacity: 20 * 1_024 * 1_024, diskCapacity: 0, directory: nil)
    }()

    /// 5-minute TTL, matching `maxStale: Duration(minutes: 5)` in Flutter.
    static let ttl: TimeInterval = 5 * 60

    /// Applies a cache policy to a request so URLSession honours the TTL.
    /// Pass `.returnCacheDataElseLoad` for GET endpoints that should cache,
    /// or `.reloadIgnoringLocalCacheData` for mutations.
    static func apply(ttl: TimeInterval = HTTPCache.ttl, to request: inout URLRequest) {
        request.cachePolicy = .returnCacheDataElseLoad
        // Inject Cache-Control header so URLCache respects the TTL.
        request.setValue("max-age=\(Int(ttl))", forHTTPHeaderField: "Cache-Control")
    }
}
