import 'package:mobile/component/card/card_button.dart';
import 'area_detail_page.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/global/area_model.dart';
import 'package:mobile/global/cache.dart' as cache;
import 'dart:convert';


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
          SnackBar(content: Text('Failed to save changes: ${response.statusCode}')),
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
      appBar: AppBar(
        title: const Text('Edit Area'),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
            const SizedBox(height: 20),
            Text( 'Action Parameters', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            CardButton(
              label: widget.area.action.actionName,
              onTap: () {
                // Optionally implement action editing
              },
              color: Colors.black38,
              textColor: Colors.white,
              children: Container(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    for (var inputs in [widget.area.action.inputValues])
                      ...inputs.entries.map((entry) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12.0),
                          child: TextField(
                            decoration: InputDecoration(
                              labelText: entry.key,
                              labelStyle: const TextStyle(color: Color.fromARGB(255, 255, 255, 255)),
                              focusedBorder: UnderlineInputBorder(
                                borderSide: const BorderSide(color: Color.fromARGB(255, 255, 255, 255)),
                              ),
                            ),
                            style: const TextStyle(color: Color.fromARGB(255, 255, 255, 255)),
                            controller: TextEditingController(text: entry.value.toString()),
                            onChanged: (value) {
                              inputs[entry.key] = value;
                              widget.area.action.inputValues[entry.key] = value;
                            },
                          ),
                        );
                      }),
                  ],
              ))
            ),
            const SizedBox(height: 20),
            Text( 'Reaction Parameters', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            CardButton(
              label: widget.area.reaction.reactionName,
              onTap: () {
                // Optionally implement action editing
              },
              color: Colors.black38,
              textColor: Colors.white,
              children: Container(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    for (var inputs in [widget.area.reaction.inputValues])
                      ...inputs.entries.map((entry) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12.0),
                          child: TextField(
                            decoration: InputDecoration(
                              labelText: entry.key,
                              labelStyle: const TextStyle(color: Color.fromARGB(255, 255, 255, 255)),
                              focusedBorder: UnderlineInputBorder(
                                borderSide: const BorderSide(color: Color.fromARGB(255, 255, 255, 255)),
                              ),
                            ),
                            style: const TextStyle(color: Color.fromARGB(255, 255, 255, 255)),
                            controller: TextEditingController(text: entry.value.toString()),
                            onChanged: (value) {
                              inputs[entry.key] = value;
                              widget.area.reaction.inputValues[entry.key] = value;
                            },
                          ),
                        );
                      }),
                  ],

              ))
            ),
            const SizedBox(height: 30),
            CardButton(
              label: 'Save Changes',
              onTap: _saveChanges,
              color: Colors.black38,
              textColor: Colors.white,
            ),
          ],
        ),
        ),
      ),
    );
  }
}