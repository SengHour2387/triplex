// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'secure_storage.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(SecureStorage)
const secureStorageProvider = SecureStorageProvider._();

final class SecureStorageProvider
    extends $NotifierProvider<SecureStorage, FlutterSecureStorage> {
  const SecureStorageProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'secureStorageProvider',
          isAutoDispose: false,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$secureStorageHash();

  @$internal
  @override
  SecureStorage create() => SecureStorage();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(FlutterSecureStorage value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<FlutterSecureStorage>(value),
    );
  }
}

String _$secureStorageHash() => r'34b97256cb9efc97ca96826a8d5481bb3841e67b';

abstract class _$SecureStorage extends $Notifier<FlutterSecureStorage> {
  FlutterSecureStorage build();
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build();
    final ref = this.ref as $Ref<FlutterSecureStorage, FlutterSecureStorage>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<FlutterSecureStorage, FlutterSecureStorage>,
        FlutterSecureStorage,
        Object?,
        Object?>;
    element.handleValue(ref, created);
  }
}
