import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/router/app_router.dart';

class App extends ConsumerWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {

    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'Triplex',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: const ColorScheme(
          brightness: Brightness.light,
          primary: Color(0xFF000000),
          onPrimary: Color(0xFFFFFFFF),
          secondary: Color(0xFF666666),
          onSecondary: Color(0xFFFFFFFF),
          surface: Color(0xFFF2F2F2),
          surfaceBright:  Color(0xFFFFFFFF),
          onSurface: Color(0xFF000000),
          error: Color(0xFFB00020),
          onError: Color(0xFFFFFFFF),
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: const ColorScheme(
          brightness: Brightness.dark,
          primary: Color(0xFFFFFFFF),
          onPrimary: Color(0xFF000000),
          secondary: Color(0xFFAAAAAA),
          onSecondary: Color(0xFF000000),
          surface: Color(0xFF000000),
          onSurface: Color(0xFFFFFFFF),
          error: Color(0xFFCF6679),
          onError: Color(0xFF000000),
        ),
      ),
      themeMode: ThemeMode.system,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
