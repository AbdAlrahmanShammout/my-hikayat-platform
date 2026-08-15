import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';

export class CollectionBookAlreadyAddedException extends ResourceConflictException {
  constructor(collectionId: number, bookId: number) {
    super({
      message: `Book ${bookId} is already in collection ${collectionId}`,
      code: 'COLLECTION_BOOK_ALREADY_ADDED',
    });
  }
}
