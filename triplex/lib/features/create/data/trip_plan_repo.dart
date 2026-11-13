import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/core/api/dio_provider.dart';
import 'package:triplex/features/create/domain/trip_plan_model.dart';

part 'trip_plan_repo.g.dart';

@riverpod
TripPlanRepo tripPlanRepo(Ref ref) {
  return TripPlanRepo(ref.watch(dioProvider));
}

class TripPlanRepo {
  final Dio _dio;

  TripPlanRepo(this._dio);

  Future<void> saveTripPlan(TripPlanModel tripPlan) async {
    try {
      await _dio.post(
        'trip-plans',
        data: tripPlan.toJson(),
      );
    } on DioException catch (e) {
      if (kDebugMode) {
        print("DioException in saveTripPlan: ${e.response?.data} | $e");
      }
      final message = e.response?.data != null && e.response?.data is Map
          ? (e.response?.data['message'] ?? 'Failed to save trip plan')
          : 'Failed to save trip plan';
      throw Exception(message);
    } catch (e) {
      if (kDebugMode) {
        print("Error in saveTripPlan: $e");
      }
      throw Exception('An unknown error occurred while saving trip plan');
    }
  }

  Future<List<TripPlanModel>> getSavedTripPlans() async {
    try {
      final response = await _dio.get('trip-plans');
      final rawData = response.data;
      final List list = rawData is List
          ? rawData
          : (rawData is Map && rawData['data'] is List
              ? rawData['data'] as List
              : []);
      return list
          .map((json) => TripPlanModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      if (kDebugMode) {
        print("DioException in getSavedTripPlans: ${e.response?.data} | $e");
      }
      return [];
    } catch (e) {
      if (kDebugMode) {
        print("Error in getSavedTripPlans: $e");
      }
      return [];
    }
  }

  Future<void> deleteSavedTripPlan(String id) async {
    try {
      await _dio.delete('trip-plans/$id');
    } on DioException catch (e) {
      if (kDebugMode) {
        print("DioException in deleteSavedTripPlan: ${e.response?.data} | $e");
      }
    } catch (e) {
      if (kDebugMode) {
        print("Error in deleteSavedTripPlan: $e");
      }
    }
  }

  Future<void> createPost({
    required String type,
    required String caption,
    TripPlanModel? tripPlan,
    List<XFile> mediaFiles = const [],
  }) async {
    try {
      final formData = FormData();
      formData.fields.add(MapEntry('type', type));
      formData.fields.add(MapEntry('caption', caption));

      if (tripPlan != null) {
        formData.fields
            .add(MapEntry('trip_plan', jsonEncode(tripPlan.toJson())));
      }

      for (final file in mediaFiles) {
        final multipartFile = await MultipartFile.fromFile(
          file.path,
          filename: file.name,
        );
        formData.files.add(MapEntry('media', multipartFile));
      }

      await _dio.post(
        'posts',
        data: formData,
      );
    } on DioException catch (e) {
      if (kDebugMode) {
        print("DioException in createPost: ${e.response?.data} | $e");
      }
      final message = e.response?.data != null && e.response?.data is Map
          ? (e.response?.data['message'] ?? 'Failed to create post')
          : 'Failed to create post';
      throw Exception(message);
    } catch (e) {
      if (kDebugMode) {
        print("Error in createPost: $e");
      }
      throw Exception('An unknown error occurred while creating post');
    }
  }

  Future<void> postTripPlan(TripPlanModel tripPlan, String caption) async {
    await createPost(
      type: 'trip_plan',
      caption: caption,
      tripPlan: tripPlan,
    );
  }
}
