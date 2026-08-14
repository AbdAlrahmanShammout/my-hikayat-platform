import { JwtTokenPurpose } from './jwt-token-purpose.enum';

describe('JwtTokenPurpose', () => {
  it('uses distinct lowercase purpose values', () => {
    expect(JwtTokenPurpose.ACCESS).toBe('access');
    expect(JwtTokenPurpose.RECOVERY).toBe('recovery');
  });
});
