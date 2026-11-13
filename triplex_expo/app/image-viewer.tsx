import { useLocalSearchParams, useRouter } from 'expo-router';

import { ImageViewer } from '../src/design-system';
import { parseViewerParams } from '../src/design-system/imageViewerParams';

/**
 * Full-screen photo viewer, shown as a transparent modal so the screen behind blurs through it.
 * Opened with `openImageViewer(router, urls, index)`; the photos travel as route params.
 */
export default function ImageViewerRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ urls?: string | string[]; index?: string }>();
  const { urls, index } = parseViewerParams(params);

  // A link with no photos has nothing to show; leave rather than present a black screen.
  if (urls.length === 0) {
    if (router.canGoBack()) router.back();
    return null;
  }
  return <ImageViewer urls={urls} initialIndex={index} onClose={() => router.back()} />;
}
