import { Module } from '@nestjs/common';

import { BookModule } from '@/modules/book/book.module';
import { SubscriptionModule } from '@/modules/subscription/subscription.module';

import { EntitlementService } from './entitlement.service';

@Module({
  imports: [BookModule, SubscriptionModule],
  providers: [EntitlementService],
  exports: [EntitlementService],
})
export class EntitlementModule {}
