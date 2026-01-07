import 'package:flutter/material.dart';
import '../component/input/input_decorations.dart';
import '../global/area_model.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../global/cache.dart' as cache;
import 'dart:convert';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  List<Area> _areas = [];
  bool _loading = false;
  String? _error;

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
        Uri.parse('${dotenv.env['API_URL']}/areas'),
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
          _loading = false;
        });
      } else {
        if (!mounted) return;
        setState(() {
          _loading = false;
          _error = 'Failed to fetch areas (${response.statusCode})';
        });
        debugPrint('Failed to fetch areas: ${response.body}');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'Network error: $e';
      });
    }
  }

  Future<void> _toggleArea(int index, bool value) async {
    final area = _areas[index];
    final previous = area.isActive;
    // Optimistic update
    setState(() {
      _areas[index] = Area(
        id: area.id,
        name: area.name,
        action: area.action,
        reaction: area.reaction,
        isActive: value,
      );
    });

    final token = await cache.AuthStore().loadToken();
    if (token == null || token.isEmpty) {
      // Revert if not authenticated
      if (!mounted) return;
      setState(() {
        _areas[index] = Area(
          id: area.id,
          name: area.name,
          action: area.action,
          reaction: area.reaction,
          isActive: previous,
        );
      });
      return;
    }

    try {
      final response = await http.patch(
        Uri.parse('${dotenv.env['API_URL']}/areas/${area.id}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'isActive': value}),
      );
      if (response.statusCode < 200 || response.statusCode >= 300) {
        // Revert on failure
        if (!mounted) return;
        setState(() {
          _areas[index] = Area(
            id: area.id,
            name: area.name,
            action: area.action,
            reaction: area.reaction,
            isActive: previous,
          );
        });
        debugPrint('Failed to toggle area: ${response.body}');
      }
    } catch (e) {
      // Revert on error
      if (!mounted) return;
      setState(() {
        _areas[index] = Area(
          id: area.id,
          name: area.name,
          action: area.action,
          reaction: area.reaction,
          isActive: previous,
        );
      });
      debugPrint('Network error toggling area: $e');
    }
  }

  Future<void> _deleteArea(int index) async {
    final area = _areas[index];
    final removed = area;
    setState(() {
      _areas.removeAt(index);
    });

    final token = await cache.AuthStore().loadToken();
    if (token == null || token.isEmpty) {
      if (!mounted) return;
      // Reinsert if not authenticated
      setState(() {
        _areas.insert(index, removed);
      });
      return;
    }

    try {
      final response = await http.delete(
        Uri.parse('${dotenv.env['API_URL']}/areas/${area.id}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode < 200 || response.statusCode >= 300) {
        if (!mounted) return;
        // Reinsert on failure
        setState(() {
          _areas.insert(index, removed);
        });
        debugPrint('Failed to delete area: ${response.body}');
      }
    } catch (e) {
      if (!mounted) return;
      // Reinsert on error
      setState(() {
        _areas.insert(index, removed);
      });
      debugPrint('Network error deleting area: $e');
    }
  }

  @override
  void initState() {
    super.initState();
    getAreas();
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
          Text('EXPLORE', style: Theme.of(context).textTheme.displayLarge),
          SizedBox(
            height: Theme.of(context).textTheme.bodyLarge?.fontSize ?? 16,
          ),
          SizedBox(
            width: 300,
            child: TextField(
              decoration: AppInputDecorations.primary(context, 'Search'),
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
                : _areas.isEmpty
                ? const Center(child: Text('No areas yet'))
                : ListView.builder(
                    itemCount: _areas.length,
                    itemBuilder: (context, index) {
                      final area = _areas[index];
                      final subtitle =
                          '${area.action.serviceName}:${area.action.actionName} → ${area.reaction.serviceName}:${area.reaction.reactionName}';
                      return Card(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        child: ListTile(
                          title: Text(
                            area.name,
                            style: Theme.of(context).textTheme.bodyLarge
                                ?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: Theme.of(
                                    context,
                                  ).colorScheme.onInverseSurface,
                                ),
                          ),
                          subtitle: Text(
                            subtitle,
                            style: Theme.of(context).textTheme.bodyMedium
                                ?.copyWith(
                                  color: Theme.of(
                                    context,
                                  ).colorScheme.onInverseSurface,
                                ),
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Switch(
                                value: area.isActive,
                                onChanged: (v) => _toggleArea(index, v),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete),
                                color: Theme.of(context).colorScheme.error,
                                tooltip: 'Delete area',
                                onPressed: () => _deleteArea(index),
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
    );
  }
}
