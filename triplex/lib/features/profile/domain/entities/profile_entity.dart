class ProfileEntity {
  const ProfileEntity({
    required this.uid,
    required this.username,
    required this.displayName,
    this.bio,
    this.avatarUrl,
    this.coverUrl,
    this.followersCount = 0,
    this.followingCount = 0,
    this.postsCount = 0,
    this.isVerified = false,
  });

  final String uid;
  final String username;
  final String displayName;
  final String? bio;
  final String? avatarUrl;
  final String? coverUrl;
  final int followersCount;
  final int followingCount;
  final int postsCount;
  final bool isVerified;
}
