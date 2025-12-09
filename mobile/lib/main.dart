import 'package:flutter/material.dart';
import 'pages/home_page.dart';
import 'pages/counter_page.dart';
import 'pages/login_page.dart';
import 'themes.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> main() async {
  await dotenv.load(fileName: ".env");
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

  final List<Widget> _pages = [const HomePage(), const CounterPage()];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  Widget getCurrentPage() {
    if (!_isLogined) {
      if (mounted) {
        return LoginPage(onLoginSuccess: _onLoginSuccess);
      } else {
        return const SizedBox.shrink();
      }
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
