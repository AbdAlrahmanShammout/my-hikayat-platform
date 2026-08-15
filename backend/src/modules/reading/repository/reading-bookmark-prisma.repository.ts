import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  CreateReadingBookmarkRepoInput,
  ListReadingBookmarksRepoInput,
  ReadingBookmarkPage,
} from '@/modules/reading/defs/reading-bookmark-repository.defs';
import { ReadingBookmarkEntity } from '@/modules/reading/entity/reading-bookmark.entity';
import { ReadingBookmarkMapper } from '@/modules/reading/mapper/reading-bookmark.mapper';
import { ReadingBookmarkRepository } from '@/modules/reading/repository/reading-bookmark.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class ReadingBookmarkPrismaRepository implements ReadingBookmarkRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async create(
    input: CreateReadingBookmarkRepoInput,
    context?: TransactionContext,
  ): Promise<ReadingBookmarkEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.readingBookmark.create({
      data: {
        user: { connect: { id: input.userId } },
        book: { connect: { id: input.bookId } },
        layoutType: input.layoutType,
        spineIndex: input.spineIndex,
        scrollOffset: input.scrollOffset,
        spreadIndex: input.spreadIndex,
        pageNumber: input.pageNumber,
      },
    });
    return ReadingBookmarkMapper.toEntity(result);
  }

  async list(input: ListReadingBookmarksRepoInput): Promise<ReadingBookmarkPage> {
    const where: Prisma.ReadingBookmarkWhereInput = {
      userId: input.userId,
      deletedAt: null,
    };
    if (input.bookId !== undefined) {
      where.bookId = input.bookId;
    }
    if (input.updatedSince !== undefined) {
      where.updatedAt = { gte: input.updatedSince };
    }
    const findMany: Prisma.ReadingBookmarkFindManyArgs = {
      where,
      orderBy: [{ bookId: 'asc' }, { createdAt: 'asc' }],
      skip: input.offset ?? 0,
    };
    if (input.limit !== undefined) {
      findMany.take = input.limit;
    }
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.readingBookmark.findMany(findMany),
      this.prismaProviderService.readingBookmark.count({ where }),
    ]);
    return {
      entities: rows.map((row) => ReadingBookmarkMapper.toEntity(row)),
      total,
    };
  }

  async findById(id: number): Promise<ReadingBookmarkEntity | null> {
    const result = await this.prismaProviderService.readingBookmark.findFirst({
      where: { id, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return ReadingBookmarkMapper.toEntity(result);
  }

  async delete(id: number, context?: TransactionContext): Promise<ReadingBookmarkEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.readingBookmark.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return ReadingBookmarkMapper.toEntity(result);
  }
}
