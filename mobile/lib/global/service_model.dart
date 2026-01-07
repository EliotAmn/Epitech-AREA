class Service {
  final String name;
  final List<ServiceAction> actions;
  final List<ServiceReaction> reactions;

  Service({required this.name, required this.actions, required this.reactions});

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      name: json['name'] ?? '',
      actions: (json['actions'] as List? ?? [])
          .map((a) => ServiceAction.fromJson(a as Map<String, dynamic>))
          .toList(),
      reactions: (json['reactions'] as List? ?? [])
          .map((r) => ServiceReaction.fromJson(r as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'actions': actions.map((a) => a.toJson()).toList(),
    'reactions': reactions.map((r) => r.toJson()).toList(),
  };
}

class ServiceAction {
  final String name;
  final String description;
  final List<ActionParam> outputParams;
  final List<ActionParam> inputParams;

  ServiceAction({
    required this.name,
    required this.description,
    required this.outputParams,
    required this.inputParams,
  });

  factory ServiceAction.fromJson(Map<String, dynamic> json) {
    return ServiceAction(
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      outputParams: (json['output_params'] as List? ?? [])
          .map((p) => ActionParam.fromJson(p as Map<String, dynamic>))
          .toList(),
      inputParams: (json['input_params'] as List? ?? [])
          .map((p) => ActionParam.fromJson(p as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'description': description,
    'output_params': outputParams.map((p) => p.toJson()).toList(),
    'input_params': inputParams.map((p) => p.toJson()).toList(),
  };
}

class ServiceReaction {
  final String name;
  final String description;
  final List<ActionParam> inputParams;

  ServiceReaction({
    required this.name,
    required this.description,
    required this.inputParams,
  });

  factory ServiceReaction.fromJson(Map<String, dynamic> json) {
    return ServiceReaction(
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      inputParams: (json['input_params'] as List? ?? [])
          .map((p) => ActionParam.fromJson(p as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'description': description,
    'input_params': inputParams.map((p) => p.toJson()).toList(),
  };
}

class ActionParam {
  final String name;
  final String type;
  final String label;
  final String description;
  final bool requiredParam;

  ActionParam({
    required this.name,
    required this.type,
    required this.label,
    required this.description,
    required this.requiredParam,
  });

  factory ActionParam.fromJson(Map<String, dynamic> json) {
    return ActionParam(
      name: json['name'] ?? '',
      type: json['type'] ?? '',
      label: json['label'] ?? '',
      description: json['description'] ?? '',
      requiredParam: json['required'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'type': type,
    'label': label,
    'description': description,
    'required': requiredParam,
  };
}
