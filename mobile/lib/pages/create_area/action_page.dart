import 'package:flutter/material.dart';
import '../../component/card/card_button.dart';
import '../../global/service_model.dart';
import 'action_config_page.dart';
import 'oauth_page.dart';

class ActionPage extends StatefulWidget {
  const ActionPage({
    super.key,
    required this.serviceName,
    required this.serviceActions,
    required this.allServices,
    this.oauthUrl,
  });

  final String serviceName;
  final List<ServiceAction> serviceActions;
  final List<Service> allServices;
  final String? oauthUrl;

  @override
  State<ActionPage> createState() => _ActionPageState();
}

class _ActionPageState extends State<ActionPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.green,
        title: Text(
          'Select action',
          style: Theme.of(context).textTheme.displayLarge?.copyWith(
                color: Colors.white,
              ),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          mainAxisSize: MainAxisSize.max,
          children: [
            Container(
              width: double.infinity,
              color: Colors.green,
              child: Column(
                children: [
                  const SizedBox(height: 16),
                  Icon( 
                    Icons.play_circle_rounded,
                    size: 40,
                    color: Colors.white,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    widget.serviceName,
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                          color: Colors.white,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Choose an action to trigger your area',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Colors.white,
                        ),
                  ),
                  if (widget.oauthUrl != null) ...[
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        // Handle OAuth flow here, e.g., open a webview or external browser
                        // same as login flow
                        OAuthPage(oauthUrl: widget.oauthUrl!).initiateOAuthFlow(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                      ),
                      child: Text(
                        'Connect',
                        style: TextStyle(color: Colors.green),
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),
                ],
              ),
            ),
            SizedBox(height: 16),
            SizedBox(
              height: 400,
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: widget.serviceActions.length,
                itemBuilder: (context, index) {
                  final action = widget.serviceActions[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 1.0),
                    child: CardButton(
                      isRow: true,
                      height: 100,
                      label: action.name,
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => ActionConfigPage(
                              serviceName: widget.serviceName,
                              action: action,
                              allServices: widget.allServices,
                            ),
                          ),
                        );
                      },
                      color: Colors.green,
                      textColor: Colors.white,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
        ),
    );
  }
}
