import 'dart:ui';

import 'package:flutter/material.dart';

class AdaptiveTopBlur extends StatelessWidget {
  const AdaptiveTopBlur({super.key});

  @override
  Widget build(BuildContext context) {
    final Size screenSize = MediaQuery.of(context).size;

    return Stack(
      children: [

        // ClipRect(child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 2.5,sigmaY: 2.5),
        //   child: SizedBox(height: MediaQuery.paddingOf(context).top*0.7,width: screenSize.width,),)),
        //
        // ClipRect(child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 2,sigmaY: 2),
        //   child: SizedBox(height: MediaQuery.paddingOf(context).top*0.8,width: screenSize.width,),)),
        //
        // ClipRect(child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 1.5,sigmaY: 1.5),
        //   child: SizedBox(height: MediaQuery.paddingOf(context).top*0.9,width: screenSize.width,),)),
        //
        // ClipRect(child: BackdropFilter(
        //   filter: ImageFilter.blur(sigmaX: 1,sigmaY: 1),
        //   child: SizedBox(height: MediaQuery.paddingOf(context).top*0.95,width: screenSize.width,),)),

        ClipRect(child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 5,sigmaY: 5),
          child: SizedBox(height: MediaQuery.paddingOf(context).top,width: screenSize.width,),)),

      ],
    );
  }
}
