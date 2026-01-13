import 'package:flutter/material.dart';
import '../../component/input/input_decorations.dart';
import '../../global/service_model.dart';
import '../../global/area_model.dart';
import 'create_home_page.dart';

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
            }),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => CreateHomePage(
                      action: AreaAction(
                        serviceName: widget.actionServiceName,
                        actionName: widget.selectedAction.name,
                        actionDescription: widget.selectedAction.description,
                        inputValues: widget.actionInputValues,
                      ),
                      reaction: AreaReaction(
                        serviceName: widget.reactionServiceName,
                        reactionName: widget.selectedReaction.name,
                        reactionDescription:
                            widget.selectedReaction.description,
                        inputValues: _controllers.map(
                          (key, controller) => MapEntry(key, controller.text),
                        ),
                      ),
                      selectedReaction: widget.selectedReaction,
                      selectedAction: widget.selectedAction,
                    ),
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.inverseSurface,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: Text(
                  'Create AREA',
                  style: Theme.of(
                    context,
                  ).textTheme.titleMedium?.copyWith(color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
