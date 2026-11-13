import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Avatar, Chip, CircleStack, ComposerBar, EmojiBadge, EmojiStack, GlassButton, Icon, ListRow, ListSection, PageDots, RemoteImage, Text, TextField, radii, spacing, viewerHref } from '../design-system';
import { Section } from './Section';

const PHOTOS = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
];

/** The feed's primitives (Task 7): avatars, remote images, chips, page dots, a people list, a multiline field, the photo viewer. */
export function PostSections() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'love'>('all');
  const [dot, setDot] = useState(1);
  const [caption, setCaption] = useState('');
  const [comment, setComment] = useState('');
  const [reply, setReply] = useState('Nice route!');
  const [replying, setReplying] = useState<string | null>('dara');

  return (
    <>
      <Section title="Avatars & images">
        <Text variant="footnote" color="textSecondary">
          Avatar: a round picture, or the first letter on a tint when there is none / it fails to load. RemoteImage: cached on disk, a quiet tile while loading, a broken-image glyph when it fails.
        </Text>
        <View style={styles.row}>
          <Avatar uri={PHOTOS[0]} name="Dara" size={28} />
          <Avatar uri={PHOTOS[1]} name="Dara" size={36} />
          <Avatar uri={PHOTOS[2]} name="Dara" size={56} />
          <Avatar name="sophia_travels" size={36} />
          <Avatar name="" size={36} />
          <Avatar uri="https://example.invalid/missing.jpg" name="Broken" size={36} />
        </View>
        <View style={styles.row}>
          <RemoteImage uri={PHOTOS[0]} label="Mountain lake" style={styles.photo} />
          <RemoteImage uri="https://example.invalid/missing.jpg" label="Missing photo" style={styles.photo} />
        </View>
      </Section>

      <Section title="Chips">
        <Text variant="footnote" color="textSecondary">
          A tag (static, with an accent tone), and filter chips (one filled with the primary colour).
        </Text>
        <View style={styles.row}>
          <Chip icon="trip" label="Kirirom Camping" tone="accent" />
          <Chip label="Static" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          <Chip label="All 49" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip emoji="❤️" label="7" selected={filter === 'love'} onPress={() => setFilter('love')} />
          <Chip emoji="😂" label="12" onPress={() => undefined} />
          <Chip emoji="😮" label="30" onPress={() => undefined} />
        </ScrollView>
      </Section>

      <Section title="Emoji stack & circle stack">
        <Text variant="footnote" color="textSecondary">
          Overlapping circles, the first in front. EmojiStack is decorative; CircleStack holds any children — the feed puts the like button (a heart, or your reaction once you have reacted) in front with the other top reactions behind it.
        </Text>
        <View style={styles.row}>
          <EmojiStack emojis={['❤️']} />
          <EmojiStack emojis={['❤️', '👍']} />
          <EmojiStack emojis={['❤️', '👍', '😂']} />
          <EmojiStack emojis={['❤️', '👍', '😂']} size={40} />
        </View>
        <View style={styles.row}>
          <CircleStack>
            <Icon name="heart" size={22} />
            <EmojiBadge emoji="👍" />
            <EmojiBadge emoji="😂" />
          </CircleStack>
          <CircleStack>
            <EmojiBadge emoji="❤️" />
            <EmojiBadge emoji="👍" />
            <EmojiBadge emoji="😂" />
          </CircleStack>
        </View>
      </Section>

      <Section title="Page dots">
        <PageDots count={4} index={dot} />
        <View style={styles.row}>
          <GlassButton label="Previous" size="compact" variant="glass" onPress={() => setDot((d) => Math.max(0, d - 1))} />
          <GlassButton label="Next" size="compact" variant="glass" onPress={() => setDot((d) => Math.min(3, d + 1))} />
        </View>
      </Section>

      <Section title="People list">
        <Text variant="footnote" color="textSecondary">
          ListRow with a custom leading element (an Avatar) — the reactions sheet.
        </Text>
        <ListSection footer="Showing the 50 most recent reactions.">
          <ListRow title="Sophia Travels" subtitle="@sophia_travels" value="❤️" leading={<Avatar name="Sophia" size={40} />} leadingSize={40} />
          <ListRow title="doggy_chan23" subtitle="@doggy_chan23" value="👍" leading={<Avatar uri={PHOTOS[1]} name="doggy" size={40} />} leadingSize={40} />
        </ListSection>
      </Section>

      <Section title="Multiline field">
        <TextField label="Add your thoughts (optional)" value={caption} onChangeText={setCaption} multiline textAlignVertical="top" />
      </Section>

      <Section title="Composer bar">
        <Text variant="footnote" color="textSecondary">
          A glass bar for short messages (comments): your picture, a box that grows to about five lines, a round send button — dim while empty, a spinner while sending. Lay it at the bottom of a keyboard-aware container.
        </Text>
        <ComposerBar value={comment} onChangeText={setComment} onSubmit={() => setComment('')} placeholder="Add a comment…" sendLabel="Send comment" avatar={{ uri: PHOTOS[0], name: 'Sophia' }} />
        <ComposerBar value={reply} onChangeText={setReply} onSubmit={() => setReply('')} placeholder="Reply…" sendLabel="Send reply" avatar={{ uri: null, name: 'Sophia' }} replyingTo={replying} onCancelReply={() => setReplying(null)} />
        <ComposerBar value="Sending this one…" onChangeText={() => undefined} onSubmit={() => undefined} placeholder="Add a comment…" avatar={{ uri: null, name: 'Sophia' }} submitting />
        <ComposerBar value={'A longer comment that wraps onto several lines.\nIt keeps growing as the text does,\nup to about five lines,\nand then it scrolls\ninside the bar,\nlike this.'} onChangeText={() => undefined} onSubmit={() => undefined} placeholder="Add a comment…" avatar={{ uri: PHOTOS[1], name: 'Sophia' }} />
      </Section>

      <Section title="Photo viewer">
        <Text variant="footnote" color="textSecondary">
          Swipe between photos, pinch or double-tap to zoom, drag a photo down to dismiss.
        </Text>
        <GlassButton label="Open viewer (3 photos)" variant="glass" onPress={() => router.push(viewerHref(PHOTOS, 0))} />
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md },
  photo: { width: 140, height: 90, borderRadius: radii.md },
});
