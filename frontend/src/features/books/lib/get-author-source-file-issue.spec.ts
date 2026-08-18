import { describe, expect, it } from 'vitest';

import { getAuthorSourceFileIssue } from '@/features/books/lib/get-author-source-file-issue';

describe('getAuthorSourceFileIssue', () => {
  it('accepts a non-empty PDF or EPUB name', () => {
    const actualPdfIssue = getAuthorSourceFileIssue({ name: 'book.PDF', size: 12 });
    const actualEpubIssue = getAuthorSourceFileIssue({ name: 'book.epub', size: 12 });
    expect(actualPdfIssue).toBeUndefined();
    expect(actualEpubIssue).toBeUndefined();
  });

  it('rejects an empty file', () => {
    const actualIssue = getAuthorSourceFileIssue({ name: 'book.pdf', size: 0 });
    expect(actualIssue).toBe('Source file must not be empty');
  });

  it('rejects a file that is larger than the API maximum', () => {
    const actualIssue = getAuthorSourceFileIssue({
      name: 'book.pdf',
      size: 104_857_601,
    });
    expect(actualIssue).toBe('Source file exceeds the maximum allowed size');
  });

  it('rejects a file that is not an EPUB or PDF', () => {
    const actualIssue = getAuthorSourceFileIssue({ name: 'book.docx', size: 12 });
    expect(actualIssue).toBe('Source file must be an EPUB or PDF');
  });
});
