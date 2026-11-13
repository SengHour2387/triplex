import 'package:triplex/features/auth/domain/user_model.dart';

class CommentModel {
  final String id;
  final String postId;
  final String? parentCommentId;
  final String content;
  final bool isDeleted;
  final int likesCount;
  final int repliesCount;
  final bool isReacted;
  final String? myReaction;
  final DateTime createdAt;
  final DateTime updatedAt;
  final UserModel user;

  // In-memory UI tree state
  final List<CommentModel> replies;
  final bool isRepliesLoading;
  final bool isRepliesExpanded;

  CommentModel({
    required this.id,
    required this.postId,
    this.parentCommentId,
    required this.content,
    this.isDeleted = false,
    this.likesCount = 0,
    this.repliesCount = 0,
    this.isReacted = false,
    this.myReaction,
    required this.createdAt,
    required this.updatedAt,
    required this.user,
    this.replies = const [],
    this.isRepliesLoading = false,
    this.isRepliesExpanded = false,
  });

  bool get isReply => parentCommentId != null && parentCommentId!.isNotEmpty;

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    // Determine user object
    UserModel userObj;
    if (json['user'] is Map<String, dynamic>) {
      userObj = UserModel.fromJson(json['user'] as Map<String, dynamic>);
    } else {
      userObj = UserModel(
        id: json['user_id']?.toString() ?? '',
        username: json['username']?.toString() ?? 'user',
        email: json['email']?.toString() ?? '',
        avatarUrl: json['avatar_url'] as String?,
      );
    }

    final isDeleted = json['is_deleted'] as bool? ??
        (json['deleted_at'] != null &&
            json['deleted_at'].toString().isNotEmpty);

    return CommentModel(
      id: json['id'].toString(),
      postId: json['post_id']?.toString() ?? '',
      parentCommentId: json['parent_comment_id']?.toString(),
      content: isDeleted
          ? 'This comment was deleted.'
          : (json['content'] as String? ?? ''),
      isDeleted: isDeleted,
      likesCount:
          json['likes_count'] as int? ?? json['like_count'] as int? ?? 0,
      repliesCount:
          json['replies_count'] as int? ?? json['reply_count'] as int? ?? 0,
      isReacted:
          json['is_reacted'] as bool? ?? json['is_liked'] as bool? ?? false,
      myReaction: json['my_reaction'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : DateTime.now(),
      user: userObj,
      replies: json['replies'] != null
          ? (json['replies'] as List)
              .map((e) => CommentModel.fromJson(e as Map<String, dynamic>))
              .toList()
          : const [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'post_id': postId,
      'parent_comment_id': parentCommentId,
      'content': content,
      'is_deleted': isDeleted,
      'likes_count': likesCount,
      'replies_count': repliesCount,
      'is_reacted': isReacted,
      'my_reaction': myReaction,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'user': user.toJson(),
    };
  }

  CommentModel copyWith({
    String? id,
    String? postId,
    String? parentCommentId,
    String? content,
    bool? isDeleted,
    int? likesCount,
    int? repliesCount,
    bool? isReacted,
    String? myReaction,
    DateTime? createdAt,
    DateTime? updatedAt,
    UserModel? user,
    List<CommentModel>? replies,
    bool? isRepliesLoading,
    bool? isRepliesExpanded,
  }) {
    return CommentModel(
      id: id ?? this.id,
      postId: postId ?? this.postId,
      parentCommentId: parentCommentId ?? this.parentCommentId,
      content: content ?? this.content,
      isDeleted: isDeleted ?? this.isDeleted,
      likesCount: likesCount ?? this.likesCount,
      repliesCount: repliesCount ?? this.repliesCount,
      isReacted: isReacted ?? this.isReacted,
      myReaction: myReaction ?? this.myReaction,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      user: user ?? this.user,
      replies: replies ?? this.replies,
      isRepliesLoading: isRepliesLoading ?? this.isRepliesLoading,
      isRepliesExpanded: isRepliesExpanded ?? this.isRepliesExpanded,
    );
  }
}
