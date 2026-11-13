import 'package:flutter/material.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'feed_scroll_notifier.g.dart';

@Riverpod(keepAlive: true)
ScrollController feedScrollController(Ref ref) {
  final controller = ScrollController();
  ref.onDispose(controller.dispose);
  return controller;
}

@riverpod
class FeedScrollMinimized extends _$FeedScrollMinimized {
  @override
  bool build() => false;

  void setMinimized(bool value) {
    if (state != value) {
      state = value;
    }
  }
}
