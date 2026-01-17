import 'package:flutter/material.dart';
import '../../global/service_model.dart';
import 'package:flutter_svg/flutter_svg.dart';

class ServiceHeader extends StatelessWidget {
  final Service service;
  final bool isConnected;
  final VoidCallback? onConnect;

  const ServiceHeader({
    super.key,
    required this.service,
    required this.isConnected,
    this.onConnect,
  });

  Color get serviceColor => Color(int.parse('0xFF${service.color.substring(1)}'));

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            padding: const EdgeInsets.all(20),
            child: _buildLogo(),
          ),
          const SizedBox(height: 20),
          Text(
            service.label,
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              letterSpacing: 1.2,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            service.description,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.white70,
            ),
            textAlign: TextAlign.center,
          ),
          if (service.oauthUrl != null) ...[
            const SizedBox(height: 20),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(25),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: BorderRadius.circular(25),
                  onTap: isConnected ? null : onConnect,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 12,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isConnected ? Icons.check_circle : Icons.link,
                          color: isConnected ? Colors.green : serviceColor,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          isConnected ? 'Connected' : 'Connect Service',
                          style: TextStyle(
                            color: isConnected ? Colors.green : serviceColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildLogo() {
    final logoUrl = service.logo.isNotEmpty ? service.logo : 'https://via.placeholder.com/100';
    final isSvg = logoUrl.toLowerCase().endsWith('.svg');
    if (isSvg) {
      return SvgPicture.network(logoUrl, width: 100, height: 100);
    } else {
      return Image.network(
        logoUrl,
        width: 100,
        height: 100,
        errorBuilder: (context, error, stackTrace) => const Icon(
          Icons.error,
          size: 100,
          color: Colors.white,
        ),
      );
    }
  }
}
