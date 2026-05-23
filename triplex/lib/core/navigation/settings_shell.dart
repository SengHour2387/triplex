import 'dart:io';
import 'dart:ui';

import 'package:cupertino_native_better/components/button.dart';
import 'package:cupertino_native_better/components/floating_island.dart';
import 'package:cupertino_native_better/cupertino_native.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SettingsShell extends StatelessWidget {
  final Widget subPage;
  const SettingsShell({super.key,required this.subPage});

  @override
  Widget build(BuildContext context) {

    Size screenSize = MediaQuery.of(context).size;

    return Scaffold(
      extendBody: true,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        forceMaterialTransparency: true,
        leading:
        Platform.isIOS ?
            Transform.scale(
              scale: 0.8,
              child: CNButton.icon(
                icon: CNSymbol("chevron.left",mode: .multicolor,),
                config: CNButtonConfig(
                  style: .glass
                ),
                onPressed: () {
                  context.pop();
                },
              ),
            ):
            IconButton(onPressed: () {
              context.pop();
            }, icon: Icon(Icons.arrow_back_ios_new_rounded)),
        title: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10,vertical: 2),
          child: Text("Settings")
        ).liquidGlass(interactive: true),centerTitle: true,
      ),
      body: Stack(
        children: [
          ShaderMask(
            shaderCallback: (Rect bounds) {
              return const LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment(0.0, 0.25),        // taller fade = bigger number
                colors: [Colors.transparent, Colors.white],
                stops: [0.0, 0.32],
              ).createShader(bounds);
            },
            blendMode: BlendMode.dstIn,
            child: subPage,   // ← Your ListView
          ),
          ClipRect(child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 2,sigmaY: 2),child: SizedBox(height: AppBar().preferredSize.height,width: screenSize.width,),)),
          ClipRect(child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 1,sigmaY: 1),child: SizedBox(height: AppBar().preferredSize.height + kToolbarHeight-10,width: screenSize.width,),)),
          ClipRect(child: BackdropFilter(filter: ImageFilter.blur(sigmaX: .5,sigmaY: .5),child: SizedBox(height: AppBar().preferredSize.height + kToolbarHeight,width: screenSize.width,),)),
        ],
      )
    );
  }
}
