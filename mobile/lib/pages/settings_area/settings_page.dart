import 'package:flutter/material.dart';
import 'package:mobile/global/cache.dart' as cache;
import 'package:mobile/pages/settings_area/api_settings_page.dart';
import 'package:mobile/pages/settings_area/account_settings_page.dart';
import 'package:mobile/pages/settings_area/security_settings_page.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key, required this.onLogoutSuccess});

  final VoidCallback onLogoutSuccess;

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings'), elevation: 0),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          _buildSectionTitle('Account Settings'),
          _buildSettingsTile(
            icon: Icons.person,
            title: 'Profile',
            subtitle: 'Manage your profile information',
            onTap: () => _navigateTo(context, 'profile'),
          ),
          _buildSettingsTile(
            icon: Icons.lock,
            title: 'Security',
            subtitle: 'Update your password and security settings',
            onTap: () => _navigateTo(context, 'security'),
          ),
          _buildSectionTitle('Advanced Settings'),
          _buildSettingsTile(
            icon: Icons.link,
            title: 'API Settings',
            subtitle: 'Configure API preferences',
            onTap: () => _navigateTo(context, 'api_settings'),
          ),
          const Divider(height: 32),

          ElevatedButton.icon(
            onPressed: () => logout(context),
            icon: const Icon(Icons.logout),
            label: const Text('Logout'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 16, 8, 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.displayLarge?.copyWith(
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    String? subtitle,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle, style: TextStyle(color: Colors.grey.shade600).copyWith(fontSize: 12)) : null,
      trailing: trailing ?? const Icon(Icons.arrow_forward_ios, size: 16),
      onTap: onTap,
    );
  }

  void _navigateTo(BuildContext context, String route) {
    // Placeholder for navigation logic
    Widget page;
    switch (route) {
      case 'api_settings':
        page = const ApiSettingsPage();
        break;
      case 'profile':
        page = const AccountSettingsPage();
        break;
      case 'security':
        page = const SecuritySettingsPage();
        break;
      default:
        return;
    }
    Navigator.push(context, MaterialPageRoute(builder: (context) => page));
  }

  void logout(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: const Text('Confirm Logout'),
          content: const Text('Are you sure you want to log out?'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(dialogContext).pop(); // Dismiss the dialog
              },
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () async {
                await cache.AuthStore().clear();
                if (dialogContext.mounted) {
                  Navigator.of(dialogContext).pop();
                  Navigator.of(context).pop();
                  widget.onLogoutSuccess();
                }
              },
              child: const Text('Logout'),
            ),
          ],
        );
      },
    );
  }
}
