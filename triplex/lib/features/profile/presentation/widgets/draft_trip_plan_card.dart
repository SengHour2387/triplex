import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:triplex/features/create/data/trip_plan_repo.dart';
import 'package:triplex/features/create/domain/stop_item_model.dart';
import 'package:triplex/features/create/domain/trip_plan_model.dart';
import 'package:triplex/features/profile/domain/draft_trip_plans_notifier.dart';

class DraftTripPlanCard extends ConsumerStatefulWidget {
  final TripPlanModel tripPlan;

  const DraftTripPlanCard({
    super.key,
    required this.tripPlan,
  });

  @override
  ConsumerState<DraftTripPlanCard> createState() => _DraftTripPlanCardState();
}

class _DraftTripPlanCardState extends ConsumerState<DraftTripPlanCard> {
  bool _isPosting = false;
  bool _isDeleting = false;

  Future<void> _handlePostDraft() async {
    setState(() {
      _isPosting = true;
    });
    try {
      final repo = ref.read(tripPlanRepoProvider);
      await repo.postTripPlan(
        widget.tripPlan,
        widget.tripPlan.caption ?? '',
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Draft posted successfully to feed")),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceAll("Exception: ", "")), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isPosting = false;
        });
      }
    }
  }

  Future<void> _handleDeleteDraft() async {
    final tripTitle =
        widget.tripPlan.title.isEmpty ? "Untitled Trip" : widget.tripPlan.title;
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Delete Draft"),
        content: Text('Are you sure you want to delete "$tripTitle"?'),
        actions: [
          TextButton(
            child: const Text("Delete", style: TextStyle(color: Colors.red)),
            onPressed: () async {
              Navigator.of(context).pop();
              setState(() {
                _isDeleting = true;
              });

              try {
                await ref
                    .read(draftTripPlansProvider.notifier)
                    .removeDraft(widget.tripPlan);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Draft deleted")),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text("Failed to delete draft: ${e.toString().replaceAll("Exception: ", "")}"), backgroundColor: Colors.red),
                  );
                }
              } finally {
                if (mounted) {
                  setState(() {
                    _isDeleting = false;
                  });
                }
              }
            },
          ),
          TextButton(
            child: const Text("Cancel"),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final tripPlan = widget.tripPlan;

    // Collect all stops in order: start -> waypoints -> end
    final List<StopItemModel> allStops = [];
    if (tripPlan.start != null) {
      allStops.add(tripPlan.start!);
    }
    allStops.addAll(tripPlan.waypoints);
    if (tripPlan.end != null) {
      allStops.add(tripPlan.end!);
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: PopupMenuButton(
        itemBuilder: (context) => [
          PopupMenuItem(
            child: const Row(children: [Icon(Icons.send_rounded), SizedBox(width: 8), Text("Post to Feed")]),
            onTap: () {
              if (!_isPosting && !_isDeleting) {
                _handlePostDraft();
              }
            },
          ),
          PopupMenuItem(
            child: const Row(children: [Icon(Icons.delete_outline_rounded), SizedBox(width: 8), Text("Delete Draft")]),
            onTap: () {
              if (!_isPosting && !_isDeleting) {
                _handleDeleteDraft();
              }
            },
          ),
        ],
        child: Card(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header: Title & Options
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: colorScheme.primary.withAlpha(30),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                "Draft",
                                style: theme.textTheme.labelSmall?.copyWith(
                                  color: colorScheme.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                tripPlan.title.isEmpty
                                    ? "Untitled Trip"
                                    : tripPlan.title,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        if (tripPlan.caption != null &&
                            tripPlan.caption!.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(
                            tripPlan.caption!,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: colorScheme.onSurface.withAlpha(180),
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ],
                    ),
                  ),
                  if (_isDeleting)
                    const SizedBox(
                      width: 24,
                      height: 24,
                      child: Center(
                        child: SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator.adaptive(
                              strokeWidth: 2),
                        ),
                      ),
                    )
                  else
                    IconButton(
                      icon: const Icon(CupertinoIcons.trash,
                          size: 18, color: Colors.redAccent),
                      onPressed: _isPosting ? null : _handleDeleteDraft,
                      tooltip: "Delete draft",
                    ),
                ],
              ),

              const SizedBox(height: 12),

              // Timeline of Stops
              if (allStops.isNotEmpty)
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: allStops.length,
                  itemBuilder: (context, index) {
                    final stop = allStops[index];
                    final isFirst = index == 0;
                    final isLast = index == allStops.length - 1;

                    Color iconColor;
                    IconData iconData;

                    if (isFirst) {
                      iconColor = Colors.blue;
                      iconData = Icons.play_circle_fill_rounded;
                    } else if (isLast) {
                      iconColor = Colors.pink;
                      iconData = Icons.location_on_rounded;
                    } else {
                      iconColor = Colors.teal;
                      iconData = Icons.trip_origin_rounded;
                    }

                    return IntrinsicHeight(
                      child: Row(
                        children: [
                          Column(
                            children: [
                              Container(
                                width: 2,
                                height: 6,
                                color: isFirst
                                    ? Colors.transparent
                                    : colorScheme.outlineVariant.withAlpha(120),
                              ),
                              Icon(
                                iconData,
                                size: isFirst || isLast ? 16 : 12,
                                color: iconColor,
                              ),
                              Expanded(
                                child: Container(
                                  width: 2,
                                  color: isLast
                                      ? Colors.transparent
                                      : colorScheme.outlineVariant
                                          .withAlpha(120),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 3),
                              child: Text(
                                stop.title.isEmpty
                                    ? "Unnamed Stop"
                                    : stop.title,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  fontWeight: isFirst || isLast
                                      ? FontWeight.w600
                                      : FontWeight.normal,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),

              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 10),

              // Footer Action: Post Draft
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (_isPosting)
                    const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator.adaptive(strokeWidth: 2),
                    )
                  else
                    CupertinoButton.filled(
                      borderRadius: BorderRadius.circular(24),
                      onPressed: _handlePostDraft,
                      child: const Text("Post to Feed"),
                    ),
                ],
              ),
            ],
            ),
          ),
        ),
      ),
    );
  }
}
