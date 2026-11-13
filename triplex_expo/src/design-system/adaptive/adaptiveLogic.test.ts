import { confirmAlert, normalizeActionSheet, normalizeAlert, orderAlertActions } from './dialogModel';
import { placeMenu } from './menuPlacement';
import { clamp, snap, stepBy, thumbLeft, valueAt } from './sliderMath';

describe('sliderMath', () => {
  it('clamps', () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
  });

  it('snaps to the step grid anchored at min, without float noise', () => {
    expect(snap(0.34, 0, 1, 0.1)).toBe(0.3);
    expect(snap(0.35, 0, 1, 0.1)).toBe(0.4);
    expect(snap(7, 5, 20, 5)).toBe(5);
    expect(snap(8, 5, 20, 5)).toBe(10);
    expect(snap(0.1 + 0.2, 0, 1, 0.1)).toBe(0.3);
    expect(snap(2, 0, 1, 0.5)).toBe(1);
  });

  it('maps a touch position to a value: the knob centre travels inset by half the knob width', () => {
    // track 240, knob 40 → centre travels 20 … 220
    expect(valueAt(20, 240, 40, 0, 100)).toBe(0);
    expect(valueAt(120, 240, 40, 0, 100)).toBe(50);
    expect(valueAt(220, 240, 40, 0, 100)).toBe(100);
    expect(valueAt(-50, 240, 40, 0, 100)).toBe(0);
    expect(valueAt(900, 240, 40, 0, 100)).toBe(100);
    expect(valueAt(120, 240, 40, 0, 100, 10)).toBe(50);
  });

  it('survives a track narrower than the knob', () => {
    expect(valueAt(10, 30, 40, 0, 100)).toBe(0);
  });

  it('places the knob so it never leaves the track', () => {
    expect(thumbLeft(0, 240, 40, 0, 100)).toBe(0);
    expect(thumbLeft(100, 240, 40, 0, 100)).toBe(200);
    expect(thumbLeft(50, 240, 40, 0, 100)).toBe(100);
    expect(thumbLeft(5, 240, 40, 5, 5)).toBe(0);
  });

  it('steps within bounds', () => {
    expect(stepBy(9, 1, 0, 10)).toBe(10);
    expect(stepBy(10, 1, 0, 10)).toBe(10);
    expect(stepBy(0, -1, 0, 10)).toBe(0);
    expect(stepBy(0.2, 0.1, 0, 1, 0.1)).toBe(0.3);
  });
});

describe('dialog model', () => {
  const cancel = { label: 'Cancel', style: 'cancel' as const };
  const ok = { label: 'OK' };
  const del = { label: 'Delete', style: 'destructive' as const };

  it('defaults an alert to a single OK', () => {
    expect(normalizeAlert({ title: 'Saved' }).actions).toEqual([{ label: 'OK', style: 'default' }]);
  });

  it('puts Cancel on the left of two buttons, and last in a stack of three (as UIAlertController does)', () => {
    expect(orderAlertActions([ok, cancel]).map((a) => a.label)).toEqual(['Cancel', 'OK']);
    expect(orderAlertActions([cancel, ok, del]).map((a) => a.label)).toEqual(['OK', 'Delete', 'Cancel']);
  });

  it('gives every action a style', () => {
    expect(orderAlertActions([ok]).every((a) => a.style)).toBe(true);
  });

  it('lifts a Cancel out of an action sheet, and adds one when missing', () => {
    const withCancel = normalizeActionSheet({ actions: [ok, cancel, del] });
    expect(withCancel.cancel.label).toBe('Cancel');
    expect(withCancel.actions.map((a) => a.label)).toEqual(['OK', 'Delete']);

    const without = normalizeActionSheet({ actions: [ok] });
    expect(without.cancel).toEqual({ label: 'Cancel', style: 'cancel' });
    expect(without.actions).toHaveLength(1);
  });

  it('confirm resolves false on Cancel and true on confirm', () => {
    const resolve = jest.fn();
    const alert = confirmAlert({ title: 'Delete post?', confirmLabel: 'Delete', destructive: true }, resolve);
    const [cancelAction, confirmAction] = alert.actions ?? [];
    expect(confirmAction.style).toBe('destructive');
    cancelAction.onPress?.();
    confirmAction.onPress?.();
    expect(resolve.mock.calls).toEqual([[false], [true]]);
  });
});

describe('placeMenu', () => {
  const window = { width: 400, height: 800 };
  const insets = { top: 40, bottom: 30 };
  const menu = { width: 250, height: 200 };

  it('opens below a button in the top-right, right-aligned to it, unfolding from its corner', () => {
    const p = placeMenu({ anchor: { x: 340, y: 60, width: 44, height: 44 }, menu, window, insets });
    expect(p).toEqual({ left: 134, top: 112, origin: 'top right' });
  });

  it('left-aligns for a button on the left half', () => {
    const p = placeMenu({ anchor: { x: 16, y: 60, width: 44, height: 44 }, menu, window, insets });
    expect(p.left).toBe(16);
    expect(p.origin).toBe('top left');
  });

  it('flips above the button when there is no room below', () => {
    const p = placeMenu({ anchor: { x: 340, y: 700, width: 44, height: 44 }, menu, window, insets });
    expect(p.origin).toBe('bottom right');
    expect(p.top).toBe(700 - 8 - 200);
  });

  it('stays inside the screen horizontally', () => {
    const p = placeMenu({ anchor: { x: 5, y: 60, width: 44, height: 44 }, menu, window, insets });
    expect(p.left).toBeGreaterThanOrEqual(8);
    const q = placeMenu({ anchor: { x: 380, y: 60, width: 44, height: 44 }, menu, window, insets });
    expect(q.left + menu.width).toBeLessThanOrEqual(window.width - 8);
  });

  it('a menu taller than the room is pinned just under the status bar, never above it', () => {
    const tall = { width: 250, height: 760 };
    const p = placeMenu({ anchor: { x: 340, y: 400, width: 44, height: 44 }, menu: tall, window, insets });
    expect(p.top).toBe(insets.top + 8);
  });

  it('a menu that fits but not below or above is nudged up until it clears the gesture bar', () => {
    const mid = { width: 250, height: 500 };
    const p = placeMenu({ anchor: { x: 340, y: 400, width: 44, height: 44 }, menu: mid, window, insets });
    expect(p.top + mid.height).toBeLessThanOrEqual(window.height - insets.bottom - 8);
    expect(p.top).toBeGreaterThanOrEqual(insets.top + 8);
  });
});
