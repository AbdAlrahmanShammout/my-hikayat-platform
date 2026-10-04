import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AdminExportService } from '@/modules/admin-export/admin-export.service';
import {
  CreateAdminExportRequestDto,
  ListAdminExportsRequestDto,
} from '@/modules/admin-export/dto/request/create-admin-export-request.dto';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Admin - Exports')
@Controller('admin/exports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminExportAdminController {
  constructor(private readonly adminExportService: AdminExportService) {}

  @Post('estimate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Count rows an export would include' })
  @ApiBody({ type: CreateAdminExportRequestDto })
  async estimate(
    @Body() body: CreateAdminExportRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<{
    resource: string;
    rowCount: number;
    allowedColumns: readonly string[];
    exceedsLimit: boolean;
  }> {
    return this.adminExportService.estimate({ ...body, actorUserId: currentUser.id });
  }

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Queue a CSV export. The file is not built in this request.' })
  @ApiBody({ type: CreateAdminExportRequestDto })
  @ApiResponse({ status: 202 })
  async create(
    @Body() body: CreateAdminExportRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<{ id: number; status: string }> {
    const created = await this.adminExportService.create({ ...body, actorUserId: currentUser.id });
    return { id: created.id, status: created.status };
  }

  @Get()
  @ApiOperation({ summary: 'List admin export jobs, newest first' })
  async list(@Query() query: ListAdminExportsRequestDto): Promise<{
    exports: {
      id: number;
      resource: string;
      status: string;
      rowCount: number | null;
      errorCode: string | null;
      expiresAt: Date | null;
      createdAt: Date;
    }[];
    total: number;
  }> {
    const page = await this.adminExportService.list(query);
    return {
      total: page.total,
      exports: page.items.map((item) => ({
        id: item.id,
        resource: item.resource,
        status: item.status,
        rowCount: item.rowCount,
        errorCode: item.errorCode,
        expiresAt: item.expiresAt,
        createdAt: item.createdAt,
      })),
    };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a ready export CSV' })
  async download(@Param('id', ParseIntPipe) id: number): Promise<StreamableFile> {
    const file = await this.adminExportService.download(id);
    return new StreamableFile(file.body, {
      type: 'text/csv',
      disposition: `attachment; filename="${file.fileName}"`,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Read one export job' })
  async getById(@Param('id', ParseIntPipe) id: number): Promise<{
    id: number;
    resource: string;
    status: string;
    rowCount: number | null;
    errorCode: string | null;
    expiresAt: Date | null;
    createdAt: Date;
  }> {
    const item = await this.adminExportService.getById(id);
    return {
      id: item.id,
      resource: item.resource,
      status: item.status,
      rowCount: item.rowCount,
      errorCode: item.errorCode,
      expiresAt: item.expiresAt,
      createdAt: item.createdAt,
    };
  }
}
