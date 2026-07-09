// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ProfileRepo.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(profileRepo)
const profileRepoProvider = ProfileRepoProvider._();

final class ProfileRepoProvider
    extends $FunctionalProvider<ProfileRepo, ProfileRepo, ProfileRepo>
    with $Provider<ProfileRepo> {
  const ProfileRepoProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'profileRepoProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$profileRepoHash();

  @$internal
  @override
  $ProviderElement<ProfileRepo> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  ProfileRepo create(Ref ref) {
    return profileRepo(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(ProfileRepo value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<ProfileRepo>(value),
    );
  }
}

String _$profileRepoHash() => r'755b3f3923379bc5d3c9c04d0e56c1897a38d899';
