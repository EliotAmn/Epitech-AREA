import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/global/cache.dart' as cache;

class OAuthPage {
  final String oauthUrl;
  final String serviceName;
  static const Duration _timeout = Duration(minutes: 5);

  OAuthPage({required this.oauthUrl, required this.serviceName});

  Future<bool> disconnectService(BuildContext context) async {
    final String? apiSettingsUrl = await cache.ApiSettingsStore().loadApiUrl();
    final String? toggleToken = await cache.AuthStore().loadToken();

    try {
      final response = await http.delete(
        Uri.parse('$apiSettingsUrl/services/$serviceName'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $toggleToken',
        },
      );
      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$serviceName disconnected successfully!')),
        );
        return true;
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Disconnection failed: ${response.body}'),
            backgroundColor: Colors.red,
          ),
        );
        return false;
      }
    } catch (e) {
      debugPrint('Error disconnecting service: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Network error: $e'),
          backgroundColor: Colors.red,
        ),
      );
      return false;
    }
  }

  /// Initiates OAuth flow and returns true if successful, false otherwise
  Future<bool> initiateOAuthFlow(BuildContext context) async {
    final Uri oauthUri = Uri.parse(oauthUrl);
    final String? apiSettingsUrl = await cache.ApiSettingsStore().loadApiUrl();
    final String? toggleToken = await cache.AuthStore().loadToken();

    // Capture ScaffoldMessenger early to avoid context issues
    final scaffoldMessenger = ScaffoldMessenger.of(context);

    // Launch the OAuth URL in an external browser
    if (await canLaunchUrl(oauthUri)) {
      await launchUrl(oauthUri, mode: LaunchMode.externalApplication);
    } else {
      scaffoldMessenger.showSnackBar(
        SnackBar(content: Text('Could not launch OAuth URL')),
      );
      return false;
    }

    // Wait for OAuth callback with proper cleanup
    return await _waitForOAuthCallback(
      apiSettingsUrl: apiSettingsUrl,
      toggleToken: toggleToken,
      scaffoldMessenger: scaffoldMessenger,
    );
  }

  Future<bool> _waitForOAuthCallback({
    required String? apiSettingsUrl,
    required String? toggleToken,
    required ScaffoldMessengerState scaffoldMessenger,
  }) async {
    final appLinks = AppLinks();
    bool processed = false;

    try {
      // Listen for redirect with timeout
      await for (final uri in appLinks.uriLinkStream.timeout(
        _timeout,
        onTimeout: (sink) {
          debugPrint('OAuth timeout for $serviceName');
          sink.close();
        },
      )) {
        // Prevent duplicate processing
        if (processed) {
          debugPrint('Ignoring duplicate OAuth callback for $serviceName');
          continue;
        }

        processed = true;

        // Collect all parameters from query and fragment
        final allParams = <String, String>{
          ...uri.queryParameters,
          if (uri.fragment.isNotEmpty) ...Uri.splitQueryString(uri.fragment),
        };

        if (allParams.isEmpty) {
          debugPrint('No parameters in OAuth callback URI: $uri');
          scaffoldMessenger.showSnackBar(
            const SnackBar(content: Text('Invalid OAuth callback')),
          );
          return false;
        }

        debugPrint('Processing OAuth callback for $serviceName: $allParams');

        // Send parameters to backend
        final success = await _consumeOAuthCallback(
          apiSettingsUrl: apiSettingsUrl,
          toggleToken: toggleToken,
          params: allParams,
          scaffoldMessenger: scaffoldMessenger,
        );

        return success;
      }

      // Timeout reached
      scaffoldMessenger.showSnackBar(
        const SnackBar(content: Text('OAuth timeout')),
      );
      return false;
    } catch (e) {
      debugPrint('OAuth error for $serviceName: $e');
      scaffoldMessenger.showSnackBar(
        SnackBar(content: Text('OAuth error: $e')),
      );
      return false;
    }
  }

  Future<bool> _consumeOAuthCallback({
    required String? apiSettingsUrl,
    required String? toggleToken,
    required Map<String, String> params,
    required ScaffoldMessengerState scaffoldMessenger,
  }) async {
    try {
      final consumeUri = Uri.parse(
        '$apiSettingsUrl/services/$serviceName/redirect',
      ).replace(queryParameters: params);

      final response = await http.get(
        consumeUri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $toggleToken',
        },
      );

      if (response.statusCode == 200) {
        scaffoldMessenger.showSnackBar(
          SnackBar(content: Text('$serviceName connected successfully!')),
        );
        return true;
      } else {
        scaffoldMessenger.showSnackBar(
          SnackBar(
            content: Text('Connection failed: ${response.body}'),
            backgroundColor: Colors.red,
          ),
        );
        return false;
      }
    } catch (e) {
      debugPrint('Error consuming OAuth callback: $e');
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Network error: $e'),
          backgroundColor: Colors.red,
        ),
      );
      return false;
    }
  }
}
