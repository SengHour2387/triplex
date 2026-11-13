import 'package:triplex/features/auth/domain/user_model.dart';
import 'package:triplex/features/create/domain/stop_item_model.dart';

class FeedTripPlanModel {
  final String id;
  final String title;
  final String? caption;
  final double? totalCost;
  final String? totalCostCurrency;
  final String? costSuffix;
  final StopItemModel? start;
  final List<StopItemModel> waypoints;
  final StopItemModel? end;

  FeedTripPlanModel({
    required this.id,
    required this.title,
    this.caption,
    this.totalCost,
    this.totalCostCurrency,
    this.costSuffix,
    this.start,
    this.waypoints = const [],
    this.end,
  });

  factory FeedTripPlanModel.fromJson(Map<String, dynamic> json) {
    return FeedTripPlanModel(
      id: json['id'].toString(),
      title: json['title'] as String,
      caption: json['caption'] as String?,
      totalCost: json['total_cost'] != null
          ? double.tryParse(json['total_cost'].toString())
          : null,
      totalCostCurrency: json['total_cost_currency'] as String?,
      costSuffix: json['cost_suffix'] as String?,
      start: json['start'] != null
          ? StopItemModel.fromJson(json['start'] as Map<String, dynamic>)
          : null,
      waypoints: json['waypoints'] != null
          ? (json['waypoints'] as List)
              .map((e) => StopItemModel.fromJson(e as Map<String, dynamic>))
              .toList()
          : const [],
      end: json['end'] != null
          ? StopItemModel.fromJson(json['end'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'caption': caption,
      'total_cost': totalCost,
      'total_cost_currency': totalCostCurrency,
      'cost_suffix': costSuffix,
      'start': start?.toJson(),
      'waypoints': waypoints.map((stop) => stop.toJson()).toList(),
      'end': end?.toJson(),
    };
  }
}

class PostModel {
  final String id;
  final String type; // 'media', 'trip_plan', 'repost', etc.
  final String? caption;
  final DateTime createdAt;
  final DateTime updatedAt;
  final UserModel user;
  final FeedTripPlanModel? tripPlan;
  final List<String>? mediaUrls;
  final String? attachedTripTitle;
  final String? attachedTripId;
  final String? repostId;
  final PostModel? repostedPost;
  final int likeCount;
  final int commentCount;
  final int repostCount;
  final int shareCount;
  final int? savedCount;
  final bool isLiked;
  final String? myReaction;
  final bool isSaved;
  final bool isReposted;
  final String? commentPreview;

  PostModel({
    required this.id,
    required this.type,
    this.caption,
    required this.createdAt,
    required this.updatedAt,
    required this.user,
    this.tripPlan,
    this.mediaUrls,
    this.attachedTripTitle,
    this.attachedTripId,
    this.repostId,
    this.repostedPost,
    this.likeCount = 0,
    this.commentCount = 0,
    this.repostCount = 0,
    this.shareCount = 0,
    this.savedCount,
    this.isLiked = false,
    this.myReaction,
    this.isSaved = false,
    this.isReposted = false,
    this.commentPreview,
  });

  factory PostModel.fromJson(Map<String, dynamic> json) {
    final myReaction = json['my_reaction'] as String? ??
        (json['my_reactions'] != null &&
                (json['my_reactions'] as List).isNotEmpty
            ? (json['my_reactions'] as List).first.toString()
            : null);
    final isLiked = json['is_liked'] as bool? ??
        json['is_reacted'] as bool? ??
        (myReaction != null);

    final repostData = json['reposted_post'] ?? json['repost'];

    return PostModel(
      id: json['id'].toString(),
      type: json['type'] as String? ?? 'media',
      caption: json['caption'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : DateTime.now(),
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
      tripPlan: json['tripPlan'] != null
          ? FeedTripPlanModel.fromJson(json['tripPlan'] as Map<String, dynamic>)
          : null,
      mediaUrls: json['media_urls'] != null
          ? List<String>.from(json['media_urls'] as List)
          : (json['media'] != null
              ? (json['media'] as List)
                  .map((m) => (m is Map ? m['cloud_url'] : m).toString())
                  .toList()
              : null),
      attachedTripTitle: json['attached_trip_title'] as String?,
      attachedTripId: json['attached_trip_id'] as String?,
      repostId: json['repost_id'] as String?,
      repostedPost: repostData != null
          ? PostModel.fromJson(repostData as Map<String, dynamic>)
          : null,
      likeCount: json['likes_count'] as int? ?? json['like_count'] as int? ?? 0,
      commentCount:
          json['comments_count'] as int? ?? json['comment_count'] as int? ?? 0,
      repostCount:
          json['reposts_count'] as int? ?? json['repost_count'] as int? ?? 0,
      shareCount: json['share_count'] as int? ?? 0,
      savedCount: json['saved_count'] as int?,
      isLiked: isLiked,
      myReaction: myReaction,
      isSaved: json['is_saved'] as bool? ?? false,
      isReposted: json['is_reposted'] as bool? ?? false,
      commentPreview: json['comment_preview'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'caption': caption,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'user': user.toJson(),
      'tripPlan': tripPlan?.toJson(),
      'media_urls': mediaUrls,
      'attached_trip_title': attachedTripTitle,
      'attached_trip_id': attachedTripId,
      'repost_id': repostId,
      'reposted_post': repostedPost?.toJson(),
      'like_count': likeCount,
      'likes_count': likeCount,
      'comment_count': commentCount,
      'comments_count': commentCount,
      'repost_count': repostCount,
      'reposts_count': repostCount,
      'share_count': shareCount,
      'saved_count': savedCount,
      'is_liked': isLiked,
      'my_reaction': myReaction,
      'is_saved': isSaved,
      'is_reposted': isReposted,
      'comment_preview': commentPreview,
    };
  }

  PostModel copyWith({
    String? id,
    String? type,
    String? caption,
    DateTime? createdAt,
    DateTime? updatedAt,
    UserModel? user,
    FeedTripPlanModel? tripPlan,
    List<String>? mediaUrls,
    String? attachedTripTitle,
    String? attachedTripId,
    String? repostId,
    PostModel? repostedPost,
    int? likeCount,
    int? commentCount,
    int? repostCount,
    int? shareCount,
    int? savedCount,
    bool? isLiked,
    String? myReaction,
    bool clearMyReaction = false,
    bool? isSaved,
    bool? isReposted,
    String? commentPreview,
  }) {
    return PostModel(
      id: id ?? this.id,
      type: type ?? this.type,
      caption: caption ?? this.caption,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      user: user ?? this.user,
      tripPlan: tripPlan ?? this.tripPlan,
      mediaUrls: mediaUrls ?? this.mediaUrls,
      attachedTripTitle: attachedTripTitle ?? this.attachedTripTitle,
      attachedTripId: attachedTripId ?? this.attachedTripId,
      repostId: repostId ?? this.repostId,
      repostedPost: repostedPost ?? this.repostedPost,
      likeCount: likeCount ?? this.likeCount,
      commentCount: commentCount ?? this.commentCount,
      repostCount: repostCount ?? this.repostCount,
      shareCount: shareCount ?? this.shareCount,
      savedCount: savedCount ?? this.savedCount,
      isLiked: isLiked ?? this.isLiked,
      myReaction: clearMyReaction
          ? null
          : (myReaction ?? (isLiked == false ? null : this.myReaction)),
      isSaved: isSaved ?? this.isSaved,
      isReposted: isReposted ?? this.isReposted,
      commentPreview: commentPreview ?? this.commentPreview,
    );
  }
}
