import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

import { SKIP_ALL_NAMED_THROTTLERS } from '@/common/constants/http-surface.constant';

import { HealthService, type HealthCheckResult } from './health.service';

@Controller('health')
@SkipThrottle(SKIP_ALL_NAMED_THROTTLERS)
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  @HttpCode(HttpStatus.OK)
  getLive(): HealthCheckResult {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  async getReady(): Promise<HealthCheckResult> {
    return this.healthService.getReadiness();
  }
}
