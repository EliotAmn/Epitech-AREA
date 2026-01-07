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
          'Choose reaction ',
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ),
      body: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 700),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                LayoutBuilder(
                  builder: (context, constraints) {
                    const gap = 6.0;
                    final itemWidth = (constraints.maxWidth - gap) / 2;
                    return Wrap(
                      spacing: gap,
                      runSpacing: gap,
                      children: allServices.map((service) {
                        return SizedBox(
                          width: itemWidth,
                          child: CardButton(
                            label: service.name,
                            icon: Icons.refresh,
                            color: const Color.fromARGB(255, 13, 15, 18),
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
                      }).toList(),
                    );
                  },
                ),
              ],
            ),
          ) 
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
          '${reactionService.name} reactions',
          style: Theme.of(context).textTheme.titleLarge,
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
                height: 100,
                label: reaction.name,
                icon: Icons.arrow_forward,
                color: const Color.fromARGB(255, 255, 98, 0),
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
