/**
 * Generated from http://localhost:3000/docs/author-json. Do not edit by hand.
 * Regenerate with: pnpm --filter frontend generate:api
 */

export interface paths {
  "/auth/register": {
    post: {
      requestBody: { content: { 'application/json': components['schemas']['RegisterRequestDto'] } };
      responses: {
        "201": { content: { 'application/json': components['schemas']['AuthSessionResponseDto'] } };
      };
    };
  };
  "/auth/accept-admin-invitation": {
    post: {
      requestBody: { content: { 'application/json': components['schemas']['AcceptAdminInvitationRequestDto'] } };
      responses: {
        "201": { content: { 'application/json': components['schemas']['AuthSessionResponseDto'] } };
      };
    };
  };
  "/auth/login": {
    post: {
      requestBody: { content: { 'application/json': components['schemas']['LoginRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['AuthSessionResponseDto'] } };
      };
    };
  };
  "/auth/me": {
    get: {
      responses: {
        "200": { content: { 'application/json': components['schemas']['UserResponse'] } };
      };
    };
  };
  "/author/books/{bookId}/source": {
    post: {
      parameters: { path: { bookId: number } };
      responses: {
        "201": { content: { 'application/json': components['schemas']['BookAssetResponse'] } };
      };
    };
  };
  "/author/books/{bookId}/preview-image": {
    post: {
      parameters: { path: { bookId: number } };
      responses: {
        "201": { content: { 'application/json': components['schemas']['BookAssetResponse'] } };
      };
    };
  };
  "/author/books/{bookId}/promo-video": {
    post: {
      parameters: { path: { bookId: number } };
      responses: {
        "201": { content: { 'application/json': components['schemas']['BookAssetResponse'] } };
      };
    };
  };
  "/author/books": {
    get: {
      parameters: { query?: { limit?: number; offset?: number; publishingStatus?: "pending" | "in_review" | "approved" | "rejected" } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetBooksResponseDto'] } };
      };
    };
    post: {
      requestBody: { content: { 'application/json': components['schemas']['CreateBookRequestDto'] } };
      responses: {
        "201": { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
  };
  "/author/books/{id}/rejection-history": {
    get: {
      parameters: { query?: { limit?: number; offset?: number }; path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetBookRejectionHistoryResponseDto'] } };
      };
    };
  };
  "/author/books/{id}": {
    get: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
    patch: {
      parameters: { path: { id: number } };
      requestBody: { content: { 'application/json': components['schemas']['UpdateBookRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
  };
  "/author/books/{bookId}/submit-for-review": {
    post: {
      parameters: { path: { bookId: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
  };
  "/author/categories": {
    get: {
      parameters: { query?: { limit?: number; offset?: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetCategoriesResponseDto'] } };
      };
    };
  };
  "/author/dashboard/summary": {
    get: {
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAuthorDashboardSummaryResponseDto'] } };
      };
    };
  };
  "/author/earnings/trend": {
    get: {
      parameters: { query?: { limit?: number; offset?: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAuthorEarningsTrendResponseDto'] } };
      };
    };
  };
  "/author/earnings": {
    get: {
      parameters: { query?: { revenuePeriodId: number; limit?: number; offset?: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAuthorEarningsResponseDto'] } };
      };
    };
  };
  "/author/analytics": {
    get: {
      parameters: { query?: { revenuePeriodId: number; limit?: number; offset?: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAuthorAnalyticsResponseDto'] } };
      };
    };
  };
  "/author/analytics/books/{bookId}/heatmap": {
    get: {
      parameters: { query?: { revenuePeriodId: number }; path: { bookId: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAuthorBookHeatmapResponseDto'] } };
      };
    };
  };
}

export interface components {
  schemas: {
    RegisterRequestDto: { email: string; password: string };
    UserResponse: { id: number; createdAt: string; updatedAt: string; email: string; role: "reader" | "author" | "admin"; isPublisher: boolean };
    AuthSessionResponseDto: { accessToken: string; tokenType: string; expiresIn: string; user: components['schemas']['UserResponse'] };
    AcceptAdminInvitationRequestDto: { token: string; password: string };
    LoginRequestDto: { email: string; password: string };
    BookAssetResponse: { id: number; createdAt: string; updatedAt: string; bookId: number; kind: "source" | "processed" | "preview_image" | "promo_video" | "audio"; storageKey: string; contentType: string; byteSize: number; checksumSha256?: unknown | null; originalFileName?: unknown | null; sortOrder: number; isEncrypted: boolean };
    CreateBookRequestDto: { title: string; description: string; bookType: "standard_chapter" | "picture_book" | "illustrated_chapter"; categoryIds?: Array<number> };
    CategoryResponse: { id: number; createdAt: string; updatedAt: string; name: string; slug: string; categoryWeight: number };
    BookResponse: { id: number; createdAt: string; updatedAt: string; title: string; description: string; layoutType?: "reflowable" | "fixed_layout" | null; bookType: "standard_chapter" | "picture_book" | "illustrated_chapter"; publishingStatus: "pending" | "in_review" | "approved" | "rejected"; processingStatus: "not_started" | "processing" | "ready" | "failed"; publishedAt?: unknown | null; ownerId: number; owner?: components['schemas']['UserResponse']; categories: Array<components['schemas']['CategoryResponse']>; cover?: components['schemas']['BookCoverResponse'] | null };
    BookCoverResponse: { url: string; expiresAt: string; contentType: string };
    GetBooksResponseDto: { books: Array<components['schemas']['BookResponse']>; total: number };
    AuditLogResponse: { id: number; createdAt: string; updatedAt: string; actorUserId: number; action: "book_submitted_for_review" | "book_approved" | "book_rejected" | "book_unpublished" | "book_republished" | "book_deleted" | "publisher_enabled" | "publisher_disabled" | "user_role_changed" | "user_deleted" | "subscription_canceled" | "subscription_payment_failed" | "collection_created" | "collection_updated" | "collection_deleted" | "collection_book_added" | "collection_book_removed" | "collection_reordered" | "revenue_calculated"; subjectType: "book" | "user" | "subscription" | "collection" | "revenue_period"; subjectId: number; reason?: unknown | null; metadata?: unknown | null };
    GetBookRejectionHistoryResponseDto: { rejections: Array<components['schemas']['AuditLogResponse']>; total: number };
    UpdateBookRequestDto: { title?: string; description?: string; bookType?: "standard_chapter" | "picture_book" | "illustrated_chapter"; categoryIds?: Array<number> };
    GetCategoriesResponseDto: { categories: Array<components['schemas']['CategoryResponse']>; total: number };
    GetAuthorDashboardSummaryResponseDto: { totalBooks: number; publishedBooks: number; pendingReviewBooks: number; totalReadingMinutes: number; authorCents: number };
    AuthorEarningsTrendPointResponse: { revenuePeriodId: number; startsAt: string; endsAt: string; status: "open" | "closed"; authorCents: number };
    GetAuthorEarningsTrendResponseDto: { points: Array<components['schemas']['AuthorEarningsTrendPointResponse']>; total: number };
    BookRevenueResponse: { id: number; createdAt: string; updatedAt: string; revenuePeriodId: number; bookId: number; ownerId: number; weightedEngagement: number; poolShareCents: number; platformCutCents: number; authorCents: number };
    GetAuthorEarningsResponseDto: { bookRevenues: Array<components['schemas']['BookRevenueResponse']>; total: number; authorCents: number };
    BookEngagementResponse: { id: number; createdAt: string; updatedAt: string; revenuePeriodId: number; bookId: number; layoutType: "reflowable" | "fixed_layout"; activeReadingMs: number; activeSpreadMs: number; visualSceneTimeMs: number; categoryWeight: number; weightedEngagement: number };
    GetAuthorAnalyticsResponseDto: { bookEngagements: Array<components['schemas']['BookEngagementResponse']>; total: number; totalActiveReadingMs: number; totalActiveSpreadMs: number; totalVisualSceneTimeMs: number; totalWeightedEngagement: number; totalReadingMinutes: number };
    AuthorBookHeatmapCellResponse: { spreadIndex: number; pageNumber: number; activeDurationMs: number; visualSceneTimeMs: number };
    AuthorBookChapterHeatmapCellResponse: { spineIndex: number; title?: unknown | null; activeDurationMs: number };
    GetAuthorBookHeatmapResponseDto: { bookId: number; revenuePeriodId: number; layoutType: "reflowable" | "fixed_layout" | null; spreads: Array<components['schemas']['AuthorBookHeatmapCellResponse']>; chapters: Array<components['schemas']['AuthorBookChapterHeatmapCellResponse']> };
  };
}
