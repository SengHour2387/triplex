import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:triplex/features/map/presentation/screens/google_webview_map.dart';
import 'package:triplex/features/map/presentation/screens/location_picker_screen.dart';
import 'package:triplex/features/map/presentation/screens/native_location_picker.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
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
        child: CustomScrollView(
          slivers: [
            CupertinoSliverNavigationBar(
              largeTitle: const Text("Discover"),
              backgroundColor:
                  Theme.of(context).colorScheme.surface.withAlpha(200),
              border: null,
            ),
            SliverFillRemaining(
              hasScrollBody: false,
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color:
                            Theme.of(context).colorScheme.primary.withAlpha(25),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        CupertinoIcons.map_fill,
                        size: 64,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      "Find Your Location",
                      style:
                          Theme.of(context).textTheme.headlineMedium?.copyWith(
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
                              color: Theme.of(context)
                                  .colorScheme
                                  .onSurface
                                  .withAlpha(220),
                            ),
                      ),
                    ),
                    const SizedBox(height: 32),
                    CupertinoButton.filled(
                      child: const Text("Explore Maps"),
                      onPressed: () {
                        showCupertinoSheet<bool>(
                          context: context, scrollableBuilder: (BuildContext context, ScrollController controller) {
      Widget widgetBuilder(BuildContext context) =>
                              const LocationPickerScreen(isDialog: true);
      return widgetBuilder(context);
    },
                        );
                      },
                    ),
                    const SizedBox(height: 16),
                    CupertinoButton.filled(
                      child: const Text("Places Info"),
                      onPressed: () {
                        showCupertinoSheet<bool>(
                          context: context, scrollableBuilder: (BuildContext context, ScrollController controller) {
      Widget widgetBuilder(BuildContext context) =>
                              const GoogleWebViewMap(isDialog: true);
      return widgetBuilder(context);
    },
                        );
                      },
                    ),
                    const SizedBox(height: 16),
                    CupertinoButton.filled(
                      child: const Text("Native Map"),
                      onPressed: () {
                        showCupertinoSheet<bool>(
                          context: context, scrollableBuilder: (BuildContext context, ScrollController controller) {
      Widget widgetBuilder(BuildContext context) =>
                              const NativeLocationPicker(isDialog: true);
      return widgetBuilder(context);
    },
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
