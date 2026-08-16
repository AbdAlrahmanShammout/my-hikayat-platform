import { Injectable } from '@nestjs/common';

import { BookService } from '@/modules/book/book.service';
import { AssertFullBookAccessServiceInput } from '@/modules/entitlement/defs/entitlement-service.defs';
import { FullBookAccessDeniedException } from '@/modules/entitlement/exceptions/full-book-access-denied.exception';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { hasPaidReadingEntitlement } from '@/modules/subscription/has-paid-reading-entitlement.helper';
import { SubscriptionService } from '@/modules/subscription/subscription.service';

@Injectable()
export class EntitlementService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly bookService: BookService,
  ) {}

  /**
   * Paid reading access follows the paid plan and `currentPeriodEnd`, not immediate Stripe
   * collection status. Canceled subscriptions stay entitled until that timestamp; free plans never
   * do.
   */
  async hasPaidReadingAccess(userId: number): Promise<boolean> {
    const subscription: SubscriptionEntity | null =
      await this.subscriptionService.findSubscriptionByUserId(userId);
    return hasPaidReadingEntitlement(subscription);
  }

  async assertPaidReadingAccess(userId: number): Promise<void> {
    const hasAccess: boolean = await this.hasPaidReadingAccess(userId);
    if (!hasAccess) {
      throw new FullBookAccessDeniedException();
    }
  }

  async assertCanAccessFullBook(input: AssertFullBookAccessServiceInput): Promise<void> {
    await this.bookService.getCatalogBookById(input.bookId);
    await this.assertPaidReadingAccess(input.userId);
  }
}
