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

function createSampleSubscription(
  kind: PlanKind,
  status = SubscriptionStatus.ACTIVE,
): SubscriptionEntity {
  const plan = createSamplePlan(kind);
  return new SubscriptionEntity({
    id: 7,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 5,
    planId: plan.id,
    status,
    startedAt: new Date('2026-01-01T00:00:00.000Z'),
    currentPeriodStart: null,
    currentPeriodEnd: null,
    canceledAt: status === SubscriptionStatus.CANCELED ? new Date() : null,
    activatedAt: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    plan,
  });
}

describe('EntitlementService', () => {
  let mockSubscriptionService: { findSubscriptionByUserId: jest.Mock };
  let mockBookService: { getBookById: jest.Mock };
  let entitlementService: EntitlementService;

  beforeEach(() => {
    mockSubscriptionService = { findSubscriptionByUserId: jest.fn() };
    mockBookService = { getBookById: jest.fn() };
    entitlementService = new EntitlementService(
      mockSubscriptionService as unknown as SubscriptionService,
      mockBookService as unknown as BookService,
    );
  });

  describe('hasPaidReadingAccess', () => {
    it('returns true for an active monthly subscription', async () => {
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription(PlanKind.MONTHLY_PAID),
      );
      await expect(entitlementService.hasPaidReadingAccess(5)).resolves.toBe(true);
    });

    it('returns false for an active free subscription', async () => {
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription(PlanKind.FREE),
      );
      await expect(entitlementService.hasPaidReadingAccess(5)).resolves.toBe(false);
    });

    it('returns false when the paid subscription is canceled', async () => {
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription(PlanKind.MONTHLY_PAID, SubscriptionStatus.CANCELED),
      );
      await expect(entitlementService.hasPaidReadingAccess(5)).resolves.toBe(false);
    });

    it('returns false when the user has no subscription', async () => {
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(null);
      await expect(entitlementService.hasPaidReadingAccess(5)).resolves.toBe(false);
    });

    it('returns false when the subscription has no plan loaded', async () => {
      const subscription = createSampleSubscription(PlanKind.MONTHLY_PAID);
      subscription.plan = undefined;
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(subscription);
      await expect(entitlementService.hasPaidReadingAccess(5)).resolves.toBe(false);
    });
  });

  describe('assertCanAccessFullBook', () => {
    it('allows access when the book exists and the user is paid', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription(PlanKind.MONTHLY_PAID),
      );
      await expect(
        entitlementService.assertCanAccessFullBook({ userId: 5, bookId: 8 }),
      ).resolves.toBeUndefined();
    });

    it('hides a missing book as not found before checking payment', async () => {
      mockBookService.getBookById.mockRejectedValue(new ResourceNotFoundException('Book', 8));
      await expect(
        entitlementService.assertCanAccessFullBook({ userId: 5, bookId: 8 }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(mockSubscriptionService.findSubscriptionByUserId).not.toHaveBeenCalled();
    });

    it('denies a free subscriber after the book is found', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockSubscriptionService.findSubscriptionByUserId.mockResolvedValue(
        createSampleSubscription(PlanKind.FREE),
      );
      await expect(
        entitlementService.assertCanAccessFullBook({ userId: 5, bookId: 8 }),
      ).rejects.toBeInstanceOf(FullBookAccessDeniedException);
    });
  });
});
