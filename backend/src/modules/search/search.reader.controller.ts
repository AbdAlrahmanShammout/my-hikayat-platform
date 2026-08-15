import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookPage } from '@/modules/book/defs/book-repository.defs';
import { SearchCatalogBooksRequestDto } from '@/modules/search/dto/request/search-catalog-books-request.dto';
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
}
