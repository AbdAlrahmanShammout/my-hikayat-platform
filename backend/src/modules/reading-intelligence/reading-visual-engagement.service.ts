import { Injectable } from '@nestjs/common';

import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import {
  BookVisualDurationTotal,
  ReadingVisualEngagementPage,
} from '@/modules/reading-intelligence/defs/reading-visual-engagement-repository.defs';
import {
  ListReadingVisualEngagementsServiceInput,
  RecordReadingVisualEngagementServiceInput,
  SumReadingVisualEngagementDurationsServiceInput,
} from '@/modules/reading-intelligence/defs/reading-visual-engagement-service.defs';
import { ReadingVisualEngagementEntity } from '@/modules/reading-intelligence/entity/reading-visual-engagement.entity';
import { ReadingVisualEngagementInvalidDurationException } from '@/modules/reading-intelligence/exceptions/reading-visual-engagement-invalid-duration.exception';
import { ReadingVisualEngagementInvalidPositionException } from '@/modules/reading-intelligence/exceptions/reading-visual-engagement-invalid-position.exception';
import { ReadingVisualEngagementRepository } from '@/modules/reading-intelligence/repository/reading-visual-engagement.repository';

@Injectable()
export class ReadingVisualEngagementService {
  constructor(
    private readonly readingVisualEngagementRepository: ReadingVisualEngagementRepository,
  ) {}

  async recordReadingVisualEngagement(
    input: RecordReadingVisualEngagementServiceInput,
  ): Promise<ReadingVisualEngagementEntity> {
    ReadingVisualEngagementService.assertPosition(input.spreadIndex, input.pageNumber);
    ReadingVisualEngagementService.assertDuration(input.activeDurationMs);
    ReadingVisualEngagementService.assertDuration(input.visualSceneTimeMs);
    return this.readingVisualEngagementRepository.addDurations({
      userId: input.userId,
      bookId: input.bookId,
      sessionId: input.sessionId,
      layoutType: BookLayoutType.FIXED_LAYOUT,
      spreadIndex: input.spreadIndex,
      pageNumber: input.pageNumber,
      activeDurationMs: input.activeDurationMs,
      visualSceneTimeMs: input.visualSceneTimeMs,
    });
  }

  async listReadingVisualEngagements(
    input: ListReadingVisualEngagementsServiceInput,
  ): Promise<ReadingVisualEngagementPage> {
    return this.readingVisualEngagementRepository.list({
      userId: input.userId,
      bookId: input.bookId,
      sessionId: input.sessionId,
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
    });
  }

  async findReadingVisualEngagementById(id: number): Promise<ReadingVisualEngagementEntity | null> {
    return this.readingVisualEngagementRepository.findById(id);
  }

  async sumDurationsByBookInRange(
    input: SumReadingVisualEngagementDurationsServiceInput,
  ): Promise<BookVisualDurationTotal[]> {
    return this.readingVisualEngagementRepository.sumDurationsByBookInRange(input);
  }

  async getReadingVisualEngagementById(id: number): Promise<ReadingVisualEngagementEntity> {
    const engagement: ReadingVisualEngagementEntity | null =
      await this.findReadingVisualEngagementById(id);
    if (engagement === null) {
      throw new ResourceNotFoundException('ReadingVisualEngagement', id);
    }
    return engagement;
  }

  private static assertPosition(spreadIndex: number, pageNumber: number): void {
    if (
      !ReadingVisualEngagementService.isNonNegativeInt(spreadIndex) ||
      !ReadingVisualEngagementService.isPositiveInt(pageNumber)
    ) {
      throw new ReadingVisualEngagementInvalidPositionException();
    }
  }

  private static assertDuration(durationMs: number): void {
    if (!ReadingVisualEngagementService.isNonNegativeInt(durationMs)) {
      throw new ReadingVisualEngagementInvalidDurationException();
    }
  }

  private static isNonNegativeInt(value: number): boolean {
    return Number.isInteger(value) && value >= 0;
  }

  private static isPositiveInt(value: number): boolean {
    return Number.isInteger(value) && value >= 1;
  }
}
