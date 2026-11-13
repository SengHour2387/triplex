//
//  DiscoverView.swift
//  Triplex_swift
//

import SwiftUI

struct DiscoverView: View {
    var body: some View {
        ContentUnavailableView(
            "Discover",
            systemImage: "map",
            description: Text("Select a destination on the map to begin your journey.")
        )
        .navigationTitle("Discover")
    }
}

#Preview {
    NavigationStack {
        DiscoverView()
    }
}
