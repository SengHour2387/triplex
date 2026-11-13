import { formatMoney } from './format';
import type { TripPlan, TripStop } from './post';

export type StopKind = 'start' | 'stop' | 'end';

export interface DisplayStop {
  stop: TripStop;
  kind: StopKind;
}

/** Start → waypoints → end, each tagged with the role that picks its glyph. Missing ends are skipped. */
export function orderedStops(plan: TripPlan): DisplayStop[] {
  return [
    ...(plan.start ? [{ stop: plan.start, kind: 'start' as const }] : []),
    ...plan.waypoints.map((stop) => ({ stop, kind: 'stop' as const })),
    ...(plan.end ? [{ stop: plan.end, kind: 'end' as const }] : []),
  ];
}

/**
 * What follows a stop's name: its description, else its price (Flutter's rule). A stop with neither
 * has nothing after the name.
 */
export function stopDetail(stop: TripStop): string {
  if (stop.description) return ` – ${stop.description}`;
  if (stop.cost !== null && stop.cost > 0) return ` – ${formatMoney(stop.cost, stop.currency)}`;
  return '';
}

/** The trip's total ("$1.50"), or null when it has none worth showing. */
export function totalCostText(plan: TripPlan): string | null {
  return plan.totalCost !== null && plan.totalCost > 0 ? formatMoney(plan.totalCost, plan.currency) : null;
}
