import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import {
  PlanInterval,
  PlanKind,
  SubscriptionStatus,
} from '@/modules/subscription/enum/general.enum';
import { SubscriptionService } from '@/modules/subscription/subscription.service';

import { EntitlementService } from './entitlement.service';
import { FullBookAccessDeniedException } from './exceptions/full-book-access-denied.exception';

const NOW: Date = new Date('2026-08-16T12:00:00.000Z');
const FUTURE_PERIOD_END: Date = new Date('2026-09-01T00:00:00.000Z');
const PAST_PERIOD_END: Date = new Date('2026-08-01T00:00:00.000Z');

function createSampleBook(): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A reflowable chapter book.',
    layoutType: BookLayoutType.REFLOWABLE,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.APPROVED,
    processingStatus: BookProcessingStatus.READY,
    publishedAt: new Date('2026-08-15T00:00:00.000Z'),
    ownerId: 4,
    categories: [],
  });
}

function createSamplePlan(kind: PlanKind): PlanEntity {
  return new PlanEntity({
    id: kind === PlanKind.FREE ? 1 : 2,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    slug: kind === PlanKind.FREE ? 'free' : 'monthly',
    name: kind === PlanKind.FREE ? 'Free' : 'Monthly',
    kind,
    interval: kind === PlanKind.FREE ? null : PlanInterval.MONTH,
  });
}

function createSampleSubscription(input: {
  readonly kind: PlanKind;
  readonly status?: SubscriptionStatus;
  readonly currentPeriodEnd?: Date | null;
}): SubscriptionEntity {
  const plan = createSamplePlan(input.kind);
  const status = input.status ?? SubscriptionStatus.ACTIVE;
  const currentPeriodEnd =
    input.currentPeriodEnd === undefined ? FUTURE_PERIOD_END : input.currentPeriodEnd;
  return new SubscriptionEntity({
    id: 7,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 5,
    planId: plan.id,
    status,
    startedAt: new Date('2026-01-01T00:00:00.000Z'),
    currentPeriodStart: currentPeriodEnd === null ? null : new Date('2026-08-01T00:00:00.000Z'),
    currentPeriodEnd,
    canceledAt: status === SubscriptionStatus.CANCELED ? NOW : null,
    activatedAt: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    plan,
  });
}

describe('EntitlementService', () => {
  let mockSubscriptionService: { findSubscriptionByUserId: jest.Mock };
  let mockBookService: { getCatalogBookById: jest.Mock };
  let entitlementService: EntitlementService;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
    mockSubscriptionService = { findSubscriptionByUserId: jest.fn() };
    mockBookService = { getCatalogBookById: jest.fn() };
    entitlementService = new EntitlementService(
      mockSubscriptionService as unknown as SubscriptionService,
      mockBookService as unknown as BookService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('hasPaidReadingAccess', () => {
    it('allows an active paid subscription before currentPeriodEnd', async () => {
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription({ kind: PlanKind.MONTHLY_PAID }),
      );
      await expect(entitlementService.hasPaidReadingAccess(5)).resolves.toBe(true);
    });

    it('denies an active paid subscription after currentPeriodEnd', async () => {
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription({
          kind: PlanKind.MONTHLY_PAID,
          currentPeriodEnd: PAST_PERIOD_END,
        }),
      );
      await expect(entitlementService.hasPaidReadingAccess(5)).resolves.toBe(false);
    });

    it('allows past_due before currentPeriodEnd when stored as local active', async () => {
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription({
          kind: PlanKind.MONTHLY_PAID,
          status: SubscriptionStatus.ACTIVE,
        }),
      );
      await expect(entitlementService.hasPaidReadingAccess(5)).resolves.toBe(true);
    });

    it('denies past_due after currentPeriodEnd when stored as local active', async () => {
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription({
          kind: PlanKind.MONTHLY_PAID,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: PAST_PERIOD_END,
        }),
      );
      await expect(entitlementService.hasPaidReadingAccess(5)).resolves.toBe(false);
    });

    it('allows a canceled paid subscription before currentPeriodEnd', async () => {
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription({
          kind: PlanKind.MONTHLY_PAID,
          status: SubscriptionStatus.CANCELED,
        }),
      );
      await expect(entitlementService.hasPaidReadingAccess(5)).resolves.toBe(true);
    });

    it('denies a canceled paid subscription after currentPeriodEnd', async () => {
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription({
          kind: PlanKind.MONTHLY_PAID,
          status: SubscriptionStatus.CANCELED,
          currentPeriodEnd: PAST_PERIOD_END,
        }),
      );
      await expect(entitlementService.hasPaidReadingAccess(5)).resolves.toBe(false);
    });

    it('never treats a free plan as paid entitlement', async () => {
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription({ kind: PlanKind.FREE }),
      );
      await expect(entitlementService.hasPaidReadingAccess(5)).resolves.toBe(false);
    });

    it('denies a paid subscription with no currentPeriodEnd', async () => {
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription({ kind: PlanKind.MONTHLY_PAID, currentPeriodEnd: null }),
      );
      await expect(entitlementService.hasPaidReadingAccess(5)).resolves.toBe(false);
    });

    it('returns false when the user has no subscription', async () => {
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(null);
      await expect(entitlementService.hasPaidReadingAccess(5)).resolves.toBe(false);
    });

    it('returns false when the subscription has no plan loaded', async () => {
      const subscription = createSampleSubscription({ kind: PlanKind.MONTHLY_PAID });
      subscription.plan = undefined;
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(subscription);
      await expect(entitlementService.hasPaidReadingAccess(5)).resolves.toBe(false);
    });
  });

  describe('assertCanAccessFullBook', () => {
    it('allows access when the catalog book exists and the user is paid', async () => {
      mockBookService.getCatalogBookById.mockResolvedValue(createSampleBook());
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription({ kind: PlanKind.MONTHLY_PAID }),
      );
      await expect(
        entitlementService.assertCanAccessFullBook({ userId: 5, bookId: 8 }),
      ).resolves.toBeUndefined();
    });

    it('hides a catalog-invisible book as not found before checking payment', async () => {
      mockBookService.getCatalogBookById.mockRejectedValue(
        new ResourceNotFoundException('Book', 8),
      );
      await expect(
        entitlementService.assertCanAccessFullBook({ userId: 5, bookId: 8 }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(mockSubscriptionService.findSubscriptionByUserId).not.toHaveBeenCalled();
    });

    it('denies a free subscriber after the catalog book is found', async () => {
      mockBookService.getCatalogBookById.mockResolvedValue(createSampleBook());
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription({ kind: PlanKind.FREE }),
      );
      await expect(
        entitlementService.assertCanAccessFullBook({ userId: 5, bookId: 8 }),
      ).rejects.toBeInstanceOf(FullBookAccessDeniedException);
    });
  });
});
