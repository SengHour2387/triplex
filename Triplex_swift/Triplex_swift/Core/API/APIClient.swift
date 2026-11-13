//
//  APIClient.swift
//  Triplex_swift
//
//  Equivalent of: triplex/lib/core/api/dio_provider.dart
//
//  Flutter's `dioProvider` creates a single Dio instance with:
//    - BaseOptions (baseUrl, timeouts, content-type)
//    - AuthInterceptor   → token attach + refresh on 401/403
//    - DioCacheInterceptor → in-memory 5-min cache
//
//  This file is the single shared HTTP client for the whole app.
//  Inject it via the SwiftUI environment:
//    .environment(APIClient.shared)
//

import Foundation

/// Central HTTP client — wraps URLSession with auth + cache behaviour.
/// Mirrors the role of `dioProvider` (keepAlive: true) in Riverpod.
@Observable
final class APIClient {

    // MARK: - Shared instance (equivalent to Riverpod keepAlive)

    static let shared = APIClient()

    // MARK: - Internal state

    private let session: URLSession
    private let interceptor: AuthInterceptor
    let storage: SecureStorage        // exposed so AuthViewModel can read/write tokens

    // MARK: - Init

    private init() {
        self.storage     = SecureStorage()
        self.interceptor = AuthInterceptor(storage: storage)

        let config = URLSessionConfiguration.default
        config.urlCache                    = HTTPCache.shared
        config.requestCachePolicy          = .useProtocolCachePolicy
        config.timeoutIntervalForRequest   = AppConfig.connectTimeout
        config.timeoutIntervalForResource  = AppConfig.receiveTimeout
        config.httpAdditionalHeaders       = ["Content-Type": "application/json",
                                               "Accept": "application/json"]
        self.session = URLSession(configuration: config)
    }

    // MARK: - Request entry point

    /// Performs an authenticated HTTP request.
    ///
    /// - Parameters:
    ///   - path: Path relative to `AppConfig.baseURL` (e.g. `"posts"`, `"auth/me"`)
    ///   - method: HTTP verb — defaults to `"GET"`
    ///   - body: Optional JSON-encodable dictionary (for POST/PATCH/PUT)
    ///   - cache: Pass `true` to apply the 5-min in-memory cache (GET only)
    /// - Returns: Decoded `T` on success
    /// - Throws: `APIError`
    func request<T: Decodable>(
        _ path: String,
        method: String = "GET",
        body: [String: Any]? = nil,
        cache: Bool = false
    ) async throws -> T {
        var urlRequest = buildRequest(path: path, method: method, body: body, cache: cache)
        await interceptor.adapt(&urlRequest)

        do {
            let (data, response) = try await session.data(for: urlRequest)
            return try handle(data: data, response: response, request: urlRequest)
        } catch let apiError as APIError {
            // Handle 401/403 with token refresh + retry (one time).
            guard case .unauthorized = apiError else { throw apiError }
            guard let newToken = await interceptor.refresh() else { throw apiError }

            // Retry with fresh token.
            urlRequest.setValue("Bearer \(newToken)", forHTTPHeaderField: "Authorization")
            let (data, response) = try await session.data(for: urlRequest)
            return try handle(data: data, response: response, request: urlRequest)
        }
    }

    /// Fire-and-forget POST/DELETE that returns no body.
    func send(
        _ path: String,
        method: String = "POST",
        body: [String: Any]? = nil
    ) async throws {
        var urlRequest = buildRequest(path: path, method: method, body: body, cache: false)
        await interceptor.adapt(&urlRequest)

        let (data, response) = try await session.data(for: urlRequest)
        _ = try handle(data: data, response: response, request: urlRequest) as EmptyResponse
    }

    // MARK: - Helpers

    private func buildRequest(
        path: String,
        method: String,
        body: [String: Any]?,
        cache: Bool
    ) -> URLRequest {
        let url = AppConfig.baseURL.appendingPathComponent(path)
        var request = URLRequest(url: url)
        request.httpMethod = method

        if let body {
            request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        }

        if cache && method == "GET" {
            HTTPCache.apply(to: &request)
        } else {
            request.cachePolicy = .reloadIgnoringLocalCacheData
        }

        return request
    }

    private func handle<T: Decodable>(
        data: Data,
        response: URLResponse,
        request: URLRequest
    ) throws -> T {
        guard let http = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        switch http.statusCode {
        case 200..<300:
            do {
                return try JSONDecoder.api.decode(T.self, from: data)
            } catch {
                throw APIError.decodingFailed(error)
            }
        case 401, 403:
            throw APIError.unauthorized
        case 404:
            throw APIError.notFound
        case 422:
            let msg = (try? JSONDecoder.api.decode(APIErrorBody.self, from: data))?.message
            throw APIError.validation(msg ?? "Validation error")
        case 500...:
            throw APIError.server(http.statusCode)
        default:
            throw APIError.http(http.statusCode)
        }
    }
}

// MARK: - Supporting types

/// Used for `send()` responses that have no body.
private struct EmptyResponse: Decodable {}

/// Structured API error body from the Node backend.
private struct APIErrorBody: Decodable {
    let message: String?
}

// MARK: - APIError

enum APIError: Error, LocalizedError {
    case unauthorized
    case notFound
    case validation(String)
    case server(Int)
    case http(Int)
    case invalidResponse
    case decodingFailed(Error)

    var errorDescription: String? {
        switch self {
        case .unauthorized:          return "Session expired. Please log in again."
        case .notFound:              return "Resource not found."
        case .validation(let msg):   return msg
        case .server(let code):      return "Server error (\(code))."
        case .http(let code):        return "HTTP error (\(code))."
        case .invalidResponse:       return "Invalid server response."
        case .decodingFailed(let e): return "Failed to parse response: \(e.localizedDescription)"
        }
    }
}

// MARK: - JSONDecoder shared config

extension JSONDecoder {
    /// Shared decoder matching the Node.js backend's camelCase + ISO8601 dates.
    static let api: JSONDecoder = {
        let d = JSONDecoder()
        d.keyDecodingStrategy  = .convertFromSnakeCase
        d.dateDecodingStrategy = .iso8601
        return d
    }()
}
