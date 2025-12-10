import 'dart:convert';
import 'package:flutter/material.dart';
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
