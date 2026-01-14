import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/global/cache.dart' as cache;

class OAuthPage {
  final String oauthUrl;
  final String serviceName;

  OAuthPage({required this.oauthUrl, required this.serviceName});

  Future<void> initiateOAuthFlow(BuildContext context) async {
    final Uri oauthUri = Uri.parse(oauthUrl);
    final String? apiSettingsUrl = await cache.ApiSettingsStore().loadApiUrl();
    final String? toggleToken = await cache.AuthStore().loadToken();

    // Launch the OAuth URL in an external browser
    if (await canLaunchUrl(oauthUri)) {
      await launchUrl(oauthUri, mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not launch $oauthUri';
    }

    // Listen for the redirect URI
    final AppLinks appLinks = AppLinks();
    appLinks.uriLinkStream.listen((Uri uri) {
      // Collect all parameters from both query and fragment
      final Map<String, String> allParams = {};

      // Add query parameters
      allParams.addAll(uri.queryParameters);

      // Add fragment parameters
      if (uri.fragment.isNotEmpty) {
        final fragmentParams = Uri.splitQueryString(uri.fragment);
        allParams.addAll(fragmentParams);
      }

      if (allParams.isNotEmpty) {
        // Build URI with all parameters
        final consumeUri = Uri.parse(
          '$apiSettingsUrl/services/$serviceName/redirect',
        ).replace(queryParameters: allParams);

        // Handle the received parameters
        http
            .get(
              consumeUri,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer $toggleToken',
              },
            )
            .then((resp) {
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
            })
            .catchError((error) {
              // Handle network error
              ScaffoldMessenger.of(
                context,
              ).showSnackBar(SnackBar(content: Text('Network error: $error')));
            });
        debugPrint('Received OAuth params: $allParams');
      } else {
        debugPrint('No parameters found in URI: $uri');
      }
    });
  }
}
