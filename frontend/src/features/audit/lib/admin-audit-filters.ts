export const ADMIN_AUDIT_ACTIONS = [
  'book_submitted_for_review',
  'book_approved',
  'book_rejected',
  'book_unpublished',
  'book_republished',
  'book_deleted',
  'publisher_enabled',
  'publisher_disabled',
  'user_role_changed',
  'user_deleted',
  'subscription_canceled',
  'subscription_payment_failed',
  'collection_created',
  'collection_updated',
  'collection_deleted',
  'collection_book_added',
  'collection_book_removed',
  'collection_reordered',
  'revenue_calculated',
] as const;

export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[number];

export const ADMIN_AUDIT_SUBJECT_TYPES = [
  'book',
  'user',
  'subscription',
  'collection',
  'revenue_period',
] as const;

export type AdminAuditSubjectType = (typeof ADMIN_AUDIT_SUBJECT_TYPES)[number];
