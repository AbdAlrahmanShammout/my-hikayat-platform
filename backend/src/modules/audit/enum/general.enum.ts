export enum AuditAction {
  BOOK_SUBMITTED_FOR_REVIEW = 'book_submitted_for_review',
  BOOK_APPROVED = 'book_approved',
  BOOK_REJECTED = 'book_rejected',
  PUBLISHER_ENABLED = 'publisher_enabled',
}

export enum AuditSubjectType {
  BOOK = 'book',
  USER = 'user',
}
