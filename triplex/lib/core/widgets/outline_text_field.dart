import 'package:flutter/material.dart';

class OutlineTextField extends StatelessWidget {
  final TextInputType textInputType;
  final TextInputAction? textInputAction;
  final TextEditingController? controller;

  final bool hide;
  final Widget? label;
  final String? hint;
  final bool readOnly;
  final VoidCallback? onTap;
  final EdgeInsets padding;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final bool borderless;

  const OutlineTextField({
    super.key,
    this.hide = false,
    this.textInputType = TextInputType.text,
    this.textInputAction,
    this.label,
    this.hint,
    this.controller,
    this.readOnly = false,
    this.onTap,
    this.onChanged,
    this.onSubmitted,
    this.borderless = false,
    this.padding = const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    if (borderless) {
      return Padding(
        padding: padding,
        child: TextField(
          obscureText: hide,
          controller: controller,
          textInputAction: textInputAction,
          keyboardType: textInputType,
          onSubmitted: onSubmitted,
          readOnly: readOnly,
          onChanged: onChanged,
          onTap: onTap,
          decoration: InputDecoration(
            isDense: true,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            label: label,
            hintText: hint,
            hintStyle:
                TextStyle(color: colorScheme.onSurfaceVariant.withAlpha(150)),
            border: InputBorder.none,
            filled: false,
          ),
        ),
      );
    }

    final OutlineInputBorder enabledBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: BorderSide(
        color: colorScheme.outline.withAlpha(100),
      ),
    );

    final OutlineInputBorder focusedBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: BorderSide(
        width: 2,
        color: colorScheme.primary,
      ),
    );

    final OutlineInputBorder errorBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: BorderSide(
        color: colorScheme.error,
      ),
    );

    return Padding(
      padding: padding,
      child: TextField(
        obscureText: hide,
        controller: controller,
        textInputAction: textInputAction,
        keyboardType: textInputType,
        onSubmitted: onSubmitted,
        readOnly: readOnly,
        onChanged: onChanged,
        onTap: onTap,
        decoration: InputDecoration(
          isDense: true,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          label: label,
          hintText: hint,
          hintStyle:
              TextStyle(color: colorScheme.onSurfaceVariant.withAlpha(150)),
          filled: true,
          fillColor: colorScheme.surfaceContainerHighest.withAlpha(50),
          enabledBorder: enabledBorder,
          focusedBorder: focusedBorder,
          errorBorder: errorBorder,
          focusedErrorBorder: errorBorder.copyWith(
            borderSide: BorderSide(width: 2, color: colorScheme.error),
          ),
        ),
      ),
    );
  }
}
