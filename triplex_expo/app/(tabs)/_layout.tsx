import { AppTabs, type AppTab } from '../../src/design-system';

/**
 * The signed-in shell's bottom tabs: the system tab bar on iOS (floating Liquid Glass on iOS 26, the
 * classic UIKit bar below) and the drawn floating glass bar on Android. Only tabs for *finished*
 * features are registered (MIGRATION_PLAN.md §5): Feed (Task 7) and Profile today; Create joins when it lands.
 *
 * Each tab owns a Stack (see `(profile)/_layout.tsx`), so a tab keeps its place when you switch away.
 */
const TABS: readonly AppTab[] = [
  {
    name: '(feed)',
    label: 'Feed',
    icon: { sf: { default: 'newspaper', selected: 'newspaper.fill' }, md: 'article', mdSelected: 'article' },
  },
  {
    name: '(profile)',
    label: 'Profile',
    icon: { sf: { default: 'person', selected: 'person.fill' }, md: 'person-outline', mdSelected: 'person' },
  },
];

export default function TabsLayout() {
  return <AppTabs tabs={TABS} />;
}
