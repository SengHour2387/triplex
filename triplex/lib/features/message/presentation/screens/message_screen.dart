import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class MessageScreen extends StatelessWidget {
  const MessageScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      body: CustomScrollView(
        slivers: [
          const CupertinoSliverNavigationBar(
            largeTitle: Text("Messages"),
            border: null,
          ),
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) => ListTile(
                leading:
                    const Icon(CupertinoIcons.person_circle_fill, size: 40),
                title: Text("Student ${index + 1}",
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: const Text("Tap to view messages"),
                trailing: const Icon(CupertinoIcons.chevron_right,
                    size: 14, color: CupertinoColors.systemGrey),
              ),
              childCount: 4,
            ),
          ),
        ],
      ),
    );
  }
}
