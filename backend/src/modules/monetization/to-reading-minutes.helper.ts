import { ENGAGEMENT_MS_PER_MINUTE } from '@/modules/monetization/consts/engagement-ms-per-minute.constant';
import { OwnerBookEngagementSummary } from '@/modules/monetization/defs/book-engagement-repository.defs';

/**
 * Converts stored active reading and spread milliseconds into minutes.
 * Does not round, and does not include idle time or visual scene time.
 */
export function toReadingMinutes(summary: OwnerBookEngagementSummary): number {
  return (summary.totalActiveReadingMs + summary.totalActiveSpreadMs) / ENGAGEMENT_MS_PER_MINUTE;
}
