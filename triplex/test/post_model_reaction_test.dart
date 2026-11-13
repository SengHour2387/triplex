import 'package:flutter_test/flutter_test.dart';
import 'package:triplex/features/auth/domain/user_model.dart';
import 'package:triplex/features/feed/domain/models/post_model.dart';
import 'package:triplex/features/reactions/domain/models/reaction_model.dart';

void main() {
  group('PostModel Reactions Tests', () {
    test('should parse post with love reaction correctly', () {
      final json = {
        'id': 'post-uuid-1',
        'type': 'media',
        'caption': 'Sunset in Kampot',
        'likes_count': 5,
        'comments_count': 2,
        'is_liked': true,
        'my_reaction': 'love',
        'created_at': '2026-08-01T12:00:00.000Z',
        'updated_at': '2026-08-01T12:00:00.000Z',
        'user': {
          'id': 'user-uuid-1',
          'username': 'traveler_1',
          'email': 'traveler@example.com',
        },
      };

      final post = PostModel.fromJson(json);

      expect(post.id, 'post-uuid-1');
      expect(post.likeCount, 5);
      expect(post.isLiked, isTrue);
      expect(post.myReaction, 'love');
      expect(ReactionTypes.getEmoji(post.myReaction), '❤️');
    });

    test('should parse post with haha reaction correctly', () {
      final json = {
        'id': 'post-uuid-2',
        'type': 'media',
        'caption': 'Funny moment',
        'likes_count': 10,
        'comments_count': 1,
        'is_liked': true,
        'my_reaction': 'haha',
        'created_at': '2026-08-01T12:00:00.000Z',
        'updated_at': '2026-08-01T12:00:00.000Z',
        'user': {
          'id': 'user-uuid-2',
          'username': 'joker_2',
          'email': 'joker@example.com',
        },
      };

      final post = PostModel.fromJson(json);

      expect(post.isLiked, isTrue);
      expect(post.myReaction, 'haha');
      expect(ReactionTypes.getEmoji(post.myReaction), '😂');
    });

    test('should parse post without reaction correctly', () {
      final json = {
        'id': 'post-uuid-3',
        'type': 'media',
        'caption': 'Just a post',
        'likes_count': 0,
        'comments_count': 0,
        'is_liked': false,
        'my_reaction': null,
        'created_at': '2026-08-01T12:00:00.000Z',
        'updated_at': '2026-08-01T12:00:00.000Z',
        'user': {
          'id': 'user-uuid-3',
          'username': 'user_3',
          'email': 'user3@example.com',
        },
      };

      final post = PostModel.fromJson(json);

      expect(post.isLiked, isFalse);
      expect(post.myReaction, isNull);
    });

    test('should copyWith reaction correctly', () {
      final initial = PostModel(
        id: 'post-1',
        type: 'media',
        caption: 'Hello',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        user: UserModel(id: 'u1', username: 'user1', email: 'u1@example.com'),
        likeCount: 1,
        isLiked: true,
        myReaction: 'like',
      );

      // Switching from like to love
      final updated = initial.copyWith(
        myReaction: 'love',
      );

      expect(updated.isLiked, isTrue);
      expect(updated.myReaction, 'love');
      expect(updated.likeCount, 1);

      // Unreacting
      final unreacted = updated.copyWith(
        isLiked: false,
        likeCount: 0,
      );

      expect(unreacted.isLiked, isFalse);
      expect(unreacted.myReaction, isNull);
      expect(unreacted.likeCount, 0);
    });
  });
}
