import 'package:flutter_test/flutter_test.dart';
import 'package:triplex/features/auth/Domain/userModel.dart';

void main() {
  group('UserModel Deserialization Tests', () {
    test('should parse user JSON with non-null avatar_url', () {
      final json = {
        'id': '123e4567-e89b-12d3-a456-426614174000',
        'username': 'john_doe',
        'email': 'john@example.com',
        'avatar_url': 'https://example.com/avatar.png',
      };

      final user = UserModel.fromJson(json);

      expect(user.id, '123e4567-e89b-12d3-a456-426614174000');
      expect(user.username, 'john_doe');
      expect(user.email, 'john@example.com');
      expect(user.avatarUrl, 'https://example.com/avatar.png');
    });

    test('should parse user JSON with null avatar_url', () {
      final json = {
        'id': '123e4567-e89b-12d3-a456-426614174000',
        'username': 'john_doe',
        'email': 'john@example.com',
        'avatar_url': null,
      };

      final user = UserModel.fromJson(json);

      expect(user.id, '123e4567-e89b-12d3-a456-426614174000');
      expect(user.username, 'john_doe');
      expect(user.email, 'john@example.com');
      expect(user.avatarUrl, isNull);
    });

    test('should parse user JSON with missing avatar_url', () {
      final json = {
        'id': '123e4567-e89b-12d3-a456-426614174000',
        'username': 'john_doe',
        'email': 'john@example.com',
      };

      final user = UserModel.fromJson(json);

      expect(user.id, '123e4567-e89b-12d3-a456-426614174000');
      expect(user.username, 'john_doe');
      expect(user.email, 'john@example.com');
      expect(user.avatarUrl, isNull);
    });
  });
}
