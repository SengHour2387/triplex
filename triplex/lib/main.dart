import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
// import 'package:progressive_blur/progressive_blur.dart';

import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // await ProgressiveBlurWidget.precache();

  runApp(const ProviderScope(child: App()));
}
