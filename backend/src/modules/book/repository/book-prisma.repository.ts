import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  BookPage,
  CountCatalogVisibleBooksRepoInput,
  CreateBookRepoInput,
  ListBooksRepoInput,
  ListBooksByIdsRepoInput,
  ListCatalogBooksByIdsRepoInput,
  ListCatalogBooksRepoInput,
  UpdateBookRepoInput,
} from '@/modules/book/defs/book-repository.defs';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { AdminSortOrder } from '@/modules/book/enum/admin-book-sort-field.enum';
import { CatalogSort } from '@/modules/book/enum/catalog-sort.enum';
import { BookProcessingStatus, BookPublishingStatus } from '@/modules/book/enum/general.enum';
import { BookMapper } from '@/modules/book/mapper/book.mapper';
import { BookRepository } from '@/modules/book/repository/book.repository';
import { bookDetailsInclude } from '@/modules/book/types/book-details.include';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class BookPrismaRepository implements BookRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async create(input: CreateBookRepoInput, context?: TransactionContext): Promise<BookEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.book.create({
      data: {
        title: input.title,
        description: input.description,
        layoutType: input.layoutType,
        bookType: input.bookType,
        publishingStatus: input.publishingStatus,
        processingStatus: input.processingStatus,
        owner: { connect: { id: input.ownerId } },
        categories: BookPrismaRepository.buildCategoryConnect(input.categoryIds),
      },
      include: bookDetailsInclude,
    });
    return BookMapper.toEntity(result);
  }

  async update(input: UpdateBookRepoInput, context?: TransactionContext): Promise<BookEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const data: Prisma.BookUpdateInput = {};
    if (input.title !== undefined) {
      data.title = input.title;
    }
    if (input.description !== undefined) {
      data.description = input.description;
    }
    if (input.layoutType !== undefined) {
      data.layoutType = input.layoutType;
    }
    if (input.bookType !== undefined) {
      data.bookType = input.bookType;
    }
    if (input.publishingStatus !== undefined) {
      data.publishingStatus = input.publishingStatus;
    }
    if (input.processingStatus !== undefined) {
      data.processingStatus = input.processingStatus;
    }
    if (input.publishedAt !== undefined) {
      data.publishedAt = input.publishedAt;
    }
    if (input.categoryIds !== undefined) {
      data.categories = {
        set: input.categoryIds.map((id) => ({ id })),
      };
    }
    const result = await client.book.update({
      where: { id: input.id },
      data,
      include: bookDetailsInclude,
    });
    return BookMapper.toEntity(result);
  }

  async delete(id: number, context?: TransactionContext): Promise<BookEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.book.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: bookDetailsInclude,
    });
    return BookMapper.toEntity(result);
  }

  async findById(id: number): Promise<BookEntity | null> {
    const result = await this.prismaProviderService.book.findFirst({
      where: { id, deletedAt: null },
      include: bookDetailsInclude,
    });
    if (result === null) {
      return null;
    }
    return BookMapper.toEntity(result);
  }

  async list(input: ListBooksRepoInput): Promise<BookPage> {
    const where: Prisma.BookWhereInput = BookPrismaRepository.buildAdminBookWhere(input);
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.book.findMany({
        where,
        include: bookDetailsInclude,
        orderBy: BookPrismaRepository.buildAdminBookOrderBy(input),
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.book.count({ where }),
    ]);
    return {
      entities: rows.map((row) => BookMapper.toEntity(row)),
      total,
    };
  }

  async listCatalog(input: ListCatalogBooksRepoInput): Promise<BookPage> {
    const where: Prisma.BookWhereInput = BookPrismaRepository.buildCatalogWhere(input);
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.book.findMany({
        where,
        include: bookDetailsInclude,
        orderBy: BookPrismaRepository.buildCatalogOrderBy(input.sort),
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.book.count({ where }),
    ]);
    return {
      entities: rows.map((row) => BookMapper.toEntity(row)),
      total,
    };
  }

  async countCatalogVisible(input: CountCatalogVisibleBooksRepoInput): Promise<number> {
    const where: Prisma.BookWhereInput = {
      ...BookPrismaRepository.buildCatalogVisibilityWhere(),
    };
    if (input.ownerId !== undefined) {
      where.ownerId = input.ownerId;
    }
    return this.prismaProviderService.book.count({ where });
  }

  async listCatalogByIds(input: ListCatalogBooksByIdsRepoInput): Promise<BookEntity[]> {
    const rows = await this.prismaProviderService.book.findMany({
      where: {
        ...BookPrismaRepository.buildCatalogVisibilityWhere(),
        id: { in: [...input.ids] },
      },
      include: bookDetailsInclude,
      orderBy: [{ id: 'asc' }],
    });
    return rows.map((row) => BookMapper.toEntity(row));
  }

  async listByIds(input: ListBooksByIdsRepoInput): Promise<BookEntity[]> {
    if (input.ids.length === 0) {
      return [];
    }
    const rows = await this.prismaProviderService.book.findMany({
      where: {
        deletedAt: null,
        id: { in: [...input.ids] },
      },
      include: bookDetailsInclude,
      orderBy: [{ id: 'asc' }],
    });
    return rows.map((row) => BookMapper.toEntity(row));
  }

  private static buildAdminBookWhere(input: ListBooksRepoInput): Prisma.BookWhereInput {
    const filters: Prisma.BookWhereInput[] = [{ deletedAt: null }];
    const publishingStatuses: BookPublishingStatus[] | undefined = BookPrismaRepository.toArray(
      input.publishingStatus,
    );
    const processingStatuses: BookProcessingStatus[] | undefined = BookPrismaRepository.toArray(
      input.processingStatus,
    );
    const ownerIds: number[] | undefined = BookPrismaRepository.toArray(input.ownerId);
    if (publishingStatuses !== undefined) {
      filters.push({ publishingStatus: { in: publishingStatuses } });
    }
    if (processingStatuses !== undefined) {
      filters.push({ processingStatus: { in: processingStatuses } });
    }
    if (ownerIds !== undefined) {
      filters.push({ ownerId: { in: ownerIds } });
    }
    if (input.bookTypes !== undefined && input.bookTypes.length > 0) {
      filters.push({ bookType: { in: [...input.bookTypes] } });
    }
    if (input.layoutTypes !== undefined && input.layoutTypes.length > 0) {
      filters.push({ layoutType: { in: [...input.layoutTypes] } });
    }
    if (input.categoryIds !== undefined && input.categoryIds.length > 0) {
      filters.push({
        categories: {
          some: { id: { in: [...input.categoryIds] }, deletedAt: null },
        },
      });
    }
    const sourceMetadata: Prisma.BookSourceMetadataWhereInput = {};
    if (input.authorName !== undefined) {
      sourceMetadata.creator = { contains: input.authorName, mode: 'insensitive' };
    }
    if (input.publisherName !== undefined) {
      sourceMetadata.publisher = { contains: input.publisherName, mode: 'insensitive' };
    }
    if (input.authorName !== undefined || input.publisherName !== undefined) {
      filters.push({ sourceMetadata: { is: sourceMetadata } });
    }
    if (input.keyword !== undefined) {
      filters.push({
        OR: [
          { title: { contains: input.keyword, mode: 'insensitive' } },
          { description: { contains: input.keyword, mode: 'insensitive' } },
          { sourceMetadata: { is: { creator: { contains: input.keyword, mode: 'insensitive' } } } },
          {
            sourceMetadata: {
              is: { publisher: { contains: input.keyword, mode: 'insensitive' } },
            },
          },
        ],
      });
    }
    if (input.catalogVisible === true) {
      filters.push(BookPrismaRepository.buildCatalogVisiblePredicate());
    }
    if (input.catalogVisible === false) {
      filters.push({ NOT: BookPrismaRepository.buildCatalogVisiblePredicate() });
    }
    return { AND: filters };
  }

  private static buildAdminBookOrderBy(
    input: ListBooksRepoInput,
  ): Prisma.BookOrderByWithRelationInput | Prisma.BookOrderByWithRelationInput[] {
    if (input.sortBy === undefined) {
      return { createdAt: 'desc' };
    }
    const direction: Prisma.SortOrder = input.sortOrder === AdminSortOrder.ASC ? 'asc' : 'desc';
    const primary: Prisma.BookOrderByWithRelationInput = {
      [input.sortBy]: direction,
    };
    return [primary, { id: 'desc' }];
  }

  private static toArray<TValue>(
    value: TValue | readonly TValue[] | undefined,
  ): TValue[] | undefined {
    if (value === undefined) {
      return undefined;
    }
    const values: TValue[] = Array.isArray(value) ? [...value] : [value];
    return values.length === 0 ? undefined : values;
  }

  private static buildCatalogVisiblePredicate(): Prisma.BookWhereInput {
    return {
      publishingStatus: BookPublishingStatus.APPROVED,
      processingStatus: BookProcessingStatus.READY,
      publishedAt: { not: null },
    };
  }

  private static buildCatalogVisibilityWhere(): Prisma.BookWhereInput {
    return {
      deletedAt: null,
      ...BookPrismaRepository.buildCatalogVisiblePredicate(),
    };
  }

  private static buildCatalogWhere(input: ListCatalogBooksRepoInput): Prisma.BookWhereInput {
    const where: Prisma.BookWhereInput = BookPrismaRepository.buildCatalogVisibilityWhere();
    if (input.categoryId !== undefined) {
      where.categories = { some: { id: input.categoryId, deletedAt: null } };
    }
    if (input.title !== undefined) {
      where.title = { contains: input.title, mode: 'insensitive' };
    }
    const sourceMetadata: Prisma.BookSourceMetadataWhereInput = {};
    if (input.author !== undefined) {
      sourceMetadata.creator = { contains: input.author, mode: 'insensitive' };
    }
    if (input.publisher !== undefined) {
      sourceMetadata.publisher = { contains: input.publisher, mode: 'insensitive' };
    }
    if (input.author !== undefined || input.publisher !== undefined) {
      where.sourceMetadata = { is: sourceMetadata };
    }
    return where;
  }

  private static buildCatalogOrderBy(sort: CatalogSort): Prisma.BookOrderByWithRelationInput[] {
    if (sort === CatalogSort.POPULARITY) {
      return [{ readingProgresses: { _count: 'desc' } }, { publishedAt: 'desc' }, { id: 'desc' }];
    }
    return [{ publishedAt: 'desc' }, { id: 'desc' }];
  }

  private static buildCategoryConnect(
    categoryIds: readonly number[],
  ): Prisma.CategoryCreateNestedManyWithoutBooksInput | undefined {
    if (categoryIds.length === 0) {
      return undefined;
    }
    return {
      connect: categoryIds.map((id) => ({ id })),
    };
  }
}
