import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { PlanInterval, PlanKind } from '@/modules/subscription/enum/general.enum';
import { PlanKindConflictException } from '@/modules/subscription/exceptions/plan-kind-conflict.exception';
import { PlanSlugConflictException } from '@/modules/subscription/exceptions/plan-slug-conflict.exception';

import { PlanService } from './plan.service';

function createSamplePlan(): PlanEntity {
  return new PlanEntity({
    id: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    slug: 'free',
    name: 'Free',
    kind: PlanKind.FREE,
    interval: null,
  });
}

describe('PlanService', () => {
  let mockPlanRepository: {
    create: jest.Mock;
    findById: jest.Mock;
    findBySlug: jest.Mock;
    findByKind: jest.Mock;
    list: jest.Mock;
  };
  let planService: PlanService;

  beforeEach(() => {
    mockPlanRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findByKind: jest.fn(),
      list: jest.fn(),
    };
    planService = new PlanService(mockPlanRepository);
  });

  describe('createPlan', () => {
    it('normalizes slug and name and defaults a free interval to null', async () => {
      const expectedPlan = createSamplePlan();
      mockPlanRepository.findBySlug.mockResolvedValue(null);
      mockPlanRepository.findByKind.mockResolvedValue(null);
      mockPlanRepository.create.mockResolvedValue(expectedPlan);
      const actualPlan = await planService.createPlan({
        slug: ' Free ',
        name: '  Free  ',
        kind: PlanKind.FREE,
      });
      expect(mockPlanRepository.create).toHaveBeenCalledWith({
        slug: 'free',
        name: 'Free',
        kind: PlanKind.FREE,
        interval: null,
      });
      expect(actualPlan).toBe(expectedPlan);
    });

    it('defaults a paid plan interval to month', async () => {
      mockPlanRepository.findBySlug.mockResolvedValue(null);
      mockPlanRepository.findByKind.mockResolvedValue(null);
      mockPlanRepository.create.mockResolvedValue(createSamplePlan());
      await planService.createPlan({
        slug: 'monthly',
        name: 'Monthly',
        kind: PlanKind.MONTHLY_PAID,
      });
      expect(mockPlanRepository.create).toHaveBeenCalledWith({
        slug: 'monthly',
        name: 'Monthly',
        kind: PlanKind.MONTHLY_PAID,
        interval: PlanInterval.MONTH,
      });
    });

    it('rejects a free plan that includes an interval', async () => {
      await expect(
        planService.createPlan({
          slug: 'free',
          name: 'Free',
          kind: PlanKind.FREE,
          interval: PlanInterval.MONTH,
        }),
      ).rejects.toBeInstanceOf(InvalidStateException);
    });

    it('rejects a duplicate slug', async () => {
      mockPlanRepository.findBySlug.mockResolvedValue(createSamplePlan());
      await expect(
        planService.createPlan({
          slug: 'free',
          name: 'Free',
          kind: PlanKind.FREE,
        }),
      ).rejects.toBeInstanceOf(PlanSlugConflictException);
    });

    it('rejects a duplicate kind', async () => {
      mockPlanRepository.findBySlug.mockResolvedValue(null);
      mockPlanRepository.findByKind.mockResolvedValue(createSamplePlan());
      await expect(
        planService.createPlan({
          slug: 'gratis',
          name: 'Gratis',
          kind: PlanKind.FREE,
        }),
      ).rejects.toBeInstanceOf(PlanKindConflictException);
    });
  });

  describe('listPlans', () => {
    it('lists with default pagination', async () => {
      mockPlanRepository.list.mockResolvedValue({ entities: [createSamplePlan()], total: 1 });
      const actualPage = await planService.listPlans();
      expect(mockPlanRepository.list).toHaveBeenCalledWith({
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
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
});
