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
import { ReadingVisualEngagementPage } from '@/modules/reading-intelligence/defs/reading-visual-engagement-repository.defs';
import { EndReadingSessionRequestDto } from '@/modules/reading-intelligence/dto/request/end-reading-session-request.dto';
import { IngestReadingActivityRequestDto } from '@/modules/reading-intelligence/dto/request/ingest-reading-activity-request.dto';
import { IngestReadingVisualEngagementRequestDto } from '@/modules/reading-intelligence/dto/request/ingest-reading-visual-engagement-request.dto';
import { ListReadingVisualEngagementsRequestDto } from '@/modules/reading-intelligence/dto/request/list-reading-visual-engagements-request.dto';
import { StartReadingSessionRequestDto } from '@/modules/reading-intelligence/dto/request/start-reading-session-request.dto';
import { GetReadingVisualEngagementsResponseDto } from '@/modules/reading-intelligence/dto/response/get-reading-visual-engagements-response.dto';
import { ReadingVisualEngagementResponse } from '@/modules/reading-intelligence/dto/response/model/reading-visual-engagement.response';
import { ReadingVisualEngagementEntity } from '@/modules/reading-intelligence/entity/reading-visual-engagement.entity';
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

  @Post(':id/sessions/:sessionId/visual-engagement')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ingest fixed-layout spread time and visual scene time for an open session',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'sessionId', type: Number })
  @ApiBody({ type: IngestReadingVisualEngagementRequestDto })
  @ApiResponse({ status: 200, type: ReadingVisualEngagementResponse })
  async ingestVisualEngagement(
    @Param('id', ParseIntPipe) id: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() body: IngestReadingVisualEngagementRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<ReadingVisualEngagementResponse> {
    const entity: ReadingVisualEngagementEntity =
      await this.readingIntelligenceService.ingestVisualEngagement({
        userId: currentUser.id,
        bookId: id,
        sessionId,
        spreadIndex: body.spreadIndex,
        pageNumber: body.pageNumber,
        activeDurationMs: body.activeDurationMs,
        visualSceneTimeMs: body.visualSceneTimeMs,
      });
    return new ReadingVisualEngagementResponse(entity);
  }

  @Get(':id/sessions/:sessionId/visual-engagement')
  @ApiOperation({
    summary: 'List fixed-layout visual engagement rows for an authenticated reader session',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'sessionId', type: Number })
  @ApiResponse({ status: 200, type: GetReadingVisualEngagementsResponseDto })
  async listVisualEngagements(
    @Param('id', ParseIntPipe) id: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Query() query: ListReadingVisualEngagementsRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<GetReadingVisualEngagementsResponseDto> {
    const page: ReadingVisualEngagementPage =
      await this.readingIntelligenceService.listVisualEngagements({
        userId: currentUser.id,
        bookId: id,
        sessionId,
        limit: query.limit,
        offset: query.offset,
      });
    return new GetReadingVisualEngagementsResponseDto(page);
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
