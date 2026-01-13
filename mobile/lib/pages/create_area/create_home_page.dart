import 'package:flutter/material.dart';
import 'package:marquee/marquee.dart';
import '../../component/card/card_button.dart';
import 'create_page.dart';
import '../../global/area_model.dart';
import 'reaction_page.dart';
import '../../global/service_model.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';
import '../../global/cache.dart' as cache;

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

  void saveArea(BuildContext context) {
    final area = Area(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name:
          'If ${CreateHomePage.selectedAction!.label} Then ${CreateHomePage.selectedReaction!.label}',
      action: CreateHomePage.action!,
      reaction: CreateHomePage.reaction!,
    );

    cache.AuthStore().loadToken().then((token) {
      http
          .post(
            Uri.parse('${dotenv.env['API_URL']}/areas'),
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
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('AREA created successfully!')),
                );
              }
            } else {
              debugPrint('Failed to create area: ${response.body}');
              debugPrint('area data: ${jsonEncode(area.toJson())}');
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'Failed to create AREA: ${response.statusCode}',
                    ),
                  ),
                );
              }
            }
          });
    });
  }

  void getServices() {
    http
        .get(
          Uri.parse('${dotenv.env['API_URL']}/about.json'),
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
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Create a new Area',
          style: Theme.of(context).textTheme.displayLarge,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 700),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              CardButton(
                isRow: true,
                label: CreateHomePage.selectedAction != null
                    ? 'If '
                    : 'If This ',
                color: Colors.black,
                textColor: Colors.white,
                height: MediaQuery.of(context).size.height * 0.1,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => CreatePage(services: services),
                    ),
                  );
                },
                children: SizedBox(
                  width: MediaQuery.of(context).size.width * 0.6,
                  child: CreateHomePage.selectedAction != null
                      ? Marquee(
                          text:
                              '${CreateHomePage.action!.serviceName} → ${CreateHomePage.selectedAction!.label}',
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(color: Colors.white70),
                          scrollAxis: Axis.horizontal,
                          blankSpace: 20.0,
                          velocity: 50.0,
                        )
                      : Card(
                          color: Colors.white24,
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Text(
                              'Add an action ',
                              style: Theme.of(context).textTheme.bodySmall
                                  ?.copyWith(color: Colors.white70),
                            ),
                          ),
                        ),
                ),
              ),
              Center(
                child: Container(
                  width: 2,
                  height: 50,
                  color: const Color.fromARGB(125, 0, 0, 0),
                ),
              ),
              if (CreateHomePage.selectedAction != null)
                Center(
                  child: Icon(
                    Icons.arrow_downward,
                    size: 24,
                    color: const Color.fromARGB(125, 0, 0, 0),
                  ),
                ),
              CardButton(
                isRow: true,
                label: CreateHomePage.selectedReaction != null
                    ? 'Then '
                    : 'Then That ',
                color: Colors.black,
                textColor: Colors.white,
                height: MediaQuery.of(context).size.height * 0.1,
                onTap: () {
                  if (CreateHomePage.action == null ||
                      CreateHomePage.selectedAction == null) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Please select an action first.'),
                      ),
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
                children: SizedBox(
                  width: MediaQuery.of(context).size.width * 0.51,
                  child: CreateHomePage.selectedReaction != null
                      ? Marquee(
                          text:
                              '${CreateHomePage.reaction!.serviceName} → ${CreateHomePage.selectedReaction!.name}',
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(color: Colors.white70),
                          scrollAxis: Axis.horizontal,
                          blankSpace: 20.0,
                          velocity: 50.0,
                        )
                      : Card(
                          color: Colors.white24,
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Text(
                              'Add a reaction ',
                              style: Theme.of(context).textTheme.bodySmall
                                  ?.copyWith(color: Colors.white70),
                            ),
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 32),
              if (CreateHomePage.action != null &&
                  CreateHomePage.reaction != null)
                CardButton(
                  isRow: true,
                  label: 'Create AREA',
                  color: const Color.fromARGB(255, 255, 255, 255),
                  textColor: const Color.fromARGB(255, 0, 0, 0),
                  height: MediaQuery.of(context).size.width * 0.2,
                  onTap: () {
                    saveArea(context);
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}
