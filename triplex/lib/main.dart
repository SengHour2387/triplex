import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:progressive_blur/progressive_blur.dart';

import 'app.dart';

Future<void> main() async {
  await ProgressiveBlurWidget.precache();
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: App()));
}
