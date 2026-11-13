import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/core/widgets/text_h.dart';
import 'package:triplex/features/profile/domain/profile_notifier.dart';

class AccountCenterCard extends ConsumerStatefulWidget {
  const AccountCenterCard({super.key});

  @override
  ConsumerState<AccountCenterCard> createState() => _AccountCenterCardState();
}

class _AccountCenterCardState extends ConsumerState<AccountCenterCard> {
  void _goToAccountCenter() {
    context.push('/settings/account-center');
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(profileProvider).value;

    final displayName = (user?.name != null && user!.name!.isNotEmpty)
        ? user.name!
        : (user?.username.isNotEmpty ?? false)
            ? user!.username
            : "Triplex User";

    final Size screenSize = MediaQuery.of(context).size;
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _goToAccountCenter,
          borderRadius: BorderRadius.circular(24),
          child: Container(
            padding: const EdgeInsets.all(20),
            width: screenSize.width,
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceBright,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  offset: const Offset(0, 10),
                  blurRadius: 10,
                  color: Theme.of(context).colorScheme.shadow.withAlpha(10),
                )
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Hero(
                      tag: "account_center_title",
                      child: Material(
                        type: MaterialType.transparency,
                        child: TextH2("Account Center", maxLines: 1),
                      ),
                    ),
                    RepaintBoundary(
                      child: Transform.scale(
                        scale: 0.8,
                        child: IconButton(
                          icon: const Icon(Icons.chevron_right),
                          onPressed: _goToAccountCenter,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Expanded(child: TextH4("Name")),
                    Expanded(flex: 3, child: TextH4(displayName)),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Expanded(child: TextH6("Username")),
                    Expanded(flex: 3, child: TextH6(user?.username ?? "")),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Expanded(child: TextH6("Email")),
                    Expanded(flex: 3, child: TextH6(user?.email ?? "")),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
