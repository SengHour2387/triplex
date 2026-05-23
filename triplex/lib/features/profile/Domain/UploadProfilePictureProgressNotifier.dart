import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'UploadProfilePictureProgressNotifier.g.dart';

@riverpod
class UploadProfilePictureProgressNotifier extends _$UploadProfilePictureProgressNotifier {
  @override
  int? build() {
    return null;
  }

  void update( int progress ) {
    state = progress;
  }

  void reset() {
    state = null;
  }



}