import 'dart:ui';

import 'package:flutter/material.dart';

class MessageScreen extends StatelessWidget {
  const MessageScreen({super.key});

  @override
  Widget build(BuildContext context) {

    final Size screenSize = MediaQuery.of(context).size;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        forceMaterialTransparency: true,
        title: Text("Messages"),
      ),
      body: Stack(
        children: [
          ListView(
            children: [
              Center(
                child: ElevatedButton(onPressed: () {}, child: const Text("HIII")
                )
            )
            ],
          ),
          ClipRect(child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 2,sigmaY: 2),child: SizedBox(height: AppBar().preferredSize.height,width: screenSize.width,),)),
          ClipRect(child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 1,sigmaY: 1),child: SizedBox(height: AppBar().preferredSize.height + kToolbarHeight-10,width: screenSize.width,),)),
          ClipRect(child: BackdropFilter(filter: ImageFilter.blur(sigmaX: .5,sigmaY: .5),child: SizedBox(height: AppBar().preferredSize.height + kToolbarHeight,width: screenSize.width,),)),
        ],
      ),
    );
  }
}
