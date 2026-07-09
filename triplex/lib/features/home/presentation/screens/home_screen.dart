
import 'dart:ffi';

import 'package:cupertino_native_better/cupertino_native.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:triplex/features/map/location_picker_screen.dart';
import 'package:triplex/features/map/google_webview_map.dart';
import 'package:triplex/features/map/native_location_picker.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      extendBodyBehindAppBar: true,
      appBar:AppBar(
        title:  Text("Discover"),
        centerTitle: true,
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Theme.of(context).colorScheme.surface,
              Theme.of(context).colorScheme.surface.withAlpha(200),
            ],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withAlpha(25),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.map_rounded,
                  size: 64,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                "Find Your Location",
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      letterSpacing: -0.5,
                    ),
              ),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Text(
                  "Select a destination on the map to begin your journey.",
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurface.withAlpha(150),
                      ),
                ),
              ),
              const SizedBox(height: 32),

              CNButton(
                config: CNButtonConfig(shrinkWrap: true,style: .prominentGlass),
                label: "Explore Maps",
                icon: CNSymbol("mappin",size: 16),
                onPressed: () {
                  showCupertinoSheet<Bool>(
                      enableDrag: false,
                      context: context,
                      builder: (context) => const LocationPickerScreen(isDialog: true)
                  );
                },
              ),
              const SizedBox(height: 16),
              CNButton(
                config: const CNButtonConfig(shrinkWrap: true, style: .prominentGlass),
                label: "Places Info",
                icon: const CNSymbol("map", size: 16),
                onPressed: () {
                  showCupertinoSheet<bool>(
                      enableDrag: false,
                      context: context,
                      builder: (context) => const GoogleWebViewMap(isDialog: true)
                  );
                },
              ),
              const SizedBox(height: 16),
              CNButton(
                config: const CNButtonConfig(shrinkWrap: true, style: .prominentGlass),
                label: "Native Map",
                icon: const CNSymbol("location", size: 16),
                onPressed: () {
                  showCupertinoSheet<bool>(
                      enableDrag: false,
                      context: context,
                      builder: (context) => NativeLocationPicker(isDialog: true)
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

