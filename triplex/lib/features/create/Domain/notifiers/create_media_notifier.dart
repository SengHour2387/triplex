import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

class CreateMediaState {
  final List<XFile> mediaFiles;
  final bool includeTripPlan;

  CreateMediaState({
    this.mediaFiles = const [],
    this.includeTripPlan = true,
  });

  CreateMediaState copyWith({
    List<XFile>? mediaFiles,
    bool? includeTripPlan,
  }) {
    return CreateMediaState(
      mediaFiles: mediaFiles ?? this.mediaFiles,
      includeTripPlan: includeTripPlan ?? this.includeTripPlan,
    );
  }
}

class CreateMediaNotifier extends Notifier<CreateMediaState> {
  @override
  CreateMediaState build() {
    return CreateMediaState();
  }

  void addImage(XFile image) {
    state = state.copyWith(
      mediaFiles: [...state.mediaFiles, image],
    );
  }

  void removeImageAt(int index) {
    if (index >= 0 && index < state.mediaFiles.length) {
      final updated = [...state.mediaFiles]..removeAt(index);
      state = state.copyWith(mediaFiles: updated);
    }
  }

  void toggleIncludeTripPlan(bool value) {
    state = state.copyWith(includeTripPlan: value);
  }

  void reset() {
    state = CreateMediaState();
  }
}

final createMediaProvider =
    NotifierProvider<CreateMediaNotifier, CreateMediaState>(
  CreateMediaNotifier.new,
);
