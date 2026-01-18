import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:mobile/global/service_model.dart';
import 'package:mobile/pages/create_area/action_page.dart';
import 'package:forui/forui.dart';

class ServiceDetailsPage extends StatelessWidget {
  final Service service;
  final List<Service> allServices;

  const ServiceDetailsPage({
    super.key,
    required this.service,
    required this.allServices,
  });

  @override
  Widget build(BuildContext context) {
    final serviceColor = Color(int.parse('0xFF${service.color.substring(1)}'));
    final isLightColor = serviceColor.computeLuminance() > 0.5;
    final textColor = isLightColor ? Colors.black87 : Colors.white;

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          // Modern app bar with gradient
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            backgroundColor: serviceColor,
            leading: IconButton(
              icon: Icon(Icons.arrow_back, color: textColor),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              centerTitle: true,
              title: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  service.label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [serviceColor, serviceColor.withValues(alpha: 0.7)],
                  ),
                ),
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 60),
                    child: service.logo.toLowerCase().endsWith('.svg')
                        ? SvgPicture.network(
                            service.logo,
                            height: 120,
                            placeholderBuilder: (_) => Icon(
                              Icons.apps,
                              size: 120,
                              color: Colors.white.withValues(alpha: 0.5),
                            ),
                          )
                        : Image.network(
                            service.logo,
                            height: 120,
                            errorBuilder: (_, _, _) => Icon(
                              Icons.apps,
                              size: 120,
                              color: Colors.white.withValues(alpha: 0.5),
                            ),
                          ),
                  ),
                ),
              ),
            ),
          ),

          // Content
          SliverList(
            delegate: SliverChildListDelegate([
              // Description card
              Container(
                margin: const EdgeInsets.all(20),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: serviceColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: serviceColor.withValues(alpha: 0.3),
                    width: 2,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: serviceColor, size: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        service.description,
                        style: TextStyle(
                          fontSize: 15,
                          color: Colors.grey.shade800,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Create area button
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        serviceColor,
                        serviceColor.withValues(alpha: 0.8),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: serviceColor.withValues(alpha: 0.3),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ActionPage(
                              service: service,
                              allServices: allServices,
                            ),
                          ),
                        );
                      },
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.add_circle_outline, color: Colors.white),
                            SizedBox(width: 12),
                            Text(
                              'Create an area',
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
                  ),
                ),
              ),

              const SizedBox(height: 32),

              // Actions section
              if (service.actions.isNotEmpty) ...[
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.blue.withValues(alpha: 0.1),
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
                        'Actions (${service.actions.length})',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey.shade900,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: FAccordion(
                    children: service.actions.map((action) {
                      return FAccordionItem(
                        title: Text(
                          action.label,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 15,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (action.description.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Text(
                                  action.description,
                                  style: TextStyle(
                                    color: Colors.grey.shade700,
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            if (action.inputParams.isNotEmpty)
                              _buildParamSection(
                                context,
                                'Input',
                                action.inputParams,
                                Colors.blue,
                                Icons.input,
                              ),
                            if (action.outputParams.isNotEmpty)
                              _buildParamSection(
                                context,
                                'Output',
                                action.outputParams,
                                Colors.green,
                                Icons.output,
                              ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],

              const SizedBox(height: 32),

              // Reactions section
              if (service.reactions.isNotEmpty) ...[
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.purple.withValues(alpha: 0.1),
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
                        'Reactions (${service.reactions.length})',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey.shade900,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: FAccordion(
                    children: service.reactions.map((reaction) {
                      return FAccordionItem(
                        title: Text(
                          reaction.label,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 15,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (reaction.description.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Text(
                                  reaction.description,
                                  style: TextStyle(
                                    color: Colors.grey.shade700,
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            if (reaction.inputParams.isNotEmpty)
                              _buildParamSection(
                                context,
                                'Input',
                                reaction.inputParams,
                                Colors.purple,
                                Icons.input,
                              ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],

              const SizedBox(height: 40),
            ]),
          ),
        ],
      ),
    );
  }

  Widget _buildParamSection(
    BuildContext context,
    String title,
    List<ActionParam> params,
    MaterialColor color,
    IconData icon,
  ) {
    return Container(
      margin: const EdgeInsets.all(12.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: color.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.shade200, width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color.shade700, size: 20),
              const SizedBox(width: 8),
              Text(
                '$title Parameters',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                  color: color.shade900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...params.map(
            (param) => Container(
              margin: const EdgeInsets.only(bottom: 8.0),
              padding: const EdgeInsets.all(12.0),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: color.shade100,
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Icon(
                    param.requiredParam ? Icons.star : Icons.star_border,
                    color: param.requiredParam
                        ? Colors.orange
                        : Colors.grey.shade400,
                    size: 16,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          param.label,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: Colors.grey.shade900,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${param.name} • ${param.type}',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: param.requiredParam
                          ? Colors.orange.shade50
                          : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: param.requiredParam
                            ? Colors.orange.shade200
                            : Colors.grey.shade300,
                      ),
                    ),
                    child: Text(
                      param.requiredParam ? 'required' : 'optional',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: param.requiredParam
                            ? Colors.orange.shade900
                            : Colors.grey.shade700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
