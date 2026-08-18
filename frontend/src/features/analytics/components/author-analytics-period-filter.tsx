import type { JSX } from 'react';

import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { formatAuthorAnalyticsPeriodLabel } from '@/features/analytics/lib/format-author-analytics-period-label';
import type { AuthorAnalyticsPeriodOption } from '@/features/analytics/lib/to-author-analytics-period-options';

type AuthorAnalyticsPeriodFilterProps = {
  readonly periods: ReadonlyArray<AuthorAnalyticsPeriodOption>;
  readonly value: number | undefined;
  readonly onChange: (revenuePeriodId: number) => void;
};

/**
 * revenuePeriodId query for GET /author/analytics. Labels come from earnings/trend dates.
 */
export function AuthorAnalyticsPeriodFilter({
  periods,
  value,
  onChange,
}: AuthorAnalyticsPeriodFilterProps): JSX.Element {
  const options: ReadonlyArray<AuthorAnalyticsPeriodOption> = mergeSelectedPeriod(periods, value);
  return (
    <div className="flex w-full max-w-xl flex-col gap-2">
      <Label htmlFor="author-analytics-period-filter">Revenue period</Label>
      <Select
        id="author-analytics-period-filter"
        value={value === undefined ? '' : String(value)}
        disabled={options.length === 0}
        onChange={(event) => {
          const nextValue: number = Number.parseInt(event.target.value, 10);
          onChange(nextValue);
        }}
      >
        {value === undefined ? <option value="">Select a period</option> : null}
        {options.map((period) => (
          <option key={period.revenuePeriodId} value={period.revenuePeriodId}>
            {formatAuthorAnalyticsPeriodLabel(period)}
          </option>
        ))}
      </Select>
    </div>
  );
}

function mergeSelectedPeriod(
  periods: ReadonlyArray<AuthorAnalyticsPeriodOption>,
  value: number | undefined,
): ReadonlyArray<AuthorAnalyticsPeriodOption> {
  if (value === undefined) {
    return periods;
  }
  if (periods.some((period) => period.revenuePeriodId === value)) {
    return periods;
  }
  return [
    {
      revenuePeriodId: value,
      startsAt: '',
      endsAt: '',
      status: '',
    },
    ...periods,
  ];
}
