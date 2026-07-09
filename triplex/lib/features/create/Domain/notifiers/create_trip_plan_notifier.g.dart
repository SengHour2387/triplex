// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_trip_plan_notifier.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(CreateTripPlanNotifier)
const createTripPlanProvider = CreateTripPlanNotifierProvider._();

final class CreateTripPlanNotifierProvider
    extends $NotifierProvider<CreateTripPlanNotifier, TripPlanModel> {
  const CreateTripPlanNotifierProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'createTripPlanProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$createTripPlanNotifierHash();

  @$internal
  @override
  CreateTripPlanNotifier create() => CreateTripPlanNotifier();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(TripPlanModel value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<TripPlanModel>(value),
    );
  }
}

String _$createTripPlanNotifierHash() =>
    r'951224155f72af63f6e0df6c78b09f776c75ddb6';

abstract class _$CreateTripPlanNotifier extends $Notifier<TripPlanModel> {
  TripPlanModel build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<TripPlanModel, TripPlanModel>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<TripPlanModel, TripPlanModel>,
              TripPlanModel,
              Object?,
              Object?
            >;
    element.handleValue(ref, created);
  }
}
