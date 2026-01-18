import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/global/service_model.dart';
import 'package:mobile/pages/explore_area/service_details_page.dart';
import 'package:mobile/global/cache.dart' as cache;
import 'dart:convert';
import 'package:forui/forui.dart';
import '../../component/card/service_grid_card.dart';

class ExplorePage extends StatefulWidget {
  const ExplorePage({super.key});

  @override
  State<ExplorePage> createState() => _ExplorePageState();
}

class _ExplorePageState extends State<ExplorePage> {
  String selectedTab = 'All';
  TextEditingValue searchQuery = TextEditingValue.empty;
  List<Map<String, Widget>> tabs = [];
  List<Service> services = [];

  Widget getAllView() {
    final filteredServices = services
        .where(
          (service) => service.label.toLowerCase().contains(
            searchQuery.text.toLowerCase(),
          ),
        )
        .toList();

    if (filteredServices.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(40.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.search_off, size: 64, color: Colors.grey.shade400),
              const SizedBox(height: 16),
              Text(
                'No services found',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey.shade700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Try a different search term',
                style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
              ),
            ],
          ),
        ),
      );
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.85,
      ),
      itemCount: filteredServices.length,
      itemBuilder: (context, index) {
        final service = filteredServices[index];
        final serviceColor = Color(
          int.parse('0xFF${service.color.substring(1)}'),
        );
        return ServiceGridCard(
          label: service.label,
          logoUrl: service.logo,
          actionCount: service.actions.length + service.reactions.length,
          color: serviceColor,
          backgroundOpacity: 0.9,
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) =>
                    ServiceDetailsPage(service: service, allServices: services),
              ),
            );
          },
        );
      },
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
    return Container(
      color: Colors.white,
      child: SafeArea(
        top: false,
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              color: Colors.white,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Explore',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey.shade900,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: FTextField(
                      hint: "Search services",
                      textInputAction: TextInputAction.search,
                      control: FTextFieldControl.managed(
                        initial: searchQuery,
                        onChange: (value) => setState(() {
                          searchQuery = value;
                        }),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Services grid
            Expanded(
              child: services.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(
                            color: Colors.grey.shade400,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Loading services...',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey.shade500,
                            ),
                          ),
                        ],
                      ),
                    )
                  : SingleChildScrollView(child: getCurrentTabView()),
            ),
          ],
        ),
      ),
    );
  }
}
