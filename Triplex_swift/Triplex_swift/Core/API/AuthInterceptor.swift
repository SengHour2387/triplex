//
//  AuthInterceptor.swift
//  Triplex_swift
//
//  Equivalent of: triplex/lib/core/api/auth_interceptor.dart
//
//  Flutter uses a Dio Interceptor with a Dart Completer as a mutex to prevent
//  simultaneous token refreshes. This file ports that same pattern using
//  Swift concurrency (async/await + actor isolation).
//

import Foundation

/// Attached to every `URLRequest` going through `APIClient`.
/// - Reads the stored access token and attaches `Authorization: Bearer …`
/// - On 401/403, attempts a token refresh once (mutex via `actor`)
/// - If refresh fails fatally, wipes tokens and fires `AuthLogoutSignal`
actor AuthInterceptor {
    // MARK: - Dependencies

    private let storage: SecureStorage
    private let logoutSignal: AuthLogoutSignal

    /// Dedicated session for refresh calls — avoids re-entering the interceptor.
    private let refreshSession: URLSession

    // MARK: - Mutex state (actor-isolated, safe by definition)

    private var isRefreshing = false
    /// Continuations queued while a refresh is already in flight.
    private var waitingContinuations: [CheckedContinuation<String?, Never>] = []

    // MARK: - Init

    init(storage: SecureStorage, logoutSignal: AuthLogoutSignal = .shared) {
        self.storage = storage
        self.logoutSignal = logoutSignal

        let (requestTimeout, resourceTimeout) = Self.readTimeouts()
        let config = URLSessionConfiguration.ephemeral
        config.timeoutIntervalForRequest  = requestTimeout
        config.timeoutIntervalForResource = resourceTimeout
        self.refreshSession = URLSession(configuration: config)
    }

    // MARK: - Public API

    /// Attach the current access token to a request.
    func adapt(_ request: inout URLRequest) {
        if let token = storage.getAccessToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
    }

    /// Called when a response comes back 401 or 403.
    /// Returns a new valid access token, or `nil` if refresh failed fatally.
    func refresh() async -> String? {
        // ── Another task is already refreshing — queue behind it ─────────────
        if isRefreshing {
            return await withCheckedContinuation { continuation in
                waitingContinuations.append(continuation)
            }
        }

        // ── Acquire the mutex ─────────────────────────────────────────────────
        isRefreshing = true
        defer { isRefreshing = false }

        let newToken = await performRefresh()

        // ── Unblock all waiting tasks ─────────────────────────────────────────
        let queued = waitingContinuations
        waitingContinuations.removeAll()
        for continuation in queued {
            continuation.resume(returning: newToken)
        }

        return newToken
    }

    // MARK: - Private

    /// Reads timeout values from `AppConfig` on the main actor to avoid actor-isolation warnings.
    private nonisolated static func readTimeouts() -> (TimeInterval, TimeInterval) {
        return MainActor.assumeIsolated { () -> (TimeInterval, TimeInterval) in
            let request = AppConfig.connectTimeout
            let resource = AppConfig.receiveTimeout
            return (request, resource)
        }
    }

    private func performRefresh() async -> String? {
        guard let refreshToken = storage.getRefreshToken() else {
            handleFatalRefreshFailure()
            return nil
        }

        var urlRequest = URLRequest(url: AppConfig.baseURL.appendingPathComponent("auth/refresh"))
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = try? JSONSerialization.data(withJSONObject: ["refreshToken": refreshToken])

        do {
            let (data, response) = try await refreshSession.data(for: urlRequest)

            guard let http = response as? HTTPURLResponse,
                  (200..<300).contains(http.statusCode) else {
                handleFatalRefreshFailure()
                return nil
            }

            guard
                let json        = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                let accessToken = json["accessToken"] as? String
            else {
                handleFatalRefreshFailure()
                return nil
            }

            // Persist the new tokens.
            try? storage.writeAccessToken(accessToken)
            if let newRefresh = json["refreshToken"] as? String {
                try? storage.writeRefreshToken(newRefresh)
            }

            return accessToken

        } catch {
            // Network error — don't wipe tokens, just let the request fail.
            let isNetworkError = (error as? URLError)?.code == .notConnectedToInternet
                              || (error as? URLError)?.code == .timedOut
                              || (error as? URLError)?.code == .networkConnectionLost
            if !isNetworkError {
                handleFatalRefreshFailure()
            }
            return nil
        }
    }

    /// Wipes all stored tokens and fires the global logout signal.
    private func handleFatalRefreshFailure() {
        storage.deleteAll()
        logoutSignal.trigger()
    }
}

