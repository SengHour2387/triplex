import 'package:triplex/features/create/domain/stop_item_model.dart';

class TripPlanModel {
  final String? id;
  final String title;
  final String? caption;
  final StopItemModel? start;
  final List<StopItemModel> waypoints;
  final StopItemModel? end;
  final double? totalCost;
  final String? totalCostCurrency;

  TripPlanModel({
    this.id,
    required this.title,
    this.caption,
    this.start,
    this.waypoints = const [],
    required this.end,
    this.totalCost,
    this.totalCostCurrency,
  });

  factory TripPlanModel.fromJson(Map<String, dynamic> json) {
    return TripPlanModel(
      id: json['id']?.toString(),
      title: json['title'] as String? ?? '',
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
      totalCost: json['total_cost'] != null
          ? double.tryParse(json['total_cost'].toString())
          : null,
      totalCostCurrency: json['total_cost_currency'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'title': title,
      'caption': caption,
      'start': start?.toJson(),
      'waypoints': waypoints.map((stop) => stop.toJson()).toList(),
      'end': end?.toJson(),
      if (totalCost != null) 'total_cost': totalCost,
      if (totalCostCurrency != null) 'total_cost_currency': totalCostCurrency,
    };
  }

  TripPlanModel copyWith({
    String? id,
    String? title,
    String? caption,
    StopItemModel? start,
    List<StopItemModel>? waypoints,
    StopItemModel? end,
    double? totalCost,
    String? totalCostCurrency,
  }) {
    return TripPlanModel(
      id: id ?? this.id,
      title: title ?? this.title,
      caption: caption ?? this.caption,
      start: start ?? this.start,
      waypoints: waypoints != null
          ? List<StopItemModel>.from(waypoints)
          : List<StopItemModel>.from(this.waypoints),
      end: end ?? this.end,
      totalCost: totalCost ?? this.totalCost,
      totalCostCurrency: totalCostCurrency ?? this.totalCostCurrency,
    );
  }
}
