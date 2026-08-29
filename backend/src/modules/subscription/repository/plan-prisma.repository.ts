import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  CreatePlanRepoInput,
  ListPlansRepoInput,
  PlanPage,
  UpdatePlanRepoInput,
} from '@/modules/subscription/defs/plan-repository.defs';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { PlanKind } from '@/modules/subscription/enum/general.enum';
import { PlanMapper } from '@/modules/subscription/mapper/plan.mapper';
import { PlanRepository } from '@/modules/subscription/repository/plan.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class PlanPrismaRepository implements PlanRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async create(input: CreatePlanRepoInput, context?: TransactionContext): Promise<PlanEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.plan.create({
      data: {
        slug: input.slug,
        name: input.name,
        description: input.description,
        kind: input.kind,
        interval: input.interval,
        stripePriceId: input.stripePriceId,
        amountCents: input.amountCents,
        currency: input.currency,
      },
    });
    return PlanMapper.toEntity(result);
  }

  async update(input: UpdatePlanRepoInput, context?: TransactionContext): Promise<PlanEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.plan.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        interval: input.interval,
        stripePriceId: input.stripePriceId,
        amountCents: input.amountCents,
        currency: input.currency,
      },
    });
    return PlanMapper.toEntity(result);
  }

  async findById(id: number): Promise<PlanEntity | null> {
    const result = await this.prismaProviderService.plan.findFirst({
      where: { id, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return PlanMapper.toEntity(result);
  }

  async findBySlug(slug: string): Promise<PlanEntity | null> {
    const result = await this.prismaProviderService.plan.findFirst({
      where: { slug, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return PlanMapper.toEntity(result);
  }

  async findByKind(kind: PlanKind): Promise<PlanEntity | null> {
    const result = await this.prismaProviderService.plan.findFirst({
      where: { kind, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return PlanMapper.toEntity(result);
  }

  async findByStripePriceId(stripePriceId: string): Promise<PlanEntity | null> {
    const result = await this.prismaProviderService.plan.findFirst({
      where: { stripePriceId, deletedAt: null },
    });
    if (result === null) {
      return null;
    }
    return PlanMapper.toEntity(result);
  }

  async list(input: ListPlansRepoInput): Promise<PlanPage> {
    const where = {
      deletedAt: null,
      ...(input.kind === undefined ? {} : { kind: input.kind }),
    };
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.plan.findMany({
        where,
        orderBy: [{ slug: 'asc' }, { id: 'asc' }],
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.plan.count({ where }),
    ]);
    return {
      entities: rows.map((row) => PlanMapper.toEntity(row)),
      total,
    };
  }
}
