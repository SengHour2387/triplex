import 'package:flutter_test/flutter_test.dart';
import 'package:triplex/features/profile/domain/user_profile_model.dart';

void main() {
  group('UserProfileModel Tests', () {
    test('should parse full user profile JSON correctly', () {
      final json = {
        'id': 'user-123',
        'username': 'traveler_sam',
        'email': 'sam@example.com',
        'name': 'Sam Traveler',
        'phone': '+1234567890',
        'avatar_url': 'https://example.com/sam.png',
        'created_at': '2026-08-01T12:00:00.000Z',
        'followersCount': 105,
        'followingCount': 42,
        'postsCount': 12,
        'is_following': true,
        'is_self': false,
      };

      final profile = UserProfileModel.fromJson(json);

      expect(profile.id, 'user-123');
      expect(profile.username, 'traveler_sam');
      expect(profile.email, 'sam@example.com');
      expect(profile.name, 'Sam Traveler');
      expect(profile.phone, '+1234567890');
      expect(profile.avatarUrl, 'https://example.com/sam.png');
      expect(profile.followersCount, 105);
      expect(profile.followingCount, 42);
      expect(profile.postsCount, 12);
      expect(profile.isFollowing, true);
      expect(profile.isSelf, false);
      expect(profile.createdAt, isNotNull);
    });

    test('should handle minimal JSON with defaults', () {
      final json = {
        'id': 'user-456',
        'username': 'minimal_user',
      };

      final profile = UserProfileModel.fromJson(json);

      expect(profile.id, 'user-456');
      expect(profile.username, 'minimal_user');
      expect(profile.email, isNull);
      expect(profile.name, isNull);
      expect(profile.avatarUrl, isNull);
      expect(profile.followersCount, 0);
      expect(profile.followingCount, 0);
      expect(profile.postsCount, 0);
      expect(profile.isFollowing, false);
      expect(profile.isSelf, false);
    });

    test('should serialize to JSON correctly', () {
      final profile = UserProfileModel(
        id: 'user-789',
        username: 'alice',
        name: 'Alice W',
        followersCount: 5,
        followingCount: 3,
        postsCount: 1,
        isSelf: true,
      );

      final json = profile.toJson();

      expect(json['id'], 'user-789');
      expect(json['username'], 'alice');
      expect(json['name'], 'Alice W');
      expect(json['followersCount'], 5);
      expect(json['followingCount'], 3);
      expect(json['postsCount'], 1);
      expect(json['is_following'], false);
      expect(json['is_self'], true);
    });

    test('should copyWith updated fields', () {
      final profile = UserProfileModel(
        id: 'user-001',
        username: 'bob',
        followersCount: 10,
      );

      final updated = profile.copyWith(
        followersCount: 11,
        isFollowing: true,
      );

      expect(updated.id, 'user-001');
      expect(updated.username, 'bob');
      expect(updated.followersCount, 11);
      expect(updated.isFollowing, true);
    });
  });
}
