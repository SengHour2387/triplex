import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class MapTapCoordinate {
  final double latitude;
  final double longitude;

  const MapTapCoordinate({required this.latitude, required this.longitude});
}

class MapPOI {
  final double latitude;
  final double longitude;
  final String placeId;
  final String name;

  const MapPOI({
    required this.latitude,
    required this.longitude,
    required this.placeId,
    required this.name,
  });
}

class SwiftUIMap extends StatefulWidget {
  final double initialLatitude;
  final double initialLongitude;
  final ValueChanged<MapTapCoordinate>? onTap;
  final ValueChanged<MapPOI>? onPOITap;

  const SwiftUIMap({
    super.key,
    required this.initialLatitude,
    required this.initialLongitude,
    this.onTap,
    this.onPOITap,
  });

  @override
  SwiftUIMapState createState() => SwiftUIMapState();
}

class SwiftUIMapState extends State<SwiftUIMap> {
  late MethodChannel _channel;

  @override
  Widget build(BuildContext context) {
    switch (defaultTargetPlatform) {
      case TargetPlatform.iOS:
        return UiKitView(
          viewType: 'SwiftUIMap',
          creationParams: <String, dynamic>{
            'latitude': widget.initialLatitude,
            'longitude': widget.initialLongitude,
          },
          creationParamsCodec: const StandardMessageCodec(),
          onPlatformViewCreated: _onPlatformViewCreated,
        );
      default:
        return const Center(
          child: Text('SwiftUIMap is only available on iOS'),
        );
    }
  }

  void _onPlatformViewCreated(int id) {
    _channel = MethodChannel('SwiftUIMap_$id');
    _channel.setMethodCallHandler(_handleMethodCall);
  }

  Future<dynamic> _handleMethodCall(MethodCall call) async {
    switch (call.method) {
      case 'onTap':
        final args = call.arguments as Map<Object?, Object?>;
        final lat = (args['latitude'] as num).toDouble();
        final lng = (args['longitude'] as num).toDouble();
        widget.onTap?.call(MapTapCoordinate(latitude: lat, longitude: lng));
      case 'onPoiTap':
        final args = call.arguments as Map<Object?, Object?>;
        final placeId = args['placeId'] as String;
        final name = args['name'] as String;
        final lat = (args['latitude'] as num).toDouble();
        final lng = (args['longitude'] as num).toDouble();
        widget.onPOITap?.call(MapPOI(
          latitude: lat,
          longitude: lng,
          placeId: placeId,
          name: name,
        ));
    }
  }

  Future<void> setMarker(double latitude, double longitude) async {
    await _channel.invokeMethod('setMarker', {
      'latitude': latitude,
      'longitude': longitude,
    });
  }

  Future<void> clearMarker() async {
    await _channel.invokeMethod('clearMarker');
  }

  Future<void> centerOn(double latitude, double longitude) async {
    await _channel.invokeMethod('centerOn', {
      'latitude': latitude,
      'longitude': longitude,
    });
  }

  Future<void> animateCameraTo({
    required double latitude,
    required double longitude,
    required double zoom,
  }) async {
    await _channel.invokeMethod('animateCameraTo', {
      'latitude': latitude,
      'longitude': longitude,
      'zoom': zoom,
    });
  }
}
