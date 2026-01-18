import 'package:flutter/material.dart';
import 'package:mobile/global/cache.dart' as cache;
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:forui/forui.dart';

class AccountSettingsPage extends StatefulWidget {
  const AccountSettingsPage({super.key});

  @override
  State<AccountSettingsPage> createState() => _AccountSettingsPageState();
}

class _AccountSettingsPageState extends State<AccountSettingsPage> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  bool _editToggle = false;

  void _updateUserInfo(String name, String email) async {
    final userId = await _getUserIdFromToken();
    final token = await cache.AuthStore().loadToken();
    final apiUrl = await cache.ApiSettingsStore().loadApiUrl();

    if (token == null) {
      debugPrint('No auth token found.');
      return;
    }

    final response = await http.patch(
      Uri.parse('$apiUrl/users/$userId'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'name': name, 'email': email}),
    );

    if (response.statusCode == 200) {
      debugPrint('User info updated successfully.');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated successfully')),
      );
    } else {
      debugPrint('Failed to update user info: ${response.statusCode}');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to update profile: ${response.statusCode}'),
        ),
      );
    }
  }

  Future<String> _getUserIdFromToken() async {
    final token = await cache.AuthStore().loadToken();
    if (token == null) return 'Unknown';

    final parts = token.split('.');
    if (parts.length != 3) return 'Unknown';

    final payload = parts[1];
    final normalized = base64Url.normalize(payload);
    final decoded = utf8.decode(base64Url.decode(normalized));
    final payloadMap = jsonDecode(decoded);

    return payloadMap['sub'] ?? 'Unknown';
  }

  Future<void> _getUserInfo() async {
    final userId = await _getUserIdFromToken();
    final token = await cache.AuthStore().loadToken();
    final apiUrl = await cache.ApiSettingsStore().loadApiUrl();

    if (token == null) {
      debugPrint('No auth token found.');
      return;
    }
    final response = await http.get(
      Uri.parse('$apiUrl/users/$userId'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      final data = response.body;
      final decoded = jsonDecode(data);

      setState(() {
        _nameController.text = decoded['name'] ?? 'N/A';
        _emailController.text = decoded['email'] ?? 'N/A';
      });
      debugPrint('User info: $decoded');
    } else {
      debugPrint('Failed to load user info: ${response.statusCode}');
    }
  }

  @override
  void initState() {
    super.initState();
    _getUserInfo();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Account Settings'), elevation: 0),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: FTextField(
                  control: FTextFieldControl.managed(
                    controller: _nameController,
                  ),
                  hint: 'Name',
                  label: Text('Name'),
                  description: Text('Enter your name'),
                  readOnly: !_editToggle,
                ),
              ),
              const SizedBox(height: 42),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: FTextField(
                  control: FTextFieldControl.managed(
                    controller: _emailController,
                  ),
                  hint: 'Email',
                  label: Text('Email'),
                  description: Text('Enter your email address'),
                  readOnly: !_editToggle,
                ),
              ),
              const SizedBox(height: 42),
              FButton(
                onPress: () {
                  if (_editToggle) {
                    _updateUserInfo(
                      _nameController.text,
                      _emailController.text,
                    );
                  }
                  setState(() {
                    _editToggle = !_editToggle;
                  });
                },
                child: Text(_editToggle ? 'Save' : 'Edit Profile'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
