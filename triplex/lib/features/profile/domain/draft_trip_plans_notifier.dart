import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/features/create/data/trip_plan_repo.dart';
import 'package:triplex/features/create/domain/trip_plan_model.dart';

part 'draft_trip_plans_notifier.g.dart';

@Riverpod(keepAlive: true)
class DraftTripPlansNotifier extends _$DraftTripPlansNotifier {
  @override
  FutureOr<List<TripPlanModel>> build() {
    return _fetchDrafts();
  }

  Future<List<TripPlanModel>> _fetchDrafts() {
    final repo = ref.read(tripPlanRepoProvider);
    return repo.getSavedTripPlans();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _fetchDrafts());
  }

  Future<void> addDraft(TripPlanModel draft) async {
    final currentList = state.value ?? [];
    state = AsyncData([draft, ...currentList]);
    final updated = await _fetchDrafts();
    if (updated.isNotEmpty) {
      state = AsyncData(updated);
    }
  }

  Future<void> removeDraft(TripPlanModel draft) async {
    final previousList = state.value ?? [];
    state = AsyncData(
      previousList
          .where((item) =>
              item != draft && (draft.id == null || item.id != draft.id))
          .toList(),
    );
    if (draft.id != null) {
      try {
        await ref.read(tripPlanRepoProvider).deleteSavedTripPlan(draft.id!);
      } catch (e) {
        state = AsyncData(previousList);
        rethrow;
      }
    }
  }
}
