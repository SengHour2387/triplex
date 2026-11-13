import 'dart:io';

import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/core/api/dio_provider.dart';
import 'package:triplex/features/feed/domain/models/post_model.dart';
import 'package:triplex/features/profile/domain/user_profile_model.dart';

part 'profile_repo.g.dart';

@riverpod
ProfileRepo profileRepo(Ref ref) {
  return ProfileRepo(dio: ref.watch(dioProvider));
}

class ProfileRepo {
  final Dio dio;
  ProfileRepo({required this.dio});

  Future<String?> setProfilePicture(
    File file, {
    ProgressCallback? uploadCallback,
  }) async {
    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(
        file.path,
        filename: file.path.split('/').last,
      ),
    });

    try {
      final response = await dio.post(
        '/profile/profile-picture',
        data: formData,
        onSendProgress: uploadCallback,
      );

      if (response.statusCode == 200) {
        return response.data["avatarUrl"];
      } else {
        return null;
      }
    } on DioException catch (e) {
      throw Exception(e.response?.data["message"]);
    } catch (e) {
      throw Exception("Setting profile picture error");
    }
  }

  Future<UserProfileModel?> getUserProfile(String userIdOrUsername) async {
    try {
      final response = await dio.get('/users/profile/$userIdOrUsername');
      if (response.data != null && response.data['user'] != null) {
        return UserProfileModel.fromJson(
          response.data['user'] as Map<String, dynamic>,
        );
      }
      return null;
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      throw Exception(e.response?.data?['message'] ?? 'Failed to load profile');
    } catch (e) {
      throw Exception('Failed to load profile');
    }
  }

  Future<Map<String, dynamic>> followUser(String userIdOrUsername) async {
    try {
      final response = await dio.post('/users/follow/$userIdOrUsername');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Failed to follow user');
    } catch (e) {
      throw Exception('Failed to follow user');
    }
  }

  Future<Map<String, dynamic>> unfollowUser(String userIdOrUsername) async {
    try {
      final response = await dio.delete('/users/unfollow/$userIdOrUsername');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw Exception(
        e.response?.data?['message'] ?? 'Failed to unfollow user',
      );
    } catch (e) {
      throw Exception('Failed to unfollow user');
    }
  }

  Future<List<UserProfileModel>> getFollowers(String userIdOrUsername) async {
    try {
      final response = await dio.get('/users/$userIdOrUsername/followers');
      final rawList = response.data?['followers'] as List? ?? [];
      return rawList
          .map(
              (json) => UserProfileModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<List<UserProfileModel>> getFollowing(String userIdOrUsername) async {
    try {
      final response = await dio.get('/users/$userIdOrUsername/following');
      final rawList = response.data?['following'] as List? ?? [];
      return rawList
          .map(
              (json) => UserProfileModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<List<PostModel>> getUserPosts(
      {String? userId, String? username}) async {
    try {
      final id = userId ?? username;
      final endpoint = id != null ? '/posts/user/$id' : '/posts/my-posts';
      final response = await dio.get(endpoint);
      final rawData = response.data;
      final List list = rawData is List
          ? rawData
          : (rawData is Map && rawData['data'] is List
              ? rawData['data'] as List
              : []);
      return list
          .map((json) => PostModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }
}
