import { getCredentialThrottleTracker } from './get-credential-throttle-tracker.helper';

describe('getCredentialThrottleTracker', () => {
  it('keys on the normalized email so attempts can be limited across client addresses', () => {
    const actualTracker: string = getCredentialThrottleTracker({
      ip: '203.0.113.10',
      body: { email: ' Reader@Example.com ' },
    });
    expect(actualTracker).toBe('email:reader@example.com');
  });

  it('falls back to the client address when the body has no email', () => {
    const actualTracker: string = getCredentialThrottleTracker({
      ips: ['198.51.100.20'],
      ip: '127.0.0.1',
      body: { password: 'secret' },
    });
    expect(actualTracker).toBe('ip:198.51.100.20');
  });
});
