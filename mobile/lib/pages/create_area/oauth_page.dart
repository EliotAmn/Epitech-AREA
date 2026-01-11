import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class OAuthPage {
  final String oauthUrl;

  OAuthPage({required this.oauthUrl});

  Future<void> initiateOAuthFlow(BuildContext context) async {
    final Uri oauthUri = Uri.parse(oauthUrl);

    // Launch the OAuth URL in an external browser
    if (await canLaunchUrl(oauthUri)) {
      await launchUrl(oauthUri, mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not launch $oauthUri';
    }

    // Listen for the redirect URI
    final AppLinks appLinks = AppLinks();
    appLinks.uriLinkStream.listen((Uri? uri) {
      if (uri != null && uri.queryParameters.containsKey('code')) {
        final String? code = uri.queryParameters['code'];
        // Handle the received authorization code
        debugPrint('Received OAuth code: $code');
        Navigator.pop(context); // Close the OAuthPage
      }
    });
  }
}