import {
  Body,
  Controller,
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
import { BookService } from '@/modules/book/book.service';
import { BookPage } from '@/modules/book/defs/book-repository.defs';
import { CreateBookRequestDto } from '@/modules/book/dto/request/create-book-request.dto';
import { ListBooksRequestDto } from '@/modules/book/dto/request/list-books-request.dto';
import { UpdateBookRequestDto } from '@/modules/book/dto/request/update-book-request.dto';
import { GetBooksResponseDto } from '@/modules/book/dto/response/get-books-response.dto';
import { BookResponse } from '@/modules/book/dto/response/model/book.response';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookProcessingOrchestrationService } from '@/modules/book-processing/book-processing-orchestration.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Author - Books')
@Controller('author/books')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.AUTHOR, UserRole.ADMIN)
@ApiBearerAuth()
export class BookAuthorController {
  constructor(
    private readonly bookService: BookService,
    private readonly bookProcessingOrchestrationService: BookProcessingOrchestrationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a book owned by the authenticated publisher' })
  @ApiBody({ type: CreateBookRequestDto })
  @ApiResponse({ status: 201, type: BookResponse })
  async createBook(
    @Body() dto: CreateBookRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<BookResponse> {
    const entity: BookEntity = await this.bookService.createBook({
      title: dto.title,
      description: dto.description,
      bookType: dto.bookType,
      ownerId: currentUser.id,
      categoryIds: dto.categoryIds,
    });
    return new BookResponse(entity);
  }

  @Get()
  @ApiOperation({ summary: 'List books owned by the authenticated publisher' })
  @ApiResponse({ status: 200, type: GetBooksResponseDto })
  async listOwnedBooks(
    @Query() query: ListBooksRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<GetBooksResponseDto> {
    const page: BookPage = await this.bookService.listBooks({
      limit: query.limit,
      offset: query.offset,
      ownerId: currentUser.id,
    });
    return new GetBooksResponseDto(page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book owned by the authenticated publisher' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: BookResponse })
  async getOwnedBook(
    @Param('id', ParseIntPipe) id: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<BookResponse> {
    const entity: BookEntity = await this.bookService.getManagedBook({
      bookId: id,
      actorId: currentUser.id,
      actorRole: currentUser.role,
    });
    return new BookResponse(entity);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update metadata for a book owned by the authenticated publisher' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateBookRequestDto })
  @ApiResponse({ status: 200, type: BookResponse })
  async updateOwnedBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<BookResponse> {
    await this.bookService.getManagedBook({
      bookId: id,
      actorId: currentUser.id,
      actorRole: currentUser.role,
    });
    const entity: BookEntity = await this.bookService.updateBook({
      id,
      title: dto.title,
      description: dto.description,
      bookType: dto.bookType,
      categoryIds: dto.categoryIds,
    });
    return new BookResponse(entity);
  }

  @Post(':bookId/submit-for-review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process the book source if needed and submit it for editorial review' })
  @ApiParam({ name: 'bookId', type: Number })
  @ApiResponse({ status: 200, type: BookResponse })
  async submitForReview(
    @Param('bookId', ParseIntPipe) bookId: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<BookResponse> {
    const entity: BookEntity = await this.bookProcessingOrchestrationService.submitForReview({
      bookId,
      actorId: currentUser.id,
      actorRole: currentUser.role,
    });
    return new BookResponse(entity);
  }
}
