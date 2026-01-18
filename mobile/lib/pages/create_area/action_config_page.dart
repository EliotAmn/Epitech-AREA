import 'package:flutter/material.dart';
import 'package:mobile/pages/create_area/create_home_page.dart';
import '../../component/input/input_decorations.dart';
import '../../global/service_model.dart';
import '../../global/area_model.dart';
import 'package:forui/forui.dart';

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
  final Map<String, TextEditingValue> _controllers = {};

  @override
  void initState() {
    super.initState();
    for (var param in widget.action.inputParams) {
      _controllers[param.name] = TextEditingValue.empty;
    }
  }

  @override
  void dispose() {
    super.dispose();
  }

  void _continue() {
    final inputValues = <String, dynamic>{};
    for (var entry in _controllers.entries) {
      if (widget.action.inputParams.any(
        (param) =>
            param.name == entry.key &&
            param.requiredParam &&
            entry.value.text.isEmpty,
      )) {
        showFToast(
          context: context,
          title: Text('Please fill all required fields'),
        );
        return;
      }
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
    final serviceColor = widget.allServices
        .firstWhere((s) => s.name == widget.serviceName)
        .color;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.9),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Icon(
              Icons.arrow_back,
              color: Color(int.parse('0xFF${serviceColor.substring(1)}')),
            ),
          ),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(int.parse('0xFF${serviceColor.substring(1)}')),
              Color(
                int.parse('0xFF${serviceColor.substring(1)}'),
              ).withValues(alpha: 0.8),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header section
              Container(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  children: [
                    Icon(Icons.settings, size: 48, color: Colors.white),
                    const SizedBox(height: 16),
                    Text(
                      'Configure Action',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 1.2,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.action.label,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white70,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    if (widget.action.description.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(
                        widget.action.description,
                        style: TextStyle(fontSize: 14, color: Colors.white60),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ],
                ),
              ),

              // Configuration form
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(30),
                      topRight: Radius.circular(30),
                    ),
                  ),
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (widget.action.inputParams.isNotEmpty) ...[
                          Row(
                            children: [
                              Icon(
                                Icons.tune,
                                color: Color(
                                  int.parse('0xFF${serviceColor.substring(1)}'),
                                ),
                                size: 24,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Parameters',
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey.shade900,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),
                          ...widget.action.inputParams.map((param) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 20),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.05),
                                      blurRadius: 10,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(
                                            color: Color(
                                              int.parse(
                                                '0xFF${serviceColor.substring(1)}',
                                              ),
                                            ).withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(
                                              8,
                                            ),
                                          ),
                                          child: Icon(
                                            param.requiredParam
                                                ? Icons.star
                                                : Icons.edit,
                                            color: Color(
                                              int.parse(
                                                '0xFF${serviceColor.substring(1)}',
                                              ),
                                            ),
                                            size: 20,
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                param.label,
                                                style: TextStyle(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.grey.shade900,
                                                ),
                                              ),
                                              if (param.description.isNotEmpty)
                                                Text(
                                                  param.description,
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color: Colors.grey.shade600,
                                                  ),
                                                ),
                                            ],
                                          ),
                                        ),
                                        if (param.requiredParam)
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 8,
                                              vertical: 4,
                                            ),
                                            decoration: BoxDecoration(
                                              color: Colors.orange.shade100,
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              'Required',
                                              style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.orange.shade900,
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    if (param.type != 'select')
                                      FTextField(
                                        hint: param.label,
                                        control: FTextFieldControl.managed(
                                          initial: _controllers[param.name],
                                          onChange: (value) {
                                            _controllers[param.name] = value;
                                          },
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
                                          _controllers[param.name] =
                                              TextEditingValue(
                                                text: value ?? '',
                                              );
                                        },
                                      ),
                                  ],
                                ),
                              ),
                            );
                          }),
                        ] else ...[
                          Center(
                            child: Container(
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.05),
                                    blurRadius: 10,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Column(
                                children: [
                                  Icon(
                                    Icons.check_circle_outline,
                                    size: 48,
                                    color: Colors.green.shade400,
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    'No configuration needed',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.grey.shade700,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'This action is ready to use',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.grey.shade600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                        const SizedBox(height: 24),
                        // Continue button
                        Container(
                          width: double.infinity,
                          height: 56,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Color(
                                  int.parse('0xFF${serviceColor.substring(1)}'),
                                ),
                                Color(
                                  int.parse('0xFF${serviceColor.substring(1)}'),
                                ).withValues(alpha: 0.8),
                              ],
                            ),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Color(
                                  int.parse('0xFF${serviceColor.substring(1)}'),
                                ).withValues(alpha: 0.4),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: _continue,
                              child: Center(
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      'Next: Choose Reaction',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Icon(
                                      Icons.arrow_forward,
                                      color: Colors.white,
                                      size: 20,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
