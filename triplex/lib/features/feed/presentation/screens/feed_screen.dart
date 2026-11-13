import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:triplex/core/widgets/liquid_glass_shim.dart';
import 'package:triplex/features/feed/domain/notifiers/feed_notifier.dart';
import 'package:triplex/features/feed/domain/notifiers/feed_scroll_notifier.dart';
import 'package:triplex/features/feed/presentation/widgets/post_card.dart';

class FeedScreen extends ConsumerStatefulWidget {
  const FeedScreen({super.key});

  @override
  ConsumerState<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends ConsumerState<FeedScreen> {
  late ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = ref.read(feedScrollControllerProvider);
    _scrollController.addListener(_scrollListener);
  }

  void _scrollListener() {
    if (!_scrollController.hasClients) return;

    final offset = _scrollController.offset;
    final direction = _scrollController.position.userScrollDirection;

    if (direction == ScrollDirection.reverse) {
      ref.read(feedScrollMinimizedProvider.notifier).setMinimized(true);
    } else if (direction == ScrollDirection.forward) {
      ref.read(feedScrollMinimizedProvider.notifier).setMinimized(false);
    }

    if (offset <= 0) {
      ref.read(feedScrollMinimizedProvider.notifier).setMinimized(false);
    }
  }

  @override
  void dispose() {
    _scrollController.removeListener(_scrollListener);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final feedState = ref.watch(feedProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final screenSize = MediaQuery.of(context).size;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
          forceMaterialTransparency: true,
          centerTitle: true,
          title: Consumer(
            builder: (BuildContext context, WidgetRef ref, Widget? child) {
              final i = ref.watch(feedScrollMinimizedProvider);
              return AnimatedAlign(
                alignment: i ? Alignment.topRight : Alignment.center,
                duration: const Duration(milliseconds: 300),
                curve: Easing.emphasizedDecelerate,
                child: AnimatedScale(
                  duration: const Duration(milliseconds: 300),
                  curve: Easing.emphasizedDecelerate,
                  scale: i ? 0.6 : 1,
                  child: AnimatedSlide(
                    offset: i ? const Offset(0, -.4) : Offset.zero,
                    duration: const Duration(milliseconds: 300),
                    curve: Easing.emphasizedDecelerate,
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 8.0),
                      child: Text(
                        "Feed",
                        style: TextStyle(
                          fontFamily: "logo_font",
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ).liquidGlass(),
                  ),
                ),
              );
            },
          )),
      body: Stack(
        children: [
          // Main Feed Content
          Builder(
            builder: (context) {
              final posts = feedState.value;
              if (posts != null) {
                if (posts.isEmpty) {
                  return RefreshIndicator(
                    onRefresh: () =>
                        ref.read(feedProvider.notifier).refreshFeed(),
                    edgeOffset: AppBar().preferredSize.height + 40,
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Container(
                        height: screenSize.height,
                        alignment: Alignment.center,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.feed_outlined,
                              size: 64,
                              color: colorScheme.onSurface.withAlpha(80),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              "No posts in your feed yet",
                              style: theme.textTheme.titleMedium?.copyWith(
                                color: colorScheme.onSurface.withAlpha(150),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              "Trip plans created by you or others will appear here.",
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: colorScheme.onSurface.withAlpha(100),
                              ),
                            ),
                            const SizedBox(height: 24),
                            ElevatedButton(
                              onPressed: () =>
                                  ref.read(feedProvider.notifier).refreshFeed(),
                              child: const Text("Refresh"),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () =>
                      ref.read(feedProvider.notifier).refreshFeed(),
                  edgeOffset: AppBar().preferredSize.height + 40,
                  child: ShaderMask(
                    shaderCallback: (Rect bounds) {
                      return const LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment(0.0, -0.9),
                        colors: [Colors.transparent, Colors.white],
                        stops: [0.0, 1.0],
                      ).createShader(bounds);
                    },
                    blendMode: BlendMode.dstIn,
                    child: ListView.builder(
                      controller: _scrollController,
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: EdgeInsets.only(
                        top: AppBar().preferredSize.height + 50,
                        bottom: 100,
                      ),
                      itemCount: posts.length,
                      itemBuilder: (context, index) {
                        return PostCard(post: posts[index]);
                      },
                    ),
                  ),
                );
              }

              if (feedState.isLoading) {
                return const Center(
                  child: CircularProgressIndicator.adaptive(),
                );
              }

              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.error_outline_rounded,
                        size: 64,
                        color: colorScheme.error,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        "Failed to load feed",
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: colorScheme.error,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        feedState.error
                                ?.toString()
                                .replaceAll("Exception: ", "") ??
                            "Unknown error",
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: colorScheme.onSurface.withAlpha(150),
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: () =>
                            ref.read(feedProvider.notifier).refreshFeed(),
                        icon: const Icon(Icons.refresh_rounded),
                        label: const Text("Try Again"),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          RepaintBoundary(
            child: Stack(
              children: [
                ClipRect(
                    child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 2, sigmaY: 2),
                  child: SizedBox(
                    height: MediaQuery.paddingOf(context).top,
                    width: screenSize.width,
                  ),
                )),
              ],
            ),
          )
        ],
      ),
    );
  }
}
