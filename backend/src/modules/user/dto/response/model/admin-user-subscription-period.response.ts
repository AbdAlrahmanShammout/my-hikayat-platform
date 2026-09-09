import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { SubscriptionPeriodProgress } from '@/modules/subscription/defs/subscription-period-progress.defs';

export class AdminUserSubscriptionPeriodResponse {
  @ApiPropertyOptional({
    description: 'Start of the bounded subscription or trial period used for remaining time',
    example: '2026-09-01T00:00:00.000Z',
    nullable: true,
  })
  periodStartedAt: Date | null;

  @ApiPropertyOptional({
    description: 'End of the bounded subscription or trial period used for remaining time',
    example: '2026-10-01T00:00:00.000Z',
    nullable: true,
  })
  periodEndsAt: Date | null;

  @ApiPropertyOptional({
    description:
      'Milliseconds remaining until periodEndsAt. Null when the plan has no expiration.',
    example: 1987200000,
    nullable: true,
  })
  remainingMs: number | null;

  @ApiPropertyOptional({
    description:
      'Elapsed percent of the bounded period (0–100). Null when the plan has no expiration.',
    example: 23,
    nullable: true,
  })
  elapsedPercent: number | null;

  constructor(progress: SubscriptionPeriodProgress) {
    this.periodStartedAt = progress.periodStartedAt;
    this.periodEndsAt = progress.periodEndsAt;
    this.remainingMs = progress.remainingMs;
    this.elapsedPercent = progress.elapsedPercent;
  }
}
