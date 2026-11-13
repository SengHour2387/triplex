import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';

import { GlassButton } from './GlassButton';
import { TextField } from './TextField';

// Testing Library 14: `render` and `fireEvent` are async — always await them.

describe('GlassButton', () => {
  it('calls onPress', async () => {
    const onPress = jest.fn();
    await render(<GlassButton label="Continue" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress while disabled, and reports it to assistive tech', async () => {
    const onPress = jest.fn();
    await render(<GlassButton label="Continue" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Continue' });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('blocks presses while loading and reports busy', async () => {
    const onPress = jest.fn();
    await render(<GlassButton label="Login" onPress={onPress} loading />);
    const button = screen.getByRole('button', { name: 'Login' });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeBusy();
  });

  it('keeps the label mounted while loading (so the button never changes width)', async () => {
    await render(<GlassButton label="Login" loading />);
    expect(screen.getByText('Login')).toBeTruthy();
  });

  it.each(['prominent', 'glass', 'plain'] as const)('renders the %s variant as a button', async (variant) => {
    await render(<GlassButton label="Go" variant={variant} />);
    expect(screen.getByRole('button', { name: 'Go' })).toBeTruthy();
  });
});

function Harness({ error }: { error?: string }) {
  const [value, setValue] = useState('');
  return <TextField label="Email" value={value} onChangeText={setValue} error={error} />;
}

describe('TextField', () => {
  it('uses the label as its accessible name and updates on typing', async () => {
    await render(<Harness />);
    await fireEvent.changeText(screen.getByLabelText('Email'), 'a@b.co');
    expect(screen.getByLabelText('Email').props.value).toBe('a@b.co');
  });

  it('shows the error as an alert and exposes it as the field hint', async () => {
    await render(<Harness error="Invalid email or password" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
    expect(screen.getByLabelText('Email').props.accessibilityHint).toBe('Invalid email or password');
  });

  it('shows no alert without an error', async () => {
    await render(<Harness />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('password fields are hidden until revealed, and the toggle is announced', async () => {
    await render(<TextField label="Password" value="secret" onChangeText={() => {}} password />);
    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(true);

    await fireEvent.press(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(false);
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeTruthy();
  });

  it('non-password fields have no reveal toggle', async () => {
    await render(<Harness />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
