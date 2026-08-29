import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';
import { PlanKindConflictException } from '@/modules/subscription/exceptions/plan-kind-conflict.exception';
import { PlanNotPurchasableException } from '@/modules/subscription/exceptions/plan-not-purchasable.exception';
import { PlanSlugConflictException } from '@/modules/subscription/exceptions/plan-slug-conflict.exception';
import { PlanStripePriceConflictException } from '@/modules/subscription/exceptions/plan-stripe-price-conflict.exception';

import { PlanService } from './plan.service';

function createSampleFreePlan(): PlanEntity {
  return new PlanEntity({
    id: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    slug: 'free',
    name: 'Free',
    description: 'Free reading access',
    kind: PlanKind.FREE,
    interval: null,
    stripePriceId: null,
    amountCents: null,
    currency: null,
  });
}

function createSamplePaidPlan(): PlanEntity {
  return new PlanEntity({
    id: 2,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    slug: 'monthly',
    name: 'Monthly',
    description: 'Monthly paid full-book reading',
    kind: PlanKind.MONTHLY_PAID,
    interval: PlanInterval.MONTH,
    stripePriceId: 'price_test_monthly',
    amountCents: 999,
    currency: 'usd',
  });
}

describe('PlanService', () => {
  let mockPlanRepository: {
    create: jest.Mock;
    update: jest.Mock;
    findById: jest.Mock;
    findBySlug: jest.Mock;
    findByKind: jest.Mock;
    findByStripePriceId: jest.Mock;
    list: jest.Mock;
  };
  let mockStripeManagerService: { retrievePrice: jest.Mock };
  let planService: PlanService;

  beforeEach(() => {
    mockPlanRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findByKind: jest.fn(),
      findByStripePriceId: jest.fn(),
      list: jest.fn(),
    };
    mockStripeManagerService = { retrievePrice: jest.fn() };
    planService = new PlanService(
      mockPlanRepository,
      mockStripeManagerService as never,
    );
  });

  describe('createPlan', () => {
    it('normalizes slug and name and defaults a free interval to null', async () => {
      const expectedPlan = createSampleFreePlan();
      mockPlanRepository.findBySlug.mockResolvedValue(null);
      mockPlanRepository.findByKind.mockResolvedValue(null);
      mockPlanRepository.create.mockResolvedValue(expectedPlan);
      const actualPlan = await planService.createPlan({
        slug: ' Free ',
        name: '  Free  ',
        description: 'Free reading access',
        kind: PlanKind.FREE,
      });
      expect(mockPlanRepository.create).toHaveBeenCalledWith({
        slug: 'free',
        name: 'Free',
        description: 'Free reading access',
        kind: PlanKind.FREE,
        interval: null,
        stripePriceId: null,
        amountCents: null,
        currency: null,
      });
      expect(actualPlan).toBe(expectedPlan);
    });

    it('retrieves price from Stripe and creates a monthly paid plan', async () => {
      mockPlanRepository.findBySlug.mockResolvedValue(null);
      mockPlanRepository.findByStripePriceId.mockResolvedValue(null);
      mockStripeManagerService.retrievePrice.mockResolvedValue({
        priceId: 'price_test_monthly',
        amountCents: 999,
        currency: 'usd',
        interval: 'month',
        isRecurring: true,
      });
      mockPlanRepository.create.mockResolvedValue(createSamplePaidPlan());
      await planService.createPlan({
        slug: 'monthly',
        name: 'Monthly',
        description: 'Monthly paid full-book reading',
        kind: PlanKind.MONTHLY_PAID,
        stripePriceId: 'price_test_monthly',
      });
      expect(mockStripeManagerService.retrievePrice).toHaveBeenCalledWith({
        priceId: 'price_test_monthly',
      });
      expect(mockPlanRepository.create).toHaveBeenCalledWith({
        slug: 'monthly',
        name: 'Monthly',
        description: 'Monthly paid full-book reading',
        kind: PlanKind.MONTHLY_PAID,
        interval: PlanInterval.MONTH,
        stripePriceId: 'price_test_monthly',
        amountCents: 999,
        currency: 'usd',
      });
    });

    it('rejects a free plan with a Stripe price id', async () => {
      mockPlanRepository.findBySlug.mockResolvedValue(null);
      mockPlanRepository.findByKind.mockResolvedValue(null);
      await expect(
        planService.createPlan({
          slug: 'free',
          name: 'Free',
          description: 'Free reading access',
          kind: PlanKind.FREE,
          stripePriceId: 'price_should_not_be_here',
        }),
      ).rejects.toBeInstanceOf(InvalidStateException);
    });

    it('rejects a paid plan without a Stripe price id', async () => {
      mockPlanRepository.findBySlug.mockResolvedValue(null);
      await expect(
        planService.createPlan({
          slug: 'monthly',
          name: 'Monthly',
          description: 'Monthly paid full-book reading',
          kind: PlanKind.MONTHLY_PAID,
        }),
      ).rejects.toBeInstanceOf(InvalidStateException);
    });

    it('rejects a duplicate slug', async () => {
      mockPlanRepository.findBySlug.mockResolvedValue(createSampleFreePlan());
      await expect(
        planService.createPlan({
          slug: 'free',
          name: 'Free',
          description: 'Free reading access',
          kind: PlanKind.FREE,
        }),
      ).rejects.toBeInstanceOf(PlanSlugConflictException);
    });

    it('rejects a duplicate kind for free plans', async () => {
      mockPlanRepository.findBySlug.mockResolvedValue(null);
      mockPlanRepository.findByKind.mockResolvedValue(createSampleFreePlan());
      await expect(
        planService.createPlan({
          slug: 'gratis',
          name: 'Gratis',
          description: 'Another free plan',
          kind: PlanKind.FREE,
        }),
      ).rejects.toBeInstanceOf(PlanKindConflictException);
    });

    it('rejects a duplicate Stripe price id', async () => {
      mockPlanRepository.findBySlug.mockResolvedValue(null);
      mockPlanRepository.findByStripePriceId.mockResolvedValue(createSamplePaidPlan());
      await expect(
        planService.createPlan({
          slug: 'monthly-2',
          name: 'Monthly 2',
          description: 'Another monthly plan',
          kind: PlanKind.MONTHLY_PAID,
          stripePriceId: 'price_test_monthly',
        }),
      ).rejects.toBeInstanceOf(PlanStripePriceConflictException);
    });
  });

  describe('listPlans', () => {
    it('lists with default pagination', async () => {
      mockPlanRepository.list.mockResolvedValue({ entities: [createSampleFreePlan()], total: 1 });
      const actualPage = await planService.listPlans();
      expect(mockPlanRepository.list).toHaveBeenCalledWith({
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
        kind: undefined,
      });
      expect(actualPage.total).toBe(1);
    });
  });

  describe('getPlanById', () => {
    it('throws when the plan is missing', async () => {
      mockPlanRepository.findById.mockResolvedValue(null);
      await expect(planService.getPlanById(99)).rejects.toBeInstanceOf(ResourceNotFoundException);
    });
  });

  describe('getPurchasablePlanById', () => {
    it('returns a paid plan that has a stripe price', async () => {
      mockPlanRepository.findById.mockResolvedValue(createSamplePaidPlan());
      const actualPlan = await planService.getPurchasablePlanById(2);
      expect(actualPlan.kind).toBe(PlanKind.MONTHLY_PAID);
    });

    it('rejects a free plan as not purchasable', async () => {
      mockPlanRepository.findById.mockResolvedValue(createSampleFreePlan());
      await expect(planService.getPurchasablePlanById(1)).rejects.toBeInstanceOf(
        PlanNotPurchasableException,
      );
    });
  });
});
