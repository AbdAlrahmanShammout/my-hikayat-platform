import { TrialAlreadyUsedException } from './trial-already-used.exception';

describe('TrialAlreadyUsedException', () => {
  it('reports a conflict when the free trial was already consumed', () => {
    const actualException = new TrialAlreadyUsedException();
    expect(actualException.code).toBe('TRIAL_ALREADY_USED');
    expect(actualException.message).toContain('already been used');
  });
});
