import 'package:currency_picker_plus/currency_picker_plus.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/features/create/Domain/stop_item_model.dart';
import 'package:triplex/features/map/Domain/POI_place.dart';
import 'package:triplex/features/map/Repo/google_maps_repo.dart';

part 'way_point_notifier.g.dart';

@Riverpod(keepAlive: true)
class WayPointNotifier extends _$WayPointNotifier {
  @override
  StopItemModel build() => StopItemModel(title: "");

  Future<POIPlace> fetchPlaceDetails(String placeId, {LatLng? latLng}) async {
    final repo = ref.read(googleMapsRepoProvider);
    return repo.fetchPlaceDetails(placeId, latLng: latLng);
  }

  void setPOI(POIPlace poi) {
    state = StopItemModel(
      id: state.id,
      title: state.title,
      role: state.role,
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

  void setSortOrder(int sortOrder) {
    state = state.copyWith(sortOrder: sortOrder);
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
    state = StopItemModel(title: "");
  }

  void clearLocation() {
    state = StopItemModel(
      id: state.id,
      title: state.title,
      role: state.role,
      description: state.description,
      cost: state.cost,
      currency: state.currency,
      sortOrder: state.sortOrder,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    );
  }

  void loadFromStopItem(StopItemModel item) {
    state = item.copyWith();
  }
}
