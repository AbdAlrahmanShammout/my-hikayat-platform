import { describe, expect, it } from 'vitest';

import { authorBookEditFormSchema } from '@/features/books/schemas/author-book-edit-form.schema';

describe('authorBookEditFormSchema', () => {
  it('accepts title, description, a known book type, and category ids', () => {
    const actualResult = authorBookEditFormSchema.safeParse({
      title: 'Harbor Lights',
      description: 'An updated reflowable chapter book.',
      bookType: 'illustrated_chapter',
      categoryIds: [4],
    });
    expect(actualResult.success).toBe(true);
  });

  it('rejects a blank title or description', () => {
    const actualResult = authorBookEditFormSchema.safeParse({
      title: '  ',
      description: '  ',
      bookType: 'picture_book',
      categoryIds: [],
    });
    expect(actualResult.success).toBe(false);
  });

  it('rejects an unknown book type', () => {
    const actualResult = authorBookEditFormSchema.safeParse({
      title: 'Harbor Lights',
      description: 'An updated reflowable chapter book.',
      bookType: 'audiobook',
      categoryIds: [],
    });
    expect(actualResult.success).toBe(false);
  });

  it('rejects a non-positive category id', () => {
    const actualResult = authorBookEditFormSchema.safeParse({
      title: 'Harbor Lights',
      description: 'An updated reflowable chapter book.',
      bookType: 'illustrated_chapter',
      categoryIds: [0],
    });
    expect(actualResult.success).toBe(false);
  });
});
