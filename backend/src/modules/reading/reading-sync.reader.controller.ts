import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { ReadingSyncSnapshot } from '@/modules/reading/defs/reading-sync-service.defs';
import { ListReadingSyncRequestDto } from '@/modules/reading/dto/request/list-reading-sync-request.dto';
import { GetReadingSyncResponseDto } from '@/modules/reading/dto/response/get-reading-sync-response.dto';
import { ReadingSyncService } from '@/modules/reading/reading-sync.service';
import { UserEntity } from '@/modules/user/entity/user.entity';

@ApiTags('Reader - Reading Sync')
@Controller('reader')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReadingSyncReaderController {
  constructor(private readonly readingSyncService: ReadingSyncService) {}

  @Get('sync')
  @ApiOperation({
    summary: 'Pull layout-discriminated reading progress and bookmarks for this reader',
  })
  @ApiResponse({ status: 200, type: GetReadingSyncResponseDto })
  async getReadingSync(
    @Query() query: ListReadingSyncRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<GetReadingSyncResponseDto> {
    const snapshot: ReadingSyncSnapshot = await this.readingSyncService.getReadingSync({
      userId: currentUser.id,
      updatedSince: query.updatedSince,
    });
    return new GetReadingSyncResponseDto(snapshot);
  }

  @Get('books/:id/sync')
  @ApiOperation({
    summary: 'Pull layout-discriminated progress and bookmarks for one book',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: GetReadingSyncResponseDto })
  async getBookReadingSync(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ListReadingSyncRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<GetReadingSyncResponseDto> {
    const snapshot: ReadingSyncSnapshot = await this.readingSyncService.getReadingSync({
      userId: currentUser.id,
      bookId: id,
      updatedSince: query.updatedSince,
    });
    return new GetReadingSyncResponseDto(snapshot);
  }
}
