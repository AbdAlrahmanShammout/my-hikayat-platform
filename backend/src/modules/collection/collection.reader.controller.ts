import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
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
  constructor(private readonly collectionDiscoveryService: CollectionDiscoveryService) {}

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
    return new GetDiscoveryCollectionsResponseDto(page);
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
    return new CollectionDiscoveryResponse(discovery);
  }
}
