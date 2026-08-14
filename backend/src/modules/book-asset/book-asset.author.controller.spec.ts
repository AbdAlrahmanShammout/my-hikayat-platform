import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookAssetCatalogMediaService } from '@/modules/book-asset/book-asset-catalog-media.service';
import { BookAssetSourceService } from '@/modules/book-asset/book-asset-source.service';
import { UploadedSourceFile } from '@/modules/book-asset/defs/book-asset-service.defs';
import { BookAssetEntity } from '@/modules/book-asset/entity/book-asset.entity';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { BookAssetAuthorController } from './book-asset.author.controller';

function createSampleAuthor(): UserEntity {
  return new UserEntity({
    id: 4,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'author@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.AUTHOR,
    isPublisher: true,
  });
}

function createSampleAsset(): BookAssetEntity {
  return new BookAssetEntity({
    id: 9,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    bookId: 8,
    kind: BookAssetKind.SOURCE,
    storageKey: 'books/8/source/uuid',
    contentType: 'application/pdf',
    byteSize: 16,
    checksumSha256: 'a'.repeat(64),
    originalFileName: 'book.pdf',
    sortOrder: 0,
    isEncrypted: true,
  });
}

describe('BookAssetAuthorController', () => {
  let bookAssetAuthorController: BookAssetAuthorController;
  let mockBookAssetSourceService: { uploadSourceFile: jest.Mock };
  let mockBookAssetCatalogMediaService: {
    uploadPreviewImage: jest.Mock;
    uploadPromoVideo: jest.Mock;
  };

  beforeEach(async () => {
    mockBookAssetSourceService = { uploadSourceFile: jest.fn() };
    mockBookAssetCatalogMediaService = {
      uploadPreviewImage: jest.fn(),
      uploadPromoVideo: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [BookAssetAuthorController],
      providers: [
        { provide: BookAssetSourceService, useValue: mockBookAssetSourceService },
        { provide: BookAssetCatalogMediaService, useValue: mockBookAssetCatalogMediaService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    bookAssetAuthorController = moduleRef.get(BookAssetAuthorController);
  });

  describe('uploadSourceFile', () => {
    it('maps the uploaded file and principal into the source service', async () => {
      const currentUser: UserEntity = createSampleAuthor();
      const expectedAsset = createSampleAsset();
      const inputBuffer = Buffer.from('%PDF-1.4');
      mockBookAssetSourceService.uploadSourceFile.mockResolvedValue(expectedAsset);
      const actualResponse = await bookAssetAuthorController.uploadSourceFile(
        8,
        {
          buffer: inputBuffer,
          mimetype: 'application/pdf',
          originalname: 'book.pdf',
        } satisfies UploadedSourceFile,
        currentUser,
      );
      expect(mockBookAssetSourceService.uploadSourceFile).toHaveBeenCalledWith({
        bookId: 8,
        actorId: 4,
        actorRole: UserRole.AUTHOR,
        body: inputBuffer,
        contentType: 'application/pdf',
        originalFileName: 'book.pdf',
      });
      expect(actualResponse.kind).toBe(BookAssetKind.SOURCE);
      expect(actualResponse.storageKey).toBe('books/8/source/uuid');
      expect(actualResponse.isEncrypted).toBe(true);
    });

    it('passes an empty buffer when the multipart file is missing', async () => {
      mockBookAssetSourceService.uploadSourceFile.mockResolvedValue(createSampleAsset());
      await bookAssetAuthorController.uploadSourceFile(8, undefined, createSampleAuthor());
      expect(mockBookAssetSourceService.uploadSourceFile).toHaveBeenCalledWith(
        expect.objectContaining({
          body: Buffer.alloc(0),
          contentType: '',
        }),
      );
    });
  });

  describe('uploadPreviewImage', () => {
    it('maps the uploaded image and principal into the catalog media service', async () => {
      const inputBuffer = Buffer.from('jpeg-bytes');
      const expectedAsset = new BookAssetEntity({
        ...createSampleAsset(),
        kind: BookAssetKind.PREVIEW_IMAGE,
        storageKey: 'books/8/preview/uuid',
        contentType: 'image/jpeg',
        originalFileName: 'cover.jpg',
        isEncrypted: false,
      });
      mockBookAssetCatalogMediaService.uploadPreviewImage.mockResolvedValue(expectedAsset);
      const actualResponse = await bookAssetAuthorController.uploadPreviewImage(
        8,
        {
          buffer: inputBuffer,
          mimetype: 'image/jpeg',
          originalname: 'cover.jpg',
        } satisfies UploadedSourceFile,
        createSampleAuthor(),
      );
      expect(mockBookAssetCatalogMediaService.uploadPreviewImage).toHaveBeenCalledWith({
        bookId: 8,
        actorId: 4,
        actorRole: UserRole.AUTHOR,
        body: inputBuffer,
        contentType: 'image/jpeg',
        originalFileName: 'cover.jpg',
      });
      expect(actualResponse.kind).toBe(BookAssetKind.PREVIEW_IMAGE);
      expect(actualResponse.isEncrypted).toBe(false);
    });
  });

  describe('uploadPromoVideo', () => {
    it('maps the uploaded video and principal into the catalog media service', async () => {
      const inputBuffer = Buffer.from('mp4-bytes');
      const expectedAsset = new BookAssetEntity({
        ...createSampleAsset(),
        kind: BookAssetKind.PROMO_VIDEO,
        storageKey: 'books/8/promo/uuid',
        contentType: 'video/mp4',
        originalFileName: 'trailer.mp4',
        isEncrypted: false,
      });
      mockBookAssetCatalogMediaService.uploadPromoVideo.mockResolvedValue(expectedAsset);
      const actualResponse = await bookAssetAuthorController.uploadPromoVideo(
        8,
        {
          buffer: inputBuffer,
          mimetype: 'video/mp4',
          originalname: 'trailer.mp4',
        } satisfies UploadedSourceFile,
        createSampleAuthor(),
      );
      expect(mockBookAssetCatalogMediaService.uploadPromoVideo).toHaveBeenCalledWith({
        bookId: 8,
        actorId: 4,
        actorRole: UserRole.AUTHOR,
        body: inputBuffer,
        contentType: 'video/mp4',
        originalFileName: 'trailer.mp4',
      });
      expect(actualResponse.kind).toBe(BookAssetKind.PROMO_VIDEO);
      expect(actualResponse.isEncrypted).toBe(false);
    });
  });
});
