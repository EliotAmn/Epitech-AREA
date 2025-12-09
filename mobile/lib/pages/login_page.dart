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

  void loginControls(BuildContext context) {
    String email = _emailController.text;
    String password = _passwordController.text;

    http.post(
      Uri.parse('${dotenv.env['API_URL']}/auth/login'),
      body: {
        'email': email,
        'password': password,
      },
      ).then((response) {
        if (response.statusCode == 201) {
          final data = jsonDecode(response.body) as Map<String, dynamic>;
          final token = data['access_token'] as String;

          debugPrint('Login successful');
          cache.AuthStore().saveToken(token);
          widget.onLoginSuccess.call();
        } else {
          setState(() {
            _errorMessage = 'Login failed: ${response.statusCode}';
          });
          debugPrint('Login failed with status code: ${response.statusCode} & body: ${response.body}');
        }
      }).catchError((error) {
        setState(() {
          _errorMessage = 'Network error: $error';
        });
        debugPrint('Network Login failed with error: $error');
      }
    );
  }

  void openLoginDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      barrierColor: Colors.black.withAlpha(100),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
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
              SizedBox(height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16),
              TextField(
                decoration: AppInputDecorations.primary(context, 'Email'),
                textInputAction: TextInputAction.next,
                controller: _emailController,
              ),
              SizedBox(height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16),
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
              SizedBox(height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16),
              ElevatedButton(
                onPressed: () {
                  loginControls(context);
                  Navigator.of(context).pop();
                },
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  backgroundColor: Theme.of(context).colorScheme.inverseSurface,
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                ),
                child: Text('Login',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: Theme.of(context).colorScheme.onInverseSurface,
                    fontWeight: FontWeight.bold,
                  )
                )
              ),
              SizedBox(height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16),
              TextButton(onPressed: () {
                // Handle sign up action
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (context) => const SignUpPage()),
                );
              },
                style: TextButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 7),
                ),
                child: Text('Sign Up', 
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Theme.of(context).colorScheme.inverseSurface,
                    fontWeight: FontWeight.bold,
                ))
              ),
            ],
          ),
        ),
      )
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // extendBodyBehindAppBar: true,
      
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Column(
              children: [
                SizedBox(
                  width: 300,
                  child: Text( 'Automatisez le travail et la maison',
                    style: Theme.of(context).textTheme.displayLarge,
                    textAlign: TextAlign.center,
                  ),
                ),
                SizedBox(height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16),
                TextButton(onPressed: () {
                  // Handle login action
                  openLoginDialog(context);
                },
                  style: TextButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.inverseSurface,
                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: Text('Login', 
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Theme.of(context).colorScheme.onInverseSurface,
                      fontWeight: FontWeight.bold,
                  ))
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}