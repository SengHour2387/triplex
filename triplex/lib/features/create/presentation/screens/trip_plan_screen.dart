import 'dart:io';
import 'dart:ui';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:timelines_plus/timelines_plus.dart';
// import 'package:triplex/features/create/presentation/widgets/route_with_stops_widget.dart';
import 'package:triplex/core/widgets/liquid_glass_shim.dart';
import 'package:triplex/core/widgets/outline_text_field.dart';
import 'package:triplex/core/widgets/text_h.dart';
import 'package:triplex/features/create/domain/notifiers/create_trip_plan_notifier.dart';
import 'package:triplex/features/create/domain/notifiers/way_point_notifier.dart';
import 'package:triplex/features/create/presentation/widgets/goal_intput_widget.dart';
import 'package:triplex/features/create/presentation/widgets/goal_tile_widget.dart';
import 'package:triplex/features/create/presentation/widgets/stop_input_widget.dart';
import 'package:triplex/features/create/presentation/widgets/stop_item_widget.dart';

class CreateTripPlanScreen extends ConsumerStatefulWidget {
  final TextEditingController? titleController;
  final TextEditingController? captionController;

  const CreateTripPlanScreen({
    super.key,
    this.titleController,
    this.captionController,
  });

  @override
  ConsumerState<CreateTripPlanScreen> createState() =>
      _CreateTripPlanScreenState();
}

class _CreateTripPlanScreenState extends ConsumerState<CreateTripPlanScreen> {
  final Map<int, AnimationController> _fadeControllers = {};

  final ScrollController _scrollController = ScrollController();

  void addStop() {
    ref.read(createTripPlanProvider.notifier).addWaypoint();
    _scrollController.animateTo(_scrollController.position.maxScrollExtent + 50,
        duration: const Duration(milliseconds: 500), curve: Curves.decelerate);
  }

