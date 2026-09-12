import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UpdatePlatformSettingsRequestDto } from '@/modules/platform-setting/dto/request/update-platform-settings-request.dto';
import { PlatformSettingsResponse } from '@/modules/platform-setting/dto/response/model/platform-settings.response';
import { PlatformSettingService } from '@/modules/platform-setting/platform-setting.service';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Admin - Platform settings')
@Controller('admin/platform-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class PlatformSettingAdminController {
  constructor(private readonly platformSettingService: PlatformSettingService) {}

  @Get()
  @ApiOperation({ summary: 'Get platform settings used by the reader app' })
  @ApiResponse({ status: 200, type: PlatformSettingsResponse })
  async getPlatformSettings(): Promise<PlatformSettingsResponse> {
    const settings = await this.platformSettingService.getPlatformSettings();
    return new PlatformSettingsResponse(settings);
  }

  @Patch()
  @ApiOperation({
    summary:
      'Update Privacy, Terms, About mission, and Sign in/up cover media. Omitted fields are unchanged.',
  })
  @ApiBody({ type: UpdatePlatformSettingsRequestDto })
  @ApiResponse({ status: 200, type: PlatformSettingsResponse })
  async updatePlatformSettings(
    @Body() body: UpdatePlatformSettingsRequestDto,
  ): Promise<PlatformSettingsResponse> {
    const settings = await this.platformSettingService.updatePlatformSettings({
      privacyPolicyUrl: body.privacyPolicyUrl,
      termsOfServiceUrl: body.termsOfServiceUrl,
      aboutMission: body.aboutMission,
      authCoverMediaUrl: body.authCoverMediaUrl,
    });
    return new PlatformSettingsResponse(settings);
  }
}
