/**
 * Design tokens. The values mirror the Flutter app's look (`triplex/lib/app.dart`,
 * `core/toast/toast_overlay.dart`): a monochrome base — black/white primary, #F2F2F2 canvas in
 * light, true black in dark — with an AA-safe blue accent for interactive text.
 *
 * Contrast of every text pair is asserted in `tokens.test.ts`; change a colour and that test tells
 * you whether it is still legible.
 */

export type ColorScheme = 'light' | 'dark';
export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export interface ColorTokens {
  /** App canvas. */
  background: string;
  /** Opaque cards, sheets, and the reduce-transparency fallback for glass. */
  surface: string;
  /** Resting fill of text fields. */
  fieldFill: string;
  text: string;
  textSecondary: string;
  /** Resting border of fields and hairlines on non-glass surfaces. */
  outline: string;
  /** Fill of the prominent button (black in light, white in dark — as in Flutter). */
  primary: string;
  onPrimary: string;
  /** Tappable text / links. Meets AA on `background` and `surface`. */
  accent: string;
  error: string;
  /**
   * Fill for the *un-blurred* fallback surface (tier C, until Android gets real blur). Deliberately
   * 94 % opaque: without blur, anything less lets sharp content behind the card show through the
   * text. Legibility over *any* backdrop is asserted in `tokens.test.ts`.
   */
  glassFill: string;
  glassBorder: string;
  /** Resting fill of capsule controls (stepper, search field, selected tab) — iOS "tertiary fill". */
  controlFill: string;
  /** Fill of the capsule buttons inside alerts and action sheets. Text (incl. red destructive) stays AA on it. */
  buttonFill: string;
  /** Hairline between list rows. A decoration, not text. */
  separator: string;
  /** Track of an on / off switch (iOS system green). */
  toggleOn: string;
  toggleOff: string;
  /** The knob of a switch and slider — white in both schemes, as on iOS. */
  thumb: string;
  /** Red for destructive actions (delete, sign out of everything). Meets AA as text on `surface`. */
  destructive: string;
  /** Dimming layer behind alerts, action sheets and menus. */
  scrim: string;
  toast: Record<ToastKind, { bg: string; fg: string }>;
}

export const colors: Record<ColorScheme, ColorTokens> = {
  light: {
    background: '#F2F2F2',
    surface: '#FFFFFF',
    fieldFill: 'rgba(0,0,0,0.04)',
    text: '#000000',
    textSecondary: '#666666',
    outline: 'rgba(0,0,0,0.22)',
    primary: '#000000',
    onPrimary: '#FFFFFF',
    accent: '#0066CC',
    error: '#B00020',
    glassFill: 'rgba(255,255,255,0.94)',
    glassBorder: 'rgba(0,0,0,0.08)',
    controlFill: 'rgba(120,120,128,0.10)',
    buttonFill: 'rgba(120,120,128,0.14)',
    separator: 'rgba(60,60,67,0.18)',
    toggleOn: '#34C759',
    toggleOff: 'rgba(120,120,128,0.16)',
    thumb: '#FFFFFF',
    destructive: '#D70015',
    scrim: 'rgba(0,0,0,0.32)',
    toast: {
      success: { bg: '#EBFAF2', fg: '#1A7A4A' },
      error: { bg: '#FFF0F0', fg: '#B00020' },
      warning: { bg: '#FFF8E6', fg: '#9A6100' },
      info: { bg: '#EDF5FF', fg: '#1565C0' },
    },
  },
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    fieldFill: 'rgba(255,255,255,0.08)',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    outline: 'rgba(255,255,255,0.28)',
    primary: '#FFFFFF',
    onPrimary: '#000000',
    accent: '#4DA3FF',
    error: '#CF6679',
    glassFill: 'rgba(28,28,30,0.94)',
    glassBorder: 'rgba(255,255,255,0.12)',
    controlFill: 'rgba(120,120,128,0.36)',
    buttonFill: 'rgba(120,120,128,0.24)',
    separator: 'rgba(84,84,88,0.65)',
    toggleOn: '#30D158',
    toggleOff: 'rgba(120,120,128,0.32)',
    thumb: '#FFFFFF',
    destructive: '#FF6961',
    scrim: 'rgba(0,0,0,0.5)',
    toast: {
      success: { bg: '#0E2E1E', fg: '#4CD98A' },
      error: { bg: '#2E0E0E', fg: '#FF6B6B' },
      warning: { bg: '#2E2200', fg: '#FFBB33' },
      info: { bg: '#0D1E35', fg: '#64B5F6' },
    },
  },
};

/** 4-pt grid. */
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radii = { sm: 10, md: 16, lg: 22, xl: 28, xxl: 34, pill: 999 } as const;
export type Radius = keyof typeof radii;

/** Family name registered with expo-font (see `fonts.ts`). */
export const LOGO_FONT = 'logo_font';

export type TextVariant =
  | 'largeTitle'
  | 'title'
  | 'title3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subhead'
  | 'footnote'
  | 'caption'
  | 'pageTitle'
  | 'logo';

export interface TextStyleToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700';
  letterSpacing?: number;
  fontFamily?: string;
}

/** Follows the iOS text-style ramp so Dynamic Type scaling feels native. */
export const typography: Record<TextVariant, TextStyleToken> = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  // iOS "Title 3": action-sheet items, prominent list values.
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '400' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '400' },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  // Top-level page titles (Feed, Create, …) — Flutter sets these in the logo font too (28–32).
  pageTitle: { fontSize: 32, lineHeight: 40, fontWeight: '700', fontFamily: LOGO_FONT },
  // The "TripleX" wordmark: Kodchasan Bold, wide tracking (46 / spacing 10 in Flutter's login).
  logo: { fontSize: 46, lineHeight: 56, fontWeight: '700', letterSpacing: 10, fontFamily: LOGO_FONT },
};

/** Caps Dynamic Type so layouts stay intact at the largest accessibility sizes. */
export const MAX_FONT_SCALE = 1.6;
