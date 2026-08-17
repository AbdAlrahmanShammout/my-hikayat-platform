export const USER_ROLES = {
  READER: 'reader',
  AUTHOR: 'author',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
