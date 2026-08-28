import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { PublicRoute } from '@/common/decorators/route/public-route.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { StartCheckoutResult } from '@/modules/subscription/defs/subscription-billing.defs';
import { CheckoutReturnRequestDto } from '@/modules/subscription/dto/request/checkout-return-request.dto';
import { StartCheckoutRequestDto } from '@/modules/subscription/dto/request/start-checkout-request.dto';
import { SubscriptionResponse } from '@/modules/subscription/dto/response/model/subscription.response';
import { StartCheckoutResponseDto } from '@/modules/subscription/dto/response/start-checkout-response.dto';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { readRequestPublicOrigin } from '@/modules/subscription/read-request-public-origin.helper';
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
    @Req() request: Request,
  ): Promise<StartCheckoutResponseDto> {
    const result: StartCheckoutResult = await this.subscriptionBillingService.startCheckout({
      userId: currentUser.id,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
      bridgeOrigin: readRequestPublicOrigin(request),
    });
    return new StartCheckoutResponseDto(result);
  }

  @Get('checkout-return')
  @PublicRoute()
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Return from Stripe Checkout to an allowlisted app URL' })
  @ApiResponse({
    status: 200,
    description: 'HTML page that navigates to the allowlisted return URL',
  })
  renderCheckoutReturn(@Query() query: CheckoutReturnRequestDto): string {
    return this.subscriptionBillingService.renderCheckoutReturnPage(query.to);
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

  @Post('refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a refund within 7 days of activating monthly access' })
  @ApiResponse({ status: 200, type: SubscriptionResponse })
  async requestRefund(@LoggedInUser() currentUser: UserEntity): Promise<SubscriptionResponse> {
    const entity: SubscriptionEntity = await this.subscriptionBillingService.requestRefund(
      currentUser.id,
    );
    return new SubscriptionResponse(entity);
  }
}
