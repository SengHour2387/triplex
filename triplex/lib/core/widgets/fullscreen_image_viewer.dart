import 'dart:io';
import 'dart:ui';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

/// Opens a fullscreen image viewer.
/// The [heroTag] is the tag of the source cell Hero.
/// The fullscreen page expands that cell to fill the screen,
/// then fades in the actual contain-fit image on top.
void showFullScreenImageViewer(
  BuildContext context, {
  required List<String> images,
  int initialIndex = 0,
  List<String>? heroTags,
}) {
  if (images.isEmpty) return;

  Navigator.of(context).push(
    PageRouteBuilder(
      opaque: false,
      barrierColor: Colors.transparent,
      transitionDuration: const Duration(milliseconds: 380),
      reverseTransitionDuration: const Duration(milliseconds: 320),
      pageBuilder: (context, animation, secondaryAnimation) {
        return FullScreenImageViewer(
          images: images,
          initialIndex: initialIndex < images.length ? initialIndex : 0,
          heroTags: heroTags,
          routeAnimation: animation,
        );
      },
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return child;
      },
    ),
  );
}

class FullScreenImageViewer extends StatefulWidget {
  final List<String> images;
  final int initialIndex;
  final List<String>? heroTags;
  final Animation<double> routeAnimation;

  const FullScreenImageViewer({
    super.key,
    required this.images,
    this.initialIndex = 0,
    this.heroTags,
    required this.routeAnimation,
  });

  @override
  State<FullScreenImageViewer> createState() => _FullScreenImageViewerState();
}

