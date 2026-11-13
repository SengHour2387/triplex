import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Appearance, Platform, StyleSheet, View } from 'react-native';

import {
  ExpandReveal,
  Glass,
  GlassButton,
  GlassRow,
  Icon,
  ICONS,
  OptionPicker,
  Screen,
  Text,
  TextField,
  toast,
  typography,
  useDevSurfaceOverride,
  useReduceTransparency,
  useSurfaceMode,
  useTheme,
  type IconName,
  type TextProps,
} from '../src/design-system';
import { AdaptiveSections } from '../src/gallery/AdaptiveSections';
import { PostSections } from '../src/gallery/PostSections';
import { Section } from '../src/gallery/Section';

/**
 * Dev-only component gallery. Every design-system primitive, in every state, so each tier
 * (iOS 26 glass / iOS < 26 blur / Android frosted) and each colour scheme can be checked by eye.
 * Not reachable in release builds.
 */
export default function Gallery() {
  if (!__DEV__) return <Redirect href="/" />;
  return <GalleryScreen />;
}

const TIER_LABEL = {
  liquid: 'A · Liquid Glass (iOS 26+)',
  blur: 'B · Material blur (iOS < 26)',
  frosted: 'C · Frosted (Android, unverified)',
  solid: '— · Solid (Reduce Transparency)',
} as const;

