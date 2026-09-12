import { act } from 'react-test-renderer';

import { findHostByTestId, pressHost, renderElement } from '@/test/render-element';
import type { OfflineBookManifest } from '@/features/offline/types/offline-book-manifest';

import { OfflineLibraryBookRow } from './offline-library-book-row';

jest.mock('@/storage/offline-trusted-time-storage', () => ({
  resolveTrustedNow: jest.fn(() =>
    Promise.resolve({
      nowMs: Date.parse('2026-09-03T12:00:00.000Z'),
      isClockRollbackDetected: false,
    }),
  ),
}));

const inputManifest: OfflineBookManifest = {
  bookId: 7,
  bookAssetId: 3,
  title: 'Night Market',
  description: 'Must not appear as author copy',
  layoutType: 'reflowable',
  checksumSha256: null,
  contentType: null,
  byteSize: null,
  ciphertextFileName: 'book.bin',
  coverFileName: null,
  authorName: null,
  downloadedAt: '2026-09-01T00:00:00.000Z',
  offlineLease: {
    version: 1,
    keyId: 'k1',
    userId: 1,
    bookId: 7,
    bookAssetId: 3,
    accessKind: 'paid',
    issuedAt: '2026-09-01T00:00:00.000Z',
    expiresAt: '2026-12-01T00:00:00.000Z',
    signature: 'sig',
  },
};

describe('OfflineLibraryBookRow', () => {
  it('shows title, layout, and actions without invented author copy', async () => {
    const onOpen = jest.fn();
    const onRequestRemove = jest.fn();
    const tree = renderElement(
      <OfflineLibraryBookRow
        manifest={inputManifest}
        isRemoving={false}
        onOpen={onOpen}
        onRequestRemove={onRequestRemove}
      />,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(findHostByTestId(tree, 'library-offline-book-7')).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Night Market' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Reflowable' })).toBeTruthy();
    expect(() => tree.root.findByProps({ children: 'Must not appear as author copy' })).toThrow();
    pressHost(findHostByTestId(tree, 'library-offline-open-7'));
    pressHost(findHostByTestId(tree, 'library-offline-remove-7'));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onRequestRemove).toHaveBeenCalledTimes(1);
  });
});
