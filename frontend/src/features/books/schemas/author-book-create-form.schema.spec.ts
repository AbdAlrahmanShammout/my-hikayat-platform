import { describe, expect, it } from 'vitest';

import { authorBookCreateFormSchema } from '@/features/books/schemas/author-book-create-form.schema';

describe('authorBookCreateFormSchema', () => {
  it('accepts title, description, a known book type, and category ids', () => {
    const actualResult = authorBookCreateFormSchema.safeParse({
      title: 'The Last Lighthouse',
      description: 'A reflowable chapter book.',
      bookType: 'standard_chapter',
      categoryIds: [2],
    });
    expect(actualResult.success).toBe(true);
  });

  it('rejects a blank title or description', () => {
    const actualResult = authorBookCreateFormSchema.safeParse({
      title: '  ',
      description: '  ',
      bookType: 'picture_book',
      categoryIds: [],
    });
    expect(actualResult.success).toBe(false);
  });

  it('rejects an unknown book type', () => {
    const actualResult = authorBookCreateFormSchema.safeParse({
      title: 'The Last Lighthouse',
      description: 'A reflowable chapter book.',
      bookType: 'audiobook',
      categoryIds: [],
    });
    expect(actualResult.success).toBe(false);
  });

  it('rejects a non-positive category id', () => {
    const actualResult = authorBookCreateFormSchema.safeParse({
      title: 'The Last Lighthouse',
      description: 'A reflowable chapter book.',
      bookType: 'standard_chapter',
      categoryIds: [0],
    });
    expect(actualResult.success).toBe(false);
  });
});
