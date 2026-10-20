import { Injectable } from '@nestjs/common';
import { ReadingCompletionStatus as PrismaReadingCompletionStatus } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import { BookReadingCycleEntity } from '@/modules/reading-completion/entity/book-reading-cycle.entity';
import { BookReadingCycleMapper } from '@/modules/reading-completion/mapper/book-reading-cycle.mapper';
import {
  AddPageDwellRepoInput,
  BookReadingCycleRepository,
  CompletedReadCountRow,
  CreateBookReadingCycleRepoInput,
  UpdateBookReadingCycleRepoInput,
} from '@/modules/reading-completion/repository/book-reading-cycle.repository';
import { bookReadingCycleDetailsInclude } from '@/modules/reading-completion/types/book-reading-cycle-details.include';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import {
  PrismaClientLike,
  resolvePrismaTransactionClient,
} from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class BookReadingCyclePrismaRepository implements BookReadingCycleRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async findLatest(
    userId: number,
    bookId: number,
    context?: TransactionContext,
  ): Promise<BookReadingCycleEntity | null> {
    const client: PrismaClientLike = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.bookReadingCycle.findFirst({
      where: { userId, bookId, deletedAt: null },
      include: bookReadingCycleDetailsInclude,
      orderBy: { cycleNumber: 'desc' },
    });
    if (result === null) {
      return null;
    }
    return BookReadingCycleMapper.toEntity(result);
  }

  async listLatestForBooks(
    userId: number,
    bookIds: readonly number[],
  ): Promise<BookReadingCycleEntity[]> {
    if (bookIds.length === 0) {
      return [];
    }
    const rows = await this.prismaProviderService.bookReadingCycle.findMany({
      where: { userId, bookId: { in: [...bookIds] }, deletedAt: null },
      include: bookReadingCycleDetailsInclude,
      orderBy: { cycleNumber: 'desc' },
    });
    const latest = new Map<number, BookReadingCycleEntity>();
    for (const row of rows) {
      if (!latest.has(row.bookId)) {
        latest.set(row.bookId, BookReadingCycleMapper.toEntity(row));
      }
    }
    return [...latest.values()];
  }

  async create(
    input: CreateBookReadingCycleRepoInput,
    context?: TransactionContext,
  ): Promise<BookReadingCycleEntity> {
    const client: PrismaClientLike = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const created = await client.bookReadingCycle.create({
      data: {
        userId: input.userId,
        bookId: input.bookId,
        cycleNumber: input.cycleNumber,
        layoutType: input.layoutType,
        status: PrismaReadingCompletionStatus.in_progress,
      },
      include: bookReadingCycleDetailsInclude,
    });
    return BookReadingCycleMapper.toEntity(created);
  }

  async addPageDwell(input: AddPageDwellRepoInput, context?: TransactionContext): Promise<void> {
    const client: PrismaClientLike = resolvePrismaTransactionClient(this.prismaProviderService, context);
    await client.bookReadingCyclePage.upsert({
      where: { cycleId_pageIndex: { cycleId: input.cycleId, pageIndex: input.pageIndex } },
      create: {
        cycleId: input.cycleId,
        pageIndex: input.pageIndex,
        activeDurationMs: input.activeDurationMs,
      },
      update: { activeDurationMs: { increment: input.activeDurationMs } },
    });
  }

  async update(
    input: UpdateBookReadingCycleRepoInput,
    context?: TransactionContext,
  ): Promise<BookReadingCycleEntity> {
    const client: PrismaClientLike = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const updated = await client.bookReadingCycle.update({
      where: { id: input.id },
      data: {
        status: input.status,
        lastPageRead: input.lastPageRead,
        activeTimeMs: input.activeTimeMs,
        qualifyingPageCount: input.qualifyingPageCount,
        lastPageReached: input.lastPageReached,
        completedAt: input.completedAt,
      },
      include: bookReadingCycleDetailsInclude,
    });
    return BookReadingCycleMapper.toEntity(updated);
  }

  async listCompletedReadCounts(input: {
    readonly startsAt: Date;
    readonly endsAt: Date;
  }): Promise<CompletedReadCountRow[]> {
    const rows = await this.prismaProviderService.bookReadingCycle.findMany({
      where: {
        deletedAt: null,
        status: PrismaReadingCompletionStatus.completed,
        completedAt: { gte: input.startsAt, lt: input.endsAt },
      },
      select: { bookId: true, userId: true },
      distinct: ['bookId', 'userId'],
    });
    const counts = new Map<number, number>();
    for (const row of rows) {
      counts.set(row.bookId, (counts.get(row.bookId) ?? 0) + 1);
    }
    return [...counts.entries()].map(([bookId, completedReadCount]) => ({
      bookId,
      completedReadCount,
    }));
  }
}
