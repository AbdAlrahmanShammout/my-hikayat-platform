import { TrialNotNeededException } from './trial-not-needed.exception';

describe('TrialNotNeededException', () => {
  it('reports a conflict when paid access is already active', () => {
    const actualException = new TrialNotNeededException();
    expect(actualException.code).toBe('TRIAL_NOT_NEEDED');
    expect(actualException.message).toContain('paid');
  });
});
