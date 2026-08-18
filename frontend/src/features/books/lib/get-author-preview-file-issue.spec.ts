import { describe, expect, it } from 'vitest';

import { getAuthorPreviewFileIssue } from '@/features/books/lib/get-author-preview-file-issue';

describe('getAuthorPreviewFileIssue', () => {
  it('accepts a non-empty JPEG, PNG, or WebP name', () => {
    const actualJpegIssue = getAuthorPreviewFileIssue({ name: 'cover.JPEG', size: 12 });
    const actualPngIssue = getAuthorPreviewFileIssue({ name: 'cover.png', size: 12 });
    expect(actualJpegIssue).toBeUndefined();
    expect(actualPngIssue).toBeUndefined();
  });

  it('rejects an empty file', () => {
    const actualIssue = getAuthorPreviewFileIssue({ name: 'cover.png', size: 0 });
    expect(actualIssue).toBe('Preview image must not be empty');
  });

  it('rejects a file that is larger than the API maximum', () => {
    const actualIssue = getAuthorPreviewFileIssue({
      name: 'cover.png',
      size: 10_485_761,
    });
    expect(actualIssue).toBe('Preview image exceeds the maximum allowed size');
  });

  it('rejects a file that is not a JPEG, PNG, or WebP', () => {
    const actualIssue = getAuthorPreviewFileIssue({ name: 'cover.gif', size: 12 });
    expect(actualIssue).toBe('Preview image must be a JPEG, PNG, or WebP file');
  });
});
