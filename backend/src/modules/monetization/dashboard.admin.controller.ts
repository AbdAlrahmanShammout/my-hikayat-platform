import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AdminDashboardSummaryService } from '@/modules/monetization/admin-dashboard-summary.service';
import { AdminDashboardSummary } from '@/modules/monetization/defs/admin-dashboard-summary-service.defs';
import { GetAdminDashboardSummaryResponseDto } from '@/modules/monetization/dto/response/get-admin-dashboard-summary-response.dto';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Admin - Dashboard')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class DashboardAdminController {
  constructor(private readonly adminDashboardSummaryService: AdminDashboardSummaryService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get platform-wide admin home KPI totals' })
  @ApiResponse({ status: 200, type: GetAdminDashboardSummaryResponseDto })
  async getAdminDashboardSummary(): Promise<GetAdminDashboardSummaryResponseDto> {
    const summary: AdminDashboardSummary =
      await this.adminDashboardSummaryService.getAdminDashboardSummary();
    return new GetAdminDashboardSummaryResponseDto(summary);
  }
}
