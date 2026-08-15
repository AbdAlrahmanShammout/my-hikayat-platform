import { Module } from '@nestjs/common';

import { UserModule } from '@/modules/user/user.module';
import { DatabaseProviderModule } from '@/providers/database/database-provider.module';

import { PlanService } from './plan.service';
import { PlanPrismaRepository } from './repository/plan-prisma.repository';
import { PlanRepository } from './repository/plan.repository';
import { SubscriptionPrismaRepository } from './repository/subscription-prisma.repository';
import { SubscriptionRepository } from './repository/subscription.repository';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [DatabaseProviderModule, UserModule],
  providers: [
    PlanService,
    SubscriptionService,
    { provide: PlanRepository, useClass: PlanPrismaRepository },
    { provide: SubscriptionRepository, useClass: SubscriptionPrismaRepository },
  ],
  exports: [PlanService, SubscriptionService],
})
export class SubscriptionModule {}
