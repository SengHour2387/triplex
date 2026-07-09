import 'package:cupertino_native_better/cupertino_native.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:triplex/core/api/dio_provider.dart';

class GoogleWebViewMap extends ConsumerStatefulWidget {
  final bool isDialog;
  const GoogleWebViewMap({super.key, this.isDialog = false});

  @override
  ConsumerState<GoogleWebViewMap> createState() => _GoogleWebViewMapState();
}

class _GoogleWebViewMapState extends ConsumerState<GoogleWebViewMap> {
  late final WebViewController _webViewController;
  bool _isLoadingDetails = false;

  @override
  void initState() {
    super.initState();
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'PoiChannel',
        onMessageReceived: (JavaScriptMessage message) {
          final placeId = message.message;
          _fetchPlaceDetails(placeId);
        },
      )
      ..addJavaScriptChannel(
        'MapChannel',
        onMessageReceived: (JavaScriptMessage message) {
          if (message.message == 'ready') {
            final isDark = Theme.of(context).brightness == Brightness.dark;
            _webViewController.runJavaScript('setTheme($isDark);');
            _centerOnUserLocation();
          }
        },
      )
      ..loadFlutterAsset('assets/map.html');

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initLocation();
    });
  }

  Future<void> _initLocation() async {
    try {
      var status = await Permission.location.status;
      if (status == PermissionStatus.denied) {
        status = await Permission.location.request();
      }

      if (status == PermissionStatus.granted || status == PermissionStatus.limited) {
        _centerOnUserLocation();
      }
    } catch (e) {
      debugPrint("Error checking location: $e");
    }
  }

  Future<void> _centerOnUserLocation() async {
    try {
      final status = await Permission.location.status;
      if (status == PermissionStatus.granted || status == PermissionStatus.limited) {
        final position = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.high,
          ),
        );
        final lat = position.latitude;
        final lng = position.longitude;
        await _webViewController.runJavaScript('centerMap($lat, $lng);');
      }
    } catch (e) {
      debugPrint("Error centering map: $e");
    }
  }

  Future<void> _fetchPlaceDetails(String placeId) async {
    setState(() {
      _isLoadingDetails = true;
    });

    try {
      final dio = ref.read(dioProvider);
      final response = await dio.post(
        'map/details-by-id',
        data: {
          'placeId': placeId,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data != null && data['status'] == 'success') {
          final place = data['place'];
          if (mounted) {
            _showPlaceDetailsSheet(place);
          }
        } else {
          _showErrorSnackBar(data['error'] ?? 'Failed to retrieve details');
        }
      } else {
        _showErrorSnackBar('Server error: ${response.statusCode}');
      }
    } catch (e) {
      _showErrorSnackBar('Network error: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingDetails = false;
        });
      }
    }
  }

  void _showErrorSnackBar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Theme.of(context).colorScheme.error,
      ),
    );
  }

  void _showPlaceDetailsSheet(Map<String, dynamic> place) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black38,
      builder: (context) {
        final name = place['name'] ?? 'Unknown Venue';
        final rating = place['rating']?.toDouble() ?? 0.0;
        final totalRatings = place['user_ratings_total'] ?? 0;
        final status = place['status'] ?? 'Unknown';
        final phone = place['formatted_phone_number'] ?? 'N/A';
        final isOpen = status.toString().toLowerCase() == 'open' || status.toString().toLowerCase() == 'true';

        final isDark = Theme.of(context).brightness == Brightness.dark;

        return Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(24),
              topRight: Radius.circular(24),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(50),
                blurRadius: 10,
                spreadRadius: 2,
              )
            ],
            border: Border.all(
              color: isDark ? Colors.white.withAlpha(25) : Colors.black.withAlpha(15),
              width: 1,
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
                      color: isDark ? Colors.white.withAlpha(50) : Colors.black.withAlpha(50),
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
                    const Icon(Icons.star_rounded, color: Colors.amber, size: 22),
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
                        color: isDark ? Colors.white.withAlpha(120) : Colors.black.withAlpha(120),
                        fontSize: 14,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: isOpen ? Colors.green.withAlpha(30) : Colors.red.withAlpha(30),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isOpen ? Colors.green.withAlpha(100) : Colors.red.withAlpha(100),
                          width: 1,
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
                const Divider(height: 32, thickness: 1, color: Colors.white10),
                Row(
                  children: [
                    Icon(Icons.phone_rounded, color: isDark ? Colors.blueAccent : Colors.blue, size: 22),
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
                const SizedBox(height: 16),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          // WebView Map
          Positioned.fill(
            child: WebViewWidget(controller: _webViewController),
          ),

          // Top Header Overlay Bar
          Positioned(
            top: widget.isDialog ? 10 : 60,
            left: 16,
            right: 16,
            child: SafeArea(
              bottom: false,
              child: Row(
                children: [
                  IconButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                    icon: const Icon(Icons.close),
                  ).liquidGlass(),
                  const Spacer(),
                  const Text(
                    "WebView Map",
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const Spacer(),
                  const SizedBox(width: 48), // balance space of close button
                ],
              ),
            ),
          ),

          // Re-center Location Button
          Positioned(
            bottom: 30,
            right: 30,
            child: SizedBox(
              width: 50,
              height: 50,
              child: CNButton.icon(
                config: const CNButtonConfig(style: CNButtonStyle.glass),
                onPressed: () {
                  _centerOnUserLocation();
                },
                customIcon: Icons.location_on_rounded,
              ),
            ),
          ),

          // Loading Details Overlay
          if (_isLoadingDetails)
            Positioned.fill(
              child: Container(
                color: Colors.black.withAlpha(120),
                child: Center(
                  child: Card(
                    color: Colors.black.withAlpha(200),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 8,
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 32.0, vertical: 24.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(
                            color: Colors.white,
                          ),
                          SizedBox(height: 16),
                          Text(
                            "Fetching place details...",
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w500,
                            ),
                          )
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
