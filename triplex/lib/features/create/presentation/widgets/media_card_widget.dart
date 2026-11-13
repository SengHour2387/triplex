import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:triplex/core/widgets/fullscreen_image_viewer.dart';

class MediaCardWidget extends StatefulWidget {
  final Function()? onPressRemove;
  final String path;
  const MediaCardWidget({super.key, required this.path, this.onPressRemove});

  @override
  State<MediaCardWidget> createState() => _MediaCardWidgetState();
}

class _MediaCardWidgetState extends State<MediaCardWidget> {
  bool isClicked = false;

  String get _heroTag => 'media_card_${widget.path}';

  @override
  Widget build(BuildContext context) {
    return Padding(
        padding: const EdgeInsets.all(5.0),
        child: Stack(
          alignment: Alignment.center,
          children: [
            AnimatedScale(
              scale: isClicked ? 0.9 : 1,
              duration: const Duration(milliseconds: 300),
              curve: Easing.emphasizedDecelerate,
              child: GestureDetector(
                onTap: () {
                  if (isClicked) {
                    setState(() {
                      isClicked = false;
                    });
                  } else {
                    showFullScreenImageViewer(
                      context,
                      images: [widget.path],
                      heroTags: [_heroTag],
                    );
                  }
                },
                onLongPress: () {
                  setState(() {
                    isClicked = !isClicked;
                  });
                },
                child: Hero(
                  tag: _heroTag,
                  child: AnimatedContainer(
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surfaceBright,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    duration: const Duration(milliseconds: 800),
                    curve: Easing.emphasizedDecelerate,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: Image.file(File(widget.path), fit: BoxFit.contain),
                    ),
                  ),
                ),
              ),
            ),
            Center(
              child: AnimatedScale(
                scale: isClicked ? 1 : 0,
                curve: Easing.emphasizedDecelerate,
                duration: const Duration(milliseconds: 300),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.fullscreen_rounded, color: Colors.white),
                      onPressed: () {
                        showFullScreenImageViewer(
                          context,
                          images: [widget.path],
                          heroTags: [_heroTag],
                        );
                      },
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.remove_rounded, color: CupertinoColors.destructiveRed),
                      onPressed: () {
                        widget.onPressRemove?.call();
                      },
                    ),
                  ],
                ),
              ),
            )
          ],
        ));
  }
}
