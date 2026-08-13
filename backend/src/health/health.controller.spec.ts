import { Test, TestingModule } from '@nestjs/testing';

import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { HealthController } from './health.controller';
import { HEALTH_OK_STATUS, HealthService } from './health.service';

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: PrismaProviderService,
          useValue: {
            $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
          },
        },
      ],
    }).compile();
    healthController = moduleRef.get(HealthController);
  });

  describe('getLive', () => {
    it('returns the liveness payload', () => {
      const actualResult = healthController.getLive();
      expect(actualResult).toEqual({ status: HEALTH_OK_STATUS });
    });
  });

  describe('getReady', () => {
    it('returns the readiness payload', async () => {
      const actualResult = await healthController.getReady();
      expect(actualResult).toEqual({ status: HEALTH_OK_STATUS });
    });
  });
});
