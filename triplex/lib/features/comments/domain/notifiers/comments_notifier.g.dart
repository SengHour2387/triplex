// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'comments_notifier.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(CommentsNotifier)
const commentsProvider = CommentsNotifierFamily._();

final class CommentsNotifierProvider
    extends $AsyncNotifierProvider<CommentsNotifier, List<CommentModel>> {
  const CommentsNotifierProvider._({
    required CommentsNotifierFamily super.from,
    required String super.argument,
  }) : super(
          retry: null,
          name: r'commentsProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$commentsNotifierHash();

  @override
  String toString() {
    return r'commentsProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  CommentsNotifier create() => CommentsNotifier();

  @override
  bool operator ==(Object other) {
    return other is CommentsNotifierProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$commentsNotifierHash() => r'2a01fc9458567560dc7f11c68bd3e6247643ffb2';

final class CommentsNotifierFamily extends $Family
    with
        $ClassFamilyOverride<CommentsNotifier, AsyncValue<List<CommentModel>>,
            List<CommentModel>, FutureOr<List<CommentModel>>, String> {
  const CommentsNotifierFamily._()
      : super(
          retry: null,
          name: r'commentsProvider',
          dependencies: null,
          $allTransitiveDependencies: null,
          isAutoDispose: true,
        );

  CommentsNotifierProvider call(String postId) =>
      CommentsNotifierProvider._(argument: postId, from: this);

  @override
  String toString() => r'commentsProvider';
}

abstract class _$CommentsNotifier extends $AsyncNotifier<List<CommentModel>> {
  late final _$args = ref.$arg as String;
  String get postId => _$args;

  FutureOr<List<CommentModel>> build(String postId);
  @$mustCallSuper
  @override
  void runBuild() {
    final created = build(_$args);
    final ref =
        this.ref as $Ref<AsyncValue<List<CommentModel>>, List<CommentModel>>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<AsyncValue<List<CommentModel>>, List<CommentModel>>,
        AsyncValue<List<CommentModel>>,
        Object?,
        Object?>;
    element.handleValue(ref, created);
  }
}
