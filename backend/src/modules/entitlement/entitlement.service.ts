import { Injectable } from '@nestjs/common';

import { BookService } from '@/modules/book/book.service';
import { AssertFullBookAccessServiceInput } from '@/modules/entitlement/defs/entitlement-service.defs';
import { FullBookAccessDeniedException } from '@/modules/entitlement/exceptions/full-book-access-denied.exception';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { PlanKind, SubscriptionStatus } from '@/modules/subscription/enum/general.enum';
import { SubscriptionService } from '@/modules/subscription/subscription.service';

@Injectable()
export class EntitlementService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly bookService: BookService,
  ) {}

  async hasPaidReadingAccess(userId: number): Promise<boolean> {
    const subscription: SubscriptionEntity | null =
      await this.subscriptionService.findSubscriptionByUserId(userId);
    return EntitlementService.isPaidActive(subscription);
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

  private static isPaidActive(subscription: SubscriptionEntity | null): boolean {
    return (
      subscription !== null &&
      subscription.status === SubscriptionStatus.ACTIVE &&
      subscription.plan?.kind === PlanKind.MONTHLY_PAID
    );
  }
}