class _FullScreenImageViewerState extends State<FullScreenImageViewer>
    with SingleTickerProviderStateMixin {
  late PageController _pageController;
  late int _currentIndex;
  final Map<int, TransformationController> _transformationControllers = {};

  double _dragOffsetY = 0.0;
  bool _isDragging = false;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    for (final c in _transformationControllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  TransformationController _getTransformationController(int index) {
    return _transformationControllers.putIfAbsent(
      index,
      () => TransformationController(),
    );
  }

  void _resetZoom(int index) {
    _transformationControllers[index]?.value = Matrix4.identity();
  }

  bool _isLocalFile(String path) =>
      !path.startsWith('http://') && !path.startsWith('https://');

  Widget _buildNetworkOrFile(String path, {BoxFit fit = BoxFit.contain}) {
    if (_isLocalFile(path)) {
      return Image.file(File(path),
          fit: fit, errorBuilder: (_, __, ___) => const _BrokenImage());
    }
    return CachedNetworkImage(
      imageUrl: path,
      fit: fit,
      placeholder: (_, __) =>
          const Center(child: CircularProgressIndicator(color: Colors.white70)),
      errorWidget: (_, __, ___) => const _BrokenImage(),
    );
  }

  String? _heroTagAt(int index) {
    if (widget.heroTags != null && index < widget.heroTags!.length) {
      return widget.heroTags![index];
    }
    return null;
  }

  void _onVerticalDragUpdate(DragUpdateDetails d) {
    final ctrl = _transformationControllers[_currentIndex];
    if (ctrl != null && ctrl.value != Matrix4.identity()) return;
    setState(() {
      _isDragging = true;
      _dragOffsetY += d.delta.dy;
    });
  }

  void _onVerticalDragEnd(DragEndDetails d) {
    if (!_isDragging) return;
    final vel = d.velocity.pixelsPerSecond.dy;
    if (_dragOffsetY.abs() > 100 || vel.abs() > 500) {
      Navigator.of(context).pop();
    } else {
      setState(() {
        _dragOffsetY = 0.0;
        _isDragging = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final dragRatio = (_dragOffsetY.abs() / 500).clamp(0.0, 1.0);
    final bgAlpha = (160 * (1.0 - dragRatio * 1.4)).clamp(0.0, 160.0).round();
    final blurSigma = (20.0 * (1.0 - dragRatio * 1.2)).clamp(0.0, 20.0);
    final imageScale = (1.0 - dragRatio * 0.35).clamp(0.65, 1.0);

    return AnimatedBuilder(
      animation: widget.routeAnimation,
      builder: (context, child) {
        final routeT = widget.routeAnimation.value;
        final effectiveBlur = _isDragging ? blurSigma : 20.0 * routeT;
        final effectiveAlpha = _isDragging ? bgAlpha : (160 * routeT).round();

        return BackdropFilter(
          filter:
              ImageFilter.blur(sigmaX: effectiveBlur, sigmaY: effectiveBlur),
          child: ColoredBox(
            color: Colors.black.withAlpha(effectiveAlpha),
            child: child,
          ),
        );
      },
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Stack(
            children: [
              // ── Image pager ──────────────────────────────────────────
              GestureDetector(
                onVerticalDragUpdate: _onVerticalDragUpdate,
                onVerticalDragEnd: _onVerticalDragEnd,
                behavior: HitTestBehavior.translucent,
                child: Transform.translate(
                  offset: Offset(0, _dragOffsetY),
                  child: Transform.scale(
                    scale: imageScale,
                    child: PageView.builder(
                      controller: _pageController,
                      itemCount: widget.images.length,
                      onPageChanged: (i) => setState(() {
                        _resetZoom(_currentIndex);
                        _currentIndex = i;
                      }),
                      itemBuilder: (context, index) {
                        final path = widget.images[index];
                        final tag = _heroTagAt(index);
                        final ctrl = _getTransformationController(index);

                        Widget imageContent = _buildNetworkOrFile(path);

                        if (tag != null) {
                          imageContent = Hero(
                            tag: tag,
                            flightShuttleBuilder: (
                              flightCtx,
                              anim,
                              direction,
                              fromCtx,
                              toCtx,
                            ) {
                              return AnimatedBuilder(
                                animation: anim,
                                builder: (ctx, _) {
                                  final t =
                                      direction == HeroFlightDirection.push
                                          ? anim.value
                                          : 1.0 - anim.value;
                                  return ClipRRect(
                                    borderRadius: BorderRadius.lerp(
                                      BorderRadius.circular(14),
                                      BorderRadius.zero,
                                      t,
                                    )!,
                                    child: _buildNetworkOrFile(path,
                                        fit: BoxFit.cover),
                                  );
                                },
                              );
                            },
                            child: imageContent,
                          );
                        }

                        return GestureDetector(
                          onDoubleTap: () {
                            if (ctrl.value != Matrix4.identity()) {
                              ctrl.value = Matrix4.identity();
                            } else {
                              ctrl.value = Matrix4.identity()..scale(2.5);
                            }
                          },
                          child: SizedBox.expand(
                            child: InteractiveViewer(
                              transformationController: ctrl,
                              maxScale: 4.0,
                              child: Center(
                                child: imageContent,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ),

              // ── Top bar ──────────────────────────────────────────────
              Positioned(
                top: 10,
                left: 16,
                right: 16,
                child: FadeTransition(
                  opacity: widget.routeAnimation,
                  child: AnimatedOpacity(
                    duration: const Duration(milliseconds: 150),
                    opacity: _isDragging
                        ? (1.0 - dragRatio * 2).clamp(0.0, 1.0)
                        : 1.0,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        IconButton(
                          style: IconButton.styleFrom(
                            backgroundColor: Colors.black45,
                            shape: const CircleBorder(),
                          ),
                          icon: const Icon(Icons.close_rounded,
                              color: Colors.white, size: 24),
                          onPressed: () => Navigator.of(context).pop(),
                        ),
                        if (widget.images.length > 1)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.black45,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              "${_currentIndex + 1} / ${widget.images.length}",
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BrokenImage extends StatelessWidget {
  const _BrokenImage();
  @override
  Widget build(BuildContext context) => const Icon(
        Icons.broken_image_rounded,
        color: Colors.white54,
        size: 64,
      );
}
