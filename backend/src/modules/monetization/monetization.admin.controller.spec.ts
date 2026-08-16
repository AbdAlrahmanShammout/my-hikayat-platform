import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { AdminAnalyticsService } from '@/modules/monetization/admin-analytics.service';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { MonetizationAdminController } from './monetization.admin.controller';

function createSampleAdmin(): UserEntity {
  return new UserEntity({
    id: 9,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'admin@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.ADMIN,
    isPublisher: false,
  });
}

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
      const actualResponse = await monetizationAdminController.calculatePeriodRevenue(
        4,
        createSampleAdmin(),
      );
      expect(mockAdminAnalyticsService.calculatePeriodRevenue).toHaveBeenCalledWith({
        revenuePeriodId: 4,
        actorUserId: 9,
      });
      expect(actualResponse.authorCents).toBe(7000);
      expect(actualResponse.platformCutCents).toBe(3000);
    });
  });

  describe('getPeriodBookHeatmap', () => {
    it('maps the period id and book id onto the analytics service', async () => {
      mockAdminAnalyticsService.getPeriodBookHeatmap.mockResolvedValue({
        bookId: 10,
        revenuePeriodId: 4,
        layoutType: BookLayoutType.FIXED_LAYOUT,
        spreads: [
          { spreadIndex: 0, pageNumber: 1, activeDurationMs: 180000, visualSceneTimeMs: 90000 },
        ],
        chapters: [],
      });
      const actualResponse = await monetizationAdminController.getPeriodBookHeatmap(4, 10);
      expect(mockAdminAnalyticsService.getPeriodBookHeatmap).toHaveBeenCalledWith({
        revenuePeriodId: 4,
        bookId: 10,
      });
      expect(actualResponse.spreads[0].activeDurationMs).toBe(180000);
      expect(actualResponse.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
      expect(actualResponse.chapters).toEqual([]);
    });
  });
});
