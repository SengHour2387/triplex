import 'package:flutter/material.dart';

class OutlineTextField extends StatelessWidget {
  final TextInputType textInputType;
  final TextEditingController? controller;
  final bool hide;
  final Widget? label;

  const OutlineTextField({
    super.key,
    this.hide = false,
    this.textInputType = TextInputType.text,
    this.label,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    final OutlineInputBorder normalBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(20),
      borderSide: BorderSide(
        width: 0.5,
        color: Theme.of(context).colorScheme.secondary,
      ),
    );

    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: TextField(
        obscureText: hide,
        controller: controller,
        keyboardType: textInputType,
        decoration: InputDecoration(
          contentPadding: const EdgeInsets.symmetric(horizontal: 8),
          label: label,
          enabledBorder: normalBorder,
          focusedBorder: normalBorder,
          border: normalBorder,
        ),
      ),
    );
  }
}
