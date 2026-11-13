import 'package:flutter_test/flutter_test.dart';
import 'package:triplex/features/auth/domain/user_model.dart';

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

    test('should parse user JSON with name and phone', () {
      final json = {
        'id': '123e4567-e89b-12d3-a456-426614174000',
        'username': 'john_doe',
        'email': 'john@example.com',
        'name': 'John Doe',
        'phone': '+1234567890',
        'avatar_url': 'https://example.com/avatar.png',
      };

      final user = UserModel.fromJson(json);

      expect(user.id, '123e4567-e89b-12d3-a456-426614174000');
      expect(user.username, 'john_doe');
      expect(user.email, 'john@example.com');
      expect(user.name, 'John Doe');
      expect(user.phone, '+1234567890');
      expect(user.avatarUrl, 'https://example.com/avatar.png');
    });

    test('should correctly copyWith updated fields', () {
      final user = UserModel(
        id: '123',
        username: 'old_username',
        email: 'old@example.com',
        name: 'Old Name',
      );

      final updated = user.copyWith(
        username: 'new_username',
        email: 'new@example.com',
      );

      expect(updated.id, '123');
      expect(updated.username, 'new_username');
      expect(updated.email, 'new@example.com');
      expect(updated.name, 'Old Name');
    });
  });
}
