import { Injectable } from '@nestjs/common';

import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookService } from '@/modules/book/book.service';
import { DEFAULT_CATEGORY_WEIGHT } from '@/modules/category/consts';
import { CategoryEntity } from '@/modules/category/entity/category.entity';
import {
  BookEngagementPage,
  OwnerBookEngagementSummary,
  UpsertBookEngagementRepoInput,
} from '@/modules/monetization/defs/book-engagement-repository.defs';
import {
  AggregatePeriodEngagementServiceInput,
  FindBookEngagementByPeriodAndBookServiceInput,
  ListBookEngagementsServiceInput,
  SummarizeOwnerEngagementServiceInput,
} from '@/modules/monetization/defs/book-engagement-service.defs';
import { BookEngagementEntity } from '@/modules/monetization/entity/book-engagement.entity';
import { BookEngagementRepository } from '@/modules/monetization/repository/book-engagement.repository';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';
import { computeWeightedEngagementMinutes } from '@/modules/monetization/weighted-engagement.helper';
import { BookEngagementSignal } from '@/modules/reading-intelligence/defs/reading-intelligence-service.defs';
import { ReadingIntelligenceService } from '@/modules/reading-intelligence/reading-intelligence.service';

@Injectable()
export class BookEngagementService {
  constructor(
    private readonly bookEngagementRepository: BookEngagementRepository,
    private readonly revenuePeriodService: RevenuePeriodService,
    private readonly readingIntelligenceService: ReadingIntelligenceService,
    private readonly bookService: BookService,
  ) {}

  async aggregatePeriodEngagement(
    input: AggregatePeriodEngagementServiceInput,
  ): Promise<BookEngagementEntity[]> {
    const period = await this.revenuePeriodService.getRevenuePeriodById(input.revenuePeriodId);
    const signals = await this.readingIntelligenceService.listBookEngagementSignalsInRange({
      startsAt: period.startsAt,
      endsAt: period.endsAt,
    });
    const rows: UpsertBookEngagementRepoInput[] = [];
    for (const signal of signals) {
      const row: UpsertBookEngagementRepoInput | null = await this.buildRow(period.id, signal);
      if (row !== null) {
        rows.push(row);
      }
    }
    return this.bookEngagementRepository.replaceForPeriod({
      revenuePeriodId: period.id,
      rows,
    });
  }

  async listBookEngagements(input: ListBookEngagementsServiceInput): Promise<BookEngagementPage> {
    await this.revenuePeriodService.getRevenuePeriodById(input.revenuePeriodId);
    return this.bookEngagementRepository.list({
      revenuePeriodId: input.revenuePeriodId,
      ownerId: input.ownerId,
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
    });
  }

  async listAllBookEngagementsForPeriod(revenuePeriodId: number): Promise<BookEngagementEntity[]> {
    await this.revenuePeriodService.getRevenuePeriodById(revenuePeriodId);
    return this.bookEngagementRepository.listAllByPeriod({ revenuePeriodId });
  }

  async findBookEngagementById(id: number): Promise<BookEngagementEntity | null> {
    return this.bookEngagementRepository.findById(id);
  }

  async getBookEngagementById(id: number): Promise<BookEngagementEntity> {
    const engagement: BookEngagementEntity | null = await this.findBookEngagementById(id);
    if (engagement === null) {
      throw new ResourceNotFoundException('BookEngagement', id);
    }
    return engagement;
  }

  async findBookEngagementByPeriodAndBook(
    input: FindBookEngagementByPeriodAndBookServiceInput,
  ): Promise<BookEngagementEntity | null> {
    return this.bookEngagementRepository.findByPeriodAndBook(input.revenuePeriodId, input.bookId);
  }

  async getBookEngagementByPeriodAndBook(
    input: FindBookEngagementByPeriodAndBookServiceInput,
  ): Promise<BookEngagementEntity> {
    const engagement: BookEngagementEntity | null =
      await this.findBookEngagementByPeriodAndBook(input);
    if (engagement === null) {
      throw new ResourceNotFoundException(
        'BookEngagement',
        `${input.revenuePeriodId}:${input.bookId}`,
      );
    }
    return engagement;
  }

  async summarizeOwnerEngagement(
    input: SummarizeOwnerEngagementServiceInput,
  ): Promise<OwnerBookEngagementSummary> {
    if (input.revenuePeriodId !== undefined) {
      await this.revenuePeriodService.getRevenuePeriodById(input.revenuePeriodId);
    }
    return this.bookEngagementRepository.summarizeByOwner({
      revenuePeriodId: input.revenuePeriodId,
      ownerId: input.ownerId,
    });
  }

  async summarizeOwnerEngagementForPeriod(
    input: SummarizeOwnerEngagementServiceInput & { readonly revenuePeriodId: number },
  ): Promise<OwnerBookEngagementSummary> {
    return this.summarizeOwnerEngagement(input);
  }

  private async buildRow(
    revenuePeriodId: number,
    signal: BookEngagementSignal,
  ): Promise<UpsertBookEngagementRepoInput | null> {
    const book: BookEntity = await this.bookService.getBookById(signal.bookId);
    if (book.layoutType === null || book.layoutType !== signal.layoutType) {
      return null;
    }
    const categoryWeight: number = BookEngagementService.resolveCategoryWeight(book.categories);
    const durations = BookEngagementService.resolveDurationBuckets(signal);
    return {
      revenuePeriodId,
      bookId: book.id,
      layoutType: signal.layoutType,
      activeReadingMs: durations.activeReadingMs,
      activeSpreadMs: durations.activeSpreadMs,
      visualSceneTimeMs: durations.visualSceneTimeMs,
      categoryWeight,
      weightedEngagement: computeWeightedEngagementMinutes({
        engagementMs: durations.engagementMs,
        categoryWeight,
      }),
    };
  }

  private static resolveDurationBuckets(signal: BookEngagementSignal): {
    readonly activeReadingMs: number;
    readonly activeSpreadMs: number;
    readonly visualSceneTimeMs: number;
    readonly engagementMs: number;
  } {
    if (signal.layoutType === BookLayoutType.REFLOWABLE) {
      return {
        activeReadingMs: signal.activeDurationMs,
        activeSpreadMs: 0,
        visualSceneTimeMs: 0,
        engagementMs: signal.activeDurationMs,
      };
    }
    return {
      activeReadingMs: 0,
      activeSpreadMs: signal.activeDurationMs,
      visualSceneTimeMs: signal.visualSceneTimeMs,
      engagementMs: signal.activeDurationMs,
    };
  }

  private static resolveCategoryWeight(categories?: CategoryEntity[]): number {
    if (categories === undefined || categories.length === 0) {
      return DEFAULT_CATEGORY_WEIGHT;
    }
    const totalWeight: number = categories.reduce(
      (sum: number, category: CategoryEntity) => sum + category.categoryWeight,
      0,
    );
    return totalWeight / categories.length;
  }
}
