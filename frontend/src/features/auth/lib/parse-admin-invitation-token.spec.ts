import { describe, expect, it } from 'vitest';

import { parseAdminInvitationToken } from '@/features/auth/lib/parse-admin-invitation-token';

describe('parseAdminInvitationToken', () => {
  it('returns the token from the accept link', () => {
    expect(parseAdminInvitationToken(new URLSearchParams('token=raw-token'))).toBe('raw-token');
  });

  it('treats a missing or blank token as absent', () => {
    expect(parseAdminInvitationToken(new URLSearchParams())).toBeNull();
    expect(parseAdminInvitationToken(new URLSearchParams('token=%20%20'))).toBeNull();
  });
});
