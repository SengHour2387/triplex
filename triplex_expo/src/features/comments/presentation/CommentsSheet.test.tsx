import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppError } from '../../../core/errors/appError';
import { resetNotifyDedupe } from '../../../core/notify';
import { createQueryClient } from '../../../core/query/queryClient';
import { confirm, useToastStore } from '../../../design-system';
import { useAuthStore } from '../../auth/store/authStore';
import { makePost } from '../../posts/model/fixtures';
import { findPost, postKeys } from '../../posts/model/postCache';
import { CommentsApi } from '../api/commentsApi';
import { makeComment } from '../model/fixtures';
import { CommentsSheet } from './CommentsSheet';

jest.mock('../api/commentsApi');
jest.mock('../../../core/storage/secureStorage', () => ({ secureStorage: { getAccessToken: jest.fn() } }));
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: mockBack }),
  useLocalSearchParams: () => ({ postId: 'p1' }),
}));
jest.mock('../../../design-system/adaptive/dialogs', () => ({ ...jest.requireActual('../../../design-system/adaptive/dialogs'), confirm: jest.fn() }));

const api = jest.mocked(CommentsApi);
const confirmMock = jest.mocked(confirm);
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

/** The app's own query client (so a failed mutation toasts like it does for real), with no retries and no idle timers. */
function testClient(): QueryClient {
  const client = createQueryClient();
  client.setDefaultOptions({ ...client.getDefaultOptions(), queries: { ...client.getDefaultOptions().queries, retry: false, gcTime: Infinity } });
  return client;
}

