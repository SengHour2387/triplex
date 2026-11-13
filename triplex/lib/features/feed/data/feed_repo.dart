import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/core/api/dio_provider.dart';
import 'package:triplex/core/database/app_database.dart';
import 'package:triplex/core/database/database_provider.dart';
import 'package:triplex/features/auth/domain/user_model.dart';
import 'package:triplex/features/create/domain/stop_item_model.dart';
import 'package:triplex/features/feed/domain/models/post_model.dart';

part 'feed_repo.g.dart';

@riverpod
FeedRepo feedRepo(Ref ref) {
  return FeedRepo(
    ref.watch(dioProvider),
    ref.watch(appDatabaseProvider),
  );
}

class FeedRepo {
  final Dio _dio;
  final AppDatabase _db;

  FeedRepo(this._dio, this._db);

  /// Fetches fresh feed from the network API with fallback to sample posts matching mockup.
  Future<List<PostModel>> fetchFreshFeed() async {
    try {
      final response = await _dio.get('posts/feed');
      final data = response.data['data'] as List;
      final posts = data
          .map((json) => PostModel.fromJson(json as Map<String, dynamic>))
          .toList();
      if (posts.isEmpty) {
        return getMockPosts();
      }
      return posts;
    } catch (_) {
      return getMockPosts();
    }
  }

  /// Returns cached feed posts from the local Drift database.
  Future<List<PostModel>> getCachedFeed() async {
    final cached = await _db.getCachedFeed();
    if (cached.isEmpty) {
      return getMockPosts();
    }
    return cached;
  }

  /// Writes posts to the local Drift cache for offline-first access.
  Future<void> cacheFeed(List<PostModel> posts) async {
    await _db.cacheFeedPosts(posts);
  }

  /// Reposts an existing post with an optional caption.
  Future<PostModel> repostPost(String postId, {String? caption}) async {
    final response = await _dio.post(
      'posts/$postId/repost',
      data: {
        if (caption != null && caption.isNotEmpty) 'caption': caption,
      },
    );
    final data = response.data['data'] as Map<String, dynamic>;
    return PostModel.fromJson(data);
  }

