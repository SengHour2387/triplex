import 'package:google_maps_flutter/google_maps_flutter.dart';

class POIPlace {
  final String? placeId;
  final LatLng? latLng;
  final String? name;
  final double? rating;
  final int? userRatingsTotal;
  final String? status;
  final String? phone;

  POIPlace({
    this.placeId,
    this.latLng,
    this.name,
    this.rating,
    this.userRatingsTotal,
    this.status,
    this.phone,
  });

  factory POIPlace.fromDetails(
    Map<String, dynamic> json, {
    String? placeId,
    LatLng? latLng,
  }) {
    return POIPlace(
      placeId: placeId,
      latLng: latLng,
      name: json['name'],
      rating: (json['rating'] as num?)?.toDouble(),
      userRatingsTotal: json['user_ratings_total'] as int?,
      status: json['status'],
      phone: json['formatted_phone_number'],
    );
  }

  Map<String, dynamic> toJson() => {
    'placeId': placeId,
    'lat': latLng?.latitude,
    'lng': latLng?.longitude,
    'name': name,
    'rating': rating,
    'userRatingsTotal': userRatingsTotal,
    'status': status,
    'phone': phone,
  };
}
