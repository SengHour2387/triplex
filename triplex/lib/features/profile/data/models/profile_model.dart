import '../../domain/entities/profile_entity.dart';

class ProfileModel extends ProfileEntity {
  const ProfileModel({
    required super.uid,
    required super.username,
    required super.displayName,
    super.bio,
    super.avatarUrl,
    super.coverUrl,
    super.followersCount,
    super.followingCount,
    super.postsCount,
    super.isVerified,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) => ProfileModel(
        uid: json['uid'] as String? ?? '',
        username: json['username'] as String? ?? '',
        displayName: json['displayName'] as String? ?? '',
        bio: json['bio'] as String?,
        avatarUrl: json['avatarUrl'] as String?,
        coverUrl: json['coverUrl'] as String?,
        followersCount: json['followersCount'] as int? ?? 0,
        followingCount: json['followingCount'] as int? ?? 0,
        postsCount: json['postsCount'] as int? ?? 0,
        isVerified: json['isVerified'] as bool? ?? false,
      );

  Map<String, dynamic> toJson() => {
        'uid': uid,
        'username': username,
        'displayName': displayName,
        'bio': bio,
        'avatarUrl': avatarUrl,
        'coverUrl': coverUrl,
        'followersCount': followersCount,
        'followingCount': followingCount,
        'postsCount': postsCount,
        'isVerified': isVerified,
      };
}