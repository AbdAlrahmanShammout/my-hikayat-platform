import { Prisma } from '@prisma/client';

import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { RevenuePeriodMapper } from '@/modules/monetization/mapper/revenue-period.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { RevenuePeriodPrismaRepository } from './revenue-period-prisma.repository';

describe('RevenuePeriodPrismaRepository', () => {
  const createdAt = new Date('2026-08-01T00:00:00.000Z');
  const updatedAt = new Date('2026-08-01T00:00:00.000Z');
  const persistenceRow = {
    id: 1,
    createdAt,
    updatedAt,
    deletedAt: null,
    startsAt: new Date('2026-08-01T00:00:00.000Z'),
    endsAt: new Date('2026-09-01T00:00:00.000Z'),
    status: 'open',
    platformCutPercent: new Prisma.Decimal('25.00'),
    poolAmountCents: null,
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    revenuePeriod: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
  };
  let revenuePeriodPrismaRepository: RevenuePeriodPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(),
      revenuePeriod: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };
    revenuePeriodPrismaRepository = new RevenuePeriodPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('creates a revenue period and maps the persistence payload', async () => {
    mockPrismaProviderService.revenuePeriod.create.mockResolvedValue(persistenceRow);
    const actualEntity = await revenuePeriodPrismaRepository.create({
      startsAt: persistenceRow.startsAt,
      endsAt: persistenceRow.endsAt,
      status: RevenuePeriodStatus.OPEN,
      platformCutPercent: 25,
      poolAmountCents: null,
    });
    expect(mockPrismaProviderService.revenuePeriod.create).toHaveBeenCalledWith({
      data: {
        startsAt: persistenceRow.startsAt,
        endsAt: persistenceRow.endsAt,
        status: RevenuePeriodStatus.OPEN,
        platformCutPercent: 25,
        poolAmountCents: null,
      },
    });
    expect(actualEntity).toEqual(RevenuePeriodMapper.toEntity(persistenceRow));
  });

  it('lists revenue periods ordered by startsAt descending', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 1]);
    const actualPage = await revenuePeriodPrismaRepository.list({ limit: 20, offset: 0 });
    expect(mockPrismaProviderService.revenuePeriod.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null },
        orderBy: [{ startsAt: 'desc' }, { id: 'desc' }],
      }),
    );
    expect(actualPage.total).toBe(1);
    expect(actualPage.entities).toEqual([RevenuePeriodMapper.toEntity(persistenceRow)]);
  });

  it('finds elapsed open periods ending on or before the given instant', async () => {
    mockPrismaProviderService.revenuePeriod.findMany.mockResolvedValue([persistenceRow]);
    const inputEndsAtOnOrBefore = new Date('2026-08-15T00:00:00.000Z');
    const actualEntities =
      await revenuePeriodPrismaRepository.findOpenElapsed(inputEndsAtOnOrBefore);
    expect(mockPrismaProviderService.revenuePeriod.findMany).toHaveBeenCalledWith({
      where: {
        status: RevenuePeriodStatus.OPEN,
        deletedAt: null,
        endsAt: { lte: inputEndsAtOnOrBefore },
      },
      orderBy: [{ startsAt: 'asc' }, { id: 'asc' }],
    });
    expect(actualEntities).toEqual([RevenuePeriodMapper.toEntity(persistenceRow)]);
  });
});
