import { HEALTH_OK_STATUS, HealthService } from './health.service';

describe('HealthService', () => {
  describe('getLiveness', () => {
    it('returns ok without performing I/O', () => {
      const healthService: HealthService = new HealthService();
      const actualResult = healthService.getLiveness();
      expect(actualResult).toEqual({ status: HEALTH_OK_STATUS });
    });
  });

  describe('getReadiness', () => {
    it('returns ok when no required dependencies are registered', async () => {
      const healthService: HealthService = new HealthService();
      const actualResult = await healthService.getReadiness();
      expect(actualResult).toEqual({ status: HEALTH_OK_STATUS });
    });
  });
});
