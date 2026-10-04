export const ADMIN_EXPORT_RESOURCES = [
  'users',
  'books',
  'publishers',
  'subscriptions',
  'invitations',
  'audit_logs',
] as const;

export type AdminExportResource = (typeof ADMIN_EXPORT_RESOURCES)[number];

export const ADMIN_EXPORT_ROW_LIMIT = 10_000;
export const ADMIN_EXPORT_BATCH_SIZE = 500;
export const ADMIN_EXPORT_RETENTION_MS = 24 * 60 * 60 * 1000;
export const ADMIN_EXPORT_STALE_PROCESSING_MS = 15 * 60 * 1000;

export const ADMIN_EXPORT_DEFAULT_COLUMNS: Record<AdminExportResource, readonly string[]> = {
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
  invitations: [
    'id',
    'email',
    'status',
    'expiresAt',
    'lastSentAt',
    'resendCount',
    'revokedAt',
    'createdAt',
  ],
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

export function listAllowedExportColumns(resource: AdminExportResource): readonly string[] {
  return [...ADMIN_EXPORT_DEFAULT_COLUMNS[resource], ...ADMIN_EXPORT_OPTIONAL_COLUMNS[resource]];
}
