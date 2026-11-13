import { pageIndexFor } from './carousel';

describe('pageIndexFor', () => {
  it('rounds the offset to the nearest page', () => {
    expect(pageIndexFor(0, 230, 6)).toBe(0);
    expect(pageIndexFor(100, 230, 6)).toBe(0);
    expect(pageIndexFor(130, 230, 6)).toBe(1);
    expect(pageIndexFor(460, 230, 6)).toBe(2);
  });

  it('stays inside the list for a rubber-banded scroll', () => {
    expect(pageIndexFor(-40, 230, 6)).toBe(0);
    expect(pageIndexFor(9999, 230, 6)).toBe(5);
  });

  it('reports the last page when the list ends before the last tile reaches the start edge', () => {
    // 6 tiles, the content only scrolls to 1002 although the last snap point would be 1150.
    expect(pageIndexFor(1002, 230, 6, 1002)).toBe(5);
    // Two tiles: the whole range is 82pt — scrolled to its end, the second photo is the current one.
    expect(pageIndexFor(82, 230, 2, 82)).toBe(1);
    expect(pageIndexFor(0, 230, 2, 82)).toBe(0);
  });

  it('is safe with nothing to scroll', () => {
    expect(pageIndexFor(10, 0, 3)).toBe(0);
    expect(pageIndexFor(10, 230, 0)).toBe(0);
    expect(pageIndexFor(0, 230, 1, 0)).toBe(0);
  });
});
