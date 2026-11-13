import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/svg.dart';
import 'package:triplex/core/toast/toast_provider.dart';
import 'package:triplex/core/widgets/liquid_glass_shim.dart';
import 'package:triplex/features/feed/domain/models/post_model.dart';
import 'package:triplex/features/feed/domain/notifiers/feed_notifier.dart';
import 'package:triplex/features/feed/presentation/widgets/embedded_post_card.dart';

class RepostBottomSheet extends ConsumerStatefulWidget {
  final PostModel post;

  const RepostBottomSheet({
    super.key,
    required this.post,
  });

  static Future<void> show(BuildContext context, PostModel post) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useRootNavigator: true,
      backgroundColor: Colors.transparent,
      builder: (context) => RepostBottomSheet(post: post),
    );
  }

  @override
  ConsumerState<RepostBottomSheet> createState() => _RepostBottomSheetState();
}

class _RepostBottomSheetState extends ConsumerState<RepostBottomSheet> {
  final TextEditingController _captionController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _captionController.dispose();
    super.dispose();
  }

  Future<void> _handleRepost() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final caption = _captionController.text.trim();
      await ref.read(feedProvider.notifier).repostPost(widget.post.id,
          caption: caption.isNotEmpty ? caption : null);

      if (mounted) {
        ref.read(toastProvider.notifier).showSuccess("Reposted successfully");
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ref
            .read(toastProvider.notifier)
            .showError(e.toString().replaceAll("Exception: ", ""));
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    // If the post being reposted is already a repost, embed its root original post
    final targetPostToEmbed = widget.post.repostedPost ?? widget.post;

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => FocusManager.instance.primaryFocus?.unfocus(),
      child: Container(
        decoration: BoxDecoration(
          color: Platform.isIOS
              ? Colors.transparent
              : Theme.of(context).colorScheme.surfaceBright,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SingleChildScrollView(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top drag indicator
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
                const SizedBox(height: 12),

                // Title row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        SvgPicture.asset(
                          'assets/icons/clone_outline.svg',
                          width: 20,
                          height: 20,
                          colorFilter: ColorFilter.mode(
                            colorScheme.primary,
                            BlendMode.srcIn,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Repost',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: colorScheme.onSurface,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, size: 20),
                      onPressed: () {
                        FocusManager.instance.primaryFocus?.unfocus();
                        Navigator.of(context).pop();
                      },
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Caption text input
                TextField(
                  controller: _captionController,
                  maxLines: 3,
                  minLines: 1,
                  textCapitalization: TextCapitalization.sentences,
                  decoration: InputDecoration(
                    hintText: 'Add your thoughts (optional)...',
                    hintStyle: TextStyle(
                      color: colorScheme.onSurface.withAlpha(120),
                      fontSize: 14,
                    ),
                    filled: true,
                    fillColor: isDark
                        ? colorScheme.surfaceContainerHighest.withAlpha(50)
                        : colorScheme.surfaceContainerHighest.withAlpha(60),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 14),

                // Embedded Preview
                Text(
                  'Original Post Preview',
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: colorScheme.onSurface.withAlpha(140),
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 6),
                EmbeddedPostCard(post: targetPostToEmbed),
                const SizedBox(height: 16),

                // Repost Button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: FilledButton(
                    onPressed: _isLoading ? null : _handleRepost,
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Repost Now',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
                const SizedBox(
                  height: 10,
                )
              ],
            ),
          ),
        ),
      ).liquidGlass(shape: LiquidGlassShape.rect, cornerRadius: 32),
    );
  }
}
