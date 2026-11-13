import { parseViewerParams, viewerHref } from './imageViewerParams';

const a = 'https://a/1.jpg';
const b = 'https://a/2.jpg';

describe('parseViewerParams', () => {
  it('reads a JSON list and the start index', () => {
    expect(parseViewerParams({ urls: JSON.stringify([a, b]), index: '1' })).toEqual({ urls: [a, b], index: 1 });
  });

  it('keeps URLs that contain commas intact (Cloudinary transformations)', () => {
    const url = 'https://res.cloudinary.com/x/image/upload/c_fill,g_face,h_500,w_500/v1/pic.jpg';
    expect(parseViewerParams({ urls: JSON.stringify([url, b]) }).urls).toEqual([url, b]);
  });

  it('accepts a single bare URL (a hand-written link)', () => {
    expect(parseViewerParams({ urls: a })).toEqual({ urls: [a], index: 0 });
  });

  it('drops anything that is not an http(s) url (a deep link must not load file:// or javascript:)', () => {
    expect(parseViewerParams({ urls: JSON.stringify(['file:///etc/passwd', 'javascript:alert(1)', a, 42]) }).urls).toEqual([a]);
    expect(parseViewerParams({ urls: 'file:///etc/passwd' }).urls).toEqual([]);
  });

  it('keeps the index inside the list', () => {
    expect(parseViewerParams({ urls: JSON.stringify([a]), index: '9' }).index).toBe(0);
    expect(parseViewerParams({ urls: JSON.stringify([a, b]), index: '-3' }).index).toBe(0);
    expect(parseViewerParams({ urls: JSON.stringify([a]), index: 'abc' }).index).toBe(0);
  });

  it('gives an empty list when there are no photos or the param is garbage', () => {
    expect(parseViewerParams({})).toEqual({ urls: [], index: 0 });
    expect(parseViewerParams({ urls: '{"not":"a list"}' }).urls).toEqual([]);
  });
});

describe('viewerHref', () => {
  it('round-trips through parseViewerParams', () => {
    const { params } = viewerHref([a, b], 1);
    expect(parseViewerParams(params)).toEqual({ urls: [a, b], index: 1 });
  });
});
