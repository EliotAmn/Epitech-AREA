import 'package:flutter/material.dart';
import '../../component/card/card_button.dart';
import '../../global/service_model.dart';
import 'config_page.dart';

class ReactionPage extends StatelessWidget {
  final String actionServiceName;
  final ServiceAction selectedAction;
  final Map<String, dynamic> actionInputValues;
  final List<Service> allServices;

  const ReactionPage({
    super.key,
    required this.actionServiceName,
    required this.selectedAction,
    required this.actionInputValues,
    required this.allServices,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Choose Reaction Service',
          style: Theme.of(context).textTheme.displayLarge,
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: allServices.length,
        itemBuilder: (context, index) {
          final service = allServices[index];
          return Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: CardButton(
                label: service.name,
                icon: Icons.settings,
                color: Colors.green,
                textColor: Colors.white,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ReactionListPage(
                        actionServiceName: actionServiceName,
                        selectedAction: selectedAction,
                        actionInputValues: actionInputValues,
                        reactionService: service,
                      ),
                    ),
                  );
                },
              ),
            );
          },
        ),
      );
  }
}

class ReactionListPage extends StatelessWidget {
  final String actionServiceName;
  final ServiceAction selectedAction;
  final Map<String, dynamic> actionInputValues;
  final Service reactionService;

  const ReactionListPage({
    super.key,
    required this.actionServiceName,
    required this.selectedAction,
    required this.actionInputValues,
    required this.reactionService,
  });

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      appBar: AppBar(
        title: Text(
          '${reactionService.name} Reactions',
          style: Theme.of(context).textTheme.displayLarge,
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: reactionService.reactions.length,
        itemBuilder: (context, index) {
          final reaction = reactionService.reactions[index];
          return Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: CardButton(
                label: reaction.name,
                icon: Icons.arrow_forward,
                color: Colors.orange,
                textColor: Colors.white,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ConfigPage(
                        actionServiceName: actionServiceName,
                        selectedAction: selectedAction,
                        actionInputValues: actionInputValues,
                        reactionServiceName: reactionService.name,
                        selectedReaction: reaction,
                      ),
                    ),
                  );
                },
              ),
            );
          },
        ),
    );
  }
}
