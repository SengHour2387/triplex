import 'dart:ui';

import 'package:cupertino_native_better/components/popup_menu_button.dart';
import 'package:flutter/material.dart';
import 'package:triplex/features/settings/conponents/AccountCenterCard.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  Widget build(BuildContext context) {
    Size screenSize = MediaQuery.of(context).size;
    return  ListView(
      children: [
        AccountCenterCard(),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10.0),
          child: Column(
          mainAxisSize: .min,
            children: [
              ListTile(
                style: .list,
                title: Text("Theme mode"),
                trailing:
                CNPopupMenuButton(
                  shrinkWrap: true,
                    buttonLabel: "Light",
                    items: [CNPopupMenuItem(label: "Light"),CNPopupMenuItem(label: "Dark"),CNPopupMenuItem(label: "System")],
                    onSelected: (i){}),
                tileColor: Theme.of(context).colorScheme.surfaceBright,
                shape: RoundedRectangleBorder(
                  borderRadius: .circular(24)
                ),
              )
            ],
          ),
        )
      ],
    );
  }
}
