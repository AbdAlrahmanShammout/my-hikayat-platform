import { describe, expect, it } from 'vitest';

import { buildAdminInvitationAcceptUrl } from '@/features/invitations/lib/build-admin-invitation-accept-url';

describe('buildAdminInvitationAcceptUrl', () => {
  it('joins origin, path, and encoded token', () => {
    const actualUrl: string = buildAdminInvitationAcceptUrl({
      origin: 'http://localhost:5173/',
      token: 'raw token',
    });
    expect(actualUrl).toBe('http://localhost:5173/accept-admin-invitation?token=raw%20token');
  });
});
