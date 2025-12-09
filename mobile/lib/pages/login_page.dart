import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'signup_page.dart';
import '../component/input/input_decorations.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  void openLoginDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      barrierColor: Colors.black.withAlpha(100),
      builder: (context) => Container(
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
              decoration: AppInputDecorations.primary(
                context,
                'Email or Username',
              ),
              textInputAction: TextInputAction.next,
            ),
            SizedBox(
              height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16,
            ),
            TextField(
              decoration: AppInputDecorations.primary(context, 'Password'),
              textInputAction: TextInputAction.done,
              obscureText: true,
              autocorrect: false,
              enableSuggestions: false,
            ),
            SizedBox(
              height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16,
            ),
            ElevatedButton(
              onPressed: () {
                // Handle login logic here
                Navigator.of(context).pop();
              },
              style: ElevatedButton.styleFrom(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                backgroundColor: Theme.of(context).colorScheme.inverseSurface,
                padding: const EdgeInsets.symmetric(
                  horizontal: 40,
                  vertical: 15,
                ),
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
                // Handle sign up action
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (context) => const SignUpPage()),
                );
              },
              style: TextButton.styleFrom(
                backgroundColor: Colors.transparent,
                padding: const EdgeInsets.symmetric(
                  horizontal: 40,
                  vertical: 7,
                ),
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
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0.0,
        scrolledUnderElevation: 0.0,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        title: Text('AREA', style: Theme.of(context).textTheme.displayLarge),
      ),
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
                    // Handle login action
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
