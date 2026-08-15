import { Controller, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RawBody } from '@/common/decorators/requests/raw-body.decorator';
import { StripeWebhookReceivedResponseDto } from '@/modules/subscription/dto/response/stripe-webhook-received-response.dto';
import { SubscriptionBillingService } from '@/modules/subscription/subscription-billing.service';

@ApiTags('Webhooks - Stripe')
@Controller('webhooks/stripe')
export class SubscriptionWebhookController {
  constructor(private readonly subscriptionBillingService: SubscriptionBillingService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive Stripe subscription webhook events' })
  @ApiHeader({ name: 'stripe-signature', required: true })
  @ApiResponse({ status: 200, type: StripeWebhookReceivedResponseDto })
  async receiveWebhook(
    @Headers('stripe-signature') signature: string | undefined,
    @RawBody() payload: Buffer | undefined,
  ): Promise<StripeWebhookReceivedResponseDto> {
    await this.subscriptionBillingService.receiveWebhook({
      payload,
      signature,
    });
    return new StripeWebhookReceivedResponseDto();
  }
}
