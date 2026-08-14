import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
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

  beforeEach(async () => {
    mockBookAssetSourceService = { uploadSourceFile: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [BookAssetAuthorController],
      providers: [
        { provide: BookAssetSourceService, useValue: mockBookAssetSourceService },
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
});
