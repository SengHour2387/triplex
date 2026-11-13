import { wirePost } from '../model/fixtures';
import { PostsApi } from './postsApi';

const mockRequest = jest.fn();
jest.mock('../../../core/api/client', () => ({ apiClient: { request: (config: unknown) => mockRequest(config) } }));
jest.mock('../../../core/logger', () => ({ logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));

beforeEach(() => mockRequest.mockReset());

describe('PostsApi', () => {
  it('GETs the feed and returns parsed posts', async () => {
    mockRequest.mockResolvedValue({ status: 200, data: { status: 'success', data: [wirePost()] } });
    const posts = await PostsApi.feed();
    expect(mockRequest).toHaveBeenCalledWith({ method: 'get', url: 'posts/feed' });
    expect(posts[0]).toMatchObject({ id: 'w1', reactionCount: 2, myReaction: 'love' });
  });

  it('GETs one post by id', async () => {
    mockRequest.mockResolvedValue({ status: 200, data: { status: 'success', data: wirePost({ id: 'abc' }) } });
    expect((await PostsApi.get('abc')).id).toBe('abc');
    expect(mockRequest).toHaveBeenCalledWith({ method: 'get', url: 'posts/abc' });
  });

  it('a feed in the wrong shape is an invalid_response, not a list of broken cards', async () => {
    mockRequest.mockResolvedValue({ status: 200, data: { status: 'success', data: [{ id: 'x' }] } });
    await expect(PostsApi.feed()).rejects.toMatchObject({ kind: 'invalid_response' });
  });

  it('reposts with a trimmed quote, or none', async () => {
    mockRequest.mockResolvedValue({ status: 201, data: { status: 'success', data: wirePost({ id: 'new' }) } });
    await PostsApi.repost('orig', '  nice  ');
    expect(mockRequest).toHaveBeenLastCalledWith({ method: 'post', url: 'posts/orig/repost', data: { caption: 'nice' } });
    await PostsApi.repost('orig', '   ');
    expect(mockRequest).toHaveBeenLastCalledWith({ method: 'post', url: 'posts/orig/repost', data: {} });
    await PostsApi.repost('orig');
    expect(mockRequest).toHaveBeenLastCalledWith({ method: 'post', url: 'posts/orig/repost', data: {} });
  });

  it('reacts with POST and removes with DELETE — both carrying the type in the body', async () => {
    mockRequest.mockResolvedValue({ status: 200, data: { status: 'success', likes_count: 43, is_liked: true, my_reaction: 'love', reactions: [], my_reactions: ['love'] } });
    expect(await PostsApi.react('p1', 'love')).toEqual({ reactionCount: 43, myReaction: 'love' });
    expect(mockRequest).toHaveBeenLastCalledWith({ method: 'post', url: 'likes/p1/like', data: { type: 'love' } });

    mockRequest.mockResolvedValue({ status: 200, data: { status: 'success', likes_count: 42, is_liked: false, my_reaction: null, reactions: [], my_reactions: [] } });
    expect(await PostsApi.unreact('p1', 'love')).toEqual({ reactionCount: 42, myReaction: null });
    expect(mockRequest).toHaveBeenLastCalledWith({ method: 'delete', url: 'likes/p1/like', data: { type: 'love' } });
  });

  it('GETs who reacted', async () => {
    mockRequest.mockResolvedValue({ status: 200, data: { status: 'success', total: 1, reactions: [{ type: 'like', count: '1' }], users: [{ type: 'like', user_id: 'u1', username: 'dara', name: null, avatar_url: null }] } });
    const result = await PostsApi.reactions('p1');
    expect(mockRequest).toHaveBeenCalledWith({ method: 'get', url: 'likes/p1/likes' });
    expect(result).toMatchObject({ total: 1, users: [{ username: 'dara' }] });
  });
});
