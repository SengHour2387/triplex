import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:cupertino_native_better/components/button.dart';
import 'package:cupertino_native_better/components/popup_menu_button.dart';
import 'package:cupertino_native_better/cupertino_native.dart';
import 'package:cupertino_native_better/cupertino_native_better.dart';
import 'package:cupertino_native_better/style/button_style.dart';
import 'package:cupertino_native_better/style/sf_symbol.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/core/widgets/TextH.dart';
import 'package:triplex/features/auth/Domain/AuthNotifier.dart';
import 'package:triplex/features/profile/Domain/ProfileNotifier.dart';
import 'package:triplex/features/profile/Domain/UploadProfilePictureProgressNotifier.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {


  void goToSettings() {
    context.push('/settings');
  }


  @override
  Widget build(BuildContext context) {
    final progressNotifier = ref.watch(uploadProfilePictureProgressNotifierProvider);

        Size screenSize = MediaQuery.of(context).size;

    return Scaffold(
      appBar: AppBar(
        actionsPadding: .symmetric(horizontal:20),
        centerTitle: true,
        title: Text("Profile"),
        actions: [
          Platform.isIOS ? CNPopupMenuButton.icon(
            buttonIcon: CNSymbol("square.and.pencil",size: 18,mode: .multicolor),
            buttonStyle: CNButtonStyle.glass,
            items: [
              CNPopupMenuItem(
                label: 'Open Camera',
                icon: const CNSymbol("camera",size: 16),
              ),
              CNPopupMenuItem(
                label: 'Photo',
                icon: const CNSymbol('photo',size: 16),
              ),
            ],
            onSelected: (index) async {
              switch(index) {
                case 0: await ref.read(profileNotifierProvider.notifier).setProfilePicture(imageSource: .camera);
                case 1: await ref.read(profileNotifierProvider.notifier).setProfilePicture(imageSource: .gallery);
              }
            },
          ) :
           CupertinoContextMenu(
             enableHapticFeedback: true,
             actions: [
               TextButton(
                   onPressed: () async {
                     await ref.read(profileNotifierProvider.notifier).setProfilePicture(imageSource: .gallery);
                   },
                   child: Text("From Gallery")),
               TextButton(
                   onPressed: () async {
                     await ref.read(profileNotifierProvider.notifier).setProfilePicture(imageSource: .camera);
                   },
                   child: Text("Open Camera")),
             ],
             child:ElevatedButton(
                 style: ButtonStyle(
                     foregroundColor: WidgetStatePropertyAll(Theme.of(context).colorScheme.surface),
                     backgroundColor:  WidgetStatePropertyAll(Theme.of(context).colorScheme.onSurface)

                 ),
                 onPressed: () async {
                   await ref.read(profileNotifierProvider.notifier).setProfilePicture(imageSource: .gallery);
                 },
                 child: Icon(CupertinoIcons.square_pencil),
           ),),

          Platform.isIOS ?
              Padding(
                padding: const EdgeInsets.only(left: 5),
                child: CNButton.icon(
                  icon: CNSymbol("gear",size: 18,mode: .monochrome),
                  config: CNButtonConfig(
                    style: .glass,
                  ),
                  onPressed: goToSettings,
                ),
              ) :
              CupertinoButton(child: Icon(Icons.settings), onPressed: goToSettings)

        ],
      ),
      body: ref.watch(profileNotifierProvider).when(
          data: (user){ return
            Column(
              children: [
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(80),
                    border: Border.all(width: 3,color: Colors.blue,strokeAlign: BorderSide.strokeAlignInside),
                    boxShadow: [BoxShadow(blurRadius: 30,color: Theme.of(context).colorScheme.shadow.withAlpha(100),offset: Offset(0, 20),blurStyle: .normal)]
                  ),
                  width: 160,height: 160,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(80),
                    child: progressNotifier == null ? CachedNetworkImage(imageUrl: user?.avatarUrl??"",fit: BoxFit.cover,) :
                    CircularProgressIndicator(value: progressNotifier/100),
                  ),
                ),
                Container(
                  padding: .symmetric(horizontal:20,vertical:40),
                  child: Column(
                    mainAxisSize: .min,
                    crossAxisAlignment: .start,
                    children: [
                      SizedBox(width: screenSize.width),
                      Row(children: [
                        Expanded(flex:2,child: TextH6("Username: ")),
                        Expanded(flex:5,child: TextH6(user?.username??"")),
                      ],),
                      Row(children: [
                        Expanded(flex:2,child: TextH6("Email: ")),
                        Expanded(flex:5,child: TextH6(user?.email??"")),
                      ],),
                    ],
                  ),
                ),
                ElevatedButton(
                    style: ButtonStyle(
                      foregroundColor: WidgetStatePropertyAll(Theme.of(context).colorScheme.surface),
                      backgroundColor: WidgetStatePropertyAll(Theme.of(context).colorScheme.onSurface)
                    ),
                    onPressed: () async {
                      ref.read(authNotifierProvider.notifier).logout();
                    }, child: Text("Log out"))
              ],
            );
          },
          error: (e,t) { return Text("Can't get user info"); },
          loading: () { return CircularProgressIndicator(); }),
    );
  }
}