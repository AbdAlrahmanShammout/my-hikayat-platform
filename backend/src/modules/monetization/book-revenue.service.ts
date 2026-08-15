import { Injectable } from '@nestjs/common';

import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { allocateCentsByWeights } from '@/modules/monetization/allocate-cents.helper';
import { BookEngagementService } from '@/modules/monetization/book-engagement.service';
import {
  BookRevenuePage,
  UpsertBookRevenueRepoInput,
} from '@/modules/monetization/defs/book-revenue-repository.defs';
import {
  CalculatePeriodRevenueServiceInput,
  FindBookRevenueByPeriodAndBookServiceInput,
  ListBookRevenuesServiceInput,
  SumAuthorCentsServiceInput,
} from '@/modules/monetization/defs/book-revenue-service.defs';
import { BookEngagementEntity } from '@/modules/monetization/entity/book-engagement.entity';
import { BookRevenueEntity } from '@/modules/monetization/entity/book-revenue.entity';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodPoolAmountMissingException } from '@/modules/monetization/exceptions/revenue-period-pool-amount-missing.exception';
import { computePlatformCutCents } from '@/modules/monetization/platform-cut-cents.helper';
import { BookRevenueRepository } from '@/modules/monetization/repository/book-revenue.repository';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';

@Injectable()
export class BookRevenueService {
  constructor(
    private readonly bookRevenueRepository: BookRevenueRepository,
    private readonly revenuePeriodService: RevenuePeriodService,
    private readonly bookEngagementService: BookEngagementService,
    private readonly bookService: BookService,
  ) {}

  async calculatePeriodRevenue(
    input: CalculatePeriodRevenueServiceInput,
  ): Promise<BookRevenueEntity[]> {
    const period: RevenuePeriodEntity = await this.revenuePeriodService.getRevenuePeriodById(
      input.revenuePeriodId,
    );
    const poolAmountCents: number = BookRevenueService.requirePoolAmount(period.poolAmountCents);
    await this.bookEngagementService.aggregatePeriodEngagement({
      revenuePeriodId: period.id,
    });
    const engagements: BookEngagementEntity[] =
      await this.bookEngagementService.listAllBookEngagementsForPeriod(period.id);
    const rows: UpsertBookRevenueRepoInput[] = await this.buildRows(
      period,
      poolAmountCents,
      engagements,
    );
    return this.bookRevenueRepository.replaceForPeriod({
      revenuePeriodId: period.id,
      rows,
    });
  }

  async listBookRevenues(input: ListBookRevenuesServiceInput): Promise<BookRevenuePage> {
    await this.revenuePeriodService.getRevenuePeriodById(input.revenuePeriodId);
    return this.bookRevenueRepository.list({
      revenuePeriodId: input.revenuePeriodId,
      ownerId: input.ownerId,
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
    });
  }

  async findBookRevenueById(id: number): Promise<BookRevenueEntity | null> {
    return this.bookRevenueRepository.findById(id);
  }

  async getBookRevenueById(id: number): Promise<BookRevenueEntity> {
    const revenue: BookRevenueEntity | null = await this.findBookRevenueById(id);
    if (revenue === null) {
      throw new ResourceNotFoundException('BookRevenue', id);
    }
    return revenue;
  }

  async findBookRevenueByPeriodAndBook(
    input: FindBookRevenueByPeriodAndBookServiceInput,
  ): Promise<BookRevenueEntity | null> {
    return this.bookRevenueRepository.findByPeriodAndBook(input.revenuePeriodId, input.bookId);
  }

  async getBookRevenueByPeriodAndBook(
    input: FindBookRevenueByPeriodAndBookServiceInput,
  ): Promise<BookRevenueEntity> {
    const revenue: BookRevenueEntity | null = await this.findBookRevenueByPeriodAndBook(input);
    if (revenue === null) {
      throw new ResourceNotFoundException(
        'BookRevenue',
        `${input.revenuePeriodId}:${input.bookId}`,
      );
    }
    return revenue;
  }

  async sumAuthorCentsForPeriod(input: SumAuthorCentsServiceInput): Promise<number> {
    await this.revenuePeriodService.getRevenuePeriodById(input.revenuePeriodId);
    return this.bookRevenueRepository.sumAuthorCents({
      revenuePeriodId: input.revenuePeriodId,
      ownerId: input.ownerId,
    });
  }

  private async buildRows(
    period: RevenuePeriodEntity,
    poolAmountCents: number,
    engagements: BookEngagementEntity[],
  ): Promise<UpsertBookRevenueRepoInput[]> {
    const weights: number[] = engagements.map((row) => row.weightedEngagement);
    const platformCutTotalCents: number = computePlatformCutCents({
      poolAmountCents,
      platformCutPercent: period.platformCutPercent,
    });
    const authorCents: number[] = allocateCentsByWeights({
      weights,
      totalCents: poolAmountCents - platformCutTotalCents,
    });
    const platformCutCents: number[] = allocateCentsByWeights({
      weights,
      totalCents: platformCutTotalCents,
    });
    return this.mapRows(period.id, engagements, authorCents, platformCutCents);
  }

  private async mapRows(
    revenuePeriodId: number,
    engagements: BookEngagementEntity[],
    authorCents: number[],
    platformCutCents: number[],
  ): Promise<UpsertBookRevenueRepoInput[]> {
    const rows: UpsertBookRevenueRepoInput[] = [];
    for (let i = 0; i < engagements.length; i += 1) {
      const book: BookEntity = await this.bookService.getBookById(engagements[i].bookId);
      rows.push({
        revenuePeriodId,
        bookId: book.id,
        ownerId: book.ownerId,
        weightedEngagement: engagements[i].weightedEngagement,
        authorCents: authorCents[i],
        platformCutCents: platformCutCents[i],
        poolShareCents: authorCents[i] + platformCutCents[i],
      });
    }
    return rows;
  }

  private static requirePoolAmount(poolAmountCents: number | null): number {
    if (poolAmountCents === null) {
      throw new RevenuePeriodPoolAmountMissingException();
    }
    return poolAmountCents;
  }
}
