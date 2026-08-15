import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
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
import { ReadingBookmarkPage } from '@/modules/reading/defs/reading-bookmark-repository.defs';
import { CreateReadingBookmarkRequestDto } from '@/modules/reading/dto/request/create-reading-bookmark-request.dto';
import { ListReadingBookmarksRequestDto } from '@/modules/reading/dto/request/list-reading-bookmarks-request.dto';
import { SaveReadingProgressRequestDto } from '@/modules/reading/dto/request/save-reading-progress-request.dto';
import { GetReadingBookmarksResponseDto } from '@/modules/reading/dto/response/get-reading-bookmarks-response.dto';
import { ReadingBookmarkResponse } from '@/modules/reading/dto/response/model/reading-bookmark.response';
import { ReadingProgressResponse } from '@/modules/reading/dto/response/model/reading-progress.response';
import { ReadingBookmarkEntity } from '@/modules/reading/entity/reading-bookmark.entity';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';
import { ReadingBookmarkService } from '@/modules/reading/reading-bookmark.service';
import { ReadingProgressService } from '@/modules/reading/reading-progress.service';
import { UserEntity } from '@/modules/user/entity/user.entity';

@ApiTags('Reader - Reading')
@Controller('reader/books')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReadingReaderController {
  constructor(
    private readonly readingBookmarkService: ReadingBookmarkService,
    private readonly readingProgressService: ReadingProgressService,
  ) {}

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

  @Post(':id/bookmarks')
  @ApiOperation({ summary: 'Create a layout-discriminated bookmark for the authenticated reader' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: CreateReadingBookmarkRequestDto })
  @ApiResponse({ status: 201, type: ReadingBookmarkResponse })
  async createReadingBookmark(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateReadingBookmarkRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<ReadingBookmarkResponse> {
    const entity: ReadingBookmarkEntity = await this.readingBookmarkService.createReadingBookmark({
      userId: currentUser.id,
      bookId: id,
      spineIndex: body.spineIndex,
      scrollOffset: body.scrollOffset,
      spreadIndex: body.spreadIndex,
      pageNumber: body.pageNumber,
    });
    return new ReadingBookmarkResponse(entity);
  }

  @Get(':id/bookmarks')
  @ApiOperation({ summary: 'List the authenticated reader bookmarks for a book' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: GetReadingBookmarksResponseDto })
  async listReadingBookmarks(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ListReadingBookmarksRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<GetReadingBookmarksResponseDto> {
    const page: ReadingBookmarkPage = await this.readingBookmarkService.listReadingBookmarks({
      userId: currentUser.id,
      bookId: id,
      limit: query.limit,
      offset: query.offset,
    });
    return new GetReadingBookmarksResponseDto(page);
  }

  @Delete(':id/bookmarks/:bookmarkId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an authenticated reader bookmark for a book' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'bookmarkId', type: Number })
  @ApiResponse({ status: 200, type: ReadingBookmarkResponse })
  async deleteReadingBookmark(
    @Param('id', ParseIntPipe) id: number,
    @Param('bookmarkId', ParseIntPipe) bookmarkId: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<ReadingBookmarkResponse> {
    const entity: ReadingBookmarkEntity = await this.readingBookmarkService.deleteReadingBookmark({
      id: bookmarkId,
      userId: currentUser.id,
      bookId: id,
    });
    return new ReadingBookmarkResponse(entity);
  }
}
