import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import {
  GetPublisherSummaryRequestDto,
  ListAdminPublishersRequestDto,
} from '@/modules/user/dto/request/list-admin-publishers-request.dto';
import { GetAdminPublisherSummaryResponseDto } from '@/modules/user/dto/response/get-admin-publisher-summary-response.dto';
import { GetAdminPublishersResponseDto } from '@/modules/user/dto/response/get-admin-publishers-response.dto';
import { PublisherListPage } from '@/modules/user/defs/publisher-directory.defs';
import {
  PublisherDirectoryService,
  PublisherSummary,
} from '@/modules/user/publisher-directory.service';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Admin - Publishers')
@Controller('admin/publishers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class PublisherAdminController {
  constructor(private readonly publisherDirectoryService: PublisherDirectoryService) {}

  @Get()
  @ApiOperation({ summary: 'List publisher accounts' })
  @ApiResponse({ status: 200, type: GetAdminPublishersResponseDto })
  async listPublishers(
    @Query() query: ListAdminPublishersRequestDto,
  ): Promise<GetAdminPublishersResponseDto> {
    const page: PublisherListPage = await this.publisherDirectoryService.listPublishers({
      limit: query.limit,
      offset: query.offset,
      keyword: query.q,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
    return new GetAdminPublishersResponseDto(page);
  }

  @Get(':userId/summary')
  @ApiOperation({ summary: 'Publisher account summary, book counts, and lifetime author cents' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, type: GetAdminPublisherSummaryResponseDto })
  async getPublisherSummary(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: GetPublisherSummaryRequestDto,
  ): Promise<GetAdminPublisherSummaryResponseDto> {
    const summary: PublisherSummary = await this.publisherDirectoryService.getPublisherSummary({
      userId,
      revenuePeriodId: query.revenuePeriodId,
    });
    return new GetAdminPublisherSummaryResponseDto(summary);
  }
}
