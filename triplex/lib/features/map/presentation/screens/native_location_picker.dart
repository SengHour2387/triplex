import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:triplex/core/toast/toast_provider.dart';
import 'package:triplex/core/widgets/liquid_glass_shim.dart';
import 'package:triplex/core/widgets/text_h.dart';
import 'package:triplex/features/create/domain/stop_item_model.dart';
import 'package:triplex/features/map/domain/POI_place.dart';
import 'package:triplex/features/map/presentation/screens/android_map.dart';
import 'package:triplex/features/map/presentation/screens/swiftui_map.dart';

class NativeLocationPicker extends ConsumerStatefulWidget {
  final bool isDialog;
  final void Function(POIPlace poi)? onPOISelected;
  final Future<POIPlace> Function(String placeId, LatLng latLng)?
      onFetchPlaceDetails;
  final double? initialLatitude;
  final double? initialLongitude;
  final List<StopItemModel>? existingWaypoints;

  const NativeLocationPicker({
    super.key,
    this.isDialog = false,
    this.onPOISelected,
    this.onFetchPlaceDetails,
    this.initialLatitude,
    this.initialLongitude,
    this.existingWaypoints,
  });

  @override
  ConsumerState<NativeLocationPicker> createState() =>
      _NativeLocationPickerState();
}

class _NativeLocationPickerState extends ConsumerState<NativeLocationPicker> {
  final _iosMapKey = GlobalKey<SwiftUIMapState>();
  final _androidMapKey = GlobalKey<AndroidMapState>();
  bool _isLoadingDetails = false;

