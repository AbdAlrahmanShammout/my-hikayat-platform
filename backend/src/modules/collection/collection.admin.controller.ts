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
import { CollectionService } from '@/modules/collection/collection.service';
import { CollectionPage } from '@/modules/collection/defs/collection-repository.defs';
import { AddCollectionBookRequestDto } from '@/modules/collection/dto/request/add-collection-book-request.dto';
import { CreateCollectionRequestDto } from '@/modules/collection/dto/request/create-collection-request.dto';
import { ListCollectionsRequestDto } from '@/modules/collection/dto/request/list-collections-request.dto';
import { ReorderCollectionBooksRequestDto } from '@/modules/collection/dto/request/reorder-collection-books-request.dto';
import { UpdateCollectionRequestDto } from '@/modules/collection/dto/request/update-collection-request.dto';
import { GetCollectionsResponseDto } from '@/modules/collection/dto/response/get-collections-response.dto';
import { CollectionResponse } from '@/modules/collection/dto/response/model/collection.response';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Admin - Collections')
@Controller('admin/collections')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class CollectionAdminController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  @ApiOperation({ summary: 'Create an editorial collection with an optional ordered book list' })
  @ApiBody({ type: CreateCollectionRequestDto })
  @ApiResponse({ status: 201, type: CollectionResponse })
  async createCollection(
    @Body() body: CreateCollectionRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<CollectionResponse> {
    const entity: CollectionEntity = await this.collectionService.createCollection({
      title: body.title,
      bookIds: body.bookIds,
      actorUserId: currentUser.id,
    });
    return new CollectionResponse(entity);
  }

  @Get()
  @ApiOperation({ summary: 'List editorial collections' })
  @ApiResponse({ status: 200, type: GetCollectionsResponseDto })
  async listCollections(
    @Query() query: ListCollectionsRequestDto,
  ): Promise<GetCollectionsResponseDto> {
    const page: CollectionPage = await this.collectionService.listCollections({
      limit: query.limit,
      offset: query.offset,
    });
    return new GetCollectionsResponseDto(page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an editorial collection' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: CollectionResponse })
  async getCollection(@Param('id', ParseIntPipe) id: number): Promise<CollectionResponse> {
    const entity: CollectionEntity = await this.collectionService.getCollectionById(id);
    return new CollectionResponse(entity);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an editorial collection title' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateCollectionRequestDto })
  @ApiResponse({ status: 200, type: CollectionResponse })
  async updateCollection(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCollectionRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<CollectionResponse> {
    const entity: CollectionEntity = await this.collectionService.updateCollection({
      id,
      title: body.title,
      actorUserId: currentUser.id,
    });
    return new CollectionResponse(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete an editorial collection' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: CollectionResponse })
  async deleteCollection(
    @Param('id', ParseIntPipe) id: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<CollectionResponse> {
    const entity: CollectionEntity = await this.collectionService.deleteCollection({
      id,
      actorUserId: currentUser.id,
    });
    return new CollectionResponse(entity);
  }

  @Post(':id/books')
  @ApiOperation({ summary: 'Append a book to an editorial collection' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: AddCollectionBookRequestDto })
  @ApiResponse({ status: 201, type: CollectionResponse })
  async addCollectionBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AddCollectionBookRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<CollectionResponse> {
    const entity: CollectionEntity = await this.collectionService.addCollectionBook({
      collectionId: id,
      bookId: body.bookId,
      actorUserId: currentUser.id,
    });
    return new CollectionResponse(entity);
  }

  @Delete(':id/books/:bookId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a book from an editorial collection' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'bookId', type: Number })
  @ApiResponse({ status: 200, type: CollectionResponse })
  async removeCollectionBook(
    @Param('id', ParseIntPipe) id: number,
    @Param('bookId', ParseIntPipe) bookId: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<CollectionResponse> {
    const entity: CollectionEntity = await this.collectionService.removeCollectionBook({
      collectionId: id,
      bookId,
      actorUserId: currentUser.id,
    });
    return new CollectionResponse(entity);
  }

  @Post(':id/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reorder books in an editorial collection' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: ReorderCollectionBooksRequestDto })
  @ApiResponse({ status: 200, type: CollectionResponse })
  async reorderCollectionBooks(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ReorderCollectionBooksRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<CollectionResponse> {
    const entity: CollectionEntity = await this.collectionService.reorderCollectionBooks({
      collectionId: id,
      bookIds: body.bookIds,
      actorUserId: currentUser.id,
    });
    return new CollectionResponse(entity);
  }
}
