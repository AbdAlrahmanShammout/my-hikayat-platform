import { TransactionContext } from '@/common/base/transaction-context';
import {
  BookAssetPage,
  CreateBookAssetRepoInput,
  FindLatestBookAssetRepoInput,
  ListBookAssetsRepoInput,
  UpdateBookAssetRepoInput,
} from '@/modules/book-asset/defs/book-asset-repository.defs';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';

export abstract class BookAssetRepository {
  abstract create(
    input: CreateBookAssetRepoInput,
    context?: TransactionContext,
  ): Promise<BookAssetEntity>;
  abstract update(
    input: UpdateBookAssetRepoInput,
    context?: TransactionContext,
  ): Promise<BookAssetEntity>;
  abstract findById(id: number): Promise<BookAssetEntity | null>;
  abstract findLatestByBookIdAndKind(
    input: FindLatestBookAssetRepoInput,
  ): Promise<BookAssetEntity | null>;
  abstract list(input: ListBookAssetsRepoInput): Promise<BookAssetPage>;
}
