import { Injectable } from '@nestjs/common';

import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookPage } from '@/modules/book/defs/book-repository.defs';
import {
  CreateBookServiceInput,
  ListBooksServiceInput,
  ListCatalogBooksServiceInput,
  UpdateBookServiceInput,
} from '@/modules/book/defs/book-service.defs';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { CatalogSort } from '@/modules/book/enum/catalog-sort.enum';
import { BookProcessingStatus, BookPublishingStatus } from '@/modules/book/enum/general.enum';
import { BookOwnerNotPublisherException } from '@/modules/book/exceptions/book-owner-not-publisher.exception';
import { BookRepository } from '@/modules/book/repository/book.repository';
import { CategoryService } from '@/modules/category/category.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class BookService {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly categoryService: CategoryService,
    private readonly userService: UserService,
  ) {}

  async createBook(input: CreateBookServiceInput): Promise<BookEntity> {
    const title: string = BookService.normalizeTitle(input.title);
    const description: string = BookService.normalizeDescription(input.description);
    BookService.assertValidTitle(title);
    const owner: UserEntity = await this.assertOwnerCanOwnBook(input.ownerId);
    const categoryIds: number[] = BookService.uniqueIds(input.categoryIds ?? []);
    await this.assertCategoriesExist(categoryIds);
    return this.bookRepository.create({
      title,
      description,
      layoutType: input.layoutType ?? null,
      bookType: input.bookType,
      publishingStatus: BookPublishingStatus.PENDING,
      processingStatus: BookProcessingStatus.NOT_STARTED,
      ownerId: owner.id,
      categoryIds,
    });
  }

  async updateBook(input: UpdateBookServiceInput): Promise<BookEntity> {
    await this.getBookById(input.id);
    const title: string | undefined =
      input.title !== undefined ? BookService.normalizeTitle(input.title) : undefined;
    const description: string | undefined =
      input.description !== undefined
        ? BookService.normalizeDescription(input.description)
        : undefined;
    if (title !== undefined) {
      BookService.assertValidTitle(title);
    }
    const categoryIds: number[] | undefined =
      input.categoryIds !== undefined ? BookService.uniqueIds(input.categoryIds) : undefined;
    if (categoryIds !== undefined) {
      await this.assertCategoriesExist(categoryIds);
    }
    return this.bookRepository.update({
      id: input.id,
      title,
      description,
      layoutType: input.layoutType,
      bookType: input.bookType,
      publishingStatus: input.publishingStatus,
      publishedAt: input.publishedAt,
      categoryIds,
    });
  }

  async listBooks(input: ListBooksServiceInput = {}): Promise<BookPage> {
    return this.bookRepository.list({
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
      publishingStatus: input.publishingStatus,
      ownerId: input.ownerId,
      processingStatus: input.processingStatus,
    });
  }

  async listCatalogBooks(input: ListCatalogBooksServiceInput = {}): Promise<BookPage> {
    if (input.categoryId !== undefined) {
      await this.categoryService.getCategoryById(input.categoryId);
    }
    return this.bookRepository.listCatalog({
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
      categoryId: input.categoryId,
      title: BookService.normalizeOptionalSearchText(input.title),
      author: BookService.normalizeOptionalSearchText(input.author),
      publisher: BookService.normalizeOptionalSearchText(input.publisher),
      sort: input.sort ?? CatalogSort.NEWEST,
    });
  }

  async findBookById(id: number): Promise<BookEntity | null> {
    return this.bookRepository.findById(id);
  }

  async getBookById(id: number): Promise<BookEntity> {
    const book: BookEntity | null = await this.findBookById(id);
    if (book === null) {
      throw new ResourceNotFoundException('Book', id);
    }
    return book;
  }

  async getCatalogBookById(id: number): Promise<BookEntity> {
    const book: BookEntity = await this.getBookById(id);
    if (!BookService.isCatalogVisible(book)) {
      throw new ResourceNotFoundException('Book', id);
    }
    return book;
  }

  private async assertOwnerCanOwnBook(ownerId: number): Promise<UserEntity> {
    const owner: UserEntity = await this.userService.getUserById(ownerId);
    if (!owner.isPublisher) {
      throw new BookOwnerNotPublisherException(owner.id);
    }
    return owner;
  }

  private async assertCategoriesExist(categoryIds: readonly number[]): Promise<void> {
    await Promise.all(
      categoryIds.map((categoryId) => this.categoryService.getCategoryById(categoryId)),
    );
  }

  private static uniqueIds(ids: readonly number[]): number[] {
    return [...new Set(ids)];
  }

  private static normalizeTitle(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  private static normalizeDescription(value: string): string {
    return value.trim();
  }

  private static assertValidTitle(title: string): void {
    if (title.length === 0) {
      throw new InvalidStateException({
        message: 'Book title must not be empty',
        code: 'BOOK_INVALID_TITLE',
      });
    }
  }

  private static normalizeOptionalSearchText(value: string | undefined): string | undefined {
    if (value === undefined) {
      return undefined;
    }
    const normalized: string = value.trim().replace(/\s+/g, ' ');
    if (normalized.length === 0) {
      return undefined;
    }
    return normalized;
  }

  private static isCatalogVisible(book: BookEntity): boolean {
    return (
      book.publishingStatus === BookPublishingStatus.APPROVED &&
      book.processingStatus === BookProcessingStatus.READY &&
      book.publishedAt !== null
    );
  }
}
