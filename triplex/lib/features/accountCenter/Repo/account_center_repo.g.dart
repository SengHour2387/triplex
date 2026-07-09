// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'account_center_repo.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(accountCenterRepo)
const accountCenterRepoProvider = AccountCenterRepoProvider._();

final class AccountCenterRepoProvider
    extends
        $FunctionalProvider<
          AccountCenterRepo,
          AccountCenterRepo,
          AccountCenterRepo
        >
    with $Provider<AccountCenterRepo> {
  const AccountCenterRepoProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'accountCenterRepoProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$accountCenterRepoHash();

  @$internal
  @override
  $ProviderElement<AccountCenterRepo> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  AccountCenterRepo create(Ref ref) {
    return accountCenterRepo(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(AccountCenterRepo value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<AccountCenterRepo>(value),
    );
  }
}

String _$accountCenterRepoHash() => r'026062a5bb1bc5da31d0e7ee83bb5da465079586';
