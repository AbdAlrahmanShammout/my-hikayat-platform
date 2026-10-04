/**
 * Generated from http://localhost:3000/docs/reader-json. Do not edit by hand.
 * Regenerate with: pnpm --filter frontend generate:api
 */

export interface paths {
  "/reader/catalog": {
    get: {
      parameters: { query?: { limit?: number; offset?: number; categoryId?: number; sort?: "newest" | "popularity" } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetBooksResponseDto'] } };
      };
    };
  };
  "/reader/catalog/{id}": {
    get: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
  };
  "/reader/books/{bookId}/delivery-grant": {
    post: {
      parameters: { path: { bookId: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['CreateBookAssetDeliveryGrantResponseDto'] } };
      };
    };
  };
  "/reader/books/{bookId}/content-key": {
    post: {
      parameters: { path: { bookId: number } };
      requestBody: { content: { 'application/json': components['schemas']['CreateBookAssetContentKeyRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['CreateBookAssetContentKeyResponseDto'] } };
      };
    };
  };
  "/reader/categories": {
    get: {
      parameters: { query?: { limit?: number; offset?: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetCategoriesResponseDto'] } };
      };
    };
  };
  "/reader/collections": {
    get: {
      parameters: { query?: { limit?: number; offset?: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetDiscoveryCollectionsResponseDto'] } };
      };
    };
  };
  "/reader/collections/{id}": {
    get: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['CollectionDiscoveryResponse'] } };
      };
    };
  };
  "/reader/books/{bookId}/offline-download": {
    post: {
      parameters: { path: { bookId: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['OfflineDownloadResponse'] } };
      };
    };
    delete: {
      parameters: { path: { bookId: number } };
      responses: {
        "204": { content?: never };
      };
    };
  };
  "/reader/platform-settings": {
    get: {
      responses: {
        "200": { content: { 'application/json': components['schemas']['PlatformSettingsResponse'] } };
      };
    };
  };
  "/reader/books/{id}/sessions": {
    post: {
      parameters: { path: { id: number } };
      requestBody: { content: { 'application/json': components['schemas']['StartReadingSessionRequestDto'] } };
      responses: {
        "201": { content: { 'application/json': components['schemas']['ReadingSessionResponse'] } };
      };
    };
  };
  "/reader/books/{id}/sessions/current": {
    get: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['ReadingSessionResponse'] } };
      };
    };
  };
  "/reader/books/{id}/sessions/{sessionId}/activity": {
    post: {
      parameters: { path: { id: number; sessionId: number } };
      requestBody: { content: { 'application/json': components['schemas']['IngestReadingActivityRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['ReadingSessionResponse'] } };
      };
    };
  };
  "/reader/books/{id}/sessions/{sessionId}/visual-engagement": {
    get: {
      parameters: { query?: { limit?: number; offset?: number }; path: { id: number; sessionId: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetReadingVisualEngagementsResponseDto'] } };
      };
    };
    post: {
      parameters: { path: { id: number; sessionId: number } };
      requestBody: { content: { 'application/json': components['schemas']['IngestReadingVisualEngagementRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['ReadingVisualEngagementResponse'] } };
      };
    };
  };
  "/reader/books/{id}/sessions/{sessionId}/end": {
    post: {
      parameters: { path: { id: number; sessionId: number } };
      requestBody: { content: { 'application/json': components['schemas']['EndReadingSessionRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['ReadingSessionResponse'] } };
      };
    };
  };
  "/reader/sync": {
    get: {
      parameters: { query?: { updatedSince?: string } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetReadingSyncResponseDto'] } };
      };
    };
  };
  "/reader/books/{id}/sync": {
    get: {
      parameters: { query?: { updatedSince?: string }; path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetReadingSyncResponseDto'] } };
      };
    };
  };
  "/reader/books/{id}/progress": {
    get: {
      parameters: { path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['ReadingProgressResponse'] } };
      };
    };
    put: {
      parameters: { path: { id: number } };
      requestBody: { content: { 'application/json': components['schemas']['SaveReadingProgressRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['ReadingProgressResponse'] } };
      };
    };
  };
  "/reader/books/{id}/bookmarks": {
    get: {
      parameters: { query?: { limit?: number; offset?: number }; path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetReadingBookmarksResponseDto'] } };
      };
    };
    post: {
      parameters: { path: { id: number } };
      requestBody: { content: { 'application/json': components['schemas']['CreateReadingBookmarkRequestDto'] } };
      responses: {
        "201": { content: { 'application/json': components['schemas']['ReadingBookmarkResponse'] } };
      };
    };
  };
  "/reader/books/{id}/bookmarks/{bookmarkId}": {
    delete: {
      parameters: { path: { id: number; bookmarkId: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['ReadingBookmarkResponse'] } };
      };
    };
  };
  "/reader/search": {
    get: {
      parameters: { query?: { limit?: number; offset?: number; title?: string; author?: string; publisher?: string } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetSearchBooksResponseDto'] } };
      };
    };
  };
  "/reader/search/{id}": {
    get: {
      parameters: { query?: { q: string; limit?: number; offset?: number }; path: { id: number } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetInBookSearchResponseDto'] } };
      };
    };
  };
  "/reader/billing/plans": {
    get: {
      parameters: { query?: { limit?: number; offset?: number; kind?: "free" | "monthly_paid" } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['GetPlansResponseDto'] } };
      };
    };
  };
  "/reader/billing/checkout": {
    post: {
      requestBody: { content: { 'application/json': components['schemas']['StartCheckoutRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['StartCheckoutResponseDto'] } };
      };
    };
  };
  "/reader/billing/checkout-return": {
    get: {
      parameters: { query?: { to: string } };
      responses: {
        "200": { content?: never };
      };
    };
  };
  "/reader/billing/subscription": {
    get: {
      responses: {
        "200": { content: { 'application/json': components['schemas']['SubscriptionResponse'] } };
      };
    };
  };
  "/reader/billing/trial/start": {
    post: {
      responses: {
        "200": { content: { 'application/json': components['schemas']['SubscriptionResponse'] } };
      };
    };
  };
  "/reader/billing/refund": {
    post: {
      responses: {
        "200": { content: { 'application/json': components['schemas']['SubscriptionResponse'] } };
      };
    };
  };
  "/reader/billing/cancel": {
    post: {
      responses: {
        "200": { content: { 'application/json': components['schemas']['SubscriptionResponse'] } };
      };
    };
  };
  "/webhooks/stripe": {
    post: {
      responses: {
        "200": { content: { 'application/json': components['schemas']['StripeWebhookReceivedResponseDto'] } };
      };
    };
  };
  "/user/publisher": {
    post: {
      responses: {
        "200": { content: { 'application/json': components['schemas']['AuthSessionResponseDto'] } };
      };
    };
  };
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
}

export interface components {
  schemas: {
    UserResponse: { id: number; createdAt: string; updatedAt: string; email: string; displayName: string | null; role: "reader" | "author" | "admin"; isPublisher: boolean };
    CategoryResponse: { id: number; createdAt: string; updatedAt: string; name: string; slug: string; categoryWeight: number };
    BookCoverResponse: { url: string; expiresAt: string; contentType: string };
    BookResponse: { id: number; createdAt: string; updatedAt: string; title: string; description: string; layoutType?: "reflowable" | "fixed_layout" | null; bookType: "standard_chapter" | "picture_book" | "illustrated_chapter"; publishingStatus: "pending" | "in_review" | "approved" | "rejected"; processingStatus: "not_started" | "processing" | "ready" | "failed"; publishedAt?: string | null; ownerId: number; owner?: components['schemas']['UserResponse']; categories: Array<components['schemas']['CategoryResponse']>; authorName?: string | null; publisherName?: string | null; cover?: (components['schemas']['BookCoverResponse']) | null };
    AdminBookAppliedFilters: { q?: string; categoryId?: Array<number>; authorName?: string; publisherName?: string; ownerId?: Array<number>; bookType?: Array<"standard_chapter" | "picture_book" | "illustrated_chapter">; layoutType?: Array<"reflowable" | "fixed_layout">; publishingStatus?: Array<"pending" | "in_review" | "approved" | "rejected">; processingStatus?: Array<"not_started" | "processing" | "ready" | "failed">; catalogVisible?: boolean; sortBy?: "createdAt" | "publishedAt" | "title" | "updatedAt"; sortOrder?: "asc" | "desc" };
    GetBooksResponseDto: { books: Array<components['schemas']['BookResponse']>; total: number; appliedFilters?: components['schemas']['AdminBookAppliedFilters'] };
    CreateBookAssetDeliveryGrantResponseDto: { bookId: number; bookAssetId: number; kind: "source" | "processed" | "preview_image" | "promo_video" | "audio"; url: string; expiresAt: string; contentType: string; byteSize: number; checksumSha256?: string | null; isEncrypted: boolean };
    CreateBookAssetContentKeyRequestDto: { sessionId: number };
    OfflineReadingLeaseResponse: { version: number; keyId: string; userId: number; bookId: number; bookAssetId: number; accessKind: "trial" | "paid"; issuedAt: string; expiresAt: string; signature: string };
    CreateBookAssetContentKeyResponseDto: { bookId: number; bookAssetId: number; sessionId: number; keyId: string; algorithm: string; keyDelivery: string; key: string; expiresAt: string; offlineLease: components['schemas']['OfflineReadingLeaseResponse'] };
    GetCategoriesResponseDto: { categories: Array<components['schemas']['CategoryResponse']>; total: number };
    CollectionCoverResponse: { url: string; expiresAt: string; contentType: string };
    CollectionDiscoveryResponse: { id: number; createdAt: string; updatedAt: string; title: string; description: string | null; cover?: (components['schemas']['CollectionCoverResponse']) | null; books: Array<components['schemas']['BookResponse']> };
    GetDiscoveryCollectionsResponseDto: { collections: Array<components['schemas']['CollectionDiscoveryResponse']>; total: number };
    OfflineDownloadResponse: { id: number; createdAt: string; updatedAt: string; userId: number; bookId: number };
    PlatformSettingsResponse: { privacyPolicyUrl: string | null; termsOfServiceUrl: string | null; aboutMission: string | null; authCoverMediaUrl: string | null };
    StartReadingSessionRequestDto: { spineIndex?: number; scrollOffset?: number; spreadIndex?: number; pageNumber?: number };
    ReadingSessionResponse: { id: number; createdAt: string; updatedAt: string; userId: number; bookId: number; layoutType: "reflowable" | "fixed_layout"; startedAt: string; endedAt?: string | null; activeDurationMs: number; idleDurationMs: number; spineIndex?: number | null; scrollOffset?: number | null; spreadIndex?: number | null; pageNumber?: number | null };
    IngestReadingActivityRequestDto: { activeDurationMs: number; idleDurationMs: number; spineIndex?: number; scrollOffset?: number; spreadIndex?: number; pageNumber?: number };
    IngestReadingVisualEngagementRequestDto: { spreadIndex: number; pageNumber: number; activeDurationMs: number; visualSceneTimeMs: number };
    ReadingVisualEngagementResponse: { id: number; createdAt: string; updatedAt: string; userId: number; bookId: number; sessionId: number; layoutType: "reflowable" | "fixed_layout"; spreadIndex: number; pageNumber: number; activeDurationMs: number; visualSceneTimeMs: number };
    GetReadingVisualEngagementsResponseDto: { visualEngagements: Array<components['schemas']['ReadingVisualEngagementResponse']>; total: number };
    EndReadingSessionRequestDto: { activeDurationMs?: number; idleDurationMs?: number; spineIndex?: number; scrollOffset?: number; spreadIndex?: number; pageNumber?: number };
    ReadingProgressResponse: { id: number; createdAt: string; updatedAt: string; userId: number; bookId: number; layoutType: "reflowable" | "fixed_layout"; spineIndex?: number | null; scrollOffset?: number | null; spreadIndex?: number | null; pageNumber?: number | null; lastSessionAt: string; contentProgressPercent?: number | null; locationLabel?: string | null };
    ReadingBookmarkResponse: { id: number; createdAt: string; updatedAt: string; userId: number; bookId: number; layoutType: "reflowable" | "fixed_layout"; spineIndex?: number | null; scrollOffset?: number | null; spreadIndex?: number | null; pageNumber?: number | null };
    GetReadingSyncResponseDto: { progress: Array<components['schemas']['ReadingProgressResponse']>; progressTotal: number; bookmarks: Array<components['schemas']['ReadingBookmarkResponse']>; bookmarksTotal: number };
    SaveReadingProgressRequestDto: { spineIndex?: number; scrollOffset?: number; spreadIndex?: number; pageNumber?: number };
    CreateReadingBookmarkRequestDto: { spineIndex?: number; scrollOffset?: number; spreadIndex?: number; pageNumber?: number };
    GetReadingBookmarksResponseDto: { bookmarks: Array<components['schemas']['ReadingBookmarkResponse']>; total: number };
    GetSearchBooksResponseDto: { books: Array<components['schemas']['BookResponse']>; total: number };
    InBookSearchHighlightResponse: { text: string; x: number; y: number; width?: number | null; height?: number | null };
    InBookSearchHitResponse: { layoutType: "reflowable" | "fixed_layout"; spineIndex: number; pageNumber?: number | null; spreadIndex?: number | null; title: string; excerpt: string; matchOffset: number; highlights: Array<components['schemas']['InBookSearchHighlightResponse']> };
    GetInBookSearchResponseDto: { hits: Array<components['schemas']['InBookSearchHitResponse']>; total: number };
    PlanResponse: { id: number; createdAt: string; updatedAt: string; slug: string; name: string; description: string; kind: "free" | "monthly_paid"; interval: "month" | null; stripePriceId?: string | null; amountCents: number | null; currency: string | null };
    GetPlansResponseDto: { plans: Array<components['schemas']['PlanResponse']>; total: number };
    StartCheckoutRequestDto: { planId: number; successUrl: string; cancelUrl: string };
    StartCheckoutResponseDto: { url: string };
    SubscriptionResponse: { id: number; createdAt: string; updatedAt: string; userId: number; planId: number; status: "active" | "canceled"; startedAt: string; currentPeriodStart?: string | null; currentPeriodEnd?: string | null; canceledAt?: unknown | null; activatedAt?: string | null; trialStartedAt?: string | null; trialEndsAt?: string | null; readingAccessState: "free" | "trial" | "paid"; trialEligible: boolean; plan?: components['schemas']['PlanResponse']; user?: components['schemas']['UserResponse'] };
    StripeWebhookReceivedResponseDto: { received: boolean };
    AuthSessionResponseDto: { accessToken: string; refreshToken: string; tokenType: string; expiresIn: string; user: components['schemas']['UserResponse'] };
    RegisterRequestDto: { email: string; displayName: string; password: string };
    AcceptAdminInvitationRequestDto: { token: string; password: string };
    LoginRequestDto: { email: string; password: string };
    RefreshSessionRequestDto: { refreshToken: string };
    LogoutRequestDto: { refreshToken: string };
    ForgotPasswordRequestDto: { email: string };
    ForgotPasswordResponseDto: { message: string };
    ResetPasswordRequestDto: { token: string; password: string };
    ResetPasswordResponseDto: { message: string };
  };
}
