import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AuthorAnalyticsService } from '@/modules/monetization/author-analytics.service';
import {
  AuthorAnalyticsPage,
  AuthorBookHeatmap,
  AuthorEarningsPage,
  AuthorEarningsTrendPage,
} from '@/modules/monetization/defs/author-analytics-service.defs';
import { GetAuthorBookHeatmapRequestDto } from '@/modules/monetization/dto/request/get-author-book-heatmap-request.dto';
import { ListAuthorAnalyticsRequestDto } from '@/modules/monetization/dto/request/list-author-analytics-request.dto';
import { ListAuthorEarningsRequestDto } from '@/modules/monetization/dto/request/list-author-earnings-request.dto';
import { ListAuthorEarningsTrendRequestDto } from '@/modules/monetization/dto/request/list-author-earnings-trend-request.dto';
import { GetAuthorAnalyticsResponseDto } from '@/modules/monetization/dto/response/get-author-analytics-response.dto';
import { GetAuthorBookHeatmapResponseDto } from '@/modules/monetization/dto/response/get-author-book-heatmap-response.dto';
import { GetAuthorEarningsResponseDto } from '@/modules/monetization/dto/response/get-author-earnings-response.dto';
import { GetAuthorEarningsTrendResponseDto } from '@/modules/monetization/dto/response/get-author-earnings-trend-response.dto';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Author - Monetization')
@Controller('author')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.AUTHOR, UserRole.ADMIN)
@ApiBearerAuth()
export class MonetizationAuthorController {
  constructor(private readonly authorAnalyticsService: AuthorAnalyticsService) {}

  @Get('earnings/trend')
  @ApiOperation({ summary: 'List author earnings by revenue period' })
  @ApiResponse({ status: 200, type: GetAuthorEarningsTrendResponseDto })
  async listAuthorEarningsTrend(
    @Query() query: ListAuthorEarningsTrendRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<GetAuthorEarningsTrendResponseDto> {
    const page: AuthorEarningsTrendPage = await this.authorAnalyticsService.listAuthorEarningsTrend(
      {
        ownerId: currentUser.id,
        limit: query.limit,
        offset: query.offset,
      },
    );
    return new GetAuthorEarningsTrendResponseDto(page);
  }

  @Get('earnings')
  @ApiOperation({ summary: 'List author earnings per book for a revenue period' })
  @ApiResponse({ status: 200, type: GetAuthorEarningsResponseDto })
  async listAuthorEarnings(
    @Query() query: ListAuthorEarningsRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<GetAuthorEarningsResponseDto> {
    const result: AuthorEarningsPage = await this.authorAnalyticsService.listAuthorEarnings({
      ownerId: currentUser.id,
      revenuePeriodId: query.revenuePeriodId,
      limit: query.limit,
      offset: query.offset,
    });
    return new GetAuthorEarningsResponseDto(result);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'List reading analytics per book for a revenue period' })
  @ApiResponse({ status: 200, type: GetAuthorAnalyticsResponseDto })
  async listAuthorAnalytics(
    @Query() query: ListAuthorAnalyticsRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<GetAuthorAnalyticsResponseDto> {
    const result: AuthorAnalyticsPage = await this.authorAnalyticsService.listAuthorAnalytics({
      ownerId: currentUser.id,
      revenuePeriodId: query.revenuePeriodId,
      limit: query.limit,
      offset: query.offset,
    });
    return new GetAuthorAnalyticsResponseDto(result);
  }

  @Get('analytics/books/:bookId/heatmap')
  @ApiOperation({
    summary: 'List layout-specific engagement heatmap for an owned book in a revenue period',
  })
  @ApiParam({ name: 'bookId', type: Number })
  @ApiResponse({ status: 200, type: GetAuthorBookHeatmapResponseDto })
  async getAuthorBookHeatmap(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Query() query: GetAuthorBookHeatmapRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<GetAuthorBookHeatmapResponseDto> {
    const heatmap: AuthorBookHeatmap = await this.authorAnalyticsService.getAuthorBookHeatmap({
      ownerId: currentUser.id,
      bookId,
      revenuePeriodId: query.revenuePeriodId,
    });
    return new GetAuthorBookHeatmapResponseDto(heatmap);
  }
}
