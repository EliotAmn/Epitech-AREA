import 'package:flutter/material.dart';
import '../../global/service_model.dart';
import 'config_page.dart';
import 'oauth_page.dart';
// flutter_svg may not be needed after refactor if not used directly here
import '../../component/card/service_grid_card.dart';
import '../../component/page/service_header.dart';
import '../../component/list/action_list_item.dart';

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
    Color serviceColor(String hex) =>
        Color(int.parse('0xFF${hex.substring(1)}'));
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.9),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Icon(Icons.arrow_back, color: Colors.purple.shade700),
          ),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Colors.purple.shade900, Colors.blue.shade900],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header section
              Container(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  children: const [
                    Icon(Icons.refresh, size: 48, color: Colors.white),
                    SizedBox(height: 16),
                    Text(
                      'Choose a Reaction',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 1.2,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Select a service to perform an action',
                      style: TextStyle(fontSize: 14, color: Colors.white70),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),

              // Services grid
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
                    padding: const EdgeInsets.all(20.0),
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        const gap = 12.0;
                        final itemWidth = (constraints.maxWidth - gap) / 2;
                        return Wrap(
                          spacing: gap,
                          runSpacing: gap,
                          children: allServices
                              .map(
                                (service) => SizedBox(
                                  width: itemWidth,
                                  child: ServiceGridCard(
                                    width: itemWidth,
                                    label: service.label,
                                    logoUrl: service.logo,
                                    actionCount: service.reactions.length,
                                    color: serviceColor(service.color),
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) =>
                                              ReactionListPage(
                                                actionServiceName:
                                                    actionServiceName,
                                                selectedAction: selectedAction,
                                                actionInputValues:
                                                    actionInputValues,
                                                reactionService: service,
                                              ),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              )
                              .toList(),
                        );
                      },
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

  Color get _serviceColor =>
      Color(int.parse('0xFF${reactionService.color.substring(1)}'));

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
              color: Colors.white.withOpacity(0.9),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Icon(
              Icons.arrow_back,
              color: Color(
                int.parse('0xFF${reactionService.color.substring(1)}'),
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
              Color(int.parse('0xFF${reactionService.color.substring(1)}')),
              Color(
                int.parse('0xFF${reactionService.color.substring(1)}'),
              ).withOpacity(0.8),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header section with service info
              ServiceHeader(
                service: reactionService,
                isConnected: false,
                onConnect: reactionService.oauthUrl != null
                    ? () {
                        OAuthPage(
                          oauthUrl: reactionService.oauthUrl!,
                          serviceName: reactionService.name,
                        ).initiateOAuthFlow(context);
                      }
                    : null,
              ),

              // Reactions list
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(30),
                      topRight: Radius.circular(30),
                    ),
                  ),
                  child: Column(
                    children: [
                      const SizedBox(height: 20),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24.0),
                        child: Row(
                          children: [
                            Icon(
                              Icons.refresh,
                              color: Color(
                                int.parse(
                                  '0xFF${reactionService.color.substring(1)}',
                                ),
                              ),
                              size: 24,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Available Reactions',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey.shade900,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Expanded(
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          itemCount: reactionService.reactions.length,
                          itemBuilder: (context, index) {
                            final reaction = reactionService.reactions[index];
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 12.0),
                              child: ActionListItem(
                                accentColor: _serviceColor,
                                icon: Icons.refresh,
                                label: reaction.label,
                                description: reaction.description.isNotEmpty
                                    ? reaction.description
                                    : null,
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => ConfigPage(
                                        actionServiceName: actionServiceName,
                                        selectedAction: selectedAction,
                                        actionInputValues: actionInputValues,
                                        reactionServiceName:
                                            reactionService.name,
                                        selectedReaction: reaction,
                                        serviceColor: reactionService.color,
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
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
