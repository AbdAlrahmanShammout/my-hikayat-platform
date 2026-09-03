import {
  OFFLINE_LEASE_APPROACHING_THRESHOLD_MS,
  resolveOfflineLeaseExpiryPresentation,
} from './resolve-offline-lease-expiry-presentation';

describe('resolveOfflineLeaseExpiryPresentation', () => {
  const nowMs: number = Date.parse('2026-09-03T12:00:00.000Z');

  it('maps active leases beyond the approaching threshold', () => {
    const expiresAtMs: number = nowMs + OFFLINE_LEASE_APPROACHING_THRESHOLD_MS + 60_000;
    const actual = resolveOfflineLeaseExpiryPresentation({
      expiresAt: new Date(expiresAtMs).toISOString(),
      nowMs,
    });
    expect(actual.state).toBe('active');
    expect(actual.label).toBe('Offline access until 2026-09-06');
  });

  it('maps approaching leases within the threshold', () => {
    const expiresAtMs: number = nowMs + OFFLINE_LEASE_APPROACHING_THRESHOLD_MS;
    const actual = resolveOfflineLeaseExpiryPresentation({
      expiresAt: new Date(expiresAtMs).toISOString(),
      nowMs,
    });
    expect(actual).toEqual({
      state: 'approaching',
      label: 'Expires soon · until 2026-09-06',
    });
  });

  it('maps expired leases', () => {
    const actual = resolveOfflineLeaseExpiryPresentation({
      expiresAt: '2026-09-03T11:59:59.000Z',
      nowMs,
    });
    expect(actual).toEqual({
      state: 'expired',
      label: 'Offline access locked. Connect to refresh.',
    });
  });

  it('maps clock rollback distinctly', () => {
    const actual = resolveOfflineLeaseExpiryPresentation({
      expiresAt: '2026-12-01T00:00:00.000Z',
      nowMs,
      isClockRollbackDetected: true,
    });
    expect(actual.state).toBe('clock_rollback');
    expect(actual.label).toContain('Device time changed');
  });

  it('maps missing or invalid expiry as unavailable', () => {
    expect(
      resolveOfflineLeaseExpiryPresentation({ expiresAt: null, nowMs }).state,
    ).toBe('unavailable');
    expect(
      resolveOfflineLeaseExpiryPresentation({ expiresAt: 'not-a-date', nowMs }).state,
    ).toBe('unavailable');
  });
});
