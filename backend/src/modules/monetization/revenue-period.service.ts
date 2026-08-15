import { Injectable } from '@nestjs/common';

import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { MonetizationConfigService } from '@/config/monetization/monetization-config.service';
import { PLATFORM_CUT_PERCENT_BOUNDS } from '@/modules/monetization/consts/platform-cut-percent-bounds.constant';
import { RevenuePeriodPage } from '@/modules/monetization/defs/revenue-period-repository.defs';
import {
  CreateRevenuePeriodServiceInput,
  ListRevenuePeriodsServiceInput,
  UpdateRevenuePeriodServiceInput,
} from '@/modules/monetization/defs/revenue-period-service.defs';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { PlatformCutPercentInvalidException } from '@/modules/monetization/exceptions/platform-cut-percent-invalid.exception';
import { RevenuePeriodAlreadyClosedException } from '@/modules/monetization/exceptions/revenue-period-already-closed.exception';
import { RevenuePeriodPoolAmountInvalidException } from '@/modules/monetization/exceptions/revenue-period-pool-amount-invalid.exception';
import { RevenuePeriodRangeInvalidException } from '@/modules/monetization/exceptions/revenue-period-range-invalid.exception';
import { RevenuePeriodStartsAtConflictException } from '@/modules/monetization/exceptions/revenue-period-starts-at-conflict.exception';
import { RevenuePeriodRepository } from '@/modules/monetization/repository/revenue-period.repository';
import { resolveUtcMonthBounds } from '@/modules/monetization/utc-month-bounds.helper';

@Injectable()
export class RevenuePeriodService {
  constructor(
    private readonly revenuePeriodRepository: RevenuePeriodRepository,
    private readonly monetizationConfigService: MonetizationConfigService,
  ) {}

  async createRevenuePeriod(input: CreateRevenuePeriodServiceInput): Promise<RevenuePeriodEntity> {
    const platformCutPercent: number = RevenuePeriodService.normalizePlatformCutPercent(
      input.platformCutPercent ?? this.monetizationConfigService.platformCutPercent,
    );
    const poolAmountCents: number | null = input.poolAmountCents ?? null;
    RevenuePeriodService.assertValidRange(input.startsAt, input.endsAt);
    RevenuePeriodService.assertValidPoolAmount(poolAmountCents);
    await this.assertStartsAtIsAvailable(input.startsAt);
    return this.revenuePeriodRepository.create({
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: RevenuePeriodStatus.OPEN,
      platformCutPercent,
      poolAmountCents,
    });
  }

  async updateRevenuePeriod(input: UpdateRevenuePeriodServiceInput): Promise<RevenuePeriodEntity> {
    const current: RevenuePeriodEntity = await this.getRevenuePeriodById(input.id);
    const platformCutPercent: number = RevenuePeriodService.resolveUpdatedCut(input, current);
    const poolAmountCents: number | null =
      input.poolAmountCents !== undefined ? input.poolAmountCents : current.poolAmountCents;
    RevenuePeriodService.assertValidPoolAmount(poolAmountCents);
    if (
      platformCutPercent === current.platformCutPercent &&
      poolAmountCents === current.poolAmountCents
    ) {
      return current;
    }
    return this.revenuePeriodRepository.update({
      id: current.id,
      platformCutPercent,
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

  private static resolveUpdatedCut(
    input: UpdateRevenuePeriodServiceInput,
    current: RevenuePeriodEntity,
  ): number {
    if (input.platformCutPercent === undefined) {
      return current.platformCutPercent;
    }
    if (current.status === RevenuePeriodStatus.CLOSED) {
      throw new RevenuePeriodAlreadyClosedException();
    }
    return RevenuePeriodService.normalizePlatformCutPercent(input.platformCutPercent);
  }

  private static normalizePlatformCutPercent(value: number): number {
    if (
      !Number.isFinite(value) ||
      value < PLATFORM_CUT_PERCENT_BOUNDS.min ||
      value > PLATFORM_CUT_PERCENT_BOUNDS.max
    ) {
      throw new PlatformCutPercentInvalidException();
    }
    const factor: number = 10 ** PLATFORM_CUT_PERCENT_BOUNDS.decimalPlaces;
    return Math.round(value * factor) / factor;
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
