import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { GetReadingCompletionStatusesResponseDto } from '@/modules/reading-completion/dto/response/get-reading-completion-statuses-response.dto';
import { BookReadingCycleResponse } from '@/modules/reading-completion/dto/response/model/book-reading-cycle.response';
import { BookReadingCycleService } from '@/modules/reading-completion/book-reading-cycle.service';
import { UserEntity } from '@/modules/user/entity/user.entity';

@ApiTags('Reader - Reading completion')
@Controller('reader/reading-completions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReadingCompletionReaderController {
  constructor(private readonly bookReadingCycleService: BookReadingCycleService) {}

  @Get()
  @ApiOperation({ summary: 'Latest reading status for the signed-in reader and the given books' })
  @ApiQuery({ name: 'bookIds', required: false, example: '1,2,3' })
  @ApiResponse({ status: 200, type: GetReadingCompletionStatusesResponseDto })
  async listStatuses(
    @LoggedInUser() currentUser: UserEntity,
    @Query('bookIds') bookIds: string | undefined,
  ): Promise<GetReadingCompletionStatusesResponseDto> {
    const cycles = await this.bookReadingCycleService.listStatuses(
      currentUser.id,
      parseBookIds(bookIds),
    );
    return new GetReadingCompletionStatusesResponseDto(
      cycles.map((cycle) => new BookReadingCycleResponse(cycle)),
    );
  }

  @Post('books/:bookId/start-over')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Begin a new reading cycle for a completed book' })
  @ApiParam({ name: 'bookId', type: Number })
  @ApiResponse({ status: 200, type: BookReadingCycleResponse })
  async startOver(
    @LoggedInUser() currentUser: UserEntity,
    @Param('bookId', ParseIntPipe) bookId: number,
  ): Promise<BookReadingCycleResponse> {
    const cycle = await this.bookReadingCycleService.startOver({
      userId: currentUser.id,
      bookId,
    });
    return new BookReadingCycleResponse(cycle);
  }
}

function parseBookIds(value: string | undefined): number[] {
  if (value === undefined || value.trim() === '') {
    return [];
  }
  return value
    .split(',')
    .map((part) => Number.parseInt(part, 10))
    .filter((id) => Number.isInteger(id) && id > 0);
}
