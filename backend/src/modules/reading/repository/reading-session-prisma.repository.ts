import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  BookActiveDurationTotal,
  CreateReadingSessionRepoInput,
  SumReadingSessionActiveDurationRepoInput,
  UpdateReadingSessionRepoInput,
} from '@/modules/reading/defs/reading-session-repository.defs';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';
import { ReadingSessionMapper } from '@/modules/reading/mapper/reading-session.mapper';
import { ReadingSessionRepository } from '@/modules/reading/repository/reading-session.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class ReadingSessionPrismaRepository implements ReadingSessionRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async create(
    input: CreateReadingSessionRepoInput,
    context?: TransactionContext,
  ): Promise<ReadingSessionEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.readingSession.create({
      data: {
        user: { connect: { id: input.userId } },
        book: { connect: { id: input.bookId } },
        layoutType: input.layoutType,
        startedAt: input.startedAt,
        endedAt: input.endedAt,
        activeDurationMs: input.activeDurationMs,
        idleDurationMs: input.idleDurationMs,
        spineIndex: input.spineIndex,
        scrollOffset: input.scrollOffset,
        spreadIndex: input.spreadIndex,
        pageNumber: input.pageNumber,
      },
    });
    return ReadingSessionMapper.toEntity(result);
  }

  async update(
    input: UpdateReadingSessionRepoInput,
    context?: TransactionContext,
  ): Promise<ReadingSessionEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const data: Prisma.ReadingSessionUncheckedUpdateInput = {};
    if (input.endedAt !== undefined) {
      data.endedAt = input.endedAt;
    }
    if (input.activeDurationMs !== undefined) {
      data.activeDurationMs = input.activeDurationMs;
    }
    if (input.idleDurationMs !== undefined) {
      data.idleDurationMs = input.idleDurationMs;
    }
    if (input.spineIndex !== undefined) {
      data.spineIndex = input.spineIndex;
    }
    if (input.scrollOffset !== undefined) {
      data.scrollOffset = input.scrollOffset;
    }
    if (input.spreadIndex !== undefined) {
      data.spreadIndex = input.spreadIndex;
    }
    if (input.pageNumber !== undefined) {
      data.pageNumber = input.pageNumber;
    }
    const result = await client.readingSession.update({
      where: { id: input.id },
      data,
    });
    return ReadingSessionMapper.toEntity(result);
  }

  async findById(id: number): Promise<ReadingSessionEntity | null> {
    const result = await this.prismaProviderService.readingSession.findFirst({
      where: { id, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return ReadingSessionMapper.toEntity(result);
  }

  async findOpenByUserIdAndBookId(
    userId: number,
    bookId: number,
  ): Promise<ReadingSessionEntity | null> {
    const result = await this.prismaProviderService.readingSession.findFirst({
      where: { userId, bookId, endedAt: null, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return ReadingSessionMapper.toEntity(result);
  }

  async sumActiveDurationByBookInRange(
    input: SumReadingSessionActiveDurationRepoInput,
  ): Promise<BookActiveDurationTotal[]> {
    const rows = await this.prismaProviderService.readingSession.groupBy({
      by: ['bookId'],
      where: {
        deletedAt: null,
        layoutType: input.layoutType,
        startedAt: { gte: input.startsAt, lt: input.endsAt },
      },
      _sum: { activeDurationMs: true },
      orderBy: { bookId: 'asc' },
    });
    return rows.map((row) => ({
      bookId: row.bookId,
      activeDurationMs: row._sum.activeDurationMs ?? 0,
    }));
  }
}
