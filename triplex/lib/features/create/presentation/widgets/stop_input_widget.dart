import 'package:currency_picker_plus/currency_picker_plus.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:triplex/core/widgets/OutLineTextField.dart';
import 'package:triplex/core/widgets/TextH.dart';
import 'package:triplex/features/create/Domain/notifiers/create_trip_plan_notifier.dart';
import 'package:triplex/features/create/Domain/notifiers/way_point_notifier.dart';
import 'package:triplex/features/create/Domain/stop_item_model.dart';
import 'package:triplex/features/map/Domain/POI_place.dart';
import 'package:triplex/features/map/native_location_picker.dart';

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
    await showCupertinoSheet<POIPlace>(
      enableDrag: false,
      context: context,
      builder: (context) => NativeLocationPicker(
        isDialog: true,
        initialLatitude: waypoint.latitude,
        initialLongitude: waypoint.longitude,
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
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.toString().replaceAll("Exception: ", ""))));
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
    return Column(
      mainAxisSize: .min,
      children: [
        Row(
          children: [
            Expanded(
              child: OutlineTextField(
                textInputAction: .done,
                controller: _titleController,
                label: const Text(
                  "what's this place called?",
                  softWrap: false,
                  overflow: .fade,
                ),
              ),
            ),
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: ref.watch(wayPointProvider).latitude == null ? 0 : null,
              margin: const .symmetric(horizontal: 5),
              padding: const EdgeInsets.only(left: 10),
              decoration: BoxDecoration(
                color: Theme.of(
                  context,
                ).colorScheme.surfaceBright.withAlpha(150),
                borderRadius: .circular(18),
              ),
                child: Row(
                  children: [
                    TweenAnimationBuilder<Color?>(
                      tween: ColorTween(
                        begin: Colors.transparent,
                        end: Colors.blue,
                      ),
                      duration: const Duration(milliseconds: 600),
                      builder: (context, color, _) {
                        return Text(
                          ref.watch(wayPointProvider).location ??
                              "${ref.watch(wayPointProvider).latitude??""}\n${ref.watch(wayPointProvider).longitude??""}",
                          style: TextStyle(fontSize: 12, color: color ?? Colors.blue),
                        );
                      },
                    ),
                  IconButton(
                    onPressed: () {
                      ref.read(wayPointProvider.notifier).clearLocation();
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
                textInputType: const .numberWithOptions(decimal:true),
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
              onPressed: onSaveWaypoint,
              icon: Icon(_isEditing ? Icons.save_rounded : Icons.check_rounded),
            ),
          ],
        ),
      ],
    );
  }
}
