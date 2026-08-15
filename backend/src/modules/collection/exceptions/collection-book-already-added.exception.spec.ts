import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { CollectionBookAlreadyAddedException } from './collection-book-already-added.exception';

describe('CollectionBookAlreadyAddedException', () => {
  it('reports a named conflict', () => {
    const actualException = new CollectionBookAlreadyAddedException(3, 8);
    expect(actualException.kind).toBe(ErrorKind.CONFLICT);
    expect(actualException.code).toBe('COLLECTION_BOOK_ALREADY_ADDED');
  });
});
