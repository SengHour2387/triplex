import { useLocalSearchParams } from 'expo-router';

import { PostDetailScreen } from '../../src/features/posts';

/** `triplex://post/<id>` — one post, by id. */
export default function PostRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PostDetailScreen postId={id ?? ''} />;
}
