/**
 * Generated from http://localhost:3000/docs/admin-json. Do not edit by hand.
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
  "/auth/refresh": {
    post: {
      requestBody: { content: { 'application/json': components['schemas']['RefreshSessionRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['AuthSessionResponseDto'] } };
      };
    };
  };
  "/auth/logout": {
    post: {
      requestBody: { content: { 'application/json': components['schemas']['LogoutRequestDto'] } };
      responses: {
        "204": { content?: never };
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
  "/auth/forgot-password": {
    post: {
      requestBody: { content: { 'application/json': components['schemas']['ForgotPasswordRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['ForgotPasswordResponseDto'] } };
      };
    };
  };
  "/auth/reset-password": {
    post: {
      requestBody: { content: { 'application/json': components['schemas']['ResetPasswordRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['ResetPasswordResponseDto'] } };
      };
    };
  };
  "/admin/audit-logs": {
    get: {
      parameters: { query?: { limit?: number; offset?: number; actorUserId?: number; action?: "book_submitted_for_review" | "book_approved" | "book_rejected" | "book_unpublished" | "book_republished" | "book_deleted" | "book_content_key_issued" | "publisher_enabled" | "publisher_disabled" | "user_role_changed" | "user_deleted" | "subscription_canceled" | "subscription_payment_failed" | "collection_created" | "collection_updated" | "collection_deleted" | "collection_book_added" | "collection_book_removed" | "collection_reordered" | "revenue_calculated" | "invitation_created" | "invitation_resent" | "invitation_revoked" | "export_requested"; subjectType?: "book" | "user" | "subscription" | "collection" | "revenue_period" | "invitation" | "admin_export"; subjectId?: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAuditLogsResponseDto'] } };
      };
    };
  };
  "/admin/audit-logs/{id}": {
    get: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['AuditLogResponse'] } };
      };
    };
  };
  "/admin/books": {
    get: {
      parameters: { query?: { limit?: number; offset?: number; q?: string; categoryId?: Array<number>; authorName?: string; publisherName?: string; ownerId?: Array<number>; bookType?: Array<"standard_chapter" | "picture_book" | "illustrated_chapter">; layoutType?: Array<"reflowable" | "fixed_layout">; publishingStatus?: Array<"pending" | "in_review" | "approved" | "rejected">; processingStatus?: Array<"not_started" | "processing" | "ready" | "failed">; catalogVisible?: boolean; sortBy?: "createdAt" | "publishedAt" | "title" | "updatedAt"; sortOrder?: "asc" | "desc" } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetBooksResponseDto'] } };
      };
    };
  };
  "/admin/books/{id}/rejection-history": {
    get: {
      parameters: { query?: { limit?: number; offset?: number }; path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetBookRejectionHistoryResponseDto'] } };
      };
    };
  };
  "/admin/books/{id}": {
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
    delete: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
  };
  "/admin/books/{id}/approve": {
    post: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
  };
  "/admin/books/{id}/reject": {
    post: {
      parameters: { path: { id: number } };
      requestBody: { content: { 'application/json': components['schemas']['RejectBookRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
  };
  "/admin/books/{id}/unpublish": {
    post: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
  };
  "/admin/books/{id}/republish": {
    post: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
  };
  "/admin/categories": {
    get: {
      parameters: { query?: { limit?: number; offset?: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetCategoriesResponseDto'] } };
      };
    };
    post: {
      requestBody: { content: { 'application/json': components['schemas']['CreateCategoryRequestDto'] } };
      responses: {
        "201": { content: { 'application/json': components['schemas']['CategoryResponse'] } };
      };
    };
  };
  "/admin/categories/{id}": {
    get: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['CategoryResponse'] } };
      };
    };
    patch: {
      parameters: { path: { id: number } };
      requestBody: { content: { 'application/json': components['schemas']['UpdateCategoryRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['CategoryResponse'] } };
      };
    };
  };
  "/admin/collections": {
    get: {
      parameters: { query?: { limit?: number; offset?: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetCollectionsResponseDto'] } };
      };
    };
    post: {
      requestBody: { content: { 'application/json': components['schemas']['CreateCollectionRequestDto'] } };
      responses: {
        "201": { content: { 'application/json': components['schemas']['CollectionResponse'] } };
      };
    };
  };
  "/admin/collections/{id}": {
    get: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['CollectionResponse'] } };
      };
    };
    patch: {
      parameters: { path: { id: number } };
      requestBody: { content: { 'application/json': components['schemas']['UpdateCollectionRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['CollectionResponse'] } };
      };
    };
    delete: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['CollectionResponse'] } };
      };
    };
  };
  "/admin/collections/{id}/cover": {
    post: {
      parameters: { path: { id: number } };
      responses: {
        "201": { content: { 'application/json': components['schemas']['CollectionResponse'] } };
      };
    };
    delete: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['CollectionResponse'] } };
      };
    };
  };
  "/admin/collections/{id}/books": {
    post: {
      parameters: { path: { id: number } };
      requestBody: { content: { 'application/json': components['schemas']['AddCollectionBookRequestDto'] } };
      responses: {
        "201": { content: { 'application/json': components['schemas']['CollectionResponse'] } };
      };
    };
  };
  "/admin/collections/{id}/books/{bookId}": {
    delete: {
      parameters: { path: { id: number; bookId: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['CollectionResponse'] } };
      };
    };
  };
  "/admin/collections/{id}/reorder": {
    post: {
      parameters: { path: { id: number } };
      requestBody: { content: { 'application/json': components['schemas']['ReorderCollectionBooksRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['CollectionResponse'] } };
      };
    };
  };
  "/admin/dashboard/summary": {
    get: {
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAdminDashboardSummaryResponseDto'] } };
      };
    };
  };
  "/admin/dashboard/reading": {
    get: {
      parameters: { query?: { limit?: number; offset?: number; ownerId?: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAdminDashboardReadingResponseDto'] } };
      };
    };
  };
  "/admin/revenue-periods": {
    get: {
      parameters: { query?: { limit?: number; offset?: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetRevenuePeriodsResponseDto'] } };
      };
    };
    post: {
      requestBody: { content: { 'application/json': components['schemas']['CreateRevenuePeriodRequestDto'] } };
      responses: {
        "201": { content: { 'application/json': components['schemas']['RevenuePeriodResponse'] } };
      };
    };
  };
  "/admin/revenue-periods/current": {
    post: {
      responses: {
        "200": { content: { 'application/json': components['schemas']['RevenuePeriodResponse'] } };
      };
    };
  };
  "/admin/revenue-periods/{id}": {
    get: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['RevenuePeriodResponse'] } };
      };
    };
    patch: {
      parameters: { path: { id: number } };
      requestBody: { content: { 'application/json': components['schemas']['UpdateRevenuePeriodRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['RevenuePeriodResponse'] } };
      };
    };
  };
  "/admin/revenue-periods/{id}/close": {
    post: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['RevenuePeriodResponse'] } };
      };
    };
  };
  "/admin/revenue-periods/{id}/engagements": {
    post: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAdminPeriodAnalyticsResponseDto'] } };
      };
    };
  };
  "/admin/revenue-periods/{id}/calculate": {
    post: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAdminPeriodEarningsResponseDto'] } };
      };
    };
  };
  "/admin/revenue-periods/{id}/earnings": {
    get: {
      parameters: { query?: { limit?: number; offset?: number; ownerId?: number }; path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAdminPeriodEarningsResponseDto'] } };
      };
    };
  };
  "/admin/revenue-periods/{id}/analytics": {
    get: {
      parameters: { query?: { limit?: number; offset?: number; ownerId?: number }; path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAdminPeriodAnalyticsResponseDto'] } };
      };
    };
  };
  "/admin/revenue-periods/{id}/books/{bookId}/heatmap": {
    get: {
      parameters: { path: { id: number; bookId: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAdminPeriodBookHeatmapResponseDto'] } };
      };
    };
  };
  "/admin/platform-settings": {
    get: {
      responses: {
        "200": { content: { 'application/json': components['schemas']['PlatformSettingsResponse'] } };
      };
    };
    patch: {
      requestBody: { content: { 'application/json': components['schemas']['UpdatePlatformSettingsRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['PlatformSettingsResponse'] } };
      };
    };
  };
  "/admin/plans": {
    get: {
      parameters: { query?: { limit?: number; offset?: number; kind?: "free" | "monthly_paid" } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetPlansResponseDto'] } };
      };
    };
    post: {
      requestBody: { content: { 'application/json': components['schemas']['CreatePlanRequestDto'] } };
      responses: {
        "201": { content: { 'application/json': components['schemas']['PlanResponse'] } };
      };
    };
  };
  "/admin/plans/{id}": {
    get: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['PlanResponse'] } };
      };
    };
    patch: {
      parameters: { path: { id: number } };
      requestBody: { content: { 'application/json': components['schemas']['UpdatePlanRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['PlanResponse'] } };
      };
    };
  };
  "/admin/subscriptions": {
    get: {
      parameters: { query?: { limit?: number; offset?: number; userId?: number; status?: "active" | "canceled" } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetSubscriptionsResponseDto'] } };
      };
    };
  };
  "/admin/subscriptions/{id}/support-context": {
    get: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetSubscriptionSupportContextResponseDto'] } };
      };
    };
  };
  "/admin/subscriptions/{id}": {
    get: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['SubscriptionResponse'] } };
      };
    };
  };
  "/admin/subscriptions/{id}/cancel": {
    post: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['SubscriptionResponse'] } };
      };
    };
  };
  "/admin/subscriptions/{id}/refund": {
    post: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['SubscriptionResponse'] } };
      };
    };
  };
  "/admin/users": {
    get: {
      parameters: { query?: { limit?: number; offset?: number; role?: "reader" | "author" | "admin"; excludeRole?: "reader" | "author" | "admin"; isPublisher?: boolean; email?: string; q?: string; sortBy?: "createdAt" | "email" | "displayName"; sortOrder?: "asc" | "desc" } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetUsersResponseDto'] } };
      };
    };
  };
  "/admin/users/{userId}/reading-progress": {
    get: {
      parameters: { query?: { limit?: number; offset?: number }; path: { userId: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAdminUserReadingProgressResponseDto'] } };
      };
    };
  };
  "/admin/users/{userId}/books/{bookId}/engagement": {
    get: {
      parameters: { path: { userId: number; bookId: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAdminUserBookEngagementResponseDto'] } };
      };
    };
  };
  "/admin/users/{id}": {
    get: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAdminUserDetailResponseDto'] } };
      };
    };
    patch: {
      parameters: { path: { id: number } };
      requestBody: { content: { 'application/json': components['schemas']['UpdateManagedUserRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['UserResponse'] } };
      };
    };
    delete: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['UserResponse'] } };
      };
    };
  };
  "/admin/invitations": {
    get: {
      parameters: { query?: { limit?: number; offset?: number; status?: "pending" | "expired" | "accepted" | "revoked"; email?: string } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAdminInvitationsResponseDto'] } };
      };
    };
    post: {
      requestBody: { content: { 'application/json': components['schemas']['CreateAdminInvitationRequestDto'] } };
      responses: {
        "201": { content: { 'application/json': components['schemas']['CreateAdminInvitationResponseDto'] } };
      };
    };
  };
  "/admin/invitations/{id}/resend": {
    post: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['AdminInvitationResponse'] } };
      };
    };
  };
  "/admin/invitations/{id}/revoke": {
    post: {
      parameters: { path: { id: number } };
      requestBody: { content: { 'application/json': components['schemas']['RevokeAdminInvitationRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['AdminInvitationResponse'] } };
      };
    };
  };
  "/admin/publishers": {
    get: {
      parameters: { query?: { limit?: number; offset?: number; q?: string; sortBy?: "createdAt" | "email" | "bookCount"; sortOrder?: "asc" | "desc" } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAdminPublishersResponseDto'] } };
      };
    };
  };
  "/admin/publishers/{userId}/summary": {
    get: {
      parameters: { query?: { revenuePeriodId?: number }; path: { userId: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetAdminPublisherSummaryResponseDto'] } };
      };
    };
  };
  "/admin/exports/estimate": {
    post: {
      requestBody: { content: { 'application/json': components['schemas']['CreateAdminExportRequestDto'] } };
      responses: {
        "200": { content?: never };
      };
    };
  };
  "/admin/exports": {
    get: {
      parameters: { query?: { limit?: number; offset?: number } };
      responses: {
        "200": { content?: never };
      };
    };
    post: {
      requestBody: { content: { 'application/json': components['schemas']['CreateAdminExportRequestDto'] } };
      responses: {
        "202": { content?: never };
      };
    };
  };
  "/admin/exports/{id}/download": {
    get: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content?: never };
      };
    };
  };
  "/admin/exports/{id}": {
    get: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content?: never };
      };
    };
  };
  "/admin/search": {
    get: {
      parameters: { query?: { q: string; type?: "users" | "books" | "epubAuthors" | "publishers" | "categories" | "subscriptions"; limit?: number; offset?: number } };
      responses: {
        "200": { content?: never };
      };
    };
  };
}

export interface components {
  schemas: {
    RegisterRequestDto: { email: string; displayName: string; password: string };
    UserResponse: { id: number; createdAt: string; updatedAt: string; email: string; displayName: string | null; role: "reader" | "author" | "admin"; isPublisher: boolean };
    AuthSessionResponseDto: { accessToken: string; refreshToken: string; tokenType: string; expiresIn: string; user: components['schemas']['UserResponse'] };
    AcceptAdminInvitationRequestDto: { token: string; password: string };
    LoginRequestDto: { email: string; password: string };
    RefreshSessionRequestDto: { refreshToken: string };
    LogoutRequestDto: { refreshToken: string };
    ForgotPasswordRequestDto: { email: string };
    ForgotPasswordResponseDto: { message: string };
    ResetPasswordRequestDto: { token: string; password: string };
    ResetPasswordResponseDto: { message: string };
    AuditLogResponse: { id: number; createdAt: string; updatedAt: string; actorUserId: number; action: "book_submitted_for_review" | "book_approved" | "book_rejected" | "book_unpublished" | "book_republished" | "book_deleted" | "book_content_key_issued" | "publisher_enabled" | "publisher_disabled" | "user_role_changed" | "user_deleted" | "subscription_canceled" | "subscription_payment_failed" | "collection_created" | "collection_updated" | "collection_deleted" | "collection_book_added" | "collection_book_removed" | "collection_reordered" | "revenue_calculated" | "invitation_created" | "invitation_resent" | "invitation_revoked" | "export_requested"; subjectType: "book" | "user" | "subscription" | "collection" | "revenue_period" | "invitation" | "admin_export"; subjectId: number; reason?: string | null; metadata?: unknown | null; actor?: components['schemas']['UserResponse'] };
    GetAuditLogsResponseDto: { auditLogs: Array<components['schemas']['AuditLogResponse']>; total: number };
    CategoryResponse: { id: number; createdAt: string; updatedAt: string; name: string; slug: string; categoryWeight: number };
    BookCoverResponse: { url: string; expiresAt: string; contentType: string };
    BookResponse: { id: number; createdAt: string; updatedAt: string; title: string; description: string; layoutType?: "reflowable" | "fixed_layout" | null; bookType: "standard_chapter" | "picture_book" | "illustrated_chapter"; publishingStatus: "pending" | "in_review" | "approved" | "rejected"; processingStatus: "not_started" | "processing" | "ready" | "failed"; publishedAt?: string | null; ownerId: number; owner?: components['schemas']['UserResponse']; categories: Array<components['schemas']['CategoryResponse']>; authorName?: string | null; publisherName?: string | null; cover?: (components['schemas']['BookCoverResponse']) | null };
    AdminBookAppliedFilters: { q?: string; categoryId?: Array<number>; authorName?: string; publisherName?: string; ownerId?: Array<number>; bookType?: Array<"standard_chapter" | "picture_book" | "illustrated_chapter">; layoutType?: Array<"reflowable" | "fixed_layout">; publishingStatus?: Array<"pending" | "in_review" | "approved" | "rejected">; processingStatus?: Array<"not_started" | "processing" | "ready" | "failed">; catalogVisible?: boolean; sortBy?: "createdAt" | "publishedAt" | "title" | "updatedAt"; sortOrder?: "asc" | "desc" };
    GetBooksResponseDto: { books: Array<components['schemas']['BookResponse']>; total: number; appliedFilters?: components['schemas']['AdminBookAppliedFilters'] };
    GetBookRejectionHistoryResponseDto: { rejections: Array<components['schemas']['AuditLogResponse']>; total: number };
    UpdateBookRequestDto: { title?: string; description?: string; bookType?: "standard_chapter" | "picture_book" | "illustrated_chapter"; categoryIds?: Array<number> };
    RejectBookRequestDto: { reason: string };
    CreateCategoryRequestDto: { name: string; slug?: string; categoryWeight?: number };
    GetCategoriesResponseDto: { categories: Array<components['schemas']['CategoryResponse']>; total: number };
    UpdateCategoryRequestDto: { name?: string; slug?: string; categoryWeight?: number };
    CreateCollectionRequestDto: { title: string; description?: string | null; bookIds?: Array<number> };
    CollectionCoverResponse: { url: string; expiresAt: string; contentType: string };
    CollectionBookResponse: { id: number; createdAt: string; updatedAt: string; collectionId: number; bookId: number; displayOrder: number };
    CollectionResponse: { id: number; createdAt: string; updatedAt: string; title: string; description: string | null; cover?: (components['schemas']['CollectionCoverResponse']) | null; items: Array<components['schemas']['CollectionBookResponse']> };
    GetCollectionsResponseDto: { collections: Array<components['schemas']['CollectionResponse']>; total: number };
    UpdateCollectionRequestDto: { title?: string; description?: string | null };
    AddCollectionBookRequestDto: { bookId: number };
    ReorderCollectionBooksRequestDto: { bookIds: Array<number> };
    GetAdminDashboardSummaryResponseDto: { totalUsers: number; totalPublishers: number; totalBooks: number; publishedBooks: number; pendingReviewBooks: number; totalReadingMinutes: number };
    AdminDashboardReadingBookResponse: { bookId: number; title: string; ownerId: number; activeReadingMs: number; activeSpreadMs: number; readingMinutes: number };
    GetAdminDashboardReadingResponseDto: { totalReadingMinutes: number; bookEngagements: Array<components['schemas']['AdminDashboardReadingBookResponse']>; total: number };
    RevenuePeriodResponse: { id: number; createdAt: string; updatedAt: string; startsAt: string; endsAt: string; status: "open" | "closed"; platformCutPercent: number; poolAmountCents?: number | null };
    GetRevenuePeriodsResponseDto: { revenuePeriods: Array<components['schemas']['RevenuePeriodResponse']>; total: number };
    CreateRevenuePeriodRequestDto: { startsAt: string; endsAt: string; platformCutPercent?: number; poolAmountCents?: number };
    UpdateRevenuePeriodRequestDto: { platformCutPercent?: number; poolAmountCents?: number };
    BookEngagementResponse: { id: number; createdAt: string; updatedAt: string; revenuePeriodId: number; bookId: number; layoutType: "reflowable" | "fixed_layout"; activeReadingMs: number; activeSpreadMs: number; visualSceneTimeMs: number; categoryWeight: number; weightedEngagement: number; book?: components['schemas']['BookResponse'] };
    GetAdminPeriodAnalyticsResponseDto: { period: components['schemas']['RevenuePeriodResponse']; bookEngagements: Array<components['schemas']['BookEngagementResponse']>; total: number; totalActiveReadingMs: number; totalActiveSpreadMs: number; totalVisualSceneTimeMs: number; totalWeightedEngagement: number; totalReadingMinutes: number };
    BookRevenueResponse: { id: number; createdAt: string; updatedAt: string; revenuePeriodId: number; bookId: number; ownerId: number; weightedEngagement: number; poolShareCents: number; platformCutCents: number; authorCents: number; book?: components['schemas']['BookResponse']; owner?: components['schemas']['UserResponse'] };
    GetAdminPeriodEarningsResponseDto: { period: components['schemas']['RevenuePeriodResponse']; bookRevenues: Array<components['schemas']['BookRevenueResponse']>; total: number; authorCents: number; platformCutCents?: number | null };
    AuthorBookHeatmapCellResponse: { spreadIndex: number; pageNumber: number; activeDurationMs: number; visualSceneTimeMs: number };
    AuthorBookChapterHeatmapCellResponse: { spineIndex: number; title?: string | null; activeDurationMs: number };
    GetAdminPeriodBookHeatmapResponseDto: { bookId: number; bookTitle: string; revenuePeriodId: number; layoutType: "reflowable" | "fixed_layout" | null; spreads: Array<components['schemas']['AuthorBookHeatmapCellResponse']>; chapters: Array<components['schemas']['AuthorBookChapterHeatmapCellResponse']> };
    PlatformSettingsResponse: { privacyPolicyUrl: string | null; termsOfServiceUrl: string | null; aboutMission: string | null; authCoverMediaUrl: string | null };
    UpdatePlatformSettingsRequestDto: { privacyPolicyUrl?: string | null; termsOfServiceUrl?: string | null; aboutMission?: string | null; authCoverMediaUrl?: string | null };
    CreatePlanRequestDto: { name: string; description: string; kind: "free" | "monthly_paid"; slug?: string; stripePriceId?: string };
    PlanResponse: { id: number; createdAt: string; updatedAt: string; slug: string; name: string; description: string; kind: "free" | "monthly_paid"; interval: "month" | null; stripePriceId?: string | null; amountCents: number | null; currency: string | null };
    GetPlansResponseDto: { plans: Array<components['schemas']['PlanResponse']>; total: number };
    UpdatePlanRequestDto: { name?: string; description?: string; stripePriceId?: string };
    SubscriptionResponse: { id: number; createdAt: string; updatedAt: string; userId: number; planId: number; status: "active" | "canceled"; startedAt: string; currentPeriodStart?: string | null; currentPeriodEnd?: string | null; canceledAt?: unknown | null; activatedAt?: string | null; trialStartedAt?: string | null; trialEndsAt?: string | null; readingAccessState: "free" | "trial" | "paid"; trialEligible: boolean; plan?: components['schemas']['PlanResponse']; user?: components['schemas']['UserResponse'] };
    GetSubscriptionsResponseDto: { subscriptions: Array<components['schemas']['SubscriptionResponse']>; total: number };
    SubscriptionSupportPlanResponse: { id: number; name: string; kind: "free" | "monthly_paid"; interval: string | null; amountCents: number | null; currency: string | null };
    SubscriptionSupportPaymentFailureResponse: { createdAt: string; invoiceStatus: string | null };
    GetSubscriptionSupportContextResponseDto: { computedAt: string; subscriptionId: number; userId: number; startedAt: string; activatedAt: string | null; status: "active" | "canceled"; plan: (components['schemas']['SubscriptionSupportPlanResponse']) | null; currentPeriodStart: string | null; currentPeriodEnd: string | null; canceledAt: string | null; trialStartedAt: string | null; trialEndsAt: string | null; readingAccessState: "free" | "trial" | "paid"; trialEligible: boolean; accessExplanationCode: "paid_until_period_end" | "trial_until" | "free"; refundEligible: boolean; refundIneligibilityCode: string | null; stripeCustomerId: string | null; stripeSubscriptionId: string | null; latestPaymentFailure?: (components['schemas']['SubscriptionSupportPaymentFailureResponse']) | null };
    AdminUserCurrentPlanResponse: { name: string; kind: "free" | "monthly_paid" };
    AdminUserListItemResponse: { id: number; createdAt: string; updatedAt: string; email: string; displayName: string | null; role: "reader" | "author" | "admin"; isPublisher: boolean; lastSessionAt: string | null; currentPlan: (components['schemas']['AdminUserCurrentPlanResponse']) | null };
    GetUsersResponseDto: { users: Array<components['schemas']['AdminUserListItemResponse']>; total: number };
    AdminUserReadingProgressItemResponse: { book: components['schemas']['BookResponse']; layoutType: "reflowable" | "fixed_layout"; contentProgressPercent: number; locationLabel?: string | null; spineIndex?: number | null; scrollOffset?: number | null; spreadIndex?: number | null; pageNumber?: number | null; activeDurationMs: number; lastSessionAt: string };
    GetAdminUserReadingProgressResponseDto: { readingProgress: Array<components['schemas']['AdminUserReadingProgressItemResponse']>; total: number };
    AdminUserChapterEngagementResponse: { spineIndex: number; title: string | null; activeDurationMs: number };
    AdminUserSpreadEngagementResponse: { spreadIndex: number; pageNumber: number; activeDurationMs: number; visualSceneTimeMs: number };
    GetAdminUserBookEngagementResponseDto: { userId: number; bookId: number; layoutType: "reflowable" | "fixed_layout" | null; activeDurationMs: number; chapters: Array<components['schemas']['AdminUserChapterEngagementResponse']>; spreads: Array<components['schemas']['AdminUserSpreadEngagementResponse']> };
    AdminUserSubscriptionPeriodResponse: { periodStartedAt?: string | null; periodEndsAt?: string | null; remainingMs?: number | null; elapsedPercent?: number | null };
    GetAdminUserDetailResponseDto: { user: components['schemas']['UserResponse']; subscription?: (components['schemas']['SubscriptionResponse']) | null; subscriptionPeriod: components['schemas']['AdminUserSubscriptionPeriodResponse']; readingProgress: Array<components['schemas']['AdminUserReadingProgressItemResponse']>; readingProgressTotal: number };
    UpdateManagedUserRequestDto: { role?: "reader" | "author" | "admin"; isPublisher?: boolean };
    AdminInvitationResponse: { id: number; createdAt: string; updatedAt: string; email: string; status: "pending" | "accepted" | "revoked"; expiresAt: string; invitedByUserId: number; acceptedAt?: unknown | null; lastSentAt?: unknown | null; resendCount: number; revokedAt?: unknown | null; revokedByUserId?: unknown | null; revokeReason?: unknown | null; invitedBy?: components['schemas']['UserResponse'] };
    GetAdminInvitationsResponseDto: { invitations: Array<components['schemas']['AdminInvitationResponse']>; total: number };
    CreateAdminInvitationRequestDto: { email: string };
    CreateAdminInvitationResponseDto: { invitation: components['schemas']['AdminInvitationResponse']; token: string };
    RevokeAdminInvitationRequestDto: { reason?: string };
    AdminPublisherResponse: { id: number; email: string; displayName: string | null; role: "reader" | "author" | "admin"; isPublisher: boolean; createdAt: string; bookCount: number; catalogVisibleBookCount: number };
    GetAdminPublishersResponseDto: { publishers: Array<components['schemas']['AdminPublisherResponse']>; total: number };
    AdminPublisherStatusCountResponse: { publishingStatus: "pending" | "in_review" | "approved" | "rejected"; count: number };
    AdminPublisherRecentBookResponse: { id: number; title: string; publishingStatus: "pending" | "in_review" | "approved" | "rejected"; authorName: string | null; publisherName: string | null };
    GetAdminPublisherSummaryResponseDto: { id: number; email: string; displayName: string | null; role: "reader" | "author" | "admin"; isPublisher: boolean; createdAt: string; total: number; catalogVisible: number; unpublishedApprovedCount: number; publishingStatusCounts: Array<components['schemas']['AdminPublisherStatusCountResponse']>; lifetimeAuthorCents: number; recentBooks: Array<components['schemas']['AdminPublisherRecentBookResponse']>; revenuePeriodLinks: Array<number> };
    CreateAdminExportRequestDto: { resource: "users" | "books" | "publishers" | "subscriptions" | "invitations" | "audit_logs"; filters?: unknown; columns?: Array<string>; selectedIds?: Array<number>; sortBy?: string; sortOrder?: "asc" | "desc" };
  };
}
