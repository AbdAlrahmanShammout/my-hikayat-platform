import { Injectable } from '@nestjs/common';

import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { PlanPage } from '@/modules/subscription/defs/plan-repository.defs';
import {
  CreatePlanServiceInput,
  ListPlansServiceInput,
} from '@/modules/subscription/defs/plan-service.defs';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';
import { PlanKindConflictException } from '@/modules/subscription/exceptions/plan-kind-conflict.exception';
import { PlanSlugConflictException } from '@/modules/subscription/exceptions/plan-slug-conflict.exception';
import { PlanRepository } from '@/modules/subscription/repository/plan.repository';

@Injectable()
export class PlanService {
  constructor(private readonly planRepository: PlanRepository) {}

  async createPlan(input: CreatePlanServiceInput): Promise<PlanEntity> {
    const slug: string = PlanService.normalizeSlug(input.slug);
    const name: string = PlanService.normalizeName(input.name);
    PlanService.assertValidSlug(slug);
    PlanService.assertValidName(name);
    const interval: PlanInterval | null = PlanService.resolveInterval(input.kind, input.interval);
    await this.assertSlugIsAvailable(slug);
    await this.assertKindIsAvailable(input.kind);
    return this.planRepository.create({
      slug,
      name,
      kind: input.kind,
      interval,
    });
  }

  async listPlans(input: ListPlansServiceInput = {}): Promise<PlanPage> {
    return this.planRepository.list({
      limit: input.limit ?? DEFAULT_PAGE_SIZE,
      offset: input.offset ?? DEFAULT_PAGE_OFFSET,
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

  private async assertSlugIsAvailable(slug: string): Promise<void> {
    const existing: PlanEntity | null = await this.planRepository.findBySlug(slug);
    if (existing !== null) {
      throw new PlanSlugConflictException(slug);
    }
  }

  private async assertKindIsAvailable(kind: PlanKind): Promise<void> {
    const existing: PlanEntity | null = await this.planRepository.findByKind(kind);
    if (existing !== null) {
      throw new PlanKindConflictException(kind);
    }
  }

  private static normalizeName(value: string): string {
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

  private static assertValidSlug(slug: string): void {
    if (slug.length === 0) {
      throw new InvalidStateException({
        message: 'Plan slug must not be empty',
        code: 'PLAN_INVALID_SLUG',
      });
    }
  }

  private static resolveInterval(
    kind: PlanKind,
    interval: PlanInterval | null | undefined,
  ): PlanInterval | null {
    if (kind === PlanKind.FREE) {
      if (interval !== undefined && interval !== null) {
        throw new InvalidStateException({
          message: 'Free plans must not have a billing interval',
          code: 'PLAN_INVALID_INTERVAL',
        });
      }
      return null;
    }
    const resolved: PlanInterval = interval ?? PlanInterval.MONTH;
    if (resolved !== PlanInterval.MONTH) {
      throw new InvalidStateException({
        message: 'Paid plans must use a monthly interval',
        code: 'PLAN_INVALID_INTERVAL',
      });
    }
    return resolved;
  }
}
