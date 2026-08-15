import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { SaveReadingProgressRequestDto } from '@/modules/reading/dto/request/save-reading-progress-request.dto';
import { ReadingProgressResponse } from '@/modules/reading/dto/response/model/reading-progress.response';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';
import { ReadingProgressService } from '@/modules/reading/reading-progress.service';
import { UserEntity } from '@/modules/user/entity/user.entity';

@ApiTags('Reader - Reading')
@Controller('reader/books')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReadingReaderController {
  constructor(private readonly readingProgressService: ReadingProgressService) {}

  @Put(':id/progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save the authenticated reader Smart Resume position for a book' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: SaveReadingProgressRequestDto })
  @ApiResponse({ status: 200, type: ReadingProgressResponse })
  async saveReadingProgress(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SaveReadingProgressRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<ReadingProgressResponse> {
    const entity: ReadingProgressEntity = await this.readingProgressService.saveReadingProgress({
      userId: currentUser.id,
      bookId: id,
      spineIndex: body.spineIndex,
      scrollOffset: body.scrollOffset,
      spreadIndex: body.spreadIndex,
      pageNumber: body.pageNumber,
    });
    return new ReadingProgressResponse(entity);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Load the authenticated reader Smart Resume position for a book' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ReadingProgressResponse })
  async getReadingProgress(
    @Param('id', ParseIntPipe) id: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<ReadingProgressResponse> {
    const entity: ReadingProgressEntity =
      await this.readingProgressService.getReadingProgressByUserAndBook({
        userId: currentUser.id,
        bookId: id,
      });
    return new ReadingProgressResponse(entity);
  }
}
