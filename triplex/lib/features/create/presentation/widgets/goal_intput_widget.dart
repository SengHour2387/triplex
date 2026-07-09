import 'package:currency_picker_plus/currency_picker_plus.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:triplex/core/widgets/OutLineTextField.dart';
import 'package:triplex/core/widgets/TextH.dart';
import 'package:triplex/features/create/Domain/notifiers/create_trip_plan_notifier.dart';
import 'package:triplex/features/create/Domain/notifiers/goal_notifier.dart';
import 'package:triplex/features/map/Domain/POI_place.dart';
import 'package:triplex/features/map/native_location_picker.dart';

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
    return ref.read(goalProvider.notifier).fetchPlaceDetails(
          placeId,
          latLng: latLng,
        );
  }

  void _onPOISelected(POIPlace poi) {
    ref.read(goalProvider.notifier).setPOI(poi);
  }

  void onPickLocationSheet() async {
    await showCupertinoSheet<POIPlace>(
      enableDrag: false,
      context: context,
      builder: (context) => NativeLocationPicker(
        isDialog: true,
        onPOISelected: _onPOISelected,
        onFetchPlaceDetails: _fetchPlaceDetails,
      ),
    );
  }

  void onPickCurrencySheet() {
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
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.toString().replaceAll("Exception: ", ""))));
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
    return Column(
      children: [
        const Row(
          mainAxisSize: .min,
          children: [
            TextH5("Goal"),
            Icon(Icons.location_pin),
          ],
        ),
        Row(
          children: [
            Expanded(
              flex: 1,
              child: OutlineTextField(
                controller: _titleController,
                label: const Text(
                  "what's the destination?",
                  softWrap: false,
                  overflow: .fade,
                ),
              ),
            ),
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: ref.watch(goalProvider).latitude == null ? 0 : null,
              margin: .symmetric(horizontal: 5),
              padding: EdgeInsets.only(left: 10),
              decoration: BoxDecoration(
                color: Theme.of(
                  context,
                ).colorScheme.surfaceBright.withAlpha(150),
                borderRadius: .circular(18),
              ),
              child: Row(
                children: [
                  Text(
                    ref.watch(goalProvider).location ?? "",
                    style: TextStyle(fontSize: 12),
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
          ],
        ),
        Row(
          children: [
            Expanded(
              child: OutlineTextField(
                textInputAction: .done,
                textInputType: .numberWithOptions(decimal: true),
                controller: _costController,
                label: const Text("Price?"),
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
    );
  }
}
