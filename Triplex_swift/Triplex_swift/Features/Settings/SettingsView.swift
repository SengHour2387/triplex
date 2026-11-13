//
//  SettingsView.swift
//  Triplex_swift
//

import SwiftUI

struct SettingsView: View {
    @Environment(AuthViewModel.self) private var auth

    var body: some View {
        Form {
            Section("Account") {
                NavigationLink("Account Center") {
                    AccountCenterView()
                }
            }

            Section("Appearance") {
                Label("Theme", systemImage: "paintpalette")
                Label("Notifications", systemImage: "bell")
            }

            Section("About") {
                LabeledContent("Version", value: "1.0.0")
                Link("Privacy Policy", destination: URL(string: "https://example.com/privacy")!)
                Link("Terms of Service", destination: URL(string: "https://example.com/terms")!)
            }

            Section {
                Button("Log Out", role: .destructive) {
                    auth.logout()
                }
            }
        }
        .navigationTitle("Settings")
    }
}

#Preview {
    NavigationStack {
        SettingsView()
    }
    .environment(AuthViewModel())
}
