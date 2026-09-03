import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookResponse } from '@/modules/book/dto/response/model/book.response';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookCatalogCoverService } from '@/modules/book-asset/book-catalog-cover.service';
import { CollectionDiscoveryService } from '@/modules/collection/collection-discovery.service';
import {
  CollectionDiscovery,
  CollectionDiscoveryPage,
} from '@/modules/collection/defs/collection-discovery.defs';
import { ListCollectionsRequestDto } from '@/modules/collection/dto/request/list-collections-request.dto';
import { GetDiscoveryCollectionsResponseDto } from '@/modules/collection/dto/response/get-discovery-collections-response.dto';
import { CollectionDiscoveryResponse } from '@/modules/collection/dto/response/model/collection-discovery.response';

@ApiTags('Reader - Collections')
@Controller('reader/collections')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CollectionReaderController {
  constructor(
    private readonly collectionDiscoveryService: CollectionDiscoveryService,
    private readonly bookCatalogCoverService: BookCatalogCoverService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Browse curated collections with published books in editorial order' })
  @ApiResponse({ status: 200, type: GetDiscoveryCollectionsResponseDto })
  async listDiscoveryCollections(
    @Query() query: ListCollectionsRequestDto,
  ): Promise<GetDiscoveryCollectionsResponseDto> {
    const page: CollectionDiscoveryPage =
      await this.collectionDiscoveryService.listDiscoveryCollections({
        limit: query.limit,
        offset: query.offset,
      });
    const collections: CollectionDiscoveryResponse[] = await this.toDiscoveryResponses(
      page.entities,
    );
    return new GetDiscoveryCollectionsResponseDto(collections, page.total);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Open a curated collection and view its published books' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: CollectionDiscoveryResponse })
  async getDiscoveryCollection(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CollectionDiscoveryResponse> {
    const discovery: CollectionDiscovery =
      await this.collectionDiscoveryService.getDiscoveryCollectionById(id);
    const [response] = await this.toDiscoveryResponses([discovery]);
    return response;
  }

  private async toDiscoveryResponses(
    discoveries: readonly CollectionDiscovery[],
  ): Promise<CollectionDiscoveryResponse[]> {
    const allBooks: BookEntity[] = discoveries.flatMap((discovery) => discovery.books);
    const bookResponses: BookResponse[] =
      await this.bookCatalogCoverService.toBookResponses(allBooks);
    const responseByBookId = new Map<number, BookResponse>(
      bookResponses.map((book) => [book.id, book]),
    );
    return discoveries.map((discovery) => {
      const books: BookResponse[] = discovery.books.map((book) => {
        const response: BookResponse | undefined = responseByBookId.get(book.id);
        return response ?? new BookResponse(book, null);
      });
      return new CollectionDiscoveryResponse(discovery, books);
    });
  }
}
