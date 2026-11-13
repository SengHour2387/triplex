class UserModel {
  final String id;
  final String username;
  final String email;
  final String? name;
  final String? phone;
  final String? avatarUrl;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    this.name,
    this.phone,
    this.avatarUrl,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      username: json['username']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      name: json['name'] as String?,
      phone: json['phone'] as String?,
      avatarUrl: (json['avatar_url'] ?? json['avatarUrl']) as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'name': name,
      'phone': phone,
      'avatar_url': avatarUrl,
    };
  }

  UserModel copyWith({
    String? id,
    String? username,
    String? email,
    String? name,
    String? phone,
    String? avatarUrl,
  }) {
    return UserModel(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
    );
  }
}
