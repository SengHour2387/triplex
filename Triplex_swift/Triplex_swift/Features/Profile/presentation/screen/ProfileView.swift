//
//  ProfileView.swift
//  Triplex_swift
//

import SwiftUI

struct ProfileView: View {
    @Environment(AuthViewModel.self) private var auth

    var body: some View {
        List {
            // Avatar + name header
            Section {
                HStack(spacing: 16) {
                    if let avatarUrl = auth.currentUser?.avatarUrl, let url = URL(string: avatarUrl) {
                        AsyncImage(url: url) { phase in
                            if let image = phase.image {
                                image.resizable().scaledToFill()
                            } else {
                                Image(systemName: "person.circle.fill").resizable()
                            }
                        }
                        .frame(width: 72, height: 72)
                        .clipShape(Circle())
                    } else {
                        Image(systemName: "person.circle.fill")
                            .resizable()
                            .frame(width: 72, height: 72)
                            .foregroundStyle(.secondary)
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text(auth.currentUser?.name ?? "No Name")
                            .font(.title3)
                            .fontWeight(.semibold)
                        Text("@\(auth.currentUser?.username ?? "username")")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 8)
            }

            // Stats row
            Section {
                HStack {
                    Spacer()
                    statItem(value: "0", label: "Posts")
                    Spacer()
                    Divider()
                    Spacer()
                    statItem(value: "0", label: "Followers")
                    Spacer()
                    Divider()
                    Spacer()
                    statItem(value: "0", label: "Following")
                    Spacer()
                }
                .frame(maxWidth: .infinity)
            }

            // Quick links
            Section {
                NavigationLink(destination: DraftsView()) {
                    Label("Drafts", systemImage: "doc.text")
                }
                NavigationLink(destination: SettingsView()) {
                    Label("Settings", systemImage: "gearshape")
                }
            }
        }
        .navigationTitle("Profile")
        .navigationBarTitleDisplayMode(.automatic)
    }

    @ViewBuilder
    private func statItem(value: String, label: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.headline)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }
}

#Preview {
    NavigationStack {
        ProfileView()
    }
    .environment(AuthViewModel())
}
