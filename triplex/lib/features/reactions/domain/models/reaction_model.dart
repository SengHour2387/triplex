import 'package:flutter/material.dart';

class ReactionInfo {
  final String type;
  final String emoji;
  final String label;
  final Color color;

  const ReactionInfo({
    required this.type,
    required this.emoji,
    required this.label,
    required this.color,
  });
}

abstract final class ReactionTypes {
  ReactionTypes._();
  static const String like = 'like';
  static const String love = 'love';
  static const String haha = 'haha';
  static const String wow = 'wow';
  static const String cry = 'cry';
  static const String sad = 'sad';
  static const String angry = 'angry';

  /// Primary list of selectable reactions shown in the picker
  static const List<ReactionInfo> activeReactions = [
    ReactionInfo(
      type: like,
      emoji: '👍',
      label: 'Like',
      color: Color(0xFF1877F2),
    ),
    ReactionInfo(
      type: love,
      emoji: '❤️',
      label: 'Love',
      color: Color(0xFFFA3E3E),
    ),
    ReactionInfo(
      type: haha,
      emoji: '😂',
      label: 'Haha',
      color: Color(0xFFF7B125),
    ),
    ReactionInfo(
      type: wow,
      emoji: '😮',
      label: 'Wow',
      color: Color(0xFFF7B125),
    ),
    ReactionInfo(
      type: cry,
      emoji: '😭',
      label: 'Cry',
      color: Color(0xFF2E89FF),
    ),
    ReactionInfo(
      type: angry,
      emoji: '😡',
      label: 'Angry',
      color: Color(0xFFE04006),
    ),
  ];

  static ReactionInfo getInfo(String? type) {
    switch (type) {
      case love:
        return const ReactionInfo(
          type: love,
          emoji: '❤️',
          label: 'Love',
          color: Color(0xFFFA3E3E),
        );
      case haha:
        return const ReactionInfo(
          type: haha,
          emoji: '😂',
          label: 'Haha',
          color: Color(0xFFF7B125),
        );
      case wow:
        return const ReactionInfo(
          type: wow,
          emoji: '😮',
          label: 'Wow',
          color: Color(0xFFF7B125),
        );
      case cry:
        return const ReactionInfo(
          type: cry,
          emoji: '😭',
          label: 'Cry',
          color: Color(0xFF2E89FF),
        );
      case sad:
        return const ReactionInfo(
          type: sad,
          emoji: '😢',
          label: 'Sad',
          color: Color(0xFFF7B125),
        );
      case angry:
        return const ReactionInfo(
          type: angry,
          emoji: '😡',
          label: 'Angry',
          color: Color(0xFFE04006),
        );
      case like:
      default:
        return const ReactionInfo(
          type: like,
          emoji: '👍',
          label: 'Like',
          color: Color(0xFF1877F2),
        );
    }
  }

  static String getEmoji(String? type) => getInfo(type).emoji;
  static Color getColor(String? type) => getInfo(type).color;
  static String getLabel(String? type) => getInfo(type).label;
}

/// Summary count for each reaction type (e.g. { type: "like", count: 42 })
class ReactionCountModel {
  final String type;
  final int count;

  const ReactionCountModel({
    required this.type,
    required this.count,
  });

  factory ReactionCountModel.fromJson(Map<String, dynamic> json) {
    return ReactionCountModel(
      type: json['type'] as String? ?? 'like',
      count: int.tryParse(json['count'].toString()) ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'type': type,
        'count': count,
      };
}

/// User details in post reactions breakdown list
class PostReactionUser {
  final String type;
  final String userId;
  final String username;
  final String? name;
  final String? avatarUrl;
  final DateTime? createdAt;

  const PostReactionUser({
    required this.type,
    required this.userId,
    required this.username,
    this.name,
    this.avatarUrl,
    this.createdAt,
  });

  factory PostReactionUser.fromJson(Map<String, dynamic> json) {
    return PostReactionUser(
      type: json['type'] as String? ?? 'like',
      userId: json['user_id']?.toString() ?? json['userId']?.toString() ?? '',
      username: json['username'] as String? ?? '',
      name: json['name'] as String?,
      avatarUrl: json['avatar_url'] as String? ?? json['avatarUrl'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'type': type,
        'user_id': userId,
        'username': username,
        'name': name,
        'avatar_url': avatarUrl,
        'created_at': createdAt?.toIso8601String(),
      };
}

/// Complete response from GET /api/likes/:postId/likes
class PostReactionsResponse {
  final int total;
  final List<ReactionCountModel> reactions;
  final List<PostReactionUser> users;

  const PostReactionsResponse({
    required this.total,
    required this.reactions,
    required this.users,
  });

  factory PostReactionsResponse.fromJson(Map<String, dynamic> json) {
    final reactionsList = (json['reactions'] as List?)
            ?.map((e) => ReactionCountModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
    final usersList = (json['users'] as List?)
            ?.map((e) => PostReactionUser.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];

    return PostReactionsResponse(
      total: json['total'] as int? ?? usersList.length,
      reactions: reactionsList,
      users: usersList,
    );
  }
}
