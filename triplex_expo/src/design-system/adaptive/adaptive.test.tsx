import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { ActionSheetIOS, Alert, StyleSheet } from 'react-native';

import { Glass } from '../Glass';
import { useDevSurfaceOverride } from '../devSurfaceOverride';
import { DrawnDialogHost } from './drawn/DrawnDialogHost';
import { menuHeight } from './drawn/DrawnMenu';
import { DrawnSlider } from './drawn/DrawnSlider';
import { DrawnStepper } from './drawn/DrawnStepper';
import { DrawnSwitch } from './drawn/DrawnSwitch';
import { presentDrawnAlert } from './drawn/presentDrawn';
import { confirm, showActionSheet, showAlert } from './dialogs';
import { normalizeAlert } from './dialogModel';
import { useDialogStore } from './dialogStore';
import { List, ListRow, ListSection, resolveAccessory } from './List';
import { SearchField } from './SearchField';
import { Switch } from './Switch';

// Testing Library 14: `render` and `fireEvent` are async — always await them.

describe('DrawnSwitch', () => {
  it('is a labelled switch that reports its state and toggles on press', async () => {
    const onValueChange = jest.fn();
    await render(<DrawnSwitch label="Notifications" value={false} onValueChange={onValueChange} />);
    const control = screen.getByRole('switch', { name: 'Notifications' });
    expect(control.props.accessibilityState).toMatchObject({ checked: false });
    await fireEvent.press(control);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('turns off when on', async () => {
    const onValueChange = jest.fn();
    await render(<DrawnSwitch label="Notifications" value onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByRole('switch', { name: 'Notifications' }));
    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it('does nothing while disabled, and says so', async () => {
    const onValueChange = jest.fn();
    await render(<DrawnSwitch label="Notifications" value={false} disabled onValueChange={onValueChange} />);
    const control = screen.getByRole('switch', { name: 'Notifications' });
    await fireEvent.press(control);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(control.props.accessibilityState).toMatchObject({ disabled: true });
  });
});

describe('Switch (the platform pick — the SwiftUI Toggle under Jest)', () => {
  it('has the same contract as the drawn one', async () => {
    const onValueChange = jest.fn();
    await render(<Switch label="Notifications" value={false} onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByRole('switch', { name: 'Notifications' }));
    expect(onValueChange).toHaveBeenCalledWith(true);
  });
});

describe('DrawnStepper', () => {
  function Harness({ start = 2, max = 3 }: { start?: number; max?: number }) {
    const [value, setValue] = useState(start);
    return <DrawnStepper label="Travellers" value={value} min={1} max={max} onValueChange={setValue} />;
  }

  it('steps up and down within its bounds', async () => {
    await render(<Harness />);
    await fireEvent.press(screen.getByRole('button', { name: 'Increase Travellers' }));
    expect(screen.getByRole('adjustable').props.accessibilityValue).toMatchObject({ now: 3 });
    // at max: the + button is disabled
    expect(screen.getByRole('button', { name: 'Increase Travellers' }).props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.press(screen.getByRole('button', { name: 'Decrease Travellers' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Decrease Travellers' }));
    expect(screen.getByRole('adjustable').props.accessibilityValue).toMatchObject({ now: 1 });
    expect(screen.getByRole('button', { name: 'Decrease Travellers' }).props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('responds to the screen reader increment / decrement actions', async () => {
    await render(<Harness />);
    await fireEvent(screen.getByRole('adjustable'), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(screen.getByRole('adjustable').props.accessibilityValue).toMatchObject({ now: 3 });
    await fireEvent(screen.getByRole('adjustable'), 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    expect(screen.getByRole('adjustable').props.accessibilityValue).toMatchObject({ now: 2 });
  });
});

/**
 * The slider ignores touches until it has been laid out (it needs its width), and Testing Library
 * refuses events on a view whose responder says no — including the layout event itself. So call the
 * `onLayout` prop directly, as the native side would.
 */
async function measure(element: { props: { onLayout?: (e: unknown) => void } }) {
  await act(async () => element.props.onLayout?.({ nativeEvent: { layout: { width: 300, height: 44 } } }));
}

describe('DrawnSlider', () => {
  it('exposes its value and is adjustable by the screen reader', async () => {
    const onValueChange = jest.fn();
    await render(<DrawnSlider label="Level" value={0.5} min={0} max={1} onValueChange={onValueChange} />);
    await measure(screen.getByRole('adjustable', { name: 'Level' }));
    const slider = screen.getByRole('adjustable', { name: 'Level' });
    expect(slider.props.accessibilityValue).toEqual({ min: 0, max: 1, now: 0.5 });
    await fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(onValueChange).toHaveBeenLastCalledWith(0.6);
    await fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    expect(onValueChange).toHaveBeenLastCalledWith(0.4);
  });

  it('a stepped slider moves by whole steps and stops at its ends', async () => {
    const onValueChange = jest.fn();
    await render(<DrawnSlider label="Rating" value={10} min={0} max={10} step={1} onValueChange={onValueChange} />);
    await measure(screen.getByRole('adjustable'));
    await fireEvent(screen.getByRole('adjustable'), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(onValueChange).toHaveBeenLastCalledWith(10);
  });
});

describe('List', () => {
  it('shows a chevron for a navigating row, none for a destructive action, a switch when asked', () => {
    const onPress = () => undefined;
    expect(resolveAccessory({ onPress })).toBe('chevron');
    expect(resolveAccessory({ onPress, destructive: true })).toBe('none');
    expect(resolveAccessory({})).toBe('none');
    expect(resolveAccessory({ onPress, accessory: 'check' })).toBe('check');
    expect(resolveAccessory({ onPress, switchValue: true, onSwitchChange: onPress })).toBe('switch');
  });

  it('a tappable row is a button named by its title and value', async () => {
    const onPress = jest.fn();
    await render(
      <List>
        <ListSection title="General" footer="Footer text">
          <ListRow title="Language" value="English" onPress={onPress} />
          <ListRow title="Version" value="1.0" />
        </ListSection>
      </List>,
    );
    expect(screen.getByRole('header')).toHaveTextContent('GENERAL');
    expect(screen.getByText('Footer text')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Language, English' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    // the read-only row is not a button
    expect(screen.queryByRole('button', { name: /Version/ })).toBeNull();
  });

  it('a switch row toggles through its switch, and the row itself does not navigate', async () => {
    const onSwitchChange = jest.fn();
    const onPress = jest.fn();
    await render(
      <ListSection>
        <ListRow title="Notifications" switchValue={false} onSwitchChange={onSwitchChange} onPress={onPress} />
      </ListSection>,
    );
    await fireEvent.press(screen.getByRole('switch', { name: 'Notifications' }));
    expect(onSwitchChange).toHaveBeenCalledWith(true);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('a disabled row ignores presses', async () => {
    const onPress = jest.fn();
    await render(
      <ListSection>
        <ListRow title="Locked" onPress={onPress} disabled />
      </ListSection>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Locked' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('SearchField', () => {
  function Harness({ onCancel }: { onCancel?: () => void }) {
    const [q, setQ] = useState('');
    return <SearchField value={q} onChangeText={setQ} placeholder="Search places" onCancel={onCancel} />;
  }

  it('shows a clear button only once there is text, and clears', async () => {
    await render(<Harness />);
    expect(screen.queryByRole('button', { name: 'Clear text' })).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Search places'), 'angkor');
    expect(screen.getByLabelText('Search places').props.value).toBe('angkor');
    await fireEvent.press(screen.getByRole('button', { name: 'Clear text' }));
    expect(screen.getByLabelText('Search places').props.value).toBe('');
  });

  it('shows Cancel only while focused', async () => {
    const onCancel = jest.fn();
    await render(<Harness onCancel={onCancel} />);
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
    await fireEvent(screen.getByLabelText('Search places'), 'focus');
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('Glass opaque', () => {
  afterEach(() => useDevSurfaceOverride.getState().setMode(null));

  it('is drawn solid where nothing blurs, so content cannot ghost through', async () => {
    useDevSurfaceOverride.getState().setMode('frosted');
    await render(
      <>
        <Glass testID="plain" />
        <Glass testID="opaque" opaque />
      </>,
    );
    const plain = StyleSheet.flatten(screen.getByTestId('plain').props.style);
    const solid = StyleSheet.flatten(screen.getByTestId('opaque').props.style);
    expect(plain.backgroundColor).toBe('rgba(255,255,255,0.94)');
    expect(solid.backgroundColor).toBe('#FFFFFF');
  });
});

describe('dialogs on iOS are the system ones', () => {
  afterEach(() => jest.restoreAllMocks());

  it('showAlert hands UIAlertController the title, message and styled buttons', () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const onPress = jest.fn();
    showAlert({ title: 'Delete?', message: 'Sure?', actions: [{ label: 'Delete', style: 'destructive', onPress }, { label: 'Cancel', style: 'cancel' }] });
    const [title, message, buttons] = alert.mock.calls[0];
    expect(title).toBe('Delete?');
    expect(message).toBe('Sure?');
    expect(buttons?.map((b) => [b.text, b.style])).toEqual([['Cancel', 'cancel'], ['Delete', 'destructive']]);
  });

  it('confirm resolves true when the confirming button is pressed', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => buttons?.find((b) => b.text === 'Delete')?.onPress?.());
    await expect(confirm({ title: 'Delete?', confirmLabel: 'Delete', destructive: true })).resolves.toBe(true);
  });

  it('confirm resolves false on Cancel', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => buttons?.find((b) => b.style === 'cancel')?.onPress?.());
    await expect(confirm({ title: 'Delete?' })).resolves.toBe(false);
  });

  it('showActionSheet puts Cancel last and marks destructive choices', () => {
    const sheet = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation(() => undefined);
    const share = jest.fn();
    showActionSheet({ title: 'Post', actions: [{ label: 'Share', onPress: share }, { label: 'Delete', style: 'destructive' }] });
    const [options, callback] = sheet.mock.calls[0];
    expect(options.options).toEqual(['Share', 'Delete', 'Cancel']);
    expect(options.cancelButtonIndex).toBe(2);
    expect(options.destructiveButtonIndex).toEqual([1]);
    callback(0);
    expect(share).toHaveBeenCalledTimes(1);
  });
});

describe('drawn dialogs (what Android shows)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useDialogStore.setState({ alerts: [], sheets: [] });
  });
  afterEach(() => jest.useRealTimers());

  it('shows the alert, runs the pressed action after it has left, and then goes away', async () => {
    const onDelete = jest.fn();
    await render(<DrawnDialogHost />);
    expect(screen.queryByText('Delete this post?')).toBeNull();

    await act(async () => {
      presentDrawnAlert(normalizeAlert({ title: 'Delete this post?', actions: [{ label: 'Cancel', style: 'cancel' }, { label: 'Delete', style: 'destructive', onPress: onDelete }] }));
    });
    expect(screen.getByText('Delete this post?')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).not.toHaveBeenCalled(); // still animating out
    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Delete this post?')).toBeNull();
  });

  it('queues a second alert behind the first', async () => {
    await render(<DrawnDialogHost />);
    await act(async () => {
      presentDrawnAlert(normalizeAlert({ title: 'First' }));
      presentDrawnAlert(normalizeAlert({ title: 'Second' }));
    });
    expect(screen.getByText('First')).toBeTruthy();
    expect(screen.queryByText('Second')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(screen.getByText('Second')).toBeTruthy();
  });
});

describe('menuHeight', () => {
  it('adds up rows and group breaks, plus the card padding', () => {
    expect(menuHeight([])).toBe(16);
    const item = { label: 'A', onPress: () => undefined };
    expect(menuHeight([item, item])).toBe(16 + 2 * 48);
    expect(menuHeight([item, 'divider', item])).toBe(16 + 2 * 48 + 9);
  });
});
