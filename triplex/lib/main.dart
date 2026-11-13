import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:liquid_glass_widgets/liquid_glass_widgets.dart';
import 'package:triplex/app.dart';
// import 'package:progressive_blur/progressive_blur.dart';
import 'package:triplex/core/cache/image_cache_config.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await LiquidGlassWidgets.initialize();

  // Pre-initialize the image cache manager singleton
  AppImageCacheManager();

  runApp(LiquidGlassWidgets.wrap(child: const ProviderScope(child: App())));
}
