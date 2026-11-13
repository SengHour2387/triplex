import type { ActionSheetOptions, AlertOptions, DialogAction } from './types';

/** A dialog request after `normalize*`: every action has a style, ordering follows iOS. */
export interface NormalizedAlert {
  title: string;
  message?: string;
  /** Every action has its `style` set. */
  actions: readonly DialogAction[];
}

export interface NormalizedActionSheet {
  title?: string;
  message?: string;
  /** The choices, without Cancel. */
  actions: readonly DialogAction[];
  /** The separate Cancel button (always present: a sheet can always be dismissed). */
  cancel: DialogAction;
}

const styled = (action: DialogAction): DialogAction => ({ ...action, style: action.style ?? 'default' });

/**
 * Alert button order, as UIAlertController lays it out: with two buttons, Cancel is on the left; with
 * three or more they stack top to bottom and Cancel goes last. (Other buttons keep the caller's order.)
 */
export function orderAlertActions(actions: readonly DialogAction[]): DialogAction[] {
  const all = actions.map(styled);
  const cancels = all.filter((a) => a.style === 'cancel');
  const rest = all.filter((a) => a.style !== 'cancel');
  return all.length === 2 ? [...cancels, ...rest] : [...rest, ...cancels];
}

export function normalizeAlert({ title, message, actions }: AlertOptions): NormalizedAlert {
  const given = actions && actions.length > 0 ? actions : [{ label: 'OK' }];
  return { title, message, actions: orderAlertActions(given) };
}

export function normalizeActionSheet({ title, message, actions }: ActionSheetOptions): NormalizedActionSheet {
  const styledActions = actions.map(styled);
  const cancel = styledActions.find((a) => a.style === 'cancel') ?? { label: 'Cancel', style: 'cancel' as const };
  return { title, message, actions: styledActions.filter((a) => a !== cancel), cancel };
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button, for deleting / discarding. */
  destructive?: boolean;
}

/** The alert behind `confirm()`: Cancel and the confirming action, resolving through `resolve`. */
export function confirmAlert(options: ConfirmOptions, resolve: (confirmed: boolean) => void): AlertOptions {
  return {
    title: options.title,
    message: options.message,
    actions: [
      { label: options.cancelLabel ?? 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { label: options.confirmLabel ?? 'OK', style: options.destructive ? 'destructive' : 'default', preferred: !options.destructive, onPress: () => resolve(true) },
    ],
  };
}