async function renderSheet(client = testClient()) {
  client.setQueryData(postKeys.feed, [makePost({ id: 'p1', commentCount: 2 })]);
  const ui: ReactElement = (
    <SafeAreaProvider initialMetrics={metrics}>
      <QueryClientProvider client={client}>
        <CommentsSheet />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
  await render(ui);
  return client;
}

const mine = { id: 'me', username: 'me', name: null, avatarUrl: null };
const dara = makeComment({ id: 'a', content: 'First!', replyCount: 2 });
const mineTop = makeComment({ id: 'b', content: 'My own comment', author: mine, reactionCount: 1, myReaction: 'like' });

/** A promise the test settles by hand, like a slow server. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  jest.clearAllMocks();
  Object.values(api).forEach((fn) => fn.mockReset());
  resetNotifyDedupe();
  onlineManager.setOnline(true);
  useToastStore.setState({ current: null });
  useAuthStore.setState({ user: { id: 'me', username: 'me', email: 'me@x.co', name: null, avatar_url: null }, status: 'authenticated', isLoading: false, error: null });
});

// TanStack Query notifies on timers; flush them inside act() so nothing lands after a test.
afterEach(async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
});

const typeComment = async (text: string) => fireEvent.changeText(screen.getByTestId('comment-input'), text);
const send = async () => fireEvent.press(screen.getByRole('button', { name: /^Send (comment|reply)$/ }));

describe('CommentsSheet — what it shows', () => {
  it('lists the comments oldest first, with Like and Reply on each', async () => {
    api.list.mockResolvedValue([dara, mineTop]);
    await renderSheet();
    expect(await screen.findByText('First!')).toBeTruthy();
    expect(screen.getByText('My own comment')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Reply to dara' })).toHaveLength(1);
    expect(api.list).toHaveBeenCalledWith('p1');
  });

  it('says so when there are no comments', async () => {
    api.list.mockResolvedValue([]);
    await renderSheet();
    expect(await screen.findByText('No comments yet')).toBeTruthy();
  });

  it('offers a retry when the first load fails — never an empty list pretending nothing is there', async () => {
    api.list.mockRejectedValueOnce(new AppError({ kind: 'server', message: 'Something went wrong on our side. Please try again.', status: 500 }));
    await renderSheet();
    expect(await screen.findByText("Couldn't load comments")).toBeTruthy();
    api.list.mockResolvedValueOnce([dara]);
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('First!')).toBeTruthy();
  });

  it('says it is offline when there is nothing to show', async () => {
    onlineManager.setOnline(false);
    api.list.mockResolvedValue([dara]);
    await renderSheet();
    expect(await screen.findByText("You're offline")).toBeTruthy();
  });

  it('loads replies only when the thread is opened, and hides them again', async () => {
    api.list.mockResolvedValue([dara]);
    api.replies.mockResolvedValue([makeComment({ id: 'r1', parentId: 'a', content: 'Agreed' }), makeComment({ id: 'r2', parentId: 'a', content: 'Me too' })]);
    await renderSheet();
    await screen.findByText('First!');
    expect(api.replies).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'View 2 replies' }));
    expect(await screen.findByText('Agreed')).toBeTruthy();
    expect(screen.getByText('Me too')).toBeTruthy();
    expect(api.replies).toHaveBeenCalledWith('a');
    await fireEvent.press(screen.getByRole('button', { name: 'Hide replies' }));
    expect(screen.queryByText('Agreed')).toBeNull();
  });

  it('shows a deleted comment as "This comment was deleted." with no author and no actions', async () => {
    api.list.mockResolvedValue([makeComment({ id: 'x', isDeleted: true, content: '', author: null })]);
    await renderSheet();
    expect(await screen.findByText('This comment was deleted.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Reply to/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Like' })).toBeNull();
  });
});

describe('writing a comment', () => {
  it('appears at once as "Sending…", counts on the post everywhere, then settles to the server copy', async () => {
    api.list.mockResolvedValue([dara]);
    const slow = deferred<ReturnType<typeof makeComment>>();
    api.add.mockReturnValue(slow.promise);
    const client = await renderSheet();
    await screen.findByText('First!');

    await typeComment('  Great trip  ');
    await send();
    expect(await screen.findByText('Great trip')).toBeTruthy();
    expect(screen.getByText('Sending…')).toBeTruthy();
    expect(screen.getByTestId('comment-input').props.value).toBe(''); // cleared at once
    expect(findPost(client, 'p1')?.commentCount).toBe(3); // 2 → 3, on every cached copy
    expect(api.add).toHaveBeenCalledWith('p1', 'Great trip');

    await act(async () => slow.resolve(makeComment({ id: 'real', content: 'Great trip', author: mine })));
    await waitFor(() => expect(screen.queryByText('Sending…')).toBeNull());
    expect(screen.getByText('Great trip')).toBeTruthy();
    expect(findPost(client, 'p1')?.commentCount).toBe(3);
  });

  it('if the server refuses, the comment and its count are taken back, the text returns to the box, and the reason is shown', async () => {
    api.list.mockResolvedValue([dara]);
    api.add.mockRejectedValue(new AppError({ kind: 'not_found', message: 'That post is no longer available.', code: 'post/not_found', status: 404 }));
    const client = await renderSheet();
    await screen.findByText('First!');

    await typeComment('Lost words');
    await send();
    await waitFor(() => expect(screen.getByTestId('comment-input').props.value).toBe('Lost words'));
    expect(screen.queryByText('Sending…')).toBeNull();
    expect(screen.queryByText('Lost words')).toBeNull(); // not in the list (it is back in the box, which is not text)
    expect(findPost(client, 'p1')?.commentCount).toBe(2);
    expect(useToastStore.getState().current?.message).toBe('That post is no longer available. Your text is still in the box.');
  });

  it('does not send an empty comment', async () => {
    api.list.mockResolvedValue([dara]);
    await renderSheet();
    await screen.findByText('First!');
    await typeComment('   ');
    expect(screen.getByRole('button', { name: 'Send comment' })).toBeDisabled();
    expect(api.add).not.toHaveBeenCalled();
  });

  it('Reply opens the thread, names who it is for, and posts to that comment; cancel goes back to a plain comment', async () => {
    api.list.mockResolvedValue([dara]);
    api.replies.mockResolvedValue([makeComment({ id: 'r1', parentId: 'a', content: 'Agreed' })]);
    api.reply.mockResolvedValue(makeComment({ id: 'r9', parentId: 'a', content: 'Thanks', author: mine }));
    const client = await renderSheet();
    await screen.findByText('First!');

    await fireEvent.press(screen.getByRole('button', { name: 'Reply to dara' }));
    expect(await screen.findByText('@dara')).toBeTruthy();
    expect(await screen.findByText('Agreed')).toBeTruthy(); // the thread opened
    expect(screen.getByTestId('comment-input').props.placeholder).toBe('Reply to @dara…');

    await typeComment('Thanks');
    await send();
    await waitFor(() => expect(api.reply).toHaveBeenCalledWith('a', 'Thanks'));
    expect(api.add).not.toHaveBeenCalled();
    expect(await screen.findByText('Thanks')).toBeTruthy();
    expect(screen.queryByText('@dara')).toBeNull(); // the reply banner cleared
    expect(findPost(client, 'p1')?.commentCount).toBe(2); // the server counts top-level comments only: a reply doesn't move it
  });

  it('a reply to a reply attaches to the top-level comment (one level deep)', async () => {
    api.list.mockResolvedValue([dara]);
    api.replies.mockResolvedValue([makeComment({ id: 'r1', parentId: 'a', content: 'Agreed', author: { id: 'u2', username: 'sophia', name: null, avatarUrl: null } })]);
    api.reply.mockResolvedValue(makeComment({ id: 'r9', parentId: 'a', content: 'Yes!', author: mine }));
    await renderSheet();
    await screen.findByText('First!');
    await fireEvent.press(screen.getByRole('button', { name: 'View 2 replies' }));
    await screen.findByText('Agreed');

    await fireEvent.press(screen.getByRole('button', { name: 'Reply to sophia' }));
    expect(await screen.findByText('@sophia')).toBeTruthy();
    await typeComment('Yes!');
    await send();
    await waitFor(() => expect(api.reply).toHaveBeenCalledWith('a', 'Yes!')); // 'a', not 'r1'
  });

  it('a reply to a comment whose replies have not loaded yet does not hide the older ones', async () => {
    api.list.mockResolvedValue([dara]);
    const older = deferred<ReturnType<typeof makeComment>[]>();
    api.replies.mockReturnValue(older.promise);
    api.reply.mockResolvedValue(makeComment({ id: 'r9', parentId: 'a', content: 'Mine', author: mine }));
    await renderSheet();
    await screen.findByText('First!');
    await fireEvent.press(screen.getByRole('button', { name: 'Reply to dara' }));
    await typeComment('Mine');
    await send();
    await act(async () => older.resolve([makeComment({ id: 'r1', parentId: 'a', content: 'Earlier reply' })]));
    expect(await screen.findByText('Earlier reply')).toBeTruthy();
    expect(await screen.findByText('Mine')).toBeTruthy();
  });
});

describe('deleting a comment', () => {
  it('asks first; the comment then reads "This comment was deleted." at once (the post count is unchanged: the server keeps counting it)', async () => {
    api.list.mockResolvedValue([mineTop]);
    const slow = deferred<void>();
    api.remove.mockReturnValue(slow.promise);
    confirmMock.mockResolvedValue(true);
    const client = await renderSheet();
    await screen.findByText('My own comment');

    await fireEvent.press(screen.getByRole('button', { name: 'Delete comment' }));
    expect(confirmMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Delete comment?', destructive: true }));
    expect(await screen.findByText('This comment was deleted.')).toBeTruthy();
    expect(screen.queryByText('My own comment')).toBeNull();
    expect(findPost(client, 'p1')?.commentCount).toBe(2);
    expect(api.remove).toHaveBeenCalledWith('b');
    await act(async () => slow.resolve());
    expect(screen.getByText('This comment was deleted.')).toBeTruthy();
  });

  it('cancelling the confirmation deletes nothing', async () => {
    api.list.mockResolvedValue([mineTop]);
    confirmMock.mockResolvedValue(false);
    await renderSheet();
    await screen.findByText('My own comment');
    await fireEvent.press(screen.getByRole('button', { name: 'Delete comment' }));
    await act(async () => undefined);
    expect(api.remove).not.toHaveBeenCalled();
    expect(screen.getByText('My own comment')).toBeTruthy();
  });

  it('if the server refuses, the comment comes back and the reason is shown', async () => {
    api.list.mockResolvedValue([mineTop]);
    api.remove.mockRejectedValue(new AppError({ kind: 'forbidden', message: "You can't delete someone else's comment.", code: 'comment/unauthorized', status: 403 }));
    confirmMock.mockResolvedValue(true);
    const client = await renderSheet();
    await screen.findByText('My own comment');
    await fireEvent.press(screen.getByRole('button', { name: 'Delete comment' }));
    await waitFor(() => expect(screen.getByText('My own comment')).toBeTruthy());
    expect(screen.queryByText('This comment was deleted.')).toBeNull();
    expect(findPost(client, 'p1')?.commentCount).toBe(2);
    expect(useToastStore.getState().current?.message).toBe("You can't delete someone else's comment. The comment is still there.");
  });

  it("only your own comments have a delete button", async () => {
    api.list.mockResolvedValue([dara, mineTop]);
    await renderSheet();
    await screen.findByText('First!');
    expect(screen.getAllByRole('button', { name: 'Delete comment' })).toHaveLength(1);
  });
});

describe('reacting to a comment', () => {
  it('a tap likes at once and the server’s count replaces the guess', async () => {
    api.list.mockResolvedValue([dara]);
    const slow = deferred<{ myReaction: 'like'; reactionCount: number }>();
    api.react.mockReturnValue(slow.promise);
    await renderSheet();
    await screen.findByText('First!');
    await fireEvent.press(screen.getByRole('button', { name: 'Like' }));
    expect(await screen.findByRole('button', { name: /^Your reaction: Like/ })).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(api.react).toHaveBeenCalledWith('a', 'like');
    await act(async () => slow.resolve({ myReaction: 'like', reactionCount: 4 }));
    expect(await screen.findByText('4')).toBeTruthy();
  });

  it('taking your reaction back sends DELETE with the reaction you had', async () => {
    api.list.mockResolvedValue([mineTop]);
    api.unreact.mockResolvedValue({ myReaction: null, reactionCount: 0 });
    await renderSheet();
    await screen.findByText('My own comment');
    await fireEvent.press(screen.getByRole('button', { name: /^Your reaction: Like/ }));
    await waitFor(() => expect(api.unreact).toHaveBeenCalledWith('b', 'like'));
    expect(await screen.findByRole('button', { name: 'Like' })).toBeTruthy();
  });

  it('if the server refuses, the reaction snaps back and the reason is shown', async () => {
    api.list.mockResolvedValue([dara]);
    api.react.mockRejectedValue(new AppError({ kind: 'not_found', message: 'That comment is no longer available.', code: 'comment/not_found', status: 404 }));
    await renderSheet();
    await screen.findByText('First!');
    await fireEvent.press(screen.getByRole('button', { name: 'Like' }));
    await waitFor(() => expect(useToastStore.getState().current?.message).toBe('That comment is no longer available. Your reaction was taken back.'));
    expect(screen.getByRole('button', { name: 'Like' })).toBeTruthy();
    expect(screen.queryByText('1')).toBeNull();
  });

  it('a comment still being saved cannot be liked, replied to or deleted', async () => {
    api.list.mockResolvedValue([dara]);
    api.add.mockReturnValue(new Promise(() => undefined));
    await renderSheet();
    await screen.findByText('First!');
    await typeComment('Saving');
    await send();
    await screen.findByText('Sending…');
    expect(screen.getAllByRole('button', { name: 'Like' })).toHaveLength(1); // only dara's
    expect(screen.getAllByRole('button', { name: /^Reply to/ })).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Delete comment' })).toBeNull();
  });
});

describe('the sheet', () => {
  it('closes from its close button', async () => {
    api.list.mockResolvedValue([]);
    await renderSheet();
    await fireEvent.press(await screen.findByRole('button', { name: 'Close' }));
    expect(mockBack).toHaveBeenCalled();
  });
});
