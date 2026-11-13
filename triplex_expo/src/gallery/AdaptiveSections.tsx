import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import {
  DrawnDialogHost,
  DrawnMenu,
  DrawnSlider,
  DrawnSpinner,
  DrawnStepper,
  DrawnSwitch,
  GlassButton,
  List,
  ListRow,
  ListSection,
  Menu,
  ProgressBar,
  SearchField,
  Slider,
  Spinner,
  Stepper,
  Text,
  confirm,
  normalizeActionSheet,
  normalizeAlert,
  presentDrawnActionSheet,
  presentDrawnAlert,
  showActionSheet,
  showAlert,
  spacing,
  toast,
  useTheme,
} from '../design-system';
import { Section } from './Section';

/** The adaptive set (native on iOS, drawn on Android). Mounted inside the Gallery. */
export function AdaptiveSections() {
  const { colors } = useTheme();
  const [on, setOn] = useState(true);
  const [off, setOff] = useState(false);
  const [level, setLevel] = useState(0.4);
  const [stepped, setStepped] = useState(4);
  const [count, setCount] = useState(2);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('English');
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');
  const [notify, setNotify] = useState(true);
  const [drawnOn, setDrawnOn] = useState(true);
  const [drawnLevel, setDrawnLevel] = useState(0.6);
  const [drawnCount, setDrawnCount] = useState(3);

  return (
    <>
      <Section title="Switch · slider · stepper">
        <Text variant="footnote" color="textSecondary">
          Native iOS controls (SwiftUI) on iOS; drawn in the iOS 26 style on Android.
        </Text>
        <List>
          <ListSection>
            <ListRow title="On" switchValue={on} onSwitchChange={setOn} />
            <ListRow title="Off" switchValue={off} onSwitchChange={setOff} />
            <ListRow title="Disabled" switchValue disabled onSwitchChange={() => undefined} />
          </ListSection>
        </List>
        <View style={styles.control}>
          <Text variant="subhead" color="textSecondary">Slider — {Math.round(level * 100)}%</Text>
          <Slider label="Level" value={level} onValueChange={setLevel} />
        </View>
        <View style={styles.control}>
          <Text variant="subhead" color="textSecondary">Stepped slider — {stepped} of 10</Text>
          <Slider label="Rating" value={stepped} min={0} max={10} step={1} onValueChange={setStepped} />
        </View>
        <View style={styles.inline}>
          <Text variant="body">Travellers: {count}</Text>
          <Stepper label="Travellers" value={count} min={1} max={9} onValueChange={setCount} />
        </View>
      </Section>

      <Section title="Progress & activity">
        <View style={styles.inline}>
          <Spinner size="small" />
          <Spinner size="large" />
          <Spinner size="large" color={colors.accent} />
          <Text variant="subhead" color="textSecondary">small · large · tinted</Text>
        </View>
        <ProgressBar label="Level" value={level} />
        <ProgressBar label="Working" />
      </Section>

      <Section title="Lists">
        <Text variant="footnote" color="textSecondary">
          The inset grouped list: one drawing for both platforms.
        </Text>
        <List>
          <ListSection title="Account" footer="Row separators start under the title, not under the icon tile.">
            <ListRow icon="person" iconTint="#0A84FF" title="Account Center" subtitle="Name, username, email" onPress={() => toast.info('Account Center')} />
            <ListRow icon="bell" iconTint="#FF453A" title="Notifications" switchValue={notify} onSwitchChange={setNotify} />
            <ListRow icon="settings" iconTint="#8E8E93" title="Language" value={language} onPress={() => setLanguage((l) => (l === 'English' ? 'ខ្មែរ' : 'English'))} />
          </ListSection>
          <ListSection title="Choose one">
            <ListRow title="Most recent" accessory={sort === 'recent' ? 'check' : 'none'} onPress={() => setSort('recent')} />
            <ListRow title="Most popular" accessory={sort === 'popular' ? 'check' : 'none'} onPress={() => setSort('popular')} />
          </ListSection>
          <ListSection>
            <ListRow icon="signOut" title="Sign out" destructive onPress={() => toast.warning('Sign out pressed')} />
            <ListRow title="A row with a much longer title that has to wrap onto a second line" subtitle="and a subtitle that wraps as well, to check the row grows" />
          </ListSection>
        </List>
      </Section>

      <Section title="Search">
        <SearchField value={query} onChangeText={setQuery} placeholder="Search places" onCancel={() => setQuery('')} />
      </Section>

      <Section title="Alerts · action sheets · menus">
        <Text variant="footnote" color="textSecondary">
          iOS: the system UIAlertController / action sheet / pull-down menu. Android: drawn.
        </Text>
        <GlassButton label="Alert (OK)" variant="glass" onPress={() => showAlert({ title: 'Profile saved', message: 'Your changes are live.' })} />
        <GlassButton
          label="Confirm (Cancel / Delete)"
          variant="glass"
          onPress={() =>
            void confirm({ title: 'Delete this post?', message: 'This can’t be undone.', confirmLabel: 'Delete', destructive: true }).then((yes) =>
              toast.info(yes ? 'Confirmed' : 'Cancelled'),
            )
          }
        />
        <GlassButton
          label="Alert with three actions"
          variant="glass"
          onPress={() =>
            showAlert({
              title: 'Save changes?',
              message: 'You have unsaved edits to this trip plan.',
              actions: [
                { label: 'Save', onPress: () => toast.success('Saved') },
                { label: 'Discard', style: 'destructive', onPress: () => toast.warning('Discarded') },
                { label: 'Cancel', style: 'cancel' },
              ],
            })
          }
        />
        <GlassButton
          label="Action sheet"
          variant="glass"
          onPress={() =>
            showActionSheet({
              title: 'Post options',
              message: 'Choose what to do with this post',
              actions: [
                { label: 'Share', onPress: () => toast.info('Share') },
                { label: 'Copy link', onPress: () => toast.info('Copied') },
                { label: 'Delete post', style: 'destructive', onPress: () => toast.warning('Deleted') },
              ],
            })
          }
        />
        <View style={styles.inline}>
          <Menu
            label="More options"
            items={[
              { label: 'Share', icon: 'share', onPress: () => toast.info('Share') },
              { label: 'Edit', icon: 'edit', onPress: () => toast.info('Edit') },
              'divider',
              { label: 'Most recent', selected: sort === 'recent', onPress: () => setSort('recent') },
              { label: 'Most popular', selected: sort === 'popular', onPress: () => setSort('popular') },
              'divider',
              { label: 'Delete', icon: 'trash', destructive: true, onPress: () => toast.warning('Delete') },
            ]}
          />
          <Text variant="subhead" color="textSecondary">← pull-down menu</Text>
        </View>
      </Section>

      {Platform.OS === 'ios' ? (
        <Section title="Drawn versions (the Android look, previewed on iOS)">
          <Text variant="footnote" color="textSecondary">
            The same controls as drawn for Android, to compare against the native ones above.
          </Text>
          {/* On iOS the app's own DialogHost renders nothing (alerts are native), so the previews bring their own. */}
          <DrawnDialogHost />
          <List>
            <ListSection>
              <View style={styles.drawnRow}>
                <Text variant="body">Drawn switch</Text>
                <DrawnSwitch label="Drawn switch" value={drawnOn} onValueChange={setDrawnOn} />
              </View>
            </ListSection>
          </List>
          <DrawnSlider label="Drawn slider" value={drawnLevel} onValueChange={setDrawnLevel} />
          <View style={styles.inline}>
            <DrawnStepper label="Drawn stepper" value={drawnCount} min={1} max={9} onValueChange={setDrawnCount} />
            <DrawnSpinner size="small" />
            <DrawnSpinner size="large" />
            <DrawnMenu label="Drawn menu" items={[{ label: 'Share', icon: 'share', onPress: () => toast.info('Share') }, 'divider', { label: 'Delete', icon: 'trash', destructive: true, onPress: () => toast.warning('Delete') }]} />
          </View>
          <GlassButton
            label="Drawn alert"
            variant="glass"
            onPress={() => presentDrawnAlert(normalizeAlert({ title: 'Delete this post?', message: 'This can’t be undone.', actions: [{ label: 'Cancel', style: 'cancel' }, { label: 'Delete', style: 'destructive' }] }))}
          />
          <GlassButton
            label="Drawn action sheet"
            variant="glass"
            onPress={() => presentDrawnActionSheet(normalizeActionSheet({ title: 'Post options', actions: [{ label: 'Share' }, { label: 'Copy link' }, { label: 'Delete post', style: 'destructive' }] }))}
          />
        </Section>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  control: { gap: spacing.xs },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, flexWrap: 'wrap' },
  drawnRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
});
