import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:triplex/core/api/dio_provider.dart';
import 'package:triplex/features/reactions/domain/models/reaction_model.dart';

final reactionsRepoProvider = Provider<ReactionsRepo>((ref) {
  return ReactionsRepo(ref.watch(dioProvider));
});

class ReactionsRepo {
  final Dio _dio;

  ReactionsRepo(this._dio);

  /// React to a post with a specific reaction type (like, love, haha, wow, cry, angry)
  Future<Map<String, dynamic>> reactToPost(String postId,
      {String type = 'like'}) async {
    final response = await _dio.post(
      'likes/$postId/like',
      data: {'type': type},
    );
    return response.data as Map<String, dynamic>;
  }

  /// Remove a reaction from a post
  Future<Map<String, dynamic>> removePostReaction(String postId,
      {String type = 'like'}) async {
    final response = await _dio.delete(
      'likes/$postId/like',
      data: {'type': type},
    );
    return response.data as Map<String, dynamic>;
  }

  /// Get reaction counts grouped by type & list of users for a post
  Future<PostReactionsResponse> getPostReactions(String postId) async {
    final response = await _dio.get('likes/$postId/likes');
    return PostReactionsResponse.fromJson(
        response.data as Map<String, dynamic>);
  }
}
