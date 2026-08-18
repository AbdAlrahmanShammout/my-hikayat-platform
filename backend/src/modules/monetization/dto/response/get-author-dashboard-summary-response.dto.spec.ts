import { GetAuthorDashboardSummaryResponseDto } from './get-author-dashboard-summary-response.dto';

describe('GetAuthorDashboardSummaryResponseDto', () => {
  it('copies the owner-scoped KPI fields onto the HTTP envelope', () => {
    const actualResponse = new GetAuthorDashboardSummaryResponseDto({
      totalBooks: 4,
      publishedBooks: 2,
      pendingReviewBooks: 1,
      totalReadingMinutes: 1.5,
      authorCents: 7000,
    });
    expect(actualResponse).toEqual({
      totalBooks: 4,
      publishedBooks: 2,
      pendingReviewBooks: 1,
      totalReadingMinutes: 1.5,
      authorCents: 7000,
    });
  });
});
