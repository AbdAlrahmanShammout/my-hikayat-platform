import { Module } from '@nestjs/common';

import { AuditModule } from '@/modules/audit/audit.module';
import { UserModule } from '@/modules/user/user.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';
import { StripeProviderModule } from '@/providers/stripe/stripe-provider.module';

import { PlanService } from './plan.service';
import { PlanPrismaRepository } from './repository/plan-prisma.repository';
import { PlanRepository } from './repository/plan.repository';
import { SubscriptionPrismaRepository } from './repository/subscription-prisma.repository';
import { SubscriptionRepository } from './repository/subscription.repository';
import { StripeEventHandlersImplementsService } from './stripe-event-handlers-implements.service';
import { SubscriptionBillingService } from './subscription-billing.service';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [DatabaseProviderModule, UserModule, StripeProviderModule, AuditModule],
  providers: [
    PlanService,
    SubscriptionService,
    SubscriptionBillingService,
    StripeEventHandlersImplementsService,
    { provide: PlanRepository, useClass: PlanPrismaRepository },
    { provide: SubscriptionRepository, useClass: SubscriptionPrismaRepository },
  ],
  exports: [PlanService, SubscriptionService, SubscriptionBillingService],
})
export class SubscriptionModule {}
