import { REFUND_WINDOW } from './refund-window.constant';

describe('REFUND_WINDOW', () => {
  it('allows a refund within seven days of activation', () => {
    expect(REFUND_WINDOW.days).toBe(7);
    expect(REFUND_WINDOW.millisecondsPerDay).toBe(86_400_000);
  });
});
