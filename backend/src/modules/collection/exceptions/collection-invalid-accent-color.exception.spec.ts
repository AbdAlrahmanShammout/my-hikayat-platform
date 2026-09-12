import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { CollectionInvalidAccentColorException } from './collection-invalid-accent-color.exception';

describe('CollectionInvalidAccentColorException', () => {
  it('reports an invalid accent color', () => {
    const actualException = new CollectionInvalidAccentColorException();
    expect(actualException.kind).toBe(ErrorKind.INVALID_STATE);
    expect(actualException.code).toBe('COLLECTION_INVALID_ACCENT_COLOR');
  });
});
