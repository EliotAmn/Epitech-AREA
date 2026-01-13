import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../component/card/card_button.dart';
import '../../global/service_model.dart';
import 'action_config_page.dart';
import 'oauth_page.dart';
import 'package:mobile/utils/string_utils.dart';

class ActionPage extends StatefulWidget {
  const ActionPage({
    super.key,
    required this.service,
    required this.allServices,
  });

  final Service service;
  final List<Service> allServices;

  @override
  State<ActionPage> createState() => _ActionPageState();
}

class _ActionPageState extends State<ActionPage> {
  Widget _buildLogo() {
    final logoUrl = widget.service.logo.isNotEmpty
        ? widget.service.logo
        : 'https://via.placeholder.com/100';
    final isSvg = logoUrl.toLowerCase().endsWith('.svg');

    if (isSvg) {
      return SvgPicture.network(logoUrl, width: 100, height: 100);
    } else {
      return Image.network(
        logoUrl,
        width: 100,
        height: 100,
        errorBuilder: (context, error, stackTrace) =>
            const Icon(Icons.error, size: 100, color: Colors.white),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Color(
          int.parse('0xFF${widget.service.color.substring(1)}'),
        ),
        title: Text(
          'Select action',
          style: Theme.of(
            context,
          ).textTheme.displayLarge?.copyWith(color: Colors.white),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: double.infinity,
              color: Color(
                int.parse('0xFF${widget.service.color.substring(1)}'),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    const SizedBox(height: 16),
                    _buildLogo(),
                    const SizedBox(height: 16),
                    Text(
                      widget.service.label,
                      style: Theme.of(
                        context,
                      ).textTheme.displayLarge?.copyWith(color: Colors.white),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      widget.service.description,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (widget.service.oauthUrl != null) ...[
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          // Handle OAuth flow here, e.g., open a webview or external browser
                          // same as login flow
                          OAuthPage(
                            oauthUrl: widget.service.oauthUrl!,
                          ).initiateOAuthFlow(context);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                        ),
                        child: Text(
                          'Connect',
                          style: TextStyle(
                            color: Color(
                              int.parse(
                                '0xFF${widget.service.color.substring(1)}',
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: widget.service.actions.length,
              itemBuilder: (context, index) {
                final action = widget.service.actions[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 1.0),
                  child: CardButton(
                    isRow: true,
                    height: 60,
                    label: action.label,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => ActionConfigPage(
                            serviceName: widget.service.name,
                            action: action,
                            allServices: widget.allServices,
                          ),
                        ),
                      );
                    },
                    color: Color(
                      int.parse('0xFF${widget.service.color.substring(1)}'),
                    ),
                    textColor: Colors.white,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
