import { resolveReaderEngine } from './resolve-reader-engine';

describe('resolveReaderEngine', () => {
  it('selects engines from layoutType only', () => {
    expect(resolveReaderEngine('reflowable')).toBe('reflowable');
    expect(resolveReaderEngine('fixed_layout')).toBe('fixed_layout');
  });

  it('rejects missing or unknown layout types', () => {
    expect(resolveReaderEngine(null)).toBeNull();
    expect(resolveReaderEngine(undefined)).toBeNull();
    expect(resolveReaderEngine('picture_book')).toBeNull();
  });
});
