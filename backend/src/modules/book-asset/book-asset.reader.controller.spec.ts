import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
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
    role: UserRole.USER,
    isPublisher: false,
  });
}

describe('BookAssetReaderController', () => {
  let bookAssetReaderController: BookAssetReaderController;
  let mockBookAssetDeliveryService: { createSourceDeliveryGrant: jest.Mock };

  beforeEach(async () => {
    mockBookAssetDeliveryService = { createSourceDeliveryGrant: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [BookAssetReaderController],
      providers: [
        { provide: BookAssetDeliveryService, useValue: mockBookAssetDeliveryService },
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
});
