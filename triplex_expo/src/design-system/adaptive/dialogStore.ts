import { create } from 'zustand';

import type { NormalizedActionSheet, NormalizedAlert } from './dialogModel';

export type AlertRequest = NormalizedAlert & { id: number };
export type SheetRequest = NormalizedActionSheet & { id: number };

interface DialogState {
  /** Pending alerts; the first is on screen. A second alert waits for the first (UIKit does the same). */
  alerts: readonly AlertRequest[];
  sheets: readonly SheetRequest[];
  enqueueAlert: (alert: NormalizedAlert) => void;
  enqueueSheet: (sheet: NormalizedActionSheet) => void;
  dismissAlert: (id: number) => void;
  dismissSheet: (id: number) => void;
}

let nextId = 1;

/** State behind the *drawn* (Android) dialogs. iOS presents natively and never touches it. */
export const useDialogStore = create<DialogState>((set) => ({
  alerts: [],
  sheets: [],
  enqueueAlert: (alert) => set((s) => ({ alerts: [...s.alerts, { ...alert, id: nextId++ }] })),
  enqueueSheet: (sheet) => set((s) => ({ sheets: [...s.sheets, { ...sheet, id: nextId++ }] })),
  dismissAlert: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
  dismissSheet: (id) => set((s) => ({ sheets: s.sheets.filter((a) => a.id !== id) })),
}));
