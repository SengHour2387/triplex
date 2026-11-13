import AsyncStorage from '@react-native-async-storage/async-storage';
import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppError } from '../../../core/errors/appError';
import { resetNotifyDedupe } from '../../../core/notify';
import { useToastStore } from '../../../design-system';
import { useAuthStore } from '../../auth/store/authStore';
import { CommentsApi } from '../../comments/api/commentsApi';
import { PostsApi } from '../api/postsApi';
import { saveFeedSnapshot } from '../model/feedSnapshot';
import { makePost } from '../model/fixtures';
import { postKeys } from '../model/postCache';
import { FeedScreen } from './FeedScreen';
import { PostDetailScreen } from './PostDetailScreen';

jest.mock('../api/postsApi');
jest.mock('../../comments/api/commentsApi');
jest.mock('../../../core/storage/secureStorage', () => ({ secureStorage: { getAccessToken: jest.fn() } }));
const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, back: jest.fn() }) }));

const api = jest.mocked(PostsApi);
const commentsApi = jest.mocked(CommentsApi);
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

async function renderWith(ui: ReactElement, client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })) {
  const view = await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </SafeAreaProvider>,
  );
  return { client, ...view };
}

const trip = {
  id: 't1',
  title: 'Kirirom Camping',
  caption: null,
  totalCost: 7,
  currency: '$',
  start: { id: 's0', title: 'Wat Phnom', description: null, cost: null, currency: null },
  waypoints: [{ id: 's1', title: 'Market', description: 'Buy food', cost: 2.5, currency: '$' }],
  end: { id: 's2', title: 'Summit', description: null, cost: 3.5, currency: '$' },
};

const media = makePost({ id: 'a', caption: 'Sunrise view', author: { id: 'u1', username: 'dara', name: null, avatarUrl: null }, images: ['https://img/1.jpg', 'https://img/2.jpg'], reactionCount: 1250, commentCount: 5, repostCount: 3, tripPlan: trip });
const plain = makePost({ id: 'b', caption: 'Second post', author: { id: 'u2', username: 'sophia', name: null, avatarUrl: null }, reactionCount: 2 });

beforeEach(async () => {
  jest.clearAllMocks();
  Object.values(api).forEach((fn) => fn.mockReset());
  api.reactions.mockResolvedValue({ total: 0, reactions: [], users: [] }); // the card's reaction stack asks for this
  Object.values(commentsApi).forEach((fn) => fn.mockReset());
  commentsApi.list.mockResolvedValue([]); // the post screen lists its comments
  mockPush.mockReset();
  resetNotifyDedupe();
  onlineManager.setOnline(true);
  await AsyncStorage.clear();
  useToastStore.setState({ current: null });
  useAuthStore.setState({ user: { id: 'me', username: 'me', email: 'me@x.co' }, status: 'authenticated', isLoading: false, error: null });
});

// TanStack Query notifies on timers; flush them inside act() so nothing lands after a test.
afterEach(async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
});

