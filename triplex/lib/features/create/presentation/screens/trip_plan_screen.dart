import 'dart:io';
import 'dart:ui';

import 'package:cupertino_native_better/cupertino_native.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:timelines_plus/timelines_plus.dart';
import 'package:triplex/core/widgets/AdaptiveTextBox.dart';
import 'package:triplex/core/widgets/OutLineTextField.dart';
import 'package:triplex/core/widgets/TextH.dart';
import 'package:triplex/features/create/Domain/notifiers/create_trip_plan_notifier.dart';
import 'package:triplex/features/create/presentation/widgets/goal_intput_widget.dart';
import 'package:triplex/features/create/presentation/widgets/stop_input_widget.dart';
import 'package:triplex/features/create/presentation/widgets/stop_item_widget.dart';

class CreateTripPlanScreen extends ConsumerStatefulWidget {
  const CreateTripPlanScreen({super.key});

  @override
  ConsumerState<CreateTripPlanScreen> createState() => _CreateTripPlanScreenState();
}

class _CreateTripPlanScreenState extends ConsumerState<CreateTripPlanScreen> {

  final Map<int, AnimationController> _fadeControllers = {};

  final ScrollController _scrollController = ScrollController();

  void addStop() {
    ref.read(createTripPlanProvider.notifier).addWaypoint();
    _scrollController.animateTo(_scrollController.position.maxScrollExtent + 50, duration: const Duration(milliseconds: 500), curve: Curves.decelerate);
  }

  void _showStopInputSheet() {
    showModalBottomSheet(
      context: context,
      useRootNavigator: true,
      useSafeArea: true,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.transparent,
      builder: (ctx) => Consumer(
        builder: (context, ref, _) {
          return Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
            ),
            child: Platform.isIOS
                ? const Padding(
                    padding: EdgeInsets.only(top: 20,bottom: 80,right: 20,left: 20),
                    child: StopInputWidget(),
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
                        child: const StopInputWidget(),
                      ),
                    ),
                  ),
          );
        },
      ),
    );
  }

  Future<void> removeStop(int number) async {
    try {
      _fadeControllers[number]?.animateTo(0, duration: const Duration(milliseconds: 300));

      await Future.delayed(const Duration(milliseconds: 300));

      if (!mounted) return;
      ref.read(createTripPlanProvider.notifier).removeWaypoint(number);
      setState(() {
        _fadeControllers.remove(number);
      });
    } catch (e) {
      ref.read(createTripPlanProvider.notifier).removeWaypoint(number);
      setState(() {
        _fadeControllers.remove(number);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final waypoints = ref.watch(createTripPlanProvider).waypoints;
    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      onPanDown: (_) => FocusManager.instance.primaryFocus?.unfocus(),
      child: ListView(
        physics: const ClampingScrollPhysics(),
        controller: _scrollController,
        children: [
          const OutlineTextField(
            hint: "Title",
            controller: null,
          ),
          AdaptiveTextBox(
            hint: "your trip's name...",
          ),
          const Row(
            mainAxisAlignment: .center,
            children: [
              TextH5("Stops"),
              Icon(Icons.route_rounded)
            ],
          ),
          Timeline.tileBuilder(
              physics: const NeverScrollableScrollPhysics(),
              theme: TimelineThemeData(
                  nodePosition: 0.05,
                  connectorTheme: const ConnectorThemeData(
                      thickness: 2,
                      color: CupertinoColors.activeBlue
                  )
              ),
              shrinkWrap: true,
              builder: TimelineTileBuilder(
                  startConnectorBuilder: (context,index) {
                    return  index == 0 ?
                    Connector.transparent()
                        :
                    Connector.solidLine().animate(
                        effects: const [FadeEffect()],
                        onInit: (controller) {
                          _fadeControllers[waypoints[index].sortOrder] = controller;
                        },
                        onPlay: (controller) {
                          controller.animateTo(0);
                        },
                        onComplete: (controller) {
                          controller.animateTo(1, duration: const Duration(milliseconds: 500));
                        }
                    );
                  },

                  indicatorBuilder: (context,index) {
                    return Stack(
                      alignment: .center,
                      children: [
                        Container(
                          width: 25,height: 25,
                          decoration: BoxDecoration(
                            borderRadius: .circular(12.5),
                            gradient: const RadialGradient(
                                colors: [Colors.blueAccent,Colors.pinkAccent,Colors.greenAccent, Colors.black,],
                                focal: .bottomLeft,
                                focalRadius: 1,
                                center: .topCenter,
                                radius: .6
                            ),
                          ),
                        ).animate(
                          effects: const [ScaleEffect()],
                        ),
                        Container(
                          width: 20,height: 20,
                          decoration: BoxDecoration(
                              color: Colors.white.withAlpha(0),
                              borderRadius: .circular(12.5),
                              boxShadow: [BoxShadow(color: Theme.of(context).colorScheme.onSurface.withAlpha(50))]
                          ),
                        )
                      ],
                    );
                  },

                  endConnectorBuilder: (context,index) {
                    return index == waypoints.length - 1 ?
                    Connector.transparent()
                        :
                    Connector.solidLine().animate(
                        effects: [const FadeEffect()],
                        onInit: (controller) {
                          _fadeControllers[waypoints[index].sortOrder] = controller;
                        },
                        onPlay: (controller) {
                          controller.animateTo(0);
                        },
                        onComplete: (controller) {
                          controller.animateTo(1, duration: const Duration(milliseconds: 500));
                        }
                    );
                  },
                  itemCount: waypoints.length,
                  contentsBuilder: (context,index) {
                    return
                      StopItemWidget(index: index).animate(
                          effects: const [FadeEffect()],
                          onInit: (controller) {
                            _fadeControllers[waypoints[index].sortOrder] = controller;
                          },
                          onPlay: (controller) {
                            controller.animateTo(0);
                          },
                          onComplete: (controller) {
                            controller.animateTo(1, duration: const Duration(milliseconds: 500));
                          }
                      );
                  }
              ),
          ),
          Center(
            child: IconButton(
              onPressed: _showStopInputSheet,
              icon: const Icon(Icons.add_circle_outline_rounded, size: 36),
            ),
          ),
          const Center(
              child: GoalInputWidget()
          )
        ],
      ));
  }
}
