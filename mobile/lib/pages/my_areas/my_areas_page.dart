import 'package:flutter/material.dart';
import '../../global/area_model.dart';
import 'package:http/http.dart' as http;
import '../../global/cache.dart' as cache;
import 'dart:convert';
import 'area_detail_page.dart';
import 'package:forui/forui.dart';

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
    return SafeArea(
      top: false,
      child: Column(
        children: [
          // Header section
          Container(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                Text(
                  'My Areas',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey.shade900,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 16),
                // Search bar
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: FTextField(
                    control: FTextFieldControl.managed(
                      controller: _searchController,
                    ),
                    hint: 'Search Areas',
                  ),
                ),
              ],
            ),
          ),

          // Areas list
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(30),
                  topRight: Radius.circular(30),
                ),
              ),
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _error != null
                  ? Center(
                      child: Container(
                        padding: const EdgeInsets.all(24),
                        margin: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.error_outline,
                              size: 48,
                              color: Colors.red.shade400,
                            ),
                            const SizedBox(height: 12),
                            Text(
                              _error!,
                              style: TextStyle(color: Colors.red.shade900),
                            ),
                          ],
                        ),
                      ),
                    )
                  : _filteredAreas.isEmpty
                  ? Center(
                      child: Container(
                        padding: const EdgeInsets.all(24),
                        margin: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: SingleChildScrollView(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.inbox_outlined,
                                size: 64,
                                color: Colors.grey.shade400,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'No areas yet',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.grey.shade700,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Create your first automation',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(20),
                      itemCount: _filteredAreas.length,
                      itemBuilder: (context, index) {
                        final area = _filteredAreas[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.indigo.withOpacity(0.2),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Material(
                              color: Colors.transparent,
                              child: InkWell(
                                borderRadius: BorderRadius.circular(20),
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (context) =>
                                          AreaDetailPage(area: area),
                                    ),
                                  );
                                },
                                child: Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      // Header with title and controls
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              area.name,
                                              style: TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.grey.shade900,
                                              ),
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          // Status indicator
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 10,
                                              vertical: 6,
                                            ),
                                            decoration: BoxDecoration(
                                              color: area.isActive
                                                  ? Colors.green.shade50
                                                  : Colors.grey.shade100,
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Container(
                                                  width: 8,
                                                  height: 8,
                                                  decoration: BoxDecoration(
                                                    color: area.isActive
                                                        ? Colors.green
                                                        : Colors.grey,
                                                    shape: BoxShape.circle,
                                                  ),
                                                ),
                                                const SizedBox(width: 6),
                                                Text(
                                                  area.isActive
                                                      ? 'Active'
                                                      : 'Inactive',
                                                  style: TextStyle(
                                                    fontSize: 11,
                                                    fontWeight: FontWeight.w600,
                                                    color: area.isActive
                                                        ? Colors.green.shade900
                                                        : Colors.grey.shade700,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 12),

                                      // IF section
                                      Container(
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(
                                          color: Colors.blue.shade50,
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                        ),
                                        child: Row(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.all(6),
                                              decoration: BoxDecoration(
                                                color: Colors.blue.shade100,
                                                borderRadius:
                                                    BorderRadius.circular(8),
                                              ),
                                              child: Icon(
                                                Icons.play_arrow,
                                                size: 16,
                                                color: Colors.blue.shade700,
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    'IF',
                                                    style: TextStyle(
                                                      fontSize: 9,
                                                      fontWeight:
                                                          FontWeight.w600,
                                                      color:
                                                          Colors.blue.shade700,
                                                    ),
                                                  ),
                                                  Text(
                                                    area.action.serviceName,
                                                    style: TextStyle(
                                                      fontSize: 13,
                                                      fontWeight:
                                                          FontWeight.w600,
                                                      color:
                                                          Colors.grey.shade900,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),

                                      const SizedBox(height: 8),

                                      // THEN section
                                      Container(
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(
                                          color: Colors.purple.shade50,
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                        ),
                                        child: Row(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.all(6),
                                              decoration: BoxDecoration(
                                                color: Colors.purple.shade100,
                                                borderRadius:
                                                    BorderRadius.circular(8),
                                              ),
                                              child: Icon(
                                                Icons.refresh,
                                                size: 16,
                                                color: Colors.purple.shade700,
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    'THEN',
                                                    style: TextStyle(
                                                      fontSize: 9,
                                                      fontWeight:
                                                          FontWeight.w600,
                                                      color: Colors
                                                          .purple
                                                          .shade700,
                                                    ),
                                                  ),
                                                  Text(
                                                    area.reaction.serviceName,
                                                    style: TextStyle(
                                                      fontSize: 13,
                                                      fontWeight:
                                                          FontWeight.w600,
                                                      color:
                                                          Colors.grey.shade900,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),

                                      const SizedBox(height: 12),

                                      // Actions row
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.end,
                                        children: [
                                          // Toggle switch
                                          Container(
                                            decoration: BoxDecoration(
                                              color: Colors.grey.shade100,
                                              borderRadius:
                                                  BorderRadius.circular(20),
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Padding(
                                                  padding:
                                                      const EdgeInsets.only(
                                                        left: 12,
                                                      ),
                                                  child: Text(
                                                    'Enable',
                                                    style: TextStyle(
                                                      fontSize: 12,
                                                      fontWeight:
                                                          FontWeight.w600,
                                                      color:
                                                          Colors.grey.shade700,
                                                    ),
                                                  ),
                                                ),
                                                Transform.scale(
                                                  scale: 0.8,
                                                  child: Switch(
                                                    value: area.isActive,
                                                    onChanged: (v) =>
                                                        _toggleAreaById(
                                                          area.id,
                                                          v,
                                                        ),
                                                    activeColor: Colors.green,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          // Delete button
                                          Container(
                                            decoration: BoxDecoration(
                                              color: Colors.red.shade50,
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                            ),
                                            child: IconButton(
                                              icon: Icon(
                                                Icons.delete_outline,
                                                color: Colors.red.shade600,
                                                size: 20,
                                              ),
                                              tooltip: 'Delete area',
                                              onPressed: () =>
                                                  _deleteAreaById(area.id),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ),
        ],
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
