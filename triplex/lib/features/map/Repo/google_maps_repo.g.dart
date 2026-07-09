// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'google_maps_repo.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(googleMapsRepo)
const googleMapsRepoProvider = GoogleMapsRepoProvider._();

final class GoogleMapsRepoProvider
    extends $FunctionalProvider<GoogleMapsRepo, GoogleMapsRepo, GoogleMapsRepo>
    with $Provider<GoogleMapsRepo> {
  const GoogleMapsRepoProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'googleMapsRepoProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$googleMapsRepoHash();

  @$internal
  @override
  $ProviderElement<GoogleMapsRepo> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  GoogleMapsRepo create(Ref ref) {
    return googleMapsRepo(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(GoogleMapsRepo value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<GoogleMapsRepo>(value),
    );
  }
}

String _$googleMapsRepoHash() => r'c17438065fe1f30d190ca5be6140c66cb7a03f3c';
