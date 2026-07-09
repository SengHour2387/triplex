import 'package:dio/dio.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/core/api/dio_provider.dart';
import 'package:triplex/features/map/Domain/POI_place.dart';

part 'google_maps_repo.g.dart';

@riverpod
GoogleMapsRepo googleMapsRepo(Ref ref) {
  return GoogleMapsRepo(
    dio: ref.watch(dioProvider),
  );
}

class GoogleMapsRepo {
  final Dio _dio;

  GoogleMapsRepo({required Dio dio}) : _dio = dio;

  Future<POIPlace> fetchPlaceDetails(String placeId, {LatLng? latLng}) async {
    final response = await _dio.post(
      'map/details-by-id',
      data: {'placeId': placeId},
    );

    if (response.statusCode == 200) {
      final data = response.data;
      if (data != null && data['status'] == 'success') {
        return POIPlace.fromDetails(
          data['place'] as Map<String, dynamic>,
          placeId: placeId,
          latLng: latLng,
        );
      }
      throw Exception(data['error'] ?? 'Failed to retrieve details');
    }
    throw Exception('Server error: ${response.statusCode}');
  }
}