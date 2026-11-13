//
//  FeedView.swift
//  Triplex_swift
//

import SwiftUI

struct FeedView: View {
    @State private var viewModel = FeedViewModel()
    
    var body: some View {
        VStack {
            if viewModel.isLoading && viewModel.posts.isEmpty {
                ProgressView()
            } else if viewModel.posts.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "square.stack.3d.up.slash")
                        .font(.system(size: 48))
                        .foregroundColor(.secondary)
                    Text("No posts in your feed yet")
                        .font(.headline)
                    Button("Refresh") {
                        Task {
                            await viewModel.fetchFeed()
                        }
                    }
                }
            } else {
                listView
            }
        }
        .navigationTitle("Feed")
        .navigationBarTitleDisplayMode(.automatic)
        .task {
            if viewModel.posts.isEmpty {
                await viewModel.fetchFeed()
            }
        }
        .refreshable {
            await viewModel.fetchFeed()
        }
    }
    
    private var listView: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                ForEach(viewModel.posts) { post in
                    PostCardView(post: post)
                }
            }
            .padding(.vertical)
        }
        .background(Color(.systemGroupedBackground))
    }
}

#Preview {
    FeedView()
}
