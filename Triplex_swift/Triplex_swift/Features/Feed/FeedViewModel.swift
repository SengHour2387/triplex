import SwiftUI
import Combine

@Observable
@MainActor
class FeedViewModel {
    var posts: [PostModel] = []
    var isLoading: Bool = false
    var errorMessage: String? = nil
    
    func fetchFeed() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil
        
        do {
            let response: FeedResponse = try await APIClient.shared.request("posts/feed")
            if response.data.isEmpty {
                self.posts = FeedViewModel.getMockPosts()
            } else {
                self.posts = response.data
            }
        } catch {
            print("Feed network error: \(error)")
            self.posts = FeedViewModel.getMockPosts()
        }
        
        isLoading = false
    }
    
    // Mock Data based on Flutter implementation
    static func getMockPosts() -> [PostModel] {
        let now = Date()
        let sampleImages = [
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80"
        ]
        
        let user1 = UserModel(id: "user_1", username: "doggy_chan23", email: "doggy@example.com", name: nil, phone: nil, avatarUrl: nil)
        let user2 = UserModel(id: "user_2", username: "mr_vannda", email: "vannda@example.com", name: "Vannda S.", phone: nil, avatarUrl: nil)
        let userReposter = UserModel(id: "user_reposter", username: "sarah_hikes", email: "sarah@example.com", name: "Sarah Connor", phone: nil, avatarUrl: nil)
        
        let tripPlan = FeedTripPlanModel(
            id: "trip_1",
            title: "GreenKirirom",
            caption: nil,
            totalCost: 7.0,
            totalCostCurrency: "$",
            costSuffix: "+",
            start: StopItemModel(id: "stop_1", title: "Wat Phnom", role: .start, location: nil, placeId: nil, latitude: nil, longitude: nil, description: nil, cost: nil, currency: nil, sortOrder: 0, createdAt: now, updatedAt: now),
            waypoints: [
                StopItemModel(id: "stop_2", title: "Market", role: .waypoint, location: nil, placeId: nil, latitude: nil, longitude: nil, description: "Buy some food at the market: 2.5$", cost: 2.5, currency: nil, sortOrder: 1, createdAt: now, updatedAt: now)
            ],
            end: StopItemModel(id: "stop_4", title: "Top", role: .end, location: nil, placeId: nil, latitude: nil, longitude: nil, description: nil, cost: nil, currency: nil, sortOrder: 2, createdAt: now, updatedAt: now)
        )
        
        let tripPost = PostModel(
            id: "post_trip_1",
            type: "trip_plan",
            caption: "My favorite weekend getaway route!",
            createdAt: now.addingTimeInterval(-86400 * 3),
            updatedAt: now.addingTimeInterval(-86400 * 3),
            user: user2,
            tripPlan: tripPlan,
            mediaUrls: nil,
            attachedTripTitle: nil,
            attachedTripId: nil,
            repostId: nil,
            repostedPost: nil,
            likeCount: 1000,
            commentCount: 50,
            repostCount: 20,
            shareCount: 5,
            savedCount: 8,
            isLiked: false,
            myReaction: nil,
            isSaved: false,
            isReposted: false,
            commentPreview: "cool trip i'll start..."
        )
        
        return [
            PostModel(
                id: "post_media_1",
                type: "media",
                caption: "Solo adventure sunrise view ✨",
                createdAt: now.addingTimeInterval(-2700),
                updatedAt: now.addingTimeInterval(-2700),
                user: user1,
                tripPlan: nil,
                mediaUrls: [sampleImages[0]],
                attachedTripTitle: "GreenKirirom",
                attachedTripId: nil,
                repostId: nil,
                repostedPost: nil,
                likeCount: 2450,
                commentCount: 182,
                repostCount: 34,
                shareCount: 12,
                savedCount: nil,
                isLiked: false,
                myReaction: nil,
                isSaved: false,
                isReposted: false,
                commentPreview: "Amazing view!"
            ),
            PostModel(
                id: "post_media_3",
                type: "media",
                caption: "3 highlights from today’s trail hike!",
                createdAt: now.addingTimeInterval(-21600),
                updatedAt: now.addingTimeInterval(-21600),
                user: UserModel(id: "user_4", username: "alex_explorer", email: "alex@example.com", name: nil, phone: nil, avatarUrl: nil),
                tripPlan: nil,
                mediaUrls: [sampleImages[0], sampleImages[1], sampleImages[2]],
                attachedTripTitle: "Pine Forest Trail",
                attachedTripId: nil,
                repostId: nil,
                repostedPost: nil,
                likeCount: 3120,
                commentCount: 205,
                repostCount: 45,
                shareCount: 22,
                savedCount: nil,
                isLiked: false,
                myReaction: nil,
                isSaved: false,
                isReposted: false,
                commentPreview: "Looks super peaceful"
            ),
            tripPost,
            PostModel(
                id: "post_repost_1",
                type: "repost",
                caption: "Planning to do this exact trail with friends next month! Who wants to join? 🏕️✨",
                createdAt: now.addingTimeInterval(-3600),
                updatedAt: now.addingTimeInterval(-3600),
                user: userReposter,
                tripPlan: nil,
                mediaUrls: nil,
                attachedTripTitle: nil,
                attachedTripId: nil,
                repostId: "post_trip_1",
                repostedPost: tripPost,
                likeCount: 142,
                commentCount: 16,
                repostCount: 5,
                shareCount: 8,
                savedCount: nil,
                isLiked: false,
                myReaction: nil,
                isSaved: false,
                isReposted: false,
                commentPreview: nil
            )
        ]
    }
}
