import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import {
  BookChapterDurationTotal,
  ChapterDurationTotal,
  ReadingChapterEngagementPage,
} from '@/modules/reading-intelligence/defs/reading-chapter-engagement-repository.defs';
import {
  ListReadingChapterEngagementsServiceInput,
  RecordReadingChapterEngagementServiceInput,
  SumChapterEngagementServiceInput,
  SumReadingChapterEngagementDurationsServiceInput,
} from '@/modules/reading-intelligence/defs/reading-chapter-engagement-service.defs';
import { ReadingChapterEngagementEntity } from '@/modules/reading-intelligence/entity/reading-chapter-engagement.entity';
import { ReadingChapterEngagementInvalidDurationException } from '@/modules/reading-intelligence/exceptions/reading-chapter-engagement-invalid-duration.exception';
import { ReadingChapterEngagementInvalidPositionException } from '@/modules/reading-intelligence/exceptions/reading-chapter-engagement-invalid-position.exception';
import { ReadingChapterEngagementRepository } from '@/modules/reading-intelligence/repository/reading-chapter-engagement.repository';

@Injectable()
export class ReadingChapterEngagementService {
  constructor(
    private readonly readingChapterEngagementRepository: ReadingChapterEngagementRepository,
  ) {}

  async recordReadingChapterEngagement(
    input: RecordReadingChapterEngagementServiceInput,
    context?: TransactionContext,
  ): Promise<ReadingChapterEngagementEntity> {
    ReadingChapterEngagementService.assertPosition(input.spineIndex);
    ReadingChapterEngagementService.assertDuration(input.activeDurationMs);
    return this.readingChapterEngagementRepository.addDurations(
      {
        userId: input.userId,
        bookId: input.bookId,
        sessionId: input.sessionId,
        layoutType: BookLayoutType.REFLOWABLE,
        spineIndex: input.spineIndex,
        activeDurationMs: input.activeDurationMs,
      },
      context,
    );
  }

  async listReadingChapterEngagements(
    input: ListReadingChapterEngagementsServiceInput,
  ): Promise<ReadingChapterEngagementPage> {
    return this.readingChapterEngagementRepository.list({
      userId: input.userId,
      bookId: input.bookId,
      sessionId: input.sessionId,
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
    });
  }

  async findReadingChapterEngagementById(
    id: number,
  ): Promise<ReadingChapterEngagementEntity | null> {
    return this.readingChapterEngagementRepository.findById(id);
  }

  async sumDurationsByBookInRange(
    input: SumReadingChapterEngagementDurationsServiceInput,
  ): Promise<BookChapterDurationTotal[]> {
    return this.readingChapterEngagementRepository.sumDurationsByBookInRange(input);
  }

  async sumDurationsByChapterInRange(
    input: SumChapterEngagementServiceInput,
  ): Promise<ChapterDurationTotal[]> {
    return this.readingChapterEngagementRepository.sumDurationsByChapterInRange(input);
  }

  async getReadingChapterEngagementById(id: number): Promise<ReadingChapterEngagementEntity> {
    const engagement: ReadingChapterEngagementEntity | null =
      await this.findReadingChapterEngagementById(id);
    if (engagement === null) {
      throw new ResourceNotFoundException('ReadingChapterEngagement', id);
    }
    return engagement;
  }

  private static assertPosition(spineIndex: number): void {
    if (!ReadingChapterEngagementService.isNonNegativeInt(spineIndex)) {
      throw new ReadingChapterEngagementInvalidPositionException();
    }
  }

  private static assertDuration(durationMs: number): void {
    if (!ReadingChapterEngagementService.isNonNegativeInt(durationMs)) {
      throw new ReadingChapterEngagementInvalidDurationException();
    }
  }

  private static isNonNegativeInt(value: number): boolean {
    return Number.isInteger(value) && value >= 0;
  }
}
