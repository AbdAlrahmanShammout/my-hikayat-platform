export const ADMIN_INVITATION_WINDOW = {
  days: 7,
  millisecondsPerDay: 24 * 60 * 60 * 1000,
} as const;

export const ADMIN_INVITATION_TOKEN = {
  byteLength: 32,
} as const;

export const ADMIN_INVITATION_RESEND_COOLDOWN_SECONDS = 60;

export const ADMIN_INVITATION_APPLICATION_NAME = 'My Hikayat';

export const ADMIN_INVITATION_ACCEPT_PATH = '/accept-admin-invitation';
