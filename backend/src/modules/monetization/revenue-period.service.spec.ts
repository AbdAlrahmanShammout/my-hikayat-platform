import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { RevenuePeriodPoolAmountInvalidException } from '@/modules/monetization/exceptions/revenue-period-pool-amount-invalid.exception';
import { RevenuePeriodRangeInvalidException } from '@/modules/monetization/exceptions/revenue-period-range-invalid.exception';
import { RevenuePeriodStartsAtConflictException } from '@/modules/monetization/exceptions/revenue-period-starts-at-conflict.exception';

import { RevenuePeriodService } from './revenue-period.service';

function createSamplePeriod(
  overrides: Partial<ConstructorParameters<typeof RevenuePeriodEntity>[0]> = {},
): RevenuePeriodEntity {
  return new RevenuePeriodEntity({
    id: 1,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    startsAt: new Date('2026-08-01T00:00:00.000Z'),
    endsAt: new Date('2026-09-01T00:00:00.000Z'),
    status: RevenuePeriodStatus.OPEN,
    poolAmountCents: null,
    ...overrides,
  });
}

describe('RevenuePeriodService', () => {
  let mockRevenuePeriodRepository: {
    create: jest.Mock;
    update: jest.Mock;
    findById: jest.Mock;
    findByStartsAt: jest.Mock;
    findOpen: jest.Mock;
    findOpenElapsed: jest.Mock;
    list: jest.Mock;
  };
  let revenuePeriodService: RevenuePeriodService;

  beforeEach(() => {
    mockRevenuePeriodRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByStartsAt: jest.fn(),
      findOpen: jest.fn(),
      findOpenElapsed: jest.fn(),
      list: jest.fn(),
    };
    revenuePeriodService = new RevenuePeriodService(mockRevenuePeriodRepository);
  });

  describe('createRevenuePeriod', () => {
    it('creates an open period with an empty calculated pool', async () => {
      const expectedPeriod = createSamplePeriod();
      mockRevenuePeriodRepository.findByStartsAt.mockResolvedValue(null);
      mockRevenuePeriodRepository.create.mockResolvedValue(expectedPeriod);
      const actualPeriod = await revenuePeriodService.createRevenuePeriod({
        startsAt: expectedPeriod.startsAt,
        endsAt: expectedPeriod.endsAt,
      });
      expect(mockRevenuePeriodRepository.create).toHaveBeenCalledWith({
        startsAt: expectedPeriod.startsAt,
        endsAt: expectedPeriod.endsAt,
        status: RevenuePeriodStatus.OPEN,
        poolAmountCents: null,
      });
      expect(actualPeriod).toBe(expectedPeriod);
    });

    it('rejects a range whose end is not later than its start', async () => {
      await expect(
        revenuePeriodService.createRevenuePeriod({
          startsAt: new Date('2026-09-01T00:00:00.000Z'),
          endsAt: new Date('2026-08-01T00:00:00.000Z'),
        }),
      ).rejects.toBeInstanceOf(RevenuePeriodRangeInvalidException);
    });

    it('rejects a duplicate startsAt', async () => {
      mockRevenuePeriodRepository.findByStartsAt.mockResolvedValue(createSamplePeriod());
      await expect(
        revenuePeriodService.createRevenuePeriod({
          startsAt: new Date('2026-08-01T00:00:00.000Z'),
          endsAt: new Date('2026-09-01T00:00:00.000Z'),
        }),
      ).rejects.toBeInstanceOf(RevenuePeriodStartsAtConflictException);
    });
  });

  describe('updateRevenuePeriod', () => {
    it('stores the calculated net pool', async () => {
      const currentPeriod = createSamplePeriod();
      const expectedPeriod = createSamplePeriod({ poolAmountCents: 5000 });
      mockRevenuePeriodRepository.findById.mockResolvedValue(currentPeriod);
      mockRevenuePeriodRepository.update.mockResolvedValue(expectedPeriod);
      const actualPeriod = await revenuePeriodService.updateRevenuePeriod({
        id: currentPeriod.id,
        poolAmountCents: 5000,
      });
      expect(mockRevenuePeriodRepository.update).toHaveBeenCalledWith({
        id: currentPeriod.id,
        poolAmountCents: 5000,
      });
      expect(actualPeriod).toBe(expectedPeriod);
    });

    it('rejects a negative pool amount', async () => {
      mockRevenuePeriodRepository.findById.mockResolvedValue(createSamplePeriod());
      await expect(
        revenuePeriodService.updateRevenuePeriod({ id: 1, poolAmountCents: -1 }),
      ).rejects.toBeInstanceOf(RevenuePeriodPoolAmountInvalidException);
    });
  });

  describe('closeRevenuePeriod', () => {
    it('closes an open period and is idempotent when already closed', async () => {
      const openPeriod = createSamplePeriod();
      const closedPeriod = createSamplePeriod({ status: RevenuePeriodStatus.CLOSED });
      mockRevenuePeriodRepository.findById.mockResolvedValueOnce(openPeriod);
      mockRevenuePeriodRepository.update.mockResolvedValue(closedPeriod);
      const actualClosed = await revenuePeriodService.closeRevenuePeriod(openPeriod.id);
      expect(mockRevenuePeriodRepository.update).toHaveBeenCalledWith({
        id: openPeriod.id,
        status: RevenuePeriodStatus.CLOSED,
      });
      expect(actualClosed.status).toBe(RevenuePeriodStatus.CLOSED);
      mockRevenuePeriodRepository.findById.mockResolvedValueOnce(closedPeriod);
      const actualAgain = await revenuePeriodService.closeRevenuePeriod(openPeriod.id);
      expect(mockRevenuePeriodRepository.update).toHaveBeenCalledTimes(1);
      expect(actualAgain).toBe(closedPeriod);
    });
  });

  describe('ensureCurrentPeriod', () => {
    it('opens the current UTC month', async () => {
      const expectedPeriod = createSamplePeriod();
      mockRevenuePeriodRepository.findOpenElapsed.mockResolvedValue([]);
      mockRevenuePeriodRepository.findByStartsAt.mockResolvedValue(null);
      mockRevenuePeriodRepository.create.mockResolvedValue(expectedPeriod);
      const actualPeriod = await revenuePeriodService.ensureCurrentPeriod(
        new Date('2026-08-15T12:00:00.000Z'),
      );
      expect(mockRevenuePeriodRepository.create).toHaveBeenCalledWith({
        startsAt: new Date('2026-08-01T00:00:00.000Z'),
        endsAt: new Date('2026-09-01T00:00:00.000Z'),
        status: RevenuePeriodStatus.OPEN,
        poolAmountCents: null,
      });
      expect(actualPeriod).toBe(expectedPeriod);
    });

    it('returns an existing period for the same month', async () => {
      const existingPeriod = createSamplePeriod();
      mockRevenuePeriodRepository.findOpenElapsed.mockResolvedValue([]);
      mockRevenuePeriodRepository.findByStartsAt.mockResolvedValue(existingPeriod);
      const actualPeriod = await revenuePeriodService.ensureCurrentPeriod(
        new Date('2026-08-15T12:00:00.000Z'),
      );
      expect(mockRevenuePeriodRepository.create).not.toHaveBeenCalled();
      expect(actualPeriod).toBe(existingPeriod);
    });

    it('closes elapsed open periods before opening the current month', async () => {
      const elapsedPeriod = createSamplePeriod({
        id: 8,
        startsAt: new Date('2026-07-01T00:00:00.000Z'),
        endsAt: new Date('2026-08-01T00:00:00.000Z'),
      });
      const currentPeriod = createSamplePeriod();
      mockRevenuePeriodRepository.findOpenElapsed.mockResolvedValue([elapsedPeriod]);
      mockRevenuePeriodRepository.findById.mockResolvedValue(elapsedPeriod);
      mockRevenuePeriodRepository.update.mockResolvedValue(
        createSamplePeriod({ id: 8, status: RevenuePeriodStatus.CLOSED }),
      );
      mockRevenuePeriodRepository.findByStartsAt.mockResolvedValue(currentPeriod);
      await revenuePeriodService.ensureCurrentPeriod(new Date('2026-08-15T12:00:00.000Z'));
      expect(mockRevenuePeriodRepository.update).toHaveBeenCalledWith({
        id: 8,
        status: RevenuePeriodStatus.CLOSED,
      });
    });
  });

  describe('listRevenuePeriods', () => {
    it('lists with default pagination', async () => {
      mockRevenuePeriodRepository.list.mockResolvedValue({
        entities: [createSamplePeriod()],
        total: 1,
      });
      const actualPage = await revenuePeriodService.listRevenuePeriods();
      expect(mockRevenuePeriodRepository.list).toHaveBeenCalledWith({
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
      });
      expect(actualPage.total).toBe(1);
    });
  });

  describe('getCurrentRevenuePeriod', () => {
    it('throws when no open period exists', async () => {
      mockRevenuePeriodRepository.findOpen.mockResolvedValue(null);
      await expect(revenuePeriodService.getCurrentRevenuePeriod()).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
    });
  });
});
