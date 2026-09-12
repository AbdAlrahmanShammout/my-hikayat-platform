import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { OfflineDownloadResponse } from '@/modules/offline-download/dto/response/model/offline-download.response';
import { OfflineDownloadEntity } from '@/modules/offline-download/entity/offline-download.entity';
import { OfflineDownloadService } from '@/modules/offline-download/offline-download.service';
import { UserEntity } from '@/modules/user/entity/user.entity';

@ApiTags('Reader - Books')
@Controller('reader/books')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OfflineDownloadReaderController {
  constructor(private readonly offlineDownloadService: OfflineDownloadService) {}

  @Post(':bookId/offline-download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reserve one of three offline download slots for an entitled catalog book',
  })
  @ApiParam({ name: 'bookId', type: Number })
  @ApiResponse({ status: 200, type: OfflineDownloadResponse })
  async registerOfflineDownload(
    @Param('bookId', ParseIntPipe) bookId: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<OfflineDownloadResponse> {
    const download: OfflineDownloadEntity =
      await this.offlineDownloadService.registerOfflineDownload({
        bookId,
        userId: currentUser.id,
      });
    return new OfflineDownloadResponse(download);
  }

  @Delete(':bookId/offline-download')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Release an offline download slot when the package is removed' })
  @ApiParam({ name: 'bookId', type: Number })
  @ApiResponse({ status: 204 })
  async releaseOfflineDownload(
    @Param('bookId', ParseIntPipe) bookId: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<void> {
    await this.offlineDownloadService.releaseOfflineDownload({
      bookId,
      userId: currentUser.id,
    });
  }
}
