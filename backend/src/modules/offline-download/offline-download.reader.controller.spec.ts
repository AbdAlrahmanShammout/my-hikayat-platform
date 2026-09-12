import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { OfflineDownloadEntity } from '@/modules/offline-download/entity/offline-download.entity';
import { OfflineDownloadService } from '@/modules/offline-download/offline-download.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { OfflineDownloadReaderController } from './offline-download.reader.controller';

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

describe('OfflineDownloadReaderController', () => {
  let offlineDownloadReaderController: OfflineDownloadReaderController;
  let mockOfflineDownloadService: {
    registerOfflineDownload: jest.Mock;
    releaseOfflineDownload: jest.Mock;
  };

  beforeEach(async () => {
    mockOfflineDownloadService = {
      registerOfflineDownload: jest.fn(),
      releaseOfflineDownload: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [OfflineDownloadReaderController],
      providers: [
        { provide: OfflineDownloadService, useValue: mockOfflineDownloadService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    offlineDownloadReaderController = moduleRef.get(OfflineDownloadReaderController);
  });

  describe('registerOfflineDownload', () => {
    it('maps book id and principal onto the service', async () => {
      mockOfflineDownloadService.registerOfflineDownload.mockResolvedValue(
        new OfflineDownloadEntity({
          id: 4,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          userId: 5,
          bookId: 8,
        }),
      );
      const actualResponse = await offlineDownloadReaderController.registerOfflineDownload(
        8,
        createSampleReader(),
      );
      expect(mockOfflineDownloadService.registerOfflineDownload).toHaveBeenCalledWith({
        bookId: 8,
        userId: 5,
      });
      expect(actualResponse.bookId).toBe(8);
    });
  });

  describe('releaseOfflineDownload', () => {
    it('maps book id and principal onto the service', async () => {
      mockOfflineDownloadService.releaseOfflineDownload.mockResolvedValue(undefined);
      await offlineDownloadReaderController.releaseOfflineDownload(8, createSampleReader());
      expect(mockOfflineDownloadService.releaseOfflineDownload).toHaveBeenCalledWith({
        bookId: 8,
        userId: 5,
      });
    });
  });
});
