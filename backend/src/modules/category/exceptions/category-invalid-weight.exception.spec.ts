import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { CategoryInvalidWeightException } from './category-invalid-weight.exception';

describe('CategoryInvalidWeightException', () => {
  it('reports an invalid category weight', () => {
    const actualException = new CategoryInvalidWeightException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('CATEGORY_INVALID_WEIGHT');
  });
});
