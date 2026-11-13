// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'trip_plan_repo.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(tripPlanRepo)
const tripPlanRepoProvider = TripPlanRepoProvider._();

final class TripPlanRepoProvider
    extends $FunctionalProvider<TripPlanRepo, TripPlanRepo, TripPlanRepo>
    with $Provider<TripPlanRepo> {
  const TripPlanRepoProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'tripPlanRepoProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$tripPlanRepoHash();

  @$internal
  @override
  $ProviderElement<TripPlanRepo> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  TripPlanRepo create(Ref ref) {
    return tripPlanRepo(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(TripPlanRepo value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<TripPlanRepo>(value),
    );
  }
}

String _$tripPlanRepoHash() => r'acd78f1da9c70fbd4c877cc6d3d94e044a7a1ab7';
