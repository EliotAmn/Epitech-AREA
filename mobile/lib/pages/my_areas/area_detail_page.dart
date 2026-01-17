import 'package:flutter/material.dart';
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
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.grey.shade900),
        title: Text(
          'Area Details',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade900,
              ),
        ),
      ),
      body: FutureBuilder<Map<String, Map<String, dynamic>>>(
        future: _loadServiceMeta(),
        builder: (context, snapshot) {
          final actionMeta = snapshot.data?['action'];
          final reactionMeta = snapshot.data?['reaction'];
          final actionColor = (actionMeta?['color'] as Color?) ?? Colors.indigo.shade600;
          final reactionColor = (reactionMeta?['color'] as Color?) ?? Colors.purple.shade600;
          final actionLogo = (actionMeta?['logo'] as String?) ?? '';
          final reactionLogo = (reactionMeta?['logo'] as String?) ?? '';

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header card with name and status
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.indigo.withOpacity(0.08),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.bolt,
                              color: Colors.indigo.shade600,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  area.name,
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineSmall
                                      ?.copyWith(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.grey.shade900,
                                      ),
                                ),
                                const SizedBox(height: 8),
                                _buildStatusChip(area.isActive),   
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // IF card
                _buildInfoCard(
                  context,
                  tag: 'IF',
                  icon: Icons.play_arrow,
                  color: actionColor,
                  logoUrl: actionLogo,
                  service: humanize(area.action.serviceName),
                  name: humanize(area.action.actionName),
                  description: area.action.actionDescription,
                  params: area.action.inputValues,
                ),

                const SizedBox(height: 16),

                // THEN card
                _buildInfoCard(
                  context,
                  tag: 'THEN',
                  icon: Icons.refresh,
                  color: reactionColor,
                  logoUrl: reactionLogo,
                  service: humanize(area.reaction.serviceName),
                  name: humanize(area.reaction.reactionName),
                  description: area.reaction.reactionDescription,
                  params: area.reaction.inputValues,
                ),

                const SizedBox(height: 24),
                Text(
                  'ID: ${area.id}',
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(color: Colors.grey.shade600),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      backgroundColor: Colors.indigo.shade600,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 3,
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => EditAreaPage(area: area),
                        ),
                      );
                    },
                    child: const Text(
                      'Edit Area',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<Map<String, Map<String, dynamic>>> _loadServiceMeta() async {
    final services = await _fetchServices();
    final actionMeta = _metaFor(area.action.serviceName, services);
    final reactionMeta = _metaFor(area.reaction.serviceName, services);
    return {
      'action': actionMeta,
      'reaction': reactionMeta,
    };
  }

  Future<List<Service>> _fetchServices() async {
    final String? apiSettingsUrl = await cache.ApiSettingsStore().loadApiUrl();
    if (apiSettingsUrl == null) return const [];
    try {
      final response = await http.get(
        Uri.parse('$apiSettingsUrl/about.json'),
        headers: {'Content-Type': 'application/json'},
      );
      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        return (decoded['server']['services'] as List)
            .map((e) => Service.fromJson(e as Map<String, dynamic>))
            .toList();
      }
      return const [];
    } catch (_) {
      return const [];
    }
  }

  Map<String, dynamic> _metaFor(String serviceName, List<Service> services) {
    final fallback = {'color': Colors.grey, 'logo': ''};
    if (services.isEmpty) return fallback;
    final service = services.firstWhere(
      (s) => s.name == serviceName,
      orElse: () => services.first,
    );
    final colorHex = service.color.startsWith('#')
        ? service.color.substring(1)
        : service.color;
    Color parsedColor;
    try {
      parsedColor = Color(int.parse('0xFF$colorHex'));
    } catch (_) {
      parsedColor = Colors.grey;
    }
    return {'color': parsedColor, 'logo': service.logo};
  }
  Widget _buildStatusChip(bool active) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: active ? Colors.green.shade50 : Colors.grey.shade200,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: active ? Colors.green : Colors.grey,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            active ? 'Active' : 'Inactive',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: active ? Colors.green.shade900 : Colors.grey.shade700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(
    BuildContext context, {
    required String tag,
    required IconData icon,
    required Color color,
    required String logoUrl,
    required String service,
    required String name,
    required String description,
    required Map<String, dynamic> params,
  }) {
    final baseColor = color;
    final isLight = baseColor.computeLuminance() > 0.6;
    final onColor = isLight ? Colors.black87 : Colors.white;
    final onColorMuted = isLight ? Colors.black54 : Colors.white70;
    final chipColor = isLight
        ? Colors.white.withOpacity(0.85)
        : Colors.white.withOpacity(0.14);

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: baseColor,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: baseColor.withOpacity(0.28),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 40,
                  height: 40,
                  
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: logoUrl.isNotEmpty
                        ? Image.network(
                            logoUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Icon(
                              icon,
                              color: onColor,
                              size: 22,
                            ),
                          )
                        : Icon(icon, color: onColor, size: 22),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        tag,
                        style: TextStyle(
                          fontSize: 12,
                          letterSpacing: 0.5,
                          fontWeight: FontWeight.w700,
                          color: onColor,
                        ),
                      ),
                      Text(
                        service,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: onColor,
                            ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        name,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: onColorMuted,
                            ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            if (description.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: chipColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  description,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: onColor,
                      ),
                ),
              ),
            ],

            if (params.isNotEmpty) ...[
              const SizedBox(height: 14),
              Text(
                'Parameters',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: onColor,
                    ),
              ),
              const SizedBox(height: 8),
              ...params.entries.map(
                (entry) => Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: chipColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        margin: const EdgeInsets.only(top: 6, right: 10),
                        decoration: BoxDecoration(
                          color: color,
                          shape: BoxShape.circle,
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              entry.key,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: onColor,
                                  ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              entry.value?.toString() ?? 'N/A',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(color: onColorMuted),
                              softWrap: true,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}