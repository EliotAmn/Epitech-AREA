import 'package:flutter/material.dart';
import '../../component/input/input_decorations.dart';
import '../../global/service_model.dart';
import '../../global/area_model.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';
import '../../global/cache.dart' as cache;

class ConfigPage extends StatefulWidget {
  final String actionServiceName;
  final ServiceAction selectedAction;
  final Map<String, dynamic> actionInputValues;
  final String reactionServiceName;
  final ServiceReaction selectedReaction;

  const ConfigPage({
    super.key,
    required this.actionServiceName,
    required this.selectedAction,
    required this.actionInputValues,
    required this.reactionServiceName,
    required this.selectedReaction,
  });

  @override
  State<ConfigPage> createState() => _ConfigPageState();
}

class _ConfigPageState extends State<ConfigPage> {
  final Map<String, TextEditingController> _controllers = {};
  final Map<String, dynamic> _reactionInputValues = {};

  @override
  void initState() {
    super.initState();
    for (var param in widget.selectedReaction.inputParams) {
      _controllers[param.name] = TextEditingController();
    }
  }

  @override
  void dispose() {
    for (var controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  void _saveArea(BuildContext context) {
    // Collect reaction input values
    for (var entry in _controllers.entries) {
      _reactionInputValues[entry.key] = entry.value.text;
    }

    final area = Area(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name:
          '${widget.actionServiceName}:${widget.selectedAction.name} → ${widget.reactionServiceName}:${widget.selectedReaction.name}',
      action: AreaAction(
        serviceName: widget.actionServiceName,
        actionName: widget.selectedAction.name,
        actionDescription: widget.selectedAction.description,
        inputValues: widget.actionInputValues,
      ),
      reaction: AreaReaction(
        serviceName: widget.reactionServiceName,
        reactionName: widget.selectedReaction.name,
        reactionDescription: widget.selectedReaction.description,
        inputValues: _reactionInputValues,
      ),
    );

    cache.AuthStore().loadToken().then((token) {
      http
          .post(
            Uri.parse('${dotenv.env['API_URL']}/areas'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
            },
            body: jsonEncode(area.toJson()),
          )
          .then((response) {
            if (response.statusCode == 201) {
              debugPrint('Area created successfully on server');
              if (context.mounted) {
                Navigator.of(context).popUntil((route) => route.isFirst);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('AREA created successfully!')),
                );
              }
            } else {
              debugPrint('Failed to create area: ${response.body}');
              debugPrint('area data: ${jsonEncode(area.toJson())}');
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'Failed to create AREA: ${response.statusCode}',
                    ),
                  ),
                );
              }
            }
          });
    });
    // Navigate back to home and show success
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Configure Reaction',
          style: Theme.of(context).textTheme.displayLarge,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Action: ${widget.selectedAction.name}',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'Reaction: ${widget.selectedReaction.name}',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 24),
            Text(
              'Configure Reaction Parameters:',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            ...widget.selectedReaction.inputParams.map((param) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      param.label + (param.requiredParam ? ' *' : ''),
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 4),
                    TextField(
                      controller: _controllers[param.name],
                      decoration: AppInputDecorations.primary(
                        context,
                        param.description,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => _saveArea(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.inverseSurface,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: Text(
                  'Create AREA',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: Theme.of(context).colorScheme.onInverseSurface,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
