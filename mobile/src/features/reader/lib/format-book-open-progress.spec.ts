import { formatBookOpenProgress } from '@/features/reader/lib/format-book-open-progress';

const ONE_MEBIBYTE = 1024 * 1024;

describe('formatBookOpenProgress', () => {
  it('shows percent and bytes left when the file size is known', () => {
    const actual = formatBookOpenProgress({
      phase: 'downloading',
      loadedBytes: ONE_MEBIBYTE,
      totalBytes: ONE_MEBIBYTE * 4,
    });
    expect(actual.fraction).toBe(0.25);
    expect(actual.label).toBe('Downloading book · 25% · 3.0 MB left');
  });

  it('does not invent a percent when the total size is unknown', () => {
    const actual = formatBookOpenProgress({
      phase: 'downloading',
      loadedBytes: 2048,
      totalBytes: null,
    });
    expect(actual.fraction).toBeNull();
    expect(actual.label).toBe('Downloading book · 2 KB');
  });

  it('holds a full bar while the downloaded file is prepared', () => {
    const actual = formatBookOpenProgress({ phase: 'preparing' });
    expect(actual.fraction).toBe(1);
    expect(actual.label).toBe('Preparing the book…');
  });
});
