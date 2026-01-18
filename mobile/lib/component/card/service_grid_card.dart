import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class ServiceGridCard extends StatelessWidget {
  final double? width;
  final String label;
  final String logoUrl;
  final int actionCount;
  final Color color;
  final VoidCallback onTap;
  final double backgroundOpacity;

  const ServiceGridCard({
    super.key,
    this.width,
    required this.label,
    required this.logoUrl,
    required this.actionCount,
    required this.color,
    required this.onTap,
    this.backgroundOpacity = 1.0,
  });

  @override
  Widget build(BuildContext context) {
    final double iconSize = width != null ? width! * 0.5 : 48;

    return Container(
      decoration: BoxDecoration(
        color: color.withOpacity(backgroundOpacity),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.5),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: onTap,
          child: Container(
            height: width,
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Flexible(
                  flex: 3,
                  child: Container(
                    width: iconSize,
                    padding: const EdgeInsets.all(12),
                    child: _buildLogo(),
                  ),
                ),
                const SizedBox(height: 8),
                Flexible(
                  flex: 2,
                  child: Text(
                    label,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '$actionCount actions',
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogo() {
    if (logoUrl.isEmpty) {
      return Icon(Icons.add_box, color: color, size: 32);
    }
    if (logoUrl.toLowerCase().endsWith('.svg')) {
      return SvgPicture.network(
        logoUrl,
        fit: BoxFit.contain,
        placeholderBuilder: (context) => Center(
          child: CircularProgressIndicator(color: color, strokeWidth: 2),
        ),
      );
    }
    return Image.network(
      logoUrl,
      fit: BoxFit.contain,
      errorBuilder: (context, error, stackTrace) =>
          Icon(Icons.image_not_supported, color: color),
    );
  }
}
