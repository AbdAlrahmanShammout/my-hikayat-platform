import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookPage } from '@/modules/book/defs/book-repository.defs';
import { InBookSearchPage } from '@/modules/search/defs/search-service.defs';
import { SearchCatalogBooksRequestDto } from '@/modules/search/dto/request/search-catalog-books-request.dto';
import { SearchInBookRequestDto } from '@/modules/search/dto/request/search-in-book-request.dto';
import { GetInBookSearchResponseDto } from '@/modules/search/dto/response/get-in-book-search-response.dto';
import { GetSearchBooksResponseDto } from '@/modules/search/dto/response/get-search-books-response.dto';
import { SearchService } from '@/modules/search/search.service';

@ApiTags('Reader - Search')
@Controller('reader/search')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SearchReaderController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search published catalog books by title, author, or publisher' })
  @ApiResponse({ status: 200, type: GetSearchBooksResponseDto })
  async searchCatalogBooks(
    @Query() query: SearchCatalogBooksRequestDto,
  ): Promise<GetSearchBooksResponseDto> {
    const page: BookPage = await this.searchService.searchCatalogBooks({
      limit: query.limit,
      offset: query.offset,
      title: query.title,
      author: query.author,
      publisher: query.publisher,
    });
    return new GetSearchBooksResponseDto(page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Search published book text for reflowable and fixed-layout hits' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: GetInBookSearchResponseDto })
  async searchInBook(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: SearchInBookRequestDto,
  ): Promise<GetInBookSearchResponseDto> {
    const page: InBookSearchPage = await this.searchService.searchInBook({
      bookId: id,
      query: query.q,
      limit: query.limit,
      offset: query.offset,
    });
    return new GetInBookSearchResponseDto(page);
  }
}
