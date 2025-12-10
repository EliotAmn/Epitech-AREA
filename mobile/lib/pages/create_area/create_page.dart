import 'package:flutter/material.dart';
import '../../component/card/card_button.dart';
import 'action_page.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import '../../global/cache.dart' as cache;
import 'dart:convert';
import '../../global/service_model.dart';

class CreatePage extends StatefulWidget {
  const CreatePage({super.key});

  @override
  State<CreatePage> createState() => _CreatePageState();
}

class _CreatePageState extends State<CreatePage> {
  late List<Service> _services = [];

  @override
  void initState() {
    _getServices();
    super.initState();
  }

  void _getServices() {
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
              _services = (decoded['server']['services'] as List)
                  .map((e) => Service.fromJson(e as Map<String, dynamic>))
                  .toList();
            });
            debugPrint('Services: $_services');
          } else {
            debugPrint('Failed to load services: ${response.statusCode}');
          }
        });
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          Column(
            children: [
              SizedBox(
                width: 300,
                child: Text(
                  'Choose your services',
                  style: Theme.of(context).textTheme.displayLarge,
                  textAlign: TextAlign.center,
                ),
              ),
              SizedBox(
                height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16,
              ),
              for (var service in _services)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: CardButton(
                    label: service.name,
                    icon: Icons.build,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => ActionPage(
                            serviceName: service.name,
                            serviceActions: service.actions,
                            allServices: _services,
                          ),
                        ),
                      );
                    },
                    color: Colors.blue,
                    textColor: Colors.white,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
