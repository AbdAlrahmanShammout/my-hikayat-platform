import { Injectable } from '@nestjs/common';

import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { RevenuePeriodPage } from '@/modules/monetization/defs/revenue-period-repository.defs';
import {
  CreateRevenuePeriodServiceInput,
  ListRevenuePeriodsServiceInput,
  UpdateRevenuePeriodServiceInput,
} from '@/modules/monetization/defs/revenue-period-service.defs';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { RevenuePeriodPoolAmountInvalidException } from '@/modules/monetization/exceptions/revenue-period-pool-amount-invalid.exception';
import { RevenuePeriodRangeInvalidException } from '@/modules/monetization/exceptions/revenue-period-range-invalid.exception';
import { RevenuePeriodStartsAtConflictException } from '@/modules/monetization/exceptions/revenue-period-starts-at-conflict.exception';
import { RevenuePeriodRepository } from '@/modules/monetization/repository/revenue-period.repository';
import { resolveUtcMonthBounds } from '@/modules/monetization/utc-month-bounds.helper';

@Injectable()
export class RevenuePeriodService {
  constructor(private readonly revenuePeriodRepository: RevenuePeriodRepository) {}

  async createRevenuePeriod(input: CreateRevenuePeriodServiceInput): Promise<RevenuePeriodEntity> {
    RevenuePeriodService.assertValidRange(input.startsAt, input.endsAt);
    await this.assertStartsAtIsAvailable(input.startsAt);
    return this.revenuePeriodRepository.create({
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: RevenuePeriodStatus.OPEN,
      poolAmountCents: null,
    });
  }

  async updateRevenuePeriod(input: UpdateRevenuePeriodServiceInput): Promise<RevenuePeriodEntity> {
    const current: RevenuePeriodEntity = await this.getRevenuePeriodById(input.id);
    const poolAmountCents: number | null =
      input.poolAmountCents !== undefined ? input.poolAmountCents : current.poolAmountCents;
    RevenuePeriodService.assertValidPoolAmount(poolAmountCents);
    if (poolAmountCents === current.poolAmountCents) {
      return current;
    }
    return this.revenuePeriodRepository.update({
      id: current.id,
      poolAmountCents,
    });
  }

  async closeRevenuePeriod(id: number): Promise<RevenuePeriodEntity> {
    const current: RevenuePeriodEntity = await this.getRevenuePeriodById(id);
    if (current.status === RevenuePeriodStatus.CLOSED) {
      return current;
    }
    return this.revenuePeriodRepository.update({
      id: current.id,
      status: RevenuePeriodStatus.CLOSED,
    });
  }

  async ensureCurrentPeriod(at: Date = new Date()): Promise<RevenuePeriodEntity> {
    await this.closeElapsedOpenPeriods(at);
    const bounds = resolveUtcMonthBounds(at);
    const existing: RevenuePeriodEntity | null = await this.revenuePeriodRepository.findByStartsAt(
      bounds.startsAt,
    );
    if (existing !== null) {
      return existing;
    }
    return this.createRevenuePeriod({
      startsAt: bounds.startsAt,
      endsAt: bounds.endsAt,
    });
  }

  async listRevenuePeriods(input: ListRevenuePeriodsServiceInput = {}): Promise<RevenuePeriodPage> {
    return this.revenuePeriodRepository.list({
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
    });
  }

  async findRevenuePeriodById(id: number): Promise<RevenuePeriodEntity | null> {
    return this.revenuePeriodRepository.findById(id);
  }

  async getRevenuePeriodById(id: number): Promise<RevenuePeriodEntity> {
    const period: RevenuePeriodEntity | null = await this.findRevenuePeriodById(id);
    if (period === null) {
      throw new ResourceNotFoundException('RevenuePeriod', id);
    }
    return period;
  }

  async findCurrentRevenuePeriod(): Promise<RevenuePeriodEntity | null> {
    return this.revenuePeriodRepository.findOpen();
  }

  async getCurrentRevenuePeriod(): Promise<RevenuePeriodEntity> {
    const period: RevenuePeriodEntity | null = await this.findCurrentRevenuePeriod();
    if (period === null) {
      throw new ResourceNotFoundException('RevenuePeriod', 'current');
    }
    return period;
  }

  private async closeElapsedOpenPeriods(at: Date): Promise<void> {
    const elapsed: RevenuePeriodEntity[] = await this.revenuePeriodRepository.findOpenElapsed(at);
    for (const period of elapsed) {
      await this.closeRevenuePeriod(period.id);
    }
  }

  private async assertStartsAtIsAvailable(startsAt: Date): Promise<void> {
    const existing: RevenuePeriodEntity | null =
      await this.revenuePeriodRepository.findByStartsAt(startsAt);
    if (existing !== null) {
      throw new RevenuePeriodStartsAtConflictException(startsAt);
    }
  }

  private static assertValidRange(startsAt: Date, endsAt: Date): void {
    if (
      Number.isNaN(startsAt.getTime()) ||
      Number.isNaN(endsAt.getTime()) ||
      endsAt.getTime() <= startsAt.getTime()
    ) {
      throw new RevenuePeriodRangeInvalidException();
    }
  }

  private static assertValidPoolAmount(poolAmountCents: number | null): void {
    if (poolAmountCents === null) {
      return;
    }
    if (!Number.isInteger(poolAmountCents) || poolAmountCents < 0) {
      throw new RevenuePeriodPoolAmountInvalidException();
    }
  }
}
