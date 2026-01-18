import 'package:flutter/material.dart';
import 'package:mobile/global/cache.dart' as cache;
import 'package:forui/forui.dart';

class ApiSettingsPage extends StatefulWidget {
  const ApiSettingsPage({super.key});

  @override
  State<ApiSettingsPage> createState() => _ApiSettingsPageState();
}

class _ApiSettingsPageState extends State<ApiSettingsPage> {
  final TextEditingController _apiUrlController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadApiUrl();
  }

  Future<void> _loadApiUrl() async {
    final apiUrl = await cache.ApiSettingsStore().loadApiUrl();
    setState(() {
      _apiUrlController.text = apiUrl ?? '';
    });
  }

  Future<void> _saveApiUrl() async {
    await cache.ApiSettingsStore().saveApiUrl(_apiUrlController.text);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('API URL saved successfully')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('API Settings'), elevation: 0),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FTextField(
              control: FTextFieldControl.managed(controller: _apiUrlController),
              hint: 'API URL',
              label: Text('API URL'),
              description: Text('Enter the base URL for the API'),
            ),
            const SizedBox(height: 20),
            FButton(onPress: _saveApiUrl, child: const Text('Save')),
          ],
        ),
      ),
    );
  }
}
