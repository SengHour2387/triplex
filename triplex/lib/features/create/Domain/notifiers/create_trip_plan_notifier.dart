import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/features/create/Domain/stop_item_model.dart';
import 'package:triplex/features/create/Domain/trip_plan_model.dart';
import 'package:triplex/features/create/Domain/notifiers/goal_notifier.dart';
import 'package:triplex/features/create/Domain/notifiers/way_point_notifier.dart';

part 'create_trip_plan_notifier.g.dart';

@Riverpod(keepAlive: true)
class CreateTripPlanNotifier extends _$CreateTripPlanNotifier {
  @override
  TripPlanModel build() {
    return TripPlanModel(
      title: "",
      caption: "",
      waypoints: [],
      end: StopItemModel(title: '', role: .end),
    );
  }

  void setStart(StopItemModel start) {
    state = state.copyWith(start: start.copyWith(role: .start));
  }

  void setGoal() {
    if (ref.read(goalProvider).title.isEmpty) {
      throw Exception("Please give your destination a name");
    }
    state = state.copyWith(end: ref.read(goalProvider).copyWith(role: .end));
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
      start: null,
      waypoints: [],
      end: StopItemModel(title: ''),
    );
  }
}
