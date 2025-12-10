import 'package:flutter/material.dart';
import 'pages/home_page.dart';
import 'pages/counter_page.dart';
import 'pages/login_page.dart';
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

  final List<Widget> _pages = [const HomePage(), const CounterPage()];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  Widget getCurrentPage() {
    if (!_isLogined) {
      return LoginPage(onLoginSuccess: _onLoginSuccess);
    }
    return _pages[_selectedIndex];
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
                  label: 'Counter',
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
}
