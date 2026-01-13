import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:mobile/global/service_model.dart';
import 'package:mobile/component/card/card_button.dart';
import 'package:mobile/pages/create_area/action_page.dart';

class ServiceDetailsPage extends StatelessWidget {
  final Service service;
  final List<Service> allServices;

  const ServiceDetailsPage({
    super.key,
    required this.service,
    required this.allServices,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          service.label,
          style: Theme.of(
            context,
          ).textTheme.displayLarge?.copyWith(color: Colors.white),
        ),
        backgroundColor: Color(int.parse('0xFF${service.color.substring(1)}')),
      ),
      body: SingleChildScrollView(
        child: Center(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24.0),
                decoration: BoxDecoration(
                  shape: BoxShape.rectangle,
                  color: Color(int.parse('0xFF${service.color.substring(1)}')),
                ),
                child: Column(
                  children: [
                    service.logo.toLowerCase().endsWith('.svg')
                        ? SvgPicture.network(service.logo, height: 150)
                        : Image(image: NetworkImage(service.logo), height: 150),
                    const SizedBox(height: 48),
                    Text(
                      service.description,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              CardButton(
                height: MediaQuery.of(context).size.height * 0.1,
                label: 'Create an area',
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ActionPage(
                        service: service,
                        allServices: allServices,
                      ),
                    ),
                  );
                },
                color: Color(int.parse('0xFF${service.color.substring(1)}')),
                radius: 200,
                textColor: Colors.white,
              ),
              const SizedBox(height: 24),
              // You can add more details about the service here
              for (var action in service.actions)
                ListTile(
                  leading: const Icon(Icons.play_arrow),
                  title: Text(
                    action.label,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: Theme.of(context).textTheme.bodyLarge?.fontSize,
                    ),
                  ),
                  subtitle: Text(action.description),
                  dense: true,
                ),
              for (var reaction in service.reactions)
                ListTile(
                  leading: const Icon(Icons.refresh),
                  title: Text(
                    reaction.label,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: Theme.of(context).textTheme.bodyLarge?.fontSize,
                    ),
                  ),
                  subtitle: Text(reaction.description),
                  dense: true,
                ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
