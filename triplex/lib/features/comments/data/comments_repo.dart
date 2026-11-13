import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:triplex/core/api/dio_provider.dart';
import 'package:triplex/features/comments/domain/models/comment_model.dart';

final commentsRepoProvider = Provider<CommentsRepo>((ref) {
  return CommentsRepo(ref.watch(dioProvider));
});

class CommentsRepo {
  final Dio _dio;

  CommentsRepo(this._dio);

  /// Fetch top-level comments for a post
  Future<List<CommentModel>> getComments(String postId) async {
    final response = await _dio.get('comments/$postId/comments');
    final data = response.data['data'] as List? ?? [];
    return data
        .map((json) => CommentModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Lazy-load replies for a parent comment
  Future<List<CommentModel>> getReplies(String commentId) async {
    final response = await _dio.get('comments/$commentId/replies');
    final data = response.data['data'] as List? ?? [];
    return data
        .map((json) => CommentModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Add a top-level comment (or reply if parentCommentId is provided)
  Future<CommentModel> addComment(
    String postId,
    String content, {
    String? parentCommentId,
  }) async {
    final response = await _dio.post(
      'comments/$postId/comments',
      data: {
        'content': content,
        'parentCommentId': parentCommentId,
      },
    );
    final data = response.data['data'] as Map<String, dynamic>;
    return CommentModel.fromJson(data);
  }

  /// Convenience method to add a reply directly under a parent comment
  Future<CommentModel> addReply(String commentId, String content) async {
    final response = await _dio.post(
      'comments/$commentId/replies',
      data: {'content': content},
    );
    final data = response.data['data'] as Map<String, dynamic>;
    return CommentModel.fromJson(data);
  }

  /// React to a comment or reply
  Future<Map<String, dynamic>> reactToComment(String commentId,
      {String type = 'like'}) async {
    final response = await _dio.post(
      'comments/$commentId/like',
      data: {'type': type},
    );
    return response.data as Map<String, dynamic>;
  }

  /// Remove a reaction from a comment or reply
  Future<Map<String, dynamic>> removeCommentReaction(String commentId,
      {String type = 'like'}) async {
    final response = await _dio.delete(
      'comments/$commentId/like',
      data: {'type': type},
    );
    return response.data as Map<String, dynamic>;
  }

  /// Soft-delete a comment or reply
  Future<void> deleteComment(String commentId) async {
    await _dio.delete('comments/comment/$commentId');
  }
}
