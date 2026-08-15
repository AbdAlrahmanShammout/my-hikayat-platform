import { PERCENT_SCALE } from '@/modules/monetization/consts/percent-scale.constant';

export function computePlatformCutCents(input: {
  readonly poolAmountCents: number;
  readonly platformCutPercent: number;
}): number {
  return Math.round((input.poolAmountCents * input.platformCutPercent) / PERCENT_SCALE);
}
