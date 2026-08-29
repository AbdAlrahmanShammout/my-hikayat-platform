import { ed25519 } from '@noble/curves/ed25519.js';
import { utf8ToBytes } from '@noble/hashes/utils.js';

import { readAccessToken } from '@/session/session-store';
import { resolveTrustedNow } from '@/storage/offline-trusted-time-storage';
import type {
  OfflineBookManifest,
  OfflineReadingLease,
} from '@/features/offline/types/offline-book-manifest';
import {
  assertOfflineReadingLeaseValid,
  validateOfflineReadingLease,
} from './offline-reading-lease';

jest.mock('@/config/env', () => ({
  getOfflineLeasePublicKey: () => mockOfflineLeasePublicKey,
}));

jest.mock('@/session/session-store', () => ({
  readAccessToken: jest.fn(() => null),
}));

jest.mock('@/storage/offline-trusted-time-storage', () => ({
  recordTrustedServerTime: jest.fn(),
  resolveTrustedNow: jest.fn(() =>
    Promise.resolve({
      nowMs: Date.parse('2026-08-30T12:00:00.000Z'),
      isClockRollbackDetected: false,
    }),
  ),
}));

const TEST_PRIVATE_KEY = '_fwfNPza203yLByjTsT2kWAlT2PZRSQW-tv3ggo9e5o';
const TEST_PUBLIC_KEY = 'EwEyZmtwOVXpGC-N-e_5ygymL8uCL8O3XJDxKe0liks';
const WRONG_PUBLIC_KEY = 'bKtuzm-gY9xLlkGtiZCLAQTIXFaU6EBqRrEZjnqWuIA';
let mockOfflineLeasePublicKey = TEST_PUBLIC_KEY;
const mockReadAccessToken = readAccessToken as jest.MockedFunction<typeof readAccessToken>;
const mockResolveTrustedNow = resolveTrustedNow as jest.MockedFunction<typeof resolveTrustedNow>;

function createManifest(overrides: Partial<OfflineReadingLease> = {}): OfflineBookManifest {
  const lease: OfflineReadingLease = createLease(overrides);
  return {
    bookId: 8,
    bookAssetId: 9,
    title: 'Harbor',
    description: 'Story',
    layoutType: 'reflowable',
    checksumSha256: null,
    contentType: 'application/epub+zip',
    byteSize: 1024,
    ciphertextFileName: '8-9.enc',
    downloadedAt: '2026-08-29T12:00:00.000Z',
    offlineLease: lease,
  };
}

function createLease(overrides: Partial<OfflineReadingLease> = {}): OfflineReadingLease {
  const unsigned: Omit<OfflineReadingLease, 'signature'> = {
    version: 1,
    keyId: 'test',
    userId: 5,
    bookId: 8,
    bookAssetId: 9,
    accessKind: 'trial',
    issuedAt: '2026-08-29T12:00:00.000Z',
    expiresAt: '2026-09-05T12:00:00.000Z',
    ...withoutSignature(overrides),
  };
  return {
    ...unsigned,
    signature: overrides.signature ?? signLease(unsigned),
  };
}

describe('offline reading lease validation', () => {
  beforeEach(() => {
    mockOfflineLeasePublicKey = TEST_PUBLIC_KEY;
    mockReadAccessToken.mockReturnValue(null);
    mockResolveTrustedNow.mockResolvedValue({
      nowMs: Date.parse('2026-08-30T12:00:00.000Z'),
      isClockRollbackDetected: false,
    });
  });

  it('accepts a signed unexpired matching lease', async () => {
    await expect(validateOfflineReadingLease(createManifest())).resolves.toEqual({ isValid: true });
  });

  it('rejects a missing lease', async () => {
    const manifest: OfflineBookManifest = { ...createManifest(), offlineLease: null };
    await expect(validateOfflineReadingLease(manifest)).resolves.toEqual({
      isValid: false,
      reason: 'missing',
    });
  });

  it('rejects a tampered lease payload', async () => {
    const manifest: OfflineBookManifest = createManifest();
    const lease: OfflineReadingLease = manifest.offlineLease as OfflineReadingLease;
    const tampered: OfflineBookManifest = {
      ...manifest,
      offlineLease: { ...lease, accessKind: 'paid' },
    };
    await expect(validateOfflineReadingLease(tampered)).resolves.toEqual({
      isValid: false,
      reason: 'invalid_signature',
    });
  });

  it('rejects an invalid signature', async () => {
    const manifest: OfflineBookManifest = createManifest({ signature: 'invalid-signature' });
    await expect(validateOfflineReadingLease(manifest)).resolves.toEqual({
      isValid: false,
      reason: 'invalid_signature',
    });
  });

  it('rejects a signature verified with the wrong public key', async () => {
    mockOfflineLeasePublicKey = WRONG_PUBLIC_KEY;
    await expect(validateOfflineReadingLease(createManifest())).resolves.toEqual({
      isValid: false,
      reason: 'invalid_signature',
    });
  });

  it('rejects an expired lease', async () => {
    mockResolveTrustedNow.mockResolvedValue({
      nowMs: Date.parse('2026-09-06T12:00:00.000Z'),
      isClockRollbackDetected: false,
    });
    await expect(validateOfflineReadingLease(createManifest())).resolves.toEqual({
      isValid: false,
      reason: 'expired',
    });
  });

  it('rejects a mismatched package', async () => {
    const manifest: OfflineBookManifest = { ...createManifest(), bookAssetId: 10 };
    await expect(validateOfflineReadingLease(manifest)).resolves.toEqual({
      isValid: false,
      reason: 'mismatched_package',
    });
  });

  it('rejects a mismatched current user', async () => {
    mockReadAccessToken.mockReturnValue(createAccessToken(6));
    await expect(validateOfflineReadingLease(createManifest())).resolves.toEqual({
      isValid: false,
      reason: 'mismatched_user',
    });
  });

  it('rejects trusted clock rollback', async () => {
    mockResolveTrustedNow.mockResolvedValue({
      nowMs: Date.parse('2026-08-30T12:00:00.000Z'),
      isClockRollbackDetected: true,
    });
    await expect(validateOfflineReadingLease(createManifest())).resolves.toEqual({
      isValid: false,
      reason: 'clock_rollback',
    });
  });

  it('throws the offline lock API error when validation fails', async () => {
    const manifest: OfflineBookManifest = { ...createManifest(), offlineLease: null };
    await expect(assertOfflineReadingLeaseValid(manifest)).rejects.toMatchObject({
      code: 'OFFLINE_LEASE_EXPIRED',
      statusCode: 403,
    });
  });
});

function withoutSignature(
  lease: Partial<OfflineReadingLease>,
): Partial<Omit<OfflineReadingLease, 'signature'>> {
  const { signature: _signature, ...payload } = lease;
  return payload;
}

function signLease(lease: Omit<OfflineReadingLease, 'signature'>): string {
  const signature: Uint8Array = ed25519.sign(
    utf8ToBytes(JSON.stringify(lease)),
    decodeBase64Url(TEST_PRIVATE_KEY),
  );
  return toBase64Url(signature);
}

function createAccessToken(principalId: number): string {
  return `header.${toBase64Url(utf8ToBytes(JSON.stringify({ principalId })))}.signature`;
}

function decodeBase64Url(value: string): Uint8Array {
  const normalized: string = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded: string = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  );
  const binary: string = globalThis.atob(padded);
  return Uint8Array.from(binary, (character: string) => character.charCodeAt(0));
}

function toBase64Url(bytes: Uint8Array): string {
  const binary: string = String.fromCharCode(...bytes);
  return globalThis
    .btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}
