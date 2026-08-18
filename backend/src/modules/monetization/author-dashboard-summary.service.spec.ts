import { BookService } from '@/modules/book/book.service';
import { BookPublishingStatus } from '@/modules/book/enum/general.enum';
import { BookEngagementService } from '@/modules/monetization/book-engagement.service';
import { BookRevenueService } from '@/modules/monetization/book-revenue.service';
import { DASHBOARD_COUNT_PAGE_SIZE } from '@/modules/monetization/consts/dashboard-count-page-size.constant';

import { AuthorDashboardSummaryService } from './author-dashboard-summary.service';

describe('AuthorDashboardSummaryService', () => {
  let mockBookService: {
    listBooks: jest.Mock;
    countCatalogVisibleBooks: jest.Mock;
  };
  let mockBookEngagementService: { summarizeOwnerEngagement: jest.Mock };
  let mockBookRevenueService: { sumAuthorCents: jest.Mock };
  let authorDashboardSummaryService: AuthorDashboardSummaryService;

  beforeEach(() => {
    mockBookService = {
      listBooks: jest.fn(),
      countCatalogVisibleBooks: jest.fn(),
    };
    mockBookEngagementService = { summarizeOwnerEngagement: jest.fn() };
    mockBookRevenueService = { sumAuthorCents: jest.fn() };
    authorDashboardSummaryService = new AuthorDashboardSummaryService(
      mockBookService as unknown as BookService,
      mockBookEngagementService as unknown as BookEngagementService,
      mockBookRevenueService as unknown as BookRevenueService,
    );
  });

  it('returns zeros when the owner has no books, engagement, or earnings', async () => {
    mockBookService.listBooks.mockResolvedValue({ entities: [], total: 0 });
    mockBookService.countCatalogVisibleBooks.mockResolvedValue(0);
    mockBookEngagementService.summarizeOwnerEngagement.mockResolvedValue({
      totalActiveReadingMs: 0,
      totalActiveSpreadMs: 0,
      totalVisualSceneTimeMs: 0,
      totalWeightedEngagement: 0,
    });
    mockBookRevenueService.sumAuthorCents.mockResolvedValue(0);
    const actualSummary = await authorDashboardSummaryService.getAuthorDashboardSummary({
      ownerId: 3,
    });
    expect(actualSummary).toEqual({
      totalBooks: 0,
      publishedBooks: 0,
      pendingReviewBooks: 0,
      totalReadingMinutes: 0,
      authorCents: 0,
    });
  });

  it('scopes every aggregate to the principal and uses catalog visibility for published books', async () => {
    mockBookService.listBooks.mockImplementation(async (input: { publishingStatus?: string }) => {
      if (input.publishingStatus === BookPublishingStatus.IN_REVIEW) {
        return { entities: [], total: 1 };
      }
      return { entities: [], total: 4 };
    });
    mockBookService.countCatalogVisibleBooks.mockResolvedValue(2);
    mockBookEngagementService.summarizeOwnerEngagement.mockResolvedValue({
      totalActiveReadingMs: 90_000,
      totalActiveSpreadMs: 0,
      totalVisualSceneTimeMs: 45_000,
      totalWeightedEngagement: 9,
    });
    mockBookRevenueService.sumAuthorCents.mockResolvedValue(7000);
    const actualSummary = await authorDashboardSummaryService.getAuthorDashboardSummary({
      ownerId: 3,
    });
    expect(mockBookService.listBooks).toHaveBeenCalledWith({
      limit: DASHBOARD_COUNT_PAGE_SIZE,
      ownerId: 3,
    });
    expect(mockBookService.listBooks).toHaveBeenCalledWith({
      limit: DASHBOARD_COUNT_PAGE_SIZE,
      ownerId: 3,
      publishingStatus: BookPublishingStatus.IN_REVIEW,
    });
    expect(mockBookService.countCatalogVisibleBooks).toHaveBeenCalledWith({ ownerId: 3 });
    expect(mockBookEngagementService.summarizeOwnerEngagement).toHaveBeenCalledWith({
      ownerId: 3,
    });
    expect(mockBookRevenueService.sumAuthorCents).toHaveBeenCalledWith({ ownerId: 3 });
    expect(actualSummary).toEqual({
      totalBooks: 4,
      publishedBooks: 2,
      pendingReviewBooks: 1,
      totalReadingMinutes: 1.5,
      authorCents: 7000,
    });
  });
});
