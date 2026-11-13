/**
 * Opacities (1 → 0) for the strips that make up a fade mask. Eased (ease-out) so the blur holds
 * near the screen edge and then falls away smoothly — a linear ramp reads as a hard band.
 * Pure so the shape of the fade is tested.
 */
export function fadeOpacities(steps: number, power = 1.6): number[] {
  if (steps < 2) throw new Error('A fade needs at least 2 steps');
  return Array.from({ length: steps }, (_, i) => Math.pow(1 - i / (steps - 1), power));
}
