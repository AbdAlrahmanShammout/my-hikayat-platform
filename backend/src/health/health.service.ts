import { Injectable } from '@nestjs/common';

export const HEALTH_OK_STATUS = 'ok' as const;

export type HealthCheckResult = {
  readonly status: typeof HEALTH_OK_STATUS;
};

/**
 * Liveness and readiness checks. Liveness never performs I/O. Readiness will
 * probe required dependencies (database) once those providers exist.
 */
@Injectable()
export class HealthService {
  getLiveness(): HealthCheckResult {
    return { status: HEALTH_OK_STATUS };
  }

  getReadiness(): Promise<HealthCheckResult> {
    return Promise.resolve({ status: HEALTH_OK_STATUS });
  }
}
