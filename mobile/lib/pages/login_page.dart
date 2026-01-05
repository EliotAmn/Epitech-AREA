import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_appauth/flutter_appauth.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'signup_page.dart';
import '../component/input/input_decorations.dart';
import 'package:http/http.dart' as http;
import '../global/cache.dart' as cache;
import 'package:flutter_dotenv/flutter_dotenv.dart';


class LoginPage extends StatefulWidget {
  final VoidCallback onLoginSuccess;

  const LoginPage({super.key, required this.onLoginSuccess});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class OAuthWebViewPage extends StatefulWidget {
  final String initialUrl;
  final String redirectUri;

  const OAuthWebViewPage({required this.initialUrl, required this.redirectUri, super.key});

  @override
  State<OAuthWebViewPage> createState() => _OAuthWebViewPageState();
}

class _OAuthWebViewPageState extends State<OAuthWebViewPage> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(NavigationDelegate(
        onNavigationRequest: (NavigationRequest request) {
          final url = request.url;
          try {
            final uri = Uri.parse(url);
            if (url.startsWith(widget.redirectUri) || uri.queryParameters.containsKey('grant_code') || uri.queryParameters.containsKey('code')) {
              final code = uri.queryParameters['grant_code'] ?? uri.queryParameters['code'];
              if (mounted) Navigator.of(context).pop(code);
              return NavigationDecision.prevent;
            }
          } catch (_) {
            // ignore parse errors
          }
          return NavigationDecision.navigate;
        },
      ))
      ..loadRequest(Uri.parse(widget.initialUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sign in')),
      body: WebViewWidget(controller: _controller),
    );
  }
}