  dynamic get _mapState =>
      Platform.isIOS ? _iosMapKey.currentState : _androidMapKey.currentState;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _initLocation());
  }

  Future<void> _initLocation() async {
    try {
      // Place existing waypoints on the map
      _placeExistingWaypoints();

      if (widget.initialLatitude != null && widget.initialLongitude != null) {
        return;
      }

      var status = await Permission.location.status;
      if (status == PermissionStatus.denied) {
        status = await Permission.location.request();
      }

      if (status == PermissionStatus.granted ||
          status == PermissionStatus.limited) {
        if (Platform.isAndroid) {
          _androidMapKey.currentState?.enableMyLocation();
        }
        _centerOnUserLocation();
      }
    } catch (e) {
      debugPrint("Error checking location: $e");
    }
  }

  void _placeExistingWaypoints() {
    final waypoints = widget.existingWaypoints;
    if (waypoints == null || waypoints.isEmpty) return;

    final markers = waypoints
        .where((w) => w.latitude != null && w.longitude != null)
        .map((w) => <String, dynamic>{
              'latitude': w.latitude,
              'longitude': w.longitude,
              'title': w.title,
            })
        .toList();

    if (markers.isEmpty) return;

    // Delay slightly to ensure the native map is ready
    Future.delayed(const Duration(milliseconds: 500), () {
      if (!mounted) return;
      _mapState?.setExistingMarkers(markers);
    });
  }

  Future<void> _centerOnUserLocation() async {
    try {
      final status = await Permission.location.status;
      if (status == PermissionStatus.granted ||
          status == PermissionStatus.limited) {
        final position = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(),
        );
        _mapState?.centerOn(position.latitude, position.longitude);
      }
    } catch (e) {
      debugPrint("Error centering map: $e");
    }
  }

  void _onPOITap(MapPOI poi) {
    if (kDebugMode) {
      print(poi.placeId);
    }
    _fetchPlaceDetails(poi.placeId, poi);
  }

  void _onMapTap(MapTapCoordinate coordinate) {
    _onTap(LatLng(coordinate.latitude, coordinate.longitude));
  }

  void _onTap(LatLng latLang) {
    _mapState?.setMarker(latLang.latitude, latLang.longitude);
    _showTapSheet(latLang);
  }

  Future<void> _fetchPlaceDetails(String placeId, MapPOI poi) async {
    if (!mounted) return;
    setState(() => _isLoadingDetails = true);

    try {
      final place = widget.onFetchPlaceDetails != null
          ? await widget.onFetchPlaceDetails!(
              placeId, LatLng(poi.latitude, poi.longitude))
          : POIPlace(
              placeId: placeId,
              latLng: LatLng(poi.latitude, poi.longitude),
              name: poi.name,
            );

      if (mounted) {
        _showPlaceSheet(place);
      }
    } catch (e) {
      if (mounted) {
        _showToastError('Error: $e');
      }
    } finally {
      if (mounted) {
        setState(() => _isLoadingDetails = false);
      }
    }
  }

  void _showToastError(String message) {
    if (!mounted) return;
    ref.read(toastProvider.notifier).showError(message);
  }

  Future<void> _showTapSheet(LatLng latLng) async {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final POIPlace? result = await showModalBottomSheet<POIPlace>(
        useRootNavigator: true,
        useSafeArea: true,
        context: context,
        backgroundColor: Colors.transparent,
        barrierColor: Platform.isIOS ? Colors.transparent : Colors.black38,
        builder: (context) {
          return Padding(
            padding: const EdgeInsets.all(8.0),
            child: Container(
              decoration: BoxDecoration(
                color: Platform.isIOS
                    ? Colors.transparent
                    : isDark
                        ? const Color(0xFF1E1E1E)
                        : Colors.white,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
                boxShadow: Platform.isIOS
                    ? []
                    : [
                        BoxShadow(
                          color: Colors.black.withAlpha(50),
                          blurRadius: 10,
                          spreadRadius: 2,
                        ),
                      ],
                border: Border.all(
                  color: isDark
                      ? Colors.white.withAlpha(25)
                      : Colors.black.withAlpha(15),
                ),
              ),
              padding: const EdgeInsets.all(20),
              child: SafeArea(
                  child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextH5("Latitude: ${latLng.latitude}"),
                  TextH5("Longitude: ${latLng.longitude}"),
                  const SizedBox(height: 12),
                  IconButton(icon: const Icon(Icons.check, color: CupertinoColors.systemBlue), onPressed: () {
                      final poi = POIPlace(latLng: latLng);
                      widget.onPOISelected?.call(poi);
                      Navigator.of(context).pop(poi);
                    },
                  ),
                ],
              )),
            )
                .liquidGlass(shape: LiquidGlassShape.rect, cornerRadius: 42)
                .animate(
              effects: [
                const ScaleEffect(
                  curve: Curves.easeOutBack,
                  duration: Duration(milliseconds: 500),
                ),
                const FadeEffect(),
              ],
            ),
          );
        });

    if (result != null && mounted) {
      Navigator.of(context).pop();
    }
  }

  Future<void> _showPlaceSheet(POIPlace place) async {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final locationPoi = await showModalBottomSheet<POIPlace>(
      useRootNavigator: true,
      useSafeArea: true,
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: Platform.isIOS ? Colors.transparent : Colors.black38,
      builder: (context) {
        final name = place.name ?? 'Unknown Venue';
        final rating = place.rating ?? 0.0;
        final totalRatings = place.userRatingsTotal ?? 0;
        final status = place.status ?? 'Unknown';
        final phone = place.phone ?? 'N/A';
        final isOpen =
            status.toLowerCase() == 'open' || status.toLowerCase() == 'true';

        return Padding(
          padding: const EdgeInsets.all(8.0),
          child: Container(
            decoration: BoxDecoration(
              color: Platform.isIOS
                  ? Colors.transparent
                  : isDark
                      ? const Color(0xFF1E1E1E)
                      : Colors.white,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(24),
                topRight: Radius.circular(24),
              ),
              boxShadow: Platform.isIOS
                  ? []
                  : [
                      BoxShadow(
                        color: Colors.black.withAlpha(50),
                        blurRadius: 10,
                        spreadRadius: 2,
                      ),
                    ],
              border: Border.all(
                color: isDark
                    ? Colors.white.withAlpha(25)
                    : Colors.black.withAlpha(15),
              ),
            ),
            padding: const EdgeInsets.all(24),
            child: SafeArea(
              top: false,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: isDark
                            ? Colors.white.withAlpha(50)
                            : Colors.black.withAlpha(50),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    name,
                    style: TextStyle(
                      color: isDark ? Colors.white : Colors.black,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(
                        Icons.star_rounded,
                        color: Colors.amber,
                        size: 22,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        rating.toStringAsFixed(1),
                        style: TextStyle(
                          color: isDark ? Colors.white : Colors.black,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        "($totalRatings reviews)",
                        style: TextStyle(
                          color: isDark
                              ? Colors.white.withAlpha(120)
                              : Colors.black.withAlpha(120),
                          fontSize: 14,
                        ),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: isOpen
                              ? Colors.green.withAlpha(30)
                              : Colors.red.withAlpha(30),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isOpen
                                ? Colors.green.withAlpha(100)
                                : Colors.red.withAlpha(100),
                          ),
                        ),
                        child: Text(
                          isOpen ? "Open" : "Closed",
                          style: TextStyle(
                            color: isOpen ? Colors.green : Colors.red,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Divider(
                    height: 32,
                    thickness: 1,
                    color: Colors.white10,
                  ),
                  Row(
                    children: [
                      Icon(
                        Icons.phone_rounded,
                        color: isDark ? Colors.blueAccent : Colors.blue,
                        size: 22,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          phone,
                          style: TextStyle(
                            color: isDark ? Colors.white : Colors.black,
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  IconButton(icon: const Icon(Icons.check, color: CupertinoColors.systemBlue), onPressed: () {
                      widget.onPOISelected?.call(place);
                      Navigator.of(context).pop(place);
                    },
                  ),
                ],
              ),
            ),
          ).liquidGlass(shape: LiquidGlassShape.rect, cornerRadius: 42).animate(
            effects: [
              const ScaleEffect(
                curve: Curves.easeOutBack,
                duration: Duration(milliseconds: 500),
              ),
              const FadeEffect(),
            ],
          ),
        );
      },
    );

    if (locationPoi != null) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          _MapBody(
            iosMapKey: _iosMapKey,
            androidMapKey: _androidMapKey,
            initialLatitude: widget.initialLatitude ?? 48.8566,
            initialLongitude: widget.initialLongitude ?? 2.3522,
            onPOITap: _onPOITap,
            onTap: _onMapTap,
          ),
          Positioned(
            top: widget.isDialog ? 10 : 60,
            left: 16,
            right: 16,
            child: SafeArea(
              bottom: false,
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                  ).liquidGlass(),
                  const Spacer(),
                  Text(
                    Platform.isIOS ? "iOS Map" : "Android Map",
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const Spacer(),
                  const SizedBox(width: 48),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: 30,
            right: 30,
            child: SizedBox(
              width: 50,
              height: 50,
              child: IconButton(onPressed: _centerOnUserLocation, icon: const Icon(Icons.location_on_rounded)),
            ),
          ),
          if (_isLoadingDetails)
            Positioned.fill(
              child: ColoredBox(
                color: Colors.black.withAlpha(120),
                child: Center(
                  child: Card(
                    color: Colors.black.withAlpha(200),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 8,
                    child: const Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: 32.0,
                        vertical: 24.0,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(color: Colors.white),
                          SizedBox(height: 16),
                          Text(
                            "Fetching place details...",
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _MapBody extends StatelessWidget {
  final GlobalKey<SwiftUIMapState> iosMapKey;
  final GlobalKey<AndroidMapState> androidMapKey;
  final double initialLatitude;
  final double initialLongitude;
  final ValueChanged<MapPOI> onPOITap;
  final ValueChanged<MapTapCoordinate> onTap;

  const _MapBody({
    required this.iosMapKey,
    required this.androidMapKey,
    required this.initialLatitude,
    required this.initialLongitude,
    required this.onPOITap,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    if (Platform.isIOS) {
      return RepaintBoundary(
        child: SwiftUIMap(
          key: iosMapKey,
          initialLatitude: initialLatitude,
          initialLongitude: initialLongitude,
          onPOITap: onPOITap,
          onTap: onTap,
        ),
      );
    }
    return RepaintBoundary(
      child: AndroidMap(
        key: androidMapKey,
        initialLatitude: initialLatitude,
        initialLongitude: initialLongitude,
        onPOITap: onPOITap,
        onTap: onTap,
      ),
    );
  }
}
