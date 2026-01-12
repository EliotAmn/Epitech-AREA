import 'package:flutter/material.dart';

class CardButton extends StatelessWidget {
  final String label;
  final NetworkImage? icon;
  final VoidCallback onTap;
  final double height;
  final double elevation;
  final Color color;
  final Color? textColor;
  final dynamic children;
  final bool? isRow;

  const CardButton({
    super.key,
    required this.label,
    this.icon,
    required this.onTap,
    required this.color,
    this.textColor,
    this.height = 150,
    this.elevation = 4,
    this.children,
    this.isRow = false,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: elevation,
      margin: const EdgeInsets.all(8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: Colors.transparent,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [color, color.withValues(alpha: 0.7)],
          ),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            width: double.infinity,
            height: height,
            padding: const EdgeInsets.all(16),
            child: isRow == true ? Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null) Image(image:  icon!, width: 40, height: 40, color: textColor),
                const SizedBox(height: 0),
                Text(
                  label,
                  style: Theme.of(
                    context,
                  ).textTheme.bodyLarge?.copyWith(color: textColor),
                ),
                if (children != null) ...[
                  const SizedBox(height: 8),
                  children,
                ],
              ],
            ) : Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null) Image(image:  icon!, width: 40, height: 40, color: textColor),
                const SizedBox(height: 8),
                Text(
                  label,
                  textAlign: TextAlign.center,
                  style: Theme.of(
                    context,
                  ).textTheme.bodyLarge?.copyWith(color: textColor),
                ),
                if (children != null) ...[
                  const SizedBox(height: 8),
                  children,
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
