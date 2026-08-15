import { ENGAGEMENT_MS_PER_MINUTE } from '@/modules/monetization/consts/engagement-ms-per-minute.constant';

export function computeWeightedEngagementMinutes(input: {
  readonly engagementMs: number;
  readonly categoryWeight: number;
}): number {
  return (input.engagementMs / ENGAGEMENT_MS_PER_MINUTE) * input.categoryWeight;
}
