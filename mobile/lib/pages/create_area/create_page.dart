import 'package:flutter/material.dart';
import 'package:marquee/marquee.dart';
import '../../component/card/card_button.dart';
import 'action_page.dart';
import '../../global/service_model.dart';
import 'package:mobile/utils/string_utils.dart';

class CreatePage extends StatefulWidget {
  const CreatePage({super.key, required this.services});

  final List<Service> services;

  @override
  State<CreatePage> createState() => _CreatePageState();
}

class _CreatePageState extends State<CreatePage> {

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: SizedBox(
          width: MediaQuery.of(context).size.width,
          height: 100,
          child: Marquee(
            text: 'Select a service to create an Area',
            style: Theme.of(context).textTheme.displayLarge,
            blankSpace: 200,
            velocity: 50,
          ),
        ),
      ),
      body: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 700),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  height: (Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16) * 4,
                ),
                LayoutBuilder(
                  builder: (context, constraints) {
                    const gap = 6.0;
                    final itemWidth = (constraints.maxWidth - gap) / 2;
                    return Wrap(
                      spacing: gap,
                      runSpacing: gap,
                      children: widget.services
                          .map(
                            (service) => SizedBox(
                              width: itemWidth,
                              child: CardButton(
                                label: humanize(service.name),
                                icon: NetworkImage(service.logo),
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (context) => ActionPage(
                                        serviceName: service.name,
                                        serviceActions: service.actions,
                                        allServices: widget.services,
                                        oauthUrl: service.oauthUrl,
                                        color: Color(int.parse('0xFF${service.color.substring(1)}')),
                                        logo: service.logo,
                                      ),
                                    ),
                                  );
                                },
                                color: Color(int.parse('0xFF${service.color.substring(1)}')),
                                textColor: Colors.white,
                              ),
                            ),
                          )
                          .toList(),
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
