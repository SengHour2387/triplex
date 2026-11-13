//
//  MessagesView.swift
//  Triplex_swift
//

import SwiftUI

struct MessagesView: View {
    var body: some View {
        ContentUnavailableView(
            "Messages",
            systemImage: "message",
            description: Text("Your conversations will appear here.")
        )
        .navigationTitle("Messages")
    }
}

#Preview {
    NavigationStack {
        MessagesView()
    }
}
