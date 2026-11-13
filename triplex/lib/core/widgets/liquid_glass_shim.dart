import 'dart:io';
import 'dart:ui';

import 'package:flutter/widgets.dart';

/// Shape options for the liquid glass effect.
/// Replaces [CNGlassEffectShape] from cupertino_native_better.
enum LiquidGlassShape {
  /// Circular/pill shape (default).
  circle,

  /// Rectangular shape with rounded corners.
  rect,
}

/// Shim that provides a `.liquidGlass()` extension method for backward
/// compatibility with the old `cupertino_native_better` package.
///
/// On iOS it applies a frosted-glass blur (ClipRRect + BackdropFilter).
/// On other platforms it applies a lighter blur fallback.
///
/// This replaces the native Liquid Glass extension that was previously
/// provided by the `cupertino_native_better` plugin. If `adaptive_platform_ui`
/// adds a `.liquidGlass()` extension in the future, this file can be removed.
extension LiquidGlassShim on Widget {
  /// Wraps the widget in a frosted-glass blur effect.
  ///
  /// [shape] — `.rect` for rectangular containers, `.circle` for pill shapes.
  /// [cornerRadius] — border radius for the glass container.
  /// [interactive] — ignored for now, kept for API compatibility.
  /// [tint] — optional color overlay applied inside the glass.
  Widget liquidGlass({
    LiquidGlassShape shape = LiquidGlassShape.circle,
    double cornerRadius = 22,
    bool interactive = false,
    Color? tint,
  }) {
    final double sigma = Platform.isIOS ? 30 : 20;

    return ClipRRect(
      borderRadius: BorderRadius.circular(cornerRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: sigma, sigmaY: sigma),
        child: tint != null ? ColoredBox(color: tint, child: this) : this,
      ),
    );
  }
}
