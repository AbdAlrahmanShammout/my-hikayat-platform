/**
 * Generated from http://localhost:3000/docs/admin-json. Do not edit by hand.
 * Regenerate with: pnpm --filter frontend generate:api
 */

export interface paths {
  '/auth/register': {
    post: {
      requestBody: { content: { 'application/json': components['schemas']['RegisterRequestDto'] } };
      responses: {
        '201': { content: { 'application/json': components['schemas']['AuthSessionResponseDto'] } };
      };
    };
  };
  '/auth/accept-admin-invitation': {
    post: {
      requestBody: {
        content: {
          'application/json': components['schemas']['AcceptAdminInvitationRequestDto'];
        };
      };
      responses: {
        '201': { content: { 'application/json': components['schemas']['AuthSessionResponseDto'] } };
      };
    };
  };
  '/auth/login': {
    post: {
      requestBody: { content: { 'application/json': components['schemas']['LoginRequestDto'] } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['AuthSessionResponseDto'] } };
      };
    };
  };
  '/auth/me': {
    get: {
      responses: {
        '200': { content: { 'application/json': components['schemas']['UserResponse'] } };
      };
    };
  };
  '/admin/audit-logs': {
    get: {
      parameters: {
        query?: {
          limit?: number;
          offset?: number;
          actorUserId?: number;
          action?:
            | 'book_submitted_for_review'
            | 'book_approved'
            | 'book_rejected'
            | 'book_unpublished'
            | 'book_republished'
            | 'book_deleted'
            | 'publisher_enabled'
            | 'publisher_disabled'
            | 'user_role_changed'
            | 'user_deleted'
            | 'subscription_canceled'
            | 'subscription_payment_failed'
            | 'collection_created'
            | 'collection_updated'
            | 'collection_deleted'
            | 'collection_book_added'
            | 'collection_book_removed'
            | 'collection_reordered'
            | 'revenue_calculated';
          subjectType?: 'book' | 'user' | 'subscription' | 'collection' | 'revenue_period';
          subjectId?: number;
        };
      };
      responses: {
        '200': {
          content: { 'application/json': components['schemas']['GetAuditLogsResponseDto'] };
        };
      };
    };
  };
  '/admin/audit-logs/{id}': {
    get: {
      parameters: { path: { id: number } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['AuditLogResponse'] } };
      };
    };
  };
  '/admin/books': {
    get: {
      parameters: {
        query?: {
          limit?: number;
          offset?: number;
          publishingStatus?: 'pending' | 'in_review' | 'approved' | 'rejected';
        };
      };
      responses: {
        '200': { content: { 'application/json': components['schemas']['GetBooksResponseDto'] } };
      };
    };
  };
  '/admin/books/{id}': {
    get: {
      parameters: { path: { id: number } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
    patch: {
      parameters: { path: { id: number } };
      requestBody: {
        content: { 'application/json': components['schemas']['UpdateBookRequestDto'] };
      };
      responses: {
        '200': { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
    delete: {
      parameters: { path: { id: number } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
  };
  '/admin/books/{id}/approve': {
    post: {
      parameters: { path: { id: number } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
  };
  '/admin/books/{id}/reject': {
    post: {
      parameters: { path: { id: number } };
      requestBody: {
        content: { 'application/json': components['schemas']['RejectBookRequestDto'] };
      };
      responses: {
        '200': { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
  };
  '/admin/books/{id}/rejection-history': {
    get: {
      parameters: {
        path: { id: number };
        query?: { limit?: number; offset?: number };
      };
      responses: {
        '200': {
          content: {
            'application/json': components['schemas']['GetBookRejectionHistoryResponseDto'];
          };
        };
      };
    };
  };
  '/admin/books/{id}/unpublish': {
    post: {
      parameters: { path: { id: number } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
  };
  '/admin/books/{id}/republish': {
    post: {
      parameters: { path: { id: number } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['BookResponse'] } };
      };
    };
  };
  '/admin/categories': {
    get: {
      parameters: { query?: { limit?: number; offset?: number } };
      responses: {
        '200': {
          content: { 'application/json': components['schemas']['GetCategoriesResponseDto'] };
        };
      };
    };
    post: {
      requestBody: {
        content: { 'application/json': components['schemas']['CreateCategoryRequestDto'] };
      };
      responses: {
        '201': { content: { 'application/json': components['schemas']['CategoryResponse'] } };
      };
    };
  };
  '/admin/categories/{id}': {
    get: {
      parameters: { path: { id: number } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['CategoryResponse'] } };
      };
    };
    patch: {
      parameters: { path: { id: number } };
      requestBody: {
        content: { 'application/json': components['schemas']['UpdateCategoryRequestDto'] };
      };
      responses: {
        '200': { content: { 'application/json': components['schemas']['CategoryResponse'] } };
      };
    };
  };
  '/admin/collections': {
    get: {
      parameters: { query?: { limit?: number; offset?: number } };
      responses: {
        '200': {
          content: { 'application/json': components['schemas']['GetCollectionsResponseDto'] };
        };
      };
    };
    post: {
      requestBody: {
        content: { 'application/json': components['schemas']['CreateCollectionRequestDto'] };
      };
      responses: {
        '201': { content: { 'application/json': components['schemas']['CollectionResponse'] } };
      };
    };
  };
  '/admin/collections/{id}': {
    get: {
      parameters: { path: { id: number } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['CollectionResponse'] } };
      };
    };
    patch: {
      parameters: { path: { id: number } };
      requestBody: {
        content: { 'application/json': components['schemas']['UpdateCollectionRequestDto'] };
      };
      responses: {
        '200': { content: { 'application/json': components['schemas']['CollectionResponse'] } };
      };
    };
    delete: {
      parameters: { path: { id: number } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['CollectionResponse'] } };
      };
    };
  };
  '/admin/collections/{id}/books': {
    post: {
      parameters: { path: { id: number } };
      requestBody: {
        content: { 'application/json': components['schemas']['AddCollectionBookRequestDto'] };
      };
      responses: {
        '201': { content: { 'application/json': components['schemas']['CollectionResponse'] } };
      };
    };
  };
  '/admin/collections/{id}/books/{bookId}': {
    delete: {
      parameters: { path: { id: number; bookId: number } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['CollectionResponse'] } };
      };
    };
  };
  '/admin/collections/{id}/reorder': {
    post: {
      parameters: { path: { id: number } };
      requestBody: {
        content: { 'application/json': components['schemas']['ReorderCollectionBooksRequestDto'] };
      };
      responses: {
        '200': { content: { 'application/json': components['schemas']['CollectionResponse'] } };
      };
    };
  };
  '/admin/revenue-periods': {
    get: {
      parameters: { query?: { limit?: number; offset?: number } };
      responses: {
        '200': {
          content: { 'application/json': components['schemas']['GetRevenuePeriodsResponseDto'] };
        };
      };
    };
    post: {
      requestBody: {
        content: { 'application/json': components['schemas']['CreateRevenuePeriodRequestDto'] };
      };
      responses: {
        '201': { content: { 'application/json': components['schemas']['RevenuePeriodResponse'] } };
      };
    };
  };
  '/admin/revenue-periods/current': {
    post: {
      responses: {
        '200': { content: { 'application/json': components['schemas']['RevenuePeriodResponse'] } };
      };
    };
  };
  '/admin/revenue-periods/{id}': {
    get: {
      parameters: { path: { id: number } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['RevenuePeriodResponse'] } };
      };
    };
    patch: {
      parameters: { path: { id: number } };
      requestBody: {
        content: { 'application/json': components['schemas']['UpdateRevenuePeriodRequestDto'] };
      };
      responses: {
        '200': { content: { 'application/json': components['schemas']['RevenuePeriodResponse'] } };
      };
    };
  };
  '/admin/revenue-periods/{id}/close': {
    post: {
      parameters: { path: { id: number } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['RevenuePeriodResponse'] } };
      };
    };
  };
  '/admin/revenue-periods/{id}/engagements': {
    post: {
      parameters: { path: { id: number } };
      responses: {
        '200': {
          content: {
            'application/json': components['schemas']['GetAdminPeriodAnalyticsResponseDto'];
          };
        };
      };
    };
  };
  '/admin/revenue-periods/{id}/calculate': {
    post: {
      parameters: { path: { id: number } };
      responses: {
        '200': {
          content: {
            'application/json': components['schemas']['GetAdminPeriodEarningsResponseDto'];
          };
        };
      };
    };
  };
  '/admin/revenue-periods/{id}/earnings': {
    get: {
      parameters: {
        query?: { limit?: number; offset?: number; ownerId?: number };
        path: { id: number };
      };
      responses: {
        '200': {
          content: {
            'application/json': components['schemas']['GetAdminPeriodEarningsResponseDto'];
          };
        };
      };
    };
  };
  '/admin/revenue-periods/{id}/analytics': {
    get: {
      parameters: {
        query?: { limit?: number; offset?: number; ownerId?: number };
        path: { id: number };
      };
      responses: {
        '200': {
          content: {
            'application/json': components['schemas']['GetAdminPeriodAnalyticsResponseDto'];
          };
        };
      };
    };
  };
  '/admin/revenue-periods/{id}/books/{bookId}/heatmap': {
    get: {
      parameters: { path: { id: number; bookId: number } };
      responses: {
        '200': {
          content: {
            'application/json': components['schemas']['GetAdminPeriodBookHeatmapResponseDto'];
          };
        };
      };
    };
  };
  '/admin/subscriptions': {
    get: {
      parameters: {
        query?: {
          limit?: number;
          offset?: number;
          userId?: number;
          status?: 'active' | 'canceled';
        };
      };
      responses: {
        '200': {
          content: { 'application/json': components['schemas']['GetSubscriptionsResponseDto'] };
        };
      };
    };
  };
  '/admin/subscriptions/{id}': {
    get: {
      parameters: { path: { id: number } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['SubscriptionResponse'] } };
      };
    };
  };
  '/admin/subscriptions/{id}/cancel': {
    post: {
      parameters: { path: { id: number } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['SubscriptionResponse'] } };
      };
    };
  };
  '/admin/invitations': {
    get: {
      parameters: { query?: { limit?: number; offset?: number } };
      responses: {
        '200': {
          content: { 'application/json': components['schemas']['GetAdminInvitationsResponseDto'] };
        };
      };
    };
    post: {
      requestBody: {
        content: { 'application/json': components['schemas']['CreateAdminInvitationRequestDto'] };
      };
      responses: {
        '201': {
          content: {
            'application/json': components['schemas']['CreateAdminInvitationResponseDto'];
          };
        };
      };
    };
  };
  '/admin/users': {
    get: {
      parameters: {
        query?: {
          limit?: number;
          offset?: number;
          role?: 'reader' | 'author' | 'admin';
          isPublisher?: boolean;
          email?: string;
        };
      };
      responses: {
        '200': { content: { 'application/json': components['schemas']['GetUsersResponseDto'] } };
      };
    };
  };
  '/admin/users/{id}': {
    get: {
      parameters: { path: { id: number } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['UserResponse'] } };
      };
    };
    patch: {
      parameters: { path: { id: number } };
      requestBody: {
        content: { 'application/json': components['schemas']['UpdateManagedUserRequestDto'] };
      };
      responses: {
        '200': { content: { 'application/json': components['schemas']['UserResponse'] } };
      };
    };
    delete: {
      parameters: { path: { id: number } };
      responses: {
        '200': { content: { 'application/json': components['schemas']['UserResponse'] } };
      };
    };
  };
}

