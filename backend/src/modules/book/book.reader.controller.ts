import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookService } from '@/modules/book/book.service';
import { BookPage } from '@/modules/book/defs/book-repository.defs';
import { ListCatalogBooksRequestDto } from '@/modules/book/dto/request/list-catalog-books-request.dto';
import { GetBooksResponseDto } from '@/modules/book/dto/response/get-books-response.dto';
import { BookResponse } from '@/modules/book/dto/response/model/book.response';
import { BookEntity } from '@/modules/book/entity/book.entity';

@ApiTags('Reader - Catalog')
@Controller('reader/catalog')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookReaderController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  @ApiOperation({ summary: 'List published catalog books by category, newest, or popularity' })
  @ApiResponse({ status: 200, type: GetBooksResponseDto })
  async listCatalogBooks(@Query() query: ListCatalogBooksRequestDto): Promise<GetBooksResponseDto> {
    const page: BookPage = await this.bookService.listCatalogBooks({
      limit: query.limit,
      offset: query.offset,
      categoryId: query.categoryId,
      sort: query.sort,
    });
    return new GetBooksResponseDto(page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Load a published catalog book' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: BookResponse })
  async getCatalogBook(@Param('id', ParseIntPipe) id: number): Promise<BookResponse> {
    const entity: BookEntity = await this.bookService.getCatalogBookById(id);
    return new BookResponse(entity);
  }
}
