import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditLogPage } from '@/modules/audit/defs/audit-log-repository.defs';
import { ListAuditLogsRequestDto } from '@/modules/audit/dto/request/list-audit-logs-request.dto';
import { GetAuditLogsResponseDto } from '@/modules/audit/dto/response/get-audit-logs-response.dto';
import { AuditLogResponse } from '@/modules/audit/dto/response/model/audit-log.response';
import { AuditLogEntity } from '@/modules/audit/entity/audit-log.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Admin - Audit')
@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AuditAdminController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'List append-only admin and publishing audit entries' })
  @ApiResponse({ status: 200, type: GetAuditLogsResponseDto })
  async listAuditLogs(@Query() query: ListAuditLogsRequestDto): Promise<GetAuditLogsResponseDto> {
    const page: AuditLogPage = await this.auditLogService.listAuditLogs({
      limit: query.limit,
      offset: query.offset,
      actorUserId: query.actorUserId,
      action: query.action,
      subjectType: query.subjectType,
      subjectId: query.subjectId,
    });
    return new GetAuditLogsResponseDto(page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one audit entry' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: AuditLogResponse })
  async getAuditLog(@Param('id', ParseIntPipe) id: number): Promise<AuditLogResponse> {
    const entity: AuditLogEntity = await this.auditLogService.getAuditLogById(id);
    return new AuditLogResponse(entity);
  }
}
