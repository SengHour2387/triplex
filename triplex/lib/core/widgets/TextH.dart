import 'package:flutter/material.dart';

// ---------------------------------------------------------- //
// ---------------------- BASE ENGINE ----------------------- //
// ---------------------------------------------------------- //

class _BaseText extends StatelessWidget {
  final String text;
  final TextStyle baseStyle;
  final EdgeInsetsGeometry padding;
  final TextAlign? textAlign;
  final Color? color;
  final FontWeight? fontWeight;
  final double? fontSize;
  final double? letterSpacing;
  final int? maxLines;
  final TextStyle? styleOverride;

  const _BaseText({
    required this.text,
    required this.baseStyle,
    required this.padding,
    this.textAlign,
    this.color,
    this.fontWeight,
    this.fontSize,
    this.letterSpacing,
    this.maxLines,
    this.styleOverride,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    final mergedStyle = baseStyle
        .copyWith(
      fontWeight: fontWeight ?? baseStyle.fontWeight,
      fontSize: fontSize ?? baseStyle.fontSize,
      letterSpacing: letterSpacing ?? baseStyle.letterSpacing,
      color: color ?? colorScheme.onSurface,
    )
        .merge(styleOverride);

    return Padding(
      padding: padding,
      child: Text(
        text,
        style: mergedStyle,
        textAlign: textAlign,
        maxLines: maxLines,
        overflow: maxLines != null ? TextOverflow.ellipsis : null,
      ),
    );
  }
}

// ---------------------------------------------------------- //
// ---------------------- TEXT PLAIN ------------------------ //
// ---------------------------------------------------------- //

class TextPlain extends StatelessWidget {
  final String text;
  final EdgeInsetsGeometry padding;
  final TextAlign? textAlign;
  final Color? color;
  final FontWeight? fontWeight;
  final double? fontSize;
  final double? letterSpacing;
  final int? maxLines;
  final TextStyle? styleOverride;

  const TextPlain(
      this.text, {
        super.key,
        this.padding = const EdgeInsets.symmetric(vertical: 4),
        this.textAlign,
        this.color,
        this.fontWeight = FontWeight.normal,
        this.fontSize = 14,
        this.letterSpacing,
        this.maxLines,
        this.styleOverride,
      });

  @override
  Widget build(BuildContext context) {
    return _BaseText(
      text: text,
      baseStyle: Theme.of(context).textTheme.bodyMedium!,
      padding: padding,
      textAlign: textAlign,
      color: color,
      fontWeight: fontWeight,
      fontSize: fontSize,
      letterSpacing: letterSpacing,
      maxLines: maxLines,
      styleOverride: styleOverride,
    );
  }
}

// ---------------------------------------------------------- //
// -------------------------- H6 ---------------------------- //
// ---------------------------------------------------------- //

class TextH6 extends StatelessWidget {
  final String text;
  final EdgeInsetsGeometry padding;
  final TextAlign? textAlign;
  final Color? color;
  final FontWeight? fontWeight;
  final double? fontSize;
  final double? letterSpacing;
  final int? maxLines;
  final TextStyle? styleOverride;

  const TextH6(
      this.text, {
        super.key,
        this.padding = const EdgeInsets.symmetric(vertical: 6),
        this.textAlign,
        this.color,
        this.fontWeight = FontWeight.normal,
        this.fontSize = 16,
        this.letterSpacing,
        this.maxLines,
        this.styleOverride,
      });

  @override
  Widget build(BuildContext context) {
    return _BaseText(
      text: text,
      baseStyle: Theme.of(context).textTheme.titleSmall!,
      padding: padding,
      textAlign: textAlign,
      color: color,
      fontWeight: fontWeight,
      fontSize: fontSize,
      letterSpacing: letterSpacing,
      maxLines: maxLines,
      styleOverride: styleOverride,
    );
  }
}

// ---------------------------------------------------------- //
// -------------------------- H5 ---------------------------- //
// ---------------------------------------------------------- //

class TextH5 extends StatelessWidget {
  final String text;
  final EdgeInsetsGeometry padding;
  final TextAlign? textAlign;
  final Color? color;
  final FontWeight? fontWeight;
  final double? fontSize;
  final double? letterSpacing;
  final int? maxLines;
  final TextStyle? styleOverride;

  const TextH5(
      this.text, {
        super.key,
        this.padding = const EdgeInsets.symmetric(vertical: 8),
        this.textAlign,
        this.color,
        this.fontWeight = FontWeight.w500,
        this.fontSize = 18,
        this.letterSpacing,
        this.maxLines,
        this.styleOverride,
      });

