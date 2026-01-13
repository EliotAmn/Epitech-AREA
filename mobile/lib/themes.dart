import 'package:flutter/material.dart';

class AppThemes {
  // Define the Light Theme
  static final ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF2563EB),
      brightness: Brightness.light,
    ),
    appBarTheme: const AppBarTheme(
      centerTitle: true,
      elevation: 0,
      titleTextStyle: TextStyle(
        color: Colors.black,
        fontWeight: FontWeight.bold,
      ),
      backgroundColor: Colors.transparent,
      shadowColor: Colors.transparent,
    ),
    cardTheme: const CardThemeData(
      margin: EdgeInsets.all(8),
      color: Color.fromARGB(255, 39, 114, 190),
    ),
    textTheme: const TextTheme(
      displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
      bodyLarge: TextStyle(fontSize: 16),
    ),
  );

  // Define the Dark Theme
  static final ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF7CB4FF),
      brightness: Brightness.dark,
    ),
    appBarTheme: const AppBarTheme(
      centerTitle: true,
      elevation: 0,
      titleTextStyle: TextStyle(
        color: Colors.white,
        fontWeight: FontWeight.bold,
      ),
      backgroundColor: Colors.transparent,
      shadowColor: Colors.transparent,
    ),
    cardTheme: const CardThemeData(
      margin: EdgeInsets.all(8),
      color: Color(0xFF0B1E36),
    ),
    textTheme: const TextTheme(
      displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
      bodyLarge: TextStyle(fontSize: 16),
    ),
  );
}