  void _showStopInputSheet() {
    final tripPlan = ref.read(createTripPlanProvider);
    if (tripPlan.waypoints.isNotEmpty) {
      final lastStop = tripPlan.waypoints.last;
      if (lastStop.latitude != null && lastStop.longitude != null) {
        ref.read(wayPointProvider.notifier).loadFromStopItem(lastStop);
      }
    }
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
                    padding: EdgeInsets.only(
                        top: 20, bottom: 80, right: 20, left: 20),
                    child: StopInputWidget(),
                  ).liquidGlass(shape: LiquidGlassShape.rect, cornerRadius: 42)
                : ClipRRect(
                    borderRadius: BorderRadius.circular(42),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                      child: Container(
                        padding: const EdgeInsets.only(
                            top: 20, bottom: 80, right: 20, left: 20),
                        margin: const EdgeInsets.symmetric(horizontal: 8),
                        decoration: BoxDecoration(
                          color: Theme.of(context)
                              .colorScheme
                              .surfaceBright
                              .withAlpha(180),
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
      _fadeControllers[number]
          ?.animateTo(0, duration: const Duration(milliseconds: 300));
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
    final colorScheme = Theme.of(context).colorScheme;
    final waypoints = ref.watch(createTripPlanProvider).waypoints;
    return ColoredBox(
      color: colorScheme.surfaceContainerLowest,
      child: GestureDetector(
          behavior: HitTestBehavior.translucent,
          onPanDown: (_) => FocusManager.instance.primaryFocus?.unfocus(),
          child: ListView(
            physics: const ClampingScrollPhysics(),
            controller: _scrollController,
            children: [
              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                color: Theme.of(context).colorScheme.surface,
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    OutlineTextField(
                      hint: "Title", borderless: true,
                      controller: widget.titleController,
                    ),
                    Container(
                        height: 0.5,
                        color: Theme.of(context)
                            .colorScheme
                            .outlineVariant
                            .withAlpha(80),
                        margin: const EdgeInsets.symmetric(horizontal: 16)),
                    CupertinoTextField(
                      
                      placeholder: "your trip's name...", decoration: BoxDecoration(border: Border.all(color: Colors.transparent)),
                      controller: widget.captionController,
                    ),
                  ],
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextH5("Goal"),
                    Icon(Icons.location_pin),
                  ],
                ),
              ),
              Center(
                  child: ref.watch(createTripPlanProvider).end?.latitude == null
                      ? const GoalInputWidget().animate(
                          effects: const [
                            FadeEffect(duration: Duration(milliseconds: 400)),
                          ],
                        )
                      : GoalTileWidget(
                          goal: ref.watch(createTripPlanProvider).end!,
                          onDelete: () => ref
                              .read(createTripPlanProvider.notifier)
                              .clearGoal()).animate(effects: const [
                          SlideEffect(
                              curve: Easing.emphasizedDecelerate,
                              duration: Duration(milliseconds: 400))
                        ])),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 10),
                padding:
                    const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
                child: Column(
                  children: [
                    const Row(
                      children: [
                        TextH5("Stops"),
                        Icon(Icons.turn_sharp_right_rounded),
                      ],
                    ),
                    Timeline.tileBuilder(
                      physics: const NeverScrollableScrollPhysics(),
                      theme: TimelineThemeData(
                          nodePosition: 0.05,
                          connectorTheme: const ConnectorThemeData(
                              thickness: 2, color: CupertinoColors.activeBlue)),
                      shrinkWrap: true,
                      builder: TimelineTileBuilder(
                          startConnectorBuilder: (context, index) {
                            return index == 0
                                ? Connector.transparent()
                                : Connector.solidLine().animate(
                                    effects: const [FadeEffect()],
                                    onInit: (controller) {
                                      _fadeControllers[waypoints[index]
                                          .sortOrder] = controller;
                                    },
                                    onPlay: (controller) {
                                      controller.animateTo(0);
                                    },
                                    onComplete: (controller) {
                                      controller.animateTo(1,
                                          duration: const Duration(
                                              milliseconds: 500));
                                    });
                          },
                          indicatorBuilder: (context, index) {
                            return Stack(
                              alignment: Alignment.center,
                              children: [
                                Container(
                                  width: 25,
                                  height: 25,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(12.5),
                                    gradient: const RadialGradient(
                                        colors: [
                                          Colors.blueAccent,
                                          Colors.pinkAccent,
                                          Colors.greenAccent,
                                          Colors.black,
                                        ],
                                        focal: Alignment.bottomLeft,
                                        focalRadius: 1,
                                        center: Alignment.topCenter,
                                        radius: .6),
                                  ),
                                ).animate(
                                  effects: const [ScaleEffect()],
                                ),
                                Container(
                                  width: 20,
                                  height: 20,
                                  decoration: BoxDecoration(
                                      color: Colors.white.withAlpha(0),
                                      borderRadius: BorderRadius.circular(12.5),
                                      boxShadow: [
                                        BoxShadow(
                                            color: Theme.of(context)
                                                .colorScheme
                                                .onSurface
                                                .withAlpha(50))
                                      ]),
                                )
                              ],
                            );
                          },
                          endConnectorBuilder: (context, index) {
                            return index == waypoints.length - 1
                                ? Connector.transparent()
                                : Connector.solidLine().animate(
                                    effects: [const FadeEffect()],
                                    onInit: (controller) {
                                      _fadeControllers[waypoints[index]
                                          .sortOrder] = controller;
                                    },
                                    onPlay: (controller) {
                                      controller.animateTo(0);
                                    },
                                    onComplete: (controller) {
                                      controller.animateTo(1,
                                          duration: const Duration(
                                              milliseconds: 500));
                                    });
                          },
                          itemCount: waypoints.length,
                          contentsBuilder: (context, index) {
                            return StopItemWidget(index: index).animate(
                                effects: const [FadeEffect()],
                                onInit: (controller) {
                                  _fadeControllers[waypoints[index].sortOrder] =
                                      controller;
                                },
                                onPlay: (controller) {
                                  controller.animateTo(0);
                                },
                                onComplete: (controller) {
                                  controller.animateTo(1,
                                      duration:
                                          const Duration(milliseconds: 500));
                                });
                          }),
                    ),
                    // New canvas-based route shape with positioned stop widgets (commented out)
                    // if (waypoints.isNotEmpty)
                    //   SizedBox(
                    //     height: 300,
                    //     child: RouteWithStopsWidget(stops: waypoints),
                    //   ),
                    IconButton(
                      onPressed: _showStopInputSheet,
                      icon: const Icon(Icons.add_rounded, size: 36),
                    ),
                  ],
                ),
              ),
            ],
          )),
    );
  }
}
