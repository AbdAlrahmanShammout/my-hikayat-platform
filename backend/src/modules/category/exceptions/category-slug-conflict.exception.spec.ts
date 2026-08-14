import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { CategorySlugConflictException } from './category-slug-conflict.exception';

describe('CategorySlugConflictException', () => {
  it('reports a slug conflict', () => {
    const actualException = new CategorySlugConflictException('picture-books');
    expect(actualException.kind).toBe(ErrorKind.CONFLICT);
    expect(actualException.code).toBe('CATEGORY_SLUG_CONFLICT');
  });
});
