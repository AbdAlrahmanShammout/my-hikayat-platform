import { ADMIN_INVITATION_ACCEPT_PATH } from '@/config/admin-invitation-accept-path';

export type BuildAdminInvitationAcceptUrlInput = {
  readonly origin: string;
  readonly token: string;
};

/**
 * Builds the public accept URL shown once after create.
 */
export function buildAdminInvitationAcceptUrl(input: BuildAdminInvitationAcceptUrlInput): string {
  const origin: string = input.origin.replace(/\/+$/, '');
  return `${origin}${ADMIN_INVITATION_ACCEPT_PATH}?token=${encodeURIComponent(input.token)}`;
}
