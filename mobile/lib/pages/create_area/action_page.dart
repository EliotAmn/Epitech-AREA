import 'package:flutter/material.dart';
import '../../component/card/card_button.dart';
import '../../global/service_model.dart';
import 'action_config_page.dart';

class ActionPage extends StatefulWidget {
  const ActionPage({
    super.key,
    required this.serviceName,
    required this.serviceActions,
    required this.allServices,
  });

  final String serviceName;
  final List<ServiceAction> serviceActions;
  final List<Service> allServices;

  @override
  State<ActionPage> createState() => _ActionPageState();
}

class _ActionPageState extends State<ActionPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text(
          'Select Action',
          style: Theme.of(context).textTheme.displayLarge,
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          mainAxisSize: MainAxisSize.max,
          children: [
            SizedBox(
              height: (Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16) * 4,
            ),
            SizedBox(
              height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16,
            ),
            SizedBox(
              height: 700,
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: widget.serviceActions.length,
                itemBuilder: (context, index) {
                  final action = widget.serviceActions[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: CardButton(
                      label: action.description,
                      icon: Icons.play_arrow,
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => ActionConfigPage(
                              serviceName: widget.serviceName,
                              action: action,
                              allServices: widget.allServices,
                            ),
                          ),
                        );
                      },
                      color: Colors.green,
                      textColor: Colors.white,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
        ),
    );
  }
}
