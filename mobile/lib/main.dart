import 'package:flutter/material.dart';
import 'package:mobile/pages/my_areas_page.dart';
import 'pages/login_page.dart';
import 'pages/create_area/create_home_page.dart';
import 'themes.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:mobile/pages/settings_area/settings_page.dart';
import 'package:mobile/pages/explore_area/explore_page.dart';
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
    return [ExplorePage(), CreateHomePage(), MyAreasPage()];
  }

  Widget getCurrentPage() {
    if (!_isLogined) {
      return LoginPage(onLoginSuccess: _onLoginSuccess);
    }
    return _getPages()[_selectedIndex];
  }

  @override
  Widget build(BuildContext context) {
    final bool showMainAppBar =
        _selectedIndex != 1; // hide on Create page to let its own AppBar render

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: showMainAppBar
          ? AppBar(
              actions: [
                Padding(
                  padding: const EdgeInsets.only(right: 16.0),
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) =>
                              SettingsPage(onLogoutSuccess: _onLogoutSuccess),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      foregroundColor: Theme.of(context).iconTheme.color,
                      padding: EdgeInsets.zero,
                      minimumSize: const Size(40, 40),
                    ),
                    child: const Icon(Icons.settings),
                  ),
                ),
              ],
            )
          : null,
      body: getCurrentPage(),
      bottomNavigationBar: _isLogined
          ? BottomNavigationBar(
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.search),
                  label: 'Explore',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.add_box),
                  label: 'Create',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.list),
                  label: 'My AREAs',
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
