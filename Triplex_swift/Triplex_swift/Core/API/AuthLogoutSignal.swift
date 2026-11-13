//
//  AuthLogoutSignal.swift
//  Triplex_swift
//
//  Equivalent of: triplex/lib/core/api/auth_logout_signal.dart
//
//  The Flutter version uses a Riverpod counter that increments to signal logout.
//  Here we use a Combine PassthroughSubject — any observer (AuthViewModel)
//  subscribes and calls logout when the signal fires.
//

import Combine

/// Fires once whenever the API layer detects a 401 it can't refresh
/// (e.g. expired refresh token, server revocation).
///
/// Usage:
///   AuthLogoutSignal.shared.publisher
///       .sink { [weak self] in self?.handleForceLogout() }
///       .store(in: &cancellables)
final class AuthLogoutSignal {
    static let shared = AuthLogoutSignal()
    private init() {}

    /// Subscribe to receive force-logout events.
    let publisher = PassthroughSubject<Void, Never>()

    /// Called by `AuthInterceptor` when a refresh fails fatally.
    func trigger() {
        publisher.send()
    }
}
