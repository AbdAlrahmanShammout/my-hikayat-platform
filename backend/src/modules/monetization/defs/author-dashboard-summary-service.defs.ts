export type AuthorDashboardSummary = {
  readonly totalBooks: number;
  readonly publishedBooks: number;
  readonly pendingReviewBooks: number;
  readonly totalReadingMinutes: number;
  readonly authorCents: number;
};

export type GetAuthorDashboardSummaryServiceInput = {
  readonly ownerId: number;
};
