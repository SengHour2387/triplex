import 'dart:io';

import 'package:currency_picker_plus/currency_picker_plus.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:triplex/core/toast/toast_provider.dart';
import 'package:triplex/core/widgets/currency_picker.dart';
import 'package:triplex/core/widgets/liquid_glass_shim.dart';
import 'package:triplex/core/widgets/outline_text_field.dart';
import 'package:triplex/core/widgets/text_h.dart';
import 'package:triplex/features/create/domain/notifiers/create_trip_plan_notifier.dart';
import 'package:triplex/features/create/domain/notifiers/way_point_notifier.dart';
import 'package:triplex/features/create/domain/stop_item_model.dart';
import 'package:triplex/features/map/domain/POI_place.dart';
import 'package:triplex/features/map/domain/map_notifier.dart';
import 'package:triplex/features/map/presentation/screens/native_location_picker.dart';

class StopInputWidget extends ConsumerStatefulWidget {
  final StopItemModel? editStop;

  const StopInputWidget({super.key, this.editStop});

  @override
  ConsumerState<StopInputWidget> createState() => _StopInputWidgetState();
}

class _StopInputWidgetState extends ConsumerState<StopInputWidget> {
  Currency _currency = currencies.where((c) => c.code == "KHR").first;

  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _costController = TextEditingController();

  bool get _isEditing => widget.editStop != null;

  Future<POIPlace> _fetchPlaceDetails(String placeId, LatLng latLng) {
    return ref.read(wayPointProvider.notifier).fetchPlaceDetails(
          placeId,
          latLng: latLng,
        );
  }

  void _onPOISelected(POIPlace poi) {
    ref.read(wayPointProvider.notifier).setPOI(poi);
  }

  Future<void> onPickLocationSheet() async {
    final waypoint = ref.read(wayPointProvider);
    final existingWaypoints = ref.read(createTripPlanProvider).waypoints;
    await showCupertinoSheet<POIPlace>(
      enableDrag: false,
      context: context, scrollableBuilder: (BuildContext context, ScrollController controller) {
      Widget widgetBuilder(BuildContext context) => NativeLocationPicker(
        isDialog: true,
        initialLatitude: waypoint.latitude,
        initialLongitude: waypoint.longitude,
        onPOISelected: _onPOISelected,
        onFetchPlaceDetails: _fetchPlaceDetails,
        existingWaypoints: existingWaypoints,
      );
      return widgetBuilder(context);
    },
    );
  }

  Future<void> onPickCurrencySheet() async {
    if (Platform.isIOS) {
      final c = await showCurrencyBottomIOS(context);
      if (c != null) {
        setState(() {
          _currency = c;
        });
      }
    } else {
      showCurrencyBottomSheet(
        context: context,
        showFlag: false,
        onSelect: (c) {
          setState(() {
            _currency = c;
          });
        },
        theme: CurrencyPickerThemeData(),
      );
    }
  }

  void onSaveWaypoint() {
    ref.read(wayPointProvider.notifier).setTitle(_titleController.text.trim());
    final double? cost = double.tryParse(_costController.text.trim());
    ref.read(wayPointProvider.notifier).setCost(cost);
    ref.read(wayPointProvider.notifier).setCurrency(_currency);
    try {
      if (_isEditing) {
        final updated = ref.read(wayPointProvider).copyWith(
              sortOrder: widget.editStop!.sortOrder,
            );
        ref.read(createTripPlanProvider.notifier).updateWaypoint(
              widget.editStop!.sortOrder,
              updated,
            );
      } else {
        ref.read(createTripPlanProvider.notifier).addWaypoint();
      }
      ref.read(wayPointProvider.notifier).clearInput();
      _titleController.clear();
      _costController.clear();
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      ref
          .read(toastProvider.notifier)
          .showError(e.toString().replaceAll("Exception: ", ""));
    }
  }

  @override
  void initState() {
    super.initState();
    if (widget.editStop != null) {
      final stop = widget.editStop!;
      _titleController.text = stop.title;
      _costController.text = stop.cost?.toStringAsFixed(2) ?? '';
      if (stop.currency != null) {
        final found = currencies.where((c) => c.code == stop.currency);
        if (found.isNotEmpty) _currency = found.first;
      }
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(wayPointProvider.notifier).loadFromStopItem(stop);
      });
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _costController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: Colors.transparent,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedSize(
            duration: const Duration(milliseconds: 300),
            alignment: Alignment.topCenter,
            child: ref.watch(wayPointProvider).latitude == null
                ? const SizedBox.shrink()
                : Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: Platform.isIOS
                          ? Colors.transparent
                          : colorScheme.surfaceBright.withAlpha(180),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: () {
                              final wp = ref.read(wayPointProvider);
                              if (wp.latitude != null && wp.longitude != null) {
                                ref.read(mapRevealProvider.notifier).mapReveal(
                                      context,
                                      LatLng(wp.latitude!, wp.longitude!),
                                    );
                              }
                            },
                            borderRadius: BorderRadius.circular(16),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Row(
                                children: [
                                  Icon(Icons.location_on_rounded,
                                      size: 16, color: colorScheme.primary),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      ref.watch(wayPointProvider).location ??
                                          "${ref.watch(wayPointProvider).latitude ?? ""}, ${ref.watch(wayPointProvider).longitude ?? ""}",
                                      style: TextStyle(
                                          fontSize: 13,
                                          color: colorScheme.onSurface),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        InkWell(
                          onTap: () => ref
                              .read(wayPointProvider.notifier)
                              .clearLocation(),
                          borderRadius: BorderRadius.circular(12),
                          child: Padding(
                            padding: const EdgeInsets.all(4),
                            child: Icon(Icons.close_rounded,
                                size: 16, color: colorScheme.onSurfaceVariant),
                          ),
                        ),
                      ],
                    ),
                  )
                    .liquidGlass(
                        interactive: true,
                        tint: Colors.greenAccent.withAlpha(100))
                    .animate(effects: const [SlideEffect()]),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              children: [
                Expanded(
                  child: OutlineTextField(
                    textInputAction: TextInputAction.done,
                    controller: _titleController,
                    label: const Text(
                      "what's this place called?",
                      softWrap: false,
                      overflow: TextOverflow.fade,
                    ),
                    borderless: true,
                  ),
                ),
              ],
            ),
          ),
          Container(
              height: 0.5,
              color: colorScheme.outlineVariant.withAlpha(80),
              margin: const EdgeInsets.symmetric(horizontal: 16)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              children: [
                Expanded(
                  child: OutlineTextField(
                    textInputAction: TextInputAction.done,
                    textInputType:
                        const TextInputType.numberWithOptions(decimal: true),
                    controller: _costController,
                    label: const Text("Price?"),
                    borderless: true,
                  ),
                ),
                IconButton(
                  onPressed: onPickCurrencySheet,
                  icon: TextH3(_currency.symbol),
                ),
                IconButton(
                  onPressed: onPickLocationSheet,
                  icon: const Icon(Icons.map_rounded),
                ),
                IconButton(
                  onPressed: onSaveWaypoint,
                  icon: Icon(
                      _isEditing ? Icons.save_rounded : Icons.check_rounded),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
