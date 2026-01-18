import 'package:mobile/utils/string_utils.dart';
import 'area_detail_page.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/global/area_model.dart';
import 'package:mobile/global/cache.dart' as cache;
import 'dart:convert';
import 'package:forui/forui.dart';

class EditAreaPage extends StatefulWidget {
  final Area area;

  const EditAreaPage({super.key, required this.area});

  @override
  State<EditAreaPage> createState() => _EditAreaPageState();
}

class _EditAreaPageState extends State<EditAreaPage> {
  final TextEditingController _nameController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _nameController.text = widget.area.name;
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _saveChanges() async {
    final updatedArea = Area(
      id: widget.area.id,
      name: _nameController.text,
      action: widget.area.action,
      reaction: widget.area.reaction,
    );
    final String? apiSettingsUrl = await cache.ApiSettingsStore().loadApiUrl();

    http.delete(
      Uri.parse('$apiSettingsUrl/areas/${widget.area.id}'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${await cache.AuthStore().loadToken()}',
      },
    );

    final response = await http.post(
      Uri.parse('$apiSettingsUrl/areas'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${await cache.AuthStore().loadToken()}',
      },
      body: jsonEncode(updatedArea.toJson()),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save changes: ${response.statusCode}'),
          ),
        );
      }
      return;
    }

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (context) => AreaDetailPage(area: updatedArea),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.grey.shade900),
        title: Text(
          'Edit Area',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.grey.shade900,
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 24),

              // Action section
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      Icons.play_arrow,
                      color: Colors.blue.shade700,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'IF - Action Parameters',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey.shade900,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: Colors.blue.withOpacity(0.2),
                    width: 1.5,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      humanize(widget.area.action.actionName),
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Colors.blue.shade900,
                      ),
                    ),
                    if (widget.area.action.inputValues.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      for (var inputs in [widget.area.action.inputValues])
                        ...inputs.entries.map((entry) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  entry.key,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey.shade700,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Container(
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: FTextField(
                                    control: FTextFieldControl.managed(
                                      initial: TextEditingValue(
                                        text: entry.value.toString(),
                                      ),
                                      onChange: (value) {
                                        inputs[entry.key] = value.text;
                                        widget.area.action.inputValues[entry
                                                .key] =
                                            value.text;
                                      },
                                    ),
                                    hint: 'Enter ${entry.key}',
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                    ] else
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Text(
                          'No parameters',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Reaction section
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.purple.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      Icons.refresh,
                      color: Colors.purple.shade700,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'THEN - Reaction Parameters',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey.shade900,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.purple.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: Colors.purple.withOpacity(0.2),
                    width: 1.5,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      humanize(widget.area.reaction.reactionName),
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Colors.purple.shade900,
                      ),
                    ),
                    if (widget.area.reaction.inputValues.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      for (var inputs in [widget.area.reaction.inputValues])
                        ...inputs.entries.map((entry) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  entry.key,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey.shade700,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Container(
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: FTextField(
                                    hint: 'Enter ${entry.key}',
                                    control: FTextFieldControl.managed(
                                      initial: TextEditingValue(
                                        text: entry.value.toString(),
                                      ),
                                      onChange: (value) {
                                        inputs[entry.key] = value.text;
                                        widget.area.reaction.inputValues[entry
                                                .key] =
                                            value.text;
                                      },
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                    ] else
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Text(
                          'No parameters',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Save button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: Colors.green.shade600,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 4,
                  ),
                  onPressed: _saveChanges,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Icon(Icons.save, color: Colors.white),
                      SizedBox(width: 8),
                      Text(
                        'Save Changes',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
