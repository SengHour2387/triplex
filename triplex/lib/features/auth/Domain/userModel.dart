class UserModel {
  final String id;
  final String username;
  final String email;
  final String? avatarUrl;

  UserModel({required this.id, required this.username, required this.email, this.avatarUrl});

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'].toString(),
      username: json['username'] as String,
      email: json['email'] as String,
      avatarUrl: json['avatar_url'] as String?
    );
  }
}
