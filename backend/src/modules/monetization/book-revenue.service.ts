import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { TransactionRunner } from '@/common/base/transaction-runner';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
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
import { BookRevenueEntity } from '@/modules/monetization/entity/book-revenue.entity';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodCalculationTooEarlyException } from '@/modules/monetization/exceptions/revenue-period-calculation-too-early.exception';
import {
  PUBLISHERS_SHARE_PERCENT,
  REVENUE_CALCULATION_DELAY_MS,
} from '@/modules/monetization/consts/publishers-share-percent.constant';
import { PERCENT_SCALE } from '@/modules/monetization/consts/percent-scale.constant';
import { BookRevenueRepository } from '@/modules/monetization/repository/book-revenue.repository';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';
import { BookReadingCycleService } from '@/modules/reading-completion/book-reading-cycle.service';
import { CompletedReadCountRow } from '@/modules/reading-completion/repository/book-reading-cycle.repository';
import { StripeManagerService } from '@/providers/stripe/stripe-manager.service';

@Injectable()
export class BookRevenueService {
  constructor(
    private readonly bookRevenueRepository: BookRevenueRepository,
    private readonly revenuePeriodService: RevenuePeriodService,
    private readonly bookEngagementService: BookEngagementService,
    private readonly bookReadingCycleService: BookReadingCycleService,
    private readonly bookService: BookService,
    private readonly auditLogService: AuditLogService,
    private readonly transactionRunner: TransactionRunner,
    private readonly stripeManagerService: StripeManagerService,
  ) {}

  async calculatePeriodRevenue(
    input: CalculatePeriodRevenueServiceInput,
  ): Promise<BookRevenueEntity[]> {
    const period: RevenuePeriodEntity = await this.revenuePeriodService.getRevenuePeriodById(
      input.revenuePeriodId,
    );
    BookRevenueService.assertCalculationWindow(period, input.calculatedAt ?? new Date());
    const stripeNetCents: number | null = await this.stripeManagerService.summarizeSubscriptionNetCents({
      startsAt: period.startsAt,
      endsAt: period.endsAt,
    });
    const poolAmountCents: number = stripeNetCents ?? 0;
    await this.revenuePeriodService.updateRevenuePeriod({
      id: period.id,
      poolAmountCents,
    });
    await this.bookEngagementService.aggregatePeriodEngagement({
      revenuePeriodId: period.id,
    });
    const counts: CompletedReadCountRow[] = await this.bookReadingCycleService.listCompletedReadCounts({
      startsAt: period.startsAt,
      endsAt: period.endsAt,
    });
    const rows: UpsertBookRevenueRepoInput[] = await this.buildRows(period.id, poolAmountCents, counts);
    return this.transactionRunner.run(async (context: TransactionContext) => {
      const created: BookRevenueEntity[] = await this.bookRevenueRepository.replaceForPeriod(
        {
          revenuePeriodId: period.id,
          rows,
        },
        context,
      );
      await this.auditLogService.append(
        {
          actorUserId: input.actorUserId,
          action: AuditAction.REVENUE_CALCULATED,
          subjectType: AuditSubjectType.REVENUE_PERIOD,
          subjectId: period.id,
          metadata: {
            poolAmountCents,
            poolSource: 'stripe',
            publishersSharePercent: PUBLISHERS_SHARE_PERCENT,
            bookCount: rows.length,
          },
        },
        context,
      );
      return created;
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

  async sumAuthorCents(input: SumAuthorCentsServiceInput): Promise<number> {
    if (input.revenuePeriodId !== undefined) {
      await this.revenuePeriodService.getRevenuePeriodById(input.revenuePeriodId);
    }
    return this.bookRevenueRepository.sumAuthorCents({
      revenuePeriodId: input.revenuePeriodId,
      ownerId: input.ownerId,
    });
  }

  async sumAuthorCentsForPeriod(
    input: SumAuthorCentsServiceInput & { readonly revenuePeriodId: number },
  ): Promise<number> {
    return this.sumAuthorCents(input);
  }

  private async buildRows(
    revenuePeriodId: number,
    poolAmountCents: number,
    counts: readonly CompletedReadCountRow[],
  ): Promise<UpsertBookRevenueRepoInput[]> {
    const weights: number[] = counts.map((row) => row.completedReadCount);
    const publishersPoolCents: number = Math.round(
      (poolAmountCents * PUBLISHERS_SHARE_PERCENT) / PERCENT_SCALE,
    );
    const platformCutTotalCents: number = poolAmountCents - publishersPoolCents;
    const authorCents: number[] = allocateCentsByWeights({
      weights,
      totalCents: publishersPoolCents,
    });
    const platformCutCents: number[] = allocateCentsByWeights({
      weights,
      totalCents: platformCutTotalCents,
    });
    return this.mapRows(revenuePeriodId, counts, authorCents, platformCutCents);
  }

  private async mapRows(
    revenuePeriodId: number,
    counts: readonly CompletedReadCountRow[],
    authorCents: number[],
    platformCutCents: number[],
  ): Promise<UpsertBookRevenueRepoInput[]> {
    const rows: UpsertBookRevenueRepoInput[] = [];
    for (let i = 0; i < counts.length; i += 1) {
      const book: BookEntity = await this.bookService.getBookById(counts[i].bookId);
      rows.push({
        revenuePeriodId,
        bookId: book.id,
        ownerId: book.ownerId,
        completedReadCount: counts[i].completedReadCount,
        authorCents: authorCents[i],
        platformCutCents: platformCutCents[i],
        poolShareCents: authorCents[i] + platformCutCents[i],
      });
    }
    return rows;
  }

  private static assertCalculationWindow(period: RevenuePeriodEntity, calculatedAt: Date): void {
    const earliest: number = period.endsAt.getTime() + REVENUE_CALCULATION_DELAY_MS;
    if (calculatedAt.getTime() < earliest) {
      throw new RevenuePeriodCalculationTooEarlyException();
    }
  }

}
