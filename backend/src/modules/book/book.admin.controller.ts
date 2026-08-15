import {
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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookPublishingStatusService } from '@/modules/book/book-publishing-status.service';
import { BookService } from '@/modules/book/book.service';
import { BookPage } from '@/modules/book/defs/book-repository.defs';
import { ListBooksRequestDto } from '@/modules/book/dto/request/list-books-request.dto';
import { GetBooksResponseDto } from '@/modules/book/dto/response/get-books-response.dto';
import { BookResponse } from '@/modules/book/dto/response/model/book.response';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookPublishingStatus } from '@/modules/book/enum/general.enum';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Admin - Books')
@Controller('admin/books')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class BookAdminController {
  constructor(
    private readonly bookService: BookService,
    private readonly bookPublishingStatusService: BookPublishingStatusService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List books waiting for editorial review' })
  @ApiResponse({ status: 200, type: GetBooksResponseDto })
  async listBooksForReview(@Query() query: ListBooksRequestDto): Promise<GetBooksResponseDto> {
    const page: BookPage = await this.bookService.listBooks({
      limit: query.limit,
      offset: query.offset,
      publishingStatus: BookPublishingStatus.IN_REVIEW,
    });
    return new GetBooksResponseDto(page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book for editorial review' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: BookResponse })
  async getBook(@Param('id', ParseIntPipe) id: number): Promise<BookResponse> {
    const entity: BookEntity = await this.bookService.getBookById(id);
    return new BookResponse(entity);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve an in-review book and publish it' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: BookResponse })
  async approveBook(@Param('id', ParseIntPipe) id: number): Promise<BookResponse> {
    const entity: BookEntity = await this.bookPublishingStatusService.approveBook(id);
    return new BookResponse(entity);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject an in-review book' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: BookResponse })
  async rejectBook(@Param('id', ParseIntPipe) id: number): Promise<BookResponse> {
    const entity: BookEntity = await this.bookPublishingStatusService.rejectBook(id);
    return new BookResponse(entity);
  }
}
