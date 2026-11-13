//
//  AccountCenterView.swift
//  Triplex_swift
//

import SwiftUI

struct AccountCenterView: View {
    @Environment(AuthViewModel.self) private var auth
    
    var body: some View {
        Form {
            Section("Account") {
                LabeledContent("Username", value: "@\(auth.currentUser?.username ?? "username")")
                LabeledContent("Email", value: auth.currentUser?.email ?? "user@example.com")
                LabeledContent("Member since", value: "2024")
            }

            Section("Linked Accounts") {
                Label("Google", systemImage: "globe")
                Label("Apple", systemImage: "apple.logo")
            }

            Section {
                Button("Delete Account", role: .destructive) { }
            }
        }
        .navigationTitle("Account Center")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack {
        AccountCenterView()
    }
    .environment(AuthViewModel())
}
