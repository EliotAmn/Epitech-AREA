import 'package:flutter/material.dart';
import '../component/input/input_decorations.dart';
import '../global/area_model.dart';
import 'package:http/http.dart' as http;
import '../global/cache.dart' as cache;
import 'dart:convert';
import 'area_detail_page.dart';
import 'package:mobile/component/card/card_button.dart';

class MyAreasPage extends StatefulWidget {
  const MyAreasPage({super.key});

  @override
  State<MyAreasPage> createState() => _MyAreasPageState();
}

class _MyAreasPageState extends State<MyAreasPage> {
  List<Area> _areas = [];
  bool _loading = false;
  String? _error;
  List<Area> _filteredAreas = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    getAreas();
    _searchController.addListener(() {
      _applyFilter(_searchController.text);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> getAreas() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    final token = await cache.AuthStore().loadToken();
    if (token == null || token.isEmpty) {
      setState(() {
        _loading = false;
        _error = 'Not authenticated';
      });
      return;
    }

    try {
      final response = await http.get(
        Uri.parse('${await cache.ApiSettingsStore().loadApiUrl()}/areas'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        debugPrint(response.body);
        final data = jsonDecode(response.body) as List<dynamic>;
        final areas = data
            .map((j) => Area.fromJson(j as Map<String, dynamic>))
            .toList();
        if (!mounted) return;
        setState(() {
          _areas = areas;
          _filteredAreas = List<Area>.from(areas);
          _loading = false;
        });
      } else {
        if (!mounted) return;
        setState(() {
          _loading = false;
          _error = 'Failed to fetch areas (${response.statusCode})';
          _filteredAreas = [];
        });
        debugPrint('Failed to fetch areas: ${response.body}');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'Network error: $e';
        _filteredAreas = [];
      });
    }
  }

  void _applyFilter(String q) {
    final query = q.trim().toLowerCase();
    if (query.isEmpty) {
      setState(() {
        _filteredAreas = List<Area>.from(_areas);
      });
      return;
    }
    setState(() {
      _filteredAreas = _areas
          .where((a) => a.name.toLowerCase().contains(query))
          .toList();
    });
  }

  Future<void> _toggleArea(int index, bool value) async {
    final area = _areas[index];
    final previous = area.isActive;
    final updated = Area(
      id: area.id,
      name: area.name,
      action: area.action,
      reaction: area.reaction,
      isActive: value,
    );
    setState(() {
      _areas[index] = updated;
      final filteredIndex = _filteredAreas.indexWhere((a) => a.id == area.id);
      if (filteredIndex != -1) {
        _filteredAreas[filteredIndex] = updated;
      }
    });

    final token = await cache.AuthStore().loadToken();
    if (token == null || token.isEmpty) {
      if (!mounted) return;
      final reverted = Area(
        id: area.id,
        name: area.name,
        action: area.action,
        reaction: area.reaction,
        isActive: previous,
      );
      setState(() {
        _areas[index] = reverted;
        final filteredIndex = _filteredAreas.indexWhere((a) => a.id == area.id);
        if (filteredIndex != -1) {
          _filteredAreas[filteredIndex] = reverted;
        }
      });
      return;
    }

    try {
      final response = await http.patch(
        Uri.parse(
          '${await cache.ApiSettingsStore().loadApiUrl()}/areas/${area.id}',
        ),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'isActive': value}),
      );
      if (response.statusCode < 200 || response.statusCode >= 300) {
        if (!mounted) return;
        final reverted = Area(
          id: area.id,
          name: area.name,
          action: area.action,
          reaction: area.reaction,
          isActive: previous,
        );
        setState(() {
          _areas[index] = reverted;
          final filteredIndex = _filteredAreas.indexWhere(
            (a) => a.id == area.id,
          );
          if (filteredIndex != -1) {
            _filteredAreas[filteredIndex] = reverted;
          }
        });
        debugPrint('Failed to toggle area: ${response.body}');
      }
    } catch (e) {
      if (!mounted) return;
      final reverted = Area(
        id: area.id,
        name: area.name,
        action: area.action,
        reaction: area.reaction,
        isActive: previous,
      );
      setState(() {
        _areas[index] = reverted;
        final filteredIndex = _filteredAreas.indexWhere((a) => a.id == area.id);
        if (filteredIndex != -1) {
          _filteredAreas[filteredIndex] = reverted;
        }
      });
      debugPrint('Network error toggling area: $e');
    }
  }

  Future<void> _deleteArea(int index) async {
    final area = _areas[index];

    final token = await cache.AuthStore().loadToken();
    if (token == null || token.isEmpty) {
      if (!mounted) return;
      debugPrint('Cannot delete: not authenticated');
      return;
    }

    try {
      final response = await http.delete(
        Uri.parse(
          '${await cache.ApiSettingsStore().loadApiUrl()}/areas/${area.id}',
        ),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        if (!mounted) return;
        setState(() {
          _areas.removeWhere((a) => a.id == area.id);
          _filteredAreas.removeWhere((a) => a.id == area.id);
        });
      } else {
        if (!mounted) return;
        debugPrint('Failed to delete area: ${response.body}');
      }
    } catch (e) {
      if (!mounted) return;
      debugPrint('Network error deleting area: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            SizedBox(
              height:
                  (Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16) * 4,
            ),
            Text('My AREAs', style: Theme.of(context).textTheme.displayLarge),
            SizedBox(
              height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16,
            ),
            SizedBox(
              width: 300,
              child: TextField(
                controller: _searchController,
                decoration: AppInputDecorations.primary(context, 'Filter'),
                textInputAction: TextInputAction.search,
              ),
            ),
            SizedBox(
              height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16,
            ),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _error != null
                  ? Center(child: Text(_error!))
                  : _filteredAreas.isEmpty
                  ? const Center(child: Text('No areas yet'))
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      itemCount: _filteredAreas.length,
                      itemBuilder: (context, index) {
                        final area = _filteredAreas[index];
                        return CardButton(
                          label: area.name,
                          height: MediaQuery.of(context).size.width * 0.4,

                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (context) =>
                                    AreaDetailPage(area: area),
                              ),
                            );
                          },
                          color: const Color.fromARGB(255, 255, 255, 255),
                          children: Container(
                            padding: const EdgeInsets.all(8),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Left: title and subtitle (IF -> THEN)
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      // small header row (could include icons)
                                      Row(
                                        children: [
                                          // placeholder for service icons
                                          const SizedBox(width: 4),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),

                                // Right: controls
                                Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Switch(
                                          value: area.isActive,
                                          onChanged: (v) =>
                                              _toggleAreaById(area.id, v),
                                        ),
                                        IconButton(
                                          icon: const Icon(Icons.delete),
                                          color: Theme.of(
                                            context,
                                          ).colorScheme.error,
                                          tooltip: 'Delete area',
                                          onPressed: () =>
                                              _deleteAreaById(area.id),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ],
                            ),
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

  // Helpers when working from filtered list items
  void _toggleAreaById(String id, bool value) {
    final index = _areas.indexWhere((a) => a.id == id);
    if (index == -1) return;
    _toggleArea(index, value);
  }

  void _deleteAreaById(String id) {
    final index = _areas.indexWhere((a) => a.id == id);
    if (index == -1) return;
    _deleteArea(index);
  }
}
