import { TransactionContext } from '@/common/base/transaction-context';
import {
  CollectionPage,
  CreateCollectionRepoInput,
  ListCollectionsRepoInput,
  UpdateCollectionRepoInput,
} from '@/modules/collection/defs/collection-repository.defs';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';

export abstract class CollectionRepository {
  abstract create(
    input: CreateCollectionRepoInput,
    context?: TransactionContext,
  ): Promise<CollectionEntity>;
  abstract update(
    input: UpdateCollectionRepoInput,
    context?: TransactionContext,
  ): Promise<CollectionEntity>;
  abstract delete(id: number, context?: TransactionContext): Promise<CollectionEntity>;
  abstract findById(id: number): Promise<CollectionEntity | null>;
  abstract list(input: ListCollectionsRepoInput): Promise<CollectionPage>;
}
