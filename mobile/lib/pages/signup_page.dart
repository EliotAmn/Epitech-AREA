import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../component/input/input_decorations.dart';

class SignUpPage extends StatelessWidget {
  const SignUpPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.of(context).pop();
        },
        backgroundColor: Theme.of(context).colorScheme.inverseSurface,
        child: Icon(Icons.arrow_back,
          color: Theme.of(context).colorScheme.onInverseSurface,
        ),
      ),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0.0,
        scrolledUnderElevation: 0.0,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        title:
            Text('AREA',
              style: Theme.of(context).textTheme.displayLarge,
            ),
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
                    decoration: AppInputDecorations.primary(context, 'Email'),
                    textInputAction: TextInputAction.next,
                  ),
                  SizedBox(height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16),
                  TextField(
                    decoration: AppInputDecorations.primary(context, 'Username'),
                    textInputAction: TextInputAction.next,
                  ),
                  SizedBox(height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16),
                  TextField(
                    decoration: AppInputDecorations.primary(context, 'Password'),
                    obscureText: true,
                    textInputAction: TextInputAction.done,
                    autocorrect: false,
                    enableSuggestions: false,
                  ),
                  SizedBox(height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16),
                  TextButton(onPressed: () {
                    // Handle sign up action
                  },
                    style: TextButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.inverseSurface,
                      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 7),
                    ),
                    child: Text('Sign Up', 
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: Theme.of(context).colorScheme.onInverseSurface,
                        fontWeight: FontWeight.bold,
                    ))
                  ),
                ],
              ),
            ),
            SizedBox(height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16),
          ],
        ),
      ),
    );
  }
}