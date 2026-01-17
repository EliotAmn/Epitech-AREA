import 'package:flutter/material.dart';
import 'package:mobile/component/card/card_button.dart';
import 'package:mobile/utils/string_utils.dart';
import '../../global/area_model.dart';
import 'package:mobile/global/service_model.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/global/cache.dart' as cache;
import 'edit_area_page.dart';

class AreaDetailPage extends StatelessWidget {
  final Area area;

  const AreaDetailPage({super.key, required this.area});

  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Area Details',
          style: Theme.of(context).textTheme.displayLarge,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Area Name
            Text(
              area.name,
              style: Theme.of(
                context,
              ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            // Status
            Row(
              children: [
                Icon(
                  area.isActive ? Icons.check_circle : Icons.cancel,
                  color: area.isActive ? Colors.green : Colors.grey,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  area.isActive ? 'Active' : 'Inactive',
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Action Section
            _buildSectionHeader(context, 'If', Icons.arrow_back),
            const SizedBox(height: 12),
            _buildActionCard(context),
            const SizedBox(height: 24),

            // Reaction Section
            _buildSectionHeader(context, 'THEN (Action)', Icons.arrow_forward),
            const SizedBox(height: 12),
            _buildReactionCard(context),
            const SizedBox(height: 24),

            // Area ID
            Text(
              'Area ID: ${area.id}',
              style: Theme.of(
                context,
              ).textTheme.bodySmall?.copyWith(color: Colors.grey),
            ),

            // Edit button placed at the end of the page
            const SizedBox(height: 24),
            CardButton(
              label: 'Edit Area',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => EditAreaPage(area: area),
                  ),
                );
              },
              color: Theme.of(context).colorScheme.primary,
              textColor: Colors.white,
            ),
          ],
        ),
      ),
    );
  }

  Future<Color> _colorFromServiceName(String serviceName) async {
    final String? apiSettingsUrl = await cache.ApiSettingsStore().loadApiUrl();
    if (apiSettingsUrl == null) {
      return Colors.grey; // Default color if no token or API URL
    }
    final response = await http.get(
      Uri.parse('$apiSettingsUrl/about.json'),
      headers: {
        'Content-Type': 'application/json',
      },
    );
    if (response.statusCode == 200) {
      final data = response.body;
      final decoded = jsonDecode(data);
      final services = (decoded['server']['services'] as List)
                  .map((e) => Service.fromJson(e as Map<String, dynamic>))
                  .toList();
      final service = services.firstWhere((s) => s.name == serviceName);
      return Color(int.parse('0xFF${service.color.substring(1)}'));
    } else {
      return Colors.grey; // Default color on error
    }
  }

  Widget _buildSectionHeader(
    BuildContext context,
    String title,
    IconData icon,
  ) {
    return Row(
      children: [
        Icon(icon, size: 24),
        const SizedBox(width: 8),
        Text(
          title,
          style: Theme.of(
            context,
          ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildInfoCard(
    BuildContext context, {
    required String service,
    required String actionName,
    required String description,
    required Map<String, dynamic> params,
    Color? color,
  }) {
    return CardButton(
      label: service,
      onTap: () {},
      color: color ?? Colors.grey,
      textColor: Colors.white,
      children: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Service name
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                service,
                style: Theme.of(
                  context,
                ).textTheme.labelLarge?.copyWith(color: color),
              ),
            ),
            const SizedBox(height: 12),

            // Action / Reaction name
            Text(
              actionName,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),

            if (description.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                description,
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(color: Colors.blue),
              ),
            ],

            // Parameters
            if (params.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                'Parameters',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              ...params.entries.map((entry) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        flex: 2,
                        child: Text(
                          '${entry.key}:',
                          style: Theme.of(context).textTheme.bodyMedium
                              ?.copyWith(
                                fontWeight: FontWeight.w500,
                                color: Colors.white,
                              ),
                        ),
                      ),
                      Expanded(
                        flex: 3,
                        child: Text(
                          entry.value?.toString() ?? 'N/A',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildReactionCard(BuildContext context) {
    return FutureBuilder<Color>(
      future: _colorFromServiceName(area.reaction.serviceName),
      builder: (context, snapshot) {
        final color = snapshot.data ?? Colors.grey;
        return _buildInfoCard(
          context,
          service: humanize(area.reaction.serviceName),
          actionName: area.reaction.reactionName,
          description: area.reaction.reactionDescription,
          params: area.reaction.inputValues,
          color: color,
        );
      },
    );
  }

  Widget _buildActionCard(BuildContext context) {
    return FutureBuilder<Color>(
      future: _colorFromServiceName(area.action.serviceName),
      builder: (context, snapshot) {
        final color = snapshot.data ?? Colors.grey;
        return _buildInfoCard(
          context,
          service: humanize(area.action.serviceName),
          actionName: area.action.actionName,
          description: area.action.actionDescription,
          params: area.action.inputValues,
          color: color,
        );
      },
    );
  }
}