import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:triplex/core/widgets/fullscreen_image_viewer.dart';

/// Horizontal-scroll media carousel — inspired by Meta Threads & Pitch.
///
/// • Single image  → plain 16:10 card (no dots, no peek).
/// • 2+ images     → PageView with a right-side peek of the next image,
///                   dot indicators, and smooth page snapping.
/// • Tapping any image opens [FullscreenImageViewer] at the correct index.
class MediaGrid extends StatefulWidget {
  final List<String>? mediaUrls;
  final int defaultCount;

  /// Unique prefix for Hero tags to avoid collisions between different posts.
  final String heroTagPrefix;

  const MediaGrid({
    super.key,
    this.mediaUrls,
    this.defaultCount = 0,
    this.heroTagPrefix = 'media_grid',
  });

  @override
  State<MediaGrid> createState() => _MediaGridState();
}

class _MediaGridState extends State<MediaGrid> {
  late final PageController _pageController;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    // viewportFraction < 1 creates the peek-next-card effect
    _pageController = PageController(viewportFraction: 0.92);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  String _heroTag(int index, String? url) =>
      '${widget.heroTagPrefix}_${index}_${url ?? ''}';

  void _openFullscreen(BuildContext context, List<String> urls, int index) {
    if (urls.isEmpty) return;
    final heroTags = List.generate(urls.length, (i) => _heroTag(i, urls[i]));
    showFullScreenImageViewer(
      context,
      images: urls,
      initialIndex: index < urls.length ? index : 0,
      heroTags: heroTags,
    );
  }

  Widget _buildImageCard({
    required BuildContext context,
    required ColorScheme colorScheme,
    required String? url,
    required int index,
    required List<String> allUrls,
    BorderRadius? borderRadius,
  }) {
    Widget imageWidget;
    if (url != null && url.isNotEmpty) {
      imageWidget = CachedNetworkImage(
        imageUrl: url,
        fit: BoxFit.cover,
        placeholder: (context, url) => Container(
          color: colorScheme.surfaceContainerHighest.withAlpha(180),
        ),
        errorWidget: (context, url, error) => ColoredBox(
          color: const Color(0xFFECECEC),
          child: Icon(
            Icons.broken_image_rounded,
            color: colorScheme.onSurface.withAlpha(80),
          ),
        ),
      );
    } else {
      imageWidget = Container(color: const Color(0xFFF2F2F2));
    }

    final tag = _heroTag(index, url);

    return GestureDetector(
      onTap: () => _openFullscreen(context, allUrls, index),
      child: Hero(
        tag: tag,
        child: ClipRRect(
          borderRadius: borderRadius ?? BorderRadius.circular(14),
          child: imageWidget,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final urls = widget.mediaUrls ?? [];
    final count = urls.isNotEmpty ? urls.length : widget.defaultCount;

    if (count <= 0) return const SizedBox.shrink();

    // ── Single image: simple 16:10 card, no carousel chrome ──────────────
    if (count == 1) {
      return AspectRatio(
        aspectRatio: 16 / 10,
        child: _buildImageCard(
          context: context,
          colorScheme: colorScheme,
          url: urls.isNotEmpty ? urls[0] : null,
          index: 0,
          allUrls: urls,
        ),
      );
    }

    // ── Multiple images: horizontal PageView carousel ─────────────────────
    return Column(
      children: [
        AspectRatio(
          aspectRatio: 16 / 10,
          child: PageView.builder(
            controller: _pageController,
            itemCount: urls.length,
            onPageChanged: (page) => setState(() => _currentPage = page),
            itemBuilder: (context, index) {
              final isLast = index == urls.length - 1;
              return Padding(
                // Right padding creates the peek gap between cards
                padding: EdgeInsets.only(right: isLast ? 0 : 8),
                child: _buildImageCard(
                  context: context,
                  colorScheme: colorScheme,
                  url: index < urls.length ? urls[index] : null,
                  index: index,
                  allUrls: urls,
                ),
              );
            },
          ),
        ),

        // ── Animated pill dot indicators ───────────────────────────────
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(urls.length, (i) {
            final isActive = i == _currentPage;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeOut,
              width: isActive ? 18 : 6,
              height: 6,
              margin: const EdgeInsets.symmetric(horizontal: 2.5),
              decoration: BoxDecoration(
                color: isActive
                    ? colorScheme.primary
                    : colorScheme.onSurface.withAlpha(55),
                borderRadius: BorderRadius.circular(3),
              ),
            );
          }),
        ),
      ],
    );
  }
}
