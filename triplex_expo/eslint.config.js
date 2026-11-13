// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

/**
 * Platform guard rails (see MIGRATION_PLAN.md §3.3).
 * `@expo/ui/swift-ui` only exists on iOS and `@expo/ui/jetpack-compose` only on Android, so each may
 * only be imported from a platform-suffixed file. The root `@expo/ui` (universal) renders
 * Jetpack Compose *Material* on Android — the stock-Material look this app deliberately avoids —
 * so it is blocked everywhere; use the design-system primitives instead.
 */
const SWIFT_UI = {
  group: ['@expo/ui/swift-ui', '@expo/ui/swift-ui/*'],
  message:
    '@expo/ui/swift-ui is iOS-only. Import it only from a *.ios.ts(x) file, behind a design-system primitive.',
};
const COMPOSE = {
  group: ['@expo/ui/jetpack-compose', '@expo/ui/jetpack-compose/*'],
  message:
    '@expo/ui/jetpack-compose is Android-only. Import it only from a *.android.ts(x) file, behind a design-system primitive.',
};
const UNIVERSAL = {
  name: '@expo/ui',
  message:
    'Universal @expo/ui renders Jetpack Compose Material on Android (the look we are avoiding). Use src/design-system primitives.',
};

const restrict = (...patterns) => ({
  'no-restricted-imports': [
    'error',
    {
      paths: [UNIVERSAL],
      patterns,
    },
  ],
});

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'ios/*', 'android/*', 'coverage/*', 'node_modules/*'],
  },
  // Default: neither platform-specific UI toolkit is allowed.
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: restrict(SWIFT_UI, COMPOSE),
  },
  // Jest mock factories must `require()` lazily (jest.mock is hoisted above imports).
  {
    files: ['jest.setup.ts'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  // Infrastructure must be fully typed: an `any` here silently disables checking for every caller.
  {
    files: ['src/core/**/*.{ts,tsx}'],
    rules: { '@typescript-eslint/no-explicit-any': 'error' },
  },
  // *.ios.* may use SwiftUI; *.android.* may use Compose.
  {
    files: ['**/*.ios.{js,jsx,ts,tsx}'],
    rules: restrict(COMPOSE),
  },
  {
    files: ['**/*.android.{js,jsx,ts,tsx}'],
    rules: restrict(SWIFT_UI),
  },
]);