  static List<PostModel> getMockPosts() {
    final now = DateTime.now();
    const sampleImages = [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80',
    ];

    return [
      // Post with 1 picture
      PostModel(
        id: 'post_media_1',
        type: 'media',
        caption: 'Solo adventure sunrise view ✨',
        attachedTripTitle: 'GreenKirirom',
        createdAt: now.subtract(const Duration(minutes: 45)),
        updatedAt: now.subtract(const Duration(minutes: 45)),
        user: UserModel(
          id: 'user_1',
          username: 'doggy_chan23',
          email: 'doggy@example.com',
        ),
        mediaUrls: [sampleImages[0]],
        likeCount: 2450,
        commentCount: 182,
        commentPreview: 'Amazing view!',
        repostCount: 34,
        shareCount: 12,
      ),

      // Post with 2 pictures
      PostModel(
        id: 'post_media_2',
        type: 'media',
        caption: 'Mountain paths & lakeside views ⛰️🌲',
        attachedTripTitle: 'Kirirom Camping',
        createdAt: now.subtract(const Duration(hours: 3)),
        updatedAt: now.subtract(const Duration(hours: 3)),
        user: UserModel(
          id: 'user_3',
          username: 'sophia_travels',
          email: 'sophia@example.com',
        ),
        mediaUrls: [sampleImages[0], sampleImages[1]],
        likeCount: 1890,
        commentCount: 94,
        commentPreview: 'Which camera did you use?',
        repostCount: 18,
        shareCount: 9,
      ),

      // Post with 3 pictures
      PostModel(
        id: 'post_media_3',
        type: 'media',
        caption: '3 highlights from today’s trail hike!',
        attachedTripTitle: 'Pine Forest Trail',
        createdAt: now.subtract(const Duration(hours: 6)),
        updatedAt: now.subtract(const Duration(hours: 6)),
        user: UserModel(
          id: 'user_4',
          username: 'alex_explorer',
          email: 'alex@example.com',
        ),
        mediaUrls: [sampleImages[0], sampleImages[1], sampleImages[2]],
        likeCount: 3120,
        commentCount: 205,
        commentPreview: 'Looks super peaceful',
        repostCount: 45,
        shareCount: 22,
      ),

      // Post with 4 pictures
      PostModel(
        id: 'post_media_4',
        type: 'media',
        caption: 'Full day recap: 4 spots checked off! 📸',
        attachedTripTitle: 'Kirirom Highlights',
        createdAt: now.subtract(const Duration(hours: 12)),
        updatedAt: now.subtract(const Duration(hours: 12)),
        user: UserModel(
          id: 'user_5',
          username: 'champa_adventures',
          email: 'champa@example.com',
        ),
        mediaUrls: [
          sampleImages[0],
          sampleImages[1],
          sampleImages[2],
          sampleImages[3],
        ],
        likeCount: 4200,
        commentCount: 310,
        commentPreview: 'Save this route!',
        repostCount: 88,
        shareCount: 41,
      ),

      // Post with 5+ (6) pictures
      PostModel(
        id: 'post_media_5',
        type: 'media',
        caption: 'Weekend photo dump with the crew ⛺️🔥',
        attachedTripTitle: 'Camping Weekend',
        createdAt: now.subtract(const Duration(days: 1)),
        updatedAt: now.subtract(const Duration(days: 1)),
        user: UserModel(
          id: 'user_6',
          username: 'cambodia_hikers',
          email: 'hikers@example.com',
        ),
        mediaUrls: sampleImages,
        likeCount: 5600,
        commentCount: 412,
        commentPreview: 'Loved the bonfire photos!',
        repostCount: 110,
        shareCount: 65,
      ),

      // Trip Plan Post
      PostModel(
        id: 'post_trip_1',
        type: 'trip_plan',
        createdAt: now.subtract(const Duration(days: 3)),
        updatedAt: now.subtract(const Duration(days: 3)),
        user: UserModel(
          id: 'user_2',
          username: 'mr_vannda',
          email: 'vannda@example.com',
        ),
        tripPlan: FeedTripPlanModel(
          id: 'trip_1',
          title: 'GreenKirirom',
          totalCost: 7.0,
          totalCostCurrency: r'$',
          costSuffix: '+',
          start: StopItemModel(
            id: 'stop_1',
            title: 'Wat Phnom',
            role: StopType.start,
          ),
          waypoints: [
            StopItemModel(
              id: 'stop_2',
              title: 'Market',
              description: r'Buy some food at the market: 2.5$',
              cost: 2.5,
            ),
            StopItemModel(
              id: 'stop_3',
              title: 'Kirirom',
              description: r'Forest Cafe: Matcha Latte: 3.5$',
              cost: 3.5,
            ),
          ],
          end: StopItemModel(
            id: 'stop_4',
            title: 'Top',
            role: StopType.end,
          ),
        ),
        likeCount: 1000,
        commentCount: 50,
        commentPreview: "cool trip i'll start...",
        savedCount: 8,
        repostCount: 20,
        shareCount: 5,
      ),

      // Sample Repost Post with Caption
      PostModel(
        id: 'post_repost_1',
        type: 'repost',
        caption:
            'Planning to do this exact trail with friends next month! Who wants to join? 🏕️✨',
        createdAt: now.subtract(const Duration(hours: 1)),
        updatedAt: now.subtract(const Duration(hours: 1)),
        user: UserModel(
          id: 'user_reposter',
          username: 'sarah_hikes',
          name: 'Sarah Connor',
          email: 'sarah@example.com',
        ),
        repostId: 'post_trip_1',
        repostedPost: PostModel(
          id: 'post_trip_1',
          type: 'trip_plan',
          caption: 'My favorite weekend getaway route!',
          createdAt: now.subtract(const Duration(days: 3)),
          updatedAt: now.subtract(const Duration(days: 3)),
          user: UserModel(
            id: 'user_2',
            username: 'mr_vannda',
            name: 'Vannda S.',
            email: 'vannda@example.com',
          ),
          tripPlan: FeedTripPlanModel(
            id: 'trip_1',
            title: 'GreenKirirom',
            totalCost: 7.0,
            totalCostCurrency: r'$',
            costSuffix: '+',
            start: StopItemModel(
              id: 'stop_1',
              title: 'Wat Phnom',
              role: StopType.start,
            ),
            waypoints: [
              StopItemModel(
                id: 'stop_2',
                title: 'Market',
                description: r'Buy some food at the market: 2.5$',
                cost: 2.5,
              ),
              StopItemModel(
                id: 'stop_3',
                title: 'Kirirom',
                description: r'Forest Cafe: Matcha Latte: 3.5$',
                cost: 3.5,
              ),
            ],
            end: StopItemModel(
              id: 'stop_4',
              title: 'Top',
              role: StopType.end,
            ),
          ),
          likeCount: 1000,
          commentCount: 50,
          repostCount: 20,
        ),
        likeCount: 142,
        commentCount: 16,
        repostCount: 5,
        shareCount: 8,
      ),
    ];
  }
}
