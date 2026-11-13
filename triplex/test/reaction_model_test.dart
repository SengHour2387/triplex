import 'package:flutter_test/flutter_test.dart';
import 'package:triplex/features/reactions/domain/models/reaction_model.dart';

void main() {
  group('ReactionModel Tests', () {
    test('should map reaction types to correct emojis', () {
      expect(ReactionTypes.getEmoji(ReactionTypes.like), '👍');
      expect(ReactionTypes.getEmoji(ReactionTypes.love), '❤️');
      expect(ReactionTypes.getEmoji(ReactionTypes.haha), '😂');
      expect(ReactionTypes.getEmoji(ReactionTypes.wow), '😮');
      expect(ReactionTypes.getEmoji(ReactionTypes.cry), '😭');
      expect(ReactionTypes.getEmoji(ReactionTypes.angry), '😡');
    });

    test('should parse ReactionCountModel correctly', () {
      final json = {'type': 'love', 'count': '42'};
      final model = ReactionCountModel.fromJson(json);

      expect(model.type, 'love');
      expect(model.count, 42);
    });

    test('should parse PostReactionsResponse with users correctly', () {
      final json = {
        'status': 'success',
        'total': 2,
        'reactions': [
          {'type': 'love', 'count': 1},
          {'type': 'cry', 'count': 1},
        ],
        'users': [
          {
            'type': 'love',
            'user_id': 'u1',
            'username': 'user_one',
            'name': 'User One',
            'avatar_url': 'https://example.com/u1.png',
          },
          {
            'type': 'cry',
            'user_id': 'u2',
            'username': 'user_two',
            'name': 'User Two',
            'avatar_url': null,
          }
        ],
      };

      final response = PostReactionsResponse.fromJson(json);

      expect(response.total, 2);
      expect(response.reactions.length, 2);
      expect(response.reactions[0].type, 'love');
      expect(response.reactions[0].count, 1);
      expect(response.users.length, 2);
      expect(response.users[0].username, 'user_one');
      expect(response.users[0].type, 'love');
      expect(response.users[1].type, 'cry');
    });
  });
}
