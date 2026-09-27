export const ADMIN_USER_DETAIL_SECTIONS = {
  PROFILE: 'profile',
  BOOKS: 'books',
} as const;

export type AdminUserDetailSection =
  (typeof ADMIN_USER_DETAIL_SECTIONS)[keyof typeof ADMIN_USER_DETAIL_SECTIONS];

/**
 * Reads the profile section from the URL. Unknown values stay on the profile.
 */
export function parseAdminUserDetailSection(value: string | null): AdminUserDetailSection {
  if (value === ADMIN_USER_DETAIL_SECTIONS.BOOKS) {
    return ADMIN_USER_DETAIL_SECTIONS.BOOKS;
  }
  return ADMIN_USER_DETAIL_SECTIONS.PROFILE;
}
