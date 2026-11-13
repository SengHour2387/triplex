import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:triplex/features/auth/domain/auth_notifier.dart';
import 'package:triplex/features/settings/domain/theme_mode_provider.dart';
import 'package:triplex/features/settings/presentation/widgets/account_center_card.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  static const _labels = ["Light", "Dark", "System"];
  static const _modes = [ThemeMode.light, ThemeMode.dark, ThemeMode.system];

  @override
  Widget build(BuildContext context) {
    final currentMode = ref.watch(themeModeProvider);
    final selectedIndex = _modes.indexOf(currentMode);

    return ListView(
      children: [
        const AccountCenterCard(),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            spacing: 10,
            children: [
              ListTile(
                style: ListTileStyle.list,
                title: const Text("Theme mode"),
                trailing: PopupMenuButton<int>(
                  initialValue: selectedIndex >= 0 ? selectedIndex : 2,
                  itemBuilder: (context) => const [
                    PopupMenuItem(value: 0, child: Text("Light")),
                    PopupMenuItem(value: 1, child: Text("Dark")),
                    PopupMenuItem(value: 2, child: Text("System")),
                  ],
                  onSelected: (i) =>
                      ref.read(themeModeProvider.notifier).setMode(_modes[i]),
                ),
                tileColor: Theme.of(context).colorScheme.surfaceBright,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
              ),
              CupertinoButton.filled(
                child: const Text("Log out"),
                onPressed: () =>
                    ref.read(authNotifierProvider.notifier).logout(),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