describe('FeedScreen — what it shows', () => {
  it('shows the posts it gets, laid out like the Flutter card', async () => {
    api.feed.mockResolvedValue([media, plain]);
    await renderWith(<FeedScreen />);
    expect(await screen.findByText('dara')).toBeTruthy();
    expect(screen.getByText('Sunrise view')).toBeTruthy();
    expect(screen.getByText('Second post')).toBeTruthy();
    // The attached trip is a pill beside the caption, and the plan is drawn under the photos.
    expect(screen.getAllByText('Kirirom Camping').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Wat Phnom')).toBeTruthy();
    expect(screen.getByText(/Cost/)).toBeTruthy();
    // 1250 reactions → "1.3k" — and no made-up share / saved counters.
    expect(screen.getByLabelText('1250 reactions')).toBeTruthy();
    expect(screen.queryByText(/saved/i)).toBeNull();
    expect(screen.queryByLabelText(/share/i)).toBeNull();
  });

  it('says so when the feed is empty — it never invents posts', async () => {
    api.feed.mockResolvedValue([]);
    await renderWith(<FeedScreen />);
    expect(await screen.findByText('No posts in your feed yet')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeTruthy();
  });

  it('shows a retryable error when the first load fails', async () => {
    api.feed.mockRejectedValueOnce(new AppError({ kind: 'bad_request', message: 'Something was wrong with that request.', status: 400 }));
    await renderWith(<FeedScreen />);
    expect(await screen.findByText("Couldn't load your feed")).toBeTruthy();
    api.feed.mockResolvedValueOnce([plain]);
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Second post')).toBeTruthy();
  });

  it('says it is offline (not "error") when there is nothing saved and no connection', async () => {
    onlineManager.setOnline(false);
    api.feed.mockResolvedValue([plain]);
    await renderWith(<FeedScreen />);
    expect(await screen.findByText("You're offline")).toBeTruthy();
    expect(api.feed).not.toHaveBeenCalled();
  });

  it('shows the last feed from disk at once, offline, instead of a blank screen', async () => {
    await saveFeedSnapshot('me', [plain]);
    onlineManager.setOnline(false);
    await renderWith(<FeedScreen />);
    expect(await screen.findByText('Second post')).toBeTruthy();
  });

  it('keeps the posts on screen and says so when a background refresh fails', async () => {
    await saveFeedSnapshot('me', [plain]);
    api.feed.mockRejectedValue(new AppError({ kind: 'server', message: 'Something went wrong on our side. Please try again.', status: 500 }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
    await renderWith(<FeedScreen />, client);
    expect(await screen.findByText('Second post')).toBeTruthy();
    await waitFor(() => expect(client.getQueryState(postKeys.feed)?.status).toBe('error'));
    expect(screen.getByText('Second post')).toBeTruthy(); // not replaced by an error screen
  });

  it("replaces the saved feed with the network's, and never the other way round", async () => {
    await saveFeedSnapshot('me', [plain]);
    api.feed.mockResolvedValue([media]);
    await renderWith(<FeedScreen />);
    expect(await screen.findByText('Sunrise view')).toBeTruthy();
    await waitFor(() => expect(screen.queryByText('Second post')).toBeNull());
  });

  it("never shows another account's saved feed", async () => {
    await saveFeedSnapshot('someone-else', [plain]);
    api.feed.mockResolvedValue([media]);
    await renderWith(<FeedScreen />);
    expect(await screen.findByText('Sunrise view')).toBeTruthy();
    expect(screen.queryByText('Second post')).toBeNull();
  });
});

describe('reactions', () => {
  it('reacts at once — before the server has answered — then the server confirms', async () => {
    api.feed.mockResolvedValue([plain]);
    let answer: (state: { myReaction: 'like'; reactionCount: number }) => void = () => undefined;
    api.react.mockReturnValue(new Promise((resolve) => (answer = resolve)));
    await renderWith(<FeedScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Like' }));
    expect(await screen.findByLabelText('3 reactions')).toBeTruthy(); // the request is still out
    expect(api.react).toHaveBeenCalledWith('b', 'like');
    await act(async () => answer({ myReaction: 'like', reactionCount: 9 })); // the server's own count wins
    expect(await screen.findByLabelText('9 reactions')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Your reaction: Like/ })).toBeTruthy();
  });

  it('takes the reaction back on a second tap', async () => {
    api.feed.mockResolvedValue([makePost({ id: 'b', myReaction: 'love', reactionCount: 4 })]);
    api.unreact.mockResolvedValue({ myReaction: null, reactionCount: 3 });
    await renderWith(<FeedScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: /Your reaction: Love/ }));
    expect(await screen.findByLabelText('3 reactions')).toBeTruthy();
    await waitFor(() => expect(api.unreact).toHaveBeenCalledWith('b', 'love'));
  });

  it('puts the count back and tells the user when the server refuses', async () => {
    api.feed.mockResolvedValue([plain]);
    api.react.mockRejectedValue(new AppError({ kind: 'server', message: 'Something went wrong on our side. Please try again.', status: 500 }));
    await renderWith(<FeedScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Like' }));
    await waitFor(() => expect(useToastStore.getState().current?.message).toMatch(/went wrong/));
    expect(await screen.findByLabelText('2 reactions')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Like' })).toBeTruthy();
  });

  it('offers all seven reactions to screen readers as actions (the long-press has an alternative)', async () => {
    api.feed.mockResolvedValue([plain]);
    api.react.mockResolvedValue({ myReaction: 'wow', reactionCount: 3 });
    await renderWith(<FeedScreen />);
    const like = await screen.findByRole('button', { name: 'Like' });
    expect(like.props.accessibilityActions.map((a: { name: string }) => a.name)).toEqual(['like', 'love', 'haha', 'wow', 'sad', 'cry', 'angry']);
    await act(async () => like.props.onAccessibilityAction({ nativeEvent: { actionName: 'wow' } }));
    await waitFor(() => expect(api.react).toHaveBeenCalledWith('b', 'wow'));
  });

  it('opens the list of who reacted from the count, but not when there are none', async () => {
    api.feed.mockResolvedValue([plain, makePost({ id: 'c', caption: 'No reactions', reactionCount: 0 })]);
    await renderWith(<FeedScreen />);
    await fireEvent.press(await screen.findByLabelText('2 reactions'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/reactions/[postId]', params: { postId: 'b' } });
    mockPush.mockClear();
    await fireEvent.press(screen.getByLabelText('0 reactions'));
    // (the tap falls through to the card, which opens the post — but never the empty reactions list)
    expect(mockPush).not.toHaveBeenCalledWith(expect.objectContaining({ pathname: '/reactions/[postId]' }));
  });
});

describe('the reaction stack', () => {
  const breakdown = (reactions: { type: 'like' | 'love' | 'haha'; count: number }[]) => ({ total: reactions.reduce((n, r) => n + r.count, 0), reactions, users: [] });

  it("shows everyone's top reactions beside the count and says them aloud", async () => {
    api.feed.mockResolvedValue([makePost({ id: 'b', caption: 'Hi', reactionCount: 12 })]);
    api.reactions.mockResolvedValue(breakdown([{ type: 'like', count: 2 }, { type: 'love', count: 9 }, { type: 'haha', count: 1 }]));
    await renderWith(<FeedScreen />);
    expect(await screen.findByLabelText('12 reactions, mostly Love, Like, Haha')).toBeTruthy();
    expect(screen.getByText('❤️', { includeHiddenElements: true })).toBeTruthy();
    expect(api.reactions).toHaveBeenCalledWith('b');
  });

  it("doesn't ask for the breakdown of a post nobody reacted to", async () => {
    api.feed.mockResolvedValue([makePost({ id: 'b', caption: 'Hi', reactionCount: 0 })]);
    await renderWith(<FeedScreen />);
    await screen.findByText('Hi');
    expect(api.reactions).not.toHaveBeenCalled();
  });

  it('puts the heart in front of the stack; once you have reacted, your reaction replaces the heart', async () => {
    api.feed.mockResolvedValue([makePost({ id: 'b', caption: 'Hi', reactionCount: 3, myReaction: null })]);
    api.reactions.mockResolvedValue(breakdown([{ type: 'like', count: 3 }]));
    api.react.mockResolvedValue({ myReaction: 'like', reactionCount: 4 });
    await renderWith(<FeedScreen />);
    expect(await screen.findByRole('button', { name: 'Like' })).toBeTruthy(); // the heart, in front
    expect(await screen.findByText('👍', { includeHiddenElements: true })).toBeTruthy(); // behind it
    // React: the like button becomes the reaction itself, and there is no separate heart any more.
    await fireEvent.press(screen.getByRole('button', { name: 'Like' }));
    expect(await screen.findByRole('button', { name: /Your reaction: Like/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Like' })).toBeNull();
    expect(screen.getAllByText('👍', { includeHiddenElements: true }).length).toBeGreaterThanOrEqual(1);
  });

  it("doesn't repeat the user's own reaction behind itself, and doesn't announce it twice", async () => {
    api.feed.mockResolvedValue([makePost({ id: 'b', caption: 'Hi', reactionCount: 1, myReaction: 'love' })]);
    api.reactions.mockResolvedValue(breakdown([{ type: 'love', count: 1 }]));
    await renderWith(<FeedScreen />);
    await waitFor(() => expect(api.reactions).toHaveBeenCalled());
    expect(await screen.findByLabelText('1 reaction')).toBeTruthy(); // no "mostly …"
    expect(screen.getAllByText('❤️', { includeHiddenElements: true })).toHaveLength(1);
  });

  it('a failing breakdown is silent: the count still shows, no toast', async () => {
    api.feed.mockResolvedValue([makePost({ id: 'b', caption: 'Hi', reactionCount: 4 })]);
    api.reactions.mockRejectedValue(new AppError({ kind: 'server', message: 'Something went wrong on our side. Please try again.', status: 500 }));
    await renderWith(<FeedScreen />);
    expect(await screen.findByLabelText('4 reactions')).toBeTruthy();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(useToastStore.getState().current).toBeNull();
  });
});

describe('the feed title', () => {
  it('is a row of the list (it scrolls away with the posts), not a fixed header', async () => {
    api.feed.mockResolvedValue([plain]);
    await renderWith(<FeedScreen />);
    // The title is inside the scrolling list, so it moves with the posts.
    expect(await within(await screen.findByTestId('feed-list')).findByRole('header', { name: 'Feed' })).toBeTruthy();
  });

  it('is still there above the empty / offline / error messages', async () => {
    api.feed.mockResolvedValue([]);
    await renderWith(<FeedScreen />);
    expect(await screen.findByText('No posts in your feed yet')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Feed' })).toBeTruthy();
  });
});

describe('comments on a card', () => {
  it('the comment count opens the comments sheet', async () => {
    api.feed.mockResolvedValue([media]);
    await renderWith(<FeedScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: '5 comments' }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/comments/[postId]', params: { postId: 'a' } });
  });
});

describe('reposts on a card', () => {
  it('embeds the original and opens the repost sheet', async () => {
    const repost = makePost({ id: 'r1', type: 'repost', repostId: 'a', caption: 'So good', repostedPost: media });
    api.feed.mockResolvedValue([repost]);
    await renderWith(<FeedScreen />);
    expect(await screen.findByText('So good')).toBeTruthy();
    expect(screen.getByText('Sunrise view')).toBeTruthy(); // the original's caption, inside the embedded card
    await fireEvent.press(screen.getByRole('button', { name: /reposts?$/ }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/repost/[postId]', params: { postId: 'r1' } });
  });

  it('says the original is gone, and does not offer to repost it', async () => {
    api.feed.mockResolvedValue([makePost({ id: 'r2', type: 'repost', repostId: 'gone', repostedPost: null, caption: 'Look' })]);
    await renderWith(<FeedScreen />);
    expect(await screen.findByText('This post is no longer available.')).toBeTruthy();
    expect(screen.getByRole('button', { name: /reposts?$/ })).toBeDisabled();
  });
});

describe('PostDetailScreen', () => {
  it('shows the card the feed already had while the fresh copy loads', async () => {
    api.feed.mockResolvedValue([media]);
    let finish: (post: typeof media) => void = () => undefined;
    api.get.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const { client } = await renderWith(<FeedScreen />);
    await screen.findByText('Sunrise view');
    // Open the post: a second screen on the same query cache, as the router would.
    await renderWith(<PostDetailScreen postId="a" />, client);
    expect(screen.getAllByText('Sunrise view').length).toBeGreaterThanOrEqual(1);
    await act(async () => finish({ ...media, caption: 'Edited on the server' }));
    expect(await screen.findByText('Edited on the server')).toBeTruthy();
  });

  it('loads by id with nothing cached (a deep link)', async () => {
    api.get.mockResolvedValue(plain);
    await renderWith(<PostDetailScreen postId="b" />);
    expect(await screen.findByText('Second post')).toBeTruthy();
    expect(api.get).toHaveBeenCalledWith('b');
  });

  it('says when the post does not exist', async () => {
    api.get.mockRejectedValue(new AppError({ kind: 'not_found', message: 'That post is no longer available.', status: 404 }));
    await renderWith(<PostDetailScreen postId="nope" />);
    expect(await screen.findByText("This post isn't available")).toBeTruthy();
  });

  it('offers a retry on another failure', async () => {
    api.get.mockRejectedValueOnce(new AppError({ kind: 'bad_request', message: 'Something was wrong with that request.', status: 400 }));
    await renderWith(<PostDetailScreen postId="b" />);
    expect(await screen.findByText("Couldn't load this post")).toBeTruthy();
    api.get.mockResolvedValueOnce(plain);
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Second post')).toBeTruthy();
  });

  it('is not tappable through to itself, and keeps the comment count a plain stat', async () => {
    api.get.mockResolvedValue(media);
    await renderWith(<PostDetailScreen postId="a" />);
    await screen.findByText('Sunrise view');
    expect(screen.queryByRole('button', { name: /^\d+ comments?$/ })).toBeNull();
    expect(screen.getByLabelText('5 comments')).toBeTruthy();
  });
});

describe('feed and detail never disagree about a post', () => {
  it('a reaction made on the detail screen shows on the feed card, and vice versa', async () => {
    api.feed.mockResolvedValue([plain]);
    api.get.mockResolvedValue(plain);
    api.react.mockResolvedValue({ myReaction: 'like', reactionCount: 3 });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
    await renderWith(
      <>
        <FeedScreen />
        <PostDetailScreen postId="b" />
      </>,
      client,
    );
    await waitFor(() => expect(screen.getAllByLabelText('2 reactions')).toHaveLength(2));
    // React on the *detail* copy (the second like button)…
    await fireEvent.press(screen.getAllByRole('button', { name: 'Like' })[1]);
    // …and the feed's card shows it too.
    await waitFor(() => expect(screen.getAllByLabelText('3 reactions')).toHaveLength(2));
    expect(screen.getAllByRole('button', { name: /Your reaction: Like/ })).toHaveLength(2);
  });
});
