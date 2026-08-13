import { Injectable } from '@nestjs/common';

import { DependencyFailureException } from '@/common/exceptions/dependency-failure.exception';
import { HEALTH_READINESS_TIMEOUT_MS } from '@/health/health.constant';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

export const HEALTH_OK_STATUS = 'ok' as const;

export type HealthCheckResult = {
  readonly status: typeof HEALTH_OK_STATUS;
};

@Injectable()
export class HealthService {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  getLiveness(): HealthCheckResult {
    return { status: HEALTH_OK_STATUS };
  }

  async getReadiness(): Promise<HealthCheckResult> {
    try {
      await this.executeWithTimeout(
        this.prismaProviderService.$queryRaw`SELECT 1`,
        HEALTH_READINESS_TIMEOUT_MS,
      );
    } catch {
      throw new DependencyFailureException({
        message: 'Service is not ready',
        userFriendly: true,
      });
    }
    return { status: HEALTH_OK_STATUS };
  }

  private async executeWithTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise: Promise<never> = new Promise((_resolve, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Health check timed out'));
      }, timeoutMs);
    });
    try {
      return await Promise.race([operation, timeoutPromise]);
    } finally {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }
  }
}
