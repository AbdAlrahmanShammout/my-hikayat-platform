import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AuthorDashboardSummaryService } from '@/modules/monetization/author-dashboard-summary.service';
import { AuthorDashboardSummary } from '@/modules/monetization/defs/author-dashboard-summary-service.defs';
import { GetAuthorDashboardSummaryResponseDto } from '@/modules/monetization/dto/response/get-author-dashboard-summary-response.dto';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Author - Dashboard')
@Controller('author/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.AUTHOR, UserRole.ADMIN)
@ApiBearerAuth()
export class DashboardAuthorController {
  constructor(private readonly authorDashboardSummaryService: AuthorDashboardSummaryService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get owner-scoped author home KPI totals' })
  @ApiResponse({ status: 200, type: GetAuthorDashboardSummaryResponseDto })
  async getAuthorDashboardSummary(
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<GetAuthorDashboardSummaryResponseDto> {
    const summary: AuthorDashboardSummary =
      await this.authorDashboardSummaryService.getAuthorDashboardSummary({
        ownerId: currentUser.id,
      });
    return new GetAuthorDashboardSummaryResponseDto(summary);
  }
}
