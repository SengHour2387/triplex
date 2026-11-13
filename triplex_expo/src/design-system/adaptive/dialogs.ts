import { confirmAlert, normalizeActionSheet, normalizeAlert, type ConfirmOptions } from './dialogModel';
import { presentActionSheet, presentAlert } from './present';
import type { ActionSheetOptions, AlertOptions } from './types';

export type { ConfirmOptions } from './dialogModel';

/**
 * Imperative dialogs — callable from anywhere, like `toast`. On iOS they are the system's own
 * (`UIAlertController`, so Liquid Glass, haptics and Dynamic Type come free); on Android they are
 * drawn in the same iOS 26 style by `<DialogHost />`, which must be mounted once near the root.
 */
export function showAlert(options: AlertOptions): void {
  presentAlert(normalizeAlert(options));
}

/** A bottom action sheet: a list of choices plus a separate Cancel. */
export function showActionSheet(options: ActionSheetOptions): void {
  presentActionSheet(normalizeActionSheet(options));
}

/** Cancel / confirm alert as a promise: `true` when the user confirmed. */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => showAlert(confirmAlert(options, resolve)));
}
