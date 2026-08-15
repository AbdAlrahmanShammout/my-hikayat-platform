import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';

describe('audit enums', () => {
  it('mirrors the persisted audit action and subject literals', () => {
    expect(AuditAction.BOOK_SUBMITTED_FOR_REVIEW).toBe('book_submitted_for_review');
    expect(AuditAction.BOOK_APPROVED).toBe('book_approved');
    expect(AuditAction.BOOK_REJECTED).toBe('book_rejected');
    expect(AuditAction.PUBLISHER_ENABLED).toBe('publisher_enabled');
    expect(AuditAction.PUBLISHER_DISABLED).toBe('publisher_disabled');
    expect(AuditAction.USER_ROLE_CHANGED).toBe('user_role_changed');
    expect(AuditAction.USER_DELETED).toBe('user_deleted');
    expect(AuditAction.SUBSCRIPTION_CANCELED).toBe('subscription_canceled');
    expect(AuditSubjectType.BOOK).toBe('book');
    expect(AuditSubjectType.USER).toBe('user');
    expect(AuditSubjectType.SUBSCRIPTION).toBe('subscription');
  });
});
