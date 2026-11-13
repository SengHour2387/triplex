//
//  Triplex_swiftApp.swift
//  Triplex_swift
//

import SwiftUI

@main
struct Triplex_swiftApp: App {
    @State private var auth = AuthViewModel()
    private let apiClient   = APIClient.shared

    var body: some Scene {
        WindowGroup {
            if auth.isInitializing {
                ProgressView()
                    .controlSize(.large)
                    .environment(auth)
                    .environment(apiClient)
            } else if auth.isLoggedIn {
                MainTabView()
                    .environment(auth)
                    .environment(apiClient)
            } else {
                AuthView()
                    .environment(auth)
                    .environment(apiClient)
            }
        }
    }
}
