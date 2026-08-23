import { parseBookIdParam } from './parse-book-id-param';

describe('parseBookIdParam', () => {
  it('parses a positive integer string', () => {
    expect(parseBookIdParam('42')).toBe(42);
  });

  it('rejects missing, zero, and non-numeric values', () => {
    expect(parseBookIdParam(undefined)).toBeNull();
    expect(parseBookIdParam('0')).toBeNull();
    expect(parseBookIdParam('abc')).toBeNull();
    expect(parseBookIdParam(['-1'])).toBeNull();
  });
});
