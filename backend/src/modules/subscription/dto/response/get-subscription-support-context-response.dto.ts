import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PlanKind } from '@/modules/subscription/enum/general.enum';
import { ReadingAccessState } from '@/modules/subscription/resolve-reading-access-state.helper';
import { RefundIneligibilityCode } from '@/modules/subscription/resolve-refund-eligibility.helper';
import {
  SubscriptionSupportContext,
  toPlanSummary,
} from '@/modules/subscription/subscription-support.service';

export class SubscriptionSupportPlanResponse {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: PlanKind })
  kind!: string;

  @ApiProperty({ nullable: true, type: String })
  interval!: string | null;

  @ApiProperty({ nullable: true, type: Number })
  amountCents!: number | null;

  @ApiProperty({ nullable: true, type: String })
  currency!: string | null;
}

export class SubscriptionSupportPaymentFailureResponse {
  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ nullable: true, type: String })
  invoiceStatus!: string | null;
}

export class GetSubscriptionSupportContextResponseDto {
  @ApiProperty()
  computedAt: Date;

  @ApiProperty()
  subscriptionId: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty({ nullable: true, type: Date })
  activatedAt: Date | null;

  @ApiProperty({ enum: ['active', 'canceled'] })
  status: string;

  @ApiProperty({ type: () => SubscriptionSupportPlanResponse, nullable: true })
  plan: SubscriptionSupportPlanResponse | null;

  @ApiProperty({ nullable: true, type: Date })
  currentPeriodStart: Date | null;

  @ApiProperty({ nullable: true, type: Date })
  currentPeriodEnd: Date | null;

  @ApiProperty({ nullable: true, type: Date })
  canceledAt: Date | null;

  @ApiProperty({ nullable: true, type: Date })
  trialStartedAt: Date | null;

  @ApiProperty({ nullable: true, type: Date })
  trialEndsAt: Date | null;

  @ApiProperty({ enum: ReadingAccessState })
  readingAccessState: ReadingAccessState;

  @ApiProperty()
  trialEligible: boolean;

  @ApiProperty({ enum: ['paid_until_period_end', 'trial_until', 'free'] })
  accessExplanationCode: SubscriptionSupportContext['accessExplanationCode'];

  @ApiProperty()
  refundEligible: boolean;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'eligible, REFUND_WINDOW_EXPIRED, or REFUND_NOT_ELIGIBLE',
  })
  refundIneligibilityCode: RefundIneligibilityCode | 'eligible' | null;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Stripe customer id. Present only on this support-context response.',
  })
  stripeCustomerId: string | null;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Stripe subscription id. Present only on this support-context response.',
  })
  stripeSubscriptionId: string | null;

  @ApiPropertyOptional({ type: () => SubscriptionSupportPaymentFailureResponse, nullable: true })
  latestPaymentFailure: SubscriptionSupportPaymentFailureResponse | null;

  constructor(context: SubscriptionSupportContext) {
    const plan = toPlanSummary(context.subscription.plan);
    this.computedAt = context.computedAt;
    this.subscriptionId = context.subscription.id;
    this.userId = context.subscription.userId;
    this.startedAt = context.subscription.startedAt;
    this.activatedAt = context.subscription.activatedAt;
    this.status = context.subscription.status;
    this.plan = plan;
    this.currentPeriodStart = context.subscription.currentPeriodStart;
    this.currentPeriodEnd = context.subscription.currentPeriodEnd;
    this.canceledAt = context.subscription.canceledAt;
    this.trialStartedAt = context.subscription.trialStartedAt;
    this.trialEndsAt = context.subscription.trialEndsAt;
    this.readingAccessState = context.readingAccessState;
    this.trialEligible = context.trialEligible;
    this.accessExplanationCode = context.accessExplanationCode;
    this.refundEligible = context.refundEligible;
    this.refundIneligibilityCode = context.refundEligible
      ? 'eligible'
      : context.refundIneligibilityCode;
    this.stripeCustomerId = context.stripeCustomerId;
    this.stripeSubscriptionId = context.stripeSubscriptionId;
    this.latestPaymentFailure = context.latestPaymentFailure;
  }
}
