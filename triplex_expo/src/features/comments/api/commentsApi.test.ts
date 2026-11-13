import { wireComment } from '../model/fixtures';
import { CommentsApi } from './commentsApi';

const mockRequest = jest.fn();
jest.mock('../../../core/api/client', () => ({ apiClient: { request: (config: unknown) => mockRequest(config) } }));
jest.mock('../../../core/logger', () => ({ logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));

beforeEach(() => mockRequest.mockReset());

describe('CommentsApi', () => {
  it('lists a post’s comments and a comment’s replies', async () => {
    mockRequest.mockResolvedValue({ status: 200, data: { status: 'success', data: [wireComment()] } });
    expect((await CommentsApi.list('p1'))[0]).toMatchObject({ id: 'w1', replyCount: 3 });
    expect(mockRequest).toHaveBeenLastCalledWith({ method: 'get', url: 'comments/p1/comments' });
    await CommentsApi.replies('w1');
    expect(mockRequest).toHaveBeenLastCalledWith({ method: 'get', url: 'comments/w1/replies' });
  });

  it('adds a comment (no parent) and a reply (to the top-level comment), with trimmed text', async () => {
    mockRequest.mockResolvedValue({ status: 201, data: { status: 'success', data: wireComment({ id: 'new' }) } });
    await CommentsApi.add('p1', '  hello  ');
    expect(mockRequest).toHaveBeenLastCalledWith({ method: 'post', url: 'comments/p1/comments', data: { content: 'hello', parentCommentId: null } });
    await CommentsApi.reply('top', ' yes ');
    expect(mockRequest).toHaveBeenLastCalledWith({ method: 'post', url: 'comments/top/replies', data: { content: 'yes' } });
  });

  it('reacts with POST and removes with DELETE, both carrying the type; the answer’s counts are summed', async () => {
    mockRequest.mockResolvedValue({ status: 200, data: { reactions: [{ type: 'love', count: '3' }], my_reaction: 'love', my_reactions: ['love'] } });
    expect(await CommentsApi.react('c1', 'love')).toEqual({ reactionCount: 3, myReaction: 'love' });
    expect(mockRequest).toHaveBeenLastCalledWith({ method: 'post', url: 'comments/c1/like', data: { type: 'love' } });
    mockRequest.mockResolvedValue({ status: 200, data: { reactions: [], my_reactions: [] } });
    expect(await CommentsApi.unreact('c1', 'love')).toEqual({ reactionCount: 0, myReaction: null });
    expect(mockRequest).toHaveBeenLastCalledWith({ method: 'delete', url: 'comments/c1/like', data: { type: 'love' } });
  });

  it('deletes through the backend’s real route, comments/comment/:id', async () => {
    mockRequest.mockResolvedValue({ status: 200, data: { status: 'success', message: 'comment/deleted_successfully' } });
    await CommentsApi.remove('c1');
    expect(mockRequest).toHaveBeenLastCalledWith({ method: 'delete', url: 'comments/comment/c1' });
  });

  it('a list in the wrong shape is an invalid_response', async () => {
    mockRequest.mockResolvedValue({ status: 200, data: { status: 'success', data: [{ id: 'x' }] } });
    await expect(CommentsApi.list('p1')).rejects.toMatchObject({ kind: 'invalid_response' });
  });
});
