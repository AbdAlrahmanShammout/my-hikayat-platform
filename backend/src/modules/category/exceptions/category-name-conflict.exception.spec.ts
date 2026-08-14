import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { CategoryNameConflictException } from './category-name-conflict.exception';

describe('CategoryNameConflictException', () => {
  it('reports a named conflict', () => {
    const actualException = new CategoryNameConflictException('Picture Books');
    expect(actualException.kind).toBe(ErrorKind.CONFLICT);
    expect(actualException.code).toBe('CATEGORY_NAME_CONFLICT');
  });
});