  @override
  Widget build(BuildContext context) {
    return _BaseText(
      text: text,
      baseStyle: Theme.of(context).textTheme.titleMedium!,
      padding: padding,
      textAlign: textAlign,
      color: color,
      fontWeight: fontWeight,
      fontSize: fontSize,
      letterSpacing: letterSpacing,
      maxLines: maxLines,
      styleOverride: styleOverride,
    );
  }
}

// ---------------------------------------------------------- //
// -------------------------- H4 ---------------------------- //
// ---------------------------------------------------------- //

class TextH4 extends StatelessWidget {
  final String text;
  final EdgeInsetsGeometry padding;
  final TextAlign? textAlign;
  final Color? color;
  final FontWeight? fontWeight;
  final double? fontSize;
  final double? letterSpacing;
  final int? maxLines;
  final TextStyle? styleOverride;

  const TextH4(
      this.text, {
        super.key,
        this.padding = const EdgeInsets.symmetric(vertical: 10),
        this.textAlign,
        this.color,
        this.fontWeight = FontWeight.w500,
        this.fontSize = 20,
        this.letterSpacing,
        this.maxLines,
        this.styleOverride,
      });

  @override
  Widget build(BuildContext context) {
    return _BaseText(
      text: text,
      baseStyle: Theme.of(context).textTheme.titleLarge!,
      padding: padding,
      textAlign: textAlign,
      color: color,
      fontWeight: fontWeight,
      fontSize: fontSize,
      letterSpacing: letterSpacing,
      maxLines: maxLines,
      styleOverride: styleOverride,
    );
  }
}

// ---------------------------------------------------------- //
// -------------------------- H3 ---------------------------- //
// ---------------------------------------------------------- //

class TextH3 extends StatelessWidget {
  final String text;
  final EdgeInsetsGeometry padding;
  final TextAlign? textAlign;
  final Color? color;
  final FontWeight? fontWeight;
  final double? fontSize;
  final double? letterSpacing;
  final int? maxLines;
  final TextStyle? styleOverride;

  const TextH3(
      this.text, {
        super.key,
        this.padding = const EdgeInsets.symmetric(vertical: 12),
        this.textAlign,
        this.color,
        this.fontWeight = FontWeight.w600,
        this.fontSize = 24,
        this.letterSpacing,
        this.maxLines,
        this.styleOverride,
      });

  @override
  Widget build(BuildContext context) {
    return _BaseText(
      text: text,
      baseStyle: Theme.of(context).textTheme.headlineSmall!,
      padding: padding,
      textAlign: textAlign,
      color: color,
      fontWeight: fontWeight,
      fontSize: fontSize,
      letterSpacing: letterSpacing,
      maxLines: maxLines,
      styleOverride: styleOverride,
    );
  }
}

// ---------------------------------------------------------- //
// -------------------------- H2 ---------------------------- //
// ---------------------------------------------------------- //

class TextH2 extends StatelessWidget {
  final String text;
  final EdgeInsetsGeometry padding;
  final TextAlign? textAlign;
  final Color? color;
  final FontWeight? fontWeight;
  final double? fontSize;
  final double? letterSpacing;
  final int? maxLines;
  final TextStyle? styleOverride;

  const TextH2(
      this.text, {
        super.key,
        this.padding = const EdgeInsets.symmetric(vertical: 14),
        this.textAlign,
        this.color,
        this.fontWeight = FontWeight.w600,
        this.fontSize = 28,
        this.letterSpacing,
        this.maxLines,
        this.styleOverride,
      });

  @override
  Widget build(BuildContext context) {
    return _BaseText(
      text: text,
      baseStyle: Theme.of(context).textTheme.headlineMedium!,
      padding: padding,
      textAlign: textAlign,
      color: color,
      fontWeight: fontWeight,
      fontSize: fontSize,
      letterSpacing: letterSpacing,
      maxLines: maxLines,
      styleOverride: styleOverride,
    );
  }
}

// ---------------------------------------------------------- //
// -------------------------- H1 ---------------------------- //
// ---------------------------------------------------------- //

class TextH1 extends StatelessWidget {
  final String text;
  final EdgeInsetsGeometry padding;
  final TextAlign? textAlign;
  final Color? color;
  final FontWeight? fontWeight;
  final double? fontSize;
  final double? letterSpacing;
  final int? maxLines;
  final TextStyle? styleOverride;

  const TextH1(
      this.text, {
        super.key,
        this.padding = const EdgeInsets.symmetric(vertical: 16),
        this.textAlign,
        this.color,
        this.fontWeight = FontWeight.bold,
        this.fontSize = 32,
        this.letterSpacing,
        this.maxLines,
        this.styleOverride,
      });

  @override
  Widget build(BuildContext context) {
    return _BaseText(
      text: text,
      baseStyle: Theme.of(context).textTheme.headlineLarge!,
      padding: padding,
      textAlign: textAlign,
      color: color,
      fontWeight: fontWeight,
      fontSize: fontSize,
      letterSpacing: letterSpacing,
      maxLines: maxLines,
      styleOverride: styleOverride,
    );
  }
}