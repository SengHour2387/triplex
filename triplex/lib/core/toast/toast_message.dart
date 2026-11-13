enum ToastType { success, error, info, warning }

class ToastMessage {
  final String message;
  final ToastType type;
  final String? actionLabel;
  final void Function()? onAction;

  const ToastMessage({
    required this.message,
    this.type = ToastType.info,
    this.actionLabel,
    this.onAction,
  });
}
