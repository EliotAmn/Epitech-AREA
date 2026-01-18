import 'package:flutter/material.dart';

class ActionReactionCard extends StatelessWidget {
  final String label;
  final String? selectedLabel;
  final String? serviceName;
  final IconData icon;
  final Color color;
  final Color unselectedColor;
  final VoidCallback onTap;
  final bool isSelected;

  const ActionReactionCard({
    super.key,
    required this.label,
    required this.icon,
    required this.color,
    required this.unselectedColor,
    required this.onTap,
    this.selectedLabel,
    this.serviceName,
    this.isSelected = false,
  });

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: isSelected ? color : unselectedColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: (isSelected ? color : unselectedColor).withValues(alpha: 0.5),
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
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                const SizedBox(height: 16),
                if (isSelected)
                  _buildSelectedContent()
                else
                  _buildPlaceholder(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        Icon(icon, color: Colors.white, size: 24),
        const SizedBox(width: 12),
        Text(
          isSelected ? label : '$label THIS',
          style: TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
        const Spacer(),
        Icon(Icons.arrow_forward_ios, color: Colors.white70, size: 16),
      ],
    );
  }

  Widget _buildSelectedContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          serviceName ?? '',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          selectedLabel ?? '',
          style: const TextStyle(color: Colors.white70, fontSize: 14),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  Widget _buildPlaceholder() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.add_circle_outline, color: Colors.white70, size: 20),
        const SizedBox(width: 8),
        Text(
          'Choose a ${label.toLowerCase()}',
          style: const TextStyle(color: Colors.white70, fontSize: 14),
        ),
      ],
    );
  }
}
