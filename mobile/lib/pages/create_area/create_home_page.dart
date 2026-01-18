import 'package:flutter/material.dart';
import 'package:marquee/marquee.dart';
import '../../component/card/action_reaction_card.dart';
import '../../component/card/connector_arrow.dart';
import '../../component/card/create_button.dart';
import 'create_page.dart';
import '../../global/area_model.dart';
import 'reaction_page.dart';
import '../../global/service_model.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../global/cache.dart' as cache;
import 'package:forui/forui.dart';

class CreateHomePage extends StatefulWidget {
  CreateHomePage({
    super.key,
    AreaAction? action,
    AreaReaction? reaction,
    ServiceAction? selectedAction,
    Map<String, dynamic>? actionInputValues,
    ServiceReaction? selectedReaction,
    Map<String, dynamic>? reactionInputValues,
  }) {
    CreateHomePage.action = action;
    CreateHomePage.reaction = reaction;
    CreateHomePage.selectedAction = selectedAction;
    CreateHomePage.selectedReaction = selectedReaction;
  }

  static AreaAction? action;
  static AreaReaction? reaction;
  static ServiceAction? selectedAction;
  static ServiceReaction? selectedReaction;

  @override
  State<CreateHomePage> createState() => _CreateHomePageState();
}

class _CreateHomePageState extends State<CreateHomePage> {
  List<Service> services = [];

  @override
  void initState() {
    super.initState();
    debugPrint("Action in CreateHomePage: ${CreateHomePage.action}");
    debugPrint("Reaction in CreateHomePage: ${CreateHomePage.reaction}");
    getServices();
  }

  void saveArea(BuildContext context) async {
    final area = Area(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name:
          'If ${CreateHomePage.selectedAction!.label} Then ${CreateHomePage.selectedReaction!.label}',
      action: CreateHomePage.action!,
      reaction: CreateHomePage.reaction!,
    );
    final String? apiSettingsUrl = await cache.ApiSettingsStore().loadApiUrl();

    cache.AuthStore().loadToken().then((token) {
      http
          .post(
            Uri.parse('$apiSettingsUrl/areas'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
            },
            body: jsonEncode(area.toJson()),
          )
          .then((response) {
            if (response.statusCode == 201) {
              debugPrint('Area created successfully on server');
              debugPrint('reponse body: ${response.body}');
              if (context.mounted) {
                Navigator.of(context).popUntil((route) => route.isFirst);
                showFToast(
                  context: context,
                  title: Text('AREA created successfully!'),
                  suffixBuilder: (context, entry) =>
                      const Icon(Icons.check_circle, color: Colors.green),
                  alignment: FToastAlignment.bottomCenter,
                  duration: const Duration(seconds: 3),
                );
              }
            } else {
              debugPrint('Failed to create area: ${response.body}');
              debugPrint('area data: ${jsonEncode(area.toJson())}');
              if (context.mounted) {
                showFToast(
                  context: context,
                  title: Text('Failed to create AREA: ${response.statusCode}'),
                  suffixBuilder: (context, entry) =>
                      const Icon(Icons.error, color: Colors.red),
                  alignment: FToastAlignment.bottomCenter,
                  duration: const Duration(seconds: 3),
                );
              }
            }
          });
    });
  }

  void getServices() async {
    http
        .get(
          Uri.parse(
            '${await cache.ApiSettingsStore().loadApiUrl()}/about.json',
          ),
          headers: {'Content-Type': 'application/json'},
        )
        .then((response) {
          if (response.statusCode == 200) {
            final data = response.body;
            final decoded = jsonDecode(data);
            setState(() {
              services = (decoded['server']['services'] as List)
                  .map((e) => Service.fromJson(e as Map<String, dynamic>))
                  .toList();
            });
          } else {
            debugPrint('Failed to load services: ${response.statusCode}');
          }
        });
  }

  @override
  Widget build(BuildContext context) {
    return FScaffold(
      header: FHeader.nested(title: Text('Create AREA')),
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 700),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Visual helper text
              Container(
                padding: const EdgeInsets.all(16.0),
                margin: const EdgeInsets.only(bottom: 20.0),

                child: SizedBox(
                  height: 30,
                  child: Marquee(
                    text:
                        'Create your AREA by selecting an action and a reaction!',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.blueGrey.shade900,
                    ),
                    scrollAxis: Axis.horizontal,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    blankSpace: 100.0,
                    velocity: 50.0,
                    pauseAfterRound: const Duration(seconds: 1),
                    startPadding: 10.0,
                    accelerationDuration: const Duration(seconds: 1),
                    accelerationCurve: Curves.linear,
                    decelerationDuration: const Duration(milliseconds: 500),
                    decelerationCurve: Curves.easeOut,
                  ),
                ),
              ),

              // Action Card
              ActionReactionCard(
                label: 'IF',
                icon: Icons.play_arrow,
                color: Colors.blue.shade600,
                unselectedColor: Colors.grey.shade700,
                isSelected: CreateHomePage.selectedAction != null,
                serviceName: CreateHomePage.action?.serviceName,
                selectedLabel: CreateHomePage.selectedAction?.label,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => CreatePage(services: services),
                    ),
                  );
                },
              ),

              // Connector Arrow
              ConnectorArrow(
                color: Colors.blue.shade700,
                show: CreateHomePage.selectedAction != null,
              ),

              // Reaction Card
              ActionReactionCard(
                label: 'THEN',
                icon: Icons.refresh,
                color: Colors.purple.shade600,
                unselectedColor: Colors.grey.shade600,
                isSelected: CreateHomePage.selectedReaction != null,
                serviceName: CreateHomePage.reaction?.serviceName,
                selectedLabel: CreateHomePage.selectedReaction?.name,
                onTap: () {
                  if (CreateHomePage.action == null ||
                      CreateHomePage.selectedAction == null) {
                    showFToast(
                      context: context,
                      title: const Text('Please select an action first.'),
                      suffixBuilder: (context, entry) =>
                          const Icon(Icons.error, color: Colors.black),
                      alignment: FToastAlignment.bottomCenter,
                      duration: const Duration(seconds: 3),
                    );
                    return;
                  }
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ReactionPage(
                        actionServiceName: CreateHomePage.action!.serviceName,
                        selectedAction: CreateHomePage.selectedAction!,
                        actionInputValues: CreateHomePage.action!.inputValues,
                        allServices: services,
                      ),
                    ),
                  );
                },
              ),

              const SizedBox(height: 32),

              // Create Button
              CreateButton(
                isEnabled:
                    CreateHomePage.action != null &&
                    CreateHomePage.reaction != null,
                onTap: () => saveArea(context),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
