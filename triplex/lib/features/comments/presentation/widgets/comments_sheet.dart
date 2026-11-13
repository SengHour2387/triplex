import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:triplex/core/widgets/liquid_glass_shim.dart';
import 'package:triplex/features/auth/domain/auth_notifier.dart';
import 'package:triplex/features/comments/domain/models/comment_model.dart';
import 'package:triplex/features/comments/domain/notifiers/comments_notifier.dart';
import 'package:triplex/features/comments/presentation/widgets/comment_tile.dart';

class CommentsSheet extends ConsumerStatefulWidget {
  final String postId;

  const CommentsSheet({
    super.key,
    required this.postId,
  });

  static Future<void> show(BuildContext context, String postId) {
    return showModalBottomSheet(
      context: context,
      useRootNavigator: true,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CommentsSheet(postId: postId),
    );
  }

  @override
  ConsumerState<CommentsSheet> createState() => _CommentsSheetState();
}

class _CommentsSheetState extends ConsumerState<CommentsSheet> {
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
      final notifier =
          ref.read(commentsNotifierProvider(widget.postId).notifier);
      if (_replyTarget != null) {
        // If target is already a reply, use its parent ID if available, otherwise target's ID
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
    final commentsState = ref.watch(commentsNotifierProvider(widget.postId));
    final currentUser = ref.watch(authProvider).value;

    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Stack(
        children: [
          Column(
            children: [
              // Drag Handle
              const SizedBox(height: 20),
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: colorScheme.onSurface.withAlpha(60),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Header
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Comments',
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: colorScheme.onSurface,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, size: 20),
                      onPressed: () => Navigator.of(context).pop(),
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ),
              ),
              // Comments List
              Expanded(
                child: commentsState.when(
                  loading: () =>
                      const Center(child: CircularProgressIndicator.adaptive()),
                  error: (err, _) => Center(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
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
                                .read(commentsNotifierProvider(widget.postId)
                                    .notifier)
                                .refresh(),
                            child: const Text('Try Again'),
                          ),
                        ],
                      ),
                    ),
                  ),
                  data: (comments) {
                    if (comments.isEmpty) {
                      return Center(
                        child: ListView(
                          padding: EdgeInsets.only(
                              bottom: bottomInset > 0 ? bottomInset + 30 : 30),
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
                      );
                    }

                    return RefreshIndicator(
                      onRefresh: () => ref
                          .read(
                              commentsNotifierProvider(widget.postId).notifier)
                          .refresh(),
                      child: ListView.builder(
                        padding: EdgeInsets.only(
                            bottom: bottomInset > 0 ? bottomInset + 100 : 100),
                        itemCount: comments.length,
                        itemBuilder: (context, index) {
                          return CommentTile(
                            key: ValueKey(comments[index].id),
                            comment: comments[index],
                            postId: widget.postId,
                            onReply: _setReplyTarget,
                          );
                        },
                      ),
                    );
                  },
                ),
              ),

              // Replying Indicator Banner
              if (_replyTarget != null)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
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
            ],
          ),
          // Sticky Bottom Input Bar
          Align(
            alignment: Alignment.bottomCenter,
            child: Padding(
              padding: EdgeInsets.only(
                  left: bottomInset > 0 ? 5 : 20,
                  right: bottomInset > 0 ? 5 : 20,
                  bottom: bottomInset > 0 ? bottomInset + 10 : 20),
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
                          ? CachedNetworkImageProvider(currentUser.avatarUrl!)
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
                          contentPadding:
                              const EdgeInsets.symmetric(vertical: 10),
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
          ),
        ],
      ),
    );
  }
}
