import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  BookPage,
  CreateBookRepoInput,
  ListBooksRepoInput,
  UpdateBookRepoInput,
} from '@/modules/book/defs/book-repository.defs';
import { BookEntity } from '@/modules/book/entity/book.entity';
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
    const where: Prisma.BookWhereInput = { deletedAt: null };
    if (input.publishingStatus !== undefined) {
      where.publishingStatus = input.publishingStatus;
    }
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.book.findMany({
        where,
        include: bookDetailsInclude,
        orderBy: { createdAt: 'desc' },
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
