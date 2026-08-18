import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  BookRevenuePage,
  ListBookRevenuesRepoInput,
  ReplaceBookRevenuesForPeriodRepoInput,
  SumAuthorCentsRepoInput,
  UpsertBookRevenueRepoInput,
} from '@/modules/monetization/defs/book-revenue-repository.defs';
import { BookRevenueEntity } from '@/modules/monetization/entity/book-revenue.entity';
import { BookRevenueMapper } from '@/modules/monetization/mapper/book-revenue.mapper';
import { BookRevenueRepository } from '@/modules/monetization/repository/book-revenue.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import {
  PrismaClientLike,
  resolvePrismaTransactionClient,
} from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class BookRevenuePrismaRepository implements BookRevenueRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async replaceForPeriod(
    input: ReplaceBookRevenuesForPeriodRepoInput,
    context?: TransactionContext,
  ): Promise<BookRevenueEntity[]> {
    if (context !== undefined) {
      const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
      return BookRevenuePrismaRepository.writePeriodRows(client, input);
    }
    return this.prismaProviderService.$transaction((transactionClient) =>
      BookRevenuePrismaRepository.writePeriodRows(transactionClient, input),
    );
  }

  async list(input: ListBookRevenuesRepoInput): Promise<BookRevenuePage> {
    const where: Prisma.BookRevenueWhereInput = {
      revenuePeriodId: input.revenuePeriodId,
      deletedAt: null,
    };
    if (input.ownerId !== undefined) {
      where.ownerId = input.ownerId;
    }
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.bookRevenue.findMany({
        where,
        orderBy: [{ authorCents: 'desc' }, { bookId: 'asc' }],
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.bookRevenue.count({ where }),
    ]);
    return {
      entities: rows.map((row) => BookRevenueMapper.toEntity(row)),
      total,
    };
  }

  async findById(id: number): Promise<BookRevenueEntity | null> {
    const result = await this.prismaProviderService.bookRevenue.findFirst({
      where: { id, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return BookRevenueMapper.toEntity(result);
  }

  async findByPeriodAndBook(
    revenuePeriodId: number,
    bookId: number,
  ): Promise<BookRevenueEntity | null> {
    const result = await this.prismaProviderService.bookRevenue.findFirst({
      where: { revenuePeriodId, bookId, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return BookRevenueMapper.toEntity(result);
  }

  async sumAuthorCents(input: SumAuthorCentsRepoInput): Promise<number> {
    const where: Prisma.BookRevenueWhereInput = {
      deletedAt: null,
      book: { deletedAt: null },
    };
    if (input.revenuePeriodId !== undefined) {
      where.revenuePeriodId = input.revenuePeriodId;
    }
    if (input.ownerId !== undefined) {
      where.ownerId = input.ownerId;
    }
    const result = await this.prismaProviderService.bookRevenue.aggregate({
      where,
      _sum: { authorCents: true },
    });
    return result._sum.authorCents ?? 0;
  }

  private static async writePeriodRows(
    client: PrismaClientLike,
    input: ReplaceBookRevenuesForPeriodRepoInput,
  ): Promise<BookRevenueEntity[]> {
    const keepBookIds: number[] = input.rows.map((row) => row.bookId);
    for (const row of input.rows) {
      await BookRevenuePrismaRepository.upsertRow(client, row);
    }
    await client.bookRevenue.updateMany({
      where: {
        revenuePeriodId: input.revenuePeriodId,
        deletedAt: null,
        ...(keepBookIds.length > 0 ? { bookId: { notIn: keepBookIds } } : {}),
      },
      data: { deletedAt: new Date() },
    });
    const rows = await client.bookRevenue.findMany({
      where: { revenuePeriodId: input.revenuePeriodId, deletedAt: null },
      orderBy: [{ authorCents: 'desc' }, { bookId: 'asc' }],
    });
    return rows.map((row) => BookRevenueMapper.toEntity(row));
  }

  private static async upsertRow(
    client: PrismaClientLike,
    row: UpsertBookRevenueRepoInput,
  ): Promise<void> {
    await client.bookRevenue.upsert({
      where: {
        revenuePeriodId_bookId: {
          revenuePeriodId: row.revenuePeriodId,
          bookId: row.bookId,
        },
      },
      create: {
        revenuePeriodId: row.revenuePeriodId,
        bookId: row.bookId,
        ownerId: row.ownerId,
        weightedEngagement: row.weightedEngagement,
        poolShareCents: row.poolShareCents,
        platformCutCents: row.platformCutCents,
        authorCents: row.authorCents,
        deletedAt: null,
      },
      update: {
        ownerId: row.ownerId,
        weightedEngagement: row.weightedEngagement,
        poolShareCents: row.poolShareCents,
        platformCutCents: row.platformCutCents,
        authorCents: row.authorCents,
        deletedAt: null,
      },
    });
  }
}