class _LoginPageState extends State<LoginPage> {
  void openLoginDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      barrierColor: Colors.black.withAlpha(100),
      builder: (modalcontext) =>
          _LoginModalContent(onLoginSuccess: widget.onLoginSuccess),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Column(
              children: [
                SizedBox(
                  width: 300,
                  child: Text(
                    'Automatisez le travail et la maison',
                    style: Theme.of(context).textTheme.displayLarge,
                    textAlign: TextAlign.center,
                  ),
                ),
                SizedBox(
                  height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16,
                ),
                TextButton(
                  onPressed: () {
                    openLoginDialog(context);
                  },
                  style: TextButton.styleFrom(
                    backgroundColor: Theme.of(
                      context,
                    ).colorScheme.inverseSurface,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 40,
                      vertical: 15,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
                    'Login',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Theme.of(context).colorScheme.onInverseSurface,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _LoginModalContent extends StatefulWidget {
  final VoidCallback onLoginSuccess;

  const _LoginModalContent({required this.onLoginSuccess});

  @override
  State<_LoginModalContent> createState() => _LoginModalContentState();
}

class _LoginModalContentState extends State<_LoginModalContent> {
  late TextEditingController _emailController;
  late TextEditingController _passwordController;
  final FlutterAppAuth _appAuth = const FlutterAppAuth();
  late final String _googleClientId = (dotenv.env['GOOGLE_CLIENT_ID'] ?? '').trim();
  late final String _googleRedirectUri = (dotenv.env['GOOGLE_REDIRECT_URI'] ?? '').trim();
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _loginWithGoogle(BuildContext modalContext) async {
    if (_googleClientId.isEmpty || _googleRedirectUri.isEmpty) {
      setState(() {
        _errorMessage = 'Google OAuth is not configured (missing env vars).';
      });
      return;
    }

    try {
      final AuthorizationTokenResponse? result =
          await _appAuth.authorizeAndExchangeCode(
        AuthorizationTokenRequest(
          _googleClientId,
          _googleRedirectUri,
          discoveryUrl:
               'https://accounts.google.com/.well-known/openid-configuration',
          scopes: ['openid', 'profile', 'email'],
        ),
      );

      if (result == null) {
        setState(() {
          _errorMessage = 'Google sign-in was cancelled.';
        });
        return;
      }

      if (!mounted) return;
      final token = result.accessToken ?? result.idToken;
      if (token != null) {
        cache.AuthStore().saveToken(token);
        if (modalContext.mounted) {
          Navigator.of(modalContext).pop();
          widget.onLoginSuccess();
        }
      } else {
        setState(() {
          _errorMessage = 'Google sign-in did not return a token.';
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Google sign-in failed: $e';
      });
      debugPrint('Google sign-in failed: $e');
    }
  }

  void _login(BuildContext modalContext) {
    String email = _emailController.text.trim();
    String password = _passwordController.text;

    // Validation
    if (email.isEmpty || password.isEmpty) {
      setState(() {
        _errorMessage = 'Email and password are required';
      });
      return;
    }

    if (!_isValidEmail(email)) {
      setState(() {
        _errorMessage = 'Please enter a valid email';
      });
      return;
    }

    setState(() {
      _errorMessage = '';
    });

    http
        .post(
          Uri.parse('${dotenv.env['API_URL']}/auth/login'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'email': email, 'password': password}),
        )
        .then((response) {
          if (!mounted) return;
          if (response.statusCode == 201) {
            final data = jsonDecode(response.body) as Map<String, dynamic>;
            final token = data['access_token'] as String;

            debugPrint('Login successful');
            cache.AuthStore().saveToken(token);
            if (modalContext.mounted) {
              Navigator.of(modalContext).pop();
              widget.onLoginSuccess();
            }
          } else {
            if (mounted) {
              setState(() {
                _errorMessage = 'Login failed: ${response.statusCode}';
              });
            }
            debugPrint(
              'Login failed with status code: ${response.statusCode} & body: ${response.body}',
            );
          }
        })
        .catchError((error) {
          if (!mounted) return;
          setState(() {
            _errorMessage = 'Network error: $error';
          });
          debugPrint('Login failed with error: $error');
        });
  }
  
  Future<void> _loginWithProvider(BuildContext modalContext, String provider) async {
    setState(() {
      _errorMessage = '';
    });

    // For Google, use flutter_appauth which opens the system browser.
    if (provider.toLowerCase() == 'google') {
      await _loginWithGoogle(modalContext);
      return;
    }

    try {
      final resp = await http.post(
        Uri.parse('${dotenv.env['API_URL']}/auth/oauth/$provider/authorize'),
        headers: {'Content-Type': 'application/json'},
      );

      if (resp.statusCode != 200 && resp.statusCode != 201) {
        setState(() {
          _errorMessage = 'Failed to get authorize URL: ${resp.statusCode}';
        });
        return;
      }

      final data = jsonDecode(resp.body) as Map<String, dynamic>;
      final url = data['url'] as String?;
      if (url == null) {
        setState(() {
          _errorMessage = 'No authorize URL returned from server';
        });
        return;
      }

      final code = await Navigator.of(modalContext).push<String>(
        MaterialPageRoute(
          builder: (context) => OAuthWebViewPage(
            initialUrl: url,
            redirectUri: '${url}/redirect',
          ),
        ),
      );

      if (code == null) {
        setState(() {
          _errorMessage = 'Authentication cancelled';
        });
        return;
      }

      final tokenResp = await http.get(Uri.parse('${dotenv.env['API_URL']}/auth/oauth/consume?code=$code'));
      if (tokenResp.statusCode != 200 && tokenResp.statusCode != 201) {
        setState(() {
          _errorMessage = 'Token exchange failed: ${tokenResp.statusCode}';
        });
        return;
      }

      final tokenData = jsonDecode(tokenResp.body) as Map<String, dynamic>;
      final token = tokenData['access_token'] ?? tokenData['token'];
      if (token == null) {
        setState(() {
          _errorMessage = 'No token returned from server';
        });
        return;
      }

      cache.AuthStore().saveToken(token as String);
      if (modalContext.mounted) {
        Navigator.of(modalContext).pop();
        widget.onLoginSuccess();
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'OAuth error: $e';
      });
      debugPrint('OAuth error: $e');
    }
  }

  bool _isValidEmail(String email) {
    final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
    return emailRegex.hasMatch(email);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        bottom: 20 + MediaQuery.of(context).viewInsets.bottom,
        top: 16,
        left: 20,
        right: 20,
      ),
      color: Colors.transparent,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16,
          ),
          TextField(
            decoration: AppInputDecorations.primary(context, 'Email'),
            textInputAction: TextInputAction.next,
            controller: _emailController,
          ),
          SizedBox(
            height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16,
          ),
          TextField(
            decoration: AppInputDecorations.primary(context, 'Password'),
            textInputAction: TextInputAction.done,
            controller: _passwordController,
            obscureText: true,
            autocorrect: false,
            enableSuggestions: false,
          ),
          if (_errorMessage.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: Text(
                _errorMessage,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ),
          SizedBox(
            height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16,
          ),
          ElevatedButton(
            onPressed: () => _login(context),
            style: ElevatedButton.styleFrom(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              backgroundColor: Theme.of(context).colorScheme.inverseSurface,
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
            ),
            child: Text(
              'Login',
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                color: Theme.of(context).colorScheme.onInverseSurface,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          SizedBox(
            height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16,
          ),
          TextButton(
            onPressed: () {
              _loginWithProvider(context, 'google');
            },
            style: TextButton.styleFrom(
              backgroundColor: Colors.transparent,
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 7),
            ),
            child: Text(
              'Sign in with Google',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Theme.of(context).colorScheme.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (context) => const SignUpPage()),
              );
            },
            style: TextButton.styleFrom(
              backgroundColor: Colors.transparent,
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 7),
            ),
            child: Text(
              'Sign Up',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Theme.of(context).colorScheme.inverseSurface,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
