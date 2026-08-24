import { parseCollectionIdParam } from './parse-collection-id-param';

describe('parseCollectionIdParam', () => {
  it('parses a positive integer id', () => {
    expect(parseCollectionIdParam('12')).toBe(12);
  });

  it('rejects invalid ids', () => {
    expect(parseCollectionIdParam(undefined)).toBeNull();
    expect(parseCollectionIdParam('')).toBeNull();
    expect(parseCollectionIdParam('0')).toBeNull();
    expect(parseCollectionIdParam('-1')).toBeNull();
    expect(parseCollectionIdParam('abc')).toBeNull();
  });
});
