import 'dart:io';
import 'package:currency_picker_plus/currency_picker_plus.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:triplex/core/toast/toast_provider.dart';
import 'package:triplex/core/widgets/currency_picker.dart';
import 'package:triplex/core/widgets/outline_text_field.dart';
import 'package:triplex/core/widgets/text_h.dart';
import 'package:triplex/features/create/domain/notifiers/create_trip_plan_notifier.dart';
import 'package:triplex/features/create/domain/notifiers/goal_notifier.dart';
import 'package:triplex/features/map/domain/POI_place.dart';
import 'package:triplex/features/map/presentation/screens/native_location_picker.dart';

class GoalInputWidget extends ConsumerStatefulWidget {
  const GoalInputWidget({super.key});

  @override
  ConsumerState<GoalInputWidget> createState() => _GoalInputWidgetState();
}

class _GoalInputWidgetState extends ConsumerState<GoalInputWidget> {
  Currency _currency = currencies.where((c) => c.code == "KHR").first;

  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _costController = TextEditingController();

  Future<POIPlace> _fetchPlaceDetails(String placeId, LatLng latLng) {
    return ref
        .read(goalProvider.notifier)
        .fetchPlaceDetails(placeId, latLng: latLng);
  }

  void _onPOISelected(POIPlace poi) {
    ref.read(goalProvider.notifier).setPOI(poi);
  }

  Future<void> onPickLocationSheet() async {
    await showCupertinoSheet<POIPlace>(
      enableDrag: false,
      context: context, scrollableBuilder: (BuildContext context, ScrollController controller) {
      Widget widgetBuilder(BuildContext context) => NativeLocationPicker(
        isDialog: true,
        onPOISelected: _onPOISelected,
        onFetchPlaceDetails: _fetchPlaceDetails,
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

  void onConfirmGoal() {
    ref.read(goalProvider.notifier).setTitle(_titleController.text.trim());
    final double? cost = double.tryParse(_costController.text.trim());
    ref.read(goalProvider.notifier).setCost(cost);
    ref.read(goalProvider.notifier).setCurrency(_currency);
    try {
      ref.read(createTripPlanProvider.notifier).setGoal();
      ref.read(goalProvider.notifier).clearInput();
      _titleController.clear();
      _costController.clear();
    } catch (e) {
      ref
          .read(toastProvider.notifier)
          .showError(e.toString().replaceAll("Exception: ", ""));
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
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
      color: colorScheme.surfaceBright,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Column(
          children: [
            if (ref.watch(goalProvider).latitude != null)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                padding: const EdgeInsets.only(left: 12),
                decoration: BoxDecoration(
                  color: colorScheme.surfaceBright.withAlpha(150),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        ref.watch(goalProvider).location ??
                            "lat: ${ref.read(goalProvider).latitude?.toStringAsFixed(6)}\n"
                                "lng: ${ref.read(goalProvider).longitude?.toStringAsFixed(6)}",
                        style: const TextStyle(fontSize: 12),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    IconButton(
                      onPressed: () {
                        ref.read(goalProvider.notifier).clearLocation();
                      },
                      icon: const Icon(Icons.clear_rounded, size: 14),
                    ),
                  ],
                ),
              ),
            Row(
              children: [
                Expanded(
                  child: OutlineTextField(
                    textInputAction: TextInputAction.next,
                    controller: _titleController,
                    label: const Text(
                      "what's the destination?",
                      softWrap: false,
                      overflow: TextOverflow.fade,
                    ),
                    borderless: true,
                  ),
                ),
              ],
            ),
            Container(
              height: 0.5,
              color: colorScheme.outlineVariant.withAlpha(80),
              margin: const EdgeInsets.symmetric(horizontal: 16),
            ),
            Row(
              children: [
                Expanded(
                  child: OutlineTextField(
                    textInputAction: TextInputAction.done,
                    textInputType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    controller: _costController,
                    label: const Text("Price?"),
                    onSubmitted: (_) => onConfirmGoal(),
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
                  onPressed: onConfirmGoal,
                  icon: const Icon(Icons.check_rounded),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
