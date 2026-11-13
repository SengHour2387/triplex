import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:triplex/core/toast/toast_message.dart';

export 'toast_message.dart';

class ToastNotifier extends Notifier<ToastMessage?> {
  @override
  ToastMessage? build() => null;

  void show(
    String message, {
    ToastType type = ToastType.info,
    String? actionLabel,
    void Function()? onAction,
  }) {
    state = ToastMessage(
      message: message,
      type: type,
      actionLabel: actionLabel,
      onAction: onAction,
    );
  }

  void showSuccess(String message,
          {String? actionLabel, void Function()? onAction}) =>
      show(message,
          type: ToastType.success,
          actionLabel: actionLabel,
          onAction: onAction);

  void showError(String message,
          {String? actionLabel, void Function()? onAction}) =>
      show(message,
          type: ToastType.error, actionLabel: actionLabel, onAction: onAction);

  void showWarning(String message,
          {String? actionLabel, void Function()? onAction}) =>
      show(message,
          type: ToastType.warning,
          actionLabel: actionLabel,
          onAction: onAction);

  void dismiss() => state = null;
}

final toastProvider = NotifierProvider<ToastNotifier, ToastMessage?>(
  ToastNotifier.new,
);
