const CALENDAR_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export type CalendarMonthBounds = {
  readonly startsAt: string;
  readonly endsAt: string;
};

/**
 * UTC bounds for one calendar month. endsAt is the first instant of the next month.
 */
export function buildCalendarMonthBounds(month: string): CalendarMonthBounds | null {
  const match: RegExpExecArray | null = CALENDAR_MONTH_PATTERN.exec(month);
  if (match === null) {
    return null;
  }
  const year: number = Number(match[1]);
  const monthNumber: number = Number(match[2]);
  return {
    startsAt: new Date(Date.UTC(year, monthNumber - 1, 1)).toISOString(),
    endsAt: new Date(Date.UTC(year, monthNumber, 1)).toISOString(),
  };
}
