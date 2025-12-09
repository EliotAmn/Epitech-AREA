import 'package:flutter/material.dart';

class AppInputDecorations {
  static InputDecoration primary(BuildContext context, String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: Theme.of(context).textTheme.labelLarge?.copyWith(
            color: Theme.of(context).colorScheme.onSurface.withAlpha(100),
          ),
      border: OutlineInputBorder(
        borderRadius: const BorderRadius.all(Radius.circular(8)),
        borderSide: BorderSide(
          width: 3.0,
          style: BorderStyle.solid,
          color: Theme.of(context).colorScheme.onSurface,
        ),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: const BorderRadius.all(Radius.circular(8)),
        borderSide: BorderSide(
          width: 3.0,
          style: BorderStyle.solid,
          color: Theme.of(context).colorScheme.onSurface,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: const BorderRadius.all(Radius.circular(8)),
        borderSide: BorderSide(
          width: 3.0,
          style: BorderStyle.solid,
          color: Theme.of(context).colorScheme.primary,
        ),
      ),
    );
  }
}
