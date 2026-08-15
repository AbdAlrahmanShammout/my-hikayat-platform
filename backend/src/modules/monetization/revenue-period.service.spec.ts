import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { MonetizationConfigService } from '@/config/monetization/monetization-config.service';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { PlatformCutPercentInvalidException } from '@/modules/monetization/exceptions/platform-cut-percent-invalid.exception';
import { RevenuePeriodAlreadyClosedException } from '@/modules/monetization/exceptions/revenue-period-already-closed.exception';
import { RevenuePeriodPoolAmountInvalidException } from '@/modules/monetization/exceptions/revenue-period-pool-amount-invalid.exception';
import { RevenuePeriodRangeInvalidException } from '@/modules/monetization/exceptions/revenue-period-range-invalid.exception';
import { RevenuePeriodStartsAtConflictException } from '@/modules/monetization/exceptions/revenue-period-starts-at-conflict.exception';

import { RevenuePeriodService } from './revenue-period.service';

const CONFIGURED_PLATFORM_CUT_PERCENT = 25;

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
    platformCutPercent: CONFIGURED_PLATFORM_CUT_PERCENT,
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
  let mockMonetizationConfigService: { platformCutPercent: number };
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
    mockMonetizationConfigService = { platformCutPercent: CONFIGURED_PLATFORM_CUT_PERCENT };
    revenuePeriodService = new RevenuePeriodService(
      mockRevenuePeriodRepository,
      mockMonetizationConfigService as unknown as MonetizationConfigService,
    );
  });

  describe('createRevenuePeriod', () => {
    it('snapshots the configured platform cut when none is provided', async () => {
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
        platformCutPercent: CONFIGURED_PLATFORM_CUT_PERCENT,
        poolAmountCents: null,
      });
      expect(actualPeriod).toBe(expectedPeriod);
    });

    it('rounds an explicit platform cut to two decimal places', async () => {
      mockRevenuePeriodRepository.findByStartsAt.mockResolvedValue(null);
      mockRevenuePeriodRepository.create.mockResolvedValue(createSamplePeriod());
      await revenuePeriodService.createRevenuePeriod({
        startsAt: new Date('2026-08-01T00:00:00.000Z'),
        endsAt: new Date('2026-09-01T00:00:00.000Z'),
        platformCutPercent: 12.345,
      });
      expect(mockRevenuePeriodRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ platformCutPercent: 12.35 }),
      );
    });

    it('rejects a platform cut outside zero through one hundred', async () => {
      await expect(
        revenuePeriodService.createRevenuePeriod({
          startsAt: new Date('2026-08-01T00:00:00.000Z'),
          endsAt: new Date('2026-09-01T00:00:00.000Z'),
          platformCutPercent: 101,
        }),
      ).rejects.toBeInstanceOf(PlatformCutPercentInvalidException);
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

    it('rejects a negative pool amount', async () => {
      await expect(
        revenuePeriodService.createRevenuePeriod({
          startsAt: new Date('2026-08-01T00:00:00.000Z'),
          endsAt: new Date('2026-09-01T00:00:00.000Z'),
          poolAmountCents: -1,
        }),
      ).rejects.toBeInstanceOf(RevenuePeriodPoolAmountInvalidException);
    });
  });

  describe('updateRevenuePeriod', () => {
    it('updates the pool amount on an open period', async () => {
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
        platformCutPercent: CONFIGURED_PLATFORM_CUT_PERCENT,
        poolAmountCents: 5000,
      });
      expect(actualPeriod).toBe(expectedPeriod);
    });

    it('rejects changing the platform cut on a closed period', async () => {
      mockRevenuePeriodRepository.findById.mockResolvedValue(
        createSamplePeriod({ status: RevenuePeriodStatus.CLOSED }),
      );
      await expect(
        revenuePeriodService.updateRevenuePeriod({ id: 1, platformCutPercent: 10 }),
      ).rejects.toBeInstanceOf(RevenuePeriodAlreadyClosedException);
    });

    it('allows setting the pool amount on a closed period', async () => {
      const currentPeriod = createSamplePeriod({ status: RevenuePeriodStatus.CLOSED });
      mockRevenuePeriodRepository.findById.mockResolvedValue(currentPeriod);
      mockRevenuePeriodRepository.update.mockResolvedValue(
        createSamplePeriod({ status: RevenuePeriodStatus.CLOSED, poolAmountCents: 900 }),
      );
      await revenuePeriodService.updateRevenuePeriod({ id: 1, poolAmountCents: 900 });
      expect(mockRevenuePeriodRepository.update).toHaveBeenCalledWith({
        id: 1,
        platformCutPercent: CONFIGURED_PLATFORM_CUT_PERCENT,
        poolAmountCents: 900,
      });
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
    it('opens the UTC month and snapshots the configured cut', async () => {
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
        platformCutPercent: CONFIGURED_PLATFORM_CUT_PERCENT,
        poolAmountCents: null,
      });
      expect(actualPeriod).toBe(expectedPeriod);
    });

    it('returns an existing period for the same month without rewriting the cut', async () => {
      const existingPeriod = createSamplePeriod({ platformCutPercent: 12 });
      mockRevenuePeriodRepository.findOpenElapsed.mockResolvedValue([]);
      mockRevenuePeriodRepository.findByStartsAt.mockResolvedValue(existingPeriod);
      const actualPeriod = await revenuePeriodService.ensureCurrentPeriod(
        new Date('2026-08-15T12:00:00.000Z'),
      );
      expect(mockRevenuePeriodRepository.create).not.toHaveBeenCalled();
      expect(actualPeriod.platformCutPercent).toBe(12);
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
