import { describe, expect, it } from 'vitest';

import { formatInvitationStatusLabel } from '@/features/invitations/lib/format-invitation-status-label';

describe('formatInvitationStatusLabel', () => {
  it('labels backend status values for display', () => {
    expect(formatInvitationStatusLabel('pending')).toBe('Pending');
    expect(formatInvitationStatusLabel('accepted')).toBe('Accepted');
  });
});
