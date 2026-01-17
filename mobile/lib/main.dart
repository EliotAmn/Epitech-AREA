import 'package:flutter/material.dart';
import 'package:mobile/pages/my_areas/my_areas_page.dart';
import 'pages/login_page.dart';
import 'pages/create_area/create_home_page.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:mobile/pages/settings_area/settings_page.dart';
import 'package:mobile/pages/explore_area/explore_page.dart';
import 'global/cache.dart' as cache;
import 'package:forui/forui.dart';

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
    final appTheme = FThemes.zinc;

    return MaterialApp(
      title: 'Flutter Demo',
      theme: appTheme.light.toApproximateMaterialTheme(),
      builder: (_, child) => FToaster(
        child: FAnimatedTheme(data: appTheme.light, child: child!),
      ),
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

    return FScaffold(
      childPad: false,
      header: showMainAppBar
          ? FHeader(
              title: const Text('AÉRA'),
              suffixes: [
                FHeaderAction(
                  icon: const Icon(Icons.settings),
                  onPress: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => SettingsPage(
                          onLogoutSuccess: _onLogoutSuccess,
                        ),
                      ),
                    );
                  },
                ),
              ],
            )
          : null,
        footer: _isLogined
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
        child: getCurrentPage(),
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