function GalleryScreen() {
  const router = useRouter();
  const { scheme, colors } = useTheme();
  const mode = useSurfaceMode();
  const reduceTransparency = useReduceTransparency();
  const forced = useDevSurfaceOverride((s) => s.mode);
  const setForced = useDevSurfaceOverride((s) => s.setMode);
  const [busy, setBusy] = useState(false);
  const [username, setUsername] = useState('');
  const [filled, setFilled] = useState('alice');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('hello');
  const [revealOpen, setRevealOpen] = useState(false);
  const [pick, setPick] = useState<'light' | 'dark' | 'system'>('system');

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="pageTitle">Gallery</Text>
        <GlassButton label="Close" variant="plain" size="compact" onPress={() => router.back()} />
      </View>

      <Section title="Environment">
        <Row label="Surface mode" value={TIER_LABEL[mode]} />
        <Row label="Scheme" value={scheme} />
        <Row label="Reduce transparency" value={String(reduceTransparency)} />
        <Row label="Platform" value={`${Platform.OS} ${Platform.Version}`} />
        <Row label="Forced surface (dev)" value={forced ?? 'auto'} />
        <View style={styles.row}>
          <GlassButton label="Auto" size="compact" variant={forced === null ? 'prominent' : 'glass'} onPress={() => setForced(null)} />
          <GlassButton label="Blur" size="compact" variant={forced === 'blur' ? 'prominent' : 'glass'} onPress={() => setForced('blur')} />
          <GlassButton label="Frosted" size="compact" variant={forced === 'frosted' ? 'prominent' : 'glass'} onPress={() => setForced('frosted')} />
          <GlassButton label="Solid" size="compact" variant={forced === 'solid' ? 'prominent' : 'glass'} onPress={() => setForced('solid')} />
        </View>
        <View style={styles.row}>
          <GlassButton label="Light" size="compact" variant="glass" onPress={() => Appearance.setColorScheme('light')} />
          <GlassButton label="Dark" size="compact" variant="glass" onPress={() => Appearance.setColorScheme('dark')} />
          <GlassButton label="System" size="compact" variant="glass" onPress={() => Appearance.setColorScheme('unspecified')} />
        </View>
      </Section>

      <Section title="Glass surfaces">
        <Backdrop>
          <Glass radius="lg" style={styles.glassCard}>
            <Text variant="headline">Regular</Text>
            <Text variant="subhead" color="textSecondary">The default material</Text>
          </Glass>
          <Glass radius="xl" style={styles.glassCard}>
            <Text variant="headline">Large radius</Text>
            <Text variant="subhead" color="textSecondary">Same material, rounder corners</Text>
          </Glass>
          <Glass radius="pill" tint="rgba(77,163,255,0.25)" style={styles.glassPill}>
            <Text variant="headline">Tinted pill</Text>
          </Glass>
        </Backdrop>
      </Section>

      <Section title="Buttons">
        <GlassButton label="Continue" onPress={() => toast.info('Prominent pressed')} />
        <GlassButton label="With icon" icon="person" onPress={() => toast.info('With icon pressed')} />
        <GlassButton label="Tap to toggle loading" loading={busy} onPress={() => setBusy((b) => !b)} variant="prominent" />
        <GlassButton label="Disabled" disabled />
        <Backdrop height={150}>
          <View style={styles.row}>
            <GlassButton label="Glass" variant="glass" onPress={() => toast.info('Glass pressed')} />
            <GlassButton label="Glass + icon" variant="glass" icon="person" />
          </View>
        </Backdrop>
        <View style={styles.row}>
          <GlassButton label="Plain link" variant="plain" />
          <GlassButton label="Compact" size="compact" />
          <GlassButton label="Compact glass" size="compact" variant="glass" />
        </View>
      </Section>

      <Section title="Rows & pickers">
        <Text variant="footnote" color="textSecondary">
          GlassRow is a navigation entry. OptionPicker is a segmented control: the system SwiftUI one on iOS (Liquid Glass on iOS 26), a design-system one elsewhere.
        </Text>
        <GlassRow label="Settings" icon="settings" onPress={() => toast.info('Row pressed')} />
        <GlassRow label="A row with a much longer label that has to wrap onto a second line" icon="person" onPress={() => toast.info('Row pressed')} />
        <OptionPicker
          label="Theme"
          value={pick}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ]}
          onChange={setPick}
        />
      </Section>

      <AdaptiveSections />

      <PostSections />

      <Section title="Sheets">
        <Text variant="footnote" color="textSecondary">
          Native iOS sheets: on iOS 26 the system draws the Liquid Glass background, grabber and drag physics.
        </Text>
        <GlassButton label="Resizable sheet (half ↔ full)" variant="glass" onPress={() => router.push('/gallery-sheet')} />
        <GlassButton label="Compact confirmation sheet" variant="glass" onPress={() => router.push('/gallery-sheet-compact')} />
      </Section>

      <Section title="Native under JS (experiment)">
        <Text variant="footnote" color="textSecondary">
          Real GlassView underneath a JS-drawn sheet: blur, semi-transparent and solid.
        </Text>
        <GlassButton label="Glass under React sheet" variant="glass" onPress={() => router.push('/gallery-overlap')} />
      </Section>

      <Section title="Tab bar">
        <Text variant="footnote" color="textSecondary">
          The bottom tab bar (Feed / Create / Me). iOS: the native bar — real Liquid Glass on iOS 26, the standard system bar on older iOS. Android: the drawn floating glass bar.
        </Text>
        <GlassButton label="Open tab bar demo" variant="glass" onPress={() => router.push('/gallery-tabs')} />
      </Section>

      <Section title="Typography">
        {(Object.keys(typography) as (keyof typeof typography)[]).map((variant) => (
          <Text key={variant} variant={variant} numberOfLines={1} style={styles.typeRow}>
            {variant === 'logo' ? 'TripleX' : `${variant} — The quick brown fox`}
          </Text>
        ))}
        <TextSample color="textSecondary" label="textSecondary" />
        <TextSample color="accent" label="accent" />
        <TextSample color="error" label="error" />
      </Section>

      <Section title="Text fields">
        <TextField label="Username or Email" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} hint="you@example.com" />
        <TextField label="Prefilled" value={filled} onChangeText={setFilled} />
        <TextField label="Password" value={password} onChangeText={setPassword} password />
        <TextField label="With error" value={errorText} onChangeText={setErrorText} error="Invalid email or password" />
      </Section>

      <Section title="Icons">
        <View style={styles.iconGrid}>
          {(Object.keys(ICONS) as IconName[]).map((name) => (
            <View key={name} style={styles.iconCell}>
              <Icon name={name} size={26} />
              <Text variant="caption" color="textSecondary">{name}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Toasts">
        <View style={styles.row}>
          <GlassButton label="Success" size="compact" variant="glass" onPress={() => toast.success('Profile updated')} />
          <GlassButton label="Error" size="compact" variant="glass" onPress={() => toast.error('Invalid email or password')} />
        </View>
        <View style={styles.row}>
          <GlassButton label="Warning" size="compact" variant="glass" onPress={() => toast.warning('You are offline')} />
          <GlassButton label="Info" size="compact" variant="glass" onPress={() => toast.info('Syncing your feed…')} />
        </View>
        <GlassButton
          label="With action + long text"
          variant="glass"
          onPress={() =>
            toast.error('Upload failed because the connection dropped while sending your third photo.', {
              actionLabel: 'Retry',
              onAction: () => toast.success('Retrying…'),
            })
          }
        />
      </Section>

      <Section title="Expand reveal (fade + grow from top)">
        <GlassButton
          label={revealOpen ? 'Hide replies' : 'View 3 replies'}
          variant="glass"
          onPress={() => setRevealOpen((v) => !v)}
        />
        <ExpandReveal open={revealOpen}>
          <View style={{ gap: 8, paddingTop: 8 }}>
            {['Agreed!', 'Same here', 'Where was this?'].map((t) => (
              <Text key={t} variant="body">{t}</Text>
            ))}
          </View>
        </ExpandReveal>
      </Section>

      <View style={{ height: 40 }} />
      <Text variant="caption" color="textSecondary" style={{ textAlign: 'center', color: colors.textSecondary }}>
        End of gallery
      </Text>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kv}>
      <Text variant="subhead" color="textSecondary">{label}</Text>
      <Text variant="subhead" weight="600">{value}</Text>
    </View>
  );
}

