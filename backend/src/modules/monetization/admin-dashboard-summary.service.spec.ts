import { BookService } from '@/modules/book/book.service';
import { BookPublishingStatus } from '@/modules/book/enum/general.enum';
import { BookEngagementService } from '@/modules/monetization/book-engagement.service';
import { DASHBOARD_COUNT_PAGE_SIZE } from '@/modules/monetization/consts/dashboard-count-page-size.constant';
import { UserService } from '@/modules/user/user.service';

import { AdminDashboardSummaryService } from './admin-dashboard-summary.service';

describe('AdminDashboardSummaryService', () => {
  let mockUserService: { listUsers: jest.Mock };
  let mockBookService: {
    listBooks: jest.Mock;
    countCatalogVisibleBooks: jest.Mock;
  };
  let mockBookEngagementService: { summarizeOwnerEngagement: jest.Mock };
  let adminDashboardSummaryService: AdminDashboardSummaryService;

  beforeEach(() => {
    mockUserService = { listUsers: jest.fn() };
    mockBookService = {
      listBooks: jest.fn(),
      countCatalogVisibleBooks: jest.fn(),
    };
    mockBookEngagementService = { summarizeOwnerEngagement: jest.fn() };
    adminDashboardSummaryService = new AdminDashboardSummaryService(
      mockUserService as unknown as UserService,
      mockBookService as unknown as BookService,
      mockBookEngagementService as unknown as BookEngagementService,
    );
  });

  it('returns zeros when the platform has no users, books, or engagement', async () => {
    mockUserService.listUsers.mockResolvedValue({ entities: [], total: 0 });
    mockBookService.listBooks.mockResolvedValue({ entities: [], total: 0 });
    mockBookService.countCatalogVisibleBooks.mockResolvedValue(0);
    mockBookEngagementService.summarizeOwnerEngagement.mockResolvedValue({
      totalActiveReadingMs: 0,
      totalActiveSpreadMs: 0,
      totalVisualSceneTimeMs: 0,
      totalWeightedEngagement: 0,
    });
    const actualSummary = await adminDashboardSummaryService.getAdminDashboardSummary();
    expect(actualSummary).toEqual({
      totalUsers: 0,
      totalPublishers: 0,
      totalBooks: 0,
      publishedBooks: 0,
      pendingReviewBooks: 0,
      totalReadingMinutes: 0,
    });
  });

  it('counts publishers by isPublisher and published books by catalog visibility', async () => {
    mockUserService.listUsers.mockImplementation(async (input: { isPublisher?: boolean }) => {
      if (input.isPublisher === true) {
        return { entities: [], total: 3 };
      }
      return { entities: [], total: 10 };
    });
    mockBookService.listBooks.mockImplementation(async (input: { publishingStatus?: string }) => {
      if (input.publishingStatus === BookPublishingStatus.IN_REVIEW) {
        return { entities: [], total: 2 };
      }
      return { entities: [], total: 8 };
    });
    mockBookService.countCatalogVisibleBooks.mockResolvedValue(5);
    mockBookEngagementService.summarizeOwnerEngagement.mockResolvedValue({
      totalActiveReadingMs: 60_000,
      totalActiveSpreadMs: 30_000,
      totalVisualSceneTimeMs: 999_000,
      totalWeightedEngagement: 12,
    });
    const actualSummary = await adminDashboardSummaryService.getAdminDashboardSummary();
    expect(mockUserService.listUsers).toHaveBeenCalledWith({ limit: DASHBOARD_COUNT_PAGE_SIZE });
    expect(mockUserService.listUsers).toHaveBeenCalledWith({
      limit: DASHBOARD_COUNT_PAGE_SIZE,
      isPublisher: true,
    });
    expect(mockBookService.listBooks).toHaveBeenCalledWith({ limit: DASHBOARD_COUNT_PAGE_SIZE });
    expect(mockBookService.listBooks).toHaveBeenCalledWith({
      limit: DASHBOARD_COUNT_PAGE_SIZE,
      publishingStatus: BookPublishingStatus.IN_REVIEW,
    });
    expect(mockBookService.countCatalogVisibleBooks).toHaveBeenCalledWith();
    expect(mockBookEngagementService.summarizeOwnerEngagement).toHaveBeenCalledWith({});
    expect(actualSummary).toEqual({
      totalUsers: 10,
      totalPublishers: 3,
      totalBooks: 8,
      publishedBooks: 5,
      pendingReviewBooks: 2,
      totalReadingMinutes: 1.5,
    });
  });
});