export interface components {
  schemas: {
    RegisterRequestDto: { email: string; password: string };
    UserResponse: {
      id: number;
      createdAt: string;
      updatedAt: string;
      email: string;
      role: 'reader' | 'author' | 'admin';
      isPublisher: boolean;
    };
    AuthSessionResponseDto: {
      accessToken: string;
      tokenType: string;
      expiresIn: string;
      user: components['schemas']['UserResponse'];
    };
    LoginRequestDto: { email: string; password: string };
    AuditLogResponse: {
      id: number;
      createdAt: string;
      updatedAt: string;
      actorUserId: number;
      action:
        | 'book_submitted_for_review'
        | 'book_approved'
        | 'book_rejected'
        | 'book_unpublished'
        | 'book_republished'
        | 'book_deleted'
        | 'publisher_enabled'
        | 'publisher_disabled'
        | 'user_role_changed'
        | 'user_deleted'
        | 'subscription_canceled'
        | 'subscription_payment_failed'
        | 'collection_created'
        | 'collection_updated'
        | 'collection_deleted'
        | 'collection_book_added'
        | 'collection_book_removed'
        | 'collection_reordered'
        | 'revenue_calculated';
      subjectType: 'book' | 'user' | 'subscription' | 'collection' | 'revenue_period';
      subjectId: number;
      reason?: unknown | null;
      metadata?: unknown | null;
    };
    GetAuditLogsResponseDto: {
      auditLogs: Array<components['schemas']['AuditLogResponse']>;
      total: number;
    };
    CategoryResponse: {
      id: number;
      createdAt: string;
      updatedAt: string;
      name: string;
      slug: string;
      categoryWeight: number;
    };
    BookResponse: {
      id: number;
      createdAt: string;
      updatedAt: string;
      title: string;
      description: string;
      layoutType?: 'reflowable' | 'fixed_layout' | null;
      bookType: 'standard_chapter' | 'picture_book' | 'illustrated_chapter';
      publishingStatus: 'pending' | 'in_review' | 'approved' | 'rejected';
      processingStatus: 'not_started' | 'processing' | 'ready' | 'failed';
      publishedAt?: unknown | null;
      ownerId: number;
      owner?: components['schemas']['UserResponse'];
      categories: Array<components['schemas']['CategoryResponse']>;
    };
    GetBooksResponseDto: { books: Array<components['schemas']['BookResponse']>; total: number };
    RejectBookRequestDto: { reason: string };
    GetBookRejectionHistoryResponseDto: {
      rejections: Array<components['schemas']['AuditLogResponse']>;
      total: number;
    };
    UpdateBookRequestDto: {
      title?: string;
      description?: string;
      bookType?: 'standard_chapter' | 'picture_book' | 'illustrated_chapter';
      categoryIds?: Array<number>;
    };
    GetCategoriesResponseDto: {
      categories: Array<components['schemas']['CategoryResponse']>;
      total: number;
    };
    UpdateCategoryRequestDto: { name?: string; slug?: string; categoryWeight?: number };
    CreateCategoryRequestDto: { name: string; slug?: string; categoryWeight?: number };
    CreateCollectionRequestDto: { title: string; bookIds?: Array<number> };
    CollectionBookResponse: {
      id: number;
      createdAt: string;
      updatedAt: string;
      collectionId: number;
      bookId: number;
      displayOrder: number;
    };
    CollectionResponse: {
      id: number;
      createdAt: string;
      updatedAt: string;
      title: string;
      items: Array<components['schemas']['CollectionBookResponse']>;
    };
    GetCollectionsResponseDto: {
      collections: Array<components['schemas']['CollectionResponse']>;
      total: number;
    };
    UpdateCollectionRequestDto: { title?: string };
    AddCollectionBookRequestDto: { bookId: number };
    ReorderCollectionBooksRequestDto: { bookIds: Array<number> };
    RevenuePeriodResponse: {
      id: number;
      createdAt: string;
      updatedAt: string;
      startsAt: string;
      endsAt: string;
      status: 'open' | 'closed';
      platformCutPercent: number;
      poolAmountCents?: unknown | null;
    };
    GetRevenuePeriodsResponseDto: {
      revenuePeriods: Array<components['schemas']['RevenuePeriodResponse']>;
      total: number;
    };
    CreateRevenuePeriodRequestDto: {
      startsAt: string;
      endsAt: string;
      platformCutPercent?: number;
      poolAmountCents?: number;
    };
    UpdateRevenuePeriodRequestDto: { platformCutPercent?: number; poolAmountCents?: number };
    BookEngagementResponse: {
      id: number;
      createdAt: string;
      updatedAt: string;
      revenuePeriodId: number;
      bookId: number;
      layoutType: 'reflowable' | 'fixed_layout';
      activeReadingMs: number;
      activeSpreadMs: number;
      visualSceneTimeMs: number;
      categoryWeight: number;
      weightedEngagement: number;
    };
    GetAdminPeriodAnalyticsResponseDto: {
      period: components['schemas']['RevenuePeriodResponse'];
      bookEngagements: Array<components['schemas']['BookEngagementResponse']>;
      total: number;
      totalActiveReadingMs: number;
      totalActiveSpreadMs: number;
      totalVisualSceneTimeMs: number;
      totalWeightedEngagement: number;
      totalReadingMinutes: number;
    };
    BookRevenueResponse: {
      id: number;
      createdAt: string;
      updatedAt: string;
      revenuePeriodId: number;
      bookId: number;
      ownerId: number;
      weightedEngagement: number;
      poolShareCents: number;
      platformCutCents: number;
      authorCents: number;
    };
    GetAdminPeriodEarningsResponseDto: {
      period: components['schemas']['RevenuePeriodResponse'];
      bookRevenues: Array<components['schemas']['BookRevenueResponse']>;
      total: number;
      authorCents: number;
      platformCutCents?: unknown | null;
    };
    AuthorBookHeatmapCellResponse: {
      spreadIndex: number;
      pageNumber: number;
      activeDurationMs: number;
      visualSceneTimeMs: number;
    };
    AuthorBookChapterHeatmapCellResponse: {
      spineIndex: number;
      title?: unknown | null;
      activeDurationMs: number;
    };
    GetAdminPeriodBookHeatmapResponseDto: {
      bookId: number;
      revenuePeriodId: number;
      layoutType: 'reflowable' | 'fixed_layout' | null;
      spreads: Array<components['schemas']['AuthorBookHeatmapCellResponse']>;
      chapters: Array<components['schemas']['AuthorBookChapterHeatmapCellResponse']>;
    };
    PlanResponse: {
      id: number;
      createdAt: string;
      updatedAt: string;
      slug: string;
      name: string;
      kind: 'free' | 'monthly_paid';
      interval: 'month' | null;
    };
    SubscriptionResponse: {
      id: number;
      createdAt: string;
      updatedAt: string;
      userId: number;
      planId: number;
      status: 'active' | 'canceled';
      startedAt: string;
      currentPeriodStart?: unknown | null;
      currentPeriodEnd?: unknown | null;
      canceledAt?: unknown | null;
      activatedAt?: unknown | null;
      plan?: components['schemas']['PlanResponse'];
    };
    GetSubscriptionsResponseDto: {
      subscriptions: Array<components['schemas']['SubscriptionResponse']>;
      total: number;
    };
    GetUsersResponseDto: { users: Array<components['schemas']['UserResponse']>; total: number };
    UpdateManagedUserRequestDto: { role?: 'reader' | 'author' | 'admin'; isPublisher?: boolean };
    AdminInvitationResponse: {
      id: number;
      createdAt: string;
      updatedAt: string;
      email: string;
      status: 'pending' | 'accepted';
      expiresAt: string;
      invitedByUserId: number;
      acceptedAt?: unknown | null;
    };
    GetAdminInvitationsResponseDto: {
      invitations: Array<components['schemas']['AdminInvitationResponse']>;
      total: number;
    };
    CreateAdminInvitationRequestDto: { email: string };
    CreateAdminInvitationResponseDto: {
      invitation: components['schemas']['AdminInvitationResponse'];
      token: string;
    };
    AcceptAdminInvitationRequestDto: { token: string; password: string };
  };
}
