import 'package:flutter/material.dart';
import 'package:triplex/features/create/domain/stop_item_model.dart';
import 'package:triplex/features/feed/domain/models/post_model.dart';

class TripPlanCard extends StatelessWidget {
  final FeedTripPlanModel tripPlan;

  const TripPlanCard({
    super.key,
    required this.tripPlan,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // Collect all stops in order: start -> waypoints -> end
    final List<StopItemModel> allStops = [];
    if (tripPlan.start != null) {
      allStops.add(tripPlan.start!);
    }
    allStops.addAll(tripPlan.waypoints);
    if (tripPlan.end != null) {
      allStops.add(tripPlan.end!);
    }

    const blueLinkColor = Color(0xFF1D8BFF);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Trip Title
        Text(
          tripPlan.title,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w400,
            color: colorScheme.onSurface,
            fontSize: 15,
          ),
        ),
        const SizedBox(height: 12),

        // List of Stops
        if (allStops.isNotEmpty)
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: EdgeInsets.zero,
            itemCount: allStops.length,
            separatorBuilder: (context, index) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final stop = allStops[index];
              final isFirst = index == 0;
              final isLast = index == allStops.length - 1;

              Widget leadingIcon;
              if (isFirst) {
                leadingIcon = Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.near_me_rounded,
                      color: Colors.white,
                      size: 13,
                    ),
                  ),
                );
              } else if (isLast) {
                leadingIcon = const Icon(
                  Icons.flag_rounded,
                  color: Colors.black,
                  size: 20,
                );
              } else {
                leadingIcon = const Icon(
                  Icons.location_on_rounded,
                  color: Colors.black,
                  size: 20,
                );
              }

              // Text representation
              String detailText = '';
              if (stop.description != null && stop.description!.isNotEmpty) {
                detailText = ' - ${stop.description}';
              } else if (stop.cost != null && stop.cost! > 0) {
                detailText =
                    ' - ${stop.currency ?? '\$'}${stop.cost!.toStringAsFixed(stop.cost! % 1 == 0 ? 0 : 2)}';
              }

              return Row(
                children: [
                  SizedBox(
                    width: 24,
                    height: 24,
                    child: Center(child: leadingIcon),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text.rich(
                      TextSpan(
                        children: [
                          TextSpan(
                            text: stop.title,
                            style: const TextStyle(
                              color: blueLinkColor,
                              decoration: TextDecoration.underline,
                              fontWeight: FontWeight.w400,
                              fontSize: 14,
                            ),
                          ),
                          if (detailText.isNotEmpty)
                            TextSpan(
                              text: detailText,
                              style: TextStyle(
                                color: colorScheme.onSurface.withAlpha(220),
                                fontSize: 14,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),

        // Total Cost line
        if (tripPlan.totalCost != null && tripPlan.totalCost! > 0) ...[
          const SizedBox(height: 16),
          Text.rich(
            TextSpan(
              children: [
                const TextSpan(
                  text: 'Cost ',
                  style: TextStyle(
                    color: blueLinkColor,
                    fontWeight: FontWeight.w400,
                    fontSize: 14,
                  ),
                ),
                TextSpan(
                  text:
                      '${tripPlan.totalCost!.toStringAsFixed(0)}${tripPlan.totalCostCurrency ?? '\$'}${tripPlan.costSuffix ?? '+'}\n\n',
                  style: TextStyle(
                    color: colorScheme.onSurface,
                    fontWeight: FontWeight.w500,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
