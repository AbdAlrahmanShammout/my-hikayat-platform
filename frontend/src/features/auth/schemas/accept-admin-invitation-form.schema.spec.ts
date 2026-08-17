import { describe, expect, it } from 'vitest';

import { acceptAdminInvitationFormSchema } from '@/features/auth/schemas/accept-admin-invitation-form.schema';

describe('acceptAdminInvitationFormSchema', () => {
  it('accepts a long enough matching password', () => {
    const actualResult = acceptAdminInvitationFormSchema.safeParse({
      password: 'correct-horse-battery',
      confirmPassword: 'correct-horse-battery',
    });
    expect(actualResult.success).toBe(true);
  });

  it('rejects a short password', () => {
    const actualResult = acceptAdminInvitationFormSchema.safeParse({
      password: 'short',
      confirmPassword: 'short',
    });
    expect(actualResult.success).toBe(false);
  });

  it('reports a mismatch on the confirmation field', () => {
    const actualResult = acceptAdminInvitationFormSchema.safeParse({
      password: 'correct-horse-battery',
      confirmPassword: 'correct-horse-batteries',
    });
    expect(actualResult.success).toBe(false);
    expect(actualResult.error?.issues[0].path).toEqual(['confirmPassword']);
  });
});
