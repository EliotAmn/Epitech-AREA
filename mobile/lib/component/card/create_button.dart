import 'package:flutter/material.dart';

class CreateButton extends StatelessWidget {
  final VoidCallback onTap;
  final bool isEnabled;

  const CreateButton({super.key, required this.onTap, this.isEnabled = true});

  @override
  Widget build(BuildContext context) {
    if (!isEnabled) {
      return const SizedBox.shrink();
    }

    return Container(
      height: 60,
      decoration: BoxDecoration(
        color: Colors.green.shade600,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.green.withValues(alpha: 0.5),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Center(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.check_circle_outline, color: Colors.white, size: 28),
                const SizedBox(width: 12),
                Text(
                  'Create AREA',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
