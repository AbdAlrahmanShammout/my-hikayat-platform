import { Injectable } from '@nestjs/common';

import { BookService } from '@/modules/book/book.service';
import { AssertFullBookAccessServiceInput } from '@/modules/entitlement/defs/entitlement-service.defs';
import { FullBookAccessDeniedException } from '@/modules/entitlement/exceptions/full-book-access-denied.exception';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { hasFullBookReadingEntitlement } from '@/modules/subscription/has-full-book-reading-entitlement.helper';
import { SubscriptionService } from '@/modules/subscription/subscription.service';

@Injectable()
export class EntitlementService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly bookService: BookService,
  ) {}

  /**
   * Full-book reading access follows paid plan period end or an active no-card trial window.
   * Free plans without an open trial never grant access. Canceled paid subscriptions stay
   * entitled until currentPeriodEnd.
   */
  async hasFullBookReadingAccess(userId: number): Promise<boolean> {
    const subscription: SubscriptionEntity | null =
      await this.subscriptionService.findSubscriptionByUserId(userId);
    return hasFullBookReadingEntitlement(subscription);
  }

  async assertFullBookReadingAccess(userId: number): Promise<void> {
    const hasAccess: boolean = await this.hasFullBookReadingAccess(userId);
    if (!hasAccess) {
      throw new FullBookAccessDeniedException();
    }
  }

  async assertCanAccessFullBook(input: AssertFullBookAccessServiceInput): Promise<void> {
    await this.bookService.getCatalogBookById(input.bookId);
    await this.assertFullBookReadingAccess(input.userId);
  }
}
