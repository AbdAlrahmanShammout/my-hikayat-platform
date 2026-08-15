import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AdminAnalyticsService } from '@/modules/monetization/admin-analytics.service';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';

import { MonetizationAdminController } from './monetization.admin.controller';

function createSamplePeriod(): RevenuePeriodEntity {
  return new RevenuePeriodEntity({
    id: 4,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    startsAt: new Date('2026-08-01T00:00:00.000Z'),
    endsAt: new Date('2026-09-01T00:00:00.000Z'),
    status: RevenuePeriodStatus.OPEN,
    platformCutPercent: 30,
    poolAmountCents: 10000,
  });
}

describe('MonetizationAdminController', () => {
  let monetizationAdminController: MonetizationAdminController;
  let mockRevenuePeriodService: {
    listRevenuePeriods: jest.Mock;
    ensureCurrentPeriod: jest.Mock;
    createRevenuePeriod: jest.Mock;
    getRevenuePeriodById: jest.Mock;
    updateRevenuePeriod: jest.Mock;
    closeRevenuePeriod: jest.Mock;
  };
  let mockAdminAnalyticsService: {
    listPeriodEarnings: jest.Mock;
    listPeriodAnalytics: jest.Mock;
    getPeriodBookHeatmap: jest.Mock;
    calculatePeriodRevenue: jest.Mock;
    aggregatePeriodEngagement: jest.Mock;
  };

  beforeEach(async () => {
    mockRevenuePeriodService = {
      listRevenuePeriods: jest.fn(),
      ensureCurrentPeriod: jest.fn(),
      createRevenuePeriod: jest.fn(),
      getRevenuePeriodById: jest.fn(),
      updateRevenuePeriod: jest.fn(),
      closeRevenuePeriod: jest.fn(),
    };
    mockAdminAnalyticsService = {
      listPeriodEarnings: jest.fn(),
      listPeriodAnalytics: jest.fn(),
      getPeriodBookHeatmap: jest.fn(),
      calculatePeriodRevenue: jest.fn(),
      aggregatePeriodEngagement: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [MonetizationAdminController],
      providers: [
        { provide: RevenuePeriodService, useValue: mockRevenuePeriodService },
        { provide: AdminAnalyticsService, useValue: mockAdminAnalyticsService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    monetizationAdminController = moduleRef.get(MonetizationAdminController);
  });

  describe('updateRevenuePeriod', () => {
    it('maps the period id and pool onto the revenue period service', async () => {
      mockRevenuePeriodService.updateRevenuePeriod.mockResolvedValue(createSamplePeriod());
      const actualResponse = await monetizationAdminController.updateRevenuePeriod(4, {
        poolAmountCents: 10000,
      });
      expect(mockRevenuePeriodService.updateRevenuePeriod).toHaveBeenCalledWith({
        id: 4,
        platformCutPercent: undefined,
        poolAmountCents: 10000,
      });
      expect(actualResponse.poolAmountCents).toBe(10000);
    });
  });

  describe('calculatePeriodRevenue', () => {
    it('maps the period id onto the admin analytics service', async () => {
      mockAdminAnalyticsService.calculatePeriodRevenue.mockResolvedValue({
        period: createSamplePeriod(),
        page: { entities: [], total: 0 },
        authorCents: 7000,
        platformCutCents: 3000,
      });
      const actualResponse = await monetizationAdminController.calculatePeriodRevenue(4);
      expect(mockAdminAnalyticsService.calculatePeriodRevenue).toHaveBeenCalledWith({
        revenuePeriodId: 4,
      });
      expect(actualResponse.authorCents).toBe(7000);
      expect(actualResponse.platformCutCents).toBe(3000);
    });
  });
});
