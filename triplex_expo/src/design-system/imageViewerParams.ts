/**
 * Route params for the image viewer. Expo Router carries params as strings and flattens an array into
 * one comma-joined value — which would also split any URL that contains a comma (Cloudinary's
 * transformation URLs do). So the photos travel as one JSON-encoded `urls` param.
 */
export interface ViewerParams {
  urls: string[];
  index: number;
}

const isHttpUrl = (value: unknown): value is string => typeof value === 'string' && /^https?:\/\//i.test(value);

function decodeUrls(raw: string | string[] | undefined): string[] {
  const text = Array.isArray(raw) ? raw[0] : raw;
  if (!text) return [];
  try {
    const parsed: unknown = JSON.parse(text);
    return Array.isArray(parsed) ? parsed.filter(isHttpUrl) : [];
  } catch {
    // Not JSON: a hand-written link with a single bare URL.
    return isHttpUrl(text) ? [text] : [];
  }
}

export function parseViewerParams(params: { urls?: string | string[]; index?: string }): ViewerParams {
  const urls = decodeUrls(params.urls);
  const parsed = Number.parseInt(params.index ?? '0', 10);
  const index = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), Math.max(urls.length - 1, 0)) : 0;
  return { urls, index };
}

/** The router call that opens the viewer (kept here so every caller builds the params the same way). */
export function viewerHref(urls: readonly string[], index = 0) {
  return { pathname: '/image-viewer' as const, params: { urls: JSON.stringify(urls), index: String(index) } };
}
