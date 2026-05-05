import 'package:flutter/material.dart';

abstract class AppTheme {
  static const Color _primary = Color(0xFF7C3AED);

  // Dark tokens
  static const Color _darkBackground = Color(0xFF0A0A0F);
  static const Color _darkSurface = Color(0xFF12121F);

  // Light tokens
  static const Color _lightBackground = Color(0xFFF5F5FA);
  static const Color _lightSurface = Color(0xFFFFFFFF);

  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _primary,
          brightness: Brightness.dark,
          surface: _darkSurface,
        ),
        scaffoldBackgroundColor: _darkBackground,
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: _darkSurface,
          elevation: 0,
          height: 64,
          indicatorColor: _primary.withValues(alpha: 0.2),
          labelTextStyle: WidgetStateProperty.resolveWith((states) {
            final selected = states.contains(WidgetState.selected);
            return TextStyle(
              fontSize: 11,
              fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
              color: selected ? _primary : const Color(0xFF9CA3AF),
            );
          }),
          iconTheme: WidgetStateProperty.resolveWith((states) {
            final selected = states.contains(WidgetState.selected);
            return IconThemeData(
              color: selected ? _primary : const Color(0xFF6B7280),
              size: 24,
            );
          }),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: _darkSurface,
          elevation: 0,
          centerTitle: true,
        ),
        dividerTheme: const DividerThemeData(color: Color(0xFF1F1F2E)),
      );

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _primary,
          brightness: Brightness.light,
          surface: _lightSurface,
        ),
        scaffoldBackgroundColor: _lightBackground,
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: _lightSurface,
          elevation: 0,
          height: 64,
          indicatorColor: _primary.withValues(alpha: 0.15),
          labelTextStyle: WidgetStateProperty.resolveWith((states) {
            final selected = states.contains(WidgetState.selected);
            return TextStyle(
              fontSize: 11,
              fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
              color: selected ? _primary : const Color(0xFF6B7280),
            );
          }),
          iconTheme: WidgetStateProperty.resolveWith((states) {
            final selected = states.contains(WidgetState.selected);
            return IconThemeData(
              color: selected ? _primary : const Color(0xFF9CA3AF),
              size: 24,
            );
          }),
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: _lightSurface,
          elevation: 0,
          centerTitle: true,
          foregroundColor: const Color(0xFF111827),
          surfaceTintColor: Colors.transparent,
        ),
        dividerTheme: const DividerThemeData(color: Color(0xFFE5E7EB)),
      );
}
