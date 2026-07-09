import 'dart:io';
import 'dart:ui';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:cupertino_native_better/cupertino_native.dart';
import 'package:cupertino_native_better/cupertino_native_better.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/core/widgets/TextH.dart';
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
    final progressNotifier = ref.watch(uploadProfilePictureProgressProvider);
        final Size screenSize = MediaQuery.of(context).size;

    return Scaffold(
      appBar: AppBar(
        forceMaterialTransparency: true,
        actionsPadding: const .symmetric(horizontal:20),
        centerTitle: true,
        title: const Text("Profile"),
        actions: [
          if (Platform.isIOS) CNPopupMenuButton.icon(
            buttonIcon: const CNSymbol("square.and.pencil",size: 18,mode: .multicolor),
            items: const [
              CNPopupMenuItem(
                label: 'Open Camera',
                icon: CNSymbol("camera",size: 16),
              ),
              CNPopupMenuItem(
                label: 'Photo',
                icon: CNSymbol('photo',size: 16),
              ),
            ],
            onSelected: (index) async {
              switch(index) {
                case 0: await ref.read(profileProvider.notifier).setProfilePicture(imageSource: .camera);
                case 1: await ref.read(profileProvider.notifier).setProfilePicture(imageSource: .gallery);
              }
            },
          ) else CupertinoContextMenu(
             enableHapticFeedback: true,
             actions: [
               TextButton(
                   onPressed: () async {
                     await ref.read(profileProvider.notifier).setProfilePicture(imageSource: .gallery);
                   },
                   child: const Text("From Gallery")),
               TextButton(
                   onPressed: () async {
                     await ref.read(profileProvider.notifier).setProfilePicture(imageSource: .camera);
                   },
                   child: const Text("Open Camera")),
             ],
             child:ElevatedButton(
                 style: ButtonStyle(
                     foregroundColor: WidgetStatePropertyAll(Theme.of(context).colorScheme.surface),
                     backgroundColor:  WidgetStatePropertyAll(Theme.of(context).colorScheme.onSurface)
                 ),
                 onPressed: () async {
                   await ref.read(profileProvider.notifier).setProfilePicture(imageSource: .gallery);
                 },
                 child: const Icon(CupertinoIcons.square_pencil),
           ),),

          if (Platform.isIOS) Padding(
                padding: const EdgeInsets.only(left: 5),
                child: CNButton.icon(
                  icon: const CNSymbol("gear",size: 18,mode: .monochrome),
                  onPressed: goToSettings,
                ),
              ) else CupertinoButton(onPressed: goToSettings, child: const Icon(Icons.settings))

        ],
      ),
      body: ref.watch(profileProvider).when(
          data: (user){ return
            Column(
              children: [
                Stack(
                  alignment: .center,
                  children: [
                    ImageFiltered(
                      imageFilter: ImageFilter.blur(sigmaX: 40,sigmaY: 40),
                      child: Container(
                        width: 180,height: 180,
                        decoration: BoxDecoration(
                          borderRadius: .circular(90),
                          gradient: const RadialGradient(
                            colors: [Colors.amber,Colors.pinkAccent ,Colors.greenAccent,Colors.blueAccent],
                            focal: .bottomLeft,
                            focalRadius: .1,
                            center: .topRight,
                          ),
                        ),
                      ),
                    ),
                    Container(
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.surfaceBright.withAlpha( Platform.isIOS ? 0 : 128),
                        borderRadius: BorderRadius.circular(80),
                        border: Border.all(width: 3,color: Colors.grey),
                      ),
                      width: 160,height: 160,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(80),
                        child: progressNotifier == null ? CachedNetworkImage(
                          imageUrl: user?.avatarUrl??"",fit: BoxFit.cover,
                          progressIndicatorBuilder: (_,_,_) =>
                            const Padding(
                              padding: EdgeInsets.all(10.0),
                              child: CircularProgressIndicator(),
                            ),
                          errorWidget: (context,message,error) {
                            return Center(child: TextPlain("Set your profile picture",color: Theme.of(context).colorScheme.inverseSurface.withAlpha(180),textAlign: .center,));
                          },
                        ) :
                        Padding(
                          padding: const EdgeInsets.all(10.0),
                          child: CircularProgressIndicator(value: progressNotifier/100),
                        ),
                      ),
                    ),
                  ],
                ),
                Container( 
                  padding: const .symmetric(horizontal:20,vertical:40),
                  child: Column(
                    mainAxisSize: .min,
                    crossAxisAlignment: .start,
                    children: [
                      SizedBox(width: screenSize.width),
                      Row(children: [
                        const Expanded(flex:2,child: TextH6("Username: ")),
                        Expanded(flex:5,child: TextH6(user?.username??"")),
                      ],),
                      Row(children: [
                        const Expanded(flex:2,child: TextH6("Email: ")),
                        Expanded(flex:5,child: TextH6(user?.email??"")),
                      ],),
                    ],
                  ),
                ),
              ],
            );
          },
          error: (e,t) { return const Text("Can't get user info"); },
          loading: () { return const CircularProgressIndicator(); }),
    );
  }
}
