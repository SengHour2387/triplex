import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// Re-export shared coordinate types from swiftui_map so callers only need one
// import, but they can also be imported from swiftui_map.dart directly.
export 'swiftui_map.dart' show MapTapCoordinate, MapPOI;

import 'swiftui_map.dart' show MapTapCoordinate, MapPOI;

class AndroidMap extends StatefulWidget {
  final double initialLatitude;
  final double initialLongitude;
  final ValueChanged<MapTapCoordinate>? onTap;
  final ValueChanged<MapPOI>? onPOITap;

  const AndroidMap({
    super.key,
    required this.initialLatitude,
    required this.initialLongitude,
    this.onTap,
    this.onPOITap,
  });

  @override
  AndroidMapState createState() => AndroidMapState();
}

class AndroidMapState extends State<AndroidMap> {
  late MethodChannel _channel;

  @override
  Widget build(BuildContext context) {
    if (defaultTargetPlatform == TargetPlatform.android) {
      return AndroidView(
        viewType: 'AndroidGoogleMap',
        creationParams: <String, dynamic>{
          'latitude': widget.initialLatitude,
          'longitude': widget.initialLongitude,
        },
        creationParamsCodec: const StandardMessageCodec(),
        onPlatformViewCreated: _onPlatformViewCreated,
      );
    }
    return const Center(
      child: Text('AndroidMap is only available on Android'),
    );
  }

  void _onPlatformViewCreated(int id) {
    _channel = MethodChannel('AndroidGoogleMap_$id');
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

  Future<void> enableMyLocation() async {
    await _channel.invokeMethod('enableMyLocation');
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
