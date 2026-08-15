import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  CreateReadingProgressRepoInput,
  UpdateReadingProgressRepoInput,
} from '@/modules/reading/defs/reading-progress-repository.defs';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';
import { ReadingProgressMapper } from '@/modules/reading/mapper/reading-progress.mapper';
import { ReadingProgressRepository } from '@/modules/reading/repository/reading-progress.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class ReadingProgressPrismaRepository implements ReadingProgressRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async create(
    input: CreateReadingProgressRepoInput,
    context?: TransactionContext,
  ): Promise<ReadingProgressEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.readingProgress.create({
      data: {
        user: { connect: { id: input.userId } },
        book: { connect: { id: input.bookId } },
        layoutType: input.layoutType,
        spineIndex: input.spineIndex,
        scrollOffset: input.scrollOffset,
        spreadIndex: input.spreadIndex,
        pageNumber: input.pageNumber,
        lastSessionAt: input.lastSessionAt,
      },
    });
    return ReadingProgressMapper.toEntity(result);
  }

  async update(
    input: UpdateReadingProgressRepoInput,
    context?: TransactionContext,
  ): Promise<ReadingProgressEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const data: Prisma.ReadingProgressUncheckedUpdateInput = {};
    if (input.layoutType !== undefined) {
      data.layoutType = input.layoutType;
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
    if (input.lastSessionAt !== undefined) {
      data.lastSessionAt = input.lastSessionAt;
    }
    const result = await client.readingProgress.update({
      where: { id: input.id },
      data,
    });
    return ReadingProgressMapper.toEntity(result);
  }

  async findById(id: number): Promise<ReadingProgressEntity | null> {
    const result = await this.prismaProviderService.readingProgress.findFirst({
      where: { id, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return ReadingProgressMapper.toEntity(result);
  }

  async findByUserIdAndBookId(
    userId: number,
    bookId: number,
  ): Promise<ReadingProgressEntity | null> {
    const result = await this.prismaProviderService.readingProgress.findFirst({
      where: { userId, bookId, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return ReadingProgressMapper.toEntity(result);
  }
}
