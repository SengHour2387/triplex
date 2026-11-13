import { ActionSheetIOS, Alert } from 'react-native';

import type { NormalizedActionSheet, NormalizedAlert } from './dialogModel';

/** iOS: the system alert (`UIAlertController`). */
export function presentAlert({ title, message, actions }: NormalizedAlert): void {
  Alert.alert(
    title,
    message,
    actions.map((action) => ({ text: action.label, style: action.style, isPreferred: action.preferred, onPress: action.onPress })),
  );
}

/** iOS: the system action sheet — on iOS 26 a floating glass sheet. */
export function presentActionSheet({ title, message, actions, cancel }: NormalizedActionSheet): void {
  const options = [...actions.map((a) => a.label), cancel.label];
  const cancelButtonIndex = options.length - 1;
  const destructiveButtonIndex = actions.flatMap((a, i) => (a.style === 'destructive' ? [i] : []));
  ActionSheetIOS.showActionSheetWithOptions({ title, message, options, cancelButtonIndex, destructiveButtonIndex }, (index) => {
    if (index === cancelButtonIndex) cancel.onPress?.();
    else actions[index]?.onPress?.();
  });
}
