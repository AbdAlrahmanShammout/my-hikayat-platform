import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from './health.controller';
import { HEALTH_OK_STATUS, HealthService } from './health.service';

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
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
