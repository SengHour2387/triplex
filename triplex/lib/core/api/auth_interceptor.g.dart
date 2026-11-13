// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_interceptor.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(authInterceptor)
const authInterceptorProvider = AuthInterceptorProvider._();

final class AuthInterceptorProvider extends $FunctionalProvider<AuthInterceptor,
    AuthInterceptor, AuthInterceptor> with $Provider<AuthInterceptor> {
  const AuthInterceptorProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'authInterceptorProvider',
          isAutoDispose: false,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$authInterceptorHash();

  @$internal
  @override
  $ProviderElement<AuthInterceptor> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  AuthInterceptor create(Ref ref) {
    return authInterceptor(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(AuthInterceptor value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<AuthInterceptor>(value),
    );
  }
}

String _$authInterceptorHash() => r'c5d01c79eb38a07a45ce9544d97f1ad4f8a012a5';
