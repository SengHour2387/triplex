import 'dart:io';

import 'package:cupertino_native_better/cupertino_native.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/core/widgets/TextH.dart';
import 'package:triplex/features/profile/Domain/ProfileNotifier.dart';

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

    Size screenSize = MediaQuery.of(context).size;
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Container(
        padding: .all(20),
        width: screenSize.width,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceBright,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [BoxShadow(offset: Offset(0, 10),blurRadius: 10,color: Theme.of(context).colorScheme.shadow.withAlpha(10))]
        ),
        child:
        Column(
          crossAxisAlignment: .start,
          children: [
            Row(
              mainAxisSize: .max,
              mainAxisAlignment: .spaceBetween,
              children: [
                const Hero(
                tag: "account_center_title"
                ,child: Material(
                    type: .transparency,
                    child: TextH2("Account Center", maxLines: 1))),
                Platform.isIOS ?
                RepaintBoundary(
                  child: Transform.scale(
                    scale: 0.8,
                    child: CNButton.icon(
                      icon: const CNSymbol("chevron.right",mode: .hierarchical,),
                      config: CNButtonConfig(
                          style: .glass
                      ),
                      onPressed: _goToAccountCenter,
                    ),
                  ),
                ):
                IconButton(onPressed: _goToAccountCenter, icon: const Icon(Icons.arrow_forward_ios_rounded)),
              ],),
            Row(children: [
              Expanded(flex:1,child: TextH4("Name")),
              Expanded(flex:3,child: TextH4("Man Vannda"))
            ],),
            Row(children: [
              Expanded(flex:1,child: TextH6("Username")),
              Expanded(flex:3,child: TextH6(user?.username??""))
            ],),
            Row(children: [
              Expanded(flex:1,child: TextH6("Email")),
              Expanded(flex:3,child: TextH6(user?.email??"")),
              TextH6("Not verified",textAlign: .end,fontSize: 12,color: Theme.of(context).colorScheme.error,)
            ],),
          ],
        ),
      ),
    );
  }
}
