import { PlanKind } from '@/modules/subscription/enum/general.enum';
import { PlanMapper } from '@/modules/subscription/mapper/plan.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { PlanPrismaRepository } from './plan-prisma.repository';

describe('PlanPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
    id: 1,
    createdAt,
    updatedAt,
    deletedAt: null,
    slug: 'free',
    name: 'Free',
    kind: 'free',
    interval: null,
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    plan: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };
  let planPrismaRepository: PlanPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(),
      plan: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
    planPrismaRepository = new PlanPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('creates a plan and maps the persistence payload', async () => {
    mockPrismaProviderService.plan.create.mockResolvedValue(persistenceRow);
    const actualEntity = await planPrismaRepository.create({
      slug: 'free',
      name: 'Free',
      kind: PlanKind.FREE,
      interval: null,
    });
    expect(mockPrismaProviderService.plan.create).toHaveBeenCalledWith({
      data: {
        slug: 'free',
        name: 'Free',
        kind: PlanKind.FREE,
        interval: null,
      },
    });
    expect(actualEntity).toEqual(PlanMapper.toEntity(persistenceRow));
  });

  it('lists plans ordered by slug', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 1]);
    const actualPage = await planPrismaRepository.list({ limit: 20, offset: 0 });
    expect(mockPrismaProviderService.plan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null },
        orderBy: [{ slug: 'asc' }, { id: 'asc' }],
      }),
    );
    expect(actualPage.total).toBe(1);
    expect(actualPage.entities).toEqual([PlanMapper.toEntity(persistenceRow)]);
  });
});
