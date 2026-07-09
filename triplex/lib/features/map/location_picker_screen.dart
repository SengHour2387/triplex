import 'package:cupertino_native_better/cupertino_native.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:permission_handler/permission_handler.dart';

class LocationPickerScreen extends StatefulWidget {
  final bool isDialog;
  const LocationPickerScreen({super.key,this.isDialog = false});

  @override
  State<LocationPickerScreen> createState() => _LocationPickerScreenState();
}

class _LocationPickerScreenState extends State<LocationPickerScreen> {
  GoogleMapController? _googleMapController;
  LatLng? _currentLat;
  bool _locationPermissionGranted = false;
  String? _darkStyle;

  static const LatLng _fallbackLocation = LatLng(20.5564, 40.9282);

  void onSearchChanged(String text) {
    Future.delayed(Duration(seconds: 3)).whenComplete(() {
      print(text);
    });
  }

  Future<void> _initLocation() async {
    try {
      var status = await Permission.location.status;
      if (status == PermissionStatus.denied) {
        status = await Permission.location.request();
      }

      if (status == PermissionStatus.granted || status == PermissionStatus.limited) {
        setState(() {
          _locationPermissionGranted = true;
        });

        Position currentLocation = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.high,
          ),
        );
        
        final latLng = LatLng(currentLocation.latitude, currentLocation.longitude);
        setState(() {
          _currentLat = latLng;
        });

        if (_googleMapController != null) {
          _googleMapController!.animateCamera(
            CameraUpdate.newCameraPosition(
              CameraPosition(target: latLng, zoom: 15),
            ),
          );
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print("Error initializing location: $e");
      }
    }
  }


  Future<void> _loadMapStyles() async {
    _darkStyle = await rootBundle.loadString('assets/map_styles/dark.json');
  }

  void _setMapStyle(Brightness brightness) {
    if (_googleMapController == null) return;

    if (brightness == Brightness.dark) {
      _googleMapController!.setMapStyle(_darkStyle);
    } else {
      _googleMapController!.setMapStyle(null); // default light style
    }
  }

  @override
  void didChangeDependencies() {
    // TODO: implement didChangeDependencies
    _setMapStyle(Theme.brightnessOf(context));
    super.didChangeDependencies();
  }

  @override
  void initState() {
    _loadMapStyles();
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _setMapStyle(Theme.brightnessOf(context));
      _initLocation();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Stack(
        clipBehavior: .antiAlias,
        children: [
          Center(
            child: GoogleMap(
              onTap: (latLng) {
                print(latLng);
              },
              indoorViewEnabled: true,
              colorScheme: .dark,
              initialCameraPosition: const CameraPosition(
                target: _fallbackLocation,
                zoom: 15
              ),
              myLocationEnabled: _locationPermissionGranted,
              myLocationButtonEnabled: false,
              zoomControlsEnabled: false,
              compassEnabled: false,
              mapToolbarEnabled: false,
              padding: .all(20),
              onMapCreated: (controller) {
                _googleMapController = controller;
                _setMapStyle(Theme.brightnessOf(context));
                if (_currentLat != null) {
                  _googleMapController!.animateCamera(
                    CameraUpdate.newCameraPosition(
                      CameraPosition(target: _currentLat!, zoom: 15),
                    ),
                    duration: const Duration(seconds: 10),
                  );
                }
              },
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(30.0),
            child: Align(
              alignment: .bottomRight,
              child: SizedBox(
                width: 50,
                height: 50,
                child: CNButton.icon(
                  config: CNButtonConfig(style: .glass),
                  onPressed: () {
                    if (_currentLat != null) {
                      _googleMapController?.animateCamera(
                        CameraUpdate.newCameraPosition(.new(target: _currentLat!, zoom: 18)),
                        duration: const Duration(seconds: 1),
                      );
                    }
                  },
                customIcon: Icons.location_on_rounded,
                ),
              ),
            ),
          ),

          ClipRRect(
            child: SizedBox(
              child: BackdropFilter(
                filter: .blur(sigmaX: 0, sigmaY: 0),
                child: Padding(
                  padding: EdgeInsets.only(top: widget.isDialog ?10:80, bottom: 60,left: 10,right: 10),
                  child: Row(
                    spacing: 15,
                    mainAxisSize: .min,
                    children: [
                      IconButton(
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                        icon: const Icon(Icons.close),
                      ).liquidGlass(),
                      Expanded(
                        child: ClipRRect(
                          borderRadius: .circular(30),
                          child: SearchBar(
                            hintText: "Search any places",
                            onChanged: (text) {
                              onSearchChanged(text);
                            },
                            shadowColor: const WidgetStatePropertyAll(Colors.transparent),
                            backgroundColor: WidgetStatePropertyAll(Theme.of(context).colorScheme.surfaceBright.withAlpha(0)),
                          ).liquidGlass(interactive: true),
                        ),
                      ),
                      IconButton(
                        onPressed: () {
                          context.pop();
                        },
                        icon: const Icon(Icons.check_rounded),
                      ).liquidGlass(),
                    ],
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
