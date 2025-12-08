import 'package:flutter/material.dart';
import '../component/input/input_decorations.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  late TextEditingController _emailController;
  late TextEditingController _usernameController;
  late TextEditingController _passwordController;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _usernameController = TextEditingController();
    _passwordController = TextEditingController();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void signUp(BuildContext context) {
    String email = _emailController.text;
    String username = _usernameController.text;
    String password = _passwordController.text;

    http.post(
      Uri.parse('${dotenv.env['API_URL']}/auth/register'),
      body: {
        'email': email,
        'name': username,
        'password': password,
      },
    ).then((response) {
      if (response.statusCode == 201) {
        debugPrint('Sign up successful');
        Navigator.of(context).pop();
      } else {
        debugPrint('Sign up failed with status code: ${response.statusCode} & body: ${response.body}');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sign up failed: ${response.statusCode}')),
        );
      }
    }).catchError((error) {
      debugPrint('Sign up failed with error: $error');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sign Up'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(40.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Sign Up',
                    style: Theme.of(context).textTheme.displayLarge,
                  ),
                  SizedBox(height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16),
                  TextField(
                    controller: _emailController,
                    decoration: AppInputDecorations.primary(context, 'Email'),
                    textInputAction: TextInputAction.next,
                  ),
                  SizedBox(height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16),
                  TextField(
                    controller: _usernameController,
                    decoration: AppInputDecorations.primary(context, 'Username'),
                    textInputAction: TextInputAction.next,
                  ),
                  SizedBox(height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16),
                  TextField(
                    controller: _passwordController,
                    decoration: AppInputDecorations.primary(context, 'Password'),
                    obscureText: true,
                    textInputAction: TextInputAction.done,
                    autocorrect: false,
                    enableSuggestions: false,
                  ),
                  SizedBox(height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16),
                  TextButton(
                    onPressed: () => signUp(context),
                    style: TextButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.inverseSurface,
                      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 7),
                    ),
                    child: Text('Sign Up', 
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: Theme.of(context).colorScheme.onInverseSurface,
                        fontWeight: FontWeight.bold,
                      )
                    )
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        ),
      ),
    );
  }
}