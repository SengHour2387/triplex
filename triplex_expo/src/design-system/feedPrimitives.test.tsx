import { fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Avatar } from './Avatar';
import { Chip } from './Chip';
import { CircleStack } from './CircleStack';
import { EmojiBadge } from './EmojiBadge';
import { EmojiStack } from './EmojiStack';
import { ImageViewer } from './ImageViewer';
import { ListRow, ListSection } from './adaptive/List';
import { PageDots } from './PageDots';
import { RemoteImage } from './RemoteImage';
import { TextField } from './TextField';

// Testing Library 14: `render` and `fireEvent` are async — always await them.
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

describe('Avatar', () => {
  it('shows the first letter, upper-cased, when there is no picture', async () => {
    await render(<Avatar name="sophia_travels" />);
    expect(screen.getByText('S', { includeHiddenElements: true })).toBeTruthy();
  });

  it('falls back to "U" for an empty name', async () => {
    await render(<Avatar name="  " />);
    expect(screen.getByText('U', { includeHiddenElements: true })).toBeTruthy();
  });

  it('is decorative: hidden from screen readers (the name is always written beside it)', async () => {
    await render(<Avatar name="Dara" uri="https://img/a.jpg" />);
    expect(screen.queryByRole('image')).toBeNull();
  });
});

describe('RemoteImage', () => {
  it('replaces a picture that fails to load with a labelled broken-image tile', async () => {
    await render(<RemoteImage uri="https://img/a.jpg" label="Mountain lake" />);
    const image = screen.getByLabelText('Mountain lake');
    await fireEvent(image, 'error');
    expect(screen.getByLabelText("Mountain lake, couldn't load")).toBeTruthy();
  });

  it('reports the picture size once it loads (the viewer needs it to bound panning)', async () => {
    const onLoadSize = jest.fn();
    await render(<RemoteImage uri="https://img/a.jpg" label="Photo" onLoadSize={onLoadSize} />);
    await fireEvent(screen.getByLabelText('Photo'), 'load', { source: { width: 2000, height: 1000 } });
    expect(onLoadSize).toHaveBeenCalledWith({ width: 2000, height: 1000 });
  });
});

describe('Chip', () => {
  it('is a button with a selected state when it has an action', async () => {
    const onPress = jest.fn();
    await render(<Chip label="All 49" selected onPress={onPress} />);
    const chip = screen.getByRole('button', { name: 'All 49' });
    expect(chip).toBeSelected();
    await fireEvent.press(chip);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is plain text (not a button) without one', async () => {
    await render(<Chip label="Kirirom" icon="trip" tone="accent" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByLabelText('Kirirom')).toBeTruthy();
  });

  it('lets the accessible name say more than the visible label (an emoji and a count)', async () => {
    await render(<Chip emoji="❤️" label="7" accessibilityLabel="Love, 7" onPress={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Love, 7' })).toBeTruthy();
  });
});

describe('CircleStack', () => {
  it('puts the first child in front, and keeps every child interactive', async () => {
    const onPress = jest.fn();
    await render(
      <CircleStack>
        <Pressable accessibilityRole="button" accessibilityLabel="Like" onPress={onPress} />
        <EmojiBadge emoji="👍" />
      </CircleStack>,
    );
    const tree = JSON.stringify(screen.toJSON());
    expect(tree.indexOf('"zIndex":2')).toBeLessThan(tree.indexOf('"zIndex":1'));
    await fireEvent.press(screen.getByRole('button', { name: 'Like' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('tucks each circle behind the one in front of it', async () => {
    await render(
      <CircleStack size={30}>
        <EmojiBadge emoji="❤️" />
        <EmojiBadge emoji="👍" />
      </CircleStack>,
    );
    expect(JSON.stringify(screen.toJSON())).toContain('"marginLeft":-9');
  });
});

describe('EmojiStack', () => {
  it('shows each emoji, and is hidden from screen readers (the control it sits in says it)', async () => {
    await render(<EmojiStack emojis={['❤️', '👍', '😂']} />);
    expect(screen.getByText('❤️', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText('😂', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('❤️')).toBeNull();
  });

  it('puts the first emoji on top', async () => {
    await render(<EmojiStack emojis={['❤️', '👍']} />);
    const tree = JSON.stringify(screen.toJSON());
    expect(tree.indexOf('"zIndex":2')).toBeLessThan(tree.indexOf('"zIndex":1'));
  });
});

describe('PageDots', () => {
  it('announces the position', async () => {
    await render(<PageDots count={4} index={1} />);
    expect(screen.getByLabelText('Page 2 of 4')).toBeTruthy();
  });

  it('draws nothing for a single page', async () => {
    await render(<PageDots count={1} index={0} />);
    expect(screen.queryByLabelText(/Page/)).toBeNull();
  });
});

describe('ListRow with a leading element', () => {
  it('shows it in place of an icon', async () => {
    await render(
      <ListSection>
        <ListRow title="Dara" subtitle="@dara" leading={<Avatar name="Dara" size={40} />} leadingSize={40} />
      </ListSection>,
    );
    expect(screen.getByText('D', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText('@dara')).toBeTruthy();
  });
});

describe('TextField multiline', () => {
  it('grows with its text instead of keeping the single-line fixed height', async () => {
    await render(<TextField label="Thoughts" value="a\nb\nc" onChangeText={() => undefined} multiline />);
    expect(screen.getByLabelText('Thoughts').props.multiline).toBe(true);
    const tree = JSON.stringify(screen.toJSON());
    expect(tree).toMatch(/"minHeight":\d+,"maxHeight":\d+/); // starts one line tall, grows to three
    expect(tree).not.toMatch(/"height":\d+,"borderRadius":16/); // no fixed height left over from the single-line style
  });

  it('keeps a fixed height when single-line', async () => {
    await render(<TextField label="Name" value="" onChangeText={() => undefined} />);
    const tree = JSON.stringify(screen.toJSON());
    expect(tree).toMatch(/"height":\d+/);
    expect(tree).not.toContain('maxHeight');
  });
});

describe('ImageViewer', () => {
  const urls = ['https://img/1.jpg', 'https://img/2.jpg', 'https://img/3.jpg'];
  const renderViewer = (onClose = jest.fn(), initialIndex = 0) =>
    render(
      <SafeAreaProvider initialMetrics={metrics}>
        <ImageViewer urls={urls} initialIndex={initialIndex} onClose={onClose} />
      </SafeAreaProvider>,
    );

  it('has a Close button, a photo counter, and describes each photo', async () => {
    const onClose = jest.fn();
    await renderViewer(onClose);
    expect(screen.getAllByRole('image')).toHaveLength(3);
    expect(screen.getByLabelText('Photo 1 of 3')).toBeTruthy();
    expect(screen.queryByText('1 / 3')).toBeNull(); // the visible counter is hidden from screen readers
    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('offers a zoom action to screen readers, whose gesture-only alternative is pinch and double-tap', async () => {
    await renderViewer();
    const photo = screen.getAllByRole('image')[0];
    expect(photo.props.accessibilityActions).toEqual([{ name: 'activate', label: 'Zoom in or out' }]);
  });

  it('closes on the screen reader escape gesture', async () => {
    const onClose = jest.fn();
    await renderViewer(onClose);
    screen.getByTestId('image-viewer').props.onAccessibilityEscape();
    expect(onClose).toHaveBeenCalled();
  });

  it('does not show a counter for a single photo', async () => {
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <ImageViewer urls={[urls[0]]} onClose={() => undefined} />
      </SafeAreaProvider>,
    );
    expect(screen.queryByText(/ \/ /)).toBeNull();
  });
});
