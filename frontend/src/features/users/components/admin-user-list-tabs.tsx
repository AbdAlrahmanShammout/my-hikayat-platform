import type { JSX, ReactNode } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ADMIN_USER_LIST_TABS,
  formatAdminUserListTabLabel,
  type AdminUserListTab,
} from '@/features/users/lib/admin-user-list-tab';

const TAB_ORDER: readonly AdminUserListTab[] = [
  ADMIN_USER_LIST_TABS.ALL,
  ADMIN_USER_LIST_TABS.ADMIN,
  ADMIN_USER_LIST_TABS.READER,
  ADMIN_USER_LIST_TABS.PUBLISHER,
];

type AdminUserListTabsProps = {
  readonly value: AdminUserListTab;
  readonly onChange: (tab: AdminUserListTab) => void;
  readonly children: ReactNode;
};

/**
 * All, admin, reader, and publisher groups for GET /admin/users.
 */
export function AdminUserListTabs({
  value,
  onChange,
  children,
}: AdminUserListTabsProps): JSX.Element {
  return (
    <Tabs
      value={value}
      defaultValue={ADMIN_USER_LIST_TABS.ALL}
      onValueChange={(nextTab: string) => {
        onChange(parseSelectedTab(nextTab));
      }}
    >
      <TabsList aria-label="User groups" className="h-auto flex-wrap justify-start">
        {TAB_ORDER.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {formatAdminUserListTabLabel(tab)}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={value}>{children}</TabsContent>
    </Tabs>
  );
}

function parseSelectedTab(value: string): AdminUserListTab {
  if (
    value === ADMIN_USER_LIST_TABS.ADMIN ||
    value === ADMIN_USER_LIST_TABS.READER ||
    value === ADMIN_USER_LIST_TABS.PUBLISHER
  ) {
    return value;
  }
  return ADMIN_USER_LIST_TABS.ALL;
}
