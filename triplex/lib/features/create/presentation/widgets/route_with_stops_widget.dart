import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:triplex/features/create/domain/stop_item_model.dart';
import 'package:triplex/features/create/presentation/widgets/route_shape_painter.dart';
import 'package:triplex/features/create/presentation/widgets/stop_item_widget.dart';

/// Draws the route shape on a canvas and positions [StopItemWidget]s at each
/// waypoint node using a [Stack] + [Positioned].
class RouteWithStopsWidget extends ConsumerWidget {
  final List<StopItemModel> stops;

  const RouteWithStopsWidget({required this.stops, super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Build LatLng list from stops that have coordinates.
    final validStops =
        stops.where((s) => s.latitude != null && s.longitude != null).toList();

    if (validStops.isEmpty) {
      return const SizedBox.shrink();
    }

    final routePoints =
        validStops.map((s) => LatLng(s.latitude!, s.longitude!)).toList();

    final bounds = routeBounds(routePoints);
    final linePoints =
        routePoints.map((p) => normalizePoint(p, bounds)).toList();
    final stopPoints =
        routePoints.map((p) => normalizePoint(p, bounds)).toList();

    // Label width used for positioning when flipped to the left side.
    const double labelWidth = 200;
    const double dotSize = 12;

    return LayoutBuilder(
      builder: (context, c) {
        final w = c.maxWidth;
        final h = c.maxHeight;
        return Stack(
          clipBehavior: Clip.none,
          children: [
            CustomPaint(
              size: Size(w, h),
              painter: RouteShapePainter(linePoints),
            ),
            for (var i = 0; i < validStops.length; i++)
              Positioned(
                // When the node is in the right half, shift left to make room
                // for the label that will appear on the left side of the dot.
                left: stopPoints[i].dx > 0.5
                    ? stopPoints[i].dx * w - labelWidth - dotSize - 4
                    : stopPoints[i].dx * w - dotSize / 2,
                top: stopPoints[i].dy * h - dotSize / 2,
                child: _StopNode(
                  stop: validStops[i],
                  index: stops.indexOf(validStops[i]),
                  alignLeft: stopPoints[i].dx > 0.5,
                ),
              ),
          ],
        );
      },
    );
  }
}

/// A node on the route canvas: a dot + the [StopItemWidget].
///
/// When [alignLeft] is true the label is placed to the left of the dot
/// so it doesn't overflow off the right edge of the screen.
class _StopNode extends StatelessWidget {
  final StopItemModel stop;
  final int index;
  final bool alignLeft;

  const _StopNode({
    required this.stop,
    required this.index,
    this.alignLeft = false,
  });

  @override
  Widget build(BuildContext context) {
    final dot = Container(
      width: 12,
      height: 12,
      decoration: const BoxDecoration(
        color: Colors.blue,
        shape: BoxShape.circle,
      ),
    );

    final label = SizedBox(
      width: 200,
      child: StopItemWidget(index: index),
    );

    // Flip order: label on left when node is near the right edge.
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: alignLeft
          ? [label, const SizedBox(width: 4), dot]
          : [dot, const SizedBox(width: 4), label],
    );
  }
}
