import { Stack } from 'expo-router';

/**
 * Stack of the Feed tab. It has **no header**: the "Feed" wordmark is the first row of the list and scrolls
 * away with the posts, so the feed is edge to edge and there is less chrome. (Opening a post pushes the
 * root-level `post/[id]` screen, which has its own header.)
 */
export default function FeedStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
