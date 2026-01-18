import 'package:flutter/material.dart';
import '../../global/service_model.dart';
import '../../global/area_model.dart';
import 'create_home_page.dart';
import 'package:forui/forui.dart';

class ConfigPage extends StatefulWidget {
  final String actionServiceName;
  final ServiceAction selectedAction;
  final Map<String, dynamic> actionInputValues;
  final String reactionServiceName;
  final ServiceReaction selectedReaction;
  final String serviceColor;

  const ConfigPage({
    super.key,
    required this.actionServiceName,
    required this.selectedAction,
    required this.actionInputValues,
    required this.reactionServiceName,
    required this.selectedReaction,
    required this.serviceColor,
  });

  @override
  State<ConfigPage> createState() => _ConfigPageState();
}

class _ConfigPageState extends State<ConfigPage> {
  final Map<String, TextEditingValue> _controllers = {};
  bool _allFilled = false;

  @override
  void initState() {
    super.initState();
    for (var param in widget.selectedReaction.inputParams) {
      _controllers[param.name] = TextEditingValue.empty;
    }
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
              color: Color(
                int.parse('0xFF${widget.serviceColor.substring(1)}'),
              ),
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
              Color(int.parse('0xFF${widget.serviceColor.substring(1)}')),
              Color(
                int.parse('0xFF${widget.serviceColor.substring(1)}'),
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
                    Icon(Icons.tune, size: 48, color: Colors.white),
                    const SizedBox(height: 16),
                    Text(
                      'Configure Reaction',
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
                      widget.selectedReaction.label,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white70,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    if (widget.selectedReaction.description.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(
                        widget.selectedReaction.description,
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
                        // Action/Reaction summary
                        Container(
                          padding: const EdgeInsets.all(16),
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
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: Colors.blue.shade50,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Icon(
                                      Icons.play_arrow,
                                      color: Colors.blue.shade700,
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
                                          'IF',
                                          style: TextStyle(
                                            fontSize: 10,
                                            color: Colors.grey.shade600,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        Text(
                                          widget.selectedAction.label,
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.grey.shade900,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Divider(color: Colors.grey.shade200),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: Color(
                                        int.parse(
                                          '0xFF${widget.serviceColor.substring(1)}',
                                        ),
                                      ).withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Icon(
                                      Icons.refresh,
                                      color: Color(
                                        int.parse(
                                          '0xFF${widget.serviceColor.substring(1)}',
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
                                          'THEN',
                                          style: TextStyle(
                                            fontSize: 10,
                                            color: Colors.grey.shade600,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        Text(
                                          widget.selectedReaction.label,
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.grey.shade900,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 24),

                        if (widget.selectedReaction.inputParams.isNotEmpty) ...[
                          Row(
                            children: [
                              Icon(
                                Icons.tune,
                                color: Color(
                                  int.parse(
                                    '0xFF${widget.serviceColor.substring(1)}',
                                  ),
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
                          ...widget.selectedReaction.inputParams.map((param) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 20),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(
                                        alpha: 0.05,
                                      ),
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
                                                '0xFF${widget.serviceColor.substring(1)}',
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
                                                '0xFF${widget.serviceColor.substring(1)}',
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
                                    FTextField(
                                      hint: param.label,
                                      control: FTextFieldControl.managed(
                                        initial: _controllers[param.name],
                                        onChange: (value) {
                                          _controllers[param.name] = value;
                                        },
                                      ),
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
                                    'This reaction is ready to use',
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
                        // Create AREA button
                        Container(
                          width: double.infinity,
                          height: 56,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.green.shade500,
                                Colors.green.shade700,
                              ],
                            ),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.green.withValues(alpha: 0.4),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: () => {
                                for (var entry in _controllers.entries)
                                  {
                                    if (widget.selectedReaction.inputParams.any(
                                      (param) =>
                                          param.name == entry.key &&
                                          param.requiredParam &&
                                          entry.value.text.isEmpty,
                                    ))
                                      {_allFilled = false}
                                    else
                                      {_allFilled = true},
                                  },
                                if (_allFilled)
                                  {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => CreateHomePage(
                                          action: AreaAction(
                                            serviceName:
                                                widget.actionServiceName,
                                            actionName:
                                                widget.selectedAction.name,
                                            actionDescription: widget
                                                .selectedAction
                                                .description,
                                            inputValues:
                                                widget.actionInputValues,
                                          ),
                                          reaction: AreaReaction(
                                            serviceName:
                                                widget.reactionServiceName,
                                            reactionName:
                                                widget.selectedReaction.name,
                                            reactionDescription: widget
                                                .selectedReaction
                                                .description,
                                            inputValues: _controllers.map(
                                              (key, controller) => MapEntry(
                                                key,
                                                controller.text,
                                              ),
                                            ),
                                          ),
                                          selectedReaction:
                                              widget.selectedReaction,
                                          selectedAction: widget.selectedAction,
                                        ),
                                      ),
                                    ),
                                  }
                                else
                                  {
                                    showFToast(
                                      context: context,
                                      title: Text(
                                        'Please fill all required fields',
                                      ),
                                    ),
                                  },
                              },

                              child: Center(
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.check_circle_outline,
                                      color: Colors.white,
                                      size: 24,
                                    ),
                                    const SizedBox(width: 12),
                                    Text(
                                      'Create AREA',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 0.5,
                                      ),
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
