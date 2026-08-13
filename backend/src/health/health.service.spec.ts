import { Test, TestingModule } from '@nestjs/testing';

import { DependencyFailureException } from '@/common/exceptions/dependency-failure.exception';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { HEALTH_OK_STATUS, HealthService } from './health.service';

describe('HealthService', () => {
  let healthService: HealthService;
  let mockPrismaProviderService: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    mockPrismaProviderService = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaProviderService, useValue: mockPrismaProviderService },
      ],
    }).compile();
    healthService = moduleRef.get(HealthService);
  });

  describe('getLiveness', () => {
    it('returns ok without performing I/O', () => {
      const actualResult = healthService.getLiveness();
      expect(actualResult).toEqual({ status: HEALTH_OK_STATUS });
      expect(mockPrismaProviderService.$queryRaw).not.toHaveBeenCalled();
    });
  });

  describe('getReadiness', () => {
    it('returns ok when the database round trip succeeds', async () => {
      const actualResult = await healthService.getReadiness();
      expect(actualResult).toEqual({ status: HEALTH_OK_STATUS });
      expect(mockPrismaProviderService.$queryRaw).toHaveBeenCalled();
    });

    it('throws DependencyFailureException when the database round trip fails', async () => {
      mockPrismaProviderService.$queryRaw.mockRejectedValue(new Error('connect ECONNREFUSED'));
      await expect(healthService.getReadiness()).rejects.toBeInstanceOf(DependencyFailureException);
    });
  });
});
