import 'package:flutter/material.dart';
import 'package:mobile/pages/create_area/create_home_page.dart';
import '../../component/input/input_decorations.dart';
import '../../global/service_model.dart';
import '../../global/area_model.dart';

class ActionConfigPage extends StatefulWidget {
  final String serviceName;
  final ServiceAction action;
  final List<Service> allServices;

  const ActionConfigPage({
    super.key,
    required this.serviceName,
    required this.action,
    required this.allServices,
  });

  @override
  State<ActionConfigPage> createState() => _ActionConfigPageState();
}

class _ActionConfigPageState extends State<ActionConfigPage> {
  final Map<String, TextEditingController> _controllers = {};

  @override
  void initState() {
    super.initState();
    for (var param in widget.action.inputParams) {
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

  void _continue() {
    final inputValues = <String, dynamic>{};
    for (var entry in _controllers.entries) {
      inputValues[entry.key] = entry.value.text;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CreateHomePage(
          action: AreaAction(
            serviceName: widget.serviceName,
            actionName: widget.action.name,
            actionDescription: widget.action.description,
            inputValues: inputValues,
          ),
          selectedAction: widget.action,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Configure Action',
          style: Theme.of(context).textTheme.displayLarge,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.action.name,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              widget.action.description,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            if (widget.action.inputParams.isNotEmpty) ...[
              Text(
                'Configure Parameters:',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 16),
              ...widget.action.inputParams.map((param) {
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
                      if (param.type != 'select')
                        TextField(
                          controller: _controllers[param.name],
                          decoration: AppInputDecorations.primary(
                            context,
                            param.description,
                          ),
                        )
                      else
                        DropdownButtonFormField<String>(
                          initialValue: param.options!.isNotEmpty
                              ? param.options![0].value
                              : null,
                          decoration: AppInputDecorations.primary(
                            context,
                            param.description,
                          ),
                          items: param.options!.map((option) {
                            return DropdownMenuItem<String>(
                              value: option.value,
                              child: Text(option.label),
                            );
                          }).toList(),
                          onChanged: (value) {
                            _controllers[param.name]!.text = value ?? '';
                          },
                        ),
                    ],
                  ),
                );
              }),
            ],
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _continue,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.inverseSurface,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: Text(
                  'Next: Choose Reaction',
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
