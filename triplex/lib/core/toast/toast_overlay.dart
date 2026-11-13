import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:triplex/core/toast/toast_provider.dart';

/// Wrap this around the child passed in [MaterialApp.builder] so it renders
/// above the [Navigator] — and therefore above any modal, bottom-sheet, or
/// dialog Flutter pushes onto the route stack.
///
/// Keyboard awareness is handled via [MediaQuery.viewInsets] so the toast
/// always floats above the soft keyboard without any extra work.
class ToastOverlay extends ConsumerStatefulWidget {
  const ToastOverlay({super.key, required this.child});

  final Widget child;

  @override
  ConsumerState<ToastOverlay> createState() => _ToastOverlayState();
}

class _ToastOverlayState extends ConsumerState<ToastOverlay>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _slideAnim;
  late final Animation<double> _fadeAnim;

  ToastMessage? _current;
  Timer? _autoTimer;

  static const _animDuration = Duration(milliseconds: 320);
  static const _displayDuration = Duration(seconds: 4);

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: _animDuration);

    _slideAnim = Tween<double>(begin: 32, end: 0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );

    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _autoTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  Future<void> _show(ToastMessage msg) async {
    _autoTimer?.cancel();
    if (_current != null) {
      await _controller.reverse();
    }
    if (!mounted) return;
    setState(() => _current = msg);
    await _controller.forward(from: 0);
    _autoTimer = Timer(_displayDuration, _dismiss);
  }

  Future<void> _dismiss() async {
    _autoTimer?.cancel();
    if (!mounted) return;
    await _controller.reverse();
    if (!mounted) return;
    setState(() => _current = null);
    ref.read(toastProvider.notifier).dismiss();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<ToastMessage?>(toastProvider, (_, next) {
      if (next != null) {
        _show(next);
      } else if (_current != null) {
        _dismiss();
      }
    });

    // viewInsets.bottom = keyboard height (0 when keyboard is hidden)
    // padding.bottom    = safe-area bottom inset
    final mq = MediaQuery.of(context);
    final bottomInset = mq.viewInsets.bottom + mq.padding.bottom;

    return Stack(
      // Stack is placed in MaterialApp.builder so it sits above the entire
      // Navigator, meaning it is above every modal and bottom sheet.
      children: [
        widget.child,
        if (_current != null)
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return Positioned(
                // Animate both position and opacity from the bottom
                bottom: bottomInset + 16 + _slideAnim.value,
                left: 16,
                right: 16,
                child: Opacity(
                  opacity: _fadeAnim.value,
                  child: child,
                ),
              );
            },
            child: _ToastCard(
              message: _current!,
              onDismiss: _dismiss,
            ),
          ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Visual card
// ---------------------------------------------------------------------------

class _ToastCard extends StatelessWidget {
  const _ToastCard({required this.message, required this.onDismiss});

  final ToastMessage message;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final config = _ToastConfig.of(message.type);

    final bgColor = isDark ? config.darkBg : config.lightBg;
    final fgColor = isDark ? config.darkFg : config.lightFg;

    return Material(
      color: Colors.transparent,
      child: Container(
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.12),
              blurRadius: 20,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Icon(config.icon, color: fgColor, size: 22),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  message.message,
                  style: TextStyle(
                    color: fgColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    height: 1.4,
                  ),
                ),
              ),
              if (message.actionLabel != null) ...[
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () {
                    message.onAction?.call();
                    onDismiss();
                  },
                  child: Text(
                    message.actionLabel!,
                    style: TextStyle(
                      color: fgColor,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      decoration: TextDecoration.underline,
                      decorationColor: fgColor,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
              ],
              GestureDetector(
                onTap: onDismiss,
                child: Icon(
                  Icons.close_rounded,
                  color: fgColor.withValues(alpha: 0.6),
                  size: 18,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Per-type color + icon config
// ---------------------------------------------------------------------------

class _ToastConfig {
  final Color lightBg;
  final Color lightFg;
  final Color darkBg;
  final Color darkFg;
  final IconData icon;

  const _ToastConfig({
    required this.lightBg,
    required this.lightFg,
    required this.darkBg,
    required this.darkFg,
    required this.icon,
  });

  static _ToastConfig of(ToastType type) {
    switch (type) {
      case ToastType.success:
        return const _ToastConfig(
          lightBg: Color(0xFFEBFAF2),
          lightFg: Color(0xFF1A7A4A),
          darkBg: Color(0xFF0E2E1E),
          darkFg: Color(0xFF4CD98A),
          icon: Icons.check_circle_rounded,
        );
      case ToastType.error:
        return const _ToastConfig(
          lightBg: Color(0xFFFFF0F0),
          lightFg: Color(0xFFB00020),
          darkBg: Color(0xFF2E0E0E),
          darkFg: Color(0xFFFF6B6B),
          icon: Icons.error_rounded,
        );
      case ToastType.warning:
        return const _ToastConfig(
          lightBg: Color(0xFFFFF8E6),
          lightFg: Color(0xFF9A6100),
          darkBg: Color(0xFF2E2200),
          darkFg: Color(0xFFFFBB33),
          icon: Icons.warning_rounded,
        );
      case ToastType.info:
        return const _ToastConfig(
          lightBg: Color(0xFFEDF5FF),
          lightFg: Color(0xFF1565C0),
          darkBg: Color(0xFF0D1E35),
          darkFg: Color(0xFF64B5F6),
          icon: Icons.info_rounded,
        );
    }
  }
}
