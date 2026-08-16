import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AdminAnalyticsService } from '@/modules/monetization/admin-analytics.service';
import {
  AdminPeriodAnalyticsPage,
  AdminPeriodBookHeatmap,
  AdminPeriodEarningsPage,
} from '@/modules/monetization/defs/admin-analytics-service.defs';
import { RevenuePeriodPage } from '@/modules/monetization/defs/revenue-period-repository.defs';
import { CreateRevenuePeriodRequestDto } from '@/modules/monetization/dto/request/create-revenue-period-request.dto';
import { ListAdminPeriodRowsRequestDto } from '@/modules/monetization/dto/request/list-admin-period-rows-request.dto';
import { ListRevenuePeriodsRequestDto } from '@/modules/monetization/dto/request/list-revenue-periods-request.dto';
import { UpdateRevenuePeriodRequestDto } from '@/modules/monetization/dto/request/update-revenue-period-request.dto';
import { GetAdminPeriodAnalyticsResponseDto } from '@/modules/monetization/dto/response/get-admin-period-analytics-response.dto';
import { GetAdminPeriodBookHeatmapResponseDto } from '@/modules/monetization/dto/response/get-admin-period-book-heatmap-response.dto';
import { GetAdminPeriodEarningsResponseDto } from '@/modules/monetization/dto/response/get-admin-period-earnings-response.dto';
import { GetRevenuePeriodsResponseDto } from '@/modules/monetization/dto/response/get-revenue-periods-response.dto';
import { RevenuePeriodResponse } from '@/modules/monetization/dto/response/model/revenue-period.response';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Admin - Monetization')
@Controller('admin/revenue-periods')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class MonetizationAdminController {
  constructor(
    private readonly revenuePeriodService: RevenuePeriodService,
    private readonly adminAnalyticsService: AdminAnalyticsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List revenue periods newest first' })
  @ApiResponse({ status: 200, type: GetRevenuePeriodsResponseDto })
  async listRevenuePeriods(
    @Query() query: ListRevenuePeriodsRequestDto,
  ): Promise<GetRevenuePeriodsResponseDto> {
    const page: RevenuePeriodPage = await this.revenuePeriodService.listRevenuePeriods({
      limit: query.limit,
      offset: query.offset,
    });
    return new GetRevenuePeriodsResponseDto(page);
  }

  @Post('current')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Open the current UTC month revenue period if it does not exist' })
  @ApiResponse({ status: 200, type: RevenuePeriodResponse })
  async ensureCurrentRevenuePeriod(): Promise<RevenuePeriodResponse> {
    const entity: RevenuePeriodEntity = await this.revenuePeriodService.ensureCurrentPeriod();
    return new RevenuePeriodResponse(entity);
  }

  @Post()
  @ApiOperation({ summary: 'Create a revenue period with an optional pool amount' })
  @ApiBody({ type: CreateRevenuePeriodRequestDto })
  @ApiResponse({ status: 201, type: RevenuePeriodResponse })
  async createRevenuePeriod(
    @Body() body: CreateRevenuePeriodRequestDto,
  ): Promise<RevenuePeriodResponse> {
    const entity: RevenuePeriodEntity = await this.revenuePeriodService.createRevenuePeriod({
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      platformCutPercent: body.platformCutPercent,
      poolAmountCents: body.poolAmountCents,
    });
    return new RevenuePeriodResponse(entity);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a revenue period' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: RevenuePeriodResponse })
  async getRevenuePeriod(@Param('id', ParseIntPipe) id: number): Promise<RevenuePeriodResponse> {
    const entity: RevenuePeriodEntity = await this.revenuePeriodService.getRevenuePeriodById(id);
    return new RevenuePeriodResponse(entity);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update the pool amount or open-period platform cut' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateRevenuePeriodRequestDto })
  @ApiResponse({ status: 200, type: RevenuePeriodResponse })
  async updateRevenuePeriod(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRevenuePeriodRequestDto,
  ): Promise<RevenuePeriodResponse> {
    const entity: RevenuePeriodEntity = await this.revenuePeriodService.updateRevenuePeriod({
      id,
      platformCutPercent: body.platformCutPercent,
      poolAmountCents: body.poolAmountCents,
    });
    return new RevenuePeriodResponse(entity);
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close a revenue period' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: RevenuePeriodResponse })
  async closeRevenuePeriod(@Param('id', ParseIntPipe) id: number): Promise<RevenuePeriodResponse> {
    const entity: RevenuePeriodEntity = await this.revenuePeriodService.closeRevenuePeriod(id);
    return new RevenuePeriodResponse(entity);
  }

  @Post(':id/engagements')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh weighted book engagement for a revenue period' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: GetAdminPeriodAnalyticsResponseDto })
  async aggregatePeriodEngagement(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetAdminPeriodAnalyticsResponseDto> {
    const result: AdminPeriodAnalyticsPage =
      await this.adminAnalyticsService.aggregatePeriodEngagement({
        revenuePeriodId: id,
      });
    return new GetAdminPeriodAnalyticsResponseDto(result);
  }

  @Post(':id/calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate author shares after refreshing period engagement' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: GetAdminPeriodEarningsResponseDto })
  async calculatePeriodRevenue(
    @Param('id', ParseIntPipe) id: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<GetAdminPeriodEarningsResponseDto> {
    const result: AdminPeriodEarningsPage = await this.adminAnalyticsService.calculatePeriodRevenue(
      {
        revenuePeriodId: id,
        actorUserId: currentUser.id,
      },
    );
    return new GetAdminPeriodEarningsResponseDto(result);
  }

  @Get(':id/earnings')
  @ApiOperation({ summary: 'List calculated book earnings for a revenue period' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: GetAdminPeriodEarningsResponseDto })
  async listPeriodEarnings(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ListAdminPeriodRowsRequestDto,
  ): Promise<GetAdminPeriodEarningsResponseDto> {
    const result: AdminPeriodEarningsPage = await this.adminAnalyticsService.listPeriodEarnings({
      revenuePeriodId: id,
      ownerId: query.ownerId,
      limit: query.limit,
      offset: query.offset,
    });
    return new GetAdminPeriodEarningsResponseDto(result);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'List weighted book engagement for a revenue period' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: GetAdminPeriodAnalyticsResponseDto })
  async listPeriodAnalytics(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ListAdminPeriodRowsRequestDto,
  ): Promise<GetAdminPeriodAnalyticsResponseDto> {
    const result: AdminPeriodAnalyticsPage = await this.adminAnalyticsService.listPeriodAnalytics({
      revenuePeriodId: id,
      ownerId: query.ownerId,
      limit: query.limit,
      offset: query.offset,
    });
    return new GetAdminPeriodAnalyticsResponseDto(result);
  }

  @Get(':id/books/:bookId/heatmap')
  @ApiOperation({
    summary: 'List layout-specific engagement heatmap for a book in a revenue period',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'bookId', type: Number })
  @ApiResponse({ status: 200, type: GetAdminPeriodBookHeatmapResponseDto })
  async getPeriodBookHeatmap(
    @Param('id', ParseIntPipe) id: number,
    @Param('bookId', ParseIntPipe) bookId: number,
  ): Promise<GetAdminPeriodBookHeatmapResponseDto> {
    const heatmap: AdminPeriodBookHeatmap = await this.adminAnalyticsService.getPeriodBookHeatmap({
      revenuePeriodId: id,
      bookId,
    });
    return new GetAdminPeriodBookHeatmapResponseDto(heatmap);
  }
}
