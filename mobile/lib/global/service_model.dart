import '../utils/string_utils.dart';

class Service {
  final String name;
  final List<ServiceAction> actions;
  final List<ServiceReaction> reactions;
  final String logo;
  final String color;
  final String? oauthUrl;

  Service({required this.name, required this.actions, required this.reactions, required this.logo, required this.color, this.oauthUrl});

  factory Service.fromJson(Map<String, dynamic> json) {
    final rawName = json['name'] ?? '';
    final humanName = humanize(rawName.toString());
    final actions = (json['actions'] as List? ?? [])
        .map((a) => ServiceAction.fromJson(a as Map<String, dynamic>))
        .toList();
    final reactions = (json['reactions'] as List? ?? [])
        .map((r) => ServiceReaction.fromJson(r as Map<String, dynamic>))
        .toList();

    final humanActions = actions
        .map(
          (a) => ServiceAction(
            name: humanize(a.name),
            description: a.description,
            outputParams: a.outputParams,
            inputParams: a.inputParams,
          ),
        )
        .toList();

    final humanReactions = reactions
        .map(
          (r) => ServiceReaction(
            name: humanize(r.name),
            description: r.description,
            inputParams: r.inputParams,
          ),
        )
        .toList();

    return Service(
      name: humanName,
      actions: humanActions,
      reactions: humanReactions,
      oauthUrl: json['oauth_url'],
      logo: json['logo'] ?? '',
      color: json['color'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'actions': actions.map((a) => a.toJson()).toList(),
    'reactions': reactions.map((r) => r.toJson()).toList(),
    'oauth_url': oauthUrl,
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

class OptionParam {
  final String label;
  final String value;

  OptionParam({
    required this.label,
    required this.value,
  });
  factory OptionParam.fromJson(Map<String, dynamic> json) {
    return OptionParam(
      label: json['label'] ?? '',
      value: json['value'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'label': label,
    'value': value,
  };
}

class ActionParam {
  final String name;
  final String type;
  final String label;
  final String description;
  final bool requiredParam;
  final List<OptionParam>? options;
  

  ActionParam({
    required this.name,
    required this.type,
    required this.label,
    required this.description,
    required this.requiredParam,
    this.options,
  });

  factory ActionParam.fromJson(Map<String, dynamic> json) {
    return ActionParam(
      name: json['name'] ?? '',
      type: json['type'] ?? '',
      label: json['label'] ?? '',
      description: json['description'] ?? '',
      requiredParam: json['required'] ?? false,
      options: (json['options'] as List? ?? [])
          .map((o) => OptionParam.fromJson(o as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'type': type,
    'label': label,
    'description': description,
    'required': requiredParam,
    'options': options?.map((o) => o.toJson()).toList(),
  };
}
