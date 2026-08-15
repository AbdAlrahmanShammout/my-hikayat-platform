import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { TransactionContext } from '@/common/base/transaction-context';
import {
  CreateSubscriptionRepoInput,
  ListSubscriptionsRepoInput,
  SubscriptionPage,
  UpdateSubscriptionRepoInput,
} from '@/modules/subscription/defs/subscription-repository.defs';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { SubscriptionMapper } from '@/modules/subscription/mapper/subscription.mapper';
import { SubscriptionRepository } from '@/modules/subscription/repository/subscription.repository';
import { subscriptionDetailsInclude } from '@/modules/subscription/types/subscription-details.include';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';
import { resolvePrismaTransactionClient } from '@/providers/database/prisma/prisma-transaction-runner';

@Injectable()
export class SubscriptionPrismaRepository implements SubscriptionRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async create(
    input: CreateSubscriptionRepoInput,
    context?: TransactionContext,
  ): Promise<SubscriptionEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const result = await client.subscription.create({
      data: {
        user: { connect: { id: input.userId } },
        plan: { connect: { id: input.planId } },
        status: input.status,
        startedAt: input.startedAt,
        currentPeriodStart: input.currentPeriodStart,
        currentPeriodEnd: input.currentPeriodEnd,
        stripeCustomerId: input.stripeCustomerId ?? null,
        stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      },
      include: subscriptionDetailsInclude,
    });
    return SubscriptionMapper.toEntity(result);
  }

  async update(
    input: UpdateSubscriptionRepoInput,
    context?: TransactionContext,
  ): Promise<SubscriptionEntity> {
    const client = resolvePrismaTransactionClient(this.prismaProviderService, context);
    const data: Prisma.SubscriptionUncheckedUpdateInput = {};
    if (input.planId !== undefined) {
      data.planId = input.planId;
    }
    if (input.status !== undefined) {
      data.status = input.status;
    }
    if (input.currentPeriodStart !== undefined) {
      data.currentPeriodStart = input.currentPeriodStart;
    }
    if (input.currentPeriodEnd !== undefined) {
      data.currentPeriodEnd = input.currentPeriodEnd;
    }
    if (input.canceledAt !== undefined) {
      data.canceledAt = input.canceledAt;
    }
    if (input.stripeCustomerId !== undefined) {
      data.stripeCustomerId = input.stripeCustomerId;
    }
    if (input.stripeSubscriptionId !== undefined) {
      data.stripeSubscriptionId = input.stripeSubscriptionId;
    }
    const result = await client.subscription.update({
      where: { id: input.id },
      data,
      include: subscriptionDetailsInclude,
    });
    return SubscriptionMapper.toEntity(result);
  }

  async findById(id: number): Promise<SubscriptionEntity | null> {
    const result = await this.prismaProviderService.subscription.findFirst({
      where: { id, deletedAt: null },
      include: subscriptionDetailsInclude,
    });
    if (result === null) {
      return null;
    }
    return SubscriptionMapper.toEntity(result);
  }

  async findByUserId(userId: number): Promise<SubscriptionEntity | null> {
    const result = await this.prismaProviderService.subscription.findFirst({
      where: { userId, deletedAt: null },
      include: subscriptionDetailsInclude,
    });
    if (result === null) {
      return null;
    }
    return SubscriptionMapper.toEntity(result);
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<SubscriptionEntity | null> {
    const result = await this.prismaProviderService.subscription.findFirst({
      where: { stripeCustomerId, deletedAt: null },
      include: subscriptionDetailsInclude,
    });
    if (result === null) {
      return null;
    }
    return SubscriptionMapper.toEntity(result);
  }

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<SubscriptionEntity | null> {
    const result = await this.prismaProviderService.subscription.findFirst({
      where: { stripeSubscriptionId, deletedAt: null },
      include: subscriptionDetailsInclude,
    });
    if (result === null) {
      return null;
    }
    return SubscriptionMapper.toEntity(result);
  }

  async list(input: ListSubscriptionsRepoInput): Promise<SubscriptionPage> {
    const where: Prisma.SubscriptionWhereInput = { deletedAt: null };
    if (input.userId !== undefined) {
      where.userId = input.userId;
    }
    if (input.status !== undefined) {
      where.status = input.status;
    }
    const [rows, total] = await this.prismaProviderService.$transaction([
      this.prismaProviderService.subscription.findMany({
        where,
        include: subscriptionDetailsInclude,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.subscription.count({ where }),
    ]);
    return {
      entities: rows.map((row) => SubscriptionMapper.toEntity(row)),
      total,
    };
  }
}
