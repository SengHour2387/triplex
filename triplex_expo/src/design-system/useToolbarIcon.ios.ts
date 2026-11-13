import type { ToolbarIcon, ToolbarIconSpec } from './toolbarIcon';

/** iOS: the SF Symbol itself — the system tints and sizes it. */
export function useToolbarIcon({ sf }: ToolbarIconSpec): ToolbarIcon {
  return sf;
}
