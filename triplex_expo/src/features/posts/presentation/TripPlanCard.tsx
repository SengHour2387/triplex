import { StyleSheet, Text as NativeText, View } from 'react-native';

import { Icon, radii, spacing, Text, useTheme, type IconName } from '../../../design-system';
import type { TripPlan } from '../model/post';
import { orderedStops, stopDetail, totalCostText, type StopKind } from '../model/tripStops';

const STOP_ICON: Record<StopKind, IconName> = { start: 'tripStart', stop: 'tripStop', end: 'tripEnd' };
const GLYPH_BOX = 24;

/**
 * A shared trip plan: title, the stops in order (start, waypoints, end — each with its description or
 * price), and the total cost. Flutter drew stop names as blue underlined "links" that go nowhere; here
 * they are plain bold text until the map task gives them somewhere to go.
 */
export function TripPlanCard({ plan }: { plan: TripPlan }) {
  const { colors } = useTheme();
  const stops = orderedStops(plan);
  const total = totalCostText(plan);

  return (
    <View style={styles.root} accessible accessibilityLabel={describe(plan)}>
      <Text variant="body" weight="500">
        {plan.title}
      </Text>

      {stops.length > 0 ? (
        <View style={styles.stops}>
          {stops.map(({ stop, kind }) => (
            <View key={stop.id} style={styles.stop}>
              <View style={styles.glyph}>
                {kind === 'start' ? (
                  <View style={[styles.startBadge, { backgroundColor: colors.primary }]}>
                    <Icon name={STOP_ICON[kind]} size={12} color={colors.onPrimary} />
                  </View>
                ) : (
                  <Icon name={STOP_ICON[kind]} size={20} color={colors.text} />
                )}
              </View>
              <Text variant="body" style={styles.stopText}>
                <NativeText style={styles.stopName}>{stop.title}</NativeText>
                {stopDetail(stop)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {total ? (
        <Text variant="body">
          <NativeText style={{ color: colors.textSecondary }}>Cost </NativeText>
          <NativeText style={styles.stopName}>{total}</NativeText>
        </Text>
      ) : null}
    </View>
  );
}

/** One sentence for screen readers (the visual layout is icons and inline runs). */
function describe(plan: TripPlan): string {
  const stops = orderedStops(plan).map(({ stop }) => `${stop.title}${stopDetail(stop)}`);
  const total = totalCostText(plan);
  return [`Trip plan: ${plan.title}`, ...(stops.length ? [`Stops: ${stops.join(', ')}`] : []), ...(total ? [`Cost ${total}`] : [])].join('. ');
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  stops: { gap: 10 },
  stop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  glyph: { width: GLYPH_BOX, height: GLYPH_BOX, alignItems: 'center', justifyContent: 'center' },
  startBadge: { width: 20, height: 20, borderRadius: radii.sm / 2 + 1, alignItems: 'center', justifyContent: 'center' },
  stopText: { flex: 1, paddingTop: 2 },
  stopName: { fontWeight: '500' },
});
