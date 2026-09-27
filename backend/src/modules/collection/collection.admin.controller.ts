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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { sourceFileMemoryStorage } from '@/modules/book-asset/source-file-memory-storage';
import { CollectionCoverService } from '@/modules/collection/collection-cover.service';
import { CollectionService } from '@/modules/collection/collection.service';
import { COLLECTION_COVER_UPLOAD } from '@/modules/collection/consts/collection-cover-upload.constant';
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

type UploadedCollectionCoverFile = {
  readonly buffer: Buffer;
  readonly mimetype: string;
  readonly originalname: string;
};

@ApiTags('Admin - Collections')
@Controller('admin/collections')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class CollectionAdminController {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly collectionCoverService: CollectionCoverService,
  ) {}

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
      description: body.description,
      bookIds: body.bookIds,
      actorUserId: currentUser.id,
    });
    return this.collectionCoverService.toCollectionResponse(entity);
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
    const collections: CollectionResponse[] =
      await this.collectionCoverService.toCollectionResponses(page.entities);
    return new GetCollectionsResponseDto(collections, page.total);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an editorial collection' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: CollectionResponse })
  async getCollection(@Param('id', ParseIntPipe) id: number): Promise<CollectionResponse> {
    const entity: CollectionEntity = await this.collectionService.getCollectionById(id);
    return this.collectionCoverService.toCollectionResponse(entity);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an editorial collection title or description' })
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
      description: body.description,
      actorUserId: currentUser.id,
    });
    return this.collectionCoverService.toCollectionResponse(entity);
  }

  @Post(':id/cover')
  @UseInterceptors(
    FileInterceptor(COLLECTION_COVER_UPLOAD.fieldName, {
      storage: sourceFileMemoryStorage,
      limits: { fileSize: COLLECTION_COVER_UPLOAD.maxBytes },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a JPEG, PNG, or WebP cover image for a collection' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      required: [COLLECTION_COVER_UPLOAD.fieldName],
      properties: {
        [COLLECTION_COVER_UPLOAD.fieldName]: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: CollectionResponse })
  async uploadCollectionCover(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: UploadedCollectionCoverFile | undefined,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<CollectionResponse> {
    const entity: CollectionEntity = await this.collectionCoverService.uploadCover({
      collectionId: id,
      actorUserId: currentUser.id,
      body: file?.buffer ?? Buffer.alloc(0),
      contentType: file?.mimetype ?? '',
      originalFileName: file?.originalname,
    });
    return this.collectionCoverService.toCollectionResponse(entity);
  }

  @Delete(':id/cover')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a collection cover image' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: CollectionResponse })
  async clearCollectionCover(
    @Param('id', ParseIntPipe) id: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<CollectionResponse> {
    const entity: CollectionEntity = await this.collectionCoverService.clearCover({
      collectionId: id,
      actorUserId: currentUser.id,
    });
    return this.collectionCoverService.toCollectionResponse(entity);
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
    return this.collectionCoverService.toCollectionResponse(entity);
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
    return this.collectionCoverService.toCollectionResponse(entity);
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
    return this.collectionCoverService.toCollectionResponse(entity);
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
    return this.collectionCoverService.toCollectionResponse(entity);
  }
}
