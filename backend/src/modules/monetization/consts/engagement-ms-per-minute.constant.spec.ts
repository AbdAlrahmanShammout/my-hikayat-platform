import { ENGAGEMENT_MS_PER_MINUTE } from './engagement-ms-per-minute.constant';

describe('ENGAGEMENT_MS_PER_MINUTE', () => {
  it('converts milliseconds into reading minutes', () => {
    expect(ENGAGEMENT_MS_PER_MINUTE).toBe(60_000);
  });
});
