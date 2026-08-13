import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

import { HealthService, type HealthCheckResult } from './health.service';

@Controller('health')
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
