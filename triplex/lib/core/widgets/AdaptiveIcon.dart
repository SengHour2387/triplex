import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class AdaptiveIcon extends StatelessWidget {

  final String icon;
  const AdaptiveIcon({super.key, required this.icon});
  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      icon,
      colorFilter: ColorFilter.mode(
        Theme.of(context).iconTheme.color ?? Theme.of(context).colorScheme.onSurface,
        BlendMode.srcIn,
      ),
    );
  }
}
