import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';

describe('audit enums', () => {
  it('mirrors the persisted audit action and subject literals', () => {
    expect(AuditAction.BOOK_SUBMITTED_FOR_REVIEW).toBe('book_submitted_for_review');
    expect(AuditAction.BOOK_APPROVED).toBe('book_approved');
    expect(AuditAction.BOOK_REJECTED).toBe('book_rejected');
    expect(AuditAction.BOOK_UNPUBLISHED).toBe('book_unpublished');
    expect(AuditAction.BOOK_REPUBLISHED).toBe('book_republished');
    expect(AuditAction.BOOK_DELETED).toBe('book_deleted');
    expect(AuditAction.PUBLISHER_ENABLED).toBe('publisher_enabled');
    expect(AuditAction.PUBLISHER_DISABLED).toBe('publisher_disabled');
    expect(AuditAction.USER_ROLE_CHANGED).toBe('user_role_changed');
    expect(AuditAction.USER_DELETED).toBe('user_deleted');
    expect(AuditAction.SUBSCRIPTION_CANCELED).toBe('subscription_canceled');
    expect(AuditAction.SUBSCRIPTION_PAYMENT_FAILED).toBe('subscription_payment_failed');
    expect(AuditAction.COLLECTION_CREATED).toBe('collection_created');
    expect(AuditAction.COLLECTION_UPDATED).toBe('collection_updated');
    expect(AuditAction.COLLECTION_DELETED).toBe('collection_deleted');
    expect(AuditAction.COLLECTION_BOOK_ADDED).toBe('collection_book_added');
    expect(AuditAction.COLLECTION_BOOK_REMOVED).toBe('collection_book_removed');
    expect(AuditAction.COLLECTION_REORDERED).toBe('collection_reordered');
    expect(AuditAction.REVENUE_CALCULATED).toBe('revenue_calculated');
    expect(AuditSubjectType.BOOK).toBe('book');
    expect(AuditSubjectType.USER).toBe('user');
    expect(AuditSubjectType.SUBSCRIPTION).toBe('subscription');
    expect(AuditSubjectType.COLLECTION).toBe('collection');
    expect(AuditSubjectType.REVENUE_PERIOD).toBe('revenue_period');
  });
});
