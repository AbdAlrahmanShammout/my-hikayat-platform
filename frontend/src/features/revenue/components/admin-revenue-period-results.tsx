import type { JSX } from 'react';
import { useSearchParams } from 'react-router';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminPeriodAnalyticsPanel } from '@/features/revenue/components/admin-period-analytics-panel';
import { AdminPeriodEarningsPanel } from '@/features/revenue/components/admin-period-earnings-panel';
import { AdminPeriodOwnerFilter } from '@/features/revenue/components/admin-period-owner-filter';
import { buildAdminRevenuePeriodDetailSearchParams } from '@/features/revenue/lib/build-admin-revenue-period-detail-search-params';
import {
  parseAdminRevenuePeriodDetailSearch,
  type AdminRevenuePeriodDetailSearch,
} from '@/features/revenue/lib/parse-admin-revenue-period-detail-search';

type AdminRevenuePeriodResultsProps = {
  readonly revenuePeriodId: number;
};

/**
 * Earnings and analytics tabs for one revenue period.
 */
export function AdminRevenuePeriodResults({
  revenuePeriodId,
}: AdminRevenuePeriodResultsProps): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const listSearch: AdminRevenuePeriodDetailSearch =
    parseAdminRevenuePeriodDetailSearch(searchParams);
  const replaceSearch = (nextSearch: AdminRevenuePeriodDetailSearch): void => {
    setSearchParams(buildAdminRevenuePeriodDetailSearchParams(nextSearch), { replace: true });
  };
  return (
    <div className="space-y-4">
      <AdminPeriodOwnerFilter value={listSearch} onChange={replaceSearch} />
      <Tabs
        value={listSearch.tab}
        defaultValue="earnings"
        onValueChange={(nextTab: string) => {
          replaceSearch({
            ...listSearch,
            tab: nextTab === 'analytics' ? 'analytics' : 'earnings',
            offset: 0,
          });
        }}
      >
        <TabsList>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="earnings">
          <AdminPeriodEarningsPanel
            revenuePeriodId={revenuePeriodId}
            listSearch={listSearch}
            onSearchChange={replaceSearch}
          />
        </TabsContent>
        <TabsContent value="analytics">
          <AdminPeriodAnalyticsPanel
            revenuePeriodId={revenuePeriodId}
            listSearch={listSearch}
            onSearchChange={replaceSearch}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
