import { ed25519 } from '@noble/curves/ed25519.js';
import { utf8ToBytes } from '@noble/hashes/utils.js';

import { ApiError } from '@/api/api-error';
import { getOfflineLeasePublicKey } from '@/config/env';
import type {
  OfflineBookManifest,
  OfflineReadingLease,
} from '@/features/offline/types/offline-book-manifest';
import { readCurrentUserId } from '@/features/offline/lib/read-current-user-id';
import {
  recordTrustedServerTime,
  resolveTrustedNow,
} from '@/storage/offline-trusted-time-storage';

export type OfflineLeaseValidationResult =
  | { readonly isValid: true }
  | { readonly isValid: false; readonly reason: OfflineLeaseInvalidReason };

export type OfflineLeaseInvalidReason =
  | 'missing'
  | 'mismatched_package'
  | 'mismatched_user'
  | 'invalid_signature'
  | 'expired'
  | 'clock_rollback';

export async function assertOfflineReadingLeaseValid(
  manifest: OfflineBookManifest,
): Promise<void> {
  const result: OfflineLeaseValidationResult = await validateOfflineReadingLease(manifest);
  if (result.isValid) {
    return;
  }
  throw new ApiError({
    message: mapInvalidReasonToMessage(result.reason),
    code: 'OFFLINE_LEASE_EXPIRED',
    statusCode: 403,
  });
}

export async function validateOfflineReadingLease(
  manifest: OfflineBookManifest,
): Promise<OfflineLeaseValidationResult> {
  const lease: OfflineReadingLease | null = manifest.offlineLease;
  if (lease === null) {
    return { isValid: false, reason: 'missing' };
  }
  if (lease.bookId !== manifest.bookId || lease.bookAssetId !== manifest.bookAssetId) {
    return { isValid: false, reason: 'mismatched_package' };
  }
  const currentUserId: number | null = readCurrentUserId();
  if (currentUserId !== null && currentUserId !== lease.userId) {
    return { isValid: false, reason: 'mismatched_user' };
  }
  if (!verifyOfflineReadingLeaseSignature(lease)) {
    return { isValid: false, reason: 'invalid_signature' };
  }
  await recordTrustedServerTime(lease.issuedAt);
  const trustedNow = await resolveTrustedNow();
  if (trustedNow.isClockRollbackDetected) {
    return { isValid: false, reason: 'clock_rollback' };
  }
  const expiresAtMs: number = Date.parse(lease.expiresAt);
  if (!Number.isFinite(expiresAtMs) || trustedNow.nowMs >= expiresAtMs) {
    return { isValid: false, reason: 'expired' };
  }
  return { isValid: true };
}

function verifyOfflineReadingLeaseSignature(lease: OfflineReadingLease): boolean {
  try {
    const publicKey: string = resolveOfflineLeasePublicKey(lease.keyId);
    return ed25519.verify(
      decodeBase64Url(lease.signature),
      encodeUtf8(stringifyOfflineReadingLeasePayload(lease)),
      decodeBase64Url(publicKey),
    );
  } catch {
    return false;
  }
}

function resolveOfflineLeasePublicKey(_keyId: string): string {
  return getOfflineLeasePublicKey();
}

function stringifyOfflineReadingLeasePayload(lease: OfflineReadingLease): string {
  return JSON.stringify({
    version: lease.version,
    keyId: lease.keyId,
    userId: lease.userId,
    bookId: lease.bookId,
    bookAssetId: lease.bookAssetId,
    accessKind: lease.accessKind,
    issuedAt: lease.issuedAt,
    expiresAt: lease.expiresAt,
  });
}

function mapInvalidReasonToMessage(reason: OfflineLeaseInvalidReason): string {
  if (reason === 'clock_rollback') {
    return 'Your device time changed. Connect to the internet to refresh this download.';
  }
  return 'This offline download is locked. Connect to the internet or Subscribe to refresh access.';
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

function encodeUtf8(value: string): Uint8Array {
  return utf8ToBytes(value);
}
