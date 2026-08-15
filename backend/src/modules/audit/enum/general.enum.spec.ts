import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';

describe('audit enums', () => {
  it('mirrors the persisted audit action and subject literals', () => {
    expect(AuditAction.BOOK_SUBMITTED_FOR_REVIEW).toBe('book_submitted_for_review');
    expect(AuditAction.BOOK_APPROVED).toBe('book_approved');
    expect(AuditAction.BOOK_REJECTED).toBe('book_rejected');
    expect(AuditAction.PUBLISHER_ENABLED).toBe('publisher_enabled');
    expect(AuditSubjectType.BOOK).toBe('book');
    expect(AuditSubjectType.USER).toBe('user');
  });
});
