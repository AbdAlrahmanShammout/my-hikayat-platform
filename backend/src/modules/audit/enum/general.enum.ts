export enum AuditAction {
  BOOK_SUBMITTED_FOR_REVIEW = 'book_submitted_for_review',
  BOOK_APPROVED = 'book_approved',
  BOOK_REJECTED = 'book_rejected',
  PUBLISHER_ENABLED = 'publisher_enabled',
  PUBLISHER_DISABLED = 'publisher_disabled',
  USER_ROLE_CHANGED = 'user_role_changed',
  USER_DELETED = 'user_deleted',
  SUBSCRIPTION_CANCELED = 'subscription_canceled',
}

export enum AuditSubjectType {
  BOOK = 'book',
  USER = 'user',
  SUBSCRIPTION = 'subscription',
}
