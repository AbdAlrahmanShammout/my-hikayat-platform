import { Injectable } from '@nestjs/common';

import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { CollectionPage } from '@/modules/collection/defs/collection-repository.defs';
import {
  AddCollectionBookServiceInput,
  CreateCollectionServiceInput,
  ListCollectionsServiceInput,
  RemoveCollectionBookServiceInput,
  ReorderCollectionBooksServiceInput,
  UpdateCollectionServiceInput,
} from '@/modules/collection/defs/collection-service.defs';
import { CollectionBookEntity } from '@/modules/collection/entity/collection-book.entity';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';
import { CollectionBookAlreadyAddedException } from '@/modules/collection/exceptions/collection-book-already-added.exception';
import { CollectionRepository } from '@/modules/collection/repository/collection.repository';

@Injectable()
export class CollectionService {
  constructor(
    private readonly collectionRepository: CollectionRepository,
    private readonly bookService: BookService,
  ) {}

  async createCollection(input: CreateCollectionServiceInput): Promise<CollectionEntity> {
    const title: string = CollectionService.normalizeTitle(input.title);
    CollectionService.assertValidTitle(title);
    const bookIds: number[] = CollectionService.uniqueIds(input.bookIds ?? []);
    await this.assertBooksExist(bookIds);
    return this.collectionRepository.create({
      title,
      books: CollectionService.toBooks(bookIds),
    });
  }

  async updateCollection(input: UpdateCollectionServiceInput): Promise<CollectionEntity> {
    const current: CollectionEntity = await this.getCollectionById(input.id);
    if (input.title === undefined) {
      return current;
    }
    const title: string = CollectionService.normalizeTitle(input.title);
    CollectionService.assertValidTitle(title);
    return this.collectionRepository.update({ id: current.id, title });
  }

  async deleteCollection(id: number): Promise<CollectionEntity> {
    await this.getCollectionById(id);
    return this.collectionRepository.delete(id);
  }

  async addCollectionBook(input: AddCollectionBookServiceInput): Promise<CollectionEntity> {
    const collection: CollectionEntity = await this.getCollectionById(input.collectionId);
    await this.bookService.getBookById(input.bookId);
    const bookIds: number[] = CollectionService.readBookIds(collection);
    if (bookIds.includes(input.bookId)) {
      throw new CollectionBookAlreadyAddedException(collection.id, input.bookId);
    }
    return this.collectionRepository.update({
      id: collection.id,
      books: CollectionService.toBooks([...bookIds, input.bookId]),
    });
  }

  async removeCollectionBook(input: RemoveCollectionBookServiceInput): Promise<CollectionEntity> {
    const collection: CollectionEntity = await this.getCollectionById(input.collectionId);
    const bookIds: number[] = CollectionService.readBookIds(collection);
    if (!bookIds.includes(input.bookId)) {
      throw new ResourceNotFoundException('Collection book', input.bookId);
    }
    return this.collectionRepository.update({
      id: collection.id,
      books: CollectionService.toBooks(bookIds.filter((bookId) => bookId !== input.bookId)),
    });
  }

  async reorderCollectionBooks(
    input: ReorderCollectionBooksServiceInput,
  ): Promise<CollectionEntity> {
    const collection: CollectionEntity = await this.getCollectionById(input.collectionId);
    const bookIds: number[] = CollectionService.uniqueIds(input.bookIds);
    CollectionService.assertSameBookSet(CollectionService.readBookIds(collection), bookIds);
    return this.collectionRepository.update({
      id: collection.id,
      books: CollectionService.toBooks(bookIds),
    });
  }

  async listCollections(input: ListCollectionsServiceInput = {}): Promise<CollectionPage> {
    return this.collectionRepository.list({
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
    });
  }

  async findCollectionById(id: number): Promise<CollectionEntity | null> {
    return this.collectionRepository.findById(id);
  }

  async getCollectionById(id: number): Promise<CollectionEntity> {
    const collection: CollectionEntity | null = await this.findCollectionById(id);
    if (collection === null) {
      throw new ResourceNotFoundException('Collection', id);
    }
    return collection;
  }

  private async assertBooksExist(bookIds: readonly number[]): Promise<void> {
    await Promise.all(bookIds.map((bookId) => this.bookService.getBookById(bookId)));
  }

  private static readBookIds(collection: CollectionEntity): number[] {
    const items: CollectionBookEntity[] = collection.items ?? [];
    return items.map((item) => item.bookId);
  }

  private static toBooks(bookIds: readonly number[]): { bookId: number; displayOrder: number }[] {
    return bookIds.map((bookId, displayOrder) => ({ bookId, displayOrder }));
  }

  private static uniqueIds(ids: readonly number[]): number[] {
    return [...new Set(ids)];
  }

  private static normalizeTitle(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  private static assertValidTitle(title: string): void {
    if (title.length === 0) {
      throw new InvalidStateException({
        message: 'Collection title must not be empty',
        code: 'COLLECTION_INVALID_TITLE',
      });
    }
  }

  private static assertSameBookSet(
    currentBookIds: readonly number[],
    nextBookIds: readonly number[],
  ): void {
    if (currentBookIds.length !== nextBookIds.length) {
      throw new InvalidStateException({
        message: 'Collection reorder must include every current book exactly once',
        code: 'COLLECTION_BOOKS_MISMATCH',
      });
    }
    const currentSet: Set<number> = new Set(currentBookIds);
    const hasSameBooks: boolean = nextBookIds.every((bookId) => currentSet.has(bookId));
    if (!hasSameBooks) {
      throw new InvalidStateException({
        message: 'Collection reorder must include every current book exactly once',
        code: 'COLLECTION_BOOKS_MISMATCH',
      });
    }
  }
}
