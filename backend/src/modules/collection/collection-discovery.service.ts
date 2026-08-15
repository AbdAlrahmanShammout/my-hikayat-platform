import { Injectable } from '@nestjs/common';

import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { CollectionService } from '@/modules/collection/collection.service';
import {
  CollectionDiscovery,
  CollectionDiscoveryPage,
} from '@/modules/collection/defs/collection-discovery.defs';
import { CollectionPage } from '@/modules/collection/defs/collection-repository.defs';
import { ListCollectionsServiceInput } from '@/modules/collection/defs/collection-service.defs';
import { CollectionBookEntity } from '@/modules/collection/entity/collection-book.entity';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';

@Injectable()
export class CollectionDiscoveryService {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly bookService: BookService,
  ) {}

  async listDiscoveryCollections(
    input: ListCollectionsServiceInput = {},
  ): Promise<CollectionDiscoveryPage> {
    const page: CollectionPage = await this.collectionService.listCollections(input);
    const booksById: Map<number, BookEntity> = await this.loadCatalogBooksById(page.entities);
    return {
      entities: page.entities.map((collection) =>
        CollectionDiscoveryService.toDiscovery(collection, booksById),
      ),
      total: page.total,
    };
  }

  async getDiscoveryCollectionById(id: number): Promise<CollectionDiscovery> {
    const collection: CollectionEntity = await this.collectionService.getCollectionById(id);
    const booksById: Map<number, BookEntity> = await this.loadCatalogBooksById([collection]);
    return CollectionDiscoveryService.toDiscovery(collection, booksById);
  }

  private async loadCatalogBooksById(
    collections: readonly CollectionEntity[],
  ): Promise<Map<number, BookEntity>> {
    const bookIds: number[] = CollectionDiscoveryService.uniqueBookIds(collections);
    const books: BookEntity[] = await this.bookService.listCatalogBooksByIds(bookIds);
    return new Map(books.map((book) => [book.id, book]));
  }

  private static toDiscovery(
    collection: CollectionEntity,
    booksById: Map<number, BookEntity>,
  ): CollectionDiscovery {
    const items: CollectionBookEntity[] = collection.items ?? [];
    const books: BookEntity[] = items
      .map((item) => booksById.get(item.bookId))
      .filter((book): book is BookEntity => book !== undefined);
    return { collection, books };
  }

  private static uniqueBookIds(collections: readonly CollectionEntity[]): number[] {
    return [
      ...new Set(
        collections.flatMap((collection) => (collection.items ?? []).map((item) => item.bookId)),
      ),
    ];
  }
}
