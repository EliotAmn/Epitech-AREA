import 'package:flutter/material.dart';
import '../global/cache.dart' as cache;

class LogoutPage extends StatelessWidget {
  final VoidCallback onLogoutSuccess;

  const LogoutPage({super.key, required this.onLogoutSuccess});

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
                  Navigator.of(dialogContext).pop(); // Dismiss the dialog
                  onLogoutSuccess();
                }
              },
              child: const Text('Logout'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        logout(context);
      },
      child: const Icon(Icons.logout),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.transparent,
        shadowColor: Colors.transparent,
        foregroundColor: Theme.of(context).iconTheme.color,
        padding: EdgeInsets.zero,
        minimumSize: const Size(40, 40),
      ),
    );
  }
}
