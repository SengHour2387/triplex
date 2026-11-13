import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:triplex/core/widgets/liquid_glass_shim.dart';
import 'package:triplex/features/auth/domain/auth_notifier.dart';
import 'package:triplex/features/comments/domain/models/comment_model.dart';
import 'package:triplex/features/comments/domain/notifiers/comments_notifier.dart';
import 'package:triplex/features/comments/presentation/widgets/comment_tile.dart';
import 'package:triplex/features/feed/domain/models/post_model.dart';
import 'package:triplex/features/feed/presentation/widgets/post_card.dart';

class PostDetailScreen extends ConsumerStatefulWidget {
  final PostModel post;

  const PostDetailScreen({super.key, required this.post});

  @override
  ConsumerState<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends ConsumerState<PostDetailScreen> {
  final TextEditingController _textController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  CommentModel? _replyTarget;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _textController.addListener(() {
      setState(() {});
    });
  }

  @override
  void dispose() {
    _textController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _setReplyTarget(CommentModel comment) {
    setState(() {
      _replyTarget = comment;
    });
    _focusNode.requestFocus();
  }

  void _cancelReply() {
    setState(() {
      _replyTarget = null;
    });
  }

  Future<void> _submitComment() async {
    final text = _textController.text.trim();
    if (text.isEmpty || _isSubmitting) return;

    setState(() => _isSubmitting = true);
    _textController.clear();

    try {
      final notifier = ref.read(
        commentsNotifierProvider(widget.post.id).notifier,
      );
      if (_replyTarget != null) {
        final parentId = _replyTarget!.parentCommentId ?? _replyTarget!.id;
        await notifier.addReply(parentId, text);
        _cancelReply();
      } else {
        await notifier.addComment(text);
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final commentsState = ref.watch(commentsNotifierProvider(widget.post.id));
    final currentUser = ref.watch(authProvider).value;

    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Scaffold(
      appBar: AppBar(title: const Text('Post'), scrolledUnderElevation: 0),
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: PostCard(
                  post: widget.post,
                  enableUserHero: false,
                  enableNavigation: false,
                ),
              ),
              SliverToBoxAdapter(
                child: Divider(
                  height: 1,
                  thickness: 1,
                  color: colorScheme.surfaceContainerHighest,
                ),
              ),
              commentsState.when(
                loading: () => const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator.adaptive()),
                ),
                error: (err, _) => SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Failed to load comments',
                          style: TextStyle(color: colorScheme.error),
                        ),
                        const SizedBox(height: 8),
                        TextButton(
                          onPressed: () => ref
                              .read(
                                commentsNotifierProvider(
                                  widget.post.id,
                                ).notifier,
                              )
                              .refresh(),
                          child: const Text('Try Again'),
                        ),
                      ],
                    ),
                  ),
                ),
                data: (comments) {
                  if (comments.isEmpty) {
                    return SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 40, bottom: 100),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.chat_bubble_outline_rounded,
                              size: 48,
                              color: colorScheme.onSurface.withAlpha(80),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'No comments yet',
                              style: theme.textTheme.titleSmall?.copyWith(
                                color: colorScheme.onSurface.withAlpha(150),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Be the first to share what you think!',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: colorScheme.onSurface.withAlpha(100),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  return SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      return Padding(
                        padding: EdgeInsets.only(
                          bottom: index == comments.length - 1
                              ? (bottomInset > 0 ? bottomInset + 100 : 100)
                              : 0,
                        ),
                        child: CommentTile(
                          key: ValueKey(comments[index].id),
                          comment: comments[index],
                          postId: widget.post.id,
                          onReply: _setReplyTarget,
                        ),
                      );
                    }, childCount: comments.length),
                  );
                },
              ),
            ],
          ),

          // Sticky Bottom Input Bar
          Align(
            alignment: Alignment.bottomCenter,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Replying Indicator Banner
                if (_replyTarget != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 6,
                    ),
                    color: colorScheme.surfaceContainerHighest.withAlpha(90),
                    child: Row(
                      children: [
                        Icon(
                          Icons.reply_rounded,
                          size: 16,
                          color: colorScheme.primary,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Replying to ',
                          style: TextStyle(
                            fontSize: 12,
                            color: colorScheme.onSurface.withAlpha(160),
                          ),
                        ),
                        Text(
                          '@${_replyTarget!.user.username}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: colorScheme.primary,
                          ),
                        ),
                        const Spacer(),
                        GestureDetector(
                          onTap: _cancelReply,
                          child: const Icon(Icons.close_rounded, size: 16),
                        ),
                      ],
                    ),
                  ),

                // Input Bar — same style as CommentsSheet
                Padding(
                  padding: EdgeInsets.only(
                    left: bottomInset > 0 ? 5 : 20,
                    right: bottomInset > 0 ? 5 : 20,
                    bottom: bottomInset > 0 ? bottomInset + 10 : 20,
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      // Current User Avatar
                      Padding(
                        padding: const EdgeInsets.all(2),
                        child: CircleAvatar(
                          radius: 18,
                          backgroundColor: colorScheme.surfaceContainerHighest,
                          backgroundImage: (currentUser?.avatarUrl != null &&
                                  currentUser!.avatarUrl!.isNotEmpty)
                              ? CachedNetworkImageProvider(
                                  currentUser.avatarUrl!)
                              : null,
                          child: (currentUser?.avatarUrl == null ||
                                  currentUser!.avatarUrl!.isEmpty)
                              ? Text(
                                  currentUser?.username.isNotEmpty == true
                                      ? currentUser!.username[0].toUpperCase()
                                      : 'U',
                                  style: TextStyle(
                                    color: colorScheme.primary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                )
                              : null,
                        ),
                      ),
                      const SizedBox(width: 8),

                      // Text Input
                      Expanded(
                        child: Container(
                          constraints: const BoxConstraints(maxHeight: 120),
                          padding: const EdgeInsets.symmetric(horizontal: 5),
                          child: TextField(
                            controller: _textController,
                            focusNode: _focusNode,
                            textInputAction: TextInputAction.newline,
                            keyboardType: TextInputType.multiline,
                            minLines: 1,
                            maxLines: 5,
                            scrollPhysics: const BouncingScrollPhysics(),
                            style: const TextStyle(fontSize: 14),
                            decoration: InputDecoration(
                              hintText: _replyTarget != null
                                  ? 'Reply to @${_replyTarget!.user.username}...'
                                  : 'Add a comment...',
                              hintStyle: TextStyle(
                                fontSize: 14,
                                color: colorScheme.onSurface.withAlpha(100),
                              ),
                              border: InputBorder.none,
                              isDense: true,
                              contentPadding: const EdgeInsets.symmetric(
                                vertical: 10,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),

                      // Send Button
                      Padding(
                        padding: const EdgeInsets.all(2),
                        child: SizedBox(
                          width: 36,
                          height: 36,
                          child: IconButton.filled(
                            style: IconButton.styleFrom(
                              backgroundColor:
                                  _textController.text.trim().isNotEmpty
                                      ? colorScheme.primary
                                      : colorScheme.surfaceContainerHighest,
                              foregroundColor:
                                  _textController.text.trim().isNotEmpty
                                      ? colorScheme.onPrimary
                                      : colorScheme.onSurface.withAlpha(80),
                              padding: EdgeInsets.zero,
                            ),
                            onPressed: _textController.text.trim().isNotEmpty &&
                                    !_isSubmitting
                                ? _submitComment
                                : null,
                            icon: _isSubmitting
                                ? SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator.adaptive(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        colorScheme.onPrimary,
                                      ),
                                    ),
                                  )
                                : const Icon(
                                    Icons.arrow_upward_rounded,
                                    size: 20,
                                  ),
                          ),
                        ),
                      ),
                    ],
                  ).liquidGlass(shape: LiquidGlassShape.rect, cornerRadius: 20),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
