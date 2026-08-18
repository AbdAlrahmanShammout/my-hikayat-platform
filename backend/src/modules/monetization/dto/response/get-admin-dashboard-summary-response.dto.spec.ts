import { GetAdminDashboardSummaryResponseDto } from './get-admin-dashboard-summary-response.dto';

describe('GetAdminDashboardSummaryResponseDto', () => {
  it('copies the platform KPI fields onto the HTTP envelope', () => {
    const actualResponse = new GetAdminDashboardSummaryResponseDto({
      totalUsers: 10,
      totalPublishers: 3,
      totalBooks: 8,
      publishedBooks: 5,
      pendingReviewBooks: 2,
      totalReadingMinutes: 1.5,
    });
    expect(actualResponse).toEqual({
      totalUsers: 10,
      totalPublishers: 3,
      totalBooks: 8,
      publishedBooks: 5,
      pendingReviewBooks: 2,
      totalReadingMinutes: 1.5,
    });
  });
});
