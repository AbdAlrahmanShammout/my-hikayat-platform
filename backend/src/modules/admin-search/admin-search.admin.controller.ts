import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AdminSearchRequestDto } from '@/modules/admin-search/dto/request/admin-search-request.dto';
import { AdminSearchResult, AdminSearchService } from '@/modules/admin-search/admin-search.service';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Admin - Search')
@Controller('admin/search')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminSearchAdminController {
  constructor(private readonly adminSearchService: AdminSearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Search users, books, EPUB creators, publishers, categories, and subscriptions',
  })
  async search(@Query() query: AdminSearchRequestDto): Promise<AdminSearchResult> {
    const offset: number = query.type === undefined ? 0 : (query.offset ?? 0);
    return this.adminSearchService.search({
      query: query.q,
      type: query.type,
      limit: query.limit ?? 8,
      offset,
    });
  }
}
