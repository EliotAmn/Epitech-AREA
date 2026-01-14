import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:marquee/marquee.dart';

class CardButton extends StatelessWidget {
  final String label;
  final String? iconUrl;
  final VoidCallback onTap;
  final double height;
  final double elevation;
  final Color color;
  final Color? textColor;
  final dynamic children;
  final bool? isRow;
  final double? radius;

  const CardButton({
    super.key,
    required this.label,
    this.iconUrl,
    required this.onTap,
    required this.color,
    this.textColor,
    this.height = 0,
    this.elevation = 4,
    this.children,
    this.isRow = false,
    this.radius,
  });

  Widget? _buildIcon() {
    if (iconUrl == null || iconUrl!.isEmpty) return null;

    final isSvg = iconUrl!.toLowerCase().endsWith('.svg');

    if (isSvg) {
      return SvgPicture.network(iconUrl!, width: 40, height: 40);
    } else {
      return Image.network(
        iconUrl!,
        width: 40,
        height: 40,
        errorBuilder: (context, error, stackTrace) => const Icon(Icons.error),
      );
    }
  }

  Widget _buildText(BuildContext context) {
    final textStyle = Theme.of(context).textTheme.bodyLarge?.copyWith(
      color: textColor,
      fontWeight: FontWeight.bold,
    );

    return LayoutBuilder(
      builder: (context, constraints) {
        final textPainter = TextPainter(
          text: TextSpan(text: label, style: textStyle),
          maxLines: 1,
          textDirection: TextDirection.ltr,
        )..layout(maxWidth: constraints.maxWidth);

        if (textPainter.didExceedMaxLines) {
          return SizedBox(
            height: MediaQuery.of(context).size.width * 0.1,
            child: Marquee(
              text: label,
              style: textStyle,
              scrollAxis: Axis.horizontal,
              crossAxisAlignment: CrossAxisAlignment.center,
              blankSpace: 20.0,
              velocity: 30.0,
              pauseAfterRound: const Duration(seconds: 1),
              startPadding: 10.0,
              accelerationDuration: const Duration(seconds: 1),
              accelerationCurve: Curves.linear,
              decelerationDuration: const Duration(milliseconds: 500),
              decelerationCurve: Curves.easeOut,
            ),
          );
        } else {
          return Text(
            label,
            style: textStyle,
            textAlign: isRow == true ? TextAlign.center : TextAlign.center,
          );
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: elevation,
      margin: const EdgeInsets.all(8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radius ?? 12),
      ),
      color: Colors.transparent,
      child: Container(
        height: (height) > 0 ? height : null,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(radius ?? 12),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [color, color.withValues(alpha: 0.7)],
          ),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(radius ?? 12),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            child: isRow == true
                ? Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (_buildIcon() != null) _buildIcon()!,
                      const SizedBox(width: 8),
                      Expanded(child: _buildText(context)),
                      if (children != null) ...[
                        const SizedBox(width: 8),
                        children,
                      ],
                    ],
                  )
                : Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (_buildIcon() != null)
                        Column(
                          children: [_buildIcon()!, const SizedBox(height: 8)],
                        ),
                      if (label.isNotEmpty) _buildText(context),
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
