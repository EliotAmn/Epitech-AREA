import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

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
    appLinks.uriLinkStream.listen((Uri uri) {
      if (uri.fragment.isNotEmpty) {
        final fragmentParams = Uri.splitQueryString(uri.fragment);
        final oauthCode = fragmentParams['oauth_code'];
        // Handle the received authorization code
        http.get(
          Uri.parse('${dotenv.env['API_URL']}/auth/oauth/consume?code=$oauthCode'),
          headers: {'Content-Type': 'application/json'},
        ).then((resp) {
          if (resp.statusCode == 200) {
            // OAuth successful
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('OAuth successful!')),
            );
          } else {
            // Handle error
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('OAuth failed: ${resp.body}')),
            );
          }
        }).catchError((error) {
          // Handle network error
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Network error: $error')),
          );
        });
        debugPrint('Received OAuth code: $oauthCode');
      }
    });
  }
}