import { createPublicKey, verify } from 'node:crypto';

import { OfflineLeaseConfigService } from '@/config/offline-lease/offline-lease-config.service';
import { OfflineReadingLease } from '@/modules/book-asset/defs/book-asset-service.defs';
import { OfflineReadingLeaseService } from '@/modules/book-asset/offline-reading-lease.service';
import { FullBookAccessDeniedException } from '@/modules/entitlement/exceptions/full-book-access-denied.exception';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import {
  PlanInterval,
  PlanKind,
  SubscriptionStatus,
} from '@/modules/subscription/enum/general.enum';
import { SubscriptionService } from '@/modules/subscription/subscription.service';

const PRIVATE_KEY = 'MC4CAQAwBQYDK2VwBCIEIP38HzT82ttN8iwco07E9pFgJU9j2UUkFvrb94IKPXua';
const PUBLIC_KEY = 'EwEyZmtwOVXpGC-N-e_5ygymL8uCL8O3XJDxKe0liks';
const WRONG_PUBLIC_KEY = 'bKtuzm-gY9xLlkGtiZCLAQTIXFaU6EBqRrEZjnqWuIA';

function createPlan(kind: PlanKind): PlanEntity {
  return new PlanEntity({
    id: kind === PlanKind.FREE ? 1 : 2,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    slug: kind === PlanKind.FREE ? 'free' : 'monthly',
    name: kind === PlanKind.FREE ? 'Free' : 'Monthly',
    description: 'Plan',
    kind,
    interval: kind === PlanKind.FREE ? null : PlanInterval.MONTH,
    stripePriceId: kind === PlanKind.FREE ? null : 'price_123',
    amountCents: kind === PlanKind.FREE ? null : 999,
    currency: kind === PlanKind.FREE ? null : 'usd',
    deletedAt: null,
  });
}

function createSubscription(input: {
  readonly kind: PlanKind;
  readonly trialEndsAt?: Date | null;
  readonly currentPeriodEnd?: Date | null;
}): SubscriptionEntity {
  return new SubscriptionEntity({
    id: 7,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 5,
    planId: input.kind === PlanKind.FREE ? 1 : 2,
    status: SubscriptionStatus.ACTIVE,
    startedAt: new Date('2026-01-01T00:00:00.000Z'),
    currentPeriodStart: null,
    currentPeriodEnd: input.currentPeriodEnd ?? null,
    canceledAt: null,
    activatedAt: null,
    trialStartedAt: input.trialEndsAt === undefined ? null : new Date('2026-08-29T12:00:00.000Z'),
    trialEndsAt: input.trialEndsAt ?? null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    plan: createPlan(input.kind),
  });
}

describe('OfflineReadingLeaseService', () => {
  let mockSubscriptionService: { findSubscriptionByUserId: jest.Mock };
  let offlineReadingLeaseService: OfflineReadingLeaseService;

  beforeEach(() => {
    mockSubscriptionService = { findSubscriptionByUserId: jest.fn() };
    offlineReadingLeaseService = new OfflineReadingLeaseService(
      mockSubscriptionService as unknown as SubscriptionService,
      {
        privateKey: PRIVATE_KEY,
        keyId: 'test',
      } as OfflineLeaseConfigService,
    );
  });

  it('issues a signed trial lease that expires at trialEndsAt', async () => {
    mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
      createSubscription({
        kind: PlanKind.FREE,
        trialEndsAt: new Date(Date.now() + 60_000),
      }),
    );
    const actualLease: OfflineReadingLease = await offlineReadingLeaseService.issueLease({
      userId: 5,
      bookId: 8,
      bookAssetId: 9,
    });
    expect(actualLease.accessKind).toBe('trial');
    expect(verifyLease(actualLease)).toBe(true);
  });

  it('rejects a modified payload with the original signature', async () => {
    mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
      createSubscription({
        kind: PlanKind.FREE,
        trialEndsAt: new Date(Date.now() + 60_000),
      }),
    );
    const lease: OfflineReadingLease = await offlineReadingLeaseService.issueLease({
      userId: 5,
      bookId: 8,
      bookAssetId: 9,
    });
    const tampered: OfflineReadingLease = { ...lease, bookId: 10 };
    expect(verifyLease(tampered)).toBe(false);
  });

  it('rejects a modified signature', async () => {
    mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
      createSubscription({
        kind: PlanKind.FREE,
        trialEndsAt: new Date(Date.now() + 60_000),
      }),
    );
    const lease: OfflineReadingLease = await offlineReadingLeaseService.issueLease({
      userId: 5,
      bookId: 8,
      bookAssetId: 9,
    });
    const tampered: OfflineReadingLease = { ...lease, signature: `${lease.signature.slice(1)}A` };
    expect(verifyLease(tampered)).toBe(false);
  });

  it('rejects verification with the wrong public key', async () => {
    mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
      createSubscription({
        kind: PlanKind.FREE,
        trialEndsAt: new Date(Date.now() + 60_000),
      }),
    );
    const lease: OfflineReadingLease = await offlineReadingLeaseService.issueLease({
      userId: 5,
      bookId: 8,
      bookAssetId: 9,
    });
    expect(verifyLease(lease, WRONG_PUBLIC_KEY)).toBe(false);
  });

  it('issues a paid lease that expires at currentPeriodEnd', async () => {
    const expectedPeriodEnd = new Date(Date.now() + 120_000);
    mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
      createSubscription({
        kind: PlanKind.MONTHLY_PAID,
        currentPeriodEnd: expectedPeriodEnd,
      }),
    );
    const actualLease: OfflineReadingLease = await offlineReadingLeaseService.issueLease({
      userId: 5,
      bookId: 8,
      bookAssetId: 9,
    });
    expect(actualLease.accessKind).toBe('paid');
    expect(actualLease.expiresAt).toBe(expectedPeriodEnd);
  });

  it('denies lease issuance without full-book entitlement', async () => {
    mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
      createSubscription({ kind: PlanKind.FREE }),
    );
    await expect(
      offlineReadingLeaseService.issueLease({ userId: 5, bookId: 8, bookAssetId: 9 }),
    ).rejects.toBeInstanceOf(FullBookAccessDeniedException);
  });
});

function verifyLease(lease: OfflineReadingLease, publicKeyValue: string = PUBLIC_KEY): boolean {
  const publicKey = createPublicKey({
    key: { crv: 'Ed25519', kty: 'OKP', x: publicKeyValue },
    format: 'jwk',
  });
  return verify(
    null,
    Buffer.from(OfflineReadingLeaseService.stringifyPayload(lease)),
    publicKey,
    Buffer.from(lease.signature, 'base64url'),
  );
}
