import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  BookEngagementPage,
  ListAllBookEngagementsRepoInput,
  ListBookEngagementsRepoInput,
  OwnerBookEngagementSummary,
  ReplaceBookEngagementsForPeriodRepoInput,
  SummarizeOwnerBookEngagementsRepoInput,
  UpsertBookEngagementRepoInput,
} from '@/modules/monetization/defs/book-engagement-repository.defs';
import { BookEngagementEntity } from '@/modules/monetization/entity/book-engagement.entity';
import { BookEngagementMapper } from '@/modules/monetization/mapper/book-engagement.mapper';
import { BookEngagementRepository } from '@/modules/monetization/repository/book-engagement.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import {
  PrismaClientLike,
  resolvePrismaTransactionClient,
} from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class BookEngagementPrismaRepository implements BookEngagementRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async replaceForPeriod(
    input: ReplaceBookEngagementsForPeriodRepoInput,
    context?: TransactionContext,
  ): Promise<BookEngagementEntity[]> {
    if (context !== undefined) {
      const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
      return BookEngagementPrismaRepository.writePeriodRows(client, input);
    }
    return this.prismaProviderService.$transaction((transactionClient) =>
      BookEngagementPrismaRepository.writePeriodRows(transactionClient, input),
    );
  }

  async list(input: ListBookEngagementsRepoInput): Promise<BookEngagementPage> {
    const where: Prisma.BookEngagementWhereInput =
      BookEngagementPrismaRepository.buildOwnerPeriodWhere(input);
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.bookEngagement.findMany({
        where,
        orderBy: [{ weightedEngagement: 'desc' }, { bookId: 'asc' }],
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.bookEngagement.count({ where }),
    ]);
    return {
      entities: rows.map((row) => BookEngagementMapper.toEntity(row)),
      total,
    };
  }

  async listAllByPeriod(input: ListAllBookEngagementsRepoInput): Promise<BookEngagementEntity[]> {
    const rows = await this.prismaProviderService.bookEngagement.findMany({
      where: { revenuePeriodId: input.revenuePeriodId, deletedAt: null },
      orderBy: [{ weightedEngagement: 'desc' }, { bookId: 'asc' }],
    });
    return rows.map((row) => BookEngagementMapper.toEntity(row));
  }

  async findById(id: number): Promise<BookEngagementEntity | null> {
    const result = await this.prismaProviderService.bookEngagement.findFirst({
      where: { id, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return BookEngagementMapper.toEntity(result);
  }

  async findByPeriodAndBook(
    revenuePeriodId: number,
    bookId: number,
  ): Promise<BookEngagementEntity | null> {
    const result = await this.prismaProviderService.bookEngagement.findFirst({
      where: { revenuePeriodId, bookId, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return BookEngagementMapper.toEntity(result);
  }

  async summarizeByOwner(
    input: SummarizeOwnerBookEngagementsRepoInput,
  ): Promise<OwnerBookEngagementSummary> {
    const result = await this.prismaProviderService.bookEngagement.aggregate({
      where: BookEngagementPrismaRepository.buildOwnerPeriodWhere(input),
      _sum: {
        activeReadingMs: true,
        activeSpreadMs: true,
        visualSceneTimeMs: true,
        weightedEngagement: true,
      },
    });
    return {
      totalActiveReadingMs: result._sum.activeReadingMs ?? 0,
      totalActiveSpreadMs: result._sum.activeSpreadMs ?? 0,
      totalVisualSceneTimeMs: result._sum.visualSceneTimeMs ?? 0,
      totalWeightedEngagement: Number(result._sum.weightedEngagement ?? 0),
    };
  }

  private static buildOwnerPeriodWhere(input: {
    readonly revenuePeriodId?: number;
    readonly ownerId?: number;
  }): Prisma.BookEngagementWhereInput {
    const bookWhere: Prisma.BookWhereInput = { deletedAt: null };
    if (input.ownerId !== undefined) {
      bookWhere.ownerId = input.ownerId;
    }
    const where: Prisma.BookEngagementWhereInput = {
      deletedAt: null,
      book: bookWhere,
    };
    if (input.revenuePeriodId !== undefined) {
      where.revenuePeriodId = input.revenuePeriodId;
    }
    return where;
  }

  private static async writePeriodRows(
    client: PrismaClientLike,
    input: ReplaceBookEngagementsForPeriodRepoInput,
  ): Promise<BookEngagementEntity[]> {
    const keepBookIds: number[] = input.rows.map((row) => row.bookId);
    for (const row of input.rows) {
      await BookEngagementPrismaRepository.upsertRow(client, row);
    }
    await client.bookEngagement.updateMany({
      where: {
        revenuePeriodId: input.revenuePeriodId,
        deletedAt: null,
        ...(keepBookIds.length > 0 ? { bookId: { notIn: keepBookIds } } : {}),
      },
      data: { deletedAt: new Date() },
    });
    const rows = await client.bookEngagement.findMany({
      where: { revenuePeriodId: input.revenuePeriodId, deletedAt: null },
      orderBy: [{ weightedEngagement: 'desc' }, { bookId: 'asc' }],
    });
    return rows.map((row) => BookEngagementMapper.toEntity(row));
  }

  private static async upsertRow(
    client: PrismaClientLike,
    row: UpsertBookEngagementRepoInput,
  ): Promise<void> {
    await client.bookEngagement.upsert({
      where: {
        revenuePeriodId_bookId: {
          revenuePeriodId: row.revenuePeriodId,
          bookId: row.bookId,
        },
      },
      create: {
        revenuePeriodId: row.revenuePeriodId,
        bookId: row.bookId,
        layoutType: row.layoutType,
        activeReadingMs: row.activeReadingMs,
        activeSpreadMs: row.activeSpreadMs,
        visualSceneTimeMs: row.visualSceneTimeMs,
        categoryWeight: row.categoryWeight,
        weightedEngagement: row.weightedEngagement,
        deletedAt: null,
      },
      update: {
        layoutType: row.layoutType,
        activeReadingMs: row.activeReadingMs,
        activeSpreadMs: row.activeSpreadMs,
        visualSceneTimeMs: row.visualSceneTimeMs,
        categoryWeight: row.categoryWeight,
        weightedEngagement: row.weightedEngagement,
        deletedAt: null,
      },
    });
  }
}
