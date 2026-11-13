import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:triplex/core/widgets/liquid_glass_shim.dart';
import 'package:triplex/features/reactions/domain/models/reaction_model.dart';

class ReactionPickerPopup extends StatefulWidget {
  final Function(String type) onReactionSelected;
  final VoidCallback onDismiss;
  final String? currentReaction;

  const ReactionPickerPopup({
    super.key,
    required this.onReactionSelected,
    required this.onDismiss,
    this.currentReaction,
  });

  /// Helper to display reaction picker as a floating Overlay above an anchor widget
  static OverlayEntry? show({
    required BuildContext context,
    required GlobalKey anchorKey,
    required Function(String type) onReactionSelected,
    String? currentReaction,
  }) {
    final renderBox =
        anchorKey.currentContext?.findRenderObject() as RenderBox?;
    if (renderBox == null) return null;

    final offset = renderBox.localToGlobal(Offset.zero);
    final overlay = Overlay.of(context);

    OverlayEntry? entry;

    entry = OverlayEntry(
      builder: (context) {
        return Stack(
          children: [
            // Backdrop to catch taps outside and dismiss
            Positioned.fill(
              child: GestureDetector(
                behavior: HitTestBehavior.translucent,
                onTap: () {
                  entry?.remove();
                  entry = null;
                },
                child: const ColoredBox(color: Colors.transparent),
              ),
            ),
            // Floating Picker Widget
            Positioned(
              left: (offset.dx - 10)
                  .clamp(16.0, MediaQuery.of(context).size.width - 290),
              top: offset.dy - 64, // Positioned right above the anchor button
              child: Material(
                color: Colors.transparent,
                child: ReactionPickerPopup(
                  currentReaction: currentReaction,
                  onReactionSelected: (type) {
                    entry?.remove();
                    entry = null;
                    onReactionSelected(type);
                  },
                  onDismiss: () {
                    entry?.remove();
                    entry = null;
                  },
                ),
              ),
            ),
          ],
        );
      },
    );

    overlay.insert(entry!);
    HapticFeedback.mediumImpact();
    return entry;
  }

  @override
  State<ReactionPickerPopup> createState() => _ReactionPickerPopupState();
}

class _ReactionPickerPopupState extends State<ReactionPickerPopup> {
  String? _hoveredType;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: Platform.isIOS
            ? Colors.transparent
            : Theme.of(context).colorScheme.surfaceBright,
        borderRadius: BorderRadius.circular(32),
        boxShadow: Platform.isIOS
            ? []
            : [
                BoxShadow(
                  color: Colors.black.withAlpha(isDark ? 80 : 35),
                  blurRadius: 18,
                  offset: const Offset(0, 6),
                  spreadRadius: 2,
                ),
              ],
        border: Border.all(
          color:
              isDark ? Colors.white.withAlpha(20) : Colors.black.withAlpha(15),
          width: 0.5,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: ReactionTypes.activeReactions.map((reaction) {
            final isHovered = _hoveredType == reaction.type;
            final isSelected = widget.currentReaction == reaction.type;

            return GestureDetector(
              onTapDown: (_) {
                HapticFeedback.lightImpact();
                setState(() => _hoveredType = reaction.type);
              },
              onTapUp: (_) {
                widget.onReactionSelected(reaction.type);
              },
              onTapCancel: () {
                setState(() => _hoveredType = null);
              },
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 5),
                child: AnimatedScale(
                  scale: isHovered ? 1.45 : (isSelected ? 1.2 : 1.0),
                  duration: const Duration(milliseconds: 150),
                  curve: Curves.easeOutBack,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    transform: isHovered
                        ? Matrix4.translationValues(0.0, -6.0, 0.0)
                        : Matrix4.identity(),
                    child: Text(
                      reaction.emoji,
                      style: const TextStyle(
                        fontSize: 26,
                        height: 1.1,
                      ),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    )
        .liquidGlass(shape: LiquidGlassShape.rect, cornerRadius: 32)
        .animate()
        .scale(
          duration: 220.ms,
          curve: Curves.easeOutBack,
          begin: const Offset(0.3, 0.3),
        )
        .fadeIn(duration: 150.ms);
  }
}
