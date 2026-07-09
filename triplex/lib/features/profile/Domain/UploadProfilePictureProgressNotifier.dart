import 'dart:async';

import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'UploadProfilePictureProgressNotifier.g.dart';

@riverpod
class UploadProfilePictureProgressNotifier extends _$UploadProfilePictureProgressNotifier {
  Timer? _timer;

  @override
  int? build() {
    return null;
  }

  void update( int progress ) {
    _timer?.cancel();
    _timer = Timer(Duration(milliseconds: 800), () {
    state = progress.clamp(0, 100);
    });
  }

  void reset() {
    _timer?.cancel();
    state = null;
  }

}