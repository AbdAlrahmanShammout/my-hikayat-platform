import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PlatformSettingsResponse } from '@/modules/platform-setting/dto/response/model/platform-settings.response';
import { PlatformSettingService } from '@/modules/platform-setting/platform-setting.service';

@ApiTags('Reader - Platform settings')
@Controller('reader/platform-settings')
export class PlatformSettingReaderController {
  constructor(private readonly platformSettingService: PlatformSettingService) {}

  @Get()
  @ApiOperation({
    summary:
      'Public platform settings for Sign in/up, Me, Settings, and About (URLs and mission copy)',
  })
  @ApiResponse({ status: 200, type: PlatformSettingsResponse })
  async getPlatformSettings(): Promise<PlatformSettingsResponse> {
    const settings = await this.platformSettingService.getPlatformSettings();
    return new PlatformSettingsResponse(settings);
  }
}
