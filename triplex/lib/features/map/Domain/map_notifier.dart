import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'package:triplex/features/map/presentation/screens/android_map.dart';
import 'package:triplex/features/map/presentation/screens/swiftui_map.dart';

part 'map_notifier.g.dart';

@Riverpod(keepAlive: true)
class MapRevealNotifier extends _$MapRevealNotifier {
  @override
  void build() {}

  Future<void> mapReveal(BuildContext context, LatLng latLng) async {
    await showCupertinoSheet<LatLng>(
      enableDrag: false,
      context: context, scrollableBuilder: (BuildContext context, ScrollController controller) {
      Widget widgetBuilder(BuildContext context) => _MapRevealScreen(
        initialLatitude: latLng.latitude,
        initialLongitude: latLng.longitude,
      );
      return widgetBuilder(context);
    },
    );
  }
}

class _MapRevealScreen extends StatefulWidget {
  final double initialLatitude;
  final double initialLongitude;

  const _MapRevealScreen({
    required this.initialLatitude,
    required this.initialLongitude,
  });

  @override
  State<_MapRevealScreen> createState() => _MapRevealScreenState();
}

class _MapRevealScreenState extends State<_MapRevealScreen> {
  final _iosKey = GlobalKey<SwiftUIMapState>();
  final _androidKey = GlobalKey<AndroidMapState>();

  dynamic get _mapState =>
      Platform.isIOS ? _iosKey.currentState : _androidKey.currentState;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await Future<void>.delayed(const Duration(milliseconds: 600));
      if (!mounted) return;
      await _mapState?.centerOn(
          widget.initialLatitude, widget.initialLongitude);
      await _mapState?.setMarker(
          widget.initialLatitude, widget.initialLongitude);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          if (Platform.isIOS)
            SwiftUIMap(
              key: _iosKey,
              initialLatitude: widget.initialLatitude,
              initialLongitude: widget.initialLongitude,
            )
          else
            AndroidMap(
              key: _androidKey,
              initialLatitude: widget.initialLatitude,
              initialLongitude: widget.initialLongitude,
            ),
          Positioned(
            top: 60,
            left: 16,
            child: SafeArea(
              child: IconButton(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.close),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.black26,
                  foregroundColor: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
