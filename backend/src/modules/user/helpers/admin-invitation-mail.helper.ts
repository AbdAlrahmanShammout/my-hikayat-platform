import {
  ADMIN_INVITATION_ACCEPT_PATH,
  ADMIN_INVITATION_APPLICATION_NAME,
} from '@/modules/user/consts/admin-invitation.constant';
import { SendMailInput } from '@/providers/mail/defs/mail-manager.defs';

export type BuildAdminInvitationMailInput = {
  readonly email: string;
  readonly token: string;
  readonly expiresAt: Date;
  readonly publicOrigin: string;
};

export function buildAdminInvitationAcceptUrl(input: {
  readonly publicOrigin: string;
  readonly token: string;
}): string {
  const origin: string = input.publicOrigin.replace(/\/+$/, '');
  return `${origin}${ADMIN_INVITATION_ACCEPT_PATH}?token=${encodeURIComponent(input.token)}`;
}

export function buildAdminInvitationMail(input: BuildAdminInvitationMailInput): SendMailInput {
  const acceptUrl: string = buildAdminInvitationAcceptUrl({
    publicOrigin: input.publicOrigin,
    token: input.token,
  });
  const expiresOn: string = input.expiresAt.toISOString();
  return {
    to: input.email,
    subject: `You are invited to administer ${ADMIN_INVITATION_APPLICATION_NAME}`,
    text: [
      `You have been invited to become an administrator on ${ADMIN_INVITATION_APPLICATION_NAME}.`,
      '',
      'Open this link to accept the invitation and set your password:',
      acceptUrl,
      '',
      `This invitation expires on ${expiresOn}. If the invitation was already used or has expired, the link will not work.`,
    ].join('\n'),
  };
}
