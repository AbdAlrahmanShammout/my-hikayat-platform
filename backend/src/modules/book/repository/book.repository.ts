import { TransactionContext } from '@/common/base/transaction-context';
import {
  BookPage,
  CreateBookRepoInput,
  ListBooksRepoInput,
  ListCatalogBooksByIdsRepoInput,
  ListCatalogBooksRepoInput,
  UpdateBookRepoInput,
} from '@/modules/book/defs/book-repository.defs';
import { BookEntity } from '@/modules/book/entity/book.entity';

export abstract class BookRepository {
  abstract create(input: CreateBookRepoInput, context?: TransactionContext): Promise<BookEntity>;
  abstract update(input: UpdateBookRepoInput, context?: TransactionContext): Promise<BookEntity>;
  abstract delete(id: number, context?: TransactionContext): Promise<BookEntity>;
  abstract findById(id: number): Promise<BookEntity | null>;
  abstract list(input: ListBooksRepoInput): Promise<BookPage>;
  abstract listCatalog(input: ListCatalogBooksRepoInput): Promise<BookPage>;
  abstract listCatalogByIds(input: ListCatalogBooksByIdsRepoInput): Promise<BookEntity[]>;
}
