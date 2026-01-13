import 'package:flutter/material.dart';
import '../../component/card/card_button.dart';
import '../../global/service_model.dart';
import 'config_page.dart';
import 'package:mobile/utils/string_utils.dart';
import 'oauth_page.dart';

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
          'Choose a reaction',
          style: Theme.of(context).textTheme.displayLarge,
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
                          icon: NetworkImage(service.logo),
                          color: Color(
                            int.parse('0xFF${service.color.substring(1)}'),
                          ),
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
        ),
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
          'Select reactions',
          style: Theme.of(
            context,
          ).textTheme.displayLarge?.copyWith(color: Colors.white),
        ),
        backgroundColor: Color(
          int.parse('0xFF${reactionService.color.substring(1)}'),
        ),
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            color: Color(
              int.parse('0xFF${reactionService.color.substring(1)}'),
            ),
            child: Column(
              children: [
                const SizedBox(height: 16),
                Image(
                  image: NetworkImage(reactionService.logo),
                  width: 100,
                  height: 100,
                  color: Colors.white,
                ),
                const SizedBox(height: 16),
                Text(
                  reactionService.name,
                  style: Theme.of(
                    context,
                  ).textTheme.displayLarge?.copyWith(color: Colors.white),
                ),
                const SizedBox(height: 8),
                Text(
                  'Choose an action to trigger your area',
                  style: Theme.of(
                    context,
                  ).textTheme.bodyLarge?.copyWith(color: Colors.white),
                ),
                if (reactionService.oauthUrl != null) ...[
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      // Handle OAuth flow here, e.g., open a webview or external browser
                      // same as login flow
                      OAuthPage(
                        oauthUrl: reactionService.oauthUrl!,
                      ).initiateOAuthFlow(context);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                    ),
                    child: Text(
                      'Connect',
                      style: TextStyle(
                        color: Color(
                          int.parse(
                            '0xFF${reactionService.color.substring(1)}',
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: reactionService.reactions.length,
              itemBuilder: (context, index) {
                final reaction = reactionService.reactions[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: CardButton(
                    isRow: true,
                    height: 100,
                    label: humanize(reaction.name),
                    color: Color(
                      int.parse('0xFF${reactionService.color.substring(1)}'),
                    ),
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
          ),
        ],
      ),
    );
  }
}
