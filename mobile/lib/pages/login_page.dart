import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  void openLoginDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      barrierColor: Colors.black.withAlpha(100), // <-- overlay noir transparent
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
            SizedBox(height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16),
            TextField(
              decoration:  InputDecoration(
                  labelText: 'Email',
                  labelStyle: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: Theme.of(context).colorScheme.onSurface.withAlpha(100),
                  ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(8)),
                  borderSide: BorderSide(
                              width: 3.0,
                              style: BorderStyle.solid,
                              color: Theme.of(context).colorScheme.onSurface
                              ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(8)),
                  borderSide: BorderSide(
                              width: 3.0,
                              style: BorderStyle.solid,
                              color: Theme.of(context).colorScheme.onSurface
                              ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(8)),
                  borderSide: BorderSide(
                              width: 3.0,
                              style: BorderStyle.solid,
                              color: Theme.of(context).colorScheme.onSurface
                              ),
                ),
              ),
            ),
            SizedBox(height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16),
            TextField(
              decoration:  InputDecoration(
                labelText: 'Password',
                labelStyle: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: Theme.of(context).colorScheme.onSurface.withAlpha(100),
                  ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(8)),
                  borderSide: BorderSide(
                              width: 3.0,
                              style: BorderStyle.solid,
                              color: Theme.of(context).colorScheme.onSurface
                              ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(8)),
                  borderSide: BorderSide(
                              width: 3.0,
                              style: BorderStyle.solid,
                              color: Theme.of(context).colorScheme.onSurface
                              ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(8)),
                  borderSide: BorderSide(
                              width: 3.0,
                              style: BorderStyle.solid,
                              color: Theme.of(context).colorScheme.onSurface
                              ),
                ),
              ),
              obscureText: true,
            ),
            SizedBox(height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16),
            ElevatedButton(
              onPressed: () {
                // Handle login logic here
                Navigator.of(context).pop();
              },
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 50),
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
        title: Text('AREA',
          style: Theme.of(context).textTheme.displayLarge,
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            // SizedBox(
            //   height: 500,
            //   child: PageView(
            //   scrollDirection: Axis.horizontal,
            //   children: [
            //     Image.asset('assets/images/login_image1.png', fit: BoxFit.cover),
            //     Image.asset('assets/images/login_image2.png', fit: BoxFit.cover),
            //     Image.asset('assets/images/login_image3.png', fit: BoxFit.cover),
            //   ],
            //   ),
            // ),
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
                  child: Text('Se connecter', 
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