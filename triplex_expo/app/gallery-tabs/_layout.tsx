import { Redirect } from 'expo-router';

import { AppTabs, type AppTab } from '../../src/design-system';

/**
 * Dev-only prototype of the app's bottom tab bar. It uses the shared `AppTabs`, so each platform draws
 * its own: the system bar on iOS (real Liquid Glass on iOS 26, the standard UIKit bar below — with
 * minimise-on-scroll) and the drawn floating glass bar on Android.
 *
 * Tabs are the v1 set from MIGRATION_PLAN.md (Flutter's Home and Messages are stubs and are not migrated).
 */
const TABS: readonly AppTab[] = [
  { name: 'index', label: 'Feed', icon: { sf: { default: 'newspaper', selected: 'newspaper.fill' }, md: 'article' } },
  { name: 'create', label: 'Create', icon: { sf: { default: 'plus.circle', selected: 'plus.circle.fill' }, md: 'add-circle-outline', mdSelected: 'add-circle' } },
  { name: 'me', label: 'Me', icon: { sf: { default: 'person', selected: 'person.fill' }, md: 'person-outline', mdSelected: 'person' }, badge: 3 },
];

export default function GalleryTabsLayout() {
  if (!__DEV__) return <Redirect href="/" />;
  return <AppTabs tabs={TABS} />;
}
