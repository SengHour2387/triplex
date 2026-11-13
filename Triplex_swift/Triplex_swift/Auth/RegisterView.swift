//
//  RegisterView.swift
//  Triplex_swift
//

import SwiftUI

struct RegisterView: View {
    @Environment(AuthViewModel.self) private var auth

    @State private var username = ""
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        Form {
            Section {
                TextField("Username", text: $username)
                    .textContentType(.username)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)

                TextField("Email", text: $email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)

                SecureField("Password", text: $password)
                    .textContentType(.newPassword)
            }

            if let errorMessage = auth.errorMessage {
                Section {
                    Text(errorMessage)
                        .foregroundStyle(.red)
                        .font(.callout)
                }
            }

            Section {
                Button(action: {
                    Task {
                        await auth.register(email: email, username: username, pass: password)
                    }
                }) {
                    if auth.isAuthenticating {
                        ProgressView()
                            .frame(maxWidth: .infinity, alignment: .center)
                    } else {
                        Text("Create Account")
                            .frame(maxWidth: .infinity, alignment: .center)
                            .fontWeight(.semibold)
                    }
                }
                .disabled(auth.isAuthenticating || username.isEmpty || email.isEmpty || password.isEmpty)
            }
        }
        .navigationTitle("Create Account")
        .navigationBarTitleDisplayMode(.large)
    }
}

#Preview {
    NavigationStack {
        RegisterView()
    }
    .environment(AuthViewModel())
}
