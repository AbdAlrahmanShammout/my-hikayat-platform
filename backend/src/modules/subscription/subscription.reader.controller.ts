import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { StartCheckoutResult } from '@/modules/subscription/defs/subscription-billing.defs';
import { StartCheckoutRequestDto } from '@/modules/subscription/dto/request/start-checkout-request.dto';
import { SubscriptionResponse } from '@/modules/subscription/dto/response/model/subscription.response';
import { StartCheckoutResponseDto } from '@/modules/subscription/dto/response/start-checkout-response.dto';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { SubscriptionBillingService } from '@/modules/subscription/subscription-billing.service';
import { UserEntity } from '@/modules/user/entity/user.entity';

@ApiTags('Reader - Billing')
@Controller('reader/billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SubscriptionReaderController {
  constructor(private readonly subscriptionBillingService: SubscriptionBillingService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start Stripe Checkout for the monthly plan' })
  @ApiBody({ type: StartCheckoutRequestDto })
  @ApiResponse({ status: 200, type: StartCheckoutResponseDto })
  async startCheckout(
    @Body() body: StartCheckoutRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<StartCheckoutResponseDto> {
    const result: StartCheckoutResult = await this.subscriptionBillingService.startCheckout({
      userId: currentUser.id,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    });
    return new StartCheckoutResponseDto(result);
  }

  @Get('subscription')
  @ApiOperation({ summary: 'Load the authenticated reader current subscription' })
  @ApiResponse({ status: 200, type: SubscriptionResponse })
  async getCurrentSubscription(
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<SubscriptionResponse> {
    const entity: SubscriptionEntity = await this.subscriptionBillingService.getCurrentSubscription(
      currentUser.id,
    );
    return new SubscriptionResponse(entity);
  }
}
