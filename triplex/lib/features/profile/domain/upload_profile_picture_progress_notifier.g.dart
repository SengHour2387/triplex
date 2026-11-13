// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'upload_profile_picture_progress_notifier.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(UploadProfilePictureProgressNotifier)
const uploadProfilePictureProgressProvider =
    UploadProfilePictureProgressNotifierProvider._();

final class UploadProfilePictureProgressNotifierProvider
    extends $NotifierProvider<UploadProfilePictureProgressNotifier, int?> {
  const UploadProfilePictureProgressNotifierProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'uploadProfilePictureProgressProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() =>
      _$uploadProfilePictureProgressNotifierHash();

  @$internal
  @override
  UploadProfilePictureProgressNotifier create() =>
      UploadProfilePictureProgressNotifier();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(int? value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<int?>(value),
    );
  }
}

String _$uploadProfilePictureProgressNotifierHash() =>
    r'66c0c86a45c118a613644e77f49d967cda2d28f8';

abstract class _$UploadProfilePictureProgressNotifier extends $Notifier<int?> {
  int? build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<int?, int?>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<int?, int?>, int?, Object?, Object?>;
    element.handleValue(ref, created);
  }
}
