import { createPrivateKey, sign } from 'node:crypto';
import type { KeyObject } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { OfflineLeaseConfigService } from '@/config/offline-lease/offline-lease-config.service';
import {
  OfflineReadingLease,
  OfflineReadingLeaseAccessKind,
} from '@/modules/book-asset/defs/book-asset-service.defs';
import { FullBookAccessDeniedException } from '@/modules/entitlement/exceptions/full-book-access-denied.exception';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { hasPaidReadingEntitlement } from '@/modules/subscription/has-paid-reading-entitlement.helper';
import { hasTrialReadingEntitlement } from '@/modules/subscription/has-trial-reading-entitlement.helper';
import { SubscriptionService } from '@/modules/subscription/subscription.service';

export type IssueOfflineReadingLeaseInput = {
  readonly userId: number;
  readonly bookId: number;
  readonly bookAssetId: number;
};

type UnsignedOfflineReadingLeasePayload = Omit<OfflineReadingLease, 'signature'>;

@Injectable()
export class OfflineReadingLeaseService {
  private readonly privateKey: KeyObject;

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly offlineLeaseConfigService: OfflineLeaseConfigService,
  ) {
    this.privateKey = createPrivateKey({
      key: Buffer.from(offlineLeaseConfigService.privateKey, 'base64url'),
      format: 'der',
      type: 'pkcs8',
    });
  }

  async issueLease(input: IssueOfflineReadingLeaseInput): Promise<OfflineReadingLease> {
    const issuedAt: Date = new Date();
    const subscription: SubscriptionEntity | null =
      await this.subscriptionService.findSubscriptionByUserId(input.userId);
    const leaseWindow: {
      readonly accessKind: OfflineReadingLeaseAccessKind;
      readonly expiresAt: Date;
    } = OfflineReadingLeaseService.resolveLeaseWindow(subscription, issuedAt);
    const payload: UnsignedOfflineReadingLeasePayload = {
      version: 1,
      keyId: this.offlineLeaseConfigService.keyId,
      userId: input.userId,
      bookId: input.bookId,
      bookAssetId: input.bookAssetId,
      accessKind: leaseWindow.accessKind,
      issuedAt,
      expiresAt: leaseWindow.expiresAt,
    };
    return {
      ...payload,
      signature: this.signPayload(payload),
    };
  }

  private signPayload(payload: UnsignedOfflineReadingLeasePayload): string {
    const canonicalPayload: string = OfflineReadingLeaseService.stringifyPayload(payload);
    return sign(null, Buffer.from(canonicalPayload), this.privateKey).toString('base64url');
  }

  private static resolveLeaseWindow(
    subscription: SubscriptionEntity | null,
    now: Date,
  ): { readonly accessKind: OfflineReadingLeaseAccessKind; readonly expiresAt: Date } {
    if (
      subscription !== null &&
      hasPaidReadingEntitlement(subscription, now) &&
      subscription.currentPeriodEnd !== null
    ) {
      return { accessKind: 'paid', expiresAt: subscription.currentPeriodEnd };
    }
    if (
      subscription !== null &&
      hasTrialReadingEntitlement(subscription, now) &&
      subscription.trialEndsAt !== null
    ) {
      return { accessKind: 'trial', expiresAt: subscription.trialEndsAt };
    }
    throw new FullBookAccessDeniedException();
  }

  static stringifyPayload(payload: UnsignedOfflineReadingLeasePayload): string {
    return JSON.stringify({
      version: payload.version,
      keyId: payload.keyId,
      userId: payload.userId,
      bookId: payload.bookId,
      bookAssetId: payload.bookAssetId,
      accessKind: payload.accessKind,
      issuedAt: payload.issuedAt.toISOString(),
      expiresAt: payload.expiresAt.toISOString(),
    });
  }
}
