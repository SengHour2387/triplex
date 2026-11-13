//
//  DraftsView.swift
//  Triplex_swift
//

import SwiftUI

struct DraftsView: View {
    var body: some View {
        ContentUnavailableView(
            "No Drafts",
            systemImage: "doc.text",
            description: Text("Posts you save as drafts will appear here.")
        )
        .navigationTitle("Drafts")
    }
}

#Preview {
    NavigationStack {
        DraftsView()
    }
}
