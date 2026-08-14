import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from './pagination.constant';

describe('pagination constants', () => {
  it('defaults list pages to twenty rows from offset zero', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(20);
    expect(DEFAULT_PAGE_OFFSET).toBe(0);
  });
});
