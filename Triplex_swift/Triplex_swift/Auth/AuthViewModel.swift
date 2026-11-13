//
//  AuthViewModel.swift
//  Triplex_swift
//

import SwiftUI
import Combine

/// Holds authentication state and reacts to forced logouts from the network layer.
@Observable
@MainActor
class AuthViewModel {
    var currentUser: UserModel?
    var isInitializing: Bool = true
    var isAuthenticating: Bool = false
    var errorMessage: String?
    
    var isLoggedIn: Bool {
        currentUser != nil
    }

    private var cancellables = Set<AnyCancellable>()

    init() {
        // Subscribe to force-logout signals from AuthInterceptor
        AuthLogoutSignal.shared.publisher
            .receive(on: DispatchQueue.main)
            .sink { [weak self] in
                self?.logout()
            }
            .store(in: &cancellables)
            
        Task {
            await checkAuth()
        }
    }

    func checkAuth() async {
        let storage = APIClient.shared.storage
        guard let token = storage.getAccessToken(), !token.isEmpty else {
            isInitializing = false
            return
        }
        
        do {
            // First try to fetch the profile.
            // If the token is expired, AuthInterceptor will automatically try to refresh it once.
            let response: UserResponse = try await APIClient.shared.request("profile/me")
            currentUser = response.user
            isInitializing = false
        } catch {
            // If it still fails, we might have a totally invalid session. Try one hard refresh, or logout.
            guard let refreshToken = storage.getRefreshToken(), !refreshToken.isEmpty else {
                logout()
                isInitializing = false
                return
            }
            
            do {
                let response: AuthResponse = try await APIClient.shared.request(
                    "auth/refresh",
                    method: "POST",
                    body: ["refreshToken": refreshToken]
                )
                
                try? storage.writeAccessToken(response.accessToken)
                if let newRefresh = response.refreshToken {
                    try? storage.writeRefreshToken(newRefresh)
                }
                
                currentUser = response.user
                isInitializing = false
            } catch {
                logout()
                isInitializing = false
            }
        }
    }

    func login(emailOrUsername: String, pass: String) async {
        isAuthenticating = true
        errorMessage = nil
        
        do {
            let isEmail = emailOrUsername.contains("@")
            let endpoint = isEmail ? "auth/login" : "auth/login-username"
            let field = isEmail ? "email" : "username"
            
            let response: AuthResponse = try await APIClient.shared.request(
                endpoint,
                method: "POST",
                body: [field: emailOrUsername, "password": pass]
            )
            
            try? APIClient.shared.storage.writeAccessToken(response.accessToken)
            if let refresh = response.refreshToken {
                try? APIClient.shared.storage.writeRefreshToken(refresh)
            }
            
            currentUser = response.user
            isAuthenticating = false
        } catch {
            errorMessage = error.localizedDescription
            isAuthenticating = false
        }
    }
    
    func register(email: String, username: String, pass: String) async {
        isAuthenticating = true
        errorMessage = nil
        
        do {
            let response: AuthResponse = try await APIClient.shared.request(
                "auth/register",
                method: "POST",
                body: ["email": email, "username": username, "password": pass]
            )
            
            try? APIClient.shared.storage.writeAccessToken(response.accessToken)
            if let refresh = response.refreshToken {
                try? APIClient.shared.storage.writeRefreshToken(refresh)
            }
            
            currentUser = response.user
            isAuthenticating = false
        } catch {
            errorMessage = error.localizedDescription
            isAuthenticating = false
        }
    }

    func logout() {
        APIClient.shared.storage.deleteAll()
        currentUser = nil
        isAuthenticating = false
    }
}
