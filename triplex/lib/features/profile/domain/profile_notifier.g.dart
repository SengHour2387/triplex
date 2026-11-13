// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'profile_notifier.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(ProfileNotifier)
const profileProvider = ProfileNotifierProvider._();

final class ProfileNotifierProvider
    extends $AsyncNotifierProvider<ProfileNotifier, UserModel?> {
  const ProfileNotifierProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'profileProvider',
          isAutoDispose: false,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$profileNotifierHash();

  @$internal
  @override
  ProfileNotifier create() => ProfileNotifier();
}

String _$profileNotifierHash() => r'b2c4b8a9dc38a4c5a55fd1ae2fd87483a5665b0e';

abstract class _$ProfileNotifier extends $AsyncNotifier<UserModel?> {
  FutureOr<UserModel?> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<AsyncValue<UserModel?>, UserModel?>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<AsyncValue<UserModel?>, UserModel?>,
        AsyncValue<UserModel?>,
        Object?,
        Object?>;
    element.handleValue(ref, created);
  }
}