function TextSample({ color, label }: { color: TextProps['color']; label: string }) {
  return <Text color={color}>{label} — The quick brown fox</Text>;
}

/** Bold, busy colours + large text, so blur/refraction behind glass is unmistakable. */
function Backdrop({ children, height = 300 }: { children: React.ReactNode; height?: number }) {
  return (
    <View style={[styles.backdrop, { height }]}>
      <View style={[styles.blob, { backgroundColor: '#4F8BFF', width: 170, height: 170, left: -30, top: -20 }]} />
      <View style={[styles.blob, { backgroundColor: '#FFD23F', width: 130, height: 130, right: 10, top: 20 }]} />
      <View style={[styles.blob, { backgroundColor: '#3DDC97', width: 150, height: 150, left: 110, bottom: -40 }]} />
      <View style={[styles.blob, { backgroundColor: '#B04FFF', width: 110, height: 110, right: -20, bottom: 10 }]} />
      <Text variant="largeTitle" style={styles.backdropText}>BACKDROP TEXT</Text>
      <Text variant="largeTitle" style={[styles.backdropText, { top: 70 }]}>MAKES BLUR VISIBLE</Text>
      <View style={styles.backdropContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  kv: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  typeRow: { marginVertical: 2 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconCell: { width: 84, alignItems: 'center', gap: 6, paddingVertical: 8 },
  backdrop: { borderRadius: 28, overflow: 'hidden', backgroundColor: '#FF6B4A', justifyContent: 'center' },
  blob: { position: 'absolute', borderRadius: 999 },
  backdropText: { position: 'absolute', top: 20, left: 14, color: '#fff', opacity: 0.95 },
  backdropContent: { padding: 14, gap: 12, justifyContent: 'center' },
  glassCard: { padding: 16, gap: 2 },
  glassPill: { paddingVertical: 14, paddingHorizontal: 22, alignSelf: 'flex-start' },
});
