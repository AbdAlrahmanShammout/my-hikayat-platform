import { IS_PUBLIC_KEY, PublicRoute } from './public-route.decorator';

describe('PublicRoute', () => {
  it('exports a stable metadata key', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
    expect(PublicRoute().KEY).toBe(IS_PUBLIC_KEY);
  });
});
