import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:triplex/core/widgets/liquid_glass_shim.dart';
import 'package:triplex/core/widgets/text_h.dart';
import 'package:triplex/features/create/domain/stop_item_model.dart';

class GoalTileWidget extends StatelessWidget {
  final StopItemModel goal;
  final void Function() onDelete;
  const GoalTileWidget({super.key, required this.goal, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(10.0),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Platform.isIOS
              ? Colors.transparent
              : CupertinoColors.activeGreen.withAlpha(150),
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                TextH4(goal.title),
                const Spacer(),
                IconButton(
                  style: IconButton.styleFrom(
                    hoverColor: Colors.redAccent,
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  onPressed: onDelete,
                  icon: const Icon(Icons.clear_rounded),
                  padding: EdgeInsets.zero,
                )
              ],
            ),
            Row(
              children: [
                TextPlain(goal.location ??
                    "lat: ${goal.latitude?.toStringAsFixed(6)}\nlng: ${goal.longitude?.toStringAsFixed(6)}"),
                const Spacer(),
                TextH4(
                  "${goal.cost ?? ""}${goal.currency}",
                )
              ],
            )
          ],
        ),
      ).liquidGlass(
          cornerRadius: 32,
          shape: LiquidGlassShape.rect,
          tint: Colors.greenAccent.withAlpha(150)),
    );
  }
}
