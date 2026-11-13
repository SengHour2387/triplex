// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'draft_trip_plans_notifier.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(DraftTripPlansNotifier)
const draftTripPlansProvider = DraftTripPlansNotifierProvider._();

final class DraftTripPlansNotifierProvider extends $AsyncNotifierProvider<
    DraftTripPlansNotifier, List<TripPlanModel>> {
  const DraftTripPlansNotifierProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'draftTripPlansProvider',
          isAutoDispose: false,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$draftTripPlansNotifierHash();

  @$internal
  @override
  DraftTripPlansNotifier create() => DraftTripPlansNotifier();
}

String _$draftTripPlansNotifierHash() =>
    r'd92df3e2e3268ea72cb15797239afd3d8510c231';

abstract class _$DraftTripPlansNotifier
    extends $AsyncNotifier<List<TripPlanModel>> {
  FutureOr<List<TripPlanModel>> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref =
        this.ref as $Ref<AsyncValue<List<TripPlanModel>>, List<TripPlanModel>>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<AsyncValue<List<TripPlanModel>>, List<TripPlanModel>>,
        AsyncValue<List<TripPlanModel>>,
        Object?,
        Object?>;
    element.handleValue(ref, created);
  }
}
