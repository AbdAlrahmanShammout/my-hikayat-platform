import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { SubscriptionPage } from '@/modules/subscription/defs/subscription-repository.defs';
import { ListSubscriptionsRequestDto } from '@/modules/subscription/dto/request/list-subscriptions-request.dto';
import { GetSubscriptionsResponseDto } from '@/modules/subscription/dto/response/get-subscriptions-response.dto';
import { SubscriptionResponse } from '@/modules/subscription/dto/response/model/subscription.response';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { SubscriptionBillingService } from '@/modules/subscription/subscription-billing.service';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Admin - Subscriptions')
@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class SubscriptionAdminController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly subscriptionBillingService: SubscriptionBillingService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List platform subscriptions' })
  @ApiResponse({ status: 200, type: GetSubscriptionsResponseDto })
  async listSubscriptions(
    @Query() query: ListSubscriptionsRequestDto,
  ): Promise<GetSubscriptionsResponseDto> {
    const page: SubscriptionPage = await this.subscriptionService.listSubscriptions({
      limit: query.limit,
      offset: query.offset,
      userId: query.userId,
      status: query.status,
    });
    return new GetSubscriptionsResponseDto(page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a platform subscription' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: SubscriptionResponse })
  async getSubscription(@Param('id', ParseIntPipe) id: number): Promise<SubscriptionResponse> {
    const entity: SubscriptionEntity = await this.subscriptionService.getSubscriptionById(id);
    return new SubscriptionResponse(entity);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a subscription without issuing a refund' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: SubscriptionResponse })
  async cancelSubscription(
    @Param('id', ParseIntPipe) id: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<SubscriptionResponse> {
    const entity: SubscriptionEntity =
      await this.subscriptionBillingService.cancelManagedSubscription({
        subscriptionId: id,
        actorUserId: currentUser.id,
      });
    return new SubscriptionResponse(entity);
  }
}
