import { TransactionContext } from '@/common/base/transaction-context';
import {
  CreateBookSourceMetadataRepoInput,
  UpdateBookSourceMetadataRepoInput,
} from '@/modules/book-processing/defs/book-source-metadata-repository.defs';
import { BookSourceMetadataEntity } from '@/modules/book-processing/entity/book-source-metadata.entity';

export abstract class BookSourceMetadataRepository {
  abstract create(
    input: CreateBookSourceMetadataRepoInput,
    context?: TransactionContext,
  ): Promise<BookSourceMetadataEntity>;
  abstract update(
    input: UpdateBookSourceMetadataRepoInput,
    context?: TransactionContext,
  ): Promise<BookSourceMetadataEntity>;
  abstract findByBookId(bookId: number): Promise<BookSourceMetadataEntity | null>;
}
