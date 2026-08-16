import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import {
  AddReadingChapterEngagementDurationsRepoInput,
  BookChapterDurationTotal,
  ChapterDurationTotal,
  ListReadingChapterEngagementsRepoInput,
  ReadingChapterEngagementPage,
  SumChapterEngagementRepoInput,
  SumReadingChapterEngagementDurationsRepoInput,
} from '@/modules/reading-intelligence/defs/reading-chapter-engagement-repository.defs';
import { ReadingChapterEngagementEntity } from '@/modules/reading-intelligence/entity/reading-chapter-engagement.entity';
import { ReadingChapterEngagementMapper } from '@/modules/reading-intelligence/mapper/reading-chapter-engagement.mapper';
import { ReadingChapterEngagementRepository } from '@/modules/reading-intelligence/repository/reading-chapter-engagement.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class ReadingChapterEngagementPrismaRepository implements ReadingChapterEngagementRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async addDurations(
    input: AddReadingChapterEngagementDurationsRepoInput,
    context?: TransactionContext,
  ): Promise<ReadingChapterEngagementEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.readingChapterEngagement.upsert({
      where: {
        sessionId_spineIndex: {
          sessionId: input.sessionId,
          spineIndex: input.spineIndex,
        },
      },
      create: {
        user: { connect: { id: input.userId } },
        book: { connect: { id: input.bookId } },
        session: { connect: { id: input.sessionId } },
        layoutType: input.layoutType,
        spineIndex: input.spineIndex,
        activeDurationMs: input.activeDurationMs,
      },
      update: {
        activeDurationMs: { increment: input.activeDurationMs },
      },
    });
    return ReadingChapterEngagementMapper.toEntity(result);
  }

  async list(input: ListReadingChapterEngagementsRepoInput): Promise<ReadingChapterEngagementPage> {
    const where: Prisma.ReadingChapterEngagementWhereInput = {
      userId: input.userId,
      bookId: input.bookId,
      sessionId: input.sessionId,
      deletedAt: null,
    };
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.readingChapterEngagement.findMany({
        where,
        orderBy: { spineIndex: 'asc' },
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.readingChapterEngagement.count({ where }),
    ]);
    return {
      entities: rows.map((row) => ReadingChapterEngagementMapper.toEntity(row)),
      total,
    };
  }

  async findById(id: number): Promise<ReadingChapterEngagementEntity | null> {
    const result = await this.prismaProviderService.readingChapterEngagement.findFirst({
      where: { id, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return ReadingChapterEngagementMapper.toEntity(result);
  }

  async sumDurationsByBookInRange(
    input: SumReadingChapterEngagementDurationsRepoInput,
  ): Promise<BookChapterDurationTotal[]> {
    const rows = await this.prismaProviderService.readingChapterEngagement.groupBy({
      by: ['bookId'],
      where: {
        deletedAt: null,
        layoutType: BookLayoutType.REFLOWABLE,
        session: {
          deletedAt: null,
          startedAt: { gte: input.startsAt, lt: input.endsAt },
        },
      },
      _sum: { activeDurationMs: true },
      orderBy: { bookId: 'asc' },
    });
    return rows.map((row) => ({
      bookId: row.bookId,
      activeDurationMs: row._sum.activeDurationMs ?? 0,
    }));
  }

  async sumDurationsByChapterInRange(
    input: SumChapterEngagementRepoInput,
  ): Promise<ChapterDurationTotal[]> {
    const rows = await this.prismaProviderService.readingChapterEngagement.groupBy({
      by: ['spineIndex'],
      where: {
        bookId: input.bookId,
        deletedAt: null,
        layoutType: BookLayoutType.REFLOWABLE,
        session: {
          deletedAt: null,
          startedAt: { gte: input.startsAt, lt: input.endsAt },
        },
      },
      _sum: { activeDurationMs: true },
    });
    return rows
      .map((row) => ({
        spineIndex: row.spineIndex,
        activeDurationMs: row._sum.activeDurationMs ?? 0,
      }))
      .sort((left, right) => {
        if (right.activeDurationMs !== left.activeDurationMs) {
          return right.activeDurationMs - left.activeDurationMs;
        }
        return left.spineIndex - right.spineIndex;
      });
  }
}
