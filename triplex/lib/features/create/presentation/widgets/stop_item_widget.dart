import 'dart:io';
import 'dart:ui';

import 'package:cupertino_native_better/cupertino_native.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:triplex/core/widgets/TextH.dart';
import 'package:triplex/features/create/Domain/notifiers/create_trip_plan_notifier.dart';
import 'package:triplex/features/create/presentation/widgets/stop_input_widget.dart';

class StopItemWidget extends ConsumerWidget {
  final int index;

  const StopItemWidget({super.key, required this.index});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stopItemModel = ref.watch(createTripPlanProvider).waypoints[index];

    return Padding(
      padding: .all(5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            flex: 5,
            child: Padding(
              padding: const EdgeInsets.only(left: 12, right: 8),
              child: Column(
                mainAxisAlignment: .start,
                crossAxisAlignment: .start,
                mainAxisSize: .min,
                children: [
                  TweenAnimationBuilder<Color?>(
                    tween: ColorTween(
                      begin: Colors.white,
                      end: Theme.of(context).colorScheme.onSurface,
                    ),
                    duration: const Duration(milliseconds: 800),
                    builder: (context, color, _) {
                      return Text(
                        stopItemModel.title,
                        style: TextStyle(fontSize: 18, color: color ?? Theme.of(context).colorScheme.onSurface),
                      );
                    },
                  ),
                  TextPlain( "At: ${stopItemModel.location??"unknown"}",fontSize: 12,),
                ],
              ),
            ),
          ),
          IconButton(
            onPressed: () {
              showModalBottomSheet(
                context: context,
                useRootNavigator: true,
                useSafeArea: true,
                isScrollControlled: true,
                showDragHandle: true,
                backgroundColor: Colors.transparent,
                barrierColor: Colors.transparent,
builder: (ctx) => Consumer(
                      builder: (context, ref, _) {
                        return Padding(
                          padding: EdgeInsets.only(
                            bottom: MediaQuery.of(context).viewInsets.bottom,
                          ),
                          child: Platform.isIOS
                              ? Padding(
                                  padding: const EdgeInsets.only(top: 20,bottom: 80,right: 20,left: 20),
                                  child: StopInputWidget(editStop: stopItemModel),
                                ).liquidGlass(shape: .rect, cornerRadius: 42)
                              : ClipRRect(
                                  borderRadius: BorderRadius.circular(42),
                                  child: BackdropFilter(
                                    filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                                    child: Container(
                                      padding: const EdgeInsets.only(top: 20,bottom: 80,right: 20,left: 20),
                                      margin: const EdgeInsets.symmetric(horizontal: 8),
                                      decoration: BoxDecoration(
                                        color: Theme.of(context).colorScheme.surfaceBright.withAlpha(180),
                                        borderRadius: BorderRadius.circular(42),
                                      ),
                                      child: StopInputWidget(editStop: stopItemModel),
                                    ),
                                  ),
                                ),
                        );
                      },
                    ),
              );
            },
            icon: const Icon(Icons.edit_note_rounded),
            color: CupertinoColors.systemGreen,
            iconSize: 22,
          ),

          IconButton(
            onPressed: () {
              ref.read(createTripPlanProvider.notifier).removeWaypoint(stopItemModel.sortOrder);
            },
            icon: const Icon(Icons.remove_rounded),
            color: CupertinoColors.destructiveRed,
            iconSize: 22,
          ),
        ],
      ),
    );
  }
}
