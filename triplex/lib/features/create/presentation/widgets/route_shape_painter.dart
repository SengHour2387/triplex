import 'dart:math';

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

/// Bounding box for a set of geographic points.
class RouteBounds {
  final double minLat;
  final double maxLat;
  final double minLng;
  final double maxLng;
  final double range;
  RouteBounds(this.minLat, this.maxLat, this.minLng, this.maxLng)
      : range =
            max(maxLat - minLat, maxLng - minLng).clamp(1e-6, double.infinity);
}

/// Computes the bounding box of a list of [LatLng] points.
RouteBounds routeBounds(List<LatLng> points) {
  final lats = points.map((p) => p.latitude);
  final lngs = points.map((p) => p.longitude);
  return RouteBounds(
    lats.reduce(min),
    lats.reduce(max),
    lngs.reduce(min),
    lngs.reduce(max),
  );
}

/// Normalizes a single [LatLng] point into a 0–1 [Offset] within the given bounds.
Offset normalizePoint(LatLng p, RouteBounds b) {
  final x = 0.5 + (p.longitude - (b.minLng + b.maxLng) / 2) / b.range;
  final y = 0.5 -
      (p.latitude - (b.minLat + b.maxLat) / 2) /
          b.range; // flip: lat up = y down
  return Offset(x.clamp(0, 1), y.clamp(0, 1));
}

/// Normalizes a full route of [LatLng] points into 0–1 [Offset] values.
List<Offset> normalizeRoute(List<LatLng> points) {
  if (points.isEmpty) return [];
  final b = routeBounds(points);
  return points.map((p) => normalizePoint(p, b)).toList();
}

/// A [CustomPainter] that draws a polyline through normalized (0–1) points.
class RouteShapePainter extends CustomPainter {
  final List<Offset> points;
  RouteShapePainter(this.points);

  @override
  void paint(Canvas canvas, Size size) {
    if (points.length < 2) return;
    final paint = Paint()
      ..color = Colors.blue
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;

    final path = Path()
      ..moveTo(points.first.dx * size.width, points.first.dy * size.height);
    for (final p in points.skip(1)) {
      path.lineTo(p.dx * size.width, p.dy * size.height);
    }
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant RouteShapePainter old) => old.points != points;
}
