import SwiftUI

struct PostCardView: View {
    let post: PostModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header: User Info
            HStack {
                Circle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 40, height: 40)
                    .overlay(
                        Text(post.user.username.prefix(1).uppercased())
                            .foregroundColor(.white)
                    )
                
                VStack(alignment: .leading) {
                    Text(post.user.name ?? post.user.username)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    
                    if let date = post.createdAt {
                        Text(date, style: .relative)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                Spacer()
                
                Button(action: {}) {
                    Image(systemName: "ellipsis")
                        .foregroundColor(.primary)
                }
            }
            
            // Caption
            if let caption = post.caption, !caption.isEmpty {
                Text(caption)
                    .font(.body)
            }
            
            // Content based on post type
            if post.type == "media", let urls = post.mediaUrls, !urls.isEmpty {
                MediaGridView(urls: urls)
            } else if post.type == "trip_plan", let tripPlan = post.tripPlan {
                TripPlanCardView(tripPlan: tripPlan)
            } else if post.type == "repost", let repostedPost = post.repostedPost {
                // Embedded post
                VStack(alignment: .leading, spacing: 8) {
                    Text("Reposted from \(repostedPost.user.username)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    if let urls = repostedPost.mediaUrls, !urls.isEmpty {
                        MediaGridView(urls: urls)
                    } else if let tripPlan = repostedPost.tripPlan {
                        TripPlanCardView(tripPlan: tripPlan)
                    }
                }
                .padding(.leading, 12)
                .overlay(
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(width: 4)
                        .padding(.leading, 0),
                    alignment: .leading
                )
            }
            
            // Actions
            HStack(spacing: 24) {
                ActionButton(icon: post.isLiked == true ? "heart.fill" : "heart", count: post.likeCount ?? 0, color: post.isLiked == true ? .red : .primary)
                ActionButton(icon: "message", count: post.commentCount ?? 0, color: .primary)
                ActionButton(icon: "arrow.2.squarepath", count: post.repostCount ?? 0, color: .primary)
                Spacer()
                ActionButton(icon: "paperplane", count: post.shareCount ?? 0, color: .primary)
            }
            .padding(.top, 4)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}

struct ActionButton: View {
    let icon: String
    let count: Int
    let color: Color
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .foregroundColor(color)
            if count > 0 {
                Text("\(count)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
    }
}
