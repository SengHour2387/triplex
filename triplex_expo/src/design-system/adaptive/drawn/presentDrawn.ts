import type { NormalizedActionSheet, NormalizedAlert } from '../dialogModel';
import { useDialogStore } from '../dialogStore';

/** Show the *drawn* alert / action sheet regardless of platform (the app uses these on Android; the Gallery on iOS, to compare). */
export function presentDrawnAlert(alert: NormalizedAlert): void {
  useDialogStore.getState().enqueueAlert(alert);
}

export function presentDrawnActionSheet(sheet: NormalizedActionSheet): void {
  useDialogStore.getState().enqueueSheet(sheet);
}
