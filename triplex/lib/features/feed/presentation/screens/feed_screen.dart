
import 'package:flutter/material.dart';
import 'package:triplex/core/widgets/AdptiveTopBlur.dart';

class FeedScreen extends StatelessWidget {
  const FeedScreen({super.key});

  @override
  Widget build(BuildContext context) {

    final screenSize = MediaQuery.of(context).size;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(forceMaterialTransparency: true, title: const Text("Feed"),),
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
            child: ListView.builder(
              itemCount: 80,
                itemBuilder: (context,index) {
                  return Row(
                    mainAxisAlignment: .spaceEvenly,
                    mainAxisSize: .min,
                    children: [
                      Container(
                      margin: const .all(10),
                  width: screenSize.width*.3,
                  height: 80,
                  decoration: BoxDecoration(
                  borderRadius: .circular(24),
                  color: Colors.teal
                  ),
                  ),
                      Container(
                        margin: const .all(10),
                        width: screenSize.width*.5,
                        height: 80,
                        decoration: BoxDecoration(
                            borderRadius: .circular(24),
                            color: Colors.teal
                        ),
                      )
                    ],
                  );
                }
            ) // ← Your ListView
          ),

          const AdaptiveTopBlur()
        ],
      ),
    );
  }
}
