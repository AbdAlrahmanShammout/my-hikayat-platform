import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
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
import { EndReadingSessionRequestDto } from '@/modules/reading-intelligence/dto/request/end-reading-session-request.dto';
import { IngestReadingActivityRequestDto } from '@/modules/reading-intelligence/dto/request/ingest-reading-activity-request.dto';
import { StartReadingSessionRequestDto } from '@/modules/reading-intelligence/dto/request/start-reading-session-request.dto';
import { ReadingIntelligenceService } from '@/modules/reading-intelligence/reading-intelligence.service';
import { ReadingSessionResponse } from '@/modules/reading/dto/response/model/reading-session.response';
import { ReadingSessionEntity } from '@/modules/reading/entity/reading-session.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';

@ApiTags('Reader - Reading Intelligence')
@Controller('reader/books')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReadingIntelligenceReaderController {
  constructor(private readonly readingIntelligenceService: ReadingIntelligenceService) {}

  @Post(':id/sessions')
  @ApiOperation({ summary: 'Start an authenticated reader session for a book' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: StartReadingSessionRequestDto })
  @ApiResponse({ status: 201, type: ReadingSessionResponse })
  async startReadingSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: StartReadingSessionRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<ReadingSessionResponse> {
    const entity: ReadingSessionEntity = await this.readingIntelligenceService.startReadingSession({
      userId: currentUser.id,
      bookId: id,
      spineIndex: body.spineIndex,
      scrollOffset: body.scrollOffset,
      spreadIndex: body.spreadIndex,
      pageNumber: body.pageNumber,
    });
    return new ReadingSessionResponse(entity);
  }

  @Get(':id/sessions/current')
  @ApiOperation({ summary: 'Load the authenticated reader open session for a book' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ReadingSessionResponse })
  async getCurrentReadingSession(
    @Param('id', ParseIntPipe) id: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<ReadingSessionResponse> {
    const entity: ReadingSessionEntity =
      await this.readingIntelligenceService.getCurrentReadingSession({
        userId: currentUser.id,
        bookId: id,
      });
    return new ReadingSessionResponse(entity);
  }

  @Post(':id/sessions/:sessionId/activity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ingest active vs idle time for an open reading session' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'sessionId', type: Number })
  @ApiBody({ type: IngestReadingActivityRequestDto })
  @ApiResponse({ status: 200, type: ReadingSessionResponse })
  async ingestReadingActivity(
    @Param('id', ParseIntPipe) id: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() body: IngestReadingActivityRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<ReadingSessionResponse> {
    const entity: ReadingSessionEntity =
      await this.readingIntelligenceService.ingestReadingActivity({
        userId: currentUser.id,
        bookId: id,
        sessionId,
        activeDurationMs: body.activeDurationMs,
        idleDurationMs: body.idleDurationMs,
        spineIndex: body.spineIndex,
        scrollOffset: body.scrollOffset,
        spreadIndex: body.spreadIndex,
        pageNumber: body.pageNumber,
      });
    return new ReadingSessionResponse(entity);
  }

  @Post(':id/sessions/:sessionId/end')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End an authenticated reader session for a book' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'sessionId', type: Number })
  @ApiBody({ type: EndReadingSessionRequestDto })
  @ApiResponse({ status: 200, type: ReadingSessionResponse })
  async endReadingSession(
    @Param('id', ParseIntPipe) id: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() body: EndReadingSessionRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<ReadingSessionResponse> {
    const entity: ReadingSessionEntity = await this.readingIntelligenceService.endReadingSession({
      userId: currentUser.id,
      bookId: id,
      sessionId,
      activeDurationMs: body.activeDurationMs,
      idleDurationMs: body.idleDurationMs,
      spineIndex: body.spineIndex,
      scrollOffset: body.scrollOffset,
      spreadIndex: body.spreadIndex,
      pageNumber: body.pageNumber,
    });
    return new ReadingSessionResponse(entity);
  }
}
