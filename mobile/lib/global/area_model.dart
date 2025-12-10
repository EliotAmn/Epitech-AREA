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
      {'action_name': action.actionName, 'params': action.inputValues},
    ],
    'reactions': [
      {'reaction_name': reaction.reactionName, 'params': reaction.inputValues},
    ],
  };

  factory Area.fromJson(Map<String, dynamic> json) {
    return Area(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      action: AreaAction.fromJson(json['action'] as Map<String, dynamic>),
      reaction: AreaReaction.fromJson(json['reaction'] as Map<String, dynamic>),
      isActive: json['isActive'] ?? true,
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
    'serviceName': serviceName,
    'actionName': actionName,
    'actionDescription': actionDescription,
    'inputValues': inputValues,
  };

  factory AreaAction.fromJson(Map<String, dynamic> json) {
    return AreaAction(
      serviceName: json['serviceName'] ?? '',
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
    'serviceName': serviceName,
    'reactionName': reactionName,
    'reactionDescription': reactionDescription,
    'inputValues': inputValues,
  };

  factory AreaReaction.fromJson(Map<String, dynamic> json) {
    return AreaReaction(
      serviceName: json['serviceName'] ?? '',
      reactionName: json['reactionName'] ?? '',
      reactionDescription: json['reactionDescription'] ?? '',
      inputValues: json['inputValues'] as Map<String, dynamic>? ?? {},
    );
  }
}
