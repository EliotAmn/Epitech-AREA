import 'package:flutter/material.dart';
import '../component/input/input_decorations.dart';
import '../component/card/card_button.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

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
          CardButton(
            label: 'Go to Counter Page',
            icon: Icons.explore,
            onTap: () {
              // implement navigation to Counter Page
            },
            color: Colors.blue,
            textColor: Colors.white,
          ),
        ],
      ),
    );
  }
}
