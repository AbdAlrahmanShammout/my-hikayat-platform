import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { AuthorAnalyticsService } from '@/modules/monetization/author-analytics.service';
import { BookRevenueEntity } from '@/modules/monetization/entity/book-revenue.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { MonetizationAuthorController } from './monetization.author.controller';

function createSampleAuthor(): UserEntity {
  return new UserEntity({
    id: 3,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'author@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.AUTHOR,
    isPublisher: true,
  });
}

function createSampleRevenue(): BookRevenueEntity {
  return new BookRevenueEntity({
    id: 1,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    revenuePeriodId: 4,
    bookId: 8,
    ownerId: 3,
    weightedEngagement: 2.5,
    poolShareCents: 3571,
    platformCutCents: 1071,
    authorCents: 2500,
  });
}

describe('MonetizationAuthorController', () => {
  let monetizationAuthorController: MonetizationAuthorController;
  let mockAuthorAnalyticsService: {
    listAuthorEarnings: jest.Mock;
    listAuthorEarningsTrend: jest.Mock;
    listAuthorAnalytics: jest.Mock;
    getAuthorBookHeatmap: jest.Mock;
  };

  beforeEach(async () => {
    mockAuthorAnalyticsService = {
      listAuthorEarnings: jest.fn(),
      listAuthorEarningsTrend: jest.fn(),
      listAuthorAnalytics: jest.fn(),
      getAuthorBookHeatmap: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [MonetizationAuthorController],
      providers: [
        { provide: AuthorAnalyticsService, useValue: mockAuthorAnalyticsService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    monetizationAuthorController = moduleRef.get(MonetizationAuthorController);
  });

  describe('listAuthorEarnings', () => {
    it('maps the principal and query onto the analytics service', async () => {
      mockAuthorAnalyticsService.listAuthorEarnings.mockResolvedValue({
        page: { entities: [createSampleRevenue()], total: 1 },
        authorCents: 2500,
      });
      const actualResponse = await monetizationAuthorController.listAuthorEarnings(
        { revenuePeriodId: 4, limit: 20, offset: 0 },
        createSampleAuthor(),
      );
      expect(mockAuthorAnalyticsService.listAuthorEarnings).toHaveBeenCalledWith({
        ownerId: 3,
        revenuePeriodId: 4,
        limit: 20,
        offset: 0,
      });
      expect(actualResponse.authorCents).toBe(2500);
      expect(actualResponse.bookRevenues[0].bookId).toBe(8);
    });
  });

  describe('getAuthorBookHeatmap', () => {
    it('maps the book id, period, and principal onto the analytics service', async () => {
      mockAuthorAnalyticsService.getAuthorBookHeatmap.mockResolvedValue({
        bookId: 10,
        revenuePeriodId: 4,
        layoutType: BookLayoutType.FIXED_LAYOUT,
        spreads: [
          { spreadIndex: 0, pageNumber: 1, activeDurationMs: 180000, visualSceneTimeMs: 90000 },
        ],
        chapters: [],
      });
      const actualResponse = await monetizationAuthorController.getAuthorBookHeatmap(
        10,
        { revenuePeriodId: 4 },
        createSampleAuthor(),
      );
      expect(mockAuthorAnalyticsService.getAuthorBookHeatmap).toHaveBeenCalledWith({
        ownerId: 3,
        bookId: 10,
        revenuePeriodId: 4,
      });
      expect(actualResponse.spreads[0].activeDurationMs).toBe(180000);
      expect(actualResponse.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
      expect(actualResponse.chapters).toEqual([]);
    });
  });
});
