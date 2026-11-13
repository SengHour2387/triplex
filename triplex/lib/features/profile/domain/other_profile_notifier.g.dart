// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'other_profile_notifier.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(OtherProfileNotifier)
const otherProfileProvider = OtherProfileNotifierFamily._();

final class OtherProfileNotifierProvider
    extends $AsyncNotifierProvider<OtherProfileNotifier, UserProfileModel?> {
  const OtherProfileNotifierProvider._({
    required OtherProfileNotifierFamily super.from,
    required String super.argument,
  }) : super(
          retry: null,
          name: r'otherProfileProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$otherProfileNotifierHash();

  @override
  String toString() {
    return r'otherProfileProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  OtherProfileNotifier create() => OtherProfileNotifier();

  @override
  bool operator ==(Object other) {
    return other is OtherProfileNotifierProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$otherProfileNotifierHash() =>
    r'ca98ecebbc9ce58e158a54563d0e39164298328c';

final class OtherProfileNotifierFamily extends $Family
    with
        $ClassFamilyOverride<
            OtherProfileNotifier,
            AsyncValue<UserProfileModel?>,
            UserProfileModel?,
            FutureOr<UserProfileModel?>,
            String> {
  const OtherProfileNotifierFamily._()
      : super(
          retry: null,
          name: r'otherProfileProvider',
          dependencies: null,
          $allTransitiveDependencies: null,
          isAutoDispose: true,
        );

  OtherProfileNotifierProvider call(String userId) =>
      OtherProfileNotifierProvider._(argument: userId, from: this);

  @override
  String toString() => r'otherProfileProvider';
}

abstract class _$OtherProfileNotifier
    extends $AsyncNotifier<UserProfileModel?> {
  late final _$args = ref.$arg as String;
  String get userId => _$args;

  FutureOr<UserProfileModel?> build(String userId);
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build(_$args);
    final ref =
        this.ref as $Ref<AsyncValue<UserProfileModel?>, UserProfileModel?>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<AsyncValue<UserProfileModel?>, UserProfileModel?>,
        AsyncValue<UserProfileModel?>,
        Object?,
        Object?>;
    element.handleValue(ref, created);
  }
}

@ProviderFor(OtherUserPostsNotifier)
const otherUserPostsProvider = OtherUserPostsNotifierFamily._();

final class OtherUserPostsNotifierProvider
    extends $AsyncNotifierProvider<OtherUserPostsNotifier, List<PostModel>> {
  const OtherUserPostsNotifierProvider._({
    required OtherUserPostsNotifierFamily super.from,
    required String super.argument,
  }) : super(
          retry: null,
          name: r'otherUserPostsProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$otherUserPostsNotifierHash();

  @override
  String toString() {
    return r'otherUserPostsProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  OtherUserPostsNotifier create() => OtherUserPostsNotifier();

  @override
  bool operator ==(Object other) {
    return other is OtherUserPostsNotifierProvider &&
        other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$otherUserPostsNotifierHash() =>
    r'ea42bb88b4835d1e0d206c701c17dd38bbffe085';

final class OtherUserPostsNotifierFamily extends $Family
    with
        $ClassFamilyOverride<
            OtherUserPostsNotifier,
            AsyncValue<List<PostModel>>,
            List<PostModel>,
            FutureOr<List<PostModel>>,
            String> {
  const OtherUserPostsNotifierFamily._()
      : super(
          retry: null,
          name: r'otherUserPostsProvider',
          dependencies: null,
          $allTransitiveDependencies: null,
          isAutoDispose: true,
        );

  OtherUserPostsNotifierProvider call(String userId) =>
      OtherUserPostsNotifierProvider._(argument: userId, from: this);

  @override
  String toString() => r'otherUserPostsProvider';
}

abstract class _$OtherUserPostsNotifier
    extends $AsyncNotifier<List<PostModel>> {
  late final _$args = ref.$arg as String;
  String get userId => _$args;

  FutureOr<List<PostModel>> build(String userId);
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build(_$args);
    final ref = this.ref as $Ref<AsyncValue<List<PostModel>>, List<PostModel>>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<AsyncValue<List<PostModel>>, List<PostModel>>,
        AsyncValue<List<PostModel>>,
        Object?,
        Object?>;
    element.handleValue(ref, created);
  }
}
