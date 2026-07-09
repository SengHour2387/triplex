
import 'dart:io';

import 'package:cupertino_native_better/cupertino_native.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:triplex/core/widgets/AdptiveTopBlur.dart';
import 'package:triplex/core/widgets/TextH.dart';
import 'package:triplex/features/create/presentation/screens/trip_plan_screen.dart';

class CreateScreen extends StatefulWidget {
  const CreateScreen({super.key});

  @override
  State<CreateScreen> createState() => _CreateScreenState();
}

class _CreateScreenState extends State<CreateScreen> {
  // State variables
  int _segmentIndex = 0;

  // Controllers
  final PageController _pageController = PageController();


  @override
  Widget build(BuildContext context) {

    final Size screenSize = MediaQuery.of(context).size;

    return Scaffold(
      extendBodyBehindAppBar: true,
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        centerTitle: true,
        forceMaterialTransparency: true,
        title: const Text("Create",style: TextStyle(fontFamily: "logo_font",fontSize: 32),),
        actions: [
          if (Platform.isIOS) CNButton(
                tint: CupertinoColors.systemBlue,
                label: "Post",
                onPressed: () {},) else ElevatedButton(onPressed: () {}, child: const TextH6("Post")),
          const SizedBox(width: 20,)
        ],
        bottom: PreferredSize(preferredSize: AppBar().preferredSize,
            child: Stack(
              children: [
                Center(
                  child: SizedBox(
                    width: 200,
                    child: CNSegmentedControl(
                      // color: Colors.blue.withAlpha(100),
                        color: Theme.of(context).colorScheme.surfaceBright,
                        labels: const ["Trip Plan","Media"],
                        selectedIndex: _segmentIndex,
                        iconGradientEnabled: true,
                        onValueChanged: (index) {
                        _pageController.animateToPage(index, duration: const Duration(milliseconds: 500), curve: Easing.emphasizedDecelerate);
                          setState(() {
                            _segmentIndex = index;
                          });
                        }),
                  ).liquidGlass(),
                ),
              ],
            ),
        ),
      ),
      body: Stack(
        children: [
          Container(
            key: ValueKey(Theme.of(context).brightness),
            width: screenSize.width,
            height: screenSize.height,
            decoration: BoxDecoration(
              gradient: RadialGradient(
                stops: const [.3,.4,.7,1],
                colors: [Colors.pink,Colors.blue.withAlpha(50),Colors.cyanAccent.withAlpha(20),Colors.transparent],
                  focalRadius: .7,
                  focal: .bottomCenter,
                  center: .topCenter,
                  radius: .9
              ),
            ),
          ).animate(
            effects: const [FadeEffect()]
          ),
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
            child: PageView(
              padEnds: false,
              clipBehavior: .antiAliasWithSaveLayer,
              scrollBehavior: const MaterialScrollBehavior(),
              controller: _pageController,
              onPageChanged: (index) {
                setState(() {
                  _segmentIndex = index;
                });
              },
              children: const [
                CreateTripPlanScreen(),
                Center(
                  child: TextH1("Media"),
                )
              ],
            ),
          ),
          const AdaptiveTopBlur()
        ],
      ),
    );
  }
}
