import { formatDownloadProgress } from '@/features/offline/lib/format-download-progress';

describe('formatDownloadProgress', () => {
  it('returns a percent when expected size is known', () => {
    const actual = formatDownloadProgress({
      totalBytesWritten: 250,
      totalBytesExpectedToWrite: 1000,
    });
    expect(actual).toBe('Downloading… 25%');
  });

  it('returns null when expected size is unknown', () => {
    const actual = formatDownloadProgress({
      totalBytesWritten: 10,
      totalBytesExpectedToWrite: 0,
    });
    expect(actual).toBeNull();
  });
});
