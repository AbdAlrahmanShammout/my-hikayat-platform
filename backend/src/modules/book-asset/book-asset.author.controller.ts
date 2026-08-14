import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
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
import { BookAssetCatalogMediaService } from '@/modules/book-asset/book-asset-catalog-media.service';
import { BookAssetSourceService } from '@/modules/book-asset/book-asset-source.service';
import { UploadedSourceFile } from '@/modules/book-asset/defs/book-asset-service.defs';
import { BookAssetResponse } from '@/modules/book-asset/dto/response/model/book-asset.response';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { PREVIEW_IMAGE_UPLOAD } from '@/modules/book-asset/preview-image-upload.constant';
import { PROMO_VIDEO_UPLOAD } from '@/modules/book-asset/promo-video-upload.constant';
import { sourceFileMemoryStorage } from '@/modules/book-asset/source-file-memory-storage';
import { SOURCE_FILE_UPLOAD } from '@/modules/book-asset/source-file-upload.constant';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Author - Books')
@Controller('author/books')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.AUTHOR, UserRole.ADMIN)
@ApiBearerAuth()
export class BookAssetAuthorController {
  constructor(
    private readonly bookAssetSourceService: BookAssetSourceService,
    private readonly bookAssetCatalogMediaService: BookAssetCatalogMediaService,
  ) {}

  @Post(':bookId/source')
  @UseInterceptors(
    FileInterceptor(SOURCE_FILE_UPLOAD.fieldName, {
      storage: sourceFileMemoryStorage,
      limits: { fileSize: SOURCE_FILE_UPLOAD.maxBytes },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an encrypted EPUB or PDF source file for a book' })
  @ApiParam({ name: 'bookId', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      required: [SOURCE_FILE_UPLOAD.fieldName],
      properties: {
        [SOURCE_FILE_UPLOAD.fieldName]: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: BookAssetResponse })
  async uploadSourceFile(
    @Param('bookId', ParseIntPipe) bookId: number,
    @UploadedFile() file: UploadedSourceFile | undefined,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<BookAssetResponse> {
    const entity: BookAssetEntity = await this.bookAssetSourceService.uploadSourceFile({
      bookId,
      actorId: currentUser.id,
      actorRole: currentUser.role,
      body: file?.buffer ?? Buffer.alloc(0),
      contentType: file?.mimetype ?? '',
      originalFileName: file?.originalname,
    });
    return new BookAssetResponse(entity);
  }

  @Post(':bookId/preview-image')
  @UseInterceptors(
    FileInterceptor(PREVIEW_IMAGE_UPLOAD.fieldName, {
      storage: sourceFileMemoryStorage,
      limits: { fileSize: PREVIEW_IMAGE_UPLOAD.maxBytes },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a JPEG, PNG, or WebP preview image for a book' })
  @ApiParam({ name: 'bookId', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      required: [PREVIEW_IMAGE_UPLOAD.fieldName],
      properties: {
        [PREVIEW_IMAGE_UPLOAD.fieldName]: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: BookAssetResponse })
  async uploadPreviewImage(
    @Param('bookId', ParseIntPipe) bookId: number,
    @UploadedFile() file: UploadedSourceFile | undefined,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<BookAssetResponse> {
    const entity: BookAssetEntity = await this.bookAssetCatalogMediaService.uploadPreviewImage({
      bookId,
      actorId: currentUser.id,
      actorRole: currentUser.role,
      body: file?.buffer ?? Buffer.alloc(0),
      contentType: file?.mimetype ?? '',
      originalFileName: file?.originalname,
    });
    return new BookAssetResponse(entity);
  }

  @Post(':bookId/promo-video')
  @UseInterceptors(
    FileInterceptor(PROMO_VIDEO_UPLOAD.fieldName, {
      storage: sourceFileMemoryStorage,
      limits: { fileSize: PROMO_VIDEO_UPLOAD.maxBytes },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an optional MP4 or WebM promo video for a book' })
  @ApiParam({ name: 'bookId', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      required: [PROMO_VIDEO_UPLOAD.fieldName],
      properties: {
        [PROMO_VIDEO_UPLOAD.fieldName]: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: BookAssetResponse })
  async uploadPromoVideo(
    @Param('bookId', ParseIntPipe) bookId: number,
    @UploadedFile() file: UploadedSourceFile | undefined,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<BookAssetResponse> {
    const entity: BookAssetEntity = await this.bookAssetCatalogMediaService.uploadPromoVideo({
      bookId,
      actorId: currentUser.id,
      actorRole: currentUser.role,
      body: file?.buffer ?? Buffer.alloc(0),
      contentType: file?.mimetype ?? '',
      originalFileName: file?.originalname,
    });
    return new BookAssetResponse(entity);
  }
}
