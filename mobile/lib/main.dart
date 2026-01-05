import 'package:flutter/material.dart';
import 'package:mobile/pages/logout_page.dart';
import 'pages/home_page.dart';
import 'pages/login_page.dart';
import 'pages/create_area/create_page.dart';
import 'themes.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'global/cache.dart' as cache;

Future<void> main() async {
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    debugPrint("Error loading .env file: $e");
  }
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: AppThemes.lightTheme,
      darkTheme: AppThemes.darkTheme,
      home: const MainNavigation(),
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 0;
  bool _isLogined = false;

  @override
  void initState() {
    super.initState();
    cache.AuthStore().loadToken().then((token) {
      if (token != 'auth_token' && token != null && token.isNotEmpty) {
        setState(() {
          _isLogined = true;
        });
      }
    });
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  List<Widget> _getPages() {
    return [
      const HomePage(),
      const CreatePage(),
      LogoutPage(onLogoutSuccess: _onLogoutSuccess),
    ];
  }

  Widget getCurrentPage() {
    if (!_isLogined) {
      return LoginPage(onLoginSuccess: _onLoginSuccess);
    }
    return _getPages()[_selectedIndex];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('AREA', style: Theme.of(context).textTheme.displayLarge),
      ),
      body: getCurrentPage(),
      bottomNavigationBar: _isLogined
          ? BottomNavigationBar(
              items: const [
                BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
                BottomNavigationBarItem(
                  icon: Icon(Icons.plus_one),
                  label: 'Create',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.logout),
                  label: 'Logout',
                ),
              ],
              currentIndex: _selectedIndex,
              onTap: _onItemTapped,
            )
          : null,
    );
  }

  void _onLoginSuccess() {
    setState(() {
      _isLogined = true;
    });
  }

  void _onLogoutSuccess() {
    setState(() {
      _isLogined = false;
      _selectedIndex = 0;
    });
  }
}
