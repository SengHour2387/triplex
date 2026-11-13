/** WCAG 2.x contrast helpers. Used by tests to *measure* legibility rather than eyeball it. */

type RGBA = { r: number; g: number; b: number; a: number };

export function parseColor(input: string): RGBA {
  const hex = /^#([0-9a-f]{6})$/i.exec(input);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const rgba = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(input);
  if (rgba) {
    return { r: +rgba[1], g: +rgba[2], b: +rgba[3], a: rgba[4] === undefined ? 1 : +rgba[4] };
  }
  throw new Error(`Unsupported colour "${input}" (use #rrggbb or rgb()/rgba())`);
}

/** Composites `top` over an opaque `bottom`. */
export function over(top: string, bottom: string): string {
  const t = parseColor(top);
  const b = parseColor(bottom);
  if (b.a !== 1) throw new Error('`bottom` must be opaque');
  const mix = (x: number, y: number) => Math.round(x * t.a + y * (1 - t.a));
  const to = (n: number) => n.toString(16).padStart(2, '0');
  return `#${to(mix(t.r, b.r))}${to(mix(t.g, b.g))}${to(mix(t.b, b.b))}`;
}

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function luminance(color: string): number {
  const { r, g, b, a } = parseColor(color);
  if (a !== 1) throw new Error('Composite translucent colours with over() first');
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
