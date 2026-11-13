import 'package:flutter_test/flutter_test.dart';
import 'package:triplex/features/auth/domain/user_model.dart';
import 'package:triplex/features/comments/domain/models/comment_model.dart';

void main() {
  group('CommentModel Tests', () {
    test('should parse top-level comment correctly', () {
      final json = {
        'id': '11111111-1111-1111-1111-111111111111',
        'post_id': '22222222-2222-2222-2222-222222222222',
        'parent_comment_id': null,
        'content': 'This is a great trip!',
        'likes_count': 5,
        'replies_count': 2,
        'is_reacted': true,
        'my_reaction': 'love',
        'created_at': '2026-08-01T12:00:00.000Z',
        'updated_at': '2026-08-01T12:00:00.000Z',
        'user': {
          'id': '33333333-3333-3333-3333-333333333333',
          'username': 'alice',
          'email': 'alice@example.com',
          'avatar_url': 'https://example.com/alice.png',
        },
      };

      final comment = CommentModel.fromJson(json);

      expect(comment.id, '11111111-1111-1111-1111-111111111111');
      expect(comment.postId, '22222222-2222-2222-2222-222222222222');
      expect(comment.parentCommentId, isNull);
      expect(comment.isReply, isFalse);
      expect(comment.content, 'This is a great trip!');
      expect(comment.likesCount, 5);
      expect(comment.repliesCount, 2);
      expect(comment.isReacted, isTrue);
      expect(comment.myReaction, 'love');
      expect(comment.user.username, 'alice');
      expect(comment.isDeleted, isFalse);
    });

    test('should parse reply comment correctly with parentCommentId', () {
      final json = {
        'id': '44444444-4444-4444-4444-444444444444',
        'post_id': '22222222-2222-2222-2222-222222222222',
        'parent_comment_id': '11111111-1111-1111-1111-111111111111',
        'content': 'Totally agree with you!',
        'likes_count': 1,
        'replies_count': 0,
        'is_reacted': false,
        'my_reaction': null,
        'created_at': '2026-08-01T12:05:00.000Z',
        'updated_at': '2026-08-01T12:05:00.000Z',
        'user': {
          'id': '55555555-5555-5555-5555-555555555555',
          'username': 'bob',
          'email': 'bob@example.com',
        },
      };

      final reply = CommentModel.fromJson(json);

      expect(reply.id, '44444444-4444-4444-4444-444444444444');
      expect(reply.parentCommentId, '11111111-1111-1111-1111-111111111111');
      expect(reply.isReply, isTrue);
      expect(reply.content, 'Totally agree with you!');
      expect(reply.likesCount, 1);
      expect(reply.repliesCount, 0);
    });

    test('should handle soft-deleted comments appropriately', () {
      final json = {
        'id': '66666666-6666-6666-6666-666666666666',
        'post_id': '22222222-2222-2222-2222-222222222222',
        'content': 'Secret text',
        'is_deleted': true,
        'created_at': '2026-08-01T12:00:00.000Z',
        'updated_at': '2026-08-01T12:00:00.000Z',
        'user': {
          'id': '33333333-3333-3333-3333-333333333333',
          'username': 'deleted_user',
          'email': '',
        },
      };

      final comment = CommentModel.fromJson(json);

      expect(comment.isDeleted, isTrue);
      expect(comment.content, 'This comment was deleted.');
    });

    test('should copyWith properly', () {
      final initial = CommentModel(
        id: '1',
        postId: 'p1',
        content: 'hello',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        user: UserModel(id: 'u1', username: 'john', email: 'j@example.com'),
      );

      final updated = initial.copyWith(
        likesCount: 3,
        isReacted: true,
        myReaction: 'cry',
      );

      expect(updated.id, '1');
      expect(updated.content, 'hello');
      expect(updated.likesCount, 3);
      expect(updated.isReacted, isTrue);
      expect(updated.myReaction, 'cry');
    });
  });
}
