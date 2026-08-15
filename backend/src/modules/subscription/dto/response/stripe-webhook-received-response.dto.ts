import { ApiProperty } from '@nestjs/swagger';

export class StripeWebhookReceivedResponseDto {
  @ApiProperty({ description: 'Whether the webhook was accepted', example: true })
  received: boolean;

  constructor() {
    this.received = true;
  }
}
