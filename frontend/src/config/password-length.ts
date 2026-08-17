/**
 * Password bounds the API enforces on credential routes. Client checks are UX only.
 */
export const PASSWORD_LENGTH = {
  min: 8,
  max: 72,
} as const;
