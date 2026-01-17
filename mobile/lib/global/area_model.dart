class Area {
  final String id;
  final String name;
  final AreaAction action;
  final AreaReaction reaction;
  final bool isActive;

  Area({
    required this.id,
    required this.name,
    required this.action,
    required this.reaction,
    this.isActive = true,
  });

  Map<String, dynamic> toJson() => {
    'name': name,
    'actions': [
      {'action_name': action.actionName, 'params': action.inputValues, 'service': action.serviceName},
    ],
    'reactions': [
      {'reaction_name': reaction.reactionName, 'params': reaction.inputValues, 'service': reaction.serviceName},
    ],
  };

  factory Area.fromJson(Map<String, dynamic> json) {
    final name = json['name'] as String? ?? '';
    String leftService = '';
    String rightService = '';

    leftService = json['actions'] != null &&
            (json['actions'] as List).isNotEmpty &&
            (json['actions'].first as Map<String, dynamic>)['service'] !=
                null
        ? (json['actions'].first as Map<String, dynamic>)['service'] as String
        : '';
    rightService = json['reactions'] != null &&
            (json['reactions'] as List).isNotEmpty &&
            (json['reactions'].first as Map<String, dynamic>)['service'] !=
                null
        ? (json['reactions'].first as Map<String, dynamic>)['service']
            as String
        : '';

    final actions = (json['actions'] as List?) ?? const [];
    final firstAction = actions.isNotEmpty
        ? (actions.first as Map<String, dynamic>)
        : const {};
    final reactions = (json['reactions'] as List?) ?? const [];
    final firstReaction = reactions.isNotEmpty
        ? (reactions.first as Map<String, dynamic>)
        : const {};

    final action = AreaAction(
      serviceName: leftService,
      actionName: (firstAction['action_name'] as String?) ?? '',
      actionDescription: '',
      inputValues: (firstAction['params'] as Map<String, dynamic>?) ?? {},
    );

    final reaction = AreaReaction(
      serviceName: rightService,
      reactionName: (firstReaction['reaction_name'] as String?) ?? '',
      reactionDescription: '',
      inputValues: (firstReaction['params'] as Map<String, dynamic>?) ?? {},
    );

    return Area(
      id: (json['id'] as String?) ?? '',
      name: name,
      action: action,
      reaction: reaction,
      isActive: (json['isActive'] as bool?) ?? true,
    );
  }
}

class AreaAction {
  final String serviceName;
  final String actionName;
  final String actionDescription;
  final Map<String, dynamic> inputValues;

  AreaAction({
    required this.serviceName,
    required this.actionName,
    required this.actionDescription,
    required this.inputValues,
  });

  Map<String, dynamic> toJson() => {
    'service': serviceName,
    'actionName': actionName,
    'actionDescription': actionDescription,
    'inputValues': inputValues,
  };

  factory AreaAction.fromJson(Map<String, dynamic> json) {
    return AreaAction(
      serviceName: json['service'] ?? '',
      actionName: json['actionName'] ?? '',
      actionDescription: json['actionDescription'] ?? '',
      inputValues: json['inputValues'] as Map<String, dynamic>? ?? {},
    );
  }
}

class AreaReaction {
  final String serviceName;
  final String reactionName;
  final String reactionDescription;
  final Map<String, dynamic> inputValues;

  AreaReaction({
    required this.serviceName,
    required this.reactionName,
    required this.reactionDescription,
    required this.inputValues,
  });

  Map<String, dynamic> toJson() => {
    'service': serviceName,
    'reactionName': reactionName,
    'reactionDescription': reactionDescription,
    'inputValues': inputValues,
  };

  factory AreaReaction.fromJson(Map<String, dynamic> json) {
    return AreaReaction(
      serviceName: json['service'] ?? '',
      reactionName: json['reactionName'] ?? '',
      reactionDescription: json['reactionDescription'] ?? '',
      inputValues: json['inputValues'] as Map<String, dynamic>? ?? {},
    );
  }
}
