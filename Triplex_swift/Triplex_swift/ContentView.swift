//
//  ContentView.swift
//  Triplex_swift
//
//  NOTE: This file is no longer the root view.
//  Routing is handled by Triplex_swiftApp.swift → MainTabView / AuthView.
//  Kept as a reference stub — safe to delete in a future cleanup step.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        MainTabView()
    }
}

#Preview {
    ContentView()
        .environment(AuthViewModel())
}
