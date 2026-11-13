import { create } from 'zustand';

import type { ToastKind } from './tokens';

export interface ToastOptions {
  actionLabel?: string;
  onAction?: () => void;
}

export interface ToastMessage extends ToastOptions {
  /** Increments per toast, so showing the same text twice still re-triggers the animation. */
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastState {
  current: ToastMessage | null;
  show: (message: string, kind?: ToastKind, options?: ToastOptions) => void;
  dismiss: () => void;
}

/** How long a toast stays: a plain message is read in a moment; one with a button must outlast the time it takes to reach it. */
export const TOAST_MS = 4000;
export const TOAST_WITH_ACTION_MS = 10_000;
export const toastDisplayMs = (t: Pick<ToastMessage, 'actionLabel'>): number => (t.actionLabel ? TOAST_WITH_ACTION_MS : TOAST_MS);

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  current: null,
  show: (message, kind = 'info', options = {}) =>
    set({ current: { id: nextId++, message, kind, ...options } }),
  dismiss: () => set({ current: null }),
}));

/**
 * Imperative API — callable from anywhere (screens, stores, the API layer), not only components.
 * Mirrors Flutter's `ToastNotifier` (`show`, `showSuccess`, `showError`, `showWarning`, `dismiss`).
 */
export const toast = {
  show: (message: string, kind: ToastKind = 'info', options?: ToastOptions) =>
    useToastStore.getState().show(message, kind, options),
  success: (message: string, options?: ToastOptions) => useToastStore.getState().show(message, 'success', options),
  error: (message: string, options?: ToastOptions) => useToastStore.getState().show(message, 'error', options),
  warning: (message: string, options?: ToastOptions) => useToastStore.getState().show(message, 'warning', options),
  info: (message: string, options?: ToastOptions) => useToastStore.getState().show(message, 'info', options),
  dismiss: () => useToastStore.getState().dismiss(),
};
