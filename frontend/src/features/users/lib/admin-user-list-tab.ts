export const ADMIN_USER_LIST_TABS = {
  ALL: 'all',
  ADMIN: 'admin',
  READER: 'reader',
  PUBLISHER: 'publisher',
} as const;

export type AdminUserListTab = (typeof ADMIN_USER_LIST_TABS)[keyof typeof ADMIN_USER_LIST_TABS];

const ADMIN_USER_LIST_TAB_LABELS: Record<AdminUserListTab, string> = {
  [ADMIN_USER_LIST_TABS.ALL]: 'All',
  [ADMIN_USER_LIST_TABS.ADMIN]: 'Admin',
  [ADMIN_USER_LIST_TABS.READER]: 'Reader',
  [ADMIN_USER_LIST_TABS.PUBLISHER]: 'Publisher',
};

/**
 * Visible label for a users-list tab. Publisher is the isPublisher capability.
 */
export function formatAdminUserListTabLabel(tab: AdminUserListTab): string {
  return ADMIN_USER_LIST_TAB_LABELS[tab];
}
