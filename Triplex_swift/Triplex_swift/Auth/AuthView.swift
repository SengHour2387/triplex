//
//  AuthView.swift
//  Triplex_swift
//

import SwiftUI

struct AuthView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 32) {
                Spacer()

                // Logo / wordmark
                VStack(spacing: 12) {
                    Image(systemName: "hexagon.fill")
                        .resizable()
                        .frame(width: 72, height: 72)
                        .foregroundStyle(.primary)

                    Text("Triplex")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                }

                Spacer()

                VStack(spacing: 12) {
                    NavigationLink(destination: LoginView()) {
                        Text("Log In")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)

                    NavigationLink(destination: RegisterView()) {
                        Text("Create Account")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.large)
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 48)
            }
            .navigationBarHidden(true)
        }
    }
}

#Preview {
    AuthView()
        .environment(AuthViewModel())
}
