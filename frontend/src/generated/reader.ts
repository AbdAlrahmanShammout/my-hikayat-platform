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
  "/reader/billing/checkout": {
    post: {
      requestBody: { content: { 'application/json': components['schemas']['StartCheckoutRequestDto'] } };
      responses: {
        "200": { content: { 'application/json': components['schemas']['StartCheckoutResponseDto'] } };
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
  "/reader/billing/refund": {
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
  "/auth/me": {
    get: {
      responses: {
        "200": { content: { 'application/json': components['schemas']['UserResponse'] } };
      };
    };
  };
}

export interface components {
  schemas: {
    UserResponse: { id: number; createdAt: string; updatedAt: string; email: string; role: "reader" | "author" | "admin"; isPublisher: boolean };
    CategoryResponse: { id: number; createdAt: string; updatedAt: string; name: string; slug: string; categoryWeight: number };
    BookResponse: { id: number; createdAt: string; updatedAt: string; title: string; description: string; layoutType?: "reflowable" | "fixed_layout" | null; bookType: "standard_chapter" | "picture_book" | "illustrated_chapter"; publishingStatus: "pending" | "in_review" | "approved" | "rejected"; processingStatus: "not_started" | "processing" | "ready" | "failed"; publishedAt?: unknown | null; ownerId: number; owner?: components['schemas']['UserResponse']; categories: Array<components['schemas']['CategoryResponse']> };
    GetBooksResponseDto: { books: Array<components['schemas']['BookResponse']>; total: number };
    CreateBookAssetDeliveryGrantResponseDto: { bookId: number; bookAssetId: number; kind: "source" | "processed" | "preview_image" | "promo_video" | "audio"; url: string; expiresAt: string; contentType: string; byteSize: number; checksumSha256?: unknown | null; isEncrypted: boolean };
    GetCategoriesResponseDto: { categories: Array<components['schemas']['CategoryResponse']>; total: number };
    CollectionDiscoveryResponse: { id: number; createdAt: string; updatedAt: string; title: string; books: Array<components['schemas']['BookResponse']> };
    GetDiscoveryCollectionsResponseDto: { collections: Array<components['schemas']['CollectionDiscoveryResponse']>; total: number };
    StartReadingSessionRequestDto: { spineIndex?: number; scrollOffset?: number; spreadIndex?: number; pageNumber?: number };
    ReadingSessionResponse: { id: number; createdAt: string; updatedAt: string; userId: number; bookId: number; layoutType: "reflowable" | "fixed_layout"; startedAt: string; endedAt?: unknown | null; activeDurationMs: number; idleDurationMs: number; spineIndex?: unknown | null; scrollOffset?: unknown | null; spreadIndex?: unknown | null; pageNumber?: unknown | null };
    IngestReadingActivityRequestDto: { activeDurationMs: number; idleDurationMs: number; spineIndex?: number; scrollOffset?: number; spreadIndex?: number; pageNumber?: number };
    IngestReadingVisualEngagementRequestDto: { spreadIndex: number; pageNumber: number; activeDurationMs: number; visualSceneTimeMs: number };
    ReadingVisualEngagementResponse: { id: number; createdAt: string; updatedAt: string; userId: number; bookId: number; sessionId: number; layoutType: "reflowable" | "fixed_layout"; spreadIndex: number; pageNumber: number; activeDurationMs: number; visualSceneTimeMs: number };
    GetReadingVisualEngagementsResponseDto: { visualEngagements: Array<components['schemas']['ReadingVisualEngagementResponse']>; total: number };
    EndReadingSessionRequestDto: { activeDurationMs?: number; idleDurationMs?: number; spineIndex?: number; scrollOffset?: number; spreadIndex?: number; pageNumber?: number };
    ReadingProgressResponse: { id: number; createdAt: string; updatedAt: string; userId: number; bookId: number; layoutType: "reflowable" | "fixed_layout"; spineIndex?: unknown | null; scrollOffset?: unknown | null; spreadIndex?: unknown | null; pageNumber?: unknown | null; lastSessionAt: string };
    ReadingBookmarkResponse: { id: number; createdAt: string; updatedAt: string; userId: number; bookId: number; layoutType: "reflowable" | "fixed_layout"; spineIndex?: unknown | null; scrollOffset?: unknown | null; spreadIndex?: unknown | null; pageNumber?: unknown | null };
    GetReadingSyncResponseDto: { progress: Array<components['schemas']['ReadingProgressResponse']>; progressTotal: number; bookmarks: Array<components['schemas']['ReadingBookmarkResponse']>; bookmarksTotal: number };
    SaveReadingProgressRequestDto: { spineIndex?: number; scrollOffset?: number; spreadIndex?: number; pageNumber?: number };
    CreateReadingBookmarkRequestDto: { spineIndex?: number; scrollOffset?: number; spreadIndex?: number; pageNumber?: number };
    GetReadingBookmarksResponseDto: { bookmarks: Array<components['schemas']['ReadingBookmarkResponse']>; total: number };
    GetSearchBooksResponseDto: { books: Array<components['schemas']['BookResponse']>; total: number };
    InBookSearchHighlightResponse: { text: string; x: number; y: number; width?: unknown | null; height?: unknown | null };
    InBookSearchHitResponse: { layoutType: "reflowable" | "fixed_layout"; spineIndex: number; pageNumber?: unknown | null; spreadIndex?: unknown | null; title: string; excerpt: string; matchOffset: number; highlights: Array<components['schemas']['InBookSearchHighlightResponse']> };
    GetInBookSearchResponseDto: { hits: Array<components['schemas']['InBookSearchHitResponse']>; total: number };
    StartCheckoutRequestDto: { successUrl: string; cancelUrl: string };
    StartCheckoutResponseDto: { url: string };
    PlanResponse: { id: number; createdAt: string; updatedAt: string; slug: string; name: string; kind: "free" | "monthly_paid"; interval: "month" | null };
    SubscriptionResponse: { id: number; createdAt: string; updatedAt: string; userId: number; planId: number; status: "active" | "canceled"; startedAt: string; currentPeriodStart?: unknown | null; currentPeriodEnd?: unknown | null; canceledAt?: unknown | null; activatedAt?: unknown | null; plan?: components['schemas']['PlanResponse'] };
    StripeWebhookReceivedResponseDto: { received: boolean };
    AuthSessionResponseDto: { accessToken: string; tokenType: string; expiresIn: string; user: components['schemas']['UserResponse'] };
    RegisterRequestDto: { email: string; password: string };
    AcceptAdminInvitationRequestDto: { token: string; password: string };
    LoginRequestDto: { email: string; password: string };
  };
}
