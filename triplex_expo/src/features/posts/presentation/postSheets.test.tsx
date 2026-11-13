import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppError } from '../../../core/errors/appError';
import { resetNotifyDedupe } from '../../../core/notify';
import { createQueryClient } from '../../../core/query/queryClient';
import { useToastStore } from '../../../design-system';
import { PostsApi } from '../api/postsApi';
import { makePost } from '../model/fixtures';
import { postKeys } from '../model/postCache';
import { ReactionsSheet } from './ReactionsSheet';
import { RepostSheet } from './RepostSheet';

jest.mock('../api/postsApi');
jest.mock('../../../core/storage/secureStorage', () => ({ secureStorage: { getAccessToken: jest.fn() } }));
const mockBack = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: mockBack }),
  useLocalSearchParams: () => mockParams,
  Stack: { Screen: () => null },
}));

const api = jest.mocked(PostsApi);
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

async function renderSheet(ui: ReactElement, client?: QueryClient) {
  // Same client the app uses (so a failed mutation toasts), minus the waiting between retries.
  const queryClient = client ?? createQueryClient();
  queryClient.setDefaultOptions({ ...queryClient.getDefaultOptions(), queries: { ...queryClient.getDefaultOptions().queries, retry: false, gcTime: Infinity } });
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </SafeAreaProvider>,
  );
  return queryClient;
}

beforeEach(() => {
  jest.clearAllMocks();
  Object.values(api).forEach((fn) => fn.mockReset());
  mockBack.mockReset();
  resetNotifyDedupe();
  useToastStore.setState({ current: null });
});
afterEach(async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
});

const reactions = {
  total: 49,
  reactions: [
    { type: 'like' as const, count: 42 },
    { type: 'love' as const, count: 7 },
  ],
  users: [
    { type: 'like' as const, userId: 'u1', username: 'dara', name: 'Dara Sok', avatarUrl: null },
    { type: 'love' as const, userId: 'u2', username: 'sophia', name: null, avatarUrl: null },
  ],
};

