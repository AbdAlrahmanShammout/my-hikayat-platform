import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  AddReadingVisualEngagementDurationsRepoInput,
  ListReadingVisualEngagementsRepoInput,
  ReadingVisualEngagementPage,
} from '@/modules/reading-intelligence/defs/reading-visual-engagement-repository.defs';
import { ReadingVisualEngagementEntity } from '@/modules/reading-intelligence/entity/reading-visual-engagement.entity';
import { ReadingVisualEngagementMapper } from '@/modules/reading-intelligence/mapper/reading-visual-engagement.mapper';
import { ReadingVisualEngagementRepository } from '@/modules/reading-intelligence/repository/reading-visual-engagement.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class ReadingVisualEngagementPrismaRepository implements ReadingVisualEngagementRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async addDurations(
    input: AddReadingVisualEngagementDurationsRepoInput,
    context?: TransactionContext,
  ): Promise<ReadingVisualEngagementEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.readingVisualEngagement.upsert({
      where: {
        sessionId_spreadIndex_pageNumber: {
          sessionId: input.sessionId,
          spreadIndex: input.spreadIndex,
          pageNumber: input.pageNumber,
        },
      },
      create: {
        user: { connect: { id: input.userId } },
        book: { connect: { id: input.bookId } },
        session: { connect: { id: input.sessionId } },
        layoutType: input.layoutType,
        spreadIndex: input.spreadIndex,
        pageNumber: input.pageNumber,
        activeDurationMs: input.activeDurationMs,
        visualSceneTimeMs: input.visualSceneTimeMs,
      },
      update: {
        activeDurationMs: { increment: input.activeDurationMs },
        visualSceneTimeMs: { increment: input.visualSceneTimeMs },
      },
    });
    return ReadingVisualEngagementMapper.toEntity(result);
  }

  async list(input: ListReadingVisualEngagementsRepoInput): Promise<ReadingVisualEngagementPage> {
    const where: Prisma.ReadingVisualEngagementWhereInput = {
      userId: input.userId,
      bookId: input.bookId,
      sessionId: input.sessionId,
      deletedAt: null,
    };
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.readingVisualEngagement.findMany({
        where,
        orderBy: [{ spreadIndex: 'asc' }, { pageNumber: 'asc' }],
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.readingVisualEngagement.count({ where }),
    ]);
    return {
      entities: rows.map((row) => ReadingVisualEngagementMapper.toEntity(row)),
      total,
    };
  }

  async findById(id: number): Promise<ReadingVisualEngagementEntity | null> {
    const result = await this.prismaProviderService.readingVisualEngagement.findFirst({
      where: { id, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return ReadingVisualEngagementMapper.toEntity(result);
  }
}
