import { Injectable } from '@nestjs/common';

import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { PlanPage } from '@/modules/subscription/defs/plan-repository.defs';
import {
  CreatePlanServiceInput,
  ListPlansServiceInput,
  UpdatePlanServiceInput,
} from '@/modules/subscription/defs/plan-service.defs';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';
import { PlanKindConflictException } from '@/modules/subscription/exceptions/plan-kind-conflict.exception';
import { PlanNotPurchasableException } from '@/modules/subscription/exceptions/plan-not-purchasable.exception';
import { PlanSlugConflictException } from '@/modules/subscription/exceptions/plan-slug-conflict.exception';
import { PlanStripePriceConflictException } from '@/modules/subscription/exceptions/plan-stripe-price-conflict.exception';
import { PlanRepository } from '@/modules/subscription/repository/plan.repository';
import type { StripePrice } from '@/providers/stripe/defs/stripe-manager.defs';
import { StripeManagerService } from '@/providers/stripe/stripe-manager.service';

@Injectable()
export class PlanService {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly stripeManagerService: StripeManagerService,
  ) {}

  async createPlan(input: CreatePlanServiceInput): Promise<PlanEntity> {
    const name: string = PlanService.normalizeName(input.name);
    const description: string = PlanService.normalizeDescription(input.description);
    PlanService.assertValidName(name);
    PlanService.assertValidDescription(description);
    const slug: string = PlanService.normalizeSlug(input.slug ?? name);
    PlanService.assertValidSlug(slug);
    await this.assertSlugIsAvailable(slug);
    if (input.kind === PlanKind.FREE) {
      await this.assertFreeKindIsAvailable();
      PlanService.assertFreePlanHasNoStripePrice(input.stripePriceId);
      return this.planRepository.create({
        slug,
        name,
        description,
        kind: PlanKind.FREE,
        interval: null,
        stripePriceId: null,
        amountCents: null,
        currency: null,
      });
    }
    const stripePriceId: string = PlanService.requireStripePriceId(input.stripePriceId);
    await this.assertStripePriceIsAvailable(stripePriceId);
    const stripePrice: StripePrice = await this.stripeManagerService.retrievePrice({
      priceId: stripePriceId,
    });
    const interval: PlanInterval = PlanService.mapStripeInterval(stripePrice.interval);
    return this.planRepository.create({
      slug,
      name,
      description,
      kind: PlanKind.MONTHLY_PAID,
      interval,
      stripePriceId,
      amountCents: stripePrice.amountCents,
      currency: stripePrice.currency,
    });
  }

  async updatePlan(input: UpdatePlanServiceInput): Promise<PlanEntity> {
    const current: PlanEntity = await this.getPlanById(input.id);
    const name: string =
      input.name === undefined ? current.name : PlanService.normalizeName(input.name);
    const description: string =
      input.description === undefined
        ? current.description
        : PlanService.normalizeDescription(input.description);
    PlanService.assertValidName(name);
    PlanService.assertValidDescription(description);
    if (current.kind === PlanKind.FREE) {
      if (input.stripePriceId !== undefined && input.stripePriceId !== null) {
        throw new InvalidStateException({
          message: 'Free plans must not have a Stripe price',
          code: 'PLAN_INVALID_STRIPE_PRICE',
        });
      }
      return this.planRepository.update({
        id: current.id,
        name,
        description,
      });
    }
    if (input.stripePriceId === undefined) {
      return this.planRepository.update({
        id: current.id,
        name,
        description,
      });
    }
    const stripePriceId: string = PlanService.requireStripePriceId(input.stripePriceId);
    if (stripePriceId !== current.stripePriceId) {
      await this.assertStripePriceIsAvailable(stripePriceId);
    }
    const stripePrice: StripePrice = await this.stripeManagerService.retrievePrice({
      priceId: stripePriceId,
    });
    return this.planRepository.update({
      id: current.id,
      name,
      description,
      interval: PlanService.mapStripeInterval(stripePrice.interval),
      stripePriceId,
      amountCents: stripePrice.amountCents,
      currency: stripePrice.currency,
    });
  }

  async listPlans(input: ListPlansServiceInput = {}): Promise<PlanPage> {
    return this.planRepository.list({
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
      kind: input.kind,
    });
  }

  async listPaidCatalogPlans(input: ListPlansServiceInput = {}): Promise<PlanPage> {
    return this.listPlans({
      ...input,
      kind: PlanKind.MONTHLY_PAID,
    });
  }

  async findPlanById(id: number): Promise<PlanEntity | null> {
    return this.planRepository.findById(id);
  }

  async getPlanById(id: number): Promise<PlanEntity> {
    const plan: PlanEntity | null = await this.findPlanById(id);
    if (plan === null) {
      throw new ResourceNotFoundException('Plan', id);
    }
    return plan;
  }

  async findPlanBySlug(slug: string): Promise<PlanEntity | null> {
    return this.planRepository.findBySlug(PlanService.normalizeSlug(slug));
  }

  async getPlanBySlug(slug: string): Promise<PlanEntity> {
    const normalizedSlug: string = PlanService.normalizeSlug(slug);
    const plan: PlanEntity | null = await this.findPlanBySlug(normalizedSlug);
    if (plan === null) {
      throw new ResourceNotFoundException('Plan', normalizedSlug);
    }
    return plan;
  }

  async getPurchasablePlanById(id: number): Promise<PlanEntity> {
    const plan: PlanEntity = await this.getPlanById(id);
    if (plan.kind !== PlanKind.MONTHLY_PAID || plan.stripePriceId === null) {
      throw new PlanNotPurchasableException();
    }
    return plan;
  }

  private async assertSlugIsAvailable(slug: string): Promise<void> {
    const existing: PlanEntity | null = await this.planRepository.findBySlug(slug);
    if (existing !== null) {
      throw new PlanSlugConflictException(slug);
    }
  }

  private async assertFreeKindIsAvailable(): Promise<void> {
    const existing: PlanEntity | null = await this.planRepository.findByKind(PlanKind.FREE);
    if (existing !== null) {
      throw new PlanKindConflictException(PlanKind.FREE);
    }
  }

  private async assertStripePriceIsAvailable(stripePriceId: string): Promise<void> {
    const existing: PlanEntity | null =
      await this.planRepository.findByStripePriceId(stripePriceId);
    if (existing !== null) {
      throw new PlanStripePriceConflictException(stripePriceId);
    }
  }

  private static normalizeName(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  private static normalizeDescription(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  private static normalizeSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private static assertValidName(name: string): void {
    if (name.length === 0) {
      throw new InvalidStateException({
        message: 'Plan name must not be empty',
        code: 'PLAN_INVALID_NAME',
      });
    }
  }

  private static assertValidDescription(description: string): void {
    if (description.length === 0) {
      throw new InvalidStateException({
        message: 'Plan description must not be empty',
        code: 'PLAN_INVALID_DESCRIPTION',
      });
    }
  }

  private static assertValidSlug(slug: string): void {
    if (slug.length === 0) {
      throw new InvalidStateException({
        message: 'Plan slug must not be empty',
        code: 'PLAN_INVALID_SLUG',
      });
    }
  }

  private static assertFreePlanHasNoStripePrice(stripePriceId: string | null | undefined): void {
    if (stripePriceId !== undefined && stripePriceId !== null && stripePriceId.trim().length > 0) {
      throw new InvalidStateException({
        message: 'Free plans must not have a Stripe price',
        code: 'PLAN_INVALID_STRIPE_PRICE',
      });
    }
  }

  private static requireStripePriceId(stripePriceId: string | null | undefined): string {
    if (stripePriceId === undefined || stripePriceId === null) {
      throw new InvalidStateException({
        message: 'Paid plans require a Stripe price id',
        code: 'PLAN_INVALID_STRIPE_PRICE',
      });
    }
    const trimmed: string = stripePriceId.trim();
    if (trimmed.length === 0) {
      throw new InvalidStateException({
        message: 'Paid plans require a Stripe price id',
        code: 'PLAN_INVALID_STRIPE_PRICE',
      });
    }
    return trimmed;
  }

  private static mapStripeInterval(interval: 'month' | 'year'): PlanInterval {
    if (interval !== 'month') {
      throw new InvalidStateException({
        message: 'Paid plans must use a monthly Stripe price',
        code: 'PLAN_INVALID_INTERVAL',
      });
    }
    return PlanInterval.MONTH;
  }
}
