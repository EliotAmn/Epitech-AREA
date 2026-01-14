import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/global/service_model.dart';
import 'package:mobile/component/card/card_button.dart';
import 'package:mobile/pages/explore_area/service_details_page.dart';
import 'package:mobile/global/cache.dart' as cache;
import 'dart:convert';

class ExplorePage extends StatefulWidget {
  const ExplorePage({super.key});

  @override
  State<ExplorePage> createState() => _ExplorePageState();
}

class _ExplorePageState extends State<ExplorePage> {
  String selectedTab = 'All';
  String searchQuery = '';
  List<Map<String, Widget>> tabs = [];
  List<Service> services = [];

  Widget getAllView() {
    final filteredServices = services
        .where(
          (service) =>
              service.label.toLowerCase().contains(searchQuery.toLowerCase()),
        )
        .toList();

    return Column(
      children: filteredServices.map((service) {
        return Padding(
          padding: const EdgeInsets.all(8.0),
          child: CardButton(
            label: service.label,
            iconUrl: service.logo,
            color: Color(int.parse('0xFF${service.color.substring(1)}')),
            textColor: Colors.white,
            height: MediaQuery.of(context).size.width * 0.5,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ServiceDetailsPage(
                    service: service,
                    allServices: services,
                  ),
                ),
              );
            },
          ),
        );
      }).toList(),
    );
  }

  @override
  void initState() {
    super.initState();
    getServices();
  }

  Widget getCurrentTabView() {
    tabs = [
      {'All': getAllView()},
    ];

    for (var tab in tabs) {
      if (tab.containsKey(selectedTab)) {
        return tab[selectedTab]!;
      }
    }
    return const SizedBox.shrink();
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
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          SizedBox(
            height: (Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16) * 4,
          ),
          Text('Explore', style: Theme.of(context).textTheme.displayLarge),
          SizedBox(
            height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16,
          ),

          SizedBox(
            width: 300,
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                ),
                prefixIcon: const Icon(Icons.search),
              ),
              textInputAction: TextInputAction.search,
              onChanged: (value) {
                setState(() {
                  searchQuery = value;
                });
              },
            ),
          ),
          SizedBox(
            height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16,
          ),
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.vertical,
              child: getCurrentTabView(),
            ),
          ),
        ],
      ),
    );
  }
}
