import { ApiProperty } from '@nestjs/swagger';

import { StartCheckoutResult } from '@/modules/subscription/defs/subscription-billing.defs';

export class StartCheckoutResponseDto {
  @ApiProperty({
    description: 'Hosted Stripe Checkout URL',
    example: 'https://checkout.stripe.test/cs_memory_7',
  })
  url: string;

  constructor(result: StartCheckoutResult) {
    this.url = result.url;
  }
}
