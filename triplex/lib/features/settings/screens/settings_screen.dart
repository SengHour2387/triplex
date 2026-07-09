
import 'package:cupertino_native_better/cupertino_native.dart';
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
          mainAxisSize: MainAxisSize.min,
            spacing: 10,
            children: [
              ListTile(
                style: ListTileStyle.list,
                title: Text("Theme mode"),
                trailing:
                CNPopupMenuButton(
                  shrinkWrap: true,
                    buttonLabel: "Light",
                    items: [CNPopupMenuItem(label: "Light"),CNPopupMenuItem(label: "Dark"),CNPopupMenuItem(label: "System")],
                    onSelected: (i){}),
                tileColor: Theme.of(context).colorScheme.surfaceBright,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24)
                ),
              ),
              CNButton(
                  onPressed: () {},
                  icon: CNSymbol("iphone.and.arrow.forward.outward",size: 14),
                  config: CNButtonConfig(style: .prominentGlass,shrinkWrap: true,labelFontSize: 16,imagePadding: 5),
                  label: "Log out")
            ],
          ),
        ),
      ],
    );
  }
}
