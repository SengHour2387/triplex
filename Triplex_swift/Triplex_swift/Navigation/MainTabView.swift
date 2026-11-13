//
//  MainTabView.swift
//  Triplex_swift
//

import SwiftUI

struct MainTabView: View {
    var body: some View {
        if #available(iOS 26.0, *) {
            tabBar.tabBarMinimizeBehavior(.onScrollDown)
        } else {
            tabBar
        }
    }
    
    private var tabBar: some View {
        TabView {
            Tab("Discover", systemImage: "map") {
                NavigationStack {
                    DiscoverView()
                }
            }

            Tab("Feed", systemImage: "rectangle.stack") {
                NavigationStack {
                    FeedView()
                }
            }

            Tab("Create", systemImage: "plus.circle") {
                NavigationStack {
                    CreateView()
                }
            }

            Tab("Messages", systemImage: "message") {
                NavigationStack {
                    MessagesView()
                }
            }

            Tab("Profile", systemImage: "person.circle") {
                NavigationStack {
                    ProfileView()
                }
            }
        }

    }
}

#Preview {
    MainTabView()
        .environment(AuthViewModel())
}

