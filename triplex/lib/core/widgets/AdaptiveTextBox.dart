import 'package:flutter/material.dart';

class AdaptiveTextBox extends StatelessWidget {
  final String hint;
  final EdgeInsets padding;
  final TextEditingController? controller;
  final int? maxLines;
  final bool readOnly;
  final VoidCallback? onTap;

  const AdaptiveTextBox({
    super.key,
    this.padding = const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
    this.hint = "",
    this.controller,
    this.maxLines,
    this.readOnly = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    final OutlineInputBorder border = OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: BorderSide(
        width: 1,
        color: colorScheme.outline.withAlpha(100),
      ),
    );

    return Padding(
      padding: padding,
      child: TextField(
        controller: controller,
        maxLines: maxLines ?? 3,
        readOnly: readOnly,
        onTap: onTap,
        decoration: InputDecoration(
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          hintText: hint,
          hintStyle: TextStyle(color: colorScheme.onSurfaceVariant.withAlpha(150)),
          filled: true,
          fillColor: colorScheme.surfaceContainerHighest.withAlpha(50),
          enabledBorder: border,
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(
              width: 2,
              color: colorScheme.primary,
            ),
          ),
        ),
      ),
    );
  }
}
