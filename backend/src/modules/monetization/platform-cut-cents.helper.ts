import { PERCENT_SCALE } from '@/modules/monetization/consts/percent-scale.constant';
import { PUBLISHERS_SHARE_PERCENT } from '@/modules/monetization/consts/publishers-share-percent.constant';

const PLATFORM_SHARE_PERCENT: number = PERCENT_SCALE - PUBLISHERS_SHARE_PERCENT;

/**
 * Platform share of a calculated net pool. Publishers keep the fixed 40 percent.
 */
export function computePlatformCutCents(poolAmountCents: number): number {
  return Math.round((poolAmountCents * PLATFORM_SHARE_PERCENT) / PERCENT_SCALE);
}
