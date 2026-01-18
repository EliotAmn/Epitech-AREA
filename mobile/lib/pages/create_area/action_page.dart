import 'package:flutter/material.dart';
import '../../global/service_model.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/global/cache.dart' as cache;
import 'action_config_page.dart';
import 'dart:convert';
import 'oauth_page.dart';
import '../../component/page/service_header.dart';
import '../../component/list/action_list_item.dart';

class ActionPage extends StatefulWidget {
  const ActionPage({
    super.key,
    required this.service,
    required this.allServices,
  });

  final Service service;
  final List<Service> allServices;

  @override
  State<ActionPage> createState() => _ActionPageState();
}

class _ActionPageState extends State<ActionPage> {
  var isConnected = false;

  void _getConnectionStatus() async {
    http.Response response = await http.get(
      Uri.parse(
        '${await cache.ApiSettingsStore().loadApiUrl()}/services/${widget.service.name}/status',
      ),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${await cache.AuthStore().loadToken()}',
      },
    );

    if (response.statusCode == 200) {
      final data = response.body;
      final decoded = jsonDecode(data);
      setState(() {
        isConnected = decoded['connected'] as bool;
      });
    } else {
      debugPrint('Failed to load connection status: ${response.statusCode}');
    }
  }

  @override
  void initState() {
    super.initState();
    _getConnectionStatus();
  }

  Color get serviceColor =>
      Color(int.parse('0xFF${widget.service.color.substring(1)}'));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.9),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Icon(
              Icons.arrow_back,
              color: Color(
                int.parse('0xFF${widget.service.color.substring(1)}'),
              ),
            ),
          ),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(int.parse('0xFF${widget.service.color.substring(1)}')),
              Color(
                int.parse('0xFF${widget.service.color.substring(1)}'),
              ).withValues(alpha: 0.8),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header section with service info
              ServiceHeader(
                service: widget.service,
                isConnected: isConnected,
                onConnect: !isConnected
                    ? () async {
                        final success = await OAuthPage(
                          oauthUrl: widget.service.oauthUrl!,
                          serviceName: widget.service.name,
                        ).initiateOAuthFlow(context);
                        if (success && mounted) {
                          setState(() {
                            _getConnectionStatus();
                          });
                        }
                      }
                    : null,
              ),

              // Actions list
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(30),
                      topRight: Radius.circular(30),
                    ),
                  ),
                  child: Column(
                    children: [
                      const SizedBox(height: 20),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24.0),
                        child: Row(
                          children: [
                            Icon(
                              Icons.play_arrow,
                              color: Color(
                                int.parse(
                                  '0xFF${widget.service.color.substring(1)}',
                                ),
                              ),
                              size: 24,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Available Actions',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey.shade900,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Expanded(
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          itemCount: widget.service.actions.length,
                          itemBuilder: (context, index) {
                            final action = widget.service.actions[index];
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 12.0),
                              child: ActionListItem(
                                accentColor: serviceColor,
                                label: action.label,
                                description: action.description.isNotEmpty
                                    ? action.description
                                    : null,
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (context) => ActionConfigPage(
                                        serviceName: widget.service.name,
                                        action: action,
                                        allServices: widget.allServices,
                                      ),
                                    ),
                                  );
                                },
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
