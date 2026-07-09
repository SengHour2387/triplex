import 'package:triplex/features/create/Domain/stop_item_model.dart';

class TripPlanModel {
  final String title;
  final String? caption;
  final StopItemModel? start;
  final List<StopItemModel> waypoints;
  final StopItemModel? end;

  TripPlanModel({
    required this.title,
    this.caption,
    this.start,
    this.waypoints = const [],
    required this.end,
  });

  factory TripPlanModel.fromJson(Map<String, dynamic> json) {
    return TripPlanModel(
      title: json['title'] as String,
      caption: json['caption'] as String?,
      start: json['start'] != null
          ? StopItemModel.fromJson(json['start'] as Map<String, dynamic>)
          : null,
      waypoints: json['waypoints'] != null
          ? (json['waypoints'] as List)
          .map((e) => StopItemModel.fromJson(e as Map<String, dynamic>))
          .toList()
          : [],
      end: json['end'] != null
          ? StopItemModel.fromJson(json['end'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'caption': caption,
      'start': start?.toJson(),
      'waypoints': waypoints.map((stop) => stop.toJson()).toList(),
      'end': end?.toJson(),
    };
  }

  TripPlanModel copyWith({
    String? title,
    String? caption,
    StopItemModel? start,
    List<StopItemModel>? waypoints,
    StopItemModel? end,
  }) {
    return TripPlanModel(
      title: title ?? this.title,
      caption: caption ?? this.caption,
      start: start ?? this.start,
      // Create a new list to avoid reference issues
      waypoints: waypoints != null
          ? List<StopItemModel>.from(waypoints)
          : List<StopItemModel>.from(this.waypoints),
      end: end ?? this.end,
    );
  }

}