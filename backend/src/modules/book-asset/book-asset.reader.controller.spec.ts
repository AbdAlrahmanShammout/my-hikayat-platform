import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookAssetContentKeyService } from '@/modules/book-asset/book-asset-content-key.service';
import { BookAssetDeliveryService } from '@/modules/book-asset/book-asset-delivery.service';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { BookAssetReaderController } from './book-asset.reader.controller';

function createSampleReader(): UserEntity {
  return new UserEntity({
    id: 5,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'reader@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.READER,
    isPublisher: false,
  });
}

describe('BookAssetReaderController', () => {
  let bookAssetReaderController: BookAssetReaderController;
  let mockBookAssetDeliveryService: { createSourceDeliveryGrant: jest.Mock };
  let mockBookAssetContentKeyService: { createSourceContentKey: jest.Mock };

  beforeEach(async () => {
    mockBookAssetDeliveryService = { createSourceDeliveryGrant: jest.fn() };
    mockBookAssetContentKeyService = { createSourceContentKey: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [BookAssetReaderController],
      providers: [
        { provide: BookAssetDeliveryService, useValue: mockBookAssetDeliveryService },
        { provide: BookAssetContentKeyService, useValue: mockBookAssetContentKeyService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    bookAssetReaderController = moduleRef.get(BookAssetReaderController);
  });

  describe('createSourceDeliveryGrant', () => {
    it('maps the book id and principal onto the delivery service', async () => {
      const expiresAt = new Date('2026-08-15T16:05:00.000Z');
      mockBookAssetDeliveryService.createSourceDeliveryGrant.mockResolvedValue({
        bookId: 8,
        bookAssetId: 9,
        kind: BookAssetKind.SOURCE,
        url: 'memory://books%2F8%2Fsource%2Fuuid',
        expiresAt,
        contentType: 'application/epub+zip',
        byteSize: 16,
        checksumSha256: 'a'.repeat(64),
        isEncrypted: true,
      });
      const actualResponse = await bookAssetReaderController.createSourceDeliveryGrant(
        8,
        createSampleReader(),
      );
      expect(mockBookAssetDeliveryService.createSourceDeliveryGrant).toHaveBeenCalledWith({
        bookId: 8,
        userId: 5,
      });
      expect(actualResponse.url).toBe('memory://books%2F8%2Fsource%2Fuuid');
      expect(actualResponse.isEncrypted).toBe(true);
      expect(actualResponse).not.toHaveProperty('storageKey');
    });
  });

  describe('createSourceContentKey', () => {
    it('maps book id, session id, and principal onto the content-key service', async () => {
      const expiresAt = new Date('2026-08-15T16:05:00.000Z');
      mockBookAssetContentKeyService.createSourceContentKey.mockResolvedValue({
        bookId: 8,
        bookAssetId: 9,
        sessionId: 12,
        keyId: 'v1',
        algorithm: 'aes-256-gcm',
        keyDelivery: 'plain',
        key: Buffer.alloc(32, 1).toString('base64'),
        expiresAt,
      });
      const actualResponse = await bookAssetReaderController.createSourceContentKey(
        8,
        { sessionId: 12 },
        createSampleReader(),
      );
      expect(mockBookAssetContentKeyService.createSourceContentKey).toHaveBeenCalledWith({
        bookId: 8,
        userId: 5,
        sessionId: 12,
      });
      expect(actualResponse.keyDelivery).toBe('plain');
      expect(actualResponse.sessionId).toBe(12);
      expect(actualResponse.key).toBe(Buffer.alloc(32, 1).toString('base64'));
    });
  });
});
