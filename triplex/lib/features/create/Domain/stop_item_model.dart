import 'package:uuid/uuid.dart';

enum StopType { start, waypoint, end }

class StopItemModel {
  final String id;
  final String title;
  final StopType role;
  final String? location;
  final String? placeId;
  final double? latitude;
  final double? longitude;
  final String? description;
  final double? cost;
  final String? currency;
  final int sortOrder;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  StopItemModel({
    String? id,
    required this.title,
    this.role = StopType.waypoint,
    this.location,
    this.placeId,
    this.latitude,
    this.longitude,
    this.description,
    this.cost,
    this.currency,
    this.sortOrder = 0,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) : id = id ?? const Uuid().v4(),
       createdAt = createdAt ?? DateTime.now(),
       updatedAt = updatedAt ?? DateTime.now();

  factory StopItemModel.fromJson(Map<String, dynamic> json) {
    return StopItemModel(
      id: json['id'],
      title: json['title'] ,
      role: json["role"] ,
      location: json['location'],
      placeId: json['place_id'],
      latitude: json['latitude'],
      longitude: json['longitude'],
      description: json['description'],
      cost: json['cost'] != null ? (json['cost'] as num).toDouble() : null,
      currency: json['currency'],
      sortOrder: json['sort_order'] ?? 0,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      "role": role.name,
      'location': location,
      'place_id': placeId,
      'latitude': latitude,
      'longitude': longitude,
      'description': description,
      'cost': cost,
      'currency': currency,
      'sort_order': sortOrder,
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  StopItemModel copyWith({
    String? id,
    String? title,
    StopType? role,
    String? location,
    String? placeId,
    double? latitude,
    double? longitude,
    String? description,
    double? cost,
    String? currency,
    int? sortOrder,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return StopItemModel(
      id: id ?? this.id,
      title: title ?? this.title,
      role: role ?? this.role,
      location: location ?? this.location,
      placeId: placeId ?? this.placeId,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      description: description ?? this.description,
      cost: cost ?? this.cost,
      currency: currency ?? this.currency,
      sortOrder: sortOrder ?? this.sortOrder,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
