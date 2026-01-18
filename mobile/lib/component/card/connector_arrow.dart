import 'package:flutter/material.dart';

class ConnectorArrow extends StatelessWidget {
  final Color color;
  final bool show;

  const ConnectorArrow({super.key, required this.color, this.show = true});

  @override
  Widget build(BuildContext context) {
    if (!show) {
      return const SizedBox(height: 20);
    }

    return Center(
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 16),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(Icons.arrow_downward, size: 28, color: color),
      ),
    );
  }
}
