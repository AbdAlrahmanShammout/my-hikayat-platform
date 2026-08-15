import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  CreateRevenuePeriodRepoInput,
  ListRevenuePeriodsRepoInput,
  RevenuePeriodPage,
  UpdateRevenuePeriodRepoInput,
} from '@/modules/monetization/defs/revenue-period-repository.defs';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { RevenuePeriodMapper } from '@/modules/monetization/mapper/revenue-period.mapper';
import { RevenuePeriodRepository } from '@/modules/monetization/repository/revenue-period.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class RevenuePeriodPrismaRepository implements RevenuePeriodRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async create(
    input: CreateRevenuePeriodRepoInput,
    context?: TransactionContext,
  ): Promise<RevenuePeriodEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.revenuePeriod.create({
      data: {
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        status: input.status,
        platformCutPercent: input.platformCutPercent,
        poolAmountCents: input.poolAmountCents,
      },
    });
    return RevenuePeriodMapper.toEntity(result);
  }

  async update(
    input: UpdateRevenuePeriodRepoInput,
    context?: TransactionContext,
  ): Promise<RevenuePeriodEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const data: Prisma.RevenuePeriodUncheckedUpdateInput = {};
    if (input.status !== undefined) {
      data.status = input.status;
    }
    if (input.platformCutPercent !== undefined) {
      data.platformCutPercent = input.platformCutPercent;
    }
    if (input.poolAmountCents !== undefined) {
      data.poolAmountCents = input.poolAmountCents;
    }
    const result = await client.revenuePeriod.update({
      where: { id: input.id },
      data,
    });
    return RevenuePeriodMapper.toEntity(result);
  }

  async findById(id: number): Promise<RevenuePeriodEntity | null> {
    const result = await this.prismaProviderService.revenuePeriod.findFirst({
      where: { id, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return RevenuePeriodMapper.toEntity(result);
  }

  async findByStartsAt(startsAt: Date): Promise<RevenuePeriodEntity | null> {
    const result = await this.prismaProviderService.revenuePeriod.findFirst({
      where: { startsAt, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return RevenuePeriodMapper.toEntity(result);
  }

  async findOpen(): Promise<RevenuePeriodEntity | null> {
    const result = await this.prismaProviderService.revenuePeriod.findFirst({
      where: { status: RevenuePeriodStatus.OPEN, deletedAt: null },
      orderBy: [{ startsAt: 'desc' }, { id: 'desc' }],
    });
    if (result === null) {
      return null;
    }
    return RevenuePeriodMapper.toEntity(result);
  }

  async findOpenElapsed(endsAtOnOrBefore: Date): Promise<RevenuePeriodEntity[]> {
    const rows = await this.prismaProviderService.revenuePeriod.findMany({
      where: {
        status: RevenuePeriodStatus.OPEN,
        deletedAt: null,
        endsAt: { lte: endsAtOnOrBefore },
      },
      orderBy: [{ startsAt: 'asc' }, { id: 'asc' }],
    });
    return rows.map((row) => RevenuePeriodMapper.toEntity(row));
  }

  async list(input: ListRevenuePeriodsRepoInput): Promise<RevenuePeriodPage> {
    const where = { deletedAt: null };
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.revenuePeriod.findMany({
        where,
        orderBy: [{ startsAt: 'desc' }, { id: 'desc' }],
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.revenuePeriod.count({ where }),
    ]);
    return {
      entities: rows.map((row) => RevenuePeriodMapper.toEntity(row)),
      total,
    };
  }
}
