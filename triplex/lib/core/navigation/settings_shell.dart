import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:triplex/core/widgets/adaptive_top_blur.dart';
import 'package:triplex/core/widgets/liquid_glass_shim.dart';

class SettingsShell extends StatelessWidget {
  final Widget subPage;
  const SettingsShell({super.key, required this.subPage});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        extendBody: true,
        extendBodyBehindAppBar: true,
        appBar: AppBar(
          forceMaterialTransparency: true,
          leading: Transform.scale(
            scale: 0.8,
            child: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new_rounded),
              onPressed: () {
                context.pop();
              },
            ),
          ),
          title: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                  child: Text("Settings"))
              .liquidGlass(interactive: true),
          centerTitle: true,
        ),
        body: Stack(
          children: [
            ShaderMask(
              shaderCallback: (Rect bounds) {
                return const LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment(0.0, 0.25), // taller fade = bigger number
                  colors: [Colors.transparent, Colors.white],
                  stops: [0.0, 0.32],
                ).createShader(bounds);
              },
              blendMode: BlendMode.dstIn,
              child: subPage, // ← Your ListView
            ),
            const AdaptiveTopBlur(),
          ],
        ));
  }
}