describe('ReactionsSheet', () => {
  beforeEach(() => {
    mockParams = { postId: 'p1' };
  });

  it('lists who reacted, with the real total and a count per reaction', async () => {
    api.reactions.mockResolvedValue(reactions);
    await renderSheet(<ReactionsSheet />);
    expect(await screen.findByText('Dara Sok')).toBeTruthy();
    expect(screen.getByText('@dara')).toBeTruthy();
    expect(screen.getByText('sophia')).toBeTruthy(); // no display name → the username
    expect(screen.getByRole('button', { name: 'All 49' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Love, 7' })).toBeTruthy();
  });

  it('filters by reaction', async () => {
    api.reactions.mockResolvedValue(reactions);
    await renderSheet(<ReactionsSheet />);
    await screen.findByText('Dara Sok');
    await fireEvent.press(screen.getByRole('button', { name: 'Love, 7' }));
    expect(screen.queryByText('Dara Sok')).toBeNull();
    expect(screen.getByText('sophia')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'All 49' }));
    expect(screen.getByText('Dara Sok')).toBeTruthy();
  });

  it('is honest that the server lists only the most recent people', async () => {
    api.reactions.mockResolvedValue(reactions); // 49 reactions, 2 listed
    await renderSheet(<ReactionsSheet />);
    expect(await screen.findByText('Showing the 2 most recent reactions.')).toBeTruthy();
  });

  it('says when there are no reactions', async () => {
    api.reactions.mockResolvedValue({ total: 0, reactions: [], users: [] });
    await renderSheet(<ReactionsSheet />);
    expect(await screen.findByText('No reactions yet.')).toBeTruthy();
  });

  it('offers a retry when loading fails', async () => {
    api.reactions.mockRejectedValueOnce(new AppError({ kind: 'bad_request', message: 'Something was wrong with that request.', status: 400 }));
    await renderSheet(<ReactionsSheet />);
    expect(await screen.findByText('Something was wrong with that request.')).toBeTruthy();
    api.reactions.mockResolvedValueOnce(reactions);
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Dara Sok')).toBeTruthy();
  });

  it('closes from the header', async () => {
    api.reactions.mockResolvedValue(reactions);
    await renderSheet(<ReactionsSheet />);
    await screen.findByText('Dara Sok');
    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    expect(mockBack).toHaveBeenCalled();
  });
});

describe('RepostSheet', () => {
  const original = makePost({ id: 'orig', caption: 'The original', author: { id: 'u1', username: 'dara', name: null, avatarUrl: null } });

  it('reposts with the quote, closes, and puts the new post at the top of the feed', async () => {
    mockParams = { postId: 'orig' };
    api.get.mockResolvedValue(original);
    const created = makePost({ id: 'new', type: 'repost', repostId: 'orig', repostedPost: original, caption: 'Love this' });
    api.repost.mockResolvedValue(created);
    const client = createQueryClient();
    client.setQueryData(postKeys.feed, [original]);
    await renderSheet(<RepostSheet />, client);
    await screen.findByText('The original');
    await fireEvent.changeText(screen.getByLabelText('Add your thoughts (optional)'), '  Love this  ');
    await fireEvent.press(screen.getByRole('button', { name: 'Repost now' }));
    await waitFor(() => expect(api.repost).toHaveBeenCalledWith('orig', '  Love this  '));
    await waitFor(() => expect(mockBack).toHaveBeenCalled());
    expect(client.getQueryData<{ id: string; repostCount: number; isReposted: boolean }[]>(postKeys.feed)?.map((p) => p.id)).toEqual(['new', 'orig']);
    expect(client.getQueryData<{ id: string; repostCount: number; isReposted: boolean }[]>(postKeys.feed)?.[1]).toMatchObject({ repostCount: 1, isReposted: true });
    expect(useToastStore.getState().current?.message).toBe('Reposted');
  });

  it('reposts the original when the post is itself a repost — never a chain', async () => {
    const repost = makePost({ id: 'rp', type: 'repost', repostId: 'orig', repostedPost: original, caption: 'Look' });
    mockParams = { postId: 'rp' };
    api.get.mockResolvedValue(repost);
    api.repost.mockResolvedValue(makePost({ id: 'new', type: 'repost', repostId: 'orig', repostedPost: original }));
    await renderSheet(<RepostSheet />);
    await screen.findByText('The original'); // the preview is the original, not the repost's quote
    await fireEvent.press(screen.getByRole('button', { name: 'Repost now' }));
    await waitFor(() => expect(api.repost).toHaveBeenCalledWith('orig', ''));
  });

  it('cannot repost when the original was deleted', async () => {
    mockParams = { postId: 'rp' };
    api.get.mockResolvedValue(makePost({ id: 'rp', type: 'repost', repostId: 'gone', repostedPost: null }));
    await renderSheet(<RepostSheet />);
    expect(await screen.findByText('This post is no longer available.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Repost now' })).toBeDisabled();
  });

  it('stays open and says why when the repost fails', async () => {
    mockParams = { postId: 'orig' };
    api.get.mockResolvedValue(original);
    api.repost.mockRejectedValue(new AppError({ kind: 'server', message: 'Something went wrong on our side. Please try again.', status: 500 }));
    await renderSheet(<RepostSheet />);
    await screen.findByText('The original');
    await fireEvent.press(screen.getByRole('button', { name: 'Repost now' }));
    await waitFor(() => expect(useToastStore.getState().current?.message).toMatch(/went wrong/));
    expect(mockBack).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Repost now' })).toBeEnabled();
  });

  it("shows the original as a preview only: tapping it doesn't leave the sheet", async () => {
    mockParams = { postId: 'orig' };
    api.get.mockResolvedValue(original);
    await renderSheet(<RepostSheet />);
    await screen.findByText('The original');
    expect(screen.queryByRole('button', { name: /Original post by/ })).toBeNull();
  });
});
