import 'dart:io';

import 'package:cupertino_native_better/cupertino_native.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/core/widgets/AdptiveTopBlur.dart';

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
                icon: const CNSymbol("chevron.left",mode: .multicolor,),
                onPressed: () {
                  context.pop();
                },
              ),
            ):
            IconButton(onPressed: () {
              context.pop();
            }, icon: const Icon(Icons.arrow_back_ios_new_rounded)),
        title: const Padding(
          padding: EdgeInsets.symmetric(horizontal: 10,vertical: 2),
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

          const AdaptiveTopBlur()

        ],
      )
    );
  }
}
