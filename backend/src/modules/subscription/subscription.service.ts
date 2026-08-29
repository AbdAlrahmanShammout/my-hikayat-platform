import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/common/base/transaction-context';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { UserService } from '@/modules/user/user.service';
import { PLAN_SLUG } from '@/modules/subscription/consts/plan-slug.constant';
import { resolveTrialEndsAt } from '@/modules/subscription/consts/trial-window.constant';
import { SubscriptionPage } from '@/modules/subscription/defs/subscription-repository.defs';
import {
  CreateSubscriptionServiceInput,
  ListSubscriptionsServiceInput,
  UpdateSubscriptionServiceInput,
} from '@/modules/subscription/defs/subscription-service.defs';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { SubscriptionAlreadyExistsException } from '@/modules/subscription/exceptions/subscription-already-exists.exception';
import { TrialAlreadyUsedException } from '@/modules/subscription/exceptions/trial-already-used.exception';
import { TrialNotNeededException } from '@/modules/subscription/exceptions/trial-not-needed.exception';
import { hasPaidReadingEntitlement } from '@/modules/subscription/has-paid-reading-entitlement.helper';
import { hasTrialReadingEntitlement } from '@/modules/subscription/has-trial-reading-entitlement.helper';
import { PlanService } from '@/modules/subscription/plan.service';
import { SubscriptionRepository } from '@/modules/subscription/repository/subscription.repository';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly planService: PlanService,
    private readonly userService: UserService,
  ) {}

  async createSubscription(input: CreateSubscriptionServiceInput): Promise<SubscriptionEntity> {
    await this.userService.getUserById(input.userId);
    const plan: PlanEntity = await this.planService.getPlanById(input.planId);
    const existing: SubscriptionEntity | null = await this.findSubscriptionByUserId(input.userId);
    if (existing !== null) {
      throw new SubscriptionAlreadyExistsException(input.userId);
    }
    return this.subscriptionRepository.create({
      userId: input.userId,
      planId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      startedAt: new Date(),
      currentPeriodStart: input.currentPeriodStart ?? null,
      currentPeriodEnd: input.currentPeriodEnd ?? null,
    });
  }

  async ensureFreeSubscription(userId: number): Promise<SubscriptionEntity> {
    const existing: SubscriptionEntity | null = await this.findSubscriptionByUserId(userId);
    if (existing !== null) {
      return existing;
    }
    const freePlan: PlanEntity = await this.planService.getPlanBySlug(PLAN_SLUG.FREE);
    return this.createSubscription({ userId, planId: freePlan.id });
  }

  async startTrial(userId: number): Promise<SubscriptionEntity> {
    const subscription: SubscriptionEntity = await this.ensureFreeSubscription(userId);
    if (hasPaidReadingEntitlement(subscription)) {
      throw new TrialNotNeededException();
    }
    if (hasTrialReadingEntitlement(subscription)) {
      return subscription;
    }
    if (subscription.trialStartedAt !== null) {
      throw new TrialAlreadyUsedException();
    }
    const trialStartedAt: Date = new Date();
    const trialEndsAt: Date = resolveTrialEndsAt(trialStartedAt);
    const started: SubscriptionEntity | null = await this.subscriptionRepository.startTrialIfUnused({
      userId,
      trialStartedAt,
      trialEndsAt,
    });
    if (started !== null) {
      return started;
    }
    const reloaded: SubscriptionEntity = await this.getSubscriptionByUserId(userId);
    if (hasTrialReadingEntitlement(reloaded)) {
      return reloaded;
    }
    throw new TrialAlreadyUsedException();
  }

  async updateSubscription(input: UpdateSubscriptionServiceInput): Promise<SubscriptionEntity> {
    const current: SubscriptionEntity = await this.getSubscriptionById(input.id);
    if (input.planId !== undefined) {
      await this.planService.getPlanById(input.planId);
    }
    return this.subscriptionRepository.update({
      id: current.id,
      planId: input.planId,
      status: input.status,
      currentPeriodStart: input.currentPeriodStart,
      currentPeriodEnd: input.currentPeriodEnd,
      canceledAt: input.canceledAt,
      activatedAt: input.activatedAt,
      trialStartedAt: input.trialStartedAt,
      trialEndsAt: input.trialEndsAt,
      stripeCustomerId: input.stripeCustomerId,
      stripeSubscriptionId: input.stripeSubscriptionId,
    });
  }

  async cancelSubscription(id: number, context?: TransactionContext): Promise<SubscriptionEntity> {
    const current: SubscriptionEntity = await this.getSubscriptionById(id);
    if (current.status === SubscriptionStatus.CANCELED) {
      return current;
    }
    return this.subscriptionRepository.update(
      {
        id: current.id,
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
      },
      context,
    );
  }

  async listSubscriptions(input: ListSubscriptionsServiceInput = {}): Promise<SubscriptionPage> {
    return this.subscriptionRepository.list({
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
      userId: input.userId,
      status: input.status,
    });
  }

  async findSubscriptionById(id: number): Promise<SubscriptionEntity | null> {
    return this.subscriptionRepository.findById(id);
  }

  async getSubscriptionById(id: number): Promise<SubscriptionEntity> {
    const subscription: SubscriptionEntity | null = await this.findSubscriptionById(id);
    if (subscription === null) {
      throw new ResourceNotFoundException('Subscription', id);
    }
    return subscription;
  }

  async findSubscriptionByUserId(userId: number): Promise<SubscriptionEntity | null> {
    return this.subscriptionRepository.findByUserId(userId);
  }

  async getSubscriptionByUserId(userId: number): Promise<SubscriptionEntity> {
    const subscription: SubscriptionEntity | null = await this.findSubscriptionByUserId(userId);
    if (subscription === null) {
      throw new ResourceNotFoundException('Subscription', userId);
    }
    return subscription;
  }
}
