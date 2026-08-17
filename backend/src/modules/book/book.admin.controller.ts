import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
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
import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookPublishingStatusService } from '@/modules/book/book-publishing-status.service';
import { BookService } from '@/modules/book/book.service';
import { BookPage } from '@/modules/book/defs/book-repository.defs';
import { ListBooksRequestDto } from '@/modules/book/dto/request/list-books-request.dto';
import { RejectBookRequestDto } from '@/modules/book/dto/request/reject-book-request.dto';
import { UpdateBookRequestDto } from '@/modules/book/dto/request/update-book-request.dto';
import { GetBooksResponseDto } from '@/modules/book/dto/response/get-books-response.dto';
import { BookResponse } from '@/modules/book/dto/response/model/book.response';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';
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
  @ApiOperation({ summary: 'List books, optionally filtered by publishing status' })
  @ApiResponse({ status: 200, type: GetBooksResponseDto })
  async listBooks(@Query() query: ListBooksRequestDto): Promise<GetBooksResponseDto> {
    const page: BookPage = await this.bookService.listBooks({
      limit: query.limit,
      offset: query.offset,
      publishingStatus: query.publishingStatus,
    });
    return new GetBooksResponseDto(page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book for administrative management' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: BookResponse })
  async getBook(@Param('id', ParseIntPipe) id: number): Promise<BookResponse> {
    const entity: BookEntity = await this.bookService.getBookById(id);
    return new BookResponse(entity);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update book metadata without changing publishing status' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateBookRequestDto })
  @ApiResponse({ status: 200, type: BookResponse })
  async updateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookRequestDto,
  ): Promise<BookResponse> {
    const entity: BookEntity = await this.bookService.updateBook({
      id,
      title: dto.title,
      description: dto.description,
      bookType: dto.bookType,
      categoryIds: dto.categoryIds,
    });
    return new BookResponse(entity);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve an in-review book and publish it' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: BookResponse })
  async approveBook(
    @Param('id', ParseIntPipe) id: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<BookResponse> {
    const entity: BookEntity = await this.bookPublishingStatusService.approveBook({
      bookId: id,
      actorUserId: currentUser.id,
    });
    return new BookResponse(entity);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject an in-review book with a required reason' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: RejectBookRequestDto })
  @ApiResponse({ status: 200, type: BookResponse })
  async rejectBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RejectBookRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<BookResponse> {
    const entity: BookEntity = await this.bookPublishingStatusService.rejectBook({
      bookId: id,
      actorUserId: currentUser.id,
      reason: body.reason,
    });
    return new BookResponse(entity);
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hide an approved book from the catalog without changing its status' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: BookResponse })
  async unpublishBook(
    @Param('id', ParseIntPipe) id: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<BookResponse> {
    const entity: BookEntity = await this.bookPublishingStatusService.unpublishBook({
      bookId: id,
      actorUserId: currentUser.id,
    });
    return new BookResponse(entity);
  }

  @Post(':id/republish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Return an approved unpublished book to the catalog without re-review' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: BookResponse })
  async republishBook(
    @Param('id', ParseIntPipe) id: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<BookResponse> {
    const entity: BookEntity = await this.bookPublishingStatusService.republishBook({
      bookId: id,
      actorUserId: currentUser.id,
    });
    return new BookResponse(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a book' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: BookResponse })
  async deleteBook(
    @Param('id', ParseIntPipe) id: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<BookResponse> {
    const entity: BookEntity = await this.bookService.deleteBook({
      bookId: id,
      actorUserId: currentUser.id,
    });
    return new BookResponse(entity);
  }
}
