import 'package:flutter/material.dart';

class CounterApp extends StatefulWidget {
  const CounterApp({super.key});

  @override
  State<CounterApp> createState() => _CounterAppState();
}

class _CounterAppState extends State<CounterApp> {
  int counter = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ElevatedButton(
            onPressed: () {
              setState(() {
                counter++;
              });
            },
            child: Text("$counter")),
        const Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(Icons.home),
            Icon(Icons.search),
            Icon(Icons.settings),
          ],
        )
      ],
    );
  }
}

/// the problem from the provided code is using StatelessWidget.
/// to fix this just change the widget to StatefulWidget
/// and before increase the state value (counter) we need to wrap
/// the statement inside setState() to trigger a rebuild of the UI
