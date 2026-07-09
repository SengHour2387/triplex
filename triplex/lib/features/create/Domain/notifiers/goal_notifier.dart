import 'package:currency_picker_plus/currency_picker_plus.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/features/create/Domain/stop_item_model.dart';
import 'package:triplex/features/map/Domain/POI_place.dart';
import 'package:triplex/features/map/Repo/google_maps_repo.dart';

part 'goal_notifier.g.dart';

@Riverpod(keepAlive: true)
class GoalNotifier extends _$GoalNotifier {
  @override
  StopItemModel build() => StopItemModel(title: "", role: StopType.end);

  Future<POIPlace> fetchPlaceDetails(String placeId, {LatLng? latLng}) async {
    final repo = ref.read(googleMapsRepoProvider);
    return repo.fetchPlaceDetails(placeId, latLng: latLng);
  }

  void setPOI(POIPlace poi) {
    state = StopItemModel(
      id: state.id,
      title: state.title,
      role: StopType.end,
      location: poi.name,
      placeId: poi.placeId,
      latitude: poi.latLng?.latitude,
      longitude: poi.latLng?.longitude,
      description: state.description,
      cost: state.cost,
      currency: state.currency,
      sortOrder: state.sortOrder,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    );
  }

  void setTitle(String title) {
    state = state.copyWith(title: title);
  }

  void setCost(double? cost) {
    state = state.copyWith(cost: cost);
  }

  void setCurrency(Currency currency) {
    state = state.copyWith(currency: currency.code);
  }

  void clearInput() {
    state = StopItemModel(title: "", role: StopType.end);
  }

  void clearLocation() {
    state = StopItemModel(
      id: state.id,
      title: state.title,
      role: StopType.end,
      description: state.description,
      cost: state.cost,
      currency: state.currency,
      sortOrder: state.sortOrder,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    );
  }
}
