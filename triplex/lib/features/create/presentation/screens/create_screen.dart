import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:liquid_glass_widgets/liquid_glass_widgets.dart';
import 'package:triplex/core/toast/toast_provider.dart';
import 'package:triplex/features/create/domain/notifiers/create_media_notifier.dart';
import 'package:triplex/features/create/domain/notifiers/create_trip_plan_notifier.dart';
import 'package:triplex/features/create/presentation/screens/media_screen.dart';
import 'package:triplex/features/create/presentation/screens/trip_plan_screen.dart';

class CreateScreen extends ConsumerStatefulWidget {
  const CreateScreen({super.key});

  @override
  ConsumerState<CreateScreen> createState() => _CreateScreenState();
}

class _CreateScreenState extends ConsumerState<CreateScreen> {
  // State variables
  int _segmentIndex = 0;
  bool _isLoading = false;

  // Controllers
  final PageController _pageController = PageController();
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _captionController = TextEditingController();

  Future<void> _handleSave() async {
    if (_segmentIndex != 1) {
      ref
          .read(toastProvider.notifier)
          .show("Media saving is not implemented yet");
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      await ref.read(createTripPlanProvider.notifier).saveTripPlan(
            title: _titleController.text,
            caption: _captionController.text,
          );

      _titleController.clear();
      _captionController.clear();

      if (mounted) {
        ref
            .read(toastProvider.notifier)
            .showSuccess("Trip plan saved successfully");
      }
    } catch (e) {
      if (mounted) {
        ref
            .read(toastProvider.notifier)
            .showError(e.toString().replaceAll("Exception: ", ""));
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handlePost() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final mediaState = ref.read(createMediaProvider);
      await ref.read(createTripPlanProvider.notifier).createFullPost(
            title: _titleController.text,
            caption: _captionController.text,
            mediaFiles: mediaState.mediaFiles,
            includeTripPlan: mediaState.includeTripPlan,
          );

      _titleController.clear();
      _captionController.clear();

      if (mounted) {
        ref
            .read(toastProvider.notifier)
            .showSuccess("Post published successfully");
      }
    } catch (e) {
      if (mounted) {
        ref
            .read(toastProvider.notifier)
            .showError(e.toString().replaceAll("Exception: ", ""));
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    _titleController.dispose();
    _captionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final Size screenSize = MediaQuery.of(context).size;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        actions: [
          CupertinoButton.filled(
            onPressed: _handleSave,
            child: const Text("Save"),
            
          ),
          const SizedBox(width: 8),
          CupertinoButton.filled(
            onPressed: _handlePost,
            child: const Text("Post"),
            
          ),
        ],
      ),
      body: Stack(
        children: [
          Container(
            key: ValueKey(Theme.of(context).brightness),
            width: screenSize.width,
            height: screenSize.height,
            decoration: BoxDecoration(
              gradient: RadialGradient(
                stops: const [.3, .4, .7, 1],
                colors: [
                  Colors.pink,
                  Colors.blue.withAlpha(50),
                  Colors.cyanAccent.withAlpha(20),
                  Colors.transparent,
                ],
                focalRadius: .7,
                focal: Alignment.bottomCenter,
                center: Alignment.topCenter,
                radius: .9,
              ),
            ),
          ).animate(effects: const [FadeEffect()]),
          ShaderMask(
            shaderCallback: (Rect bounds) {
              return const LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment(0.0, 0.25),
                colors: [Colors.transparent, Colors.white],
                stops: [0.0, 0.32],
              ).createShader(bounds);
            },
            blendMode: BlendMode.dstIn,
            child: PageView(
              padEnds: false,
              clipBehavior: Clip.antiAliasWithSaveLayer,
              scrollBehavior: const MaterialScrollBehavior(),
              controller: _pageController,
              onPageChanged: (index) {
                setState(() {
                  _segmentIndex = index ?? 0;
                });
              },
              children: [
                MediaScreen(
                  captionController: _captionController,
                ),
                CreateTripPlanScreen(
                  titleController: _titleController,
                  captionController: _captionController,
                ),
              ],
            ),
          ),
          Align(
            alignment: Alignment.topCenter,
            child: GlassContainer(
              useOwnLayer: true,
              shape: const LiquidRoundedRectangle(borderRadius: 0),
              child: SizedBox(
                width: double.infinity,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16.0, vertical: 12.0),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          const Text(
                            "Create",
                            style: TextStyle(
                                fontFamily: "logo_font", fontSize: 32),
                          ),
                          Align(
                            alignment: Alignment.centerRight,
                            child: _isLoading
                                ? const SizedBox(
                                    width: 50,
                                    height: 40,
                                    child: Center(
                                      child:
                                          CircularProgressIndicator.adaptive(),
                                    ),
                                  )
                                : Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      CupertinoButton.filled(
                                        onPressed: _handleSave,
                                        child: const Text("Save"),
                                        
                                      ),
                                      const SizedBox(width: 8),
                                      CupertinoButton.filled(
                                        onPressed: _handlePost,
                                        child: const Text("Post"),
                                        
                                      ),
                                    ],
                                  ),
                          ),
                        ],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: SizedBox(
                        width: 200,
                        child: CupertinoSlidingSegmentedControl<int>(
                          children: const {
                            0: Padding(
                                padding: EdgeInsets.symmetric(horizontal: 16),
                                child: Text("Media")),
                            1: Padding(
                                padding: EdgeInsets.symmetric(horizontal: 16),
                                child: Text("Trip Plan"))
                          },
                          groupValue: _segmentIndex,
                          onValueChanged: (index) {
                            _pageController.animateToPage(
                              index ?? 0,
                              duration: const Duration(milliseconds: 500),
                              curve: Curves.easeInOutCubic,
                            );
                            setState(() {
                              _segmentIndex = index ?? 0;
                            });
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
