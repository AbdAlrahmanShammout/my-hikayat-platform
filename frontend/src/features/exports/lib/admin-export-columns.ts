export const ADMIN_EXPORT_RESOURCES = [
  'users',
  'books',
  'publishers',
  'subscriptions',
  'invitations',
  'audit_logs',
] as const;

export type AdminExportResource = (typeof ADMIN_EXPORT_RESOURCES)[number];

export const ADMIN_EXPORT_COLUMNS: Record<AdminExportResource, readonly string[]> = {
  users: ['id', 'email', 'displayName', 'role', 'isPublisher', 'createdAt'],
  books: [
    'id',
    'title',
    'publishingStatus',
    'processingStatus',
    'bookType',
    'layoutType',
    'ownerId',
    'authorName',
    'publisherName',
    'createdAt',
  ],
  publishers: [
    'id',
    'email',
    'displayName',
    'role',
    'bookCount',
    'catalogVisibleBookCount',
    'createdAt',
  ],
  subscriptions: ['id', 'userId', 'status', 'planName', 'currentPeriodEnd', 'readingAccessState'],
  invitations: ['id', 'email', 'status', 'expiresAt', 'lastSentAt', 'resendCount', 'revokedAt', 'createdAt'],
  audit_logs: ['id', 'actorUserId', 'action', 'subjectType', 'subjectId', 'reason', 'createdAt'],
};

export const ADMIN_EXPORT_OPTIONAL_COLUMNS: Record<AdminExportResource, readonly string[]> = {
  users: [],
  books: [],
  publishers: [],
  subscriptions: ['stripeCustomerId', 'stripeSubscriptionId'],
  invitations: ['revokeReason'],
  audit_logs: [],
};

export const ADMIN_EXPORT_ROW_LIMIT = 10000;
