import 'package:flutter/material.dart';
import 'package:mobile/global/cache.dart' as cache;
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:forui/forui.dart';

class SecuritySettingsPage extends StatefulWidget {
  const SecuritySettingsPage({super.key});

  @override
  State<SecuritySettingsPage> createState() => _SecuritySettingsPageState();
}

class _SecuritySettingsPageState extends State<SecuritySettingsPage> {
  final TextEditingController _currentPasswordController =
      TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();
  bool _showPasswords = false;

  void _updatePassword(
      String currentPassword, String newPassword, String confirmPassword) async {
    if (newPassword != confirmPassword) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('New passwords do not match')),
      );
      return;
    }

    final userId = await _getUserIdFromToken();
    final token = await cache.AuthStore().loadToken();
    final apiUrl = await cache.ApiSettingsStore().loadApiUrl();

    if (token == null) {
      debugPrint('No auth token found.');
      return;
    }

    final response = await http.patch(
      Uri.parse('$apiUrl/users/$userId/password'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      }),
    );

    if (response.statusCode == 200) {
      debugPrint('Password updated successfully.');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password updated successfully')),
      );
    } else {
      debugPrint('Failed to update password: ${response.statusCode}');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to update password: ${response.reasonPhrase}')),
      );
    }
  }

  Future<String> _getUserIdFromToken() async {
    final token = await cache.AuthStore().loadToken();
    if (token == null) return 'Unknown';
    final parts = token.split('.');
    if (parts.length != 3) return 'Unknown';
    final payload = utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
    final payloadMap = jsonDecode(payload);
    return payloadMap['sub'] ?? 'Unknown';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Security Settings'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            children: [
            FTextField(
              control: FTextFieldControl.managed(
                controller: _currentPasswordController,
              ),
              hint: 'Current Password',
              label: Text('Current Password'),
              description: Text('Enter your current password'),
              
              obscureText: !_showPasswords,
            ),
            const SizedBox(height: 32),
            FTextField(
              control: FTextFieldControl.managed(
                controller: _newPasswordController,
              ),
              hint: 'New Password',
              label: Text('New Password'),
              description: Text('Enter your new password'),
              obscureText: !_showPasswords,
            ),
            const SizedBox(height: 32),
            FTextField(
              control: FTextFieldControl.managed(
                controller: _confirmPasswordController,
              ),
              hint: 'Confirm New Password',
              label: Text('Confirm New Password'),
              description: Text('Re-enter your new password'),
              obscureText: !_showPasswords,
            ),
            const SizedBox(height: 32),
            SwitchListTile(
              title: const Text('Show passwords'),
              value: _showPasswords,
              onChanged: (val) {
                setState(() {
                  _showPasswords = val;
                });
              },
            ),
            const SizedBox(height: 24),
            FButton(
              onPress: () {
                _updatePassword(
                  _currentPasswordController.text,
                  _newPasswordController.text,
                  _confirmPasswordController.text,
                );
              },
              child: const Text('Update Password'),
            ),
          ],
          ),
        ),
      ),
    );
  }
}