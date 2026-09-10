import { act } from 'react-test-renderer';

import { findHostByTestId, renderElement } from '@/test/render-element';
import { resolveTrustedNow } from '@/storage/offline-trusted-time-storage';

import { OfflineLeaseExpiryLabel } from './offline-lease-expiry-label';

jest.mock('@/storage/offline-trusted-time-storage', () => ({
  resolveTrustedNow: jest.fn(),
}));

const mockResolveTrustedNow = resolveTrustedNow as jest.MockedFunction<typeof resolveTrustedNow>;

describe('OfflineLeaseExpiryLabel', () => {
  it('renders a chip from trusted-time presentation without granting access', async () => {
    mockResolveTrustedNow.mockResolvedValue({
      nowMs: Date.parse('2026-09-03T12:00:00.000Z'),
      isClockRollbackDetected: false,
    });
    const tree = renderElement(
      <OfflineLeaseExpiryLabel
        expiresAt="2026-12-01T00:00:00.000Z"
        appearance="chip"
        testID="library-offline-lease-7"
      />,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(findHostByTestId(tree, 'library-offline-lease-7')).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Offline access until 2026-12-01' })).toBeTruthy();
  });
});
