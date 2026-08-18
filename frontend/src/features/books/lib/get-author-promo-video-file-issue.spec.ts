import { describe, expect, it } from 'vitest';

import { getAuthorPromoVideoFileIssue } from '@/features/books/lib/get-author-promo-video-file-issue';

describe('getAuthorPromoVideoFileIssue', () => {
  it('accepts a non-empty MP4 or WebM name', () => {
    const actualMp4Issue = getAuthorPromoVideoFileIssue({ name: 'promo.MP4', size: 12 });
    const actualWebmIssue = getAuthorPromoVideoFileIssue({ name: 'promo.webm', size: 12 });
    expect(actualMp4Issue).toBeUndefined();
    expect(actualWebmIssue).toBeUndefined();
  });

  it('rejects an empty file', () => {
    const actualIssue = getAuthorPromoVideoFileIssue({ name: 'promo.mp4', size: 0 });
    expect(actualIssue).toBe('Promo video must not be empty');
  });

  it('rejects a file that is larger than the API maximum', () => {
    const actualIssue = getAuthorPromoVideoFileIssue({
      name: 'promo.mp4',
      size: 104_857_601,
    });
    expect(actualIssue).toBe('Promo video exceeds the maximum allowed size');
  });

  it('rejects a file that is not an MP4 or WebM', () => {
    const actualIssue = getAuthorPromoVideoFileIssue({ name: 'promo.mov', size: 12 });
    expect(actualIssue).toBe('Promo video must be an MP4 or WebM file');
  });
});
