import 'dart:io';

import 'package:image_picker/image_picker.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/core/media_optimizer/post_image_optimizer.dart';
import 'package:triplex/features/create/data/trip_plan_repo.dart';
import 'package:triplex/features/create/domain/notifiers/create_media_notifier.dart';
import 'package:triplex/features/create/domain/notifiers/goal_notifier.dart';
import 'package:triplex/features/create/domain/notifiers/way_point_notifier.dart';
import 'package:triplex/features/create/domain/stop_item_model.dart';
import 'package:triplex/features/create/domain/trip_plan_model.dart';
import 'package:triplex/features/profile/domain/draft_trip_plans_notifier.dart';

part 'create_trip_plan_notifier.g.dart';

@Riverpod(keepAlive: true)
class CreateTripPlanNotifier extends _$CreateTripPlanNotifier {
  @override
  TripPlanModel build() {
    return TripPlanModel(
      title: "",
      caption: "",
      waypoints: [],
      end: StopItemModel(title: '', role: StopType.end),
    );
  }

  void setStart(StopItemModel start) {
    state = state.copyWith(start: start.copyWith(role: StopType.start));
  }

  void setGoal() {
    if (ref.read(goalProvider).title.isEmpty) {
      throw Exception("Please give your destination a name");
    }
    state = state.copyWith(
        end: ref.read(goalProvider).copyWith(role: StopType.end));
  }

  void clearGoal() {
    state = state.copyWith(end: StopItemModel(title: '', role: StopType.end));
  }

  void onTitleChange(String title) {
    state = state.copyWith(title: title);
  }

  void addWaypoint() {
    final waypoint = ref
        .read(wayPointProvider)
        .copyWith(sortOrder: state.waypoints.length + 1);

    if (waypoint.title.isEmpty) {
      throw Exception("Waypoint title cannot be empty");
    }

    state = state.copyWith(waypoints: [...state.waypoints, waypoint]);
  }

  void removeWaypoint(int sortOrder) {
    state = state.copyWith(
      waypoints: [...state.waypoints]
        ..removeWhere((w) => w.sortOrder == sortOrder),
    );
  }

  void updateWaypoint(int sortOrder, StopItemModel updatedWaypoint) {
    state = state.copyWith(
      waypoints: [
        for (final w in state.waypoints)
          if (w.sortOrder == sortOrder) updatedWaypoint else w,
      ],
    );
  }

  void reset() {
    state = TripPlanModel(
      title: "",
      caption: "",
      waypoints: [],
      end: StopItemModel(title: '', role: StopType.end),
    );
  }

  Future<void> saveTripPlan(
      {required String title, required String caption}) async {
    if (title.trim().isEmpty) {
      throw Exception("Please give your trip a title");
    }
    if (state.end == null || state.end!.title.isEmpty) {
      throw Exception("Please set your goal/destination stop");
    }

    final fullTripPlan = state.copyWith(
      title: title.trim(),
      caption: caption.trim().isEmpty ? null : caption.trim(),
    );

    final repo = ref.read(tripPlanRepoProvider);
    await repo.saveTripPlan(fullTripPlan);
    await ref.read(draftTripPlansProvider.notifier).addDraft(fullTripPlan);
    reset();
  }

  Future<void> postTripPlan(
      {required String title, required String caption}) async {
    if (title.trim().isEmpty) {
      throw Exception("Please give your trip a title");
    }
    if (state.end == null || state.end!.title.isEmpty) {
      throw Exception("Please set your goal/destination stop");
    }

    final fullTripPlan = state.copyWith(
      title: title.trim(),
      caption: caption.trim().isEmpty ? null : caption.trim(),
    );

    final repo = ref.read(tripPlanRepoProvider);
    await repo.postTripPlan(fullTripPlan, caption.trim());
    reset();
  }

  Future<void> createFullPost({
    required String title,
    required String caption,
    required List<XFile> mediaFiles,
    required bool includeTripPlan,
  }) async {
    final hasPlan = includeTripPlan &&
        title.trim().isNotEmpty &&
        (state.end != null && state.end!.title.isNotEmpty);
    final hasMedia = mediaFiles.isNotEmpty;

    if (!hasPlan && !hasMedia) {
      if (title.trim().isEmpty &&
          (state.end == null || state.end!.title.isEmpty)) {
        throw Exception(
            "Please enter trip plan details or select media to post.");
      }
      if (state.end == null || state.end!.title.isEmpty) {
        throw Exception(
            "Please set your destination goal stop for the trip plan.");
      }
    }

    String type;
    TripPlanModel? fullTripPlan;

    if (hasPlan && hasMedia) {
      type = 'trip_plan_media';
      fullTripPlan = state.copyWith(
        title: title.trim(),
        caption: caption.trim().isEmpty ? null : caption.trim(),
      );
    } else if (hasPlan) {
      type = 'trip_plan';
      fullTripPlan = state.copyWith(
        title: title.trim(),
        caption: caption.trim().isEmpty ? null : caption.trim(),
      );
    } else {
      type = 'media';
      fullTripPlan = null;
    }

    // Optimize media files before uploading
    final List<XFile> optimizedFiles = [];
    for (final file in mediaFiles) {
      final optimized =
          await PostImageOptimizer.optimizeForPost(File(file.path));
      optimizedFiles.add(optimized != null ? XFile(optimized.path) : file);
    }

    final repo = ref.read(tripPlanRepoProvider);
    await repo.createPost(
      type: type,
      caption: caption.trim(),
      tripPlan: fullTripPlan,
      mediaFiles: optimizedFiles,
    );

    reset();
    ref.read(createMediaProvider.notifier).reset();
  }
}
