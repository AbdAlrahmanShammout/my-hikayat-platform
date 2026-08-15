import { ApiProperty } from '@nestjs/swagger';

import { SubscriptionPage } from '@/modules/subscription/defs/subscription-repository.defs';
import { SubscriptionResponse } from '@/modules/subscription/dto/response/model/subscription.response';

export class GetSubscriptionsResponseDto {
  @ApiProperty({ type: () => [SubscriptionResponse] })
  subscriptions: SubscriptionResponse[];

  @ApiProperty({
    description: 'Total rows matching the filter, across all pages',
    example: 12,
  })
  total: number;

  constructor(page: SubscriptionPage) {
    this.subscriptions = page.entities.map((entity) => new SubscriptionResponse(entity));
    this.total = page.total;
  }
}
